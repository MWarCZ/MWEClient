<template>
  <v-container>
    test
    <PTFilter :value="processTemplates">
      <template #default="{data}">
        <PTList :processTemplates="data">
          <template #extend-process={processTemplate}>
            <NTList :nodeTemplates="processTemplate.nodeElements"></NTList>
          </template>
        </PTList>
      </template>
    </PTFilter>
    -----
    <PIFilter :value="processInstances">
      <template #default="{data}">
        <PIList :processInstances="data">
          <template #append-item>
            <v-btn color="info">
              <v-icon>mdi-information-outline</v-icon>
              Zobrazit
            </v-btn>
          </template>
        </PIList>
      </template>
    </PIFilter>
    ----
    <NIFilter :value="nodeInstances" statusReadonly statusValue="Waiting">
      <template #default="{data}">
        <NIList :nodeInstances="data"></NIList>
      </template>
    </NIFilter>
    ----
  </v-container>
</template>
<script>
import NTList from '../components/bpmn/NT_List'

import PTList from '../components/bpmn/PT_List'
import PTFilter from '../components/bpmn/PT_Filter'

import PIList from '../components/bpmn/PI_List'
import PIFilter from '../components/bpmn/PI_Filter'

import NIList from '../components/bpmn/NI_List'
import NIFilter from '../components/bpmn/NI_Filter'

const gql = {
  client: require('../graphql/auth/client.gql'),
  // processTemplates
  processTemplates: require('../graphql/bpmn/processTemplates_NTStart.gql'),
  processInstances: require('../graphql/bpmn/processInstances.gql'),
  nodeInstances: require('../graphql/bpmn/nodeInstances.gql'),

  uploadProcess: require('../graphql/bpmn/uploadProcess.gql'),
  initProcess: require('../graphql/bpmn/initProcess.gql'),
  deleteProcessTemplate: require('../graphql/bpmn/deleteProcessTemplate.gql'),
  updateProcessTemplate: require('../graphql/bpmn/updateProcessTemplate.gql'),
}

export default {
  components: {
    NTList,
    PTList,
    PTFilter,
    PIList,
    PIFilter,
    NIList,
    NIFilter,
  },
  apollo: {
    processTemplates: {
      query: gql.processTemplates,
    },
    processInstances: {
      query: gql.processInstances,
    },
    nodeInstances: {
      query: gql.nodeInstances,
    },
  },
  data () {
    return {
      processTemplates: [],
      processInstances: [],
      nodeInstances: [],
    }
  },
}
</script>
