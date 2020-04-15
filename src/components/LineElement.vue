<template>
  <v-row>
    <v-col v-for="(item, index) in items" :key="index">
      <v-row justify="center" v-if="!singleline">
        <span class="title">{{item}}</span>
      </v-row>
      <v-row justify="center" align="center">
        <span class="title" v-if="singleline">{{item}} </span>
        <slot :name="`item.${index}`"></slot>
      </v-row>
    </v-col>
  </v-row>
</template>
<script>
export default {
  props: {
    /**
     * @type {new => string[]}
     */
    items: {
      type: Array,
      required: true,
    },
    singleline: Boolean,
  },
}
</script>
