import Vue from 'vue'
import VueRouter from 'vue-router'

import PageMyNIs from '../views/bpmn/Page_MyNIs.vue'
import PageNI from '../views/bpmn/Page_NI.vue'
import PageNIs from '../views/bpmn/Page_NIs.vue'
import PagePI from '../views/bpmn/Page_PI.vue'
import PagePT from '../views/bpmn/Page_PT.vue'
import PagePTs from '../views/bpmn/Page_PTs.vue'
import Groups from '../views/Groups.vue'
import Home from '../views/Home.vue'
import Login from '../views/Login.vue'
import NIClaim from '../views/NIClaim.vue'
import PI from '../views/PI.vue'
import ProcessInstances from '../views/ProcessInstances.vue'
import ProcessTemplates from '../views/ProcessTemplates.vue'
import Test from '../views/Test.vue'
import Users from '../views/Users.vue'

// import PagePIs from '../views/bpmn/Page_PIs.vue'
Vue.use(VueRouter)

const routes = [
  {
    path: '/pts',
    component: PagePTs,
  },
  {
    path: '/pt/:id',
    component: PagePT,
  },
  {
    path: '/pi/:id',
    component: PagePI,
  },
  {
    path: '/ni/:id',
    component: PageNI,
  },
  {
    path: '/nis4me',
    component: PageNIs,
  },
  {
    path: '/mynis',
    component: PageMyNIs,
  },
  {
    path: '/',
    name: 'Home',
    component: Home,
  },
  {
    path: '/login',
    name: 'Login',
    component: Login,
  },
  {
    path: '/about',
    name: 'About',
    // route level code-splitting
    // this generates a separate chunk (about.[hash].js) for this route
    // which is lazy-loaded when the route is visited.
    component: () => import(/* webpackChunkName: "about" */ '../views/About.vue'),
  },
  {
    path: '/groups',
    name: 'Groups',
    component: Groups,
  },
  {
    path: '/users',
    name: 'Users',
    component: Users,
  },
  {
    path: '/processtemplates',
    name: 'ProcessTemplates',
    component: ProcessTemplates,
  },
  {
    path: '/processinstances',
    name: 'ProcessInstances',
    component: ProcessInstances,
  },
  {
    path: '/claim',
    name: 'ClaimNodeInstance',
    component: NIClaim,
  },
  {
    path: '/processinstance/:id',
    component: PI,
  },
  {
    path: '/processinstance/:id/:scope',
    component: PI,
  },
  {
    path: '/test',
    component: Test,
  },
]

const router = new VueRouter({
  mode: 'history',
  base: process.env.BASE_URL,
  routes,
})

export default router
