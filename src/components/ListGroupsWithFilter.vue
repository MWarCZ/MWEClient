
<template>
  <div>
    <v-toolbar flat class="child-flex">
      <!-- <v-btn icon @click="resetSort()">
        <v-icon>mdi-filter</v-icon>
      </v-btn> -->
      <!-- <v-toolbar-title>Filtrovat: </v-toolbar-title> -->

      <v-toolbar-items style="flex-basis: 30%">
        <v-select
          :items="filterTypeItems"
          v-model="filterType"
          label="Filtr dle typu."
          chips
          multiple
          flat
          deletable-chips
          full-width
          hide-details
          single-line
          :menu-props="{ bottom: true, offsetY: true }"
          prepend-icon="mdi-filter"
        ></v-select>
      </v-toolbar-items>
      <v-toolbar-items>
        <v-text-field
          label="Nazev skupiny."
          v-model="filterName"
          single-line
          full-width
          prepend-icon="mdi-magnify"
          :cache-items="false"
        ></v-text-field>
      </v-toolbar-items>
      <v-spacer></v-spacer>
<!--
    </v-toolbar>
    <v-toolbar flat> -->
      <!-- <v-btn icon @click="resetSort()">
        <v-icon>mdi-sort-variant</v-icon>
      </v-btn> -->
      <!-- <v-toolbar-title>Řadit dle: </v-toolbar-title> -->
        <v-btn text
          @click="nextSortAZ()"
          :class="{selected: sortAZ}"
        >
          <v-icon v-if="sortAZ==0">mdi-sort</v-icon>
          <v-icon v-else-if="sortAZ==1">mdi-sort-alphabetical-ascending</v-icon>
          <v-icon v-else>mdi-sort-alphabetical-descending</v-icon>
          <span>Abecedně</span>
        </v-btn>
        <v-btn text
          @click="nextSortType()"
          :class="{selected: sortType}"
        >
          <v-icon v-if="sortType==0">mdi-sort</v-icon>
          <v-icon v-else-if="sortType==1">mdi-sort-ascending</v-icon>
          <v-icon v-else>mdi-sort-descending</v-icon>
          <span>Typově</span>
        </v-btn>
        <v-btn icon @click="resetSort()">
          <v-icon>mdi-close</v-icon>
        </v-btn>
    </v-toolbar>

    <ListGroups :groups="groupProvider" :client="client"/>
  </div>

</template>

<script>
import ListGroups from '../components/ListGroups.vue'

export default {
  components: {
    ListGroups,
  },
  props: {
    groups: {
      type: Array,
      required: true,
    },
    client: {},
  },
  data: () => ({
    sortAZ: 0,
    sortType: 0,
    filterType: [],
    filterName: '',
  }),
  computed: {
    filterTypeItems () {
      return this.groups.map(g => {
        return (g.protected) ? 'Protected' : (g.removed) ? 'Removed' : 'Normal'
      })
    },
    groupNames () {
      return this.groups.map(g => g.name)
    },
    groupProvider () {
      return this.groupSortProvider(this.groupFilterProvider(this.groups))
    },
  },

  methods: {
    resetSort () {
      this.sortAZ = this.sortType = 0
    },
    nextSort (value, max, step) {
      return (value + step + max) % max
    },
    nextSortAZ () {
      this.sortType = 0
      this.sortAZ = this.nextSort(this.sortAZ, 3, 1)
    },
    nextSortType () {
      this.sortAZ = 0
      this.sortType = this.nextSort(this.sortType, 3, -1)
    },
    groupSortProvider (groups) {
      const sorted = [...groups]
      // AZ
      sorted.sort((a, b) => {
        if (this.sortAZ === 1) {
          return (a.name > b.name) ? 1 : (a.name < b.name) ? -1 : 0
        } else if (this.sortAZ === 2) {
          return (a.name < b.name) ? 1 : (a.name > b.name) ? -1 : 0
        }
        return 0
      })
      // Type
      sorted.sort((a, b) => {
        const tmpA = (a.protected) ? 1 : (a.removed) ? 3 : 2
        const tmpB = (b.protected) ? 1 : (b.removed) ? 3 : 2
        if (this.sortType === 1) {
          return tmpA - tmpB
        } else if (this.sortType === 2) {
          return tmpB - tmpA
        }
        return 0
      })
      return sorted
    },

    groupFilterProvider (groups) {
      return groups.filter(g => {
        const name = g.name.toLowerCase().startsWith(this.filterName.toLowerCase())
        const tmpType = (g.protected) ? 'Protected' : (g.removed) ? 'Removed' : 'Normal'
        const type = (this.filterType.length) ? [...this.filterType].includes(tmpType) : true
        return name && type
      })
    },
  },
}
</script>
<style scoped>
  .selected {
    background: radial-gradient(#87878763, transparent);
  }
</style>
