<template>
  <v-dialog
    :value="value"
    @input="emitInput($event)"
    scrollable fullscreen
    persistent :overlay="false"
    max-width="500px"
    :transition="transition"
  >
    <v-card>
        <div>
          <v-toolbar dark color="primary">
            <v-spacer/>
            <v-toolbar-title>{{title}}</v-toolbar-title>
            <v-spacer/>

            <v-btn v-if="closeable" icon @click="emitInput(false)">
              <v-icon large>mdi-close</v-icon>
            </v-btn>
          </v-toolbar>
      </div>
      <div>
        <slot></slot>
      </div>
    </v-card>
  </v-dialog>
</template>
<script>
export default {
  props: {
    value: {},
    title: {
      type: String,
      default: '',
    },
    closeable: Boolean,
    transition: {
      type: String,
      default: 'dialog-transition',
    },
  },
  methods: {
    /** @param {string} value */
    emitInput (value) {
      this.$emit('input', value)
    },
  },
}
</script>
