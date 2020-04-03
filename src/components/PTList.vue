<template>
  <v-list>
    <v-list-group
      v-for="(process, index) in processTemplates"
      :key="`processTemplate-${index}`"
      :id="`${process.id}`"
      :ripple="false"
      append-icon=""
      color=""
    >
      <template #activator>
        <v-list-item-action>
          <v-tooltip bottom>
            <template #activator="{on}">
              <v-icon v-on="on" v-if="process.isExecutable">mdi-book</v-icon>
              <v-icon v-on="on" v-else>mdi-book-lock</v-icon>
            </template>
          </v-tooltip>
        </v-list-item-action>
        <v-list-item-content>
          <v-list-item-title>xxx</v-list-item-title>
          <v-list-item-subtitle>xxx</v-list-item-subtitle>
        </v-list-item-content>
      </template>
      <slot name="extend-process" :processTemplate="processTemplate" />
    </v-list-group>
  </v-list>

</template>
<script>

/** @typedef MenuItem
 *  @type { {icon:string, title:string} }
 */

export default {

  props: {
    /**
     * @type new => {
     *  id: number,
     *  bpmnId: string,
     *  name: string,
     *  isExecutable: boolean,
     *  processType: string,
     *  versionType: string,
     *  version: string,
     * }[]
     */
    processTemplates: {
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
    emitAction (item, processTemplate, nodeTemplate) {
      this.$emit('action', { item, processTemplate, nodeTemplate })
    },
  },
}
</script>
