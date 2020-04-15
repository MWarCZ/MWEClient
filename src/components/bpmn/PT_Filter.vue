// @emit input PT[]
// @slot default {data: PT[]}
<template>
  <div>
    <v-toolbar
      dense
    >
      <v-text-field
        prepend-icon="mdi-magnify"
        single-line
        :hint="label"
        :label="label"
        type="number"
        v-model="id"
        @input="emitInput"
        :readonly="idReadonly"
        persistent-hint
      >
      </v-text-field>
    </v-toolbar>
    <slot :data="provide" />
  </div>
</template>
<script>

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
 *  instances: PI[],
 * }}
 */
export default {
  props: {
    /** @type {new=>PT[]} */
    value: {
      type: Array,
      required: true,
    },
    label: {
      type: String,
      default: 'ID',
    },
    idValue: {
      type: String,
      default: '',
    },
    idReadonly: Boolean,
  },
  data () {
    return {
      id: this.idValue,
    }
  },
  computed: {
    provide () {
      return this.provider(this.value)
    },
  },
  methods: {
    emitInput () {
      this.$emit('input', this.provide)
    },
    /** @param {PT[]} args */
    provider (args) {
      return args.filter(arg => arg.id && arg.id.toString().startsWith(this.id))
    },
  },
}
</script>
