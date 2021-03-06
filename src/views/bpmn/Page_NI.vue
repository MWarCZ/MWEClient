<template>
  <v-container>
    <BackButton />
    <BackButton disableGoBack
      hint="Přejit na instanci procesu"
      icon="mdi-book"
      :relativeLeft="100"
      @click="goToProcessInstance"
    />

    <h1 class="text-center">Instance uzlu</h1>

    <NIInfo v-if="nodeInstance" :node="nodeInstance"></NIInfo>
    <h2 class="text-center" v-else>Nenalezena.</h2>

    <h2 class="text-center">Šablona uzlu</h2>

    <template v-if="nodeInstance">

      <NTInfo v-if="nodeInstance.template"
        :node="nodeInstance.template"
      ></NTInfo>
      <h2 class="text-center" v-else>Nenalezena.</h2>

      <v-expansion-panels
        v-model="expansionPanels"
        focusable accordion multiple
      >
        <v-container v-if="isNIWaiting" class="text-center">

          <v-btn v-if="isItClient(nodeInstance.assignee)"
            color="error" @click="sureReleaseNodeInstance({nodeInstance})">
            Uvolnit
          </v-btn>
          <v-btn v-else
            color="success"
            @click="sureClaimNodeInstance({nodeInstance})"
          >
            Zabrat/Obsadit
          </v-btn>

        </v-container>

        <v-expansion-panel v-if="isItClient(nodeInstance.assignee)">
          <v-expansion-panel-header>
            <span class="display-1 text-center">Formulář s dodatky</span>
          </v-expansion-panel-header>
          <v-expansion-panel-content>
            <v-container v-if="isNIWaiting"
              class="text-center"
            >
              <v-btn v-if="!nodeAdditionsFormat"
                color="info"
                @click="getAdditionsFormat()"
              >Našist formulář</v-btn>

              <AdditionsForm v-else
                :items="nodeAdditionsFormat"
                @submit="sureNodeAdditions({ nodeInstance, input: $event})"
                :itemsX="[
                  {
                    name: 'CheckBox',
                    type: 'checkbox',
                    default: 'true',
                  },
                  {
                    name: 'Color',
                    type: 'color',
                  },
                  //===============
                  {
                    name: 'email',
                    type: 'email',
                  },
                  {
                    name: 'number',
                    type: 'number',
                  },
                  {
                    name: 'password',
                    type: 'password',
                  },
                  //===============
                  {
                    name: 'range',
                    type: 'range',
                  },
                  {
                    name: 'search',
                    type: 'search',
                  },
                  {
                    name: 'tel',
                    type: 'tel',
                  },
                  //==========
                  {
                    name: 'select',
                    type: 'select',
                  },
                  {
                    name: 'XSelect',
                    type: 'select',
                    possibilities: ['Ano', 'Ne']
                  },
                ]"
              />
            </v-container>
            <v-container v-else class="text-center">
              <h2>Formulář není možné vyplnit.</h2>
            </v-container>

          </v-expansion-panel-content>
        </v-expansion-panel>

      </v-expansion-panels>

    </template>
    <template v-else-if="$apollo.queries.nodeInstance.loading">
      <h2 class="text-center">Načítání ...</h2>
    </template>
    <template v-else>
      <h2 class="text-center">Nenalezena.</h2>
    </template>

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
// import YesNoDialog from '../../components/YesNoDialog'
// import FullDialog from '../../components/FullDialog'
import BackButton from '../../components/BackButton'
// import AdditionsForm from '../../components/bpmn/AdditionsForm'

import { simulateLoading } from '../../simulateLoading'

const gql = {
  client: require('../../graphql/auth/client.gql'),
  // Query
  nodeInstance: require('../../graphql/bpmn2/NIWithNT.gql'),
  // Mutation
  claimNodeInstance: require('../../graphql/bpmn2/claimNodeInstance.gql'),
  releaseNodeInstance: require('../../graphql/bpmn2/releaseNodeInstance.gql'),
  nodeAdditionsFormat: require('../../graphql/bpmn2/nodeAdditionsFormat.gql'),
  nodeAdditions: require('../../graphql/bpmn2/nodeAdditions.gql'),

  // Supbscription
  changedNodeInstances: require('../../graphql/subscription/changedNodeInstances.gql'),
}

/** @typedef MenuItem
 *  @type { {icon:string, title:string, action:string} }
 */

export default {
  components: {
    NIInfo,
    NTInfo,
    BackButton,
    FullDialog: () => import(/* webpackChunkName: "FullDialog" */ '../../components/FullDialog'),
    YesNoDialog: () => import(/* webpackChunkName: "YesNoDialog" */ '../../components/YesNoDialog'),
    AdditionsForm: () => import(/* webpackChunkName: "AdditionsForm" */ '../../components/bpmn/AdditionsForm'),
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
      subscribeToMore: [
        {
          document: gql.changedNodeInstances,
          updateQuery (previousResult, { subscriptionData }) {
            if (!subscriptionData.data.changedNodeInstances) {
              return previousResult
            }
            const changedNIs = subscriptionData.data.changedNodeInstances

            const newNI = changedNIs.find(ni => ni.id === previousResult.nodeInstance.id)
            if (newNI) {
              return {
                nodeInstance: newNI,
              }
            }
            return previousResult
          },
        },
      ],
    },
    client: {
      query: gql.client,
    },
    nodeAdditionsFormat: {
      query: gql.nodeAdditionsFormat,
      variables () {
        return { idNI: this.routeId }
      },
      skip () {
        return !this.loadAdditionFormat
      },
    },
  },
  data () {
    return {
      client: null,
      nodeInstance: null,
      expansionPanels: [0],
      nodeAdditionsFormat: null,
      loadAdditionFormat: false,

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
    isNIWaiting () {
      return this.nodeInstance && this.nodeInstance.status.toLowerCase() === 'waiting'
    },
  },
  methods: {
    getAdditionsFormat () {
      this.loadAdditionFormat = true
      this.$apollo.queries.nodeAdditionsFormat.refetch()
    },
    // =====
    isClientInGroup (groupName) {
      try {
        const names = this.client.members.map(m => m.group.name)
        return names.includes(groupName)
      } catch {
        return false
      }
    },
    isItClient (assignee) {
      try {
        return assignee.id === this.client.id || assignee.login === this.client.login
      } catch { return false }
    },

    goToProcessInstance () {
      try {
        const id = this.nodeInstance.processInstance.id
        this.$router.push({ path: `/pi/${id}` })
      } catch { }
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
        // console.error(e)
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

    sureNodeAdditions ({ nodeInstance, input }) {
      this.openYNDialog(
        `Chcete odeslat doplnky pro instanci uzlu (${nodeInstance.id})?`,
        () => {
          this.tryActionWrapper(async () => {
            await this.nodeAdditions({ id: nodeInstance.id, input })
            this.closeYNDialog()
          })
        },
      )
    },

    // Mutace

    async claimNodeInstance ({ id }) {
      await simulateLoading()
      await this.$apollo.mutate({
        mutation: gql.claimNodeInstance,
        variables: {
          idNI: id,
        },
      })
    },
    async releaseNodeInstance ({ id }) {
      await simulateLoading()
      await this.$apollo.mutate({
        mutation: gql.releaseNodeInstance,
        variables: {
          idNI: id,
        },
      })
    },

    async nodeAdditions ({ id, input }) {
      await simulateLoading()
      await this.$apollo.mutate({
        mutation: gql.nodeAdditions,
        variables: {
          idNI: id,
          input,
        },
      })
    },
  },
}
</script>
