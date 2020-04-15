<template>
  <v-container>
    <div v-if="client">OK</div>
    <div v-else>KO</div>
    <Login />
  </v-container>
</template>

<script>
// @ is an alias to /src
import Login from '@/components/Login.vue'
import gqlClient from '../graphql/Client.gql'

export default {
  name: 'LoginView',
  components: {
    Login,
  },
  data: () => ({
    client: null,
  }),
  apollo: {
    client () {
      return {
        query: gqlClient,
      }
    },
  },
}
</script>
