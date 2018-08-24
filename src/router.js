import Vue from 'vue';
import Router from 'vue-router';
import Dashboard from './views/Dashboard.vue';

Vue.use(Router);

export default new Router({
  mode: 'history',
  base: process.env.BASE_URL,
  linkExactActiveClass: 'is-active',
  routes: [
    {
      path: '/',
      name: 'dashboard',
      component: Dashboard,
    },
    {
      path: '/files',
      name: 'files',
      component: () => import('./views/Files.vue'),
    },
    {
      path: '/file/:sha256_digest/:tab?',
      name: 'file',
      props: true,
      component: () => import('./views/Sample.vue'),
    },
    {
      path: '/memories',
      name: 'memories',
      component: () => import('./views/Memories.vue'),
    },
    {
      path: '/memory/:sha256_digest/:tab?',
      name: 'memory',
      props: true,
      component: () => import('./views/Sample.vue'),
    },
  ],
});
