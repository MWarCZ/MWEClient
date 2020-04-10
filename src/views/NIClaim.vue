<template>
  <v-container>
    <PIInfo :process="{
      id: 1122,
      startDateTime: new Date().toLocaleString(),
      endDateTime: null,
      status: 'Active',
    }" />
    <PTInfo :process="processTemplates[0]"/>

    <NITable
      :nodes="processTemplates[0].instances[0].nodeElements"
      :appendHeaders="[{text: 'Akce', value:'btn'}]"
    >
      <template #item.btn="{node}">
        <v-btn color="success">Claim {{node.id}}</v-btn>
      </template>
    </NITable>

    <PTList
      :processTemplates="processTemplates"
    >
      <template #extend-process="{processTemplate}">
        <v-container>
          <NIClaimTable
            v-if="processTemplate.instances"
            :processInstances="processTemplate.instances"
          ></NIClaimTable>
        </v-container>
      </template>
    </PTList>
  </v-container>
</template>
<script>
import NIClaimTable from '../components/NIClaimTable'
import PTList from '../components/PTList'
import PIInfo from '../components/PIInfo'
import PTInfo from '../components/PTInfo'
import NITable from '../components/NITable'

const gql = {
  getPTs_PIs_NIs_NT: require('../graphql/bpmn/getPTs_PIs_NIs_NT.gql'),
}
/** @typedef MenuItem
 *  @type { {icon:string, title:string, action:string} }
 */
export default {
  components: {
    NIClaimTable,
    PTList,
    PIInfo,
    PTInfo,
    NITable,
  },
  data () {
    return {
      processTemplates: [],
    }
  },
  apollo: {
    processTemplates: {
      query: gql.getPTs_PIs_NIs_NT,
      deep: true,
    },
  },
  mounted () {
    console.log('PIs mounted')
    this.$apollo.queries.processTemplates.refetch()
  },
  methods: {
    log (...args) {
      console.log(args)
    },
  },
}
</script>
