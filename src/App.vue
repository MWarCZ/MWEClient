<template>
  <v-app>
    <v-navigation-drawer app
      permanent
      :mini-variant="miniMenu"
      clipped
      :expand-on-hover="miniMenu"
    >
      <v-list
        nav
      >
        <!-- <v-list-item @click="toggleMenuSize">
          <v-list-item-icon>
            <v-icon>mdi-menu</v-icon>
          </v-list-item-icon>
          <v-list-item-content></v-list-item-content>
        </v-list-item> -->

        <v-list-item
          v-for="(item, index) in appMenuItems"
          :key="`appmenuitem-${index}`"
          :to="item.link">
          <v-list-item-icon>
            <v-icon>{{item.icon}}</v-icon>
          </v-list-item-icon>
          <v-list-item-content>
            <v-list-item-title>{{item.title}}</v-list-item-title>
          </v-list-item-content>
        </v-list-item>

      </v-list>

    </v-navigation-drawer>

    <v-app-bar
      app
      clipped-left
    >
      <v-app-bar-nav-icon @click="toggleMenuSize"></v-app-bar-nav-icon>
      <v-spacer/>
      <!-- <v-btn icon @click="log">
        <v-icon x-large>mdi-home</v-icon>
      </v-btn> -->
      <v-toolbar-title>MWEClient</v-toolbar-title>
      <v-spacer></v-spacer>
      <v-btn icon @click="nightMode = !nightMode">
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

      <!-- <template #extension v-if="client">
        <v-tabs>
          <v-tab to="/">Home</v-tab>
          <v-tab to="/about">About</v-tab>
          <v-tab to="/groups">Groups</v-tab>
          <v-tab to="/users">Users</v-tab>
          <v-tab to="/processtemplates">Šablony procesů</v-tab>
          <v-tab to="/login">Login</v-tab>
        </v-tabs>
      </template> -->
    </v-app-bar>

    <v-content>
      <v-container fluid>
        <!-- <router-view /> -->
        <router-view v-if="client"/>
        <!-- <v-overlay
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
        </v-overlay> -->

      </v-container>
    </v-content>

    <v-footer app>
      <span>&copy; 2020</span>
    </v-footer>

    <FullDialog :value="!client" title="Přihlášení">
      <v-container>
        <Login class="max-fullscreen"
          :loading="authLoading"
          :alertShow="authAlertShow"
          :alertMessage="authAlertMessage"
          :alertType="authAlertType"
          @success="login"
        />
      </v-container>
    </FullDialog>

  </v-app>
</template>

<script>
// import ApolloExample from './components/ApolloExample'
import Login from './components/Login'
import gqlHello from './graphql/Hello.gql'
import gqlHelloW from './graphql/HelloWorld.gql'
import gqlClient from './graphql/auth/client.gql'
// import gql from 'graphql-tag'
import gqlConnected from './graphql/local/local.gql'
import gqlLogin from './graphql/auth/login.gql'
import { onLogin, onLogout } from './vue-apollo'
import FullDialog from './components/FullDialog'

import { setSimulateLoading } from './simulateLoading'

const SETTINGS_NIGHTMODE = 'NIGHTMODE'

export default {
  name: 'App',

  components: {
    // ApolloExample
    Login,
    FullDialog,
  },

  data: () => {
    return {
      nightMode: false,
      dialog: true,
      client: null,
      authLoading: false,
      authAlertShow: false,
      authAlertMessage: 'Nepodařilo se přihlásit.',
      authAlertType: 'error',
      checkLoginInLoop: false,
      miniMenu: true,

      /** @type {{icon: string, title: string, link: string}[]} */
      appMenuItems: [
        {
          link: '/',
          title: 'Home',
          icon: 'mdi-home',
        },
        {
          link: '/pts',
          title: 'Šablony procesů',
          icon: 'mdi-book-multiple',
        },
        {
          link: '/nis4me',
          title: 'Uzly pro mne',
          icon: 'mdi-book-multiple',
        },
        {
          link: '/mynis',
          title: 'Moje uzly',
          icon: 'mdi-book-multiple',
        },
        {
          link: '/groups',
          title: 'Skupiny',
          icon: 'mdi-account-group',
        },
        {
          link: '/users',
          title: 'Uživatele',
          icon: 'mdi-account-multiple',
        },
      ],
    }
  },
  created () {
    setSimulateLoading(true)
    const nightMode = JSON.parse(localStorage.getItem(SETTINGS_NIGHTMODE)) || false
    this.nightMode = nightMode
  },
  watch: {
    nightMode: function (value) {
      this.setNightMode(value)
    },
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
            this.$apollo.queries.client.startPolling(1000 * 60)
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
    setNightMode (value) {
      localStorage.setItem(SETTINGS_NIGHTMODE, JSON.stringify(value))
      this.$vuetify.theme.dark = value
    },
    log () {
      console.log(this)
    },
    toggleTheme (event) {
      console.log(event)
    },
    toggleMenuSize () {
      this.miniMenu = !this.miniMenu
    },
    async login (payload) {
      try {
        this.authLoading = true
        this.authAlertShow = false
        const { login = '', password = '', expires } = payload
        // console.warn(gqlLogin)
        // console.warn(payload)
        const result = await this.$apollo.mutate({
          mutation: gqlLogin,
          variables: {
            login,
            password,
            expires,
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
