// @emit submit @param { name, describe }
// @emit success @param { name, describe }
// @emit fail @param { name, describe }
<template>
  <v-form v-model="valid" ref="form">
    <v-row justify="center">
      <v-file-input
        label="Vyber soubor s BPMN defnicí"
        outlined
        required
        filled
        :rules="[value=>!!value]"
        accept=".bpmn,.bpmn2,.xml"
      ></v-file-input>
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
      newDescribe: this.describe,
    }
  },
  methods: {
    emitEvents () {
      const payload = {
        name: this.newName,
        describe: this.newDescribe,
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
      this.newDescribe = this.describe
    },
  },

}
</script>
<style lang="scss" scoped>
  .removed {
    background-color: #ff00002e;
  }
  .protected {
    background-color: #3f3fb53b;
  }
  .normal {
    background-color: #3fb53f3b;
  }
</style>
