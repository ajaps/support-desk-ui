<template>
  <div class="topbar">
    <div class="topbar-left">
      <!-- Breadcrumb / logo link for customer views -->
      <router-link v-if="showLogo" to="/tickets" class="topbar-logo-link">
        <div class="logo-mark">S</div>
      </router-link>
      <div>
        <h1 class="topbar-title">{{ title }}</h1>
        <p v-if="subtitle" class="topbar-sub">{{ subtitle }}</p>
      </div>
    </div>
    <div class="topbar-actions">
      <slot name="actions" />
    </div>
  </div>
</template>

<script setup>
defineProps({
  title:    String,
  subtitle: String,
  showLogo: Boolean,
})
</script>

<style scoped>
.topbar {
  padding: 20px 32px;
  border-bottom: 1px solid #1E1E2E;
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: #111118;
}

.topbar-left {
  display: flex;
  align-items: center;
  gap: 12px;
}

.topbar-logo-link { text-decoration: none; }

.logo-mark {
  width: 26px;
  height: 26px;
  border-radius: 7px;
  background: linear-gradient(135deg, #6366F1, #818CF8);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  font-weight: 800;
  color: #fff;
}

.topbar-title {
  font-size: 18px;
  font-weight: 700;
  color: #F1F1F3;
  letter-spacing: -0.02em;
}

.topbar-sub {
  font-size: 13px;
  color: #9494A8;
  margin-top: 2px;
}

.topbar-actions {
  display: flex;
  align-items: center;
  gap: 10px;
}
</style>