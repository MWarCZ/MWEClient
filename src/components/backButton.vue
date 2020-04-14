<template>
    <v-tooltip right>
      <template #activator="{on}">
        <v-btn
          fab
          v-on="on"
          color="secondary"
          absolute
          @click="emitClick()"
          style="z-index: 1;"
        > <v-icon x-large>{{icon}}</v-icon> </v-btn>
      </template>
      <span>{{hint}}</span>
    </v-tooltip>
</template>
<script>
export default {
  props: {
    hint: {
      type: String,
      default: 'Jít zpět.',
    },
    icon: {
      type: String,
      default: 'mdi-arrow-left',
    },
    disableGoBack: Boolean,
  },
  methods: {
    emitClick () {
      if (!this.disableGoBack) {
        this.goBack()
      } else {
        this.$emit('click')
      }
    },
    goBack () {
      this.$router.go(-1)
    },

  },
}
</script>
