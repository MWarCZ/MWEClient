// @emit input NI[]
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
import { ActivityStatus } from '../helpers'
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
        //   text: ActivityStatus.None,
        //   value: ActivityStatus.None,
        // },
        {
          text: ActivityStatus.Ready,
          value: ActivityStatus.Ready,
        },
        {
          text: ActivityStatus.Active,
          value: ActivityStatus.Active,
        },
        {
          text: ActivityStatus.Waiting,
          value: ActivityStatus.Waiting,
        },
        // {
        // text: ActivityStatus.Completing,
        // value: ActivityStatus.Completing,
        // },
        {
          text: ActivityStatus.Completed,
          value: ActivityStatus.Completed,
        },
        // {
        // text: ActivityStatus.Falling,
        // value: ActivityStatus.Falling,
        // },
        {
          text: ActivityStatus.Failled,
          value: ActivityStatus.Failled,
        },
        {
          text: ActivityStatus.Withdrawn,
          value: ActivityStatus.Withdrawn,
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
      id: this.id,
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
