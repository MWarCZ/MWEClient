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
        :rules="[value => !!value]"
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
      ></v-text-field>
      <v-text-field
        label="Příjmení"
        v-model="newLastName"
        outlined
        required
        filled
      ></v-text-field>
    </v-row>
    <v-row justify="center">
      <v-text-field
        label="Email"
        v-model="newEmail"
        outlined
        required
        filled
      ></v-text-field>
    </v-row>
    <v-row justify="center">
      <v-text-field
        label="Heslo"
        v-model="newPassword"
        required
        outlined
        filled
        :rules="[value => !!value]"
        :append-icon="showPassword ? 'mdi-eye' : 'mdi-eye-off'"
        :type="showPassword ? 'text' : 'password'"
        @click:append="showPassword = !showPassword"
      />
    </v-row>
    <v-row justify="center">
      <v-text-field
        label="Heslo znovu"
        v-model="newPasswordCheck"
        outlined
        required
        filled
        :type="showPassword ? 'text' : 'password'"
        :rules="[value => value === newPassword, value => value.length > 0]"
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
    cleanOnSuccess: Boolean,
    cleanOnFail: Boolean,
  },
  data () {
    return {
      valid: false,
      showPassword: false,

      newLogin: this.login,
      newFirstName: this.firstName,
      newLastName: this.lastName,
      newEmail: this.email,
      newPassword: '',
      newPasswordCheck: '',
    }
  },
  methods: {
    emitEvents () {
      const payload = {
        login: this.newLogin,
        firstName: this.newFirstName,
        lastName: this.newLastName,
        email: this.newEmail,
        password: this.newPassword,
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
    clean () {
      this.newLogin = this.newFirstName = this.newLastName = this.newEmail = ''
      this.newPassword = this.newPasswordCheck = ''
    },
    restart () {
      this.newLogin = this.login
      this.newFirstName = this.firstName
      this.newLastName = this.lastName
      this.newEmail = this.email
      this.newPassword = this.newPasswordCheck = ''
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
