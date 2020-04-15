import Vue from 'vue'

import App from './App.vue'
import vuetify from './plugins/vuetify'
import router from './router'
import store from './store'
import { createProvider } from './vue-apollo'

// import './registerServiceWorker'
Vue.config.productionTip = false

new Vue({
  router,
  store,
  vuetify,
  apolloProvider: createProvider(),
  render: h => h(App),
}).$mount('#app')
