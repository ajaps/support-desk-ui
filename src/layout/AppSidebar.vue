<template>
  <nav class="sidebar">
    <!-- Logo -->
    <div class="sidebar-logo">
      <div class="logo-mark">S</div>
      <span class="logo-text">SupportDesk</span>
    </div>

    <!-- Nav items -->
    <div class="sidebar-nav">
      <router-link
        v-for="item in navItems"
        :key="item.to"
        :to="item.to"
        :class="['nav-item', { 'nav-item--indent': item.indent }]"
        active-class="nav-item--active"
      >
        <span class="nav-icon">{{ item.icon }}</span>
        {{ item.label }}
        <span v-if="item.badge" class="nav-badge">{{ item.badge }}</span>
      </router-link>
    </div>

    <!-- Agent profile -->
    <div class="sidebar-profile">
      <AppAvatar :name="auth.user?.name" :size="30" />
      <div>
        <div class="profile-name">{{ auth.user?.name }}</div>
        <div class="profile-role">Support Agent</div>
      </div>
    </div>
  </nav>
</template>

<script setup>
import { useAuthStore } from '@/stores/auth'
import AppAvatar from '@/components/AppAvatar.vue'

const props = defineProps({
  openTicketCount: Number,
  closedTicketCount: Number
})

const auth = useAuthStore()

const navItems = [
  { to: '/tickets',        label: 'Dashboard',   icon: '⬡' },
  { to: '/tickets?status=open',   label: 'Open',   icon: '○', indent: true, badge: props.openTicketCount },
  { to: '/tickets?status=closed', label: 'Closed', icon: '●', indent: true, badge: props.closedTicketCount },
]
</script>

<style scoped>
.sidebar {
  width: 220px;
  min-height: calc(100vh - 56px);
  background: var(--bg-surface);
  border-right: 1px solid var(--border);
  display: flex;
  flex-direction: column;
  padding: 24px 0;
  flex-shrink: 0;
  position: sticky;
  top: 56px;
  align-self: flex-start;
}

@media (max-width: 768px) {
  .sidebar {
    display: none;
  }
}

.sidebar-logo {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 0 20px 24px;
  border-bottom: 1px solid var(--border);
}

.logo-mark {
  width: 30px;
  height: 30px;
  border-radius: 8px;
  background: linear-gradient(135deg, #6366F1, #818CF8);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 14px;
  font-weight: 800;
  color: #fff;
  flex-shrink: 0;
}

.logo-text {
  font-weight: 700;
  font-size: 15px;
  color: var(--text-primary);
  letter-spacing: -0.02em;
}

.sidebar-nav {
  padding: 16px 10px;
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.nav-item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 8px 10px;
  border-radius: 7px;
  cursor: pointer;
  text-decoration: none;
  font-size: 14px;
  font-weight: 400;
  color: var(--text-secondary);
  transition: all 0.1s;
}

.nav-item--indent {
  padding-left: 30px;
  font-size: 13px;
  color: var(--text-muted);
}

.nav-item--active {
  background: var(--accent-bg);
  color: var(--accent-hover);
  font-weight: 600;
}

.nav-icon { font-size: 13px; opacity: 0.8; }

.nav-badge {
  margin-left: auto;
  background: var(--accent-badge-bg);
  color: var(--accent-badge-text);
  border-radius: 999px;
  padding: 1px 7px;
  font-size: 11px;
  font-weight: 700;
}

.sidebar-profile {
  padding: 16px 16px 0;
  border-top: 1px solid var(--border);
  display: flex;
  align-items: center;
  gap: 10px;
}

.profile-name { font-size: 13px; font-weight: 600; color: var(--text-primary); }
.profile-role { font-size: 11px; color: var(--text-muted); margin-top: 1px; }
</style>