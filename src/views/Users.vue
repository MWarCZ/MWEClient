<template>
  <v-container>
    <UList
      :users="users"
      :menuItems="userMenuItems"
      @action="userActionSwitch"
    >
    </UList>

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
          @click="userCreateDialog = true"
        > <v-icon x-large>mdi-plus</v-icon> </v-btn>
      </template>
      <span>Vytvořit skupinu.</span>
    </v-tooltip>

    <FullDialog v-model="userCreateDialog" title="Vytvořit nového uživatele." closeable>
      <v-container>
        <v-alert type="error" :value="!!userError">
          {{userError}}
        </v-alert>
        <UEditor
          :loading="actionWaiting"
          />
      </v-container>
    </FullDialog>

  </v-container>
</template>
<script>
import UList from '../components/UList.vue'
import UEditor from '../components/UEditor.vue'
import FullDialog from '../components/FullDialog'

// Query
import gqlClient from '../graphql/auth/client.gql'
import gqlUsers from '../graphql/user/users.gql'

/** @typedef MenuItem
 *  @type { {icon:string, title:string, action:string} }
 *
 * @typedef User
 * @type {{
 *  id: number,
 *  login: string,
 *  email: string,
 *  firstName: string,
 *  lastName: string,
 *  protected: boolean,
 *  locked: boolean,
 *  removed: boolean,
 * }}
 */
export default {
  components: {
    UList,
    UEditor,
    FullDialog,
  },
  data () {
    return {
      client: null,
      users: [],
      userCreateDialog: false,
      userError: '',
      actionWaiting: false,

      /** @type MenuItem[] */
      userMenuItems: [
        {
          icon: 'mdi-account-edit',
          title: 'Upravit',
          action: 'update',
        },
        {
          icon: 'mdi-account-lock',
          title: 'Uzamknou',
          action: 'lock',
        },
        {
          icon: 'mdi-account-key',
          title: 'Odemknout',
          action: 'unlock',
        },
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
    }
  },
  apollo: {
    client () {
      return {
        query: gqlClient,
      }
    },
    users: {
      query: gqlUsers,
    },
  },
  methods: {
    log (...args) {
      console.log(...args)
    },
    userActionSwitch (action) {
      console.log(action.item.action, action)
    },

  },
}
</script>
