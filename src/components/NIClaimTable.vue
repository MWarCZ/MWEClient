<template>
  <div>
    <v-toolbar>
      <v-btn>text</v-btn>
      <v-btn>text</v-btn>
      <v-btn>text</v-btn>
    </v-toolbar>
    <v-data-table
      :headers="headers"
      :items="itemsProvider"
      item-key="name"
      :group-by="groupBy"
    >

      <template #item.btn>
        <v-btn color="primary">Zabrat</v-btn>
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
     * @type new => PI[]
     */
    processInstances: {
      type: Array,
      required: true,
      default: () => [],
    },
  },
  data () {
    return {
      groupBy: [],
      headers: [
        {
          text: 'PI_ID',
          align: 'start',
          value: 'processInstance.id',
        },
        {
          text: 'NI_ID',
          value: 'id',
        },
        {
          text: 'NT_ID',
          value: 'template.id',
        },
        {
          text: 'Ceka od',
          value: 'startDateTime',
        },
        {
          text: 'Nazev ulohy',
          value: 'template.name',
        },
        {
          text: 'Typ ulohy',
          value: 'template.implementation',
        },
        {
          text: 'Akce',
          value: 'btn',
          filterable: false,
          sortable: false,
        },
      ],
      headersx: [
        {
          text: 'Dessert (100g serving)',
          align: 'start',
          value: 'name',
        },
        { text: 'Category', value: 'category' },
        { text: 'Category', value: 'x.a' },
      ],
      items: [
        {
          name: 'Frozen Yogurt',
          category: 'Ice cream',
          x: { a: 9 },
        },
        {
          name: 'Ice cream sandwich',
          category: 'Ice cream',
          x: { a: 6 },
        },
        {
          name: 'Eclair',
          category: 'Cookie',
          x: { },
        },
        {
          name: 'Cupcake',
          category: 'Pastry',
        },
        {
          name: 'Gingerbread',
          category: 'Cookie',
        },
        {
          name: 'Jelly bean',
          category: 'Candy',
          x: { a: 1 },
        },
        {
          name: 'Lollipop',
          category: 'Candy',
          x: { a: 1 },
        },
        {
          name: 'Honeycomb',
          category: 'Toffee',
          x: { a: 3 },
        },
        {
          name: 'Donut',
          category: 'Pastry',
          x: { a: 22 },
        },
        {
          name: 'KitKat',
          category: 'Candy',
          x: { a: 11 },
        },
      ],
    }
  },
  computed: {
    itemsProvider () {
      const step1 = this.processInstances.reduce(
        /** @param {PI} processI @param {NI[]} acc */(acc, processI) => {
          const tmpPI = { ...processI, nodeElements: undefined }
          const nodes = processI.nodeElements.map(node => {
            return { ...node, processInstance: tmpPI }
          })
          return [...acc, ...nodes]
        }, [])
      return step1
    },
  },
}
</script>
