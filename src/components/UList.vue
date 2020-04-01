// @emit action @param { item, user }
<template>
  <v-list>
    <v-list-group
      v-for="(user, index) in users"
      :key="`user-${index}`"
      :id="`${user.login}`"
      :class="{
        removed: user.removed,
        protected: user.protected,
        locked: user.locked,
        normal: !user.removed && !user.protected && !user.locked,
      }"
      :ripple="false"
      append-icon=""
    >
      <template #activator>

        <v-list-item-action>
          <v-tooltip bottom>
            <template #activator="{on}">
              <v-icon v-on="on" v-if="user.protected">mdi-shield</v-icon>
              <v-icon v-on="on" v-else-if="user.removed">mdi-account-off-outline</v-icon>
              <v-icon v-on="on" v-else-if="user.locked">mdi-lock</v-icon>
              <v-icon v-on="on" v-else>mdi-account</v-icon>
            </template>
            <span v-if="user.protected">Uživatel je chráněn před úpravami.</span>
            <span v-else-if="user.removed">Uživatel je smazán.</span>
            <span v-else-if="user.locked">Uživatel je uzamknut.</span>
            <span v-else>Obyčejný uživatel.</span>
          </v-tooltip>
        </v-list-item-action>

        <v-list-item-content>
          <v-list-item-title v-text="`[${user.login}] ${user.lastName} ${user.firstName}`" />
          <v-list-item-subtitle v-html="user.email" />
        </v-list-item-content>

        <DotMenu :items="menuItems" @select="emitAction($event, user)" />

        <slot name="append-user" :user="user" />
      </template>
      <v-container>
        <slot name="extend-user" :user="user" />
      </v-container>

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
     *  login: string,
     *  email: string,
     *  firstName: string,
     *  lastName: string,
     *  protected: boolean,
     *  locked: boolean,
     *  removed: boolean,
     * }[]
     */
    users: {
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
    emitAction (item, user) {
      this.$emit('action', { item, user })
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
  .locked {
    background-color: #9e9e9e3b;
  }
  .normal {
    background-color: #3fb53f3b;
  }
</style>
