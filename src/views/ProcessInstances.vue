<template>
  <v-container>
    <PTList
      :processTemplates="processTemplates"
      :menuItems="[]"
      @action="processTemplateActionSwitch"
    >
      <template #extend-process="{ processTemplate }">
        <v-container v-if="processTemplate.instances">
          <PIList
            :processInstances="processTemplate.instances"
            :menuItems="processInstanceMenuItems"
            @action="processInstanceActionSwitch"
          ></PIList>
        </v-container>
      </template>
    </PTList>

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
import PIList from '../components/PIList.vue'
import YesNoDialog from '../components/YesNoDialog'

import { simulateLoading } from '../simulateLoading'

const gql = {
  client: require('../graphql/auth/client.gql'),
  // processTemplates
  processTemplates: require('../graphql/bpmn/processTemplates_PI.gql'),
  deleteProcessInstance: require('../graphql/bpmn/deleteProcessInstance.gql'),
  withdrawnProcess: require('../graphql/bpmn/withdrawnProcess.gql'),
}
/** @typedef MenuItem
 *  @type { {icon:string, title:string, action:string} }
 */

export default {
  components: {
    YesNoDialog, PTList, PIList,
  },
  data () {
    return {
      processTemplates: [],

      selectedProcessTemplate: null,

      msgError: '',
      actionWaiting: false,

      ynDialog: false,
      ynTitle: '',
      ynActionYes: () => {},
      ynActionNo: () => { this.closeYNDialog() },

      /** @type MenuItem[] */
      processInstanceMenuItems: [
        {
          icon: 'mdi-information-outline',
          title: 'Zobrazit',
          action: 'show',
        },
        {
          icon: 'mdi-information-outline',
          title: 'Zobrazit více',
          action: 'showAll',
        },
        {
          icon: 'mdi-undo-variant',
          title: 'Stáhnout/Přerušit',
          action: 'withdrawn',
        },
        {
          icon: 'mdi-delete-forever',
          title: 'Smazat',
          action: 'delete',
        },
      ],
    }
  },
  apollo: {
    processTemplates: {
      query: gql.processTemplates,
    },
  },
  created () {
    console.log('PIs created')
  },
  mounted () {
    console.log('PIs mounted')
    this.$apollo.queries.processTemplates.refetch()
  },
  methods: {
    log () {
      console.log(gql)
    },
    processTemplateActionSwitch (...args) {
      console.log(args)
    },
    processInstanceActionSwitch (action) {
      console.log(action.item.action, action)
      switch (action.item.action) {
        case 'delete':
          this.openYNDialog()
          this.ynTitle = `Chcete trvale smazat instanci procesu (${action.processInstance.id})?`
          this.ynActionYes = () => {
            this.tryActionWrapper(async () => {
              await this.deleteProcess({ id: action.processInstance.id })
              this.closeYNDialog()
            })
          }
          break
        case 'withdrawn':
          this.openYNDialog()
          this.ynTitle = `Chcete stáhnout/přerušit instanci procesu (${action.processInstance.id})?`
          this.ynActionYes = () => {
            this.tryActionWrapper(async () => {
              await this.withdrawnProcess({ id: action.processInstance.id })
              this.closeYNDialog()
            })
          }
          break
        case 'show':
          this.$router.push({ path: `/processinstance/${action.processInstance.id}` })
          break
        case 'showAll':
          this.$router.push({ path: `/processinstance/${action.processInstance.id}/all` })
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

    async deleteProcess ({ id }) {
      console.warn('TODO: deleteProcessInstance')
      await simulateLoading()
      await this.$apollo.mutate({
        mutation: gql.deleteProcessInstance,
        variables: {
          idPI: id,
        },
        update (proxy, { data: { deleteProcessInstance } }) {
          console.log(deleteProcessInstance)
          if (deleteProcessInstance) {
            const data = proxy.readQuery({
              query: gql.processTemplates,
            })
            data.processTemplates.forEach(processT => {
              processT.instances.forEach((processI, index) => {
                if (processI.id === id) {
                  processT.instances.splice(index, 1)
                }
              })
            })
            proxy.writeQuery({
              query: gql.processTemplates,
              data: data,
            })
          } // if (deleteProcessInstance)
        },
      })
    },

    // Withdrawn
    async withdrawnProcess ({ id }) {
      console.warn('TODO: withdrawnProcess')
      await simulateLoading()
      await this.$apollo.mutate({
        mutation: gql.withdrawnProcess,
        variables: {
          idPI: id,
        },
        update (proxy, { data: { withdrawnProcess } }) {
          console.log(withdrawnProcess)
          if (withdrawnProcess) {
            const data = proxy.readQuery({
              query: gql.processTemplates,
            })
            data.processTemplates.forEach(processT => {
              processT.instances.forEach((processI, index) => {
                if (processI.id === id) {
                  processT.instances[index] = {
                    ...processI,
                    ...withdrawnProcess,
                  }
                }
              })
            })
            proxy.writeQuery({
              query: gql.processTemplates,
              data: data,
            })
          } // if (deleteProcessInstance)
        },
      })
    },

  },
}
</script>
