<template>
  <div>
    <slot name="prepend" :process="process"></slot>
    <LineElement :items="[statusTitle, idTitle, startDateTimeTitle, endDateTimeTitle]">
      <template #item.0>
        <PSatusIcon large :status="process.status" />
      </template>
      <template #item.1>{{process.id}}</template>
      <template #item.2>{{startDateTime}}</template>
      <template #item.3>{{endDateTime}}</template>
    </LineElement>
    <slot name="append" :process="process"></slot>
  </div>
</template>
<script>

import PSatusIcon from './ProcessStatusIcon'
import LineElement from './LineElement'
/**
 * @typedef PI
 * @type {{
 *  id: number,
 *  startDateTime: string,
 *  endDateTime: string,
 *  status: string,
 * }}
 */
export default {
  components: {
    PSatusIcon,
    LineElement,
  },
  props: {
    /** @type {new=>PI} */
    process: {
      type: Object,
      required: true,
    },
    statusTitle: {
      type: String,
      default: 'Stav',
    },
    idTitle: {
      type: String,
      default: 'ID',
    },
    startDateTimeTitle: {
      type: String,
      default: 'Započetí',
    },
    endDateTimeTitle: {
      type: String,
      default: 'Ukončení',
    },
  },
  data () {
    return { }
  },
  computed: {
    startDateTime () { return this.getDate(this.process.startDateTime) },
    endDateTime () { return this.getDate(this.process.endDateTime) },
  },
  methods: {
    getDate (date) {
      const obj = new Date(date)
      return (date) ? obj.toISOString() : '-'
    },
  },
}
</script>
