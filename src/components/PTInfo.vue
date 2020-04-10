<template>
  <div>
    <slot name="prepend" :process="process"></slot>
    <LineElement :items="['Spustitelnost','ID','Název','BPMN ID','Verze']">
      <template #item.0>
        <PTIcon large :isExecutable="process.isExecutable" />
      </template>
      <template #item.1>{{process.id}}</template>
      <template #item.2>{{process.name}}</template>
      <template #item.3>{{process.bpmnId}}</template>
      <template #item.4>{{process.version}}</template>
    </LineElement>
    <slot name="append" :process="process"></slot>
  </div>
</template>
<script>

import PTIcon from './PTExecutableIcon'
import LineElement from './LineElement'
/**
 * @typedef PT
 * @type {{
 *  id: number,
 *  bpmnId: string,
 *  name: string,
 *  isExecutable: boolean,
 *  processType: string,
 *  versionType: string,
 *  version: string,
 *  candidateManager: string
 * }}
 */

export default {
  components: {
    PTIcon,
    LineElement,
  },
  props: {
    /** @type {new=>PT} */
    process: {
      type: Object,
      required: true,
    },
  },
}
</script>
