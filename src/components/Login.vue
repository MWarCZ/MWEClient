<template>
  <v-card :loading="loading">
      <v-alert :type="alertLogin.type" dismissible v-model="alertLogin.show">
        {{alertLogin.message}}
      </v-alert>
    <v-card-title primary-title>
      Přihlášení
    </v-card-title>
    <v-card-text>
      <v-form v-model="valid" ref="form" lazy-validation>
        <v-text-field
          label="Login"
          v-model="login"
          :rules="[value => !!value]"
          required
        ></v-text-field>
        <v-text-field
          label="Heslo"
          v-model="password"
          required
          :rules="[value => !!value]"
          :append-icon="showPassword ? 'mdi-eye' : 'mdi-eye-off'"
          :type="showPassword ? 'text' : 'password'"
          @click:append="showPassword = !showPassword"
        />
        <div class="text-center justify-center">
          <v-btn x-large icon disabled>
            <v-icon color="blue darken-4">mdi-facebook</v-icon>
          </v-btn>
          <v-btn x-large icon disabled>
            <v-icon color="red darken-4">mdi-google</v-icon>
          </v-btn>
          <v-btn x-large icon disabled>
            <v-icon color="black">mdi-github</v-icon>
          </v-btn>
        </div>
      </v-form>
    </v-card-text>
    <v-card-actions class="justify-center">
      <v-btn
        @click="submit"
        :disabled="!valid"
        x-large
        block
        color="primary"
      >
        <v-progress-circular v-if="loading"
          indeterminate
        />
        <span v-else>Přihlásit se</span>
      </v-btn>
    </v-card-actions>

  </v-card>
</template>

<script>
// import axios from 'axios'

export default {
  data: () => ({
    valid: false,
    login: '',
    password: '',
    showPassword: false,
    loading: false,
    alertLogin: {
      show: false,
      message: 'Nepodarilo se prihlasit',
      type: 'error',
    },
  }),

  methods: {
    submit () {
      if (this.$refs.form.validate()) {
        // Native form submission is not yet supported
        // axios.post('/api/submit', {
        //   name: this.name,
        //   email: this.email,
        //   select: this.select,
        //   checkbox: this.checkbox
        // })
        this.loading = true
      }
      const valid = this.$refs.form.validate()
      console.log('log', valid)
      // this.$emit('submit:it', valid)
      setTimeout(x => {
        this.loading = false
        // this.$emit('submit:it', valid)
        this.alertLogin.show = true
      }, 2000)
    },
    clear () {
      this.$refs.form.reset()
    },
  },
}
</script>
