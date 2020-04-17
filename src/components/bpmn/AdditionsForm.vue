// @emit submit AdditionsInput[]
<template>
  <v-form>
    <template v-if="items.length>0" >

      <template v-for="(item, index) in items">
        <v-text-field
          v-if="selectElementType(item) === Types.text"
          :key="index"
          v-model="inputs[index]"
          :name="item.name"
          :type="item.type"
          :label="item.name"
          :hint="item.hints"
          persistent-hint
        />

        <v-select
          v-else-if="selectElementType(item) === Types.select"
          :key="index"
          v-model="inputs[index]"
          :name="item.name"
          :type="item.type"
          :label="item.name"
          :hint="item.hints"
          :items="getItemsForSelect(item)"
          persistent-hint
          :menu-props="{ bottom: true, offsetY: true }"
        ></v-select>

        <v-slider
          v-else-if="selectElementType(item) === Types.range"
          :key="index"
          v-model="inputs[index]"
          :label="item.name"
          :step="getStepForRange(item)"
          :min="getMinForRange(item)"
          :max="getMaxForRange(item)"
          thumb-label
          ticks
        ></v-slider>

        <v-switch
          v-else-if="selectElementType(item) === Types.checkbox"
          :key="index"
          v-model="inputs[index]"
          :name="item.name"
          :type="item.type"
          :label="item.name"
          :hint="item.hints"
          :items="getItemsForSelect(item)"
          persistent-hint
        ></v-switch>

        <v-text-field
          v-else
          :key="index"
          :value="`Neznami typ elementu: ${item.type}`"
          :name="item.name"
          :label="item.name"
          :hint="item.hints"
          persistent-hint
          disabled
        />
      </template>

    </template>

    <h2 v-else class="text-center">Žádná data k doplnění.</h2>
    <v-row class="justify-center">
      <v-btn color="primary" @click="emitSubmit">Odeslat</v-btn>
    </v-row>
  </v-form>
</template>
<script>
/**
 * @typedef AdditionsFormat
 * @type {{
 *  name: string,
 *  type: string,
 *  possibilities: any[],
 *  default: any,
 *  hints: string,
 * }}
 * @typedef AdditionsInput
 * @type {{
 *  name: string,
 *  value: any,
 * }}
 */
const Types = {
  reset: 'reset',
  checkbox: 'checkbox',
  color: 'color',
  text: 'text',
  number: 'number',
  file: 'file',
  range: 'range',
  select: 'select',
}

export default {
  props: {
    /** @type {new=>AdditionsFormat[]} */
    items: {
      type: Array,
      required: true,
    },
  },
  data () {
    return {
      inputs: this.items.map(item => item.default),
      Types,
    }
  },
  methods: {
    emitSubmit () {
      const input = this.preparePayload(this.inputs)
      this.$emit('submit', input)
    },
    normalizeInputs () {
      const inputs = [...this.inputs]
      this.items.forEach((item, index) => {
        switch (item.type) {
          case 'checkbox':
            if (typeof inputs[index] !== 'boolean') {
              inputs[index] = !!inputs[index]
            }
            break
          case 'color':
          case 'password':
          case 'email':
          case 'search':
          case 'tel':
          case 'select':
          case 'text':
            if (typeof inputs[index] !== 'string') {
              inputs[index] = ''
            }
            break
          case 'range':
          case 'number':
            if (typeof inputs[index] !== 'number') {
              inputs[index] = Number(inputs[index]) || 0
            }
            break
        }
      })
      return inputs
    },
    preparePayload () {
      const inputs = this.normalizeInputs()
      /** @type AdditionsInput[] */
      const additionsInputs = this.items.map((item, index) => {
        /** @type AdditionsInput */
        const addition = { name: item.name, value: inputs[index] }
        return addition
      })
      return additionsInputs
    },

    /** @param {AdditionsFormat} item  */
    selectElementType (item) {
      // button, checkbox, color, (date), (datetime-local), email,
      // file, (hidden), (image), (month), number, password, (radio), range,
      // reset, search, tel
      switch (item.type) {
        case 'reset': return 'reset'
        case 'checkbox': return 'checkbox'
        case 'color': return 'color'
        case 'password':
        case 'email':
        case 'search':
        case 'tel':
        case 'number':
        case 'text': return 'text'
        case 'file': return 'file'
        case 'range': return 'range'
        case 'select': return 'select'
      }
      return 'unknown'
    },

    /** @param {AdditionsFormat} item  */
    getItemsForSelect (item) {
      if (Array.isArray(item.possibilities)) {
        return item.possibilities.map(i => {
          return { text: i, value: i }
        })
      }
      return []
    },
    /** @param {AdditionsFormat} item  */
    getStepForRange (item) {
      const possibilities = (Array.isArray(item.possibilities)) ? item.possibilities : []
      return possibilities[0] || 1
    },
    /** @param {AdditionsFormat} item  */
    getMinForRange (item) {
      const possibilities = (Array.isArray(item.possibilities)) ? item.possibilities : []
      return possibilities[1] || 0
    },
    /** @param {AdditionsFormat} item  */
    getMaxForRange (item) {
      const possibilities = (Array.isArray(item.possibilities)) ? item.possibilities : []
      return possibilities[0] || 100
    },
  },
}
</script>
