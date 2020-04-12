<template>
  <v-container>

    <h1 class="text-center">Šablony procesů</h1>

    <PTFilter :value="processTemplates">
      <template #default="{data}">
        <PTList
          :processTemplates="data"
          :menuItems="processMenuItems"
          @action="processTemplateActionSwitch"
        >

          <template #append-item="{processTemplate}">
            <v-btn color="info" @click="goToPT(processTemplate)">
              <v-icon>mdi-information-outline</v-icon>
              Zobrazit
            </v-btn>
          </template>

          <template #extend-process="{processTemplate}">
            <v-container  v-if="processTemplate.isExecutable && processTemplate.nodeElements">
              <NTList
                :nodeTemplates="processTemplate.nodeElements"
                :menuItems="nodeMenuItems"
                @action="nodeTemplateActionSwitch({...$event, processTemplate})"
              >

                <template #append-item="{nodeTemplate}">
                  <v-tooltip bottom>
                    <template #activator="{on}">
                      <v-btn
                        fab
                        color="primary"
                        v-on="on"
                        @click="sureInitProcess({processTemplate, nodeTemplate})"
                        small
                      > <v-icon>mdi-play</v-icon> </v-btn>
                    </template>
                    <span>Spustit proces na udalosti {{nodeTemplate.name}}</span>
                  </v-tooltip>
                </template>

              </NTList>
            </v-container>
          </template>

        </PTList>
      </template>
    </PTFilter>

    <!-- Upload btm -->
    <v-tooltip left>
      <template #activator="{on}">
        <v-btn
          fab
          color="primary"
          v-on="on"
          fixed
          right
          bottom
          x-large
          @click="openUploadDialog()"
        > <v-icon x-large>mdi-plus</v-icon> </v-btn>
      </template>
      <span>Nahrát šablonu procesu.</span>
    </v-tooltip>

    <FullDialog v-model="fsDialog" :title="fsTitle" closeable>
      <v-container>
        <v-alert type="error" :value="!!msgError">
          {{msgError}}
        </v-alert>

        <PTUploader v-if="fsBody === 'upload'" :key="`dialog1-${fsBody}`"
          :loading="loading"
          @success="tryUploadProcess"
        ></PTUploader>

        <PTEditor v-else-if="selectedProcessTemplate && fsBody === 'update'"
          :key="`dialog2-${fsBody}-${selectedProcessTemplate.id}`"
          :loading="loading"
          @success="tryUpdateProcess({id: selectedProcessTemplate.id, ...$event})"
          :name="selectedProcessTemplate.name"
          :isExecutable="selectedProcessTemplate.isExecutable"
          :candidateManager="selectedProcessTemplate.candidateManager"
        ></PTEditor>

      </v-container>
    </FullDialog>

    <YesNoDialog v-model="ynDialog" :title="ynTitle"
      :loading="loading"
      @yes="ynActionYes" @no="ynActionNo"
    >
      <v-alert type="error" :value="!!msgError">
        {{msgError}}
      </v-alert>
    </YesNoDialog>

  </v-container>
</template>
<script>
import PTList from '../../components/bpmn/PT_List'
import PTFilter from '../../components/bpmn/PT_Filter'
import NTList from '../../components/bpmn/NT_List'
import YesNoDialog from '../../components/YesNoDialog'
import FullDialog from '../../components/FullDialog'
import PTUploader from '../../components/bpmn/PT_Uploader'
import PTEditor from '../../components/bpmn/PT_Editor'

import { simulateLoading } from '../../simulateLoading'

const gql = {
  client: require('../../graphql/auth/client.gql'),
  processTemplates: require('../../graphql/bpmn/processTemplates_NTStart.gql'),
  // Mutation
  uploadProcess: require('../../graphql/bpmn/uploadProcess.gql'),
  initProcess: require('../../graphql/bpmn/initProcess.gql'),
  deleteProcessTemplate: require('../../graphql/bpmn/deleteProcessTemplate.gql'),
  updateProcessTemplate: require('../../graphql/bpmn/updateProcessTemplate.gql'),
  // Supbscription
  newProcessTemplates: require('../../graphql/subscription/newProcessTemplates.gql'),
  changedProcessTemplates: require('../../graphql/subscription/changedProcessTemplates.gql'),
  deletedProcessTemplates: require('../../graphql/subscription/deletedProcessTemplates.gql'),
}

/** @typedef MenuItem
 *  @type { {icon:string, title:string, action:string} }
 */

export default {
  components: {
    PTList,
    PTFilter,
    NTList,
    YesNoDialog,
    FullDialog,
    PTUploader,
    PTEditor,
  },
  apollo: {
    processTemplates: {
      query: gql.processTemplates,
      subscribeToMore: [
        {
          document: gql.newProcessTemplates,
          updateQuery (previousResult, { subscriptionData }) {
            console.warn('P:', previousResult)
            console.warn('S', subscriptionData)
            if (!subscriptionData.data.newProcessTemplates) {
              return previousResult
            }
            return {
              processTemplates: [
                ...previousResult.processTemplates,
                ...subscriptionData.data.newProcessTemplates,
              ],
            }
          },
        },
        {
          document: gql.deletedProcessTemplates,
          updateQuery (previousResult, { subscriptionData }) {
            if (!subscriptionData.data.deletedProcessTemplates) {
              return previousResult
            }
            const ids = subscriptionData.data.deletedProcessTemplates.map(p => p.id)
            const pts = previousResult.processTemplates.filter(pt => !ids.includes(pt.id))
            return {
              processTemplates: [
                ...pts,
              ],
            }
          },
        },
        {
          document: gql.changedProcessTemplates,
          updateQuery (previousResult, { subscriptionData }) {
            if (!subscriptionData.data.changedProcessTemplates) {
              return previousResult
            }
            const changedPTs = subscriptionData.data.changedProcessTemplates
            const ids = changedPTs.map(p => p.id)

            const newPTs = previousResult.processTemplates.map(oldPT => {
              if (ids.includes(oldPT.id)) {
                const newPT = changedPTs.find(pt => pt.id === oldPT.id)
                return newPT
              }
              return oldPT
            })
            return {
              processTemplates: [
                ...newPTs,
              ],
            }
          },
        },
      ],
    },

  },
  data () {
    return {
      processTemplates: [],

      selectedProcessTemplate: null,

      loading: false,
      msgError: '',

      ynDialog: false,
      ynTitle: '???',
      ynActionYes: () => {},
      ynActionNo: () => {},

      fsDialog: false,
      fsTitle: '????',
      fsBody: '',

      /** @type MenuItem[] */
      nodeMenuItems: [
        {
          icon: 'mdi-play-circle-outline',
          title: 'Spustit zde',
          action: 'init',
        },
        {
          icon: 'mdi-lead-pencil',
          title: 'Upravit',
          action: 'update',
        },
      ],
      /** @type MenuItem[] */
      processMenuItems: [
        {
          icon: 'mdi-lead-pencil',
          title: 'Upravit',
          action: 'update',
        },
        {
          icon: 'mdi-delete-forever',
          title: 'Smazat',
          action: 'delete',
        },
      ],
    }
  },
  methods: {
    goToPT ({ id }) {
      this.$router.push({ path: `/pt/${id}` })
    },
    //= ================
    openYNDialog (ynTitle, ynActionYes, ynActionNo) {
      this.msgError = ''
      this.ynDialog = true
      ynTitle && (this.ynTitle = ynTitle)
      ynActionYes && (this.ynActionYes = ynActionYes)
      this.ynActionNo = ynActionNo || (() => { this.closeYNDialog() })
    },
    closeYNDialog () {
      this.msgError = ''
      this.ynDialog = false
    },
    openFSDialog (fsTitle, fsBody) {
      this.msgError = ''
      this.fsDialog = true
      fsTitle && (this.fsTitle = fsTitle)
      fsBody && (this.fsBody = fsBody)
    },
    closeFSDialog () {
      this.msgError = ''
      this.fsDialog = false
      this.fsBody = ''
    },

    openUploadDialog () {
      this.openFSDialog('Nahrát novou šablonu procesu', 'upload')
    },
    openUpdateDialog () {
      this.openFSDialog('Upravit šablonu procesu', 'update')
    },
    // =============

    processTemplateActionSwitch (action) {
      console.log(action.item.action, action)
      switch (action.item.action) {
        case 'update':
          this.selectedProcessTemplate = action.processTemplate
          this.openUpdateDialog()
          break
        case 'delete':
          this.sureDeleteProcess(action)
          break
      }
    },

    nodeTemplateActionSwitch (action) {
      console.log(action.item.action, action)
      switch (action.item.action) {
        case 'init':
          this.sureInitProcess(action)
          break
      }
    },

    // ======================
    async tryActionWrapper (asyncFn, args = []) {
      this.loading = true
      try {
        await asyncFn(...args)
      } catch (e) {
        this.msgError = (e.message) ? e.message : 'Něco se nepodařilo.'
        console.error(e)
      }
      this.loading = false
    },

    tryUploadProcess ({ bpmnText }) {
      return this.tryActionWrapper(async () => {
        await this.uploadProcess({ xml: bpmnText })
        this.closeFSDialog()
      })
    },
    tryUpdateProcess (processTemplate) {
      return this.tryActionWrapper(async () => {
        await this.updateProcess(processTemplate)
        this.closeFSDialog()
      })
    },

    // =========================

    sureInitProcess ({ processTemplate, nodeTemplate }) {
      this.openYNDialog(
        `Chcete spustit proces '${processTemplate.name}' na události '${nodeTemplate.name}'?`,
        () => {
          this.tryActionWrapper(async () => {
            await this.initProcess({
              idProcessTemplate: processTemplate.id,
              idNodeTemplate: nodeTemplate.id,
            })
            this.closeYNDialog()
          })
        },
      )
    },
    sureDeleteProcess ({ processTemplate }) {
      this.openYNDialog(
        `Chcete trvale smazat šablonu procesu '${processTemplate.name}' (${processTemplate.id})?`,
        () => {
          this.tryActionWrapper(async () => {
            await this.deleteProcess({ id: processTemplate.id })
            this.closeYNDialog()
          })
        },
      )
    },

    // Mutace

    async uploadProcess ({ xml }) {
      console.warn('TODO: uploadProcess')
      await simulateLoading()
      await this.$apollo.mutate({
        mutation: gql.uploadProcess,
        variables: {
          xml,
        },
      })
    },
    async initProcess ({ idProcessTemplate, idNodeTemplate }) {
      console.warn('TODO: initProcess')
      await simulateLoading()
      await this.$apollo.mutate({
        mutation: gql.initProcess,
        variables: {
          idProcessTemplate, idNodeTemplate,
        },
      })
    },
    async deleteProcess ({ id }) {
      console.warn('TODO: deleteProcessTemplate')
      await simulateLoading()
      await this.$apollo.mutate({
        mutation: gql.deleteProcessTemplate,
        variables: {
          idPT: id,
        },
      })
    },
    async updateProcess ({ id, name, isExecutable, candidateManager }) {
      console.warn('TODO: updateProcessTemplate')
      await simulateLoading()
      await this.$apollo.mutate({
        mutation: gql.updateProcessTemplate,
        variables: {
          idPT: id,
          name,
          isExecutable,
          candidateManager,
        },
      })
    },

  },
}
</script>
