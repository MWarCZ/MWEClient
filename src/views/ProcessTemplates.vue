<template>
  <v-container>
    <PTList
      :processTemplates="processTemplates"
      :menuItems="[]"
      @action="processTemplateActionSwitch"
    >
    </PTList>

    <v-tooltip left>
      <template #activator="{on}">
        <v-btn
          fab
          color="primary"
          v-on="on"
          fixed
          right
          bottom
          x-large
          @click="openUploadProcessDialog()"
        > <v-icon x-large>mdi-plus</v-icon> </v-btn>
      </template>
      <span>Nahrát šablonu procesu.</span>
    </v-tooltip>

    <FullDialog v-model="uploadProcessDialog" title="Nahrát šablonu procesu" closeable>
      <v-container>
        <v-alert type="error" :value="!!msgError">
          {{msgError}}
        </v-alert>
        <PTUploader :key="`dialog-${uploadProcessDialog}`"
          :loading="actionWaiting"
          @success="tryUploadProcess"
        ></PTUploader>
      </v-container>
    </FullDialog>

    <YesNoDialog v-model="ynDialog" :title="ynTitle"
      :loading="actionWaiting"
      @yes="ynActionYes" @no="ynActionNo"
    >
      <v-alert type="error" :value="!!msgError">
        {{msgError}}
      </v-alert>
    </YesNoDialog>

  </v-container>
</template>
<script>
import PTList from '../components/PTList.vue'
import PTUploader from '../components/PTUploader'
import FullDialog from '../components/FullDialog'
import YesNoDialog from '../components/YesNoDialog'

import { simulateLoading } from '../simulateLoading'

const gql = {
  client: require('../graphql/auth/client.gql'),
  // processTemplates
  processTemplates: require('../graphql/bpmn/processTemplates.gql'),
  uploadProcess: require('../graphql/bpmn/uploadProcess.gql'),
  initProcess: require('../graphql/bpmn/initProcess.gql'),
}
export default {
  components: {
    YesNoDialog, FullDialog, PTList, PTUploader,
  },
  data () {
    return {
      processTemplates: [],

      uploadProcessDialog: false,

      selectedProcessTemplate: null,

      msgError: '',
      actionWaiting: false,

      ynDialog: false,
      ynTitle: '',
      ynActionYes: () => {},
      ynActionNo: () => { this.closeYNDialog() },
    }
  },
  apollo: {
    processTemplates: {
      query: gql.processTemplates,
    },
  },
  methods: {
    log () {
      console.log(gql)
    },
    processTemplateActionSwitch (...args) {
      console.log(args)
    },
    openUploadProcessDialog () {
      this.msgError = ''
      this.uploadProcessDialog = true
    },

    // Funkce s pokusem o provedeni funkce
    async tryActionWrapper (asyncFn, args = []) {
      this.actionWaiting = true
      try {
        await asyncFn(...args)
      } catch (e) {
        this.msgError = (e.message) ? e.message : 'Nepodarilo se.'
        console.error(e)
      }
      this.actionWaiting = false
    },

    tryUploadProcess ({ bpmnText }) {
      return this.tryActionWrapper(async () => {
        await this.uploadProcess({ xml: bpmnText })
        this.uploadProcessDialog = false
        this.msgError = ''
      })
    },

    async uploadProcess ({ xml }) {
      console.warn('TODO: uploadProcess')
      await simulateLoading()
      await this.$apollo.mutate({
        mutation: gql.uploadProcess,
        variables: {
          xml,
        },
        update (proxy, { data: { uploadProcess } }) {
          console.log(uploadProcess)
          if (uploadProcess) {
            const data = proxy.readQuery({
              query: gql.processTemplates,
            })
            // createUser.membership = []
            data.processTemplates.push(...uploadProcess)
            proxy.writeQuery({
              query: gql.processTemplates,
              data: data,
            })
          } // if (uploadProcess)
        },
      })
    },
  },
}
</script>
