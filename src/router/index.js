import Vue from 'vue'
import VueRouter from 'vue-router'

import Home from '../views/Home.vue'

// import Login from '../views/Login.vue'

// import PageMyNIs from '../views/bpmn/Page_MyNIs.vue'
// import PageNI from '../views/bpmn/Page_NI.vue'
// import PageNIs from '../views/bpmn/Page_NIs.vue'
// import PagePI from '../views/bpmn/Page_PI.vue'
// import PagePT from '../views/bpmn/Page_PT.vue'
// import PagePTs from '../views/bpmn/Page_PTs.vue'
// import PagePIs from '../views/bpmn/Page_PIs.vue'
Vue.use(VueRouter)

const routes = [
  {
    path: '/pts',
    component: () => import(/* webpackChunkName: "pts" */ '../views/bpmn/Page_PTs.vue'),
  },
  {
    path: '/pt/:id',
    component: () => import(/* webpackChunkName: "pt" */ '../views/bpmn/Page_PT.vue'),
  },
  {
    path: '/pi/:id',
    component: () => import(/* webpackChunkName: "pi" */ '../views/bpmn/Page_PI.vue'),
  },
  {
    path: '/ni/:id',
    component: () => import(/* webpackChunkName: "ni" */ '../views/bpmn/Page_NI.vue'),
  },
  {
    path: '/nis4me',
    component: () => import(/* webpackChunkName: "nis4me" */ '../views/bpmn/Page_NIs.vue'),
  },
  {
    path: '/mynis',
    component: () => import(/* webpackChunkName: "mynis" */ '../views/bpmn/Page_MyNIs.vue'),
  },
  {
    path: '/',
    name: 'Home',
    component: Home,
  },
  {
    path: '/login',
    name: 'Login',
    component: () => import(/* webpackChunkName: "login" */ '../views/Login.vue'),
  },
  // {
  //   path: '/about',
  //   name: 'About',
  //   // route level code-splitting
  //   // this generates a separate chunk (about.[hash].js) for this route
  //   // which is lazy-loaded when the route is visited.
  //   component: () => import(/* webpackChunkName: "about" */ '../views/About.vue'),
  // },
  {
    path: '/groups',
    name: 'Groups',
    component: () => import(/* webpackChunkName: "groups" */ '../views/Groups.vue'),
  },
  {
    path: '/users',
    name: 'Users',
    component: () => import(/* webpackChunkName: "users" */ '../views/Users.vue'),
  },
]

const router = new VueRouter({
  mode: 'history',
  base: process.env.BASE_URL,
  routes,
})

export default router
