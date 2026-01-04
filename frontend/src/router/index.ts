import { createRouter, createWebHistory, RouteRecordRaw } from 'vue-router';
import { useUserStore } from '@/store';

const routes: RouteRecordRaw[] = [
  {
    path: '/login',
    name: 'Login',
    component: () => import('@/views/Login.vue'),
    meta: { requiresAuth: false },
  },
  {
    path: '/register',
    name: 'Register',
    component: () => import('@/views/Register.vue'),
    meta: { requiresAuth: false },
  },
  {
    path: '/',
    component: () => import('@/views/Layout.vue'),
    meta: { requiresAuth: true },
    redirect: '/projects',
    children: [
      {
        path: 'projects',
        name: 'Projects',
        component: () => import('@/views/Projects.vue'),
      },
      {
        path: 'projects/create',
        name: 'CreateProject',
        component: () => import('@/views/ProjectForm.vue'),
      },
      {
        path: 'projects/:id/edit',
        name: 'EditProject',
        component: () => import('@/views/ProjectForm.vue'),
      },
      {
        path: 'stats/:projectId',
        name: 'Stats',
        component: () => import('@/views/Stats.vue'),
      },
      {
        path: 'profile',
        name: 'Profile',
        component: () => import('@/views/Profile.vue'),
      },
    ],
  },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

// Navigation guard
router.beforeEach((to, from, next) => {
  const userStore = useUserStore();

  if (to.meta.requiresAuth && !userStore.isLoggedIn) {
    next('/login');
  } else if ((to.name === 'Login' || to.name === 'Register') && userStore.isLoggedIn) {
    next('/projects');
  } else {
    next();
  }
});

export default router;
