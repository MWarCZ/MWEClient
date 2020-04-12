<template>
  <div>
    <slot name="prepend" :node="node"></slot>
    <LineElement :items="[statusTitle, idTitle, startDateTimeTitle, endDateTimeTitle, assigneeTitle]">
      <template #item.0>
        <NIIcon large :status="node.status" />
      </template>
      <template #item.1>{{node.id}}</template>
      <template #item.2>{{startDateTime}}</template>
      <template #item.3>{{endDateTime}}</template>
      <template #item.4>{{assignee}}</template>
    </LineElement>
    <slot name="append" :node="node"></slot>
  </div>
</template>
<script>

import NIIcon from './NI_IconStatus'
import LineElement from '../LineElement'
/**
 * @typedef NI
 * @type {{
 *  id: number,
 *  startDateTime: string,
 *  endDateTime: string,
 *  status: string,
 *  assignee: {
 *    id: nubmer,
 *    login: string,
 *  },
 * }}
 */
export default {
  components: {
    NIIcon,
    LineElement,
  },
  props: {
    /** @type {new=>NI} */
    node: {
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
    assigneeTitle: {
      type: String,
      default: 'Nabyvatel',
    },
  },
  data () {
    return { }
  },
  computed: {
    startDateTime () { return this.getDate(this.process.startDateTime) },
    endDateTime () { return this.getDate(this.process.endDateTime) },
    assignee () { return this.node.assignee ? this.node.assignee.login : '[Neobsazeno]' },
  },
  methods: {
    getDate (date) {
      const obj = new Date(date)
      return (date) ? obj.toISOString() : '[Neukončeno]'
    },
  },
}
</script>
