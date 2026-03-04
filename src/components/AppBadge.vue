<template>
  <span :class="['badge', `badge--${status}`]">
    <span class="badge-dot" />
    {{ label }}
  </span>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({ status: String })

const label = computed(() => ({
  open:        'Open',
  in_progress: 'In Progress',
  closed:      'Closed',
}[props.status] ?? props.status))
</script>

<style scoped>
.badge {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 3px 10px;
  border-radius: 999px;
  font-size: 11px;
  font-weight: 600;
  letter-spacing: 0.04em;
  text-transform: uppercase;
  white-space: nowrap;
}

.badge-dot {
  width: 5px;
  height: 5px;
  border-radius: 50%;
  flex-shrink: 0;
}

.badge--open        { background: var(--badge-open-bg);      color: var(--badge-open-text); }
.badge--in_progress { background: var(--badge-progress-bg);  color: var(--badge-progress-text); }
.badge--closed      { background: var(--badge-closed-bg);    color: var(--badge-closed-text); }
.badge-dot          { background: currentColor; }
</style>