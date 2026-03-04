<template>
  <header class="navbar">
    <div class="navbar-inner">
      <!-- Brand -->
      <router-link to="/tickets" class="navbar-brand">
        <div class="logo-mark">S</div>
        <span class="logo-text">SupportDesk</span>
      </router-link>

      <!-- Desktop nav links -->
      <nav class="navbar-nav">
        <template v-if="isCustomer">
          <router-link to="/tickets" class="nav-link" active-class="nav-link--active">
            My Tickets
          </router-link>
          <router-link to="/tickets/new" class="nav-link" active-class="nav-link--active">
            New Ticket
          </router-link>
        </template>
        <template v-if="isAgent">
          <router-link to="/tickets" class="nav-link" active-class="nav-link--active">
            Dashboard
          </router-link>
          <router-link
            :to="{ path: '/tickets', query: { status: 'open' } }"
            class="nav-link"
          >
            Open
          </router-link>
          <router-link
            :to="{ path: '/tickets', query: { status: 'closed' } }"
            class="nav-link"
          >
            Closed
          </router-link>
        </template>
      </nav>

      <!-- Right side -->
      <div class="navbar-right">
        <div class="user-chip">
          <AppAvatar :name="auth.user?.name" :size="26" />
          <span class="user-name">{{ auth.user?.name }}</span>
          <span v-if="isAgent" class="role-badge">Agent</span>
        </div>
        <button class="sign-out-btn" @click="signOut">Sign out</button>

        <!-- Hamburger (mobile only) -->
        <button class="hamburger" @click="mobileOpen = !mobileOpen" aria-label="Toggle menu">
          <span class="hamburger-line" />
          <span class="hamburger-line" />
          <span class="hamburger-line" />
        </button>
      </div>
    </div>

    <!-- Mobile drawer -->
    <div v-if="mobileOpen" class="mobile-menu">
      <template v-if="isCustomer">
        <router-link to="/tickets" class="mobile-link" @click="mobileOpen = false">
          My Tickets
        </router-link>
        <router-link to="/tickets/new" class="mobile-link" @click="mobileOpen = false">
          New Ticket
        </router-link>
      </template>
      <template v-if="isAgent">
        <router-link to="/tickets" class="mobile-link" @click="mobileOpen = false">
          Dashboard
        </router-link>
        <router-link
          :to="{ path: '/tickets', query: { status: 'open' } }"
          class="mobile-link"
          @click="mobileOpen = false"
        >
          Open Tickets
        </router-link>
        <router-link
          :to="{ path: '/tickets', query: { status: 'closed' } }"
          class="mobile-link"
          @click="mobileOpen = false"
        >
          Closed Tickets
        </router-link>
      </template>

      <div class="mobile-divider" />

      <div class="mobile-user">
        <AppAvatar :name="auth.user?.name" :size="32" />
        <div>
          <div class="mobile-user-name">{{ auth.user?.name }}</div>
          <div class="mobile-user-role">{{ isAgent ? 'Support Agent' : 'Customer' }}</div>
        </div>
      </div>
      <button class="mobile-sign-out" @click="signOut">Sign out</button>
    </div>
  </header>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import AppAvatar from '@/components/AppAvatar.vue'

const auth = useAuthStore()
const router = useRouter()

const mobileOpen = ref(false)
const isAgent = computed(() => auth.isAgent)
const isCustomer = computed(() => auth.isCustomer)

function signOut() {
  mobileOpen.value = false
  auth.signOut()
  router.push('/login')
}
</script>

<style scoped>
.navbar {
  position: sticky;
  top: 0;
  z-index: 100;
  background: #111118;
  border-bottom: 1px solid #1E1E2E;
  width: 100%;
}

.navbar-inner {
  display: flex;
  align-items: center;
  padding: 0 24px;
  height: 56px;
  gap: 20px;
}

/* Brand */
.navbar-brand {
  display: flex;
  align-items: center;
  gap: 9px;
  text-decoration: none;
  flex-shrink: 0;
}

.logo-mark {
  width: 28px;
  height: 28px;
  border-radius: 8px;
  background: linear-gradient(135deg, #6366F1, #818CF8);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 13px;
  font-weight: 800;
  color: #fff;
  flex-shrink: 0;
}

.logo-text {
  font-size: 15px;
  font-weight: 700;
  color: #F1F1F3;
  letter-spacing: -0.02em;
}

/* Desktop nav */
.navbar-nav {
  display: flex;
  align-items: center;
  gap: 2px;
  flex: 1;
}

.nav-link {
  padding: 6px 12px;
  border-radius: 7px;
  font-size: 13px;
  font-weight: 500;
  color: #9494A8;
  text-decoration: none;
  transition: all 0.1s;
  white-space: nowrap;
}

.nav-link:hover {
  color: #F1F1F3;
  background: rgba(255, 255, 255, 0.05);
}

.nav-link--active {
  color: #818CF8;
  background: rgba(99, 102, 241, 0.1);
}

/* Right side */
.navbar-right {
  display: flex;
  align-items: center;
  gap: 10px;
  flex-shrink: 0;
  margin-left: auto;
}

.user-chip {
  display: flex;
  align-items: center;
  gap: 8px;
}

.user-name {
  font-size: 13px;
  font-weight: 500;
  color: #F1F1F3;
  white-space: nowrap;
}

.role-badge {
  font-size: 10px;
  font-weight: 700;
  background: #312E81;
  color: #818CF8;
  padding: 2px 7px;
  border-radius: 999px;
  letter-spacing: 0.04em;
}

.sign-out-btn {
  padding: 6px 12px;
  background: transparent;
  border: 1px solid #1E1E2E;
  border-radius: 7px;
  font-size: 12px;
  font-weight: 500;
  color: #9494A8;
  cursor: pointer;
  transition: all 0.1s;
  white-space: nowrap;
}

.sign-out-btn:hover {
  border-color: #2a2a3e;
  color: #F1F1F3;
}

/* Hamburger */
.hamburger {
  display: none;
  flex-direction: column;
  gap: 4px;
  background: transparent;
  border: none;
  cursor: pointer;
  padding: 6px;
  border-radius: 6px;
}

.hamburger-line {
  display: block;
  width: 18px;
  height: 2px;
  background: #9494A8;
  border-radius: 2px;
}

/* Mobile menu */
.mobile-menu {
  display: none;
  flex-direction: column;
  padding: 10px 16px 16px;
  border-top: 1px solid #1E1E2E;
  background: #111118;
  gap: 2px;
}

.mobile-link {
  display: block;
  padding: 10px 12px;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 500;
  color: #9494A8;
  text-decoration: none;
  transition: all 0.1s;
}

.mobile-link:hover {
  color: #F1F1F3;
  background: rgba(255, 255, 255, 0.05);
}

.mobile-divider {
  height: 1px;
  background: #1E1E2E;
  margin: 8px 0;
}

.mobile-user {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 8px 12px;
}

.mobile-user-name {
  font-size: 13px;
  font-weight: 600;
  color: #F1F1F3;
}

.mobile-user-role {
  font-size: 11px;
  color: #4A4A62;
  margin-top: 1px;
}

.mobile-sign-out {
  margin-top: 4px;
  padding: 10px 12px;
  border-radius: 8px;
  background: transparent;
  border: 1px solid #1E1E2E;
  font-size: 13px;
  font-weight: 500;
  color: #9494A8;
  cursor: pointer;
  text-align: left;
  transition: all 0.1s;
}

.mobile-sign-out:hover {
  color: #EF4444;
  border-color: rgba(239, 68, 68, 0.3);
}

/* Responsive breakpoints */
@media (max-width: 768px) {
  .navbar-nav,
  .user-name,
  .role-badge,
  .sign-out-btn {
    display: none;
  }

  .hamburger {
    display: flex;
  }

  .mobile-menu {
    display: flex;
  }
}
</style>
