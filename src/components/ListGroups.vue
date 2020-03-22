
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
            <v-icon v-if="group.protected">mdi-shield</v-icon>
            <v-icon v-else-if="group.removed">mdi-account-off-outline</v-icon>
            <v-icon v-else>mdi-account</v-icon>
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

      </v-list-group>
    <!-- </v-list-item-group> -->
  </v-list>

</template>

<script>

export default {
  props: {
    groups: {
      type: Array,
      required: true,
    },
  },
  data: () => ({
    menuItems: [
      {
        icon: 'mdi-account-off-outline',
        title: 'Odstranit',
        visibleIf: (group) => !group.removed && !group.protected,
      },
      {
        icon: 'mdi-account',
        title: 'Obnovit',
        visibleIf: (group) => group.removed,
      },
      {
        icon: 'mdi-delete-forever',
        title: 'Smazat',
        visibleIf: (group) => group.removed && !group.protected,
      },
    ],
    groupsX: [
      {
        id: 1,
        name: 'SuperUserAdmin',
        describe: 'Administrator uzivatelu s absolutni moci nad nimi (Vcetne destruktivnich akci).',
        protected: true,
        removed: false,
      },
      {
        id: 2,
        name: 'Team 4',
        describe: 'Pracovnici nouzoveho rezimu pod karantenou COVID-19.',
        protected: false,
        removed: false,
      },
      {
        id: 3,
        name: 'Team 1',
        describe: 'Tym 1 - Pracovnici administrativy v koncelari.',
        protected: false,
        removed: true,
      },
    ],
  }),

  methods: {
    menuItemsProvider (group) {
      const items = this.menuItems.filter(item => item.visibleIf(group))
      return (items.length) ? items : [{
        icon: 'mdi-circle-outline',
        title: 'Žádná dostupná akce',
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
