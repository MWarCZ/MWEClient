<template>
  <v-container>
    <BackButton />

    <h1 class="text-center">Šablona procesu</h1>

    <PTInfo v-if="processTemplate" :process="processTemplate"></PTInfo>
    <h2 class="text-center" v-else>Nenalezena.</h2>

    <v-expansion-panels
      v-if="processTemplate"
      v-model="expansionPanels"
      focusable accordion multiple
    >

      <v-expansion-panel>
        <v-expansion-panel-header>
          <span class="display-1 text-center">Šablony uzlů</span>
        </v-expansion-panel-header>
        <v-expansion-panel-content>

          <NTList :nodeTemplates="processTemplate.nodeElements">
            <template #append-item="{nodeTemplate}">
              {{nodeTemplate.implementation}}
              <v-tooltip bottom v-if="textContains(nodeTemplate.implementation, 'startevent')">
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

        </v-expansion-panel-content>
      </v-expansion-panel>

      <v-expansion-panel>
        <v-expansion-panel-header>
          <span class="display-1 text-center">Instance procesů</span>
        </v-expansion-panel-header>
        <v-expansion-panel-content>

          <PIFilter :value="processTemplate.instances">
            <template #default="{data}">
              <PIList
                :processInstances="[...data].reverse()"
                :menuItems="processInstanceMenuItems"
                @action="processInstanceActionSwitch"
              >
                <template #append-item="{processInstance}">
                  <v-btn color="info" @click="goToPI(processInstance)">
                    <v-icon>mdi-information-outline</v-icon>
                    Zobrazit
                  </v-btn>
                </template>
              </PIList>
            </template>
          </PIFilter>

        </v-expansion-panel-content>
      </v-expansion-panel>

    </v-expansion-panels>

    <!-- update btn -->
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
          @click="openUpdateDialog()"
        > <v-icon x-large>mdi-lead-pencil</v-icon> </v-btn>
      </template>
      <span>Upravit šablonu procesu.</span>
    </v-tooltip>

    <FullDialog v-model="fsDialog" :title="fsTitle" closeable>
      <v-container>
        <v-alert type="error" :value="!!msgError">
          {{msgError}}
        </v-alert>
        <PTEditor v-if="processTemplate && fsBody === 'update'"
          :key="`dialog2-${fsBody}-${processTemplate.id}`"
          :loading="loading"
          @success="tryUpdateProcess({id: processTemplate.id, ...$event})"
          :name="processTemplate.name"
          :isExecutable="processTemplate.isExecutable"
          :candidateManager="processTemplate.candidateManager"
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
import NTList from '../../components/bpmn/NT_List'
import PIList from '../../components/bpmn/PI_List'
import PIFilter from '../../components/bpmn/PI_Filter'
import PTInfo from '../../components/bpmn/PT_Info'
import YesNoDialog from '../../components/YesNoDialog'
import FullDialog from '../../components/FullDialog'
import PTEditor from '../../components/bpmn/PT_Editor'
import BackButton from '../../components/BackButton'

import { simulateLoading } from '../../simulateLoading'

const gql = {
  client: require('../../graphql/auth/client.gql'),
  processTemplate: require('../../graphql/bpmn2/PTWithPIsAndNT.gql'),
  // Mutation
  deleteProcessInstance: require('../../graphql/bpmn/deleteProcessInstance.gql'),
  withdrawnProcess: require('../../graphql/bpmn/withdrawnProcess.gql'),

  updateProcessTemplate: require('../../graphql/bpmn/updateProcessTemplate.gql'),
  initProcess: require('../../graphql/bpmn/initProcess.gql'),
  // Supbscription
  changedProcessTemplates: require('../../graphql/subscription/changedProcessTemplates.gql'),
  newProcessInstance: require('../../graphql/subscription/newProcessInstance.gql'),
  deletedProcessInstance: require('../../graphql/subscription/deletedProcessInstance.gql'),
  changedProcessInstance: require('../../graphql/subscription/changedProcessInstance.gql'),
}

/** @typedef MenuItem
 *  @type { {icon:string, title:string, action:string} }
 */

export default {
  components: {
    NTList,
    PIList,
    PIFilter,
    PTInfo,
    YesNoDialog,
    FullDialog,
    PTEditor,
    BackButton,
  },
  mounted () {
    this.$apollo.queries.processTemplate.refetch()
  },
  apollo: {
    processTemplate: {
      query: gql.processTemplate,
      variables () {
        return {
          id: this.routeId,
        }
      },
      subscribeToMore: [
        {
          document: gql.changedProcessTemplates,
          updateQuery (previousResult, { subscriptionData }) {
            const changedPTs = subscriptionData.data.changedProcessTemplates
            if (!changedPTs) {
              return previousResult
            }
            const newPT = changedPTs.find(pt => pt.id === previousResult.processTemplate.id)
            if (!newPT) {
              return previousResult
            }
            return {
              processTemplate: {
                ...newPT,
                nodeElements: previousResult.processTemplate.nodeElements,
              },
            }
          },
        },
        {
          document: gql.newProcessInstance,
          updateQuery (previousResult, { subscriptionData }) {
            const newPI = subscriptionData.data.newProcessInstance
            if (!newPI) {
              return previousResult
            }
            if (newPI.template && newPI.template.id === previousResult.processTemplate.id) {
              previousResult.processTemplate.instances.push(newPI)
            }
            return previousResult
          },
        },
        {
          document: gql.changedProcessInstance,
          updateQuery (previousResult, { subscriptionData }) {
            const newPI = subscriptionData.data.changedProcessInstance
            if (!newPI) {
              return previousResult
            }
            const oldPI = previousResult.processTemplate.instances.find(pi => pi.id === newPI.id)
            if (oldPI) {
              previousResult.processTemplate.instances = previousResult.processTemplate.instances.map(pi => {
                if (pi.id === newPI.id) {
                  return newPI
                }
                return pi
              })
            }
            return previousResult
          },
        },
        {
          document: gql.deletedProcessInstance,
          updateQuery (previousResult, { subscriptionData }) {
            const deletedPI = subscriptionData.data.deletedProcessInstance
            if (!deletedPI) {
              return previousResult
            }
            const oldPI = previousResult.processTemplate.instances.find(pi => pi.id === deletedPI.id)
            if (oldPI) {
              previousResult.processTemplate.instances = previousResult.processTemplate.instances.filter(pi => {
                return pi.id !== deletedPI.id
              })
            }
            return previousResult
          },
        },
      ],
    },
  },
  data () {
    return {
      processTemplate: null,
      expansionPanels: [0, 1],

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
      processInstanceMenuItems: [
        {
          icon: 'mdi-undo-variant',
          title: 'Stáhnout/Přerušit',
          action: 'withdrawn',
        },
        {
          icon: 'mdi-delete-forever',
          title: 'Smazat',
          action: 'delete',
        },
      ],
    }
  },
  computed: {
    routeId () {
      return Number(this.$route.params.id) || -1
    },
  },
  methods: {

    goToPI ({ id }) {
      this.$router.push({ path: `/pi/${id}` })
    },
    // =================
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

    openUpdateDialog () {
      this.openFSDialog('Upravit šablonu procesu', 'update')
    },
    // =============

    processInstanceActionSwitch (action) {
      // console.log(action.item.action, action)
      switch (action.item.action) {
        case 'delete':
          this.sureDeleteProcess(action)
          break
        case 'withdrawn':
          this.sureWithdrawnProcess(action)
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
        // console.error(e)
      }
      this.loading = false
    },

    tryUpdateProcess (processTemplate) {
      return this.tryActionWrapper(async () => {
        await this.updateProcess(processTemplate)
        this.closeFSDialog()
      })
    },

    //= ================

    sureDeleteProcess ({ processInstance }) {
      this.openYNDialog(
        `Chcete trvale smazat instanci procesu (${processInstance.id})?`,
        () => {
          this.tryActionWrapper(async () => {
            await this.deleteProcess({ id: processInstance.id })
            this.closeYNDialog()
          })
        },
      )
    },
    sureWithdrawnProcess ({ processInstance }) {
      this.openYNDialog(
        `Chcete stáhnout/přerušit instanci procesu (${processInstance.id})?`,
        () => {
          this.tryActionWrapper(async () => {
            await this.withdrawnProcess({ id: processInstance.id })
            this.closeYNDialog()
          })
        },
      )
    },

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

    // Mutation

    async updateProcess ({ id, name, isExecutable, candidateManager }) {
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

    async deleteProcess ({ id }) {
      await simulateLoading()
      await this.$apollo.mutate({
        mutation: gql.deleteProcessInstance,
        variables: {
          idPI: id,
        },
      })
    },

    async withdrawnProcess ({ id }) {
      await simulateLoading()
      await this.$apollo.mutate({
        mutation: gql.withdrawnProcess,
        variables: {
          idPI: id,
        },
      })
    },

    async initProcess ({ idProcessTemplate, idNodeTemplate }) {
      await simulateLoading()
      await this.$apollo.mutate({
        mutation: gql.initProcess,
        variables: {
          idProcessTemplate, idNodeTemplate,
        },
      })
    },
    // =========================

    textContains (implementation, text) {
      if (typeof implementation === 'string') {
        return implementation.toLowerCase().includes(text)
      }
      // console.warn('Chyba pri pokusu urcit implementaci: ', implementation)
      return false
    },
  },
}
</script>
