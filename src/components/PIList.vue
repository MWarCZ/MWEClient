<template>
  <v-list>
    <v-list-group
      v-for="(process, index) in processInstances"
      :key="`processInstance-${index}`"
      :ripple="false"
      append-icon=""
      color=""
    >
      <template #activator>
        <v-list-item-action>
          <v-tooltip bottom>
            <template #activator="{on}">
              <v-icon v-on="on">{{getDataByProcessStatus(process.status).icon}}</v-icon>
            </template>
            <span>{{getDataByProcessStatus(process.status).title}}</span>
          </v-tooltip>
          <span>{{process.id}}</span>
        </v-list-item-action>
        <v-list-item-content>
            <v-list-item-title>Start:</v-list-item-title>
            <v-list-item-subtitle>
              {{(process.startDateTime)?process.startDateTime:'Neuvedeno'}}
            </v-list-item-subtitle>
        </v-list-item-content>
        <v-list-item-content>
            <v-list-item-title>Konec:</v-list-item-title>
            <v-list-item-subtitle>
              {{(process.endDateTime)?process.endDateTime:'Neuvedeno'}}
            </v-list-item-subtitle>
        </v-list-item-content>

        <DotMenu :items="menuItems" @select="emitAction($event, process)" />

      </template>
      <slot name="extend-process" :processInstance="process" />
    </v-list-group>
  </v-list>

</template>
<script>
import DotMenu from './DotMenu'

/** @typedef MenuItem
 *  @type { {icon:string, title:string} }
 */

const ProcessStatus = {
  None: 'None',
  Ready: 'Ready',
  Active: 'Active',
  Completing: 'Completing',
  Completed: 'Completed',
  Falling: 'Falling',
  Failled: 'Failled',
  Terminating: 'Terminating',
  Terminated: 'Terminated',
  Withdrawn: 'Withdrawn',
}

export default {
  components: {
    DotMenu,
  },
  props: {
    /**
     * @type new => {
     *  id: number,
     *  startDateTime: string,
     *  endDateTime: string,
     *  status: string,
     * }[]
     */
    processInstances: {
      type: Array,
      required: true,
    },

    /**
     * @type new => MenuItem[]
     */
    menuItems: {
      type: Array,
      default: () => [],
    },
  },
  data () {
    return {
      ProcessStatus,
    }
  },
  methods: {
    emitAction (item, processInstance) {
      this.$emit('action', { item, processInstance })
    },
    /**
     * @param {string} status
     * @returns {{icon:string, title:string}}
    */
    getDataByProcessStatus (status) {
      const title = `Stav: ${status}`
      switch (status) {
        case ProcessStatus.Withdrawn:
          return { icon: 'mdi-circle-off', title }

        case ProcessStatus.Active:
          return { icon: 'mdi-arrow-right-drop-circle', title }

        case ProcessStatus.Terminating:
          return { icon: 'mdi-alert-circle-check-outline', title }
        case ProcessStatus.Terminated:
          return { icon: 'mdi-alert-circle-check', title }

        case ProcessStatus.Completing:
          return { icon: 'mdi-briefcase-check-outline', title }
        case ProcessStatus.Completed:
          return { icon: 'mdi-briefcase-check', title }

        case ProcessStatus.Falling:
          return { icon: 'mdi-alert-outline', title }
        case ProcessStatus.Failled:
          return { icon: 'mdi-alert', title }

        default: return { icon: 'mdi-comment-question-outline', title }
      }
    },
  },
}
</script>
