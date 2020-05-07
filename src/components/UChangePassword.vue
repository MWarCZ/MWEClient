<template>
  <v-form v-model="valid" ref="form">
    <v-row justify="center">
      <v-text-field
        label="Staré heslo"
        v-model="oldPassword"
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
        label="Nové heslo"
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
        label="Nové heslo znovu"
        v-model="newPasswordCheck"
        outlined
        required
        filled
        :type="showPassword ? 'text' : 'password'"
        :rules="[value => value === newPassword, value => value.length > 0]"
      ></v-text-field>
    </v-row>
    <slot name="form-extend" :loading="loading"></slot>
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

      showPassword: false,

      oldPassword: '',
      newPassword: '',
      newPasswordCheck: '',
    }
  },

  methods: {
    emitEvents () {
      const payload = {
        oldPassword: this.oldPassword,
        newPassword: this.newPassword,
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
      this.oldPassword = this.newPassword = this.newPasswordCheck = ''
    },
    restart () {
      this.oldPassword = this.newPassword = this.newPasswordCheck = ''
    },
  },
}
</script>
