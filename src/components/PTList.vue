<template>
  <v-list>
    <v-list-group
      v-for="(process, index) in processTemplates"
      :key="`processTemplate-${index}`"
      :id="`${process.id}`"
      :ripple="false"
      append-icon=""
      color=""
      :class="{executable: process.isExecutable, unexecutable: !process.isExecutable}"
    >
      <template #activator>
        <v-list-item-action>
          <v-tooltip bottom>
            <template #activator="{on}">
              <v-icon v-on="on" v-if="process.isExecutable">mdi-book-play</v-icon>
              <v-icon v-on="on" v-else>mdi-book-lock</v-icon>
            </template>
            <span v-if="process.isExecutable">Proces je možné spustit.</span>
            <span v-else>Proces není možné spustit.</span>
          </v-tooltip>
        </v-list-item-action>
        <v-list-item-content>
            <v-list-item-title>{{(process.name)?process.name:'Nepojmenováno'}}</v-list-item-title>
            <v-list-item-subtitle>{{process.id}}</v-list-item-subtitle>
        </v-list-item-content>
        <v-list-item-content>
            <v-list-item-title><b>ID:</b> <i>{{process.bpmnId}}</i> </v-list-item-title>
            <v-list-item-title>Verze: {{process.version}}</v-list-item-title>
        </v-list-item-content>

        <DotMenu :items="menuItems" @select="emitAction($event, process)" />

      </template>
      <!-- TODO pokud je executable jinak skrit -->
      <slot name="extend-process" :processTemplate="process" />
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
      this.$emit('action', { item, processTemplate })
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
