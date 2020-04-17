// @emit submit { name: string, candidateManager: string, isExecutable: boolean }
// @emit success { name: string, candidateManager: string, isExecutable: boolean }
// @emit fail { name: string, candidateManager: string, isExecutable: boolean }
<template>
  <v-form v-model="valid" ref="form">

    <v-row justify="center">
      <v-text-field
        label="Název"
        v-model="newName"
        outlined
        required
        filled
        hint="Název procesu."
      ></v-text-field>
    </v-row>

    <v-row justify="center">
      <v-text-field
        label="Kandidát na managera"
        v-model="newCandidateManager"
        outlined
        required
        filled
        hint="Název skupiny. Lide ve skupině budou kandidáti na managera."
      ></v-text-field>
    </v-row>

    <v-row justify="center">
      <v-switch
        :label="(newIsExecutable)?`Je spustitelný`: `Není spustitelný`"
        v-model="newIsExecutable"
      ></v-switch>
    </v-row>

    <v-row justify="center">
      <v-btn
        @click="emitEvents"
        :disabled="!valid"
        color="primary"
        block
      >
        <v-progress-circular v-if="loading" indeterminate />
        <span v-else>{{submitTitle}}</span>
      </v-btn>
    </v-row>

  </v-form>
</template>
<script>
export default {
  props: {
    name: {
      type: String,
      default: 'x',
    },
    candidateManager: {
      type: String,
      default: '',
    },
    isExecutable: {
      type: Boolean,
      default: false,
    },
    loading: Boolean,
    submitTitle: {
      type: String,
      default: 'Odeslat',
    },
    cleanOnSuccess: Boolean,
    cleanOnFail: Boolean,
  },
  data () {
    return {
      valid: false,
      newName: this.name,
      newCandidateManager: this.candidateManager,
      newIsExecutable: this.isExecutable,
    }
  },
  methods: {
    emitEvents () {
      const payload = {
        name: this.newName,
        candidateManager: this.newCandidateManager,
        isExecutable: this.newIsExecutable,
      }
      this.$emit('submit', payload)
      if (this.valid) {
        this.$emit('success', payload)
        if (this.cleanOnSuccess) {
          this.restart()
        }
      } else {
        this.$emit('fail', payload)
        if (this.cleanOnFail) {
          this.restart()
        }
      }
    },
    restart () {
      this.newName = this.name
      this.newCandidateManager = this.candidateManager
      this.newIsExecutable = this.isExecutable
    },
  },
}
</script>
