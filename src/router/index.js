import Vue from 'vue'
import Router from 'vue-router'
import Analysis from '@/components/Analysis'
import Files from '@/components/Files'
import File from '@/components/File'
import Dashboard from '@/components/Dashboard'
import Details from '@/components/Details'
import Error from '@/components/Error'
import Interfaces from '@/components/Interfaces'
import Memories from '@/components/Memories'
import Notes from '@/components/Notes'
import Upload from '@/components/Upload'

Vue.use(Router)

const router = new Router({
  routes: [
    {
      path: '*',
      name: '404',
      component: Error
    },
    {
      path: '/',
      redirect: {
        name: 'Dashboard'
      }
    },
    {
      path: '/dashboard',
      name: 'Dashboard',
      component: Dashboard,
      meta: {title: 'Dashboard'}
    },
    {
      path: '/files',
      name: 'Files',
      component: Files,
      meta: {title: 'Files'}
    },
    {
      path: '/file/:sha256_digest',
      component: File,
      props: true,
      children: [
        {
          name: 'File',
          path: '',
          component: Details,
          meta: {title: 'File / Details'}
        },
        {
          path: 'notes',
          component: Notes,
          meta: {title: 'File / Notes'}
        },
        {
          path: 'interfaces',
          component: Interfaces,
          meta: {title: 'File / Interfaces'}
        },
        {
          path: 'analysis',
          component: Analysis,
          meta: {title: 'File / Analysis'}
        }
      ]
    },
    {
      path: '/memories',
      name: 'Memories',
      component: Memories,
      meta: {title: 'Memories'}
    },
    {
      path: '/memory/:sha256_digest',
      component: File,
      props: true,
      meta: {title: 'Memories'},
      children: [
        {
          name: 'Memory',
          path: '',
          component: Details,
          meta: {title: 'Memory / Details'}
        },
        {
          path: 'notes',
          component: Notes,
          meta: {title: 'Memory / Notes'}
        },
        {
          path: 'interfaces',
          component: Interfaces,
          meta: {title: 'Memory / Interfaces'}
        },
        {
          path: 'analysis',
          component: Analysis,
          meta: {title: 'Memory / Analysis'}
        }
      ]
    },
    {
      path: '/upload',
      name: 'Upload',
      component: Upload,
      meta: {title: 'Upload'}
    }
  ]
})

router.beforeEach((to, from, next) => {
  document.title = 'Snake - ' + to.meta.title
  next()
})

export default router
