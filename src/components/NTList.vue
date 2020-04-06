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
        <v-list-item-action>
          <v-tooltip bottom>
            <template #activator="{on}">
              <v-icon v-on="on"
                v-if="nodeImpContains(node, 'start')"
              >
                mdi-circle-outline
              </v-icon>
              <v-icon v-on="on" v-else>mdi-crosshairs-question</v-icon>
            </template>
            <span>{{node.implementation}}</span>
          </v-tooltip>
        </v-list-item-action>
        <v-list-item-content>
            <v-list-item-title>
              {{node.id}}:
              {{(node.name)?node.name:'Nepojmenováno'}}
            </v-list-item-title>
            <v-list-item-subtitle>{{node.candidateAssignee}}</v-list-item-subtitle>
        </v-list-item-content>

        <DotMenu :items="menuItems" @select="emitAction($event, node)" />

      </template>
      <slot name="extend-node" :nodeTemplate="node" />
    </v-list-group>
  </v-list>

</template>
<script>
import DotMenu from './DotMenu'

/** @typedef MenuItem
 *  @type { {icon:string, title:string} }
 */

export default {
  components: {
    DotMenu,
  },
  props: {
    /**
     * @type new => {
     *  id: number,
     *  bpmnId: string
     *  name: string
     *  implementation: string
     *  candidateAssignee: string
     * }[]
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
    nodeImpContains (node, text) {
      return node.implementation.toLowerCase().includes(text)
    },
  },
}
</script>
