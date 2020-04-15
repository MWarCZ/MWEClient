// @emit select item
<template>
  <v-menu left bottom offset-x>
    <template v-slot:activator="{ on }">
      <v-btn icon v-on="on">
        <v-icon>mdi-dots-vertical</v-icon>
      </v-btn>
    </template>
    <v-list>
      <template v-for="(item, index) in menuItems">
        <v-list-item
          @click="emitClick(item)"
          :key="`menu-${index}`"
        >
          <v-list-item-icon>
            <v-icon>{{item.icon}}</v-icon>
          </v-list-item-icon>
          <v-list-item-title>{{item.title}}</v-list-item-title>
        </v-list-item>
      </template>
    </v-list>
  </v-menu>
</template>
<script>
export default {
  props: {
    /**
     * @type new => { icon:string, title:string }[]
     */
    items: {
      type: Array,
      required: true,
    },
  },
  computed: {
    menuItems () {
      return (this.items.length) ? this.items : [{ icon: 'mdi-circle-outline', title: 'Žádná dostupná akce' }]
    },
  },
  methods: {
    emitClick (item) {
      this.$emit('select', item)
    },
  },
}
</script>
