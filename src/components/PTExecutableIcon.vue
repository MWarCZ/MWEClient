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
    isExecutable: {
      type: Boolean,
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
      return this.isExecutable ? 'mdi-book-play' : 'mdi-book-lock'
    },
    tip () {
      return this.isExecutable ? 'Spustitelný' : 'Nespustitelný'
    },
  },
}
</script>
