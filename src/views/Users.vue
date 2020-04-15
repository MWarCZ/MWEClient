<template>
  <v-container>

    <h1 class="text-center">Uživatelé</h1>

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
          @click="openUserCreateDialog()"
        > <v-icon x-large>mdi-plus</v-icon> </v-btn>
      </template>
      <span>Vytvořit uživatele.</span>
    </v-tooltip>

    <FullDialog v-model="userCreateDialog" title="Vytvořit nového uživatele." closeable>
      <v-container>
        <v-alert type="error" :value="!!msgError">
          {{msgError}}
        </v-alert>
        <UCreateEditor
          :loading="actionWaiting"
          @success="tryCreateUser($event)"
          />
        <UEditor v-if="false"
          :loading="actionWaiting"
          />
      </v-container>
    </FullDialog>

    <FullDialog v-model="userUpdateDialog" title="Upravit uživatele." closeable>
      <v-container>
        <v-alert type="error" :value="!!msgError">
          {{msgError}}
        </v-alert>
        <UEditor v-if="selectedUser" :key="selectedUser.login"
          :loading="actionWaiting"
          :login="selectedUser.login"
          :email="selectedUser.email"
          :firstName="selectedUser.firstName"
          :lastName="selectedUser.lastName"
          readonlyLogin
          submitTitle="Uložit"
          @success="tryUpdateUser($event)"
          />
      </v-container>
    </FullDialog>

    <YesNoDialog v-model="ynDialog" :title="ynTitle"
      :loading="actionWaiting"
      @yes="ynActionYes" @no="ynActionNo"
    >
      <v-alert type="error" :value="!!msgError">
        {{msgError}}
      </v-alert>
    </YesNoDialog>

  </v-container>
</template>
<script>
import UList from '../components/UList.vue'
import UEditor from '../components/UEditor.vue'
import UCreateEditor from '../components/UCreateEditor.vue'
import FullDialog from '../components/FullDialog'
import YesNoDialog from '../components/YesNoDialog'

import { simulateLoading } from '../simulateLoading'

const gql = {
  client: require('../graphql/auth/client.gql'),
  // Group
  groups: require('../graphql/group/groups.gql'),
  // User
  users: require('../graphql/user/users.gql'),
  createUser: require('../graphql/user/createUser.gql'),
  updateUserInfo: require('../graphql/user/updateUserInfo.gql'),
  removeUser: require('../graphql/user/removeUser.gql'),
  deleteUser: require('../graphql/user/deleteUser.gql'),
  recoverUser: require('../graphql/user/recoverUser.gql'),
  lockUser: require('../graphql/user/lockUser.gql'),
  unlockUser: require('../graphql/user/unlockUser.gql'),
}

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
    UCreateEditor,
    YesNoDialog,
  },
  data () {
    return {
      client: null,
      users: [],
      userCreateDialog: false,
      userUpdateDialog: false,

      selectedUser: null,

      msgError: '',
      actionWaiting: false,

      ynDialog: false,
      ynTitle: '',
      ynActionYes: () => {},
      ynActionNo: () => { this.closeYNDialog() },

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
        query: gql.client,
      }
    },
    users: {
      query: gql.users,
    },
  },
  methods: {
    openYNDialog () {
      this.msgError = ''
      this.ynDialog = true
    },
    closeYNDialog () {
      this.msgError = ''
      this.ynDialog = false
    },
    openUserCreateDialog () {
      this.msgError = ''
      this.userCreateDialog = true
    },
    openUserUpdateDialog () {
      this.msgError = ''
      this.userUpdateDialog = true
    },

    userActionSwitch (action) {
      // console.log(action.item.action, action)
      this.selectedUser = action.user
      switch (action.item.action) {
        case 'update':
          this.userUpdateDialog = true
          this.selectedUser = action.user
          break
        case 'recorver':
          this.openYNDialog()
          this.ynTitle = `Chcete obnovit uživatele '${action.user.login}'?`
          this.ynActionYes = () => {
            this.tryActionWrapper(async () => {
              await this.recoverUser({ login: action.user.login })
              this.closeYNDialog()
            })
          }
          break
        case 'remove':
          this.openYNDialog()
          this.ynTitle = `Chcete odstranit uživatele '${action.user.login}'?`
          this.ynActionYes = () => {
            this.tryActionWrapper(async () => {
              await this.removeUser({ login: action.user.login })
              this.closeYNDialog()
            })
          }
          break
        case 'delete':
          this.openYNDialog()
          this.ynTitle = `Chcete trvale smazat uživatele '${action.user.login}'?`
          this.ynActionYes = () => {
            this.tryActionWrapper(async () => {
              await this.deleteUser({ login: action.user.login })
              this.closeYNDialog()
            })
          }
          break
        case 'lock':
          this.openYNDialog()
          this.ynTitle = `Chcete trvale smazat uživatele '${action.user.login}'?`
          this.ynActionYes = () => {
            this.tryActionWrapper(async () => {
              await this.lockUser({ login: action.user.login })
              this.closeYNDialog()
            })
          }
          break
        case 'unlock':
          this.openYNDialog()
          this.ynTitle = `Chcete trvale smazat uživatele '${action.user.login}'?`
          this.ynActionYes = () => {
            this.tryActionWrapper(async () => {
              await this.unlockUser({ login: action.user.login })
              this.closeYNDialog()
            })
          }
          break
      }
    },

    // Funkce s pokusem o provedeni funkce
    async tryActionWrapper (asyncFn, args = []) {
      this.actionWaiting = true
      try {
        await asyncFn(...args)
      } catch (e) {
        this.msgError = (e.message) ? e.message : 'Nepodarilo se.'
        // console.error(e)
      }
      this.actionWaiting = false
    },

    tryCreateUser ({ login, password, firstName = '', lastName = '', email = '' }) {
      return this.tryActionWrapper(async () => {
        await this.createUser({ login, password, firstName, lastName, email })
        this.userCreateDialog = false
        this.msgError = ''
      })
    },
    tryUpdateUser ({ login, firstName, lastName, email }) {
      return this.tryActionWrapper(async () => {
        await this.updateUser({ login, firstName, lastName, email })
        this.userUpdateDialog = false
        this.msgError = ''
      })
    },

    async createUser ({ login, password, firstName = '', lastName = '', email = '' }) {
      await simulateLoading()
      await this.$apollo.mutate({
        mutation: gql.createUser,
        variables: {
          login, password, firstName, lastName, email,
        },
        update (proxy, { data: { createUser } }) {
          if (createUser) {
            const data = proxy.readQuery({
              query: gql.users,
            })
            createUser.membership = []
            data.users.push(createUser)
            proxy.writeQuery({
              query: gql.users,
              data: data,
            })
          } // if (createUser)
        },
      })
    },
    async updateUser ({ login, firstName, lastName, email }) {
      await simulateLoading()
      await this.$apollo.mutate({
        mutation: gql.updateUserInfo,
        variables: {
          login, firstName, lastName, email,
        },
        update (proxy, { data: { updateUserInfo } }) {
          if (updateUserInfo) {
            const data = proxy.readQuery({
              query: gql.users,
            })
            data.users.forEach(user => {
              if (user.login === login) {
                if (typeof firstName === 'string') {
                  user.firstName = firstName
                }
                if (typeof lastName === 'string') {
                  user.lastName = lastName
                }
                if (typeof email === 'string') {
                  user.email = email
                }
              }
            })
            proxy.writeQuery({
              query: gql.users,
              data: data,
            })
          } // if (updateUserInfo)
        },
      })
    },
    async removeUser ({ login }) {
      await simulateLoading()
      await this.$apollo.mutate({
        mutation: gql.removeUser,
        variables: {
          login,
        },
        update (proxy, { data: { removeUser } }) {
          if (removeUser) {
            const data = proxy.readQuery({
              query: gql.users,
            })
            data.users.forEach(user => {
              if (user.login === login) {
                user.removed = true
              }
              return user
            })
            proxy.writeQuery({
              query: gql.users,
              data: data,
            })
          } // if (removeUser)
        },
      })
    },
    async recoverUser ({ login }) {
      await simulateLoading()
      await this.$apollo.mutate({
        mutation: gql.recoverUser,
        variables: {
          login,
        },
        update (proxy, { data: { recoverUser } }) {
          if (recoverUser) {
            const data = proxy.readQuery({
              query: gql.users,
            })
            data.users.forEach(user => {
              if (user.login === login) {
                user.removed = false
              }
              return user
            })
            proxy.writeQuery({
              query: gql.users,
              data: data,
            })
          } // if (recoverUser)
        },
      })
    },
    async deleteUser ({ login }) {
      await simulateLoading()
      await this.$apollo.mutate({
        mutation: gql.deleteUser,
        variables: {
          login,
        },
        update (proxy, { data: { deleteUser } }) {
          if (deleteUser) {
            const data = proxy.readQuery({
              query: gql.users,
            })
            data.users.find((group, index) => {
              if (group.login === login) {
                data.users.splice(index, 1)
                return true
              }
              return false
            })
            proxy.writeQuery({
              query: gql.users,
              data: data,
            })
          } // if (deleteUser)
        },
      })
    },
    async lockUser ({ login }) {
      await simulateLoading()
      await this.$apollo.mutate({
        mutation: gql.lockUser,
        variables: {
          login,
        },
        update (proxy, { data: { lockUser } }) {
          if (lockUser) {
            const data = proxy.readQuery({
              query: gql.users,
            })
            data.users.forEach(user => {
              if (user.login === login) {
                user.locked = true
              }
              return user
            })
            proxy.writeQuery({
              query: gql.users,
              data: data,
            })
          } // if (lockUser)
        },
      })
    },
    async unlockUser ({ login }) {
      await simulateLoading()
      await this.$apollo.mutate({
        mutation: gql.unlockUser,
        variables: {
          login,
        },
        update (proxy, { data: { unlockUser } }) {
          if (unlockUser) {
            const data = proxy.readQuery({
              query: gql.users,
            })
            data.users.forEach(user => {
              if (user.login === login) {
                user.locked = false
              }
              return user
            })
            proxy.writeQuery({
              query: gql.users,
              data: data,
            })
          } // if (unlockUser)
        },
      })
    },

  },
}
</script>
