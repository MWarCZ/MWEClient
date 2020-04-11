<template>
  <v-tooltip bottom>
    <template #activator="{on}">
      <v-icon v-on="on" v-bind="$props">{{icon}}</v-icon>
    </template>
    <span>{{tip}}</span>
  </v-tooltip>
</template>
<script>
import { ProcessStatus } from '../helpers'
export default {
  props: {
    status: {
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
      return this.getIcon(this.status)
    },
    tip () {
      return this.getTip(this.status)
    },
  },
  methods: {
    getIcon (status) {
      switch (status) {
        case ProcessStatus.None: return 'mdi-circle-outline'
        case ProcessStatus.Ready: return 'mdi-arrow-right-drop-circle-outline'
        case ProcessStatus.Active: return 'mdi-arrow-right-drop-circle'
        case ProcessStatus.Falling: return 'mdi-alert-outline'
        case ProcessStatus.Failled: return 'mdi-alert'
        case ProcessStatus.Completing: return 'mdi-briefcase-check-outline'
        case ProcessStatus.Completed: return 'mdi-briefcase-check'
        case ProcessStatus.Terminating: return 'mdi-alert-circle-check-outline'
        case ProcessStatus.Terminated: return 'mdi-alert-circle-check'
        case ProcessStatus.Withdrawn: return 'mdi-circle-off-outline'
        default: return 'mdi-comment-question-outline'
      }
    },
    getTip (status) {
      return status
    },
  },
}
</script>
