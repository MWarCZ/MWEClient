<template>
  <v-container>
    <div v-if="client">OK</div>
    <div v-else>KO</div>
    <GList
      :groups="groups"
      :menuItems="groupMenuItems"
      @action="log"
      >
      <template #extend-group="{ group }">
        <v-container text-center>
          <v-tooltip bottom>
            <template #activator="{on}">
              <v-btn fab small
                color="primary"
                v-on="on"
                @click="1"
              > <v-icon>mdi-plus</v-icon> </v-btn>
            </template>
            <span>Přidat uživatele do skupiny.</span>
          </v-tooltip>
        </v-container>
        <GMList v-if="group"
          :members="group.members || []"
          :menuItems="memberMenuItems"
          @action="log"
          />
      </template>
    </GList>
    <v-tooltip left>
      <template #activator="{on}">
        <v-btn
          fab
          color="primary"
          v-on="on"
          fixed
          right
          bottom
          x-large
          @click="1"
        > <v-icon x-large>mdi-plus</v-icon> </v-btn>
      </template>
      <span>Vytvořit skupinu.</span>
    </v-tooltip>
    <FullDialog v-model="dialog">
      <v-card>
        <v-btn @click="dialog = false" color="success">Close</v-btn>
      </v-card>
    </FullDialog>
  </v-container>
</template>

<script>
// import ListGroups from '../components/ListGroupsWithFilter.vue'
import GList from '../components/GList.vue'
import GMList from '../components/GMList.vue'
import FullDialog from '../components/FullDialog'
import gqlClient from '../graphql/Client.gql'
import gqlGroups from '../graphql/Groups.gql'

/** @typedef MenuItem
 *  @type { {icon:string, title:string, action:string} }
 */

export default {
  name: 'GroupsView',
  components: {
    // ListGroups,
    GList,
    GMList,
    FullDialog,
  },
  data: () => ({
    client: null,
    groups: [],
    dialog: true,
    /** @type MenuItem[] */
    groupMenuItems: [
      {
        icon: 'mdi-account-off-outline',
        title: 'Odstranit',
        action: 'remove',
      },
      {
        icon: 'mdi-account',
        title: 'Obnovit',
        action: 'recorver',
      },
      {
        icon: 'mdi-delete-forever',
        title: 'Smazat',
        action: 'delete',
      },
    ],
    /** @type MenuItem[] */
    memberMenuItems: [
      {
        icon: 'mdi-minus-circle-outline',
        title: 'Odebrat uzivatele',
        action: 'remove',
      },
      {
        icon: 'mdi-eye',
        title: 'Přidat práva vidět členy',
        action: 'setShow',
      },
      {
        icon: 'mdi-eye-outline',
        title: 'Odebrat práva vidět členy',
        action: 'unsetShow',
      },
      {
        icon: 'mdi-account-multiple-plus',
        title: 'Přidat práva pridavat členy',
        action: 'setAdd',
      },
      {
        icon: 'mdi-account-multiple-plus-outline',
        title: 'Odebrat práva pridavat členy',
        action: 'unsetAdd',
      },
      {
        icon: 'mdi-account-multiple-minus',
        title: 'Přidat práva odebrat členy',
        action: 'setRemove',
      },
      {
        icon: 'mdi-account-multiple-minus-outline',
        title: 'Odebrat práva odebrat členy',
        action: 'UnsetRemove',
      },
    ],
  }),
  apollo: {
    client () {
      return {
        query: gqlClient,
      }
    },
    groups: {
      query: gqlGroups,
    },
  },
  methods: {
    log (...args) {
      console.log(...args)
    },
    createGroup () {

    },
  },
}
</script>
