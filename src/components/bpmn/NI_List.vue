// @slot extend-node { nodeInstance }
// @slot prepend-item { nodeInstance }
// @slot append-item { nodeInstance }
// @emit action { item, nodeInstance }
<template>
  <v-list>
    <v-list-group
      v-for="(node, index) in nodeInstances"
      :key="`nodeInstance-${index}`"
      :ripple="false"
      append-icon=""
      color=""
      :class="getClassByNodeStatus(node.status)"
    >
      <template #activator>

        <slot name="prepend-item"  :nodeInstance="node" />
        <slot :nodeInstance="node" >
          <v-list-item-action>
            <NIIcon :status="node.status" />
            <span>{{node.id}}</span>
          </v-list-item-action>
          <v-list-item-content>
              <v-list-item-title>Započat:</v-list-item-title>
              <v-list-item-subtitle>{{getNodeStart(node)}}</v-list-item-subtitle>
          </v-list-item-content>
          <v-list-item-content>
              <v-list-item-title>Ukončen:</v-list-item-title>
              <v-list-item-subtitle>{{getNodeEnd(node)}}</v-list-item-subtitle>
          </v-list-item-content>
        </slot>

        <slot name="append-item"  :nodeInstance="node" />

        <DotMenu :items="menuItems" @select="emitAction($event, node)" />

      </template>

      <slot name="extend-node" :nodeInstance="node" />
    </v-list-group>
  </v-list>

</template>
<script>
import DotMenu from '../DotMenu'
import NIIcon from './NI_IconStatus'

import { ActivityStatus } from '../helpers'
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
    NIIcon,
  },
  props: {
    /**
     * @type {new=>NI[]}
     */
    nodeInstances: {
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
    getNodeStart (node) {
      return node.startDateTime ? node.startDateTime : '[Nezapočato]'
    },
    getNodeEnd (node) {
      return node.endDateTime ? node.endDateTime : '[Neukončeno]'
    },

    getClassByNodeStatus (status) {
      switch (status) {
        case ActivityStatus.Withdrawn:
          return ''
        case ActivityStatus.Waiting:
          return 'waiting'
        case ActivityStatus.Ready:
        case ActivityStatus.Active:
          return 'active'
        case ActivityStatus.Completing:
        case ActivityStatus.Completed:
          return 'completed'
        case ActivityStatus.Falling:
        case ActivityStatus.Failled:
          return 'failled'
        case ActivityStatus.Terminating:
        case ActivityStatus.Terminated:
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
  .waiting {
    background-color: #b5b33f3b;
  }
</style>
