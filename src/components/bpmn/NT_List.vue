// @slot extend-node { nodeTemplate }
// @slot prepend-item { nodeTemplate }
// @slot append-item { nodeTemplate }
// @emit action { item, nodeTemplate }
<template>
  <v-list>
    <v-list-group
      v-for="(node, index) in nodeTemplates"
      :key="`nodeTemplate-${index}`"
      :ripple="false"
      append-icon=""
      color=""
    >
      <template #activator>

        <slot name="prepend-item" :nodeTemplate="node" />

        <v-list-item-action>
          <NTIcon :implementation="node.implementation" />
          <span>{{node.id}}</span>
        </v-list-item-action>
        <v-list-item-content>
            <v-list-item-title>
              {{getNodeName(node)}}
            </v-list-item-title>
            <v-list-item-subtitle>{{node.candidateAssignee}}</v-list-item-subtitle>
        </v-list-item-content>

        <slot name="append-item" :nodeTemplate="node" />

        <DotMenu :items="menuItems" @select="emitAction($event, node)" />

      </template>
      <slot name="extend-node" :nodeTemplate="node" />
    </v-list-group>
  </v-list>

</template>
<script>
import DotMenu from '../DotMenu'
import NTIcon from './NT_IconImp'

/** @typedef MenuItem
 *  @type { {icon:string, title:string} }
 */
/**
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
    NTIcon,
  },
  props: {
    /**
     * @type {new=>NT[]}
     */
    nodeTemplates: {
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
  methods: {
    emitAction (item, nodeTemplate) {
      this.$emit('action', { item, nodeTemplate })
    },
    getNodeName (node) {
      return node.name ? node.name : '[Nepojmenováno]'
    },
  },
}
</script>
