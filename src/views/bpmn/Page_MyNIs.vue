<template>
  <v-container>

    <h1 class="text-center">Moje uzly</h1>

    <NIFilter :value="NIsProvider" statusValue="Waiting">
      <template #default="{data}">
        <NIList
          :nodeInstances="[...data]"
          :menuItems="nodeItems"
          @action="1"
        >
          <template #default="{nodeInstance}">
            <v-list-item-action>
              <NIIcon :status="nodeInstance.status" />
              <span>{{nodeInstance.id}}</span>
            </v-list-item-action>
            <v-list-item-content>
              <v-list-item-title>{{nodeInstance.template.implementation}}</v-list-item-title>
              <v-list-item-subtitle>{{nodeInstance.template.name}}</v-list-item-subtitle>
            </v-list-item-content>
          </template>
          <template #append-item="{nodeInstance}">
            <v-list-item-content v-if="nodeInstance.assignee">
              <v-list-item-title>Nabyvatel</v-list-item-title>
              <v-list-item-subtitle>{{nodeInstance.assignee.login}}</v-list-item-subtitle>
            </v-list-item-content>

            <v-tooltip bottom v-if="isNIWaiting(nodeInstance)">
              <template #activator="{on}">
                <v-btn v-on="on" rounded color="error"
                  @click="sureReleaseNodeInstance({nodeInstance})">
                  Uvolnit
                </v-btn>
              </template>
              Uvolnit uzel
            </v-tooltip>

            <v-tooltip bottom>
              <template #activator="{on}">
                <v-btn fab v-on="on" color="info" @click="goToNI(nodeInstance)">
                  <v-icon>mdi-information-outline</v-icon>
                </v-btn>
              </template>
              Zobrazit
            </v-tooltip>
          </template>
        </NIList>
      </template>
    </NIFilter>

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
import YesNoDialog from '../../components/YesNoDialog'

import NIIcon from '../../components/bpmn/NI_IconStatus'

import { simulateLoading } from '../../simulateLoading'

const gql = {
  client: require('../../graphql/auth/client.gql'),
  nodeInstances: require('../../graphql/bpmn2/NIsWithNT.gql'),
  // Mutation
  claimNodeInstance: require('../../graphql/bpmn2/claimNodeInstance.gql'),
  releaseNodeInstance: require('../../graphql/bpmn2/releaseNodeInstance.gql'),
  // Supbscription
  changedNodeInstances: require('../../graphql/subscription/changedNodeInstances.gql'),
}
/** @typedef MenuItem
 *  @type { {icon:string, title:string, action:string} }
 */

export default {
  components: {
    NIList,
    NIFilter,
    YesNoDialog,
    NIIcon,
  },
  mounted () {
    this.$apollo.queries.nodeInstances.refetch()
  },
  apollo: {
    client: {
      query: gql.client,
    },
    nodeInstances: {
      query: gql.nodeInstances,
      variables () {
        return {
          // status: 'waiting',
          assigneeIsMe: true,
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
            const oldIds = previousResult.nodeInstances.map(p => p.id)

            const groupNames = this.client.membership.map(m => m.group.name)

            changedNIs.forEach(newNI => {
              if (oldIds.includes(newNI.id)) {
                // ... Change oldNI
              } else if (newNI.status.toLowerCase() === 'waiting') {
                // ...
                if (this.testNI(newNI, groupNames)) {
                  previousResult.nodeInstances.push(newNI)
                  // ... add newNI to oldNIs
                }
              }
            })
            return previousResult
          },
        },
      ],
    },
  },
  data () {
    return {
      client: null,
      nodeInstances: [],

      loading: false,
      msgError: '',

      ynDialog: false,
      ynTitle: '???',
      ynActionYes: () => {},
      ynActionNo: () => {},

      /** @type MenuItem[] */
      nodeItems: [
        // {
        //   icon: 'mdi-account-arrow-right',
        //   title: 'Uvolnit',
        //   action: 'release',
        // },
      ],
    }
  },
  computed: {
    NIsProvider () {
      if (!this.client) return []
      // const groupNames = this.client.membership.map(m => m.group.name)
      const nodes = this.nodeInstances.filter(node => this.testNI(node))
      return nodes
    },
  },
  methods: {
    goToNI ({ id }) {
      this.$router.push({ path: `/ni/${id}` })
    },
    testNI (node) {
      try {
        return node.assignee.id === this.client.id
      } catch { return false }
    },
    isNIWaiting (node) {
      try {
        return node.status.toLowerCase() === 'waiting'
      } catch { return false }
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
    //= =================
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

    async releaseNodeInstance ({ id }) {
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
