// @emit submit Odesalani formulare.
// @emit success Uspesne obdrzena odpoved s daty.
// @emit fail Neuspesna odpoved nebo selhani spojeni.
<template>
  <v-card :loading="loading">
      <v-alert :type="alertType" dismissible v-model="alertShow">
        {{alertMessage}}
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
          clearable
        ></v-text-field>
        <v-text-field
          label="Heslo"
          v-model="password"
          required
          :rules="[value => !!value]"
          :append-icon="showPassword ? 'mdi-eye' : 'mdi-eye-off'"
          :type="showPassword ? 'text' : 'password'"
          clearable
          @click:append="showPassword = !showPassword"
          @keydown.enter="submit"
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
        <div>
          <v-radio-group v-model="expires" label="Limit platnosti přihlášení:">
            <v-radio label="1 hodina" value="1h"></v-radio>
            <v-radio label="8 hodin" value="8h"></v-radio>
            <v-radio label="1 den" value="1d"></v-radio>
          </v-radio-group>
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

export default {
  props: {
    loading: Boolean,
    alertShow: {
      type: Boolean,
      default: false,
    },
    alertMessage: {
      type: String,
      default: 'Nepodarilo se neco.',
    },
    alertType: {
      type: String,
      default: 'error',
    },
  },
  data: () => ({
    valid: false,
    login: '',
    password: '',
    showPassword: false,
    expires: '1h',
  }),

  methods: {
    submit () {
      const valid = this.$refs.form.validate()
      const payload = {
        login: this.login,
        password: this.password,
        expires: this.expires,
      }
      this.$emit('submit', payload)
      if (valid) {
        this.$emit('success', payload)
      } else {
        this.$emit('fail', payload)
      }
    },
    clear () {
      this.$refs.form.reset()
    },
    log (...args) {
      console.log('ARGS', args)
    },
  },
}
</script>
