<template>
  <v-app>
    <!-- <v-navigation-drawer app>
    </v-navigation-drawer> -->

    <v-app-bar
      app
      extended
      hide-on-scroll
      >
      <!-- <v-app-bar-nav-icon></v-app-bar-nav-icon> -->
      <v-btn icon @click="log">
        <v-icon x-large>mdi-home</v-icon>
      </v-btn>
      <v-toolbar-title>MWEClient</v-toolbar-title>
      <v-spacer></v-spacer>
      <v-btn icon @click="$vuetify.theme.dark = !$vuetify.theme.dark">
        <v-icon>mdi-theme-light-dark</v-icon>
      </v-btn>

      <!-- <v-btn v-if="client" text @click="logout">
        <v-icon>mdi-account-circle</v-icon>
        Logout
      </v-btn>
      <v-btn v-else text>
        <v-icon>mdi-account-circle</v-icon>
        Login
      </v-btn> -->
      <v-menu offset-y>
        <template v-slot:activator="{ on }">
          <v-btn v-if="client" text v-on="on">
            <v-icon>mdi-account-circle</v-icon>
            {{client.login}}
          </v-btn>
          <v-btn v-else text>
            <v-icon>mdi-accout-circle</v-icon>
            Login
          </v-btn>
        </template>
        <v-card v-if="client">
          <v-card-title primary-title>
            {{client.login}} {{client.login}}
          </v-card-title>
          <v-card-text>
            Toto je text xxx.
          </v-card-text>
        </v-card>
        <v-list>
          <v-divider></v-divider>
          <v-list-item @click="logout">
            <v-list-item-icon>
              <v-icon>mdi-logout</v-icon>
            </v-list-item-icon>
            <v-list-item-title>Odhlásit</v-list-item-title>
          </v-list-item>
        </v-list>
      </v-menu>

      <template #extension v-if="client">
        <v-tabs>
          <v-tab to="/">Home</v-tab>
          <v-tab to="/about">About</v-tab>
          <v-tab to="/groups">Groups</v-tab>
          <v-tab to="/login">Login</v-tab>
        </v-tabs>
      </template>
    </v-app-bar>

    <v-content>
      <v-container fluid>
        <router-view />
        <!-- <router-view v-if="client"/> -->
        <v-overlay
          :value="!client"
          :opacity="0.9"
          :dark="false"
          >
          <Login class="max-fullscreen"
            :loading="authLoading"
            :alertShow="authAlertShow"
            :alertMessage="authAlertMessage"
            :alertType="authAlertType"
            @success="login"
          />
        </v-overlay>

      </v-container>
    </v-content>

    <v-footer app>
      <span>&copy; 2020</span>
    </v-footer>

  </v-app>
</template>

<script>
// import ApolloExample from './components/ApolloExample'
import Login from './components/Login'
import gqlHello from './graphql/Hello.gql'
import gqlHelloW from './graphql/HelloWorld.gql'
import gqlClient from './graphql/Client.gql'
// import gql from 'graphql-tag'
import gqlConnected from './graphql/local/local.gql'
import gqlLogin from './graphql/Login.gql'
import { onLogin, onLogout } from './vue-apollo'

export default {
  name: 'App',

  components: {
    // ApolloExample
    Login,
  },

  data: () => {
    return {
      isDark: true,
      dialog: true,
      client: null,
      authLoading: false,
      authAlertShow: false,
      authAlertMessage: 'Nepodařilo se přihlásit.',
      authAlertType: 'error',
      checkLoginInLoop: false,
    }
  },

  apollo: {
    helloW: {
      query: gqlHelloW,
      variables: { name: 'Johan' },
      update: data => data.hello,
    },
    hello: {
      query: gqlHello,
    },
    connected: {
      query: gqlConnected,
    },
    client () {
      return {
        query: gqlClient,
        update (data) {
          if (data.client) {
            this.$apollo.queries.client.startPolling(1000 * 15)
          } else {
            this.$apollo.queries.client.stopPolling()
            this.authAlertShow = false
          }
          // console.log('UPDATE CLIENT', { data, loop: !data.client })
          return data.client
        },
      }
    },
  },

  methods: {
    log () {
      console.log(this)
    },
    toggleTheme (event) {
      console.log(event)
    },
    async login (payload) {
      try {
        this.authLoading = true
        this.authAlertShow = false
        const { login = '', password = '' } = payload
        // console.warn(gqlLogin)
        // console.warn(payload)
        const result = await this.$apollo.mutate({
          mutation: gqlLogin,
          variables: {
            login,
            password,
          },
        })
        this.checkLoginInLoop = true
        this.authAlertShow = true
        this.authAlertMessage = 'Vše se asi zdařilo.'
        this.authAlertType = 'success'
        // console.log(result)
        const token = result.data.login.token
        await onLogin(this.$apolloProvider.defaultClient, token)
      } catch (e) {
        this.authAlertShow = true
        this.authAlertMessage = e.message
        this.authAlertType = 'error'
        console.error(e)
      }
      this.authLoading = false
    },
    async logout () {
      this.checkLoginInLoop = false
      this.authAlertShow = true
      this.authAlertMessage = 'Jste odhlášeni.'
      this.authAlertType = 'info'
      await onLogout(this.$apolloProvider.defaultClient)
    },
  },

}
</script>
<style>
.max-fullscreen {
  max-width: 100%;
  max-height: 100%;
}
</style>
