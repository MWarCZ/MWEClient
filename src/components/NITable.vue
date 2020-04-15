<template>
  <div>
    <v-data-table
      :headers="allHeaders"
      :items="nodes"
      item-key="id"
      :group-by="groupBy"
      show-group-by
    >
      <template v-for="(_, slot) of $scopedSlots" v-slot:[slot]="scope">
        <slot :name="slot" v-bind="scope" :node="scope.item"/>
      </template>

    </v-data-table>
  </div>
</template>
<script>
/**
 * @typedef PI
 * @type {{
 *  id: number,
 *  startDateTime: string,
 *  endDateTime: string,
 *  status: string,
 *  nodeElements: NI[],
 * }}
 * @typedef NI
 * @type {{
 *  id: number,
 *  startDateTime: string,
 *  endDateTime: string,
 *  status: string,
 *  template: NT,
 *  processInstance: PI
 * }}
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
  props: {
    /**
     * @type new => NI[]
     */
    nodes: {
      type: Array,
      required: true,
      default: () => [],
    },
    prependHeaders: {
      type: Array,
      default: () => [],
    },
    appendHeaders: {
      type: Array,
      default: () => [],
    },
    headers: {
      type: Array,
      default: () => [
        {
          text: 'ID',
          value: 'id',
        },
        {
          text: 'Započetí',
          value: 'startDateTime',
        },
        {
          text: 'Ukončení',
          value: 'endDateTime',
        },
        {
          text: 'Stav',
          value: 'status',
        },
      ],
    },
  },
  data () {
    return {
      groupBy: [],
      headersX: [
        {
          text: 'ID',
          value: 'id',
        },
        {
          text: 'Započetí',
          value: 'startDateTime',
        },
        {
          text: 'Ukončení',
          value: 'endDateTime',
        },
        {
          text: 'Stav',
          value: 'status',
        },
      ],
    }
  },
  computed: {
    allHeaders () {
      const headers = [
        ...this.prependHeaders,
        ...this.headers,
        ...this.appendHeaders,
      ]
      return headers
    },
  },
}
</script>
