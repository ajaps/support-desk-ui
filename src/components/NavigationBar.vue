<template>
  <header class="navbar">
    <div class="navbar-inner">
      <!-- Brand -->
      <router-link to="/tickets" class="navbar-brand">
        <div class="logo-mark">S</div>
        <span class="logo-text">Support Desk</span>
      </router-link>

      <!-- Desktop nav links -->
      <nav class="navbar-nav">
        <template v-if="isCustomer">
          <router-link to="/tickets" :class="['nav-link', { 'nav-link--active': isNavActive(null, '/tickets') }]">
            My Tickets
          </router-link>
          <router-link to="/tickets/new" :class="['nav-link', { 'nav-link--active': route.path === '/tickets/new' }]">
            New Ticket
          </router-link>
        </template>
        <template v-if="isAgent">
          <router-link to="/tickets" :class="['nav-link', { 'nav-link--active': isNavActive(null) }]">
            Dashboard
          </router-link>
          <router-link
            :to="{ path: '/tickets', query: { status: 'open' } }"
            :class="['nav-link', { 'nav-link--active': isNavActive('open') }]"
          >
            Open
          </router-link>
          <router-link
            :to="{ path: '/tickets', query: { status: 'closed' } }"
            :class="['nav-link', { 'nav-link--active': isNavActive('closed') }]"
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

        <!-- Theme toggle -->
        <button
          class="icon-btn"
          :title="themeStore.theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'"
          @click="themeStore.toggle()"
        >
          <!-- Sun (shown in dark mode → click to go light) -->
          <svg v-if="themeStore.theme === 'dark'" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <circle cx="12" cy="12" r="5"/>
            <line x1="12" y1="1" x2="12" y2="3"/>
            <line x1="12" y1="21" x2="12" y2="23"/>
            <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/>
            <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/>
            <line x1="1" y1="12" x2="3" y2="12"/>
            <line x1="21" y1="12" x2="23" y2="12"/>
            <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/>
            <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/>
          </svg>
          <!-- Moon (shown in light mode → click to go dark) -->
          <svg v-else xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
          </svg>
        </button>

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

      <div class="mobile-actions">
        <button class="mobile-theme-btn" @click="themeStore.toggle()">
          <svg v-if="themeStore.theme === 'dark'" xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <circle cx="12" cy="12" r="5"/>
            <line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/>
            <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/>
            <line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/>
            <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/>
          </svg>
          <svg v-else xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
          </svg>
          {{ themeStore.theme === 'dark' ? 'Light mode' : 'Dark mode' }}
        </button>
        <button class="mobile-sign-out" @click="signOut">Sign out</button>
      </div>
    </div>
  </header>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { useThemeStore } from '@/stores/theme'
import AppAvatar from '@/components/AppAvatar.vue'

const auth = useAuthStore()
const route = useRoute()
const router = useRouter()
const themeStore = useThemeStore()

// Returns true when the current route matches the given status filter
function isNavActive(statusKey, path = '/tickets') {
  if (route.path !== path) return false
  const current = route.query.status || null
  return current === statusKey
}

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
  background: var(--bg-surface);
  border-bottom: 1px solid var(--border);
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
  color: var(--text-primary);
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
  color: var(--text-secondary);
  text-decoration: none;
  transition: all 0.1s;
  white-space: nowrap;
}

.nav-link:hover {
  color: var(--text-primary);
  background: var(--accent-bg);
}

.nav-link--active {
  color: var(--accent-hover);
  background: var(--accent-bg);
}

/* Right side */
.navbar-right {
  display: flex;
  align-items: center;
  gap: 8px;
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
  color: var(--text-primary);
  white-space: nowrap;
}

.role-badge {
  font-size: 10px;
  font-weight: 700;
  background: var(--accent-badge-bg);
  color: var(--accent-badge-text);
  padding: 2px 7px;
  border-radius: 999px;
  letter-spacing: 0.04em;
}

/* Icon button (theme toggle) */
.icon-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  background: transparent;
  border: 1px solid var(--border);
  border-radius: 7px;
  color: var(--text-secondary);
  cursor: pointer;
  transition: all 0.1s;
  flex-shrink: 0;
}

.icon-btn:hover {
  border-color: var(--border-strong);
  color: var(--text-primary);
  background: var(--bg-elevated);
}

.sign-out-btn {
  padding: 6px 12px;
  background: transparent;
  border: 1px solid var(--border);
  border-radius: 7px;
  font-size: 12px;
  font-weight: 500;
  color: var(--text-secondary);
  cursor: pointer;
  transition: all 0.1s;
  white-space: nowrap;
}

.sign-out-btn:hover {
  border-color: var(--border-strong);
  color: var(--text-primary);
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
  background: var(--text-secondary);
  border-radius: 2px;
}

/* Mobile menu */
.mobile-menu {
  display: none;
  flex-direction: column;
  padding: 10px 16px 16px;
  border-top: 1px solid var(--border);
  background: var(--bg-surface);
  gap: 2px;
}

.mobile-link {
  display: block;
  padding: 10px 12px;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 500;
  color: var(--text-secondary);
  text-decoration: none;
  transition: all 0.1s;
}

.mobile-link:hover {
  color: var(--text-primary);
  background: var(--bg-elevated);
}

.mobile-divider {
  height: 1px;
  background: var(--border);
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
  color: var(--text-primary);
}

.mobile-user-role {
  font-size: 11px;
  color: var(--text-muted);
  margin-top: 1px;
}

.mobile-actions {
  display: flex;
  flex-direction: column;
  gap: 6px;
  margin-top: 4px;
}

.mobile-theme-btn {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 12px;
  border-radius: 8px;
  background: transparent;
  border: 1px solid var(--border);
  font-size: 13px;
  font-weight: 500;
  color: var(--text-secondary);
  cursor: pointer;
  text-align: left;
  transition: all 0.1s;
}

.mobile-theme-btn:hover {
  color: var(--text-primary);
  border-color: var(--border-strong);
  background: var(--bg-elevated);
}

.mobile-sign-out {
  padding: 10px 12px;
  border-radius: 8px;
  background: transparent;
  border: 1px solid var(--border);
  font-size: 13px;
  font-weight: 500;
  color: var(--text-secondary);
  cursor: pointer;
  text-align: left;
  transition: all 0.1s;
}

.mobile-sign-out:hover {
  color: #EF4444;
  border-color: rgba(239, 68, 68, 0.3);
}

/* Responsive */
@media (max-width: 768px) {
  .navbar-nav,
  .user-name,
  .role-badge,
  .icon-btn,
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
