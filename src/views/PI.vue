<template>
  <v-container>
    <v-card>
      <v-container v-if="processInstance" >
        <h3 class="display-1 text-center">Informace z instance procesu:</h3>
        <PIInfo :process="processInstance">
        </PIInfo>

        <h3 class="display-1 text-center">Informace ze šablony procesu:</h3>
        <PTInfo :process="processInstance.template" />

        <v-expansion-panels focusable accordion multiple>
          <v-expansion-panel>
            <v-expansion-panel-header>
              <h3 class="display-1 text-center">Instance uzlů</h3>
            </v-expansion-panel-header>
            <v-expansion-panel-content>
              <NITable
                :nodes="nodesProvider(processInstance.nodeElements)"
                :prependHeaders="[{text: 'Ikona', value: 'xxx'}]"
                :appendHeaders="[
                  {text: 'Nabyvatel', value: 'assignee'},
                  {text: 'Akce', value: 'action'},
                ]"
              >
                <template #item.xxx="{item}">
                  <NIIcon large :status="item.status"/>
                </template>
                <template #item.assignee="{item}">
                  {{item.assignee?item.assignee.login:'[Neobsazeno]'}}
                </template>
                <template #item.action>
                  <DotMenu :items="[
                    {title: 'Zabrat', icon: 'mdi-account-arrow-left'},
                    {title: 'Detaily', icon: 'mdi-information-outline'},
                  ]" />
                </template>
              </NITable>
            </v-expansion-panel-content>
          </v-expansion-panel>
        </v-expansion-panels>

      </v-container>
    </v-card>
    ...
    {{$route.params.id}}
  </v-container>
</template>
<script>
import PIInfo from '../components/PIInfo'
import PTInfo from '../components/PTInfo'
import NITable from '../components/NITable'
import NIIcon from '../components/ActivityStatusIcon'
import DotMenu from '../components/DotMenu'
// import { simulateLoading } from '../simulateLoading'

const gql = {
  processInstance: require('../graphql/bpmn/processInstance.gql'),
}
export default {
  components: {
    PIInfo,
    PTInfo,
    NITable,
    NIIcon,
    DotMenu,
  },
  apollo: {
    processInstance: {
      query: gql.processInstance,
      variables () {
        return { id: Number(this.$route.params.id) }
      },
    },
  },
  methods: {
    nodesProvider (allNodes) {
      if (this.$route.params.scope) {
        return allNodes
      }
      return allNodes.filter(node => ['Waiting'].includes(node.status))
    },
    xxx () {
      // this.$route.params.id
    },
  },
}
</script>
