<template>
  <v-container>
    <PTList
      :processTemplates="processTemplates"
      :menuItems="processMenuItems"
      @action="processTemplateActionSwitch"
    >
      <template #extend-process="{ processTemplate }">
        <v-container v-if="processTemplate.isExecutable && processTemplate.nodeElements">
          <NTList :nodeTemplates="processTemplate.nodeElements"
            :menuItems="nodeMenuItems"
            @action="nodeTemplateActionSwitch({...$event, processTemplate})"
          >
            <template #append-node="{nodeTemplate}">
              <v-tooltip bottom>
                <template #activator="{on}">
                  <v-btn
                    fab
                    color="primary"
                    v-on="on"
                    @click="prepareInitProcess({processTemplate, nodeTemplate})"
                    small
                  > <v-icon>mdi-play</v-icon> </v-btn>
                </template>
                <span>Spustit proces na udalosti {{nodeTemplate.name}}</span>
              </v-tooltip>
              <div style="width:20px"></div>
            </template>
          </NTList>
        </v-container>
      </template>
    </PTList>

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
          @click="openUploadProcessDialog()"
        > <v-icon x-large>mdi-plus</v-icon> </v-btn>
      </template>
      <span>Nahrát šablonu procesu.</span>
    </v-tooltip>

    <FullDialog v-model="uploadProcessDialog" title="Nahrát šablonu procesu" closeable>
      <v-container>
        <v-alert type="error" :value="!!msgError">
          {{msgError}}
        </v-alert>
        <PTUploader :key="`dialog-${uploadProcessDialog}`"
          :loading="actionWaiting"
          @success="tryUploadProcess"
        ></PTUploader>
      </v-container>
    </FullDialog>

    <FullDialog v-model="updateProcessDialog" title="Upravit šablonu procesu" closeable>
      <v-container>
        <v-alert type="error" :value="!!msgError">
          {{msgError}}
        </v-alert>
        <PTEditor :key="`dialog2-${updateProcessDialog}`"
          v-if="selectedProcessTemplate"
          :loading="actionWaiting"
          @success="tryUpdateProcess({id: selectedProcessTemplate.id, ...$event})"
          :name="selectedProcessTemplate.name"
          :isExecutable="selectedProcessTemplate.isExecutable"
          :candidateManager="selectedProcessTemplate.candidateManager"
        ></PTEditor>
      </v-container>
    </FullDialog>

    <YesNoDialog v-model="ynDialog" :title="ynTitle"
      :loading="actionWaiting"
      @yes="ynActionYes" @no="ynActionNo"
    >
      <v-alert type="error" :value="!!msgError">
        {{msgError}}
      </v-alert>
    </YesNoDialog>

  </v-container>
</template>
<script>
import PTList from '../components/PTList.vue'
import NTList from '../components/NTList.vue'
import PTUploader from '../components/PTUploader'
import PTEditor from '../components/PTEditor'
import FullDialog from '../components/FullDialog'
import YesNoDialog from '../components/YesNoDialog'

import { simulateLoading } from '../simulateLoading'

const gql = {
  client: require('../graphql/auth/client.gql'),
  // processTemplates
  processTemplates: require('../graphql/bpmn/processTemplates_NTStart.gql'),
  uploadProcess: require('../graphql/bpmn/uploadProcess.gql'),
  initProcess: require('../graphql/bpmn/initProcess.gql'),
  deleteProcessTemplate: require('../graphql/bpmn/deleteProcessTemplate.gql'),
  updateProcessTemplate: require('../graphql/bpmn/updateProcessTemplate.gql'),
}
/** @typedef MenuItem
 *  @type { {icon:string, title:string, action:string} }
 */

export default {
  components: {
    YesNoDialog, FullDialog, PTList, PTUploader, NTList, PTEditor,
  },
  data () {
    return {
      processTemplates: [],

      uploadProcessDialog: false,
      updateProcessDialog: false,

      selectedProcessTemplate: null,

      msgError: '',
      actionWaiting: false,

      ynDialog: false,
      ynTitle: '',
      ynActionYes: () => {},
      ynActionNo: () => { this.closeYNDialog() },

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
  apollo: {
    processTemplates: {
      query: gql.processTemplates,
    },
  },
  mounted () {
    console.log('PIs mounted')
    this.$apollo.queries.processTemplates.refetch()
  },
  methods: {
    log () {
      console.log(gql)
    },
    processTemplateActionSwitch (action) {
      console.log(action.item.action, action)
      switch (action.item.action) {
        case 'update':
          this.updateProcessDialog = true
          this.selectedProcessTemplate = action.processTemplate
          console.log(this.selectedProcessTemplate)
          break
        case 'delete':
          this.openYNDialog()
          this.ynTitle = `Chcete trvale smazat šablonu procesu '${action.processTemplate.name}' (${action.processTemplate.id})?`
          this.ynActionYes = () => {
            this.tryActionWrapper(async () => {
              await this.deleteProcess({ id: action.processTemplate.id })
              this.closeYNDialog()
            })
          }
          break
      }
    },
    nodeTemplateActionSwitch (action) {
      console.log(action.item.action, action)
      switch (action.item.action) {
        case 'init':
          this.prepareInitProcess(action)
          break
      }
    },

    openYNDialog () {
      this.msgError = ''
      this.ynDialog = true
    },
    closeYNDialog () {
      this.msgError = ''
      this.ynDialog = false
    },
    openUploadProcessDialog () {
      this.msgError = ''
      this.uploadProcessDialog = true
    },

    // Funkce s pokusem o provedeni funkce
    async tryActionWrapper (asyncFn, args = []) {
      this.actionWaiting = true
      try {
        await asyncFn(...args)
      } catch (e) {
        this.msgError = (e.message) ? e.message : 'Nepodarilo se.'
        console.error(e)
      }
      this.actionWaiting = false
    },

    tryUploadProcess ({ bpmnText }) {
      return this.tryActionWrapper(async () => {
        await this.uploadProcess({ xml: bpmnText })
        this.uploadProcessDialog = false
        this.msgError = ''
      })
    },

    tryUpdateProcess (processTemplate) {
      return this.tryActionWrapper(async () => {
        await this.updateProcess(processTemplate)
        this.updateProcessDialog = false
        this.msgError = ''
      })
    },

    prepareInitProcess (action) {
      this.openYNDialog()
      this.ynTitle = `Chcete spustit proces '${action.processTemplate.name}' na události '${action.nodeTemplate.name}'?`
      this.ynActionYes = () => {
        this.tryActionWrapper(async () => {
          await this.initProcess({
            idProcessTemplate: action.processTemplate.id,
            idNodeTemplate: action.nodeTemplate.id,
          })
          this.closeYNDialog()
        })
      }
    },

    async uploadProcess ({ xml }) {
      console.warn('TODO: uploadProcess')
      await simulateLoading()
      await this.$apollo.mutate({
        mutation: gql.uploadProcess,
        variables: {
          xml,
        },
        update (proxy, { data: { uploadProcess } }) {
          console.log(uploadProcess)
          if (uploadProcess) {
            const data = proxy.readQuery({
              query: gql.processTemplates,
            })
            // createUser.membership = []
            data.processTemplates.push(...uploadProcess)
            proxy.writeQuery({
              query: gql.processTemplates,
              data: data,
            })
          } // if (uploadProcess)
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
        update (proxy, { data: { deleteProcessTemplate } }) {
          console.log(deleteProcessTemplate)
          if (deleteProcessTemplate) {
            const data = proxy.readQuery({
              query: gql.processTemplates,
            })
            data.processTemplates.find((pt, index) => {
              if (pt.id === id) {
                data.processTemplates.splice(index, 1)
                return true
              }
              return false
            })
            proxy.writeQuery({
              query: gql.processTemplates,
              data: data,
            })
          } // if (deleteProcessTemplate)
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
        update (proxy, { data: { updateProcessTemplate } }) {
          if (updateProcessTemplate) {
            const data = proxy.readQuery({
              query: gql.processTemplates,
            })
            data.processTemplates.forEach(pt => {
              if (pt.id === updateProcessTemplate.id) {
                pt.name = updateProcessTemplate.name
                pt.isExecutable = updateProcessTemplate.isExecutable
                pt.candidateManager = updateProcessTemplate.candidateManager
              }
            })
            proxy.writeQuery({
              query: gql.processTemplates,
              data: data,
            })
          } // if (updateProcessTemplate)
        },
      })
    },

  },
}
</script>
