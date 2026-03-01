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
  min-height: 100vh;
  background: #111118;
  border-right: 1px solid #1E1E2E;
  display: flex;
  flex-direction: column;
  padding: 24px 0;
  flex-shrink: 0;
}

.sidebar-logo {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 0 20px 24px;
  border-bottom: 1px solid #1E1E2E;
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
  color: #F1F1F3;
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
  color: #9494A8;
  transition: all 0.1s;
}

.nav-item--indent {
  padding-left: 30px;
  font-size: 13px;
  color: #4A4A62;
}

.nav-item--active {
  background: rgba(99,102,241,0.1);
  color: #818CF8;
  font-weight: 600;
}

.nav-icon { font-size: 13px; opacity: 0.8; }

.nav-badge {
  margin-left: auto;
  background: #312E81;
  color: #818CF8;
  border-radius: 999px;
  padding: 1px 7px;
  font-size: 11px;
  font-weight: 700;
}

.sidebar-profile {
  padding: 16px 16px 0;
  border-top: 1px solid #1E1E2E;
  display: flex;
  align-items: center;
  gap: 10px;
}

.profile-name { font-size: 13px; font-weight: 600; color: #F1F1F3; }
.profile-role { font-size: 11px; color: #4A4A62; margin-top: 1px; }
</style>