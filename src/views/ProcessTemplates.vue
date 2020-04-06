<template>
  <v-container>
    <PTList
      :processTemplates="processTemplates"
      :menuItems="[]"
      @action="processTemplateActionSwitch"
    >
      <template #extend-process="{ processTemplate }">
        <v-container v-if="processTemplate.isExecutable && processTemplate.nodeElements">
          <NTList :nodeTemplates="processTemplate.nodeElements"
            :menuItems="nodeMenuItems"
            @action="nodeTemplateActionSwitch({...$event, processTemplate})"
          ></NTList>
        </v-container>
      </template>
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
import NTList from '../components/NTList.vue'
import PTUploader from '../components/PTUploader'
import FullDialog from '../components/FullDialog'
import YesNoDialog from '../components/YesNoDialog'

import { simulateLoading } from '../simulateLoading'

const gql = {
  client: require('../graphql/auth/client.gql'),
  // processTemplates
  processTemplates: require('../graphql/bpmn/processTemplates_NTStart.gql'),
  uploadProcess: require('../graphql/bpmn/uploadProcess.gql'),
  initProcess: require('../graphql/bpmn/initProcess.gql'),
}
/** @typedef MenuItem
 *  @type { {icon:string, title:string, action:string} }
 */

export default {
  components: {
    YesNoDialog, FullDialog, PTList, PTUploader, NTList,
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

      /** @type MenuItem[] */
      nodeMenuItems: [{
        icon: 'mdi-play-circle-outline',
        title: 'Spustit zde',
        action: 'init',
      }],
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
    nodeTemplateActionSwitch (action) {
      console.log(action.item.action, action)
      switch (action.item.action) {
        case 'init':
          this.openYNDialog()
          this.ynTitle = `Chcete spustit proces '${action.processTemplate.name}' na události '${action.nodeTemplate.name}'?`
          this.ynActionYes = () => {
            this.tryActionWrapper(async () => {
              await this.initProcess({
                idProcessTemplate: action.processTemplate.id,
                idNodeTemplate: action.nodeTemplate.id,
              })
              this.closeYNDialog()
            })
          }
          break
      }
    },

    openYNDialog () {
      this.msgError = ''
      this.ynDialog = true
    },
    closeYNDialog () {
      this.msgError = ''
      this.ynDialog = false
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

    async initProcess ({ idProcessTemplate, idNodeTemplate }) {
      console.warn('TODO: initProcess')
      await simulateLoading()
      await this.$apollo.mutate({
        mutation: gql.initProcess,
        variables: {
          idProcessTemplate, idNodeTemplate,
        },
      })
    },
  },
}
</script>
