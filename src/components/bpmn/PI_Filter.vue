// @emit input PI[]
// @slot default
<template>
  <div>
    <v-toolbar
      dense
    >
      <v-text-field
        prepend-icon="mdi-magnify"
        single-line
        :hint="labelId"
        :label="labelId"
        type="number"
        v-model="id"
        @input="emitInput"
        :readonly="idReadonly"
        persistent-hint
      >
      </v-text-field>
      <v-select
        prepend-icon="mdi-magnify"
        single-line
        :hint="labelStatus"
        :label="labelStatus"
        :items="statusItems"
        v-model="status"
        :menu-props="{ bottom: true, offsetY: true }"
        :clearable="!statusReadonly"
        :readonly="statusReadonly"
        persistent-hint
      ></v-select>
    </v-toolbar>
    <slot :data="provide" />
  </div>
</template>
<script>
import { ProcessStatus } from '../helpers'
/**
 * @typedef PI
 * @type {{
 *  id: number,
 *  startDateTime: string,
 *  endDateTime: string,
 *  status: string,
 *  nodeElements: NI[],
 * }}
 */
export default {
  props: {
    /** @type {new=>PI[]} */
    value: {
      type: Array,
      required: true,
    },
    labelId: {
      type: String,
      default: 'ID',
    },
    labelStatus: {
      type: String,
      default: 'Stav',
    },
    statusItems: {
      type: Array,
      default: () => [
        // {
        //   text: ProcessStatus.None,
        //   value: ProcessStatus.None,
        // },
        {
          text: ProcessStatus.Ready,
          value: ProcessStatus.Ready,
        },
        {
          text: ProcessStatus.Active,
          value: ProcessStatus.Active,
        },
        // {
        // text: ProcessStatus.Completing,
        // value: ProcessStatus.Completing,
        // },
        {
          text: ProcessStatus.Completed,
          value: ProcessStatus.Completed,
        },
        // {
        // text: ProcessStatus.Falling,
        // value: ProcessStatus.Falling,
        // },
        {
          text: ProcessStatus.Failled,
          value: ProcessStatus.Failled,
        },
        // {
        // text: ProcessStatus.Terminating,
        // value: ProcessStatus.Terminating,
        // },
        {
          text: ProcessStatus.Terminated,
          value: ProcessStatus.Terminated,
        },
        {
          text: ProcessStatus.Withdrawn,
          value: ProcessStatus.Withdrawn,
        },
      ],
    },
    idValue: {
      type: String,
      default: '',
    },
    statusValue: {
      type: String,
      default: '',
    },
    idReadonly: Boolean,
    statusReadonly: Boolean,

  },
  data () {
    return {
      id: this.idValue,
      status: this.statusValue,
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
    /** @param {PI[]} args */
    provider (args) {
      return args.filter(arg => {
        const id = arg.id || ''
        const status = arg.status || ''
        const idF = this.id || ''
        const statusF = this.status || ''
        return id.toString().startsWith(idF) &&
          status.toLowerCase().startsWith(statusF.toLowerCase())
      })
    },
  },
}
</script>
