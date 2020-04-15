<template>
  <v-tooltip bottom>
    <template #activator="{on}">
      <v-icon v-on="on" v-bind="$props">{{icon}}</v-icon>
    </template>
    <span>{{tip}}</span>
  </v-tooltip>
</template>
<script>
import { ActivityStatus } from '../helpers'
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
        case ActivityStatus.None: return 'mdi-circle-outline'
        case ActivityStatus.Ready: return 'mdi-arrow-right-drop-circle-outline'
        case ActivityStatus.Active: return 'mdi-arrow-right-drop-circle'
        case ActivityStatus.Waiting: return 'mdi-pause-circle'
        case ActivityStatus.Falling: return 'mdi-alert-outline'
        case ActivityStatus.Failled: return 'mdi-alert'
        case ActivityStatus.Completing: return 'mdi-briefcase-check-outline'
        case ActivityStatus.Completed: return 'mdi-briefcase-check'
        case ActivityStatus.Withdrawn: return 'mdi-circle-off-outline'
        default: return 'mdi-comment-question-outline'
      }
    },
    getTip (status) {
      return status || '?'
    },
  },
}
</script>
