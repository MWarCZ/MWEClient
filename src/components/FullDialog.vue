<template>
  <v-dialog
    :value="value"
    @input="$emit('input', $event)"
    scrollable fullscreen
    persistent :overlay="false"
    max-width="500px"
    transition="dialog-transition"
  >
    <slot></slot>
  </v-dialog>
</template>
<script>
export default {
  props: {
    value: {},
  },
}
</script>
