import { createRouter, createWebHistory } from "vue-router";
import { useAuthStore } from "../stores/auth";

const routes = [
  { path: "/",         redirect: "/tickets" },
  { path: "/login",    component: () => import("../views/Login.vue") },
  { path: "/register", component: () => import("../views/Register.vue") },
  {
    path: "/tickets",
    component: () => import("../views/TicketList.vue"),
    meta: { requiresAuth: true, role: "customer" },
  },
  {
    path: "/tickets/new",
    component: () => import("../views/CreateTicket.vue"),
    meta: { requiresAuth: true, role: "customer" },
  },
  {
    path: "/tickets/:id",
    component: () => import("../views/TicketDetail.vue"),
    meta: { requiresAuth: true },
  },
  // {
  //   path: "/agent/tickets",
  //   component: () => import("../views/agent/AgentTicketList.vue"),
  //   meta: { requiresAuth: true, role: "agent" },
  // },
  // {
  //   path: "/agent/tickets/:id",
  //   component: () => import("../views/agent/AgentTicketDetail.vue"),
  //   meta: { requiresAuth: true, role: "agent" },
  // },
];

const router = createRouter({ history: createWebHistory(), routes });

router.beforeEach((to) => {
  const auth = useAuthStore();
  if (to.meta.requiresAuth && !auth.isAuthenticated) return "/login";
  if (to.meta.role === "agent"    && !auth.isAgent)    return "/tickets";
  if (to.meta.role === "customer" && !auth.isCustomer) return "/agent/tickets";
});

export default router;