<template>
  <v-container>

    <h1 class="text-center">Uzly pro mne</h1>

    <NIFilter :value="NIsForMeProvider" statusReadonly statusValue="Waiting">
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

            <v-tooltip bottom>
              <template #activator="{on}">
                <v-btn v-on="on" rounded color="success"
                  @click="sureClaimNodeInstance({nodeInstance})">
                  Zabrat/Obsadit
                </v-btn>
              </template>
              Zabrat/Obsadit uzel
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
          status: 'waiting',
          assigneeNullOnly: true,
          forMeOnly: true,
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
        //   icon: 'mdi-account-arrow-left',
        //   title: 'Zabrat/Obsloužit',
        //   action: 'claim',
        // },
        // {
        //   icon: 'mdi-account-arrow-right',
        //   title: 'Uvolnit',
        //   action: 'release',
        // },
      ],
    }
  },
  computed: {
    NIsForMeProvider () {
      if (!this.client) return []
      const groupNames = this.client.membership.map(m => m.group.name)
      const nodes = this.nodeInstances.filter(node => this.testNI(node, groupNames))
      return nodes
    },
  },
  methods: {
    goToNI ({ id }) {
      this.$router.push({ path: `/ni/${id}` })
    },
    testNI (node, groupNames) {
      return !node.assignee && groupNames.includes(node.template.candidateAssignee)
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
  },
}
</script>
