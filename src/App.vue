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
      <v-btn icon @click="log">
        <v-icon>mdi-magnify</v-icon>
      </v-btn>
      <v-btn  text>
        <v-icon>mdi-account-circle</v-icon>
        Login
      </v-btn>
      <template #extension>
        <v-tabs>
          <v-tab to="/">Home</v-tab>
          <v-tab to="/about">About</v-tab>
          <v-tab to="/login">Login</v-tab>
        </v-tabs>
      </template>
    </v-app-bar>

    <v-content>
      <v-container fluid>
        <router-view/>
        <v-overlay
          :value="dialog"
          :opacity="0.9"
          :dark="false"
          >
          <Login @submit:it="dialog = !$event"/>
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

export default {
  name: 'App',

  components: {
    // ApolloExample
    Login,
  },

  apollo: {
    hello: {
      query: gqlHello,
    },
  },

  data: () => {
    return {
      isDark: true,
      dialog: true,
    }
  },
  methods: {
    log () {
      console.log(this)
    },
    toggleTheme (event) {
      console.log(event)
    },
  },

}
</script>
