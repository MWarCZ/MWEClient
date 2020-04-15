<template>
  <div>
    <slot name="prepend" :node="node"></slot>
    <LineElement :items="[implementationTitle, idTitle, nameTitle, assigneeTitle]">
      <template #item.0>
        <div class="text-center justify-center">
          <NTIcon large :implementation="node.implementation" />
          <div>{{node.implementation}}</div>
        </div>
      </template>
      <template #item.1>{{node.id}}</template>
      <template #item.2>{{node.name}}</template>
      <template #item.3>{{node.candidateAssignee}}</template>
    </LineElement>
    <slot name="append" :node="node"></slot>
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
    node: {
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
      default: 'Skupina kandidátů',
    },
  },
}
</script>,
