// @slot extend-process { processInstance: PI }
// @slot prepend-item { processInstance: PI }
// @slot append-item { processInstance: PI }
// @emit action { item: MenuItem, processInstance: PI }
<template>
  <v-list>
    <v-list-group
      v-for="(process, index) in processInstances"
      :key="`processInstance-${index}`"
      :ripple="false"
      append-icon=""
      color=""
      :class="getClassByProcessStatus(process.status)"
    >
      <template #activator>

        <slot name="prepend-item"  :processInstance="process" />

        <v-list-item-action>
          <PIIcon :status="process.status" />
          <span>{{process.id}}</span>
        </v-list-item-action>
        <v-list-item-content>
            <v-list-item-title>Započat:</v-list-item-title>
            <v-list-item-subtitle>{{getProcessStart(process)}}</v-list-item-subtitle>
        </v-list-item-content>
        <v-list-item-content>
            <v-list-item-title>Ukončen:</v-list-item-title>
            <v-list-item-subtitle>{{getProcessEnd(process)}}</v-list-item-subtitle>
        </v-list-item-content>

        <slot name="append-item"  :processInstance="process" />

        <DotMenu :items="menuItems" @select="emitAction($event, process)" />

      </template>

      <slot name="extend-process" :processInstance="process" />
    </v-list-group>
  </v-list>

</template>
<script>
import DotMenu from '../DotMenu'
import PIIcon from './PI_IconStatus'

import { ProcessStatus } from '../helpers'
/** @typedef MenuItem
 *  @type { {icon:string, title:string} }
 */

/**
 * @typedef PT
 * @type {{
 *  id: number,
 *  bpmnId: string,
 *  name: string,
 *  isExecutable: boolean,
 *  processType: string,
 *  versionType: string,
 *  version: string,
 *  instances: PI[],
 * }}
 * @typedef PI
 * @type {{
 *  id: number,
 *  startDateTime: string,
 *  endDateTime: string,
 *  status: string,
 *  nodeElements: NI[],
 * }}
 * @typedef NI
 * @type {{
 *  id: number,
 *  startDateTime: string,
 *  endDateTime: string,
 *  status: string,
 *  template: NT,
 *  processInstance: PI
 * }}
 * @typedef NT
 * @type {{
 *  id: number,
 *  bpmnId: string,
 *  name: string,
 *  implementation: string,
 *  candidateAssignee: string,
 * }}
 */

export default {
  components: {
    DotMenu,
    PIIcon,
  },
  props: {
    /**
     * @type {new=>PI[]}
     */
    processInstances: {
      type: Array,
      required: true,
    },

    /**
     * @type {new => MenuItem[]}
     */
    menuItems: {
      type: Array,
      default: () => [],
    },
  },
  methods: {
    emitAction (item, processInstance) {
      this.$emit('action', { item, processInstance })
    },
    getProcessStart (process) {
      return process.startDateTime ? process.startDateTime : '[Nezapočato]'
    },
    getProcessEnd (process) {
      return process.endDateTime ? process.endDateTime : '[Neukončeno]'
    },

    getClassByProcessStatus (status) {
      switch (status) {
        case ProcessStatus.Withdrawn:
          return ''
        case ProcessStatus.Ready:
        case ProcessStatus.Active:
          return 'active'
        case ProcessStatus.Completing:
        case ProcessStatus.Completed:
          return 'completed'
        case ProcessStatus.Falling:
        case ProcessStatus.Failled:
          return 'failled'
        case ProcessStatus.Terminating:
        case ProcessStatus.Terminated:
        default: return 'other'
      }
    },
  },
}
</script>
<style lang="scss" scoped>
  .other {
    background-color: #9e9e9e3b;
  }
  .completed {
    background-color: #3f3fb53b;
  }
  .failled {
    background-color: #ff00002e;
  }
  .active {
    background-color: #3fb53f3b;
  }
</style>
