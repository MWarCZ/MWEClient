
<template>
  <v-list three-line flat>
    <!-- <v-subheader>REPORTS</v-subheader> -->
    <!-- <v-list-item-group> -->
      <v-list-group
        v-for="(group, index) in groups"
        :key="`group-${index}`"
        :class="{removed: group.removed, protected: group.protected}"
        :ripple="false"
        append-icon=""
      >
        <template v-slot:activator>
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
            <v-list-item-title v-text="group.name"></v-list-item-title>
            <v-list-item-subtitle
              v-html="group.describe"
            />
          </v-list-item-content>
          <v-menu left bottom offset-x>
            <template v-slot:activator="{ on }">
              <v-btn icon v-on="on">
                <v-icon>mdi-dots-vertical</v-icon>
              </v-btn>
            </template>
            <v-list>
              <template v-for="(menuItem, index2) in menuItemsProvider(group)">
                <v-list-item
                  @click="1"
                  :key="`menu-${index2}`"
                >
                  <v-list-item-icon>
                    <v-icon>{{menuItem.icon}}</v-icon>
                  </v-list-item-icon>
                  <v-list-item-title>{{menuItem.title}}</v-list-item-title>
                </v-list-item>
              </template>
            </v-list>
          </v-menu>
        </template>
        <v-container>

          <v-list v-if="group.members" two-line flat>
            <template
              v-for="(member, mIndex) in group.members"
            >
              <v-list-item :key="`member-${mIndex}`">
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
                <v-list-item-content v-if="member.user">
                  <v-list-item-title>
                    {{member.user.login}}: {{member.user.firstName}} {{member.user.lastName}}
                  </v-list-item-title>
                  <v-list-item-subtitle
                    v-html="group.describe"
                  />
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

                <v-menu left bottom offset-x>
                  <template v-slot:activator="{ on }">
                    <v-btn icon v-on="on">
                      <v-icon>mdi-dots-vertical</v-icon>
                    </v-btn>
                  </template>
                  <v-list>
                    <template v-for="(menuItem, index2) in []">
                      <v-list-item
                        @click="1"
                        :key="`menu-${index2}`"
                      >
                        <v-list-item-icon>
                          <v-icon>{{menuItem.icon}}</v-icon>
                        </v-list-item-icon>
                        <v-list-item-title>{{menuItem.title}}</v-list-item-title>
                      </v-list-item>
                    </template>
                  </v-list>
                </v-menu>

              </v-list-item>
            </template>
          </v-list>
        </v-container>

      </v-list-group>
    <!-- </v-list-item-group> -->
  </v-list>

</template>

<script>

// #region Pomocne funkce pro zjistovani zobrazeni polozky menu.

function userMembershipNames (user) {
  if (user && user.membership) {
    return user.membership
      .map(member => (member.group) ? member.group.name : null)
  } else {
    return []
  }
}
function checkActionGroup (action, group, client) {
  const havePermission = checkPermissionGroup(action, client)
  switch (action) {
    case 'createGroup': return havePermission
    case 'removeGroup': return havePermission && !group.removed && !group.protected
    case 'deleteGroup': return havePermission && group.removed && !group.protected
    case 'updateGroup': return havePermission && !group.protected
    case 'recorverGroup': return havePermission && group.removed
  }
  return false
}
function checkActionMember (action, group, client) {
  const havePermission = checkPermissionMember(action, group.name, client)
  // console.log({ action, group, client })
  switch (action) {
    case 'addMember': return havePermission
    case 'removeMember': return havePermission
    case 'showMembers': return havePermission
  }
  return false
}
function checkPermissionMember (permission, groupName, client) {
  const names = userMembershipNames(client)
  const member = (client && client.membership.find(m => m.group && m.group.name === groupName)) || {}
  const result = member[permission] || names.includes('GroupAdmin') || names.includes('SuperGroupAdmin')
  return !!result
}
function checkPermissionGroup (permission, client) {
  const names = userMembershipNames(client)
  switch (permission) {
    case 'createGroup': return names.includes('GroupAdmin') || names.includes('SuperGroupAdmin')
    case 'removeGroup': return names.includes('GroupAdmin') || names.includes('SuperGroupAdmin')
    case 'deleteGroup': return names.includes('SuperGroupAdmin')
    case 'updateGroup': return names.includes('GroupAdmin') || names.includes('SuperGroupAdmin')
    case 'recorverGroup': return names.includes('SuperGroupAdmin')
  }
  return false
}

// #endregion

export default {
  props: {
    groups: {
      type: Array,
      required: true,
    },
    client: {},
  },
  data: () => ({
    memberMenuItems: [
      {
        icon: 'mdi-account-off-outline',
        title: 'Xxx',
        visibleIf: (member) => true,
      },
    ],
    menuItems: [
      {
        icon: 'mdi-account-off-outline',
        title: 'Odstranit',
        action: 'removeGroup',
        scope: 'group',
      },
      {
        icon: 'mdi-account',
        title: 'Obnovit',
        action: 'recorverGroup',
        scope: 'group',
      },
      {
        icon: 'mdi-delete-forever',
        title: 'Smazat',
        action: 'deleteGroup',
        scope: 'group',
      },
      {
        icon: 'mdi-plus-circle-outline',
        title: 'Pridat uzivatele',
        action: 'addMember',
        scope: 'member',
      },
    ],
  }),

  computed: {
    clientGroupNames () {
      return this.userMembershipNames(this.client)
    },
  },

  methods: {
    userMembershipNames (user) {
      if (user && user.membership) {
        return user.membership
          .map(member => (member.group) ? member.group.name : null)
          .filter(name => !!name)
      } else {
        return []
      }
    },
    menuItemsProvider (group) {
      const items = this.menuItems.filter(item => {
        try {
          if (item.scope === 'group') {
            return checkActionGroup(item.action, group, this.client)
          } else if (item.scope === 'member') {
            console.log('1>', this.client)
            return checkActionMember(item.action, group, this.client)
          } else {
            return false
          }
        } catch {
          return false
        }
      })
      return (items.length) ? items : [{
        icon: 'mdi-circle-outline',
        title: 'Žádná dostupná akce',
        scope: 'None',
        action: 'nothing',
      }]
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
</style>
