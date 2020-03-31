// @emit submit @param { login, firstName, lastName, email }
// @emit success @param { login, firstName, lastName, email }
// @emit fail @param { login, firstName, lastName, email }
<template>
  <v-form v-model="valid" ref="form">
    <v-row justify="center">
      <v-text-field
        label="Login"
        v-model="newLogin"
        :readonly="readonlyLogin"
        outlined
        required
        filled
        clearable
        :hint="readonlyLogin?'Login není možné upravit.':''"
      ></v-text-field>
    </v-row>
    <v-row justify="center">
      <v-text-field
        label="Jméno"
        v-model="newFirstName"
        outlined
        required
        filled
        clearable
      ></v-text-field>
      <v-text-field
        label="Příjmení"
        v-model="newLastName"
        outlined
        required
        filled
        clearable
      ></v-text-field>
    </v-row>
    <v-row justify="center">
      <v-text-field
        label="Email"
        v-model="newEmail"
        outlined
        required
        filled
        clearable
      ></v-text-field>
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
    login: {
      type: String,
      default: '',
    },
    firstName: {
      type: String,
      default: '',
    },
    lastName: {
      type: String,
      default: '',
    },
    email: {
      type: String,
      default: '',
    },
    readonlyLogin: Boolean,
    loading: Boolean,
    submitTitle: {
      type: String,
      default: 'Odeslat',
    },
  },
  data () {
    return {
      valid: false,
      newLogin: this.login,
      newFirstName: this.firstName,
      newLastName: this.lastName,
      newEmail: this.email,
    }
  },
  methods: {
    emitEvents () {
      const payload = {
        login: this.newLogin,
        firstName: this.newFirstName,
        lastName: this.newLastName,
        email: this.newEmail,
      }
      this.$emit('submit', payload)
      if (this.valid) {
        this.$emit('success', payload)
        this.login = this.firstName = this.lastName = this.email = ''
      } else {
        this.$emit('fail', payload)
      }
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
