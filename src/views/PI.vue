<template>
  <v-container>
    <v-card>
      <v-container v-if="processInstance" >
        <v-btn v-if="!webScope" color="info" @click="goToMore">
          <v-icon>mdi-briefcase-search-outline</v-icon>
          Zobrazit více
        </v-btn>
        <v-btn v-else color="info" @click="goToLess">
          <v-icon>mdi-briefcase-search-outline</v-icon>
          Zobrazit méně
        </v-btn>

        <h3 class="display-1 text-center">Informace z instance procesu:</h3>
        <PIInfo :process="processInstance">
        </PIInfo>

        <h3 class="display-1 text-center">Informace ze šablony procesu:</h3>
        <PTInfo :process="processInstance.template" />

        <v-expansion-panels v-model="expansionPanels"
          focusable accordion multiple
        >
          <v-expansion-panel>
            <v-expansion-panel-header>
              <span v-if="webScope" class="display-1 text-center">Instance uzlů</span>
              <span v-else class="display-1 text-center">Čekající instance uzlů</span>

            </v-expansion-panel-header>
            <v-expansion-panel-content>
              <NITable
                :nodes="nodesProvider(processInstance.nodeElements)"
                :headers="NIHeaders"
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
  data () {
    return {
      NIHeaders: [
        { text: 'Akce', value: 'action' },
        { text: 'Ikona', value: 'xxx' },
        { text: 'ID', value: 'id' },
        { text: 'ID_T', value: 'template.id' },
        { text: 'Název', value: 'template.name' },
        { text: 'Typ', value: 'template.implementation' },
        { text: 'Započetí', value: 'startDateTime' },
        { text: 'Ukončení', value: 'endDateTime' },
        { text: 'Nabyvatel', value: 'assignee' },
        { text: 'Akce', value: 'action' },
      ],
      expansionPanels: [0],
      webScope: this.$route.params.scope,
    }
  },
  methods: {
    nodesProvider (allNodes) {
      if (this.webScope) {
        return allNodes
      }
      return allNodes.filter(node => ['Waiting'].includes(node.status))
    },
    goToMore () {
      const path = `${this.$route.path}/all`
      this.$router.push({ path })
    },
    goToLess () {
      const parts = this.$route.path.split('/')
      parts.pop()
      const path = parts.join('/')
      this.$router.push({ path })
    },
    xxx () {
      // this.$route.params.id
    },
  },
}
</script>
