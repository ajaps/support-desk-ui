<template>
  <div class="topbar">
    <div class="topbar-left">
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
})
</script>

<style scoped>
.topbar {
  padding: 16px 32px;
  border-bottom: 1px solid #1E1E2E;
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: #111118;
  gap: 12px;
  min-height: 60px;
}

.topbar-left {
  display: flex;
  align-items: center;
  gap: 12px;
  min-width: 0;
}

.topbar-title {
  font-size: 17px;
  font-weight: 700;
  color: #F1F1F3;
  letter-spacing: -0.02em;
  margin: 0;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.topbar-sub {
  font-size: 12px;
  color: #9494A8;
  margin: 2px 0 0;
}

.topbar-actions {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-shrink: 0;
}

@media (max-width: 768px) {
  .topbar {
    padding: 12px 16px;
    flex-wrap: wrap;
    gap: 10px;
  }

  .topbar-title {
    font-size: 15px;
  }

  .topbar-actions {
    gap: 6px;
  }
}
</style>
