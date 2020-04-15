<template>
  <v-dialog
    :value="value"
    @input="emitInput"
    max-width="500px"
    transition="dialog-transition"
    light
    :scrollable="false"
  >
    <v-card :loading="loading">
      <v-card-title class="headline" style="word-break: break-word;">
        {{title}}
      </v-card-title>
      <v-card-text>
        <slot></slot>
      </v-card-text>
      <v-card-actions class="overflow-hidden">
        <v-row v-if="loading" justify="center">
          <v-progress-circular indeterminate />
        </v-row>
        <v-row v-else>
          <v-col>
            <v-btn @click="emitYes" color="success" block>{{yesTitle}}</v-btn>
          </v-col>
          <v-col>
            <v-btn @click="emitNo" color="error" block>{{noTitle}}</v-btn>
          </v-col>
        </v-row>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>
<script>
export default {
  props: {
    value: {},
    title: {
      type: String,
      required: true,
    },
    yesTitle: {
      type: String,
      default: 'Ano',
    },
    noTitle: {
      type: String,
      default: 'Ne',
    },
    loading: {
      type: Boolean,
      default: false,
    },
  },
  methods: {
    emitInput (value) {
      this.$emit('input', value)
    },
    emitYes () {
      this.$emit('yes', true)
    },
    emitNo () {
      this.$emit('no', true)
    },
  },
}
</script>
<style lang="scss" scoped>
.overflow-hidden {
  overflow: hidden;
}
</style>
