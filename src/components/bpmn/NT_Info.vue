<template>
  <div>
    <slot name="prepend" :process="process"></slot>
    <LineElement :items="[implementationTitle, idTitle, nameTitle, assigneeTitle]">
      <template #item.0>
        <NTIcon large :implementation="process.implementation" />
      </template>
      <template #item.1>{{process.id}}</template>
      <template #item.2>{{process.name}}</template>
      <template #item.3>{{process.candidateAssignee}}</template>
    </LineElement>
    <slot name="append" :process="process"></slot>
  </div>
</template>
<script>

import NTIcon from './NT_IconImp'
import LineElement from '../LineElement'
/**
 * @typedef NT
 * @type {{
 *  id: number,
 *  bpmnId: string,
 *  name: string,
 *  implementation: string,
 *  candidateAssignee: string,
 * }}
 */
export default {
  components: {
    NTIcon,
    LineElement,
  },
  props: {
    /** @type {new=>NT} */
    process: {
      type: Object,
      required: true,
    },
    implementationTitle: {
      type: String,
      default: 'Implementace',
    },
    idTitle: {
      type: String,
      default: 'ID',
    },
    nameTitle: {
      type: String,
      default: 'Název',
    },
    assigneeTitle: {
      type: String,
      default: 'Nabyvatel',
    },
  },
}
</script>,
