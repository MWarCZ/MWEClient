// @emit action @param { item, group }
<template>
  <v-list>
    <v-list-group
      v-for="(group, index) in groups"
      :key="`group-${index}`"
      :class="{
        removed: group.removed,
        protected: group.protected,
        normal: !group.removed && !group.protected,
      }"
      :ripple="false"
      append-icon=""
      color=""
    >
      <template #activator>

        <v-list-item-action>
          <v-tooltip bottom>
            <template #activator="{on}">
              <v-icon v-on="on" v-if="group.protected">mdi-shield</v-icon>
              <v-icon v-on="on" v-else-if="group.removed">mdi-account-off-outline</v-icon>
              <v-icon v-on="on" v-else>mdi-account</v-icon>
            </template>
            <span v-if="group.protected">Skupina je chráněná před úpravami.</span>
            <span v-else-if="group.removed">Skupina je smazána.</span>
            <span v-else>Obyčejná skupina.</span>
          </v-tooltip>
        </v-list-item-action>

        <v-list-item-content>
          <v-list-item-title v-text="group.name" />
          <v-list-item-subtitle v-html="group.describe" />
        </v-list-item-content>

        <DotMenu :items="menuItems" @select="emitAction($event, group)" />

        <slot name="append-group" :group="group" />
      </template>
        <slot name="extend-group" :group="group" />

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
     *  name: string,
     *  describe: string,
     *  protected: boolean,
     *  removed: boolean,
     * }[]
     */
    groups: {
      type: Array,
      required: true,
    },
    /**
     * @type new => {
     *  id: number,
     *  login: string,
     *  email: string,
     *  firstName: string,
     *  lastName: string,
     *  protected: boolean,
     *  locked: boolean,
     *  removed: boolean,
     * }[]
     */
    client: {},

    /**
     * @type new => MenuItem[]
     */
    menuItems: {
      type: Array,
      default: () => [],
    },
  },
  methods: {
    emitAction (item, group) {
      this.$emit('action', { item, group })
    },
  },

}
</script>
<style lang="scss" scoped>
  .removed {
    background-color: #ff00002e;
  }
  .protected {
    background-color: #3f3fb53b;
  }
  .normal {
    background-color: #3fb53f3b;
  }
</style>
