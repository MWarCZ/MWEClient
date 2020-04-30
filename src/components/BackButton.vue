// @emit click void #Jen pokud je nastaveno `disableGoBack`
<template>
    <v-tooltip bottom>
      <template #activator="{on}">
        <v-btn
          fab
          v-on="on"
          color="secondary"
          absolute
          @click="emitClick()"
          :class="{btn:true, relative:!!relativeLeft}"
          :style="btnStyle"
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
    relativeLeft: {
      type: Number,
      default: 0,
    },
  },
  computed: {
    btnStyle () {
      return this.relativeLeft ? `left: ${this.relativeLeft}px;` : ''
    },
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
<style scoped>
.relative {
  /* position: relative; */
  color: red;
}
.btn {
  z-index: 1 !important;
}
</style>
