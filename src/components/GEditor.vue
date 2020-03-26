<template>
  <v-form v-model="valid" ref="form" lazy-validation>
    <v-text-field
      label="Name"
      v-model="newName"
      :readonly="nameReadOnly"
      required
    ></v-text-field>
    <v-text-field
      label="E-mail"
      v-model="newDescribe"
      required
    ></v-text-field>

    <v-btn
      @click="submit"
      :disabled="!valid"
    >
      Odeslat/Uložit
    </v-btn>
  </v-form>

</template>
<script>

export default {
  props: {
    name: {
      type: String,
    },
    describe: {
      type: String,
    },
    nameReadOnly: {
      type: Boolean,
      default: false,
    },
  },
  data: () => ({
    valid: false,
    newName: this.name,
    newDescribe: this.describe,
  }),
  methods: {
    emitSubmit (name, describe) {
      this.$emit('submit', { name, describe })
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
