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
            @action="1"
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

// import { simulateLoading } from '../simulateLoading'

const gql = {
  client: require('../graphql/auth/client.gql'),
  // processTemplates
  processTemplates: require('../graphql/bpmn/processTemplates_PI.gql'),
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
      processInstanceMenuItems: [],
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
        // case 'init':
        //   this.openYNDialog()
        //   this.ynTitle = `Chcete spustit proces '${action.processTemplate.name}' na události '${action.nodeTemplate.name}'?`
        //   this.ynActionYes = () => {
        //     this.tryActionWrapper(async () => {
        //       await this.initProcess({
        //         idProcessTemplate: action.processTemplate.id,
        //         idNodeTemplate: action.nodeTemplate.id,
        //       })
        //       this.closeYNDialog()
        //     })
        //   }
        //   break
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

  },
}
</script>
