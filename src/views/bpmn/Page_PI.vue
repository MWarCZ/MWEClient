<template>
  <v-container>

    <h1 class="text-center">Instance procesu</h1>

    <PIInfo v-if="processInstance" :process="processInstance"></PIInfo>
    <h2 class="text-center" v-else>Nenalezena.</h2>

    <h2 class="text-center">Šablona procesu</h2>

    <PTInfo v-if="processInstance && processInstance.template"
      :process="processInstance.template"
    ></PTInfo>
    <h2 class="text-center" v-else>Nenalezena.</h2>

    <v-expansion-panels
      v-if="processInstance"
      v-model="expansionPanels"
      focusable accordion multiple
    >

      <v-expansion-panel>
        <v-expansion-panel-header>
          <span class="display-1 text-center">Instance uzlů</span>
        </v-expansion-panel-header>
        <v-expansion-panel-content>

          <NIFilter :value="processInstance.nodeElements">
            <template #default="{data}">
              <NIList
                :nodeInstances="data"
                :menuItems="nodeItems"
                @action="1"
              >
                <template #append-item="{nodeInstance}">
                  <v-btn color="info" @click="goToNI(nodeInstance)">
                    <v-icon>mdi-information-outline</v-icon>
                    Zobrazit
                  </v-btn>
                </template>
              </NIList>
            </template>
          </NIFilter>

        </v-expansion-panel-content>
      </v-expansion-panel>

    </v-expansion-panels>

    <FullDialog v-model="fsDialog" :title="fsTitle" closeable>
      <v-container>
        <v-alert type="error" :value="!!msgError">
          {{msgError}}
        </v-alert>
        <!-- <PTEditor v-if="processTemplate && fsBody === 'update'"
          :key="`dialog2-${fsBody}-${processTemplate.id}`"
          :loading="loading"
          @success="tryUpdateProcess({id: processTemplate.id, ...$event})"
          :name="processTemplate.name"
          :isExecutable="processTemplate.isExecutable"
          :candidateManager="processTemplate.candidateManager"
        ></PTEditor> -->

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
import NIList from '../../components/bpmn/NI_List'
import NIFilter from '../../components/bpmn/NI_Filter'
import PIInfo from '../../components/bpmn/PI_Info'
import PTInfo from '../../components/bpmn/PT_Info'
import YesNoDialog from '../../components/YesNoDialog'
import FullDialog from '../../components/FullDialog'

import { simulateLoading } from '../../simulateLoading'

const gql = {
  processInstance: require('../../graphql/bpmn2/PIWithNIsAndPT.gql'),
  // Mutation
  withdrawnProcess: require('../../graphql/bpmn/withdrawnProcess.gql'),
  claimNodeInstance: require('../../graphql/bpmn2/claimNodeInstance.gql'),
  releaseNodeInstance: require('../../graphql/bpmn2/releaseNodeInstance.gql'),

  // Supbscription
  changedProcessInstance: require('../../graphql/subscription/changedProcessInstance.gql'),
  changedProcessTemplates: require('../../graphql/subscription/changedProcessTemplates.gql'),
}

/** @typedef MenuItem
 *  @type { {icon:string, title:string, action:string} }
 */

export default {
  components: {
    NIList,
    NIFilter,
    PIInfo,
    PTInfo,
    YesNoDialog,
    FullDialog,
  },
  mounted () {
    this.$apollo.queries.processInstance.refetch()
  },
  apollo: {
    processInstance: {
      query: gql.processInstance,
      variables () {
        return {
          id: this.routeId,
        }
      },
      subscribeToMore: [
        {
          document: gql.changedProcessInstance,
          updateQuery (previousResult, { subscriptionData }) {
            const newPI = subscriptionData.data.changedProcessInstance
            if (!newPI) {
              return previousResult
            }
            if (previousResult.processInstance.id !== newPI.id) {
              return previousResult
            }
            return {
              processInstance: {
                ...newPI,
                nodeInstances: previousResult.processInstance.nodeElements,
              },
            }
          },
        },
        {
          document: gql.changedProcessTemplates,
          updateQuery (previousResult, { subscriptionData }) {
            const changedPTs = subscriptionData.data.changedProcessTemplates
            if (!changedPTs) {
              return previousResult
            }
            const newPT = changedPTs.find(pt => pt.id === previousResult.processInstance.template.id)
            if (!newPT) {
              return previousResult
            }
            previousResult.processInstance.template = newPT
            return previousResult
          },
        },
      ],
    },
  },
  data () {
    return {
      processInstance: null,
      expansionPanels: [],

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
      nodeItems: [
        // {
        //   icon: 'mdi-account-arrow-left',
        //   title: 'Zabrat/Obsloužit',
        //   action: 'claim',
        // },
        // {
        //   icon: 'mdi-account-arrow-right',
        //   title: 'Uvolnit',
        //   action: 'claim',
        // },
      ],
    }
  },
  computed: {
    routeId () {
      return Number(this.$route.params.id) || -1
    },
  },
  methods: {
    goToNI ({ id }) {
      this.$router.push({ path: `/ni/${id}` })
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
    // =======================

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
    // ===========================

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

    sureClaimNodeInstance ({ nodeInstance }) {
      this.openYNDialog(
        `Chcete zabrat/obsloužit instanci uzlu (${nodeInstance.id})?`,
        () => {
          this.tryActionWrapper(async () => {
            await this.claimNodeInstance({ id: nodeInstance.id })
            this.closeYNDialog()
          })
        },
      )
    },
    sureReleaseNodeInstance ({ nodeInstance }) {
      this.openYNDialog(
        `Chcete uvolnit instanci uzlu (${nodeInstance.id})?`,
        () => {
          this.tryActionWrapper(async () => {
            await this.releaseNodeInstance({ id: nodeInstance.id })
            this.closeYNDialog()
          })
        },
      )
    },

    // Mutace

    async withdrawnProcess ({ id }) {
      console.warn('TODO: withdrawnProcess')
      await simulateLoading()
      await this.$apollo.mutate({
        mutation: gql.withdrawnProcess,
        variables: {
          idPI: id,
        },
      })
    },

    async claimNodeInstance ({ id }) {
      console.warn('TODO: claimNodeInstance')
      await simulateLoading()
      await this.$apollo.mutate({
        mutation: gql.claimNodeInstance,
        variables: {
          idNI: id,
        },
      })
    },
    async releaseNodeInstance ({ id }) {
      console.warn('TODO: releaseNodeInstance')
      await simulateLoading()
      await this.$apollo.mutate({
        mutation: gql.releaseNodeInstance,
        variables: {
          idNI: id,
        },
      })
    },
  },

}
</script>
