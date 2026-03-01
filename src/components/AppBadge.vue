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

.badge--open        { background: #0C2D48; color: #3B82F6; }
.badge--open        .badge-dot { background: #3B82F6; }

.badge--in_progress { background: #2D1F00; color: #F59E0B; }
.badge--in_progress .badge-dot { background: #F59E0B; }

.badge--closed      { background: #0A2E1F; color: #10B981; }
.badge--closed      .badge-dot { background: #10B981; }
</style>