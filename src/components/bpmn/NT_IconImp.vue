// TODO Neni dokonceno rozpoznavani vsech moznosti.
<template>
  <v-tooltip bottom>
    <template #activator="{on}">
      <v-icon v-on="on" v-bind="$props">{{icon}}</v-icon>
    </template>
    <span>{{tip}}</span>
  </v-tooltip>
</template>
<script>
export default {
  props: {
    implementation: {
      type: String,
      required: true,
    },
    large: Boolean,
    'x-large': Boolean,
    small: Boolean,
    'x-small': Boolean,
    light: Boolean,
    dark: Boolean,
    color: String,
  },
  computed: {
    icon () {
      if (this.textContains(this.implementation, 'start')) return 'mdi-circle-outline'
      return 'mdi-crosshairs-question'
    },
    tip () {
      return this.implementation
    },
  },
  methods: {
    textContains (implementation, text) {
      if (typeof implementation === 'string') {
        return implementation.toLowerCase().includes(text)
      }
      // console.warn('Chyba pri pokusu urcit implementaci: ', implementation)
      return false
    },
  },
}
</script>
