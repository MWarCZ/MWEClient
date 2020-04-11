// @slot extend-process { processTemplate }
// @slot prepend-item { processTemplate }
// @slot append-item { processTemplate }
// @emit action { item, processTemplate }
<template>
  <v-list>
    <v-list-group
      v-for="(process, index) in processTemplates"
      :key="`processTemplate-${index}`"
      :ripple="false"
      append-icon=""
      color=""
      :class="{executable: process.isExecutable, unexecutable: !process.isExecutable}"
    >
      <template #activator>

        <slot name="prepend-item"  :processTemplate="process" />

        <v-list-item-action>
          <PTIcon :isExecutable="process.isExecutable" />
          <span>{{process.id}}</span>
        </v-list-item-action>
        <v-list-item-content>
            <v-list-item-title>{{ getProcessName(process) }}</v-list-item-title>
            <v-list-item-subtitle>{{process.candidateManager}}</v-list-item-subtitle>
        </v-list-item-content>
        <v-list-item-content>
            <v-list-item-title><b>ID:</b> <i>{{process.bpmnId}}</i> </v-list-item-title>
            <v-list-item-title><b>Verze:</b> <i>{{process.version}}</i></v-list-item-title>
        </v-list-item-content>

        <slot name="append-item"  :processTemplate="process" />

        <DotMenu :items="menuItems" @select="emitAction($event, process)" />

      </template>
      <!-- TODO pokud je executable jinak skrit -->
      <slot name="extend-process" :processTemplate="process" />
    </v-list-group>
  </v-list>

</template>

<script>
import DotMenu from '../DotMenu'
import PTIcon from './PT_IconExecutable'

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
    PTIcon,
  },
  props: {
    /**
     * @type {new=>PT[]}
     */
    processTemplates: {
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
    emitAction (item, processTemplate) {
      this.$emit('action', { item, processTemplate })
    },
    getProcessName (process) {
      return process.name ? process.name : '[Nepojmenováno]'
    },
  },
}
</script>
<style lang="scss" scoped>
  .unexecutable {
    background-color: #9e9e9e3b;
  }
  .executable {
    background-color: #3fb53f3b;
  }
</style>
