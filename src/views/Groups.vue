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
          @action="memberActionSwitch(group, $event)"
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
// import ListGroups from '../components/ListGroupsWithFilter.vue'
import GList from '../components/GList.vue'
import GEditor from '../components/GEditor.vue'
import GMList from '../components/GMList.vue'
import FullDialog from '../components/FullDialog'
import YesNoDialog from '../components/YesNoDialog'

import gqlClient from '../graphql/Client.gql'
import gqlGroups from '../graphql/Groups.gql'

import gqlRemoveGroup from '../graphql/removeGroup.gql'
import gqlRecoverGroup from '../graphql/recoverGroup.gql'

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
    GEditor,
    YesNoDialog,
  },
  data () {
    return {
      client: null,
      groups: [],

      // Cekani na odpoved serveru - vyuzito v dialozich
      actionWaiting: false,
      groupError: '',
      selectedGroup: null,
      selectedMember: null,

      groupCreateDialog: false,

      groupUpdateDialog: false,

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
  },
  methods: {
    log (...args) {
      console.log(...args)
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
      const permission = { add: false, remove: false, show: false }
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
      })
    },
    tryUpdateGroup (name, describe) {
      return this.tryActionWrapper(async () => {
        await this.updateGroup(name, describe)
        this.groupUpdateDialog = false
      })
    },

    // Upravy/Mutace nad Skupinou
    async createGroup (name, describe) {
      console.warn('TODO: createGroup', { name, describe })
      await new Promise(resolve => setTimeout(_ => resolve(), 1000))
    },
    async updateGroup (name, describe) {
      console.warn('TODO: updateGroup', { name, describe })
      await new Promise(resolve => setTimeout(_ => resolve(), 1000))
    },
    async removeGroup (name) {
      console.warn('TODO: removeGroup', { name })
      await new Promise(resolve => setTimeout(_ => resolve(), 1000))
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
      await new Promise(resolve => setTimeout(_ => resolve(), 1000))
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
      await new Promise(resolve => setTimeout(_ => resolve(), 1000))
    },

    // Upravy/Mutace nad Skupinou
    /** @param {{show:boolean, add:boolean, remove:boolean}} permission */
    async addMember (groupName, userLogin, permission = {}) {
      console.warn('TODO: addMember', { groupName, userLogin, permission })
      await new Promise(resolve => setTimeout(_ => resolve(), 1000))
    },
    /** @param {{show:boolean, add:boolean, remove:boolean}} permission */
    async removeMember (groupName, userLogin, permission = {}) {
      console.warn('TODO: removeMember', { groupName, userLogin, permission })
      await new Promise(resolve => setTimeout(_ => resolve(), 1000))
    },
    /** @param {{show:boolean, add:boolean, remove:boolean}} permission */
    async changeMemberPermission (groupName, userLogin, permission) {
      console.warn('TODO: changeMemberPermission', { groupName, userLogin, permission })
      await new Promise(resolve => setTimeout(_ => resolve(), 1000))
    },
  },
}
</script>
