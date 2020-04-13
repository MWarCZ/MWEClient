<template>
  <v-container>

    <h1 class="text-center">Instance uzlu</h1>

    <NIInfo v-if="nodeInstance" :node="nodeInstance"></NIInfo>
    <h2 class="text-center" v-else>Nenalezena.</h2>

    <h2 class="text-center">Šablona uzlu</h2>

    <NTInfo v-if="nodeInstance && nodeInstance.template"
      :node="nodeInstance.template"
    ></NTInfo>
    <h2 class="text-center" v-else>Nenalezena.</h2>

    <v-expansion-panels
      v-if="nodeInstance"
      v-model="expansionPanels"
      focusable accordion multiple
    >

      <v-btn
        color="success"
        @click="sureClaimNodeInstance({nodeInstance})"
      >
        Zabrat/Obsadit
      </v-btn>
      <v-btn color="error" @click="sureReleaseNodeInstance({nodeInstance})">
        Uvolnit
      </v-btn>

      <v-expansion-panel>
        <v-expansion-panel-header>
          <span class="display-1 text-center">XXX</span>
        </v-expansion-panel-header>
        <v-expansion-panel-content>

          xxx

        </v-expansion-panel-content>
      </v-expansion-panel>

    </v-expansion-panels>

    <FullDialog v-model="fsDialog" :title="fsTitle" closeable>
      <v-container>
        <v-alert type="error" :value="!!msgError">
          {{msgError}}
        </v-alert>

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
import NIInfo from '../../components/bpmn/NI_Info'
import NTInfo from '../../components/bpmn/NT_Info'
import YesNoDialog from '../../components/YesNoDialog'
import FullDialog from '../../components/FullDialog'

import { simulateLoading } from '../../simulateLoading'

const gql = {
  nodeInstance: require('../../graphql/bpmn2/NIWithNT.gql'),
  // Mutation
  claimNodeInstance: require('../../graphql/bpmn2/claimNodeInstance.gql'),
  releaseNodeInstance: require('../../graphql/bpmn2/releaseNodeInstance.gql'),

  // Supbscription
  changedProcessInstance: require('../../graphql/subscription/changedProcessInstance.gql'),
}

/** @typedef MenuItem
 *  @type { {icon:string, title:string, action:string} }
 */

export default {
  components: {
    NIInfo,
    NTInfo,
    YesNoDialog,
    FullDialog,
  },
  mounted () {
    // this.$apollo.queries.nodeInstance.refetch()
  },
  apollo: {

    nodeInstance: {
      query: gql.nodeInstance,
      variables () {
        return {
          id: this.routeId,
        }
      },
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
    }
  },
  computed: {
    routeId () {
      return Number(this.$route.params.id) || -1
    },
  },
  methods: {

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
