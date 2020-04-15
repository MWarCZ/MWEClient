<template>
  <v-container>

    <h1 class="text-center">Uzly pro mne</h1>

    <NIFilter :value="NIsForMeProvider">
      <template #default="{data}">
        <NIList
          :nodeInstances="[...data]"
          :menuItems="nodeItems"
          @action="1"
        >
          <template #append-item="{nodeInstance}">
            <v-list-item-content v-if="nodeInstance.assignee">
              <v-list-item-title>Nabyvatel</v-list-item-title>
              <v-list-item-subtitle>{{nodeInstance.assignee.login}}</v-list-item-subtitle>
            </v-list-item-content>
            <v-btn color="info" @click="goToNI(nodeInstance)">
              <v-icon>mdi-information-outline</v-icon>
              Zobrazit
            </v-btn>
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

// import { simulateLoading } from '../../simulateLoading'

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
            // const allChangedIds = changedNIs.map(p => p.id)
            const oldIds = previousResult.nodeInstances.map(p => p.id)
            // const changedIds = allChangedIds.filter(id => oldIds.includes(id))

            const groupNames = this.client.membership.map(m => m.group.name)

            changedNIs.forEach(newNI => {
              console.warn('NI', newNI)

              if (oldIds.includes(newNI.id)) {
                // ... Change oldNI
                console.warn('Change NI')
              } else if (newNI.status.toLowerCase() === 'waiting') {
                console.warn('Waiting NI')
                // ...
                if (this.testNI(newNI, groupNames)) {
                  console.warn('Add NI')
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
      console.log('C', this.client)
      console.log('N', this.nodeInstances)
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

  },
}
</script>
