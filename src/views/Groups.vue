<template>
  <v-container>
    <div v-if="client">OK</div>
    <div v-else>KO</div>
    <GList
      :groups="groups"
      :menuItems="groupMenuItems"
      @action="groupActionSwitch"
      >

      <template #extend-group="{ group }">
        <v-container text-center>
          <v-toolbar>
            <v-autocomplete
              label="Přidat uživatele do skupiny"
              :items="usersNonMemberProvider(group.members)"
              v-model="selectedUser"
              clearable
            ></v-autocomplete>
            <v-spacer></v-spacer>
            <v-tooltip bottom>
              <template #activator="{on}">
                <div>
                  <v-progress-circular v-if="actionWaiting" indeterminate />
                  <v-btn v-else
                    :disabled="!selectedUser"
                    fab small
                    color="primary"
                    v-on="on"
                    @click="shortcutTryAddMember(group.name, selectedUser.login)"
                  > <v-icon>mdi-plus</v-icon> </v-btn>
                </div>
              </template>
              <span>Přidat uživatele do skupiny.</span>
            </v-tooltip>
          </v-toolbar>
        </v-container>

        <GMList v-if="group"
          :members="group.members || []"
          :menuItems="memberMenuItems"
          @action="memberActionSwitch(group, $event)"
        >
          <template #append-item-title="{member}">
            <v-tooltip bottom>
              <template #activator="{on}">
                <v-btn v-on="on" icon :to="`/users#${member.user.login}`">
                  <v-icon>mdi-account-search</v-icon>
                </v-btn>
              </template>
              <span>Přejit na uživatele '{{member.user.login}}'</span>
            </v-tooltip>
          </template>
        </GMList>

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
          @click="groupCreateDialog = true"
        > <v-icon x-large>mdi-plus</v-icon> </v-btn>
      </template>
      <span>Vytvořit skupinu.</span>
    </v-tooltip>

    <FullDialog v-model="groupCreateDialog" title="Vytvořit novou skupinu" closeable>
      <v-container>
        <v-alert type="error" :value="!!groupError">
          {{groupError}}
        </v-alert>
        <GEditor
          name=""
          describe=""
          :loading="actionWaiting"
          @success="tryCreateGroup($event.name, $event.describe)"
          />
      </v-container>
    </FullDialog>

    <FullDialog v-model="groupUpdateDialog" title="Upravit skupinu" closeable>
      <v-container>
        <v-alert type="error" :value="!!groupError">
          {{groupError}}
        </v-alert>
        <GEditor v-if="selectedGroup"
          :name="selectedGroup.name"
          :describe="selectedGroup.describe"
          readonlyName
          submitTitle="Uložit"
          :loading="actionWaiting"
          @success="tryUpdateGroup($event.name, $event.describe)"
          />
      </v-container>
    </FullDialog>

    <FullDialog v-model="addMembersDialog" title="Vytvořit novou skupinu" closeable>
      <v-container>
        <v-alert type="error" :value="!!groupError">
          {{groupError}}
        </v-alert>
        <GMEditor
          name=""
          describe=""
          :loading="actionWaiting"
          @success="tryCreateGroup($event.name, $event.describe)"
          />
      </v-container>
    </FullDialog>

    <YesNoDialog v-model="ynDialog" :title="ynTitle"
      :loading="actionWaiting"
      @yes="ynActionYes" @no="ynActionNo"
    >
      <v-alert type="error" :value="!!groupError">
        {{groupError}}
      </v-alert>
    </YesNoDialog>

  </v-container>
</template>

<script>
import GList from '../components/GList.vue'
import GEditor from '../components/GEditor.vue'
import GMList from '../components/GMList.vue'
import FullDialog from '../components/FullDialog'
import YesNoDialog from '../components/YesNoDialog'

// Query
import gqlClient from '../graphql/auth/client.gql'
import gqlGroups from '../graphql/group/groups.gql'
import gqlUsers from '../graphql/user/users.gql'
// Mutation group
import gqlRemoveGroup from '../graphql/group/removeGroup.gql'
import gqlRecoverGroup from '../graphql/group/recoverGroup.gql'
import gqlCreateGroup from '../graphql/group/createGroup.gql'
import gqlDeleteGroup from '../graphql/group/deleteGroup.gql'
import gqlUpdateGroupInfo from '../graphql/group/updateGroupInfo.gql'
// Mutation member
import gqlUpdateMember from '../graphql/member/updateMember.gql'
import gqlAddMember from '../graphql/member/addMember.gql'
import gqlRemoveMember from '../graphql/member/removeMember.gql'

import { simulateLoading } from '../simulateLoading'

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
  name: 'GroupsView',
  components: {
    // ListGroups,
    GList,
    GMList,
    FullDialog,
    GEditor,
    YesNoDialog,
  },
  data () {
    return {
      client: null,
      groups: [],
      /** @type {User[]} */
      users: [],

      // Cekani na odpoved serveru - vyuzito v dialozich
      actionWaiting: false,
      groupError: '',
      selectedGroup: null,
      selectedMember: null,
      selectedUser: null,

      groupCreateDialog: false,
      groupUpdateDialog: false,
      addMembersDialog: false,

      ynDialog: false,
      ynTitle: '',
      ynActionYes: () => {},
      ynActionNo: () => { this.closeYNDialog() },

      /** @type MenuItem[] */
      groupMenuItems: [
        {
          icon: 'mdi-account-edit',
          title: 'Upravit',
          action: 'update',
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
          action: 'unsetRemove',
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
    groups: {
      query: gqlGroups,
    },
    users: {
      query: gqlUsers,
    },
  },
  methods: {
    log (...args) {
      console.log(...args)
    },

    /** @param {{user?:User}[]} members */
    usersNonMemberProvider (members = []) {
      const skipUsers = members.map(member => member.user)
      return this.usersProvider(skipUsers)
    },
    /** @param {User[]} skipUsers */
    usersProvider (skipUsers = []) {
      const skipLogins = skipUsers.map(user => user.login)
      /** @type {User[]} */
      const users = this.users.filter(user => {
        return !skipLogins.includes(user.login) || !user.removed
      })
      const autocomplete = users.map(user => ({
        text: `[${user.login}] ${user.lastName} ${user.firstName}`,
        value: user,
      }))
      return autocomplete
    },

    openYNDialog () {
      this.groupError = ''
      this.ynDialog = true
    },
    closeYNDialog () {
      this.groupError = ''
      this.ynDialog = false
    },

    memberActionSwitch (group, action) {
      console.log(action.item.action, action, group)
      this.selectedMember = action.member
      const permission = { add: undefined, remove: undefined, show: undefined }
      let selectedFn = () => {}
      this.openYNDialog()

      switch (action.item.action) {
        case 'remove':
          this.ynTitle = `Chcete odebrat člena '${action.member.user.login}'?`
          selectedFn = this.removeMember
          break
        case 'setShow':
          permission.show = true
          selectedFn = this.changeMemberPermission
          this.ynTitle = `Chcete členu '${action.member.user.login}' přidat práva vidět členy?`
          break
        case 'unsetShow':
          permission.show = false
          selectedFn = this.changeMemberPermission
          this.ynTitle = `Chcete členu '${action.member.user.login}' odebrat práva vidět členy?`
          break
        case 'setAdd':
          permission.add = true
          selectedFn = this.changeMemberPermission
          this.ynTitle = `Chcete členu '${action.member.user.login}' přidat práva přidávat členy?`
          break
        case 'unsetAdd':
          permission.add = false
          selectedFn = this.changeMemberPermission
          this.ynTitle = `Chcete členu '${action.member.user.login}' odebrat práva přidávat členy?`
          break
        case 'setRemove':
          permission.remove = true
          selectedFn = this.changeMemberPermission
          this.ynTitle = `Chcete členu '${action.member.user.login}' přidat práva odebirat členy?`
          break
        case 'unsetRemove':
          permission.remove = false
          selectedFn = this.changeMemberPermission
          this.ynTitle = `Chcete členu '${action.member.user.login}' odebrat práva odebirat členy?`
          break
      }
      this.ynActionYes = () => {
        this.tryActionWrapper(async () => {
          await selectedFn(group.name, action.member.user.login, permission)
          this.closeYNDialog()
        })
      }
    },
    groupActionSwitch (action) {
      console.log(action.item.action, action)
      this.selectedGroup = action.group
      switch (action.item.action) {
        case 'update':
          this.groupUpdateDialog = true
          break
        case 'recorver':
          this.openYNDialog()
          this.ynTitle = `Chcete obnovit skupinu '${action.group.name}'?`
          this.ynActionYes = () => {
            this.tryActionWrapper(async () => {
              await this.recoverGroup(action.group.name)
              this.closeYNDialog()
            })
          }
          break
        case 'remove':
          this.openYNDialog()
          this.ynTitle = `Chcete odstranit skupinu '${action.group.name}'?`
          this.ynActionYes = () => {
            this.tryActionWrapper(async () => {
              await this.removeGroup(action.group.name)
              this.closeYNDialog()
            })
          }
          break
        case 'delete':
          this.openYNDialog()
          this.ynTitle = `Chcete trvale smazat skupinu '${action.group.name}'?`
          this.ynActionYes = () => {
            this.tryActionWrapper(async () => {
              await this.deleteGroup(action.group.name)
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
        this.groupError = (e.message) ? e.message : 'Nepodarilo se.'
        console.error(e)
      }
      this.actionWaiting = false
    },

    tryCreateGroup (name, describe) {
      return this.tryActionWrapper(async () => {
        await this.createGroup(name, describe)
        this.groupCreateDialog = false
        this.groupError = ''
      })
    },
    tryUpdateGroup (name, describe) {
      return this.tryActionWrapper(async () => {
        await this.updateGroup(name, describe)
        this.groupUpdateDialog = false
        this.groupError = ''
      })
    },
    shortcutTryAddMember (groupName, userLogin) {
      this.openYNDialog()
      this.ynTitle = `Chcete přidat uživatele '${userLogin}' do skupiny '${groupName}'?`
      this.ynActionYes = () => {
        this.tryActionWrapper(async () => {
          await this.addMember(groupName, userLogin)
          this.selectedUser = null
          this.closeYNDialog()
        })
      }
      this.ynActionYes()
    },

    // Upravy/Mutace nad Skupinou
    async createGroup (name, describe) {
      console.warn('TODO: createGroup', { name, describe })
      await simulateLoading()
      await this.$apollo.mutate({
        mutation: gqlCreateGroup,
        variables: {
          name,
          describe,
        },
        update (proxy, { data: { createGroup } }) {
          console.log(createGroup)
          if (createGroup) {
            const data = proxy.readQuery({
              query: gqlGroups,
            })
            createGroup.members = []
            data.groups.push(createGroup)
            proxy.writeQuery({
              query: gqlGroups,
              data: data,
            })
          } // if (createGroup)
        },
      })
    },
    async updateGroup (name, describe) {
      console.warn('TODO: updateGroup', { name, describe })
      await simulateLoading()
      await this.$apollo.mutate({
        mutation: gqlUpdateGroupInfo,
        variables: {
          name,
          describe,
        },
        update (proxy, { data: { updateGroupInfo } }) {
          console.log(updateGroupInfo)
          if (updateGroupInfo) {
            const data = proxy.readQuery({
              query: gqlGroups,
            })
            data.groups.forEach(group => {
              if (group.name === name) {
                group.describe = describe
              }
            })
            proxy.writeQuery({
              query: gqlGroups,
              data: data,
            })
          } // if (updateGroupInfo)
        },
      })
    },
    async removeGroup (name) {
      console.warn('TODO: removeGroup', { name })
      await simulateLoading()
      await this.$apollo.mutate({
        mutation: gqlRemoveGroup,
        variables: {
          name,
        },
        update (proxy, { data: { removeGroup } }) {
          console.log(removeGroup)
          if (removeGroup) {
            const data = proxy.readQuery({
              query: gqlGroups,
            })
            console.error(data)
            data.groups.forEach(group => {
              if (group.name === name) {
                group.removed = true
              }
              return group
            })
            proxy.writeQuery({
              query: gqlGroups,
              data: data,
            })
          } // if (removeGroup)
        },
      })
    },
    async recoverGroup (name) {
      console.warn('TODO: recorverGroup', { name })
      await simulateLoading()
      await this.$apollo.mutate({
        mutation: gqlRecoverGroup,
        variables: {
          name,
        },
        update (proxy, { data: { recoverGroup } }) {
          console.log(recoverGroup)
          if (recoverGroup) {
            const data = proxy.readQuery({
              query: gqlGroups,
            })
            console.error(data)
            data.groups.forEach(group => {
              if (group.name === name) {
                group.removed = false
              }
              return group
            })
            proxy.writeQuery({
              query: gqlGroups,
              data: data,
            })
          } // if (recoverGroup)
        },
      })
    },
    async deleteGroup (name) {
      console.warn('TODO: deleteGroup', { name })
      await simulateLoading()
      await this.$apollo.mutate({
        mutation: gqlDeleteGroup,
        variables: {
          name,
        },
        update (proxy, { data: { deleteGroup } }) {
          console.log(deleteGroup)
          if (deleteGroup) {
            const data = proxy.readQuery({
              query: gqlGroups,
            })
            console.error('1', data)
            data.groups.find((group, index) => {
              if (group.name === name) {
                data.groups.splice(index, 1)
                return true
              }
              return false
            })
            console.error('2', data)
            proxy.writeQuery({
              query: gqlGroups,
              data: data,
            })
          } // if (recoverGroup)
        },
      })
    },

    // Upravy/Mutace nad Skupinou
    /** @param {{show:boolean, add:boolean, remove:boolean}} permission */
    async addMember (groupName, userLogin, permission = {}) {
      console.warn('TODO: addMember', { groupName, userLogin, permission })
      await simulateLoading()
      await this.$apollo.mutate({
        mutation: gqlAddMember,
        variables: {
          name: groupName,
          login: userLogin,
        },
        update (proxy, { data: { addMember } }) {
          if (addMember) {
            const data = proxy.readQuery({
              query: gqlGroups,
            })

            const group = data.groups.find(g => g.name === groupName)
            group.members.push(addMember)
            proxy.writeQuery({
              query: gqlGroups,
              data: data,
            })
          } // if (addMember)
        },
      })
    },
    async removeMember (groupName, userLogin) {
      console.warn('TODO: removeMember', { groupName, userLogin })
      await simulateLoading()
      await this.$apollo.mutate({
        mutation: gqlRemoveMember,
        variables: {
          name: groupName,
          login: userLogin,
        },
        update (proxy, { data: { removeMember } }) {
          if (removeMember) {
            const data = proxy.readQuery({
              query: gqlGroups,
            })

            const group = data.groups.find(g => g.name === groupName)
            group.members.find((member, index) => {
              if (member.user.login === userLogin) {
                group.members.splice(index, 1)
                return true
              }
              return false
            })
            proxy.writeQuery({
              query: gqlGroups,
              data: data,
            })
          } // if (addMember)
        },
      })
    },
    /** @param {{show:boolean, add:boolean, remove:boolean}} permission */
    async changeMemberPermission (groupName, userLogin, permission) {
      console.warn('TODO: changeMemberPermission', { groupName, userLogin, permission })
      await simulateLoading()
      const { show = null, add = null, remove = null } = permission
      await this.$apollo.mutate({
        mutation: gqlUpdateMember,
        variables: {
          name: groupName,
          login: userLogin,
          addMember: add,
          removeMember: remove,
          showMembers: show,
        },
        update (proxy, { data: { updateMember } }) {
          if (updateMember) {
            const data = proxy.readQuery({
              query: gqlGroups,
            })
            const group = data.groups.find(g => g.name === groupName)
            group.members.forEach(member => {
              if (member.user.login === userLogin) {
                member.addMember = updateMember.addMember
                member.removeMember = updateMember.removeMember
                member.showMembers = updateMember.showMembers
              }
            })
            proxy.writeQuery({
              query: gqlGroups,
              data: data,
            })
          } // if (recoverGroup)
        },
      })
    },
  },
}
</script>
