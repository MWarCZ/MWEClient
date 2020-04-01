// @emit action @param { item, member }
<template>
  <v-list>
    <template v-for="(member, index) in members">

      <v-list-item :key="`member-${index}`">
        <slot name="prepend-item-logo" :member="member"></slot>
        <v-list-item-action>
          <v-tooltip bottom>

            <template #activator="{on}">
              <v-icon v-on="on" v-if="member.protected">mdi-shield</v-icon>
              <v-icon v-on="on" v-else>mdi-handcuffs</v-icon>
            </template>

            <span v-if="member.protected">Chráněný člen (Nelze odebrat ze skupiny).</span>
            <span v-else>Obyčejný člen skupiny.</span>

          </v-tooltip>
        </v-list-item-action>
        <slot name="append-item-logo" :member="member"></slot>

        <v-list-item-content v-if="member.user">
          <v-list-item-title>
            <slot name="prepend-item-title" :member="member"></slot>
            [<b>{{member.user.login}}</b>] {{member.user.lastName}} {{member.user.firstName}}
            <slot name="append-item-title" :member="member"></slot>
          </v-list-item-title>
        </v-list-item-content>

        <v-tooltip bottom>
          <template #activator="{on}">
            <v-icon v-on="on" left color="success" v-if="member.showMembers">mdi-eye</v-icon>
            <v-icon v-on="on" left color="error" v-else>mdi-eye-outline</v-icon>
          </template>
          <span v-if="member.showMembers">Vidí ostatni uživatele ve skupině.</span>
          <span v-else>Nevidí ostatni uživatele ve skupině.</span>
        </v-tooltip>

        <v-tooltip bottom>
          <template #activator="{on}">
            <v-icon v-on="on" left color="success" v-if="member.addMember">mdi-account-multiple-plus</v-icon>
            <v-icon v-on="on" left color="error" v-else>mdi-account-multiple-plus-outline</v-icon>
          </template>
          <span v-if="member.addMember">Může přidavat uživatele do skupiny.</span>
          <span v-else>Nemůže přidavat uživatele do skupiny.</span>
        </v-tooltip>

        <v-tooltip bottom>
          <template #activator="{on}">
            <v-icon v-on="on" left color="success" v-if="member.removeMember">mdi-account-multiple-minus</v-icon>
            <v-icon v-on="on" left color="error" v-else>mdi-account-multiple-minus-outline</v-icon>
          </template>
          <span v-if="member.removeMember">Může odebírat uživatele ze skupiny.</span>
          <span v-else>Nemůže odebírat uživatele ze skupiny.</span>
        </v-tooltip>

        <DotMenu :items="menuItems" @select="emitAction($event, member)" />

      </v-list-item>

    </template>
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
     *  user: { id: number, firstName: string, lastName: string, login: string},
     *  protected: boolean,
     *  addMember: boolean,
     *  removeMember: boolean,
     *  showMembers: boolean,
     * }[]
     */
    members: {
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
    emitAction (item, member) {
      this.$emit('action', { item, member })
    },
  },
}
</script>
