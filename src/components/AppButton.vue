<template>
  <button
    :class="['btn', `btn--${variant}`, { 'btn--full': full, 'btn--sm': sm }]"
    :disabled="disabled"
    @click="$emit('click')"
  >
    <slot />
  </button>
</template>

<script setup>
defineProps({
  variant:  { type: String, default: 'primary' }, // primary | ghost | danger
  full:     Boolean,
  sm:       Boolean,
  disabled: Boolean,
})
defineEmits(['click'])
</script>

<style scoped>
.btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 10px 20px;
  border-radius: 8px;
  font-weight: 600;
  font-size: 14px;
  cursor: pointer;
  border: none;
  transition: all 0.15s;
  letter-spacing: 0.01em;
  font-family: inherit;
  white-space: nowrap;
}

.btn:disabled { opacity: 0.45; cursor: not-allowed; }
.btn--full    { width: 100%; padding: 12px 0; }
.btn--sm      { padding: 7px 14px; font-size: 13px; }

.btn--primary {
  background: #6366F1;
  color: #fff;
  box-shadow: 0 0 20px rgba(99,102,241,0.27);
}
.btn--primary:not(:disabled):hover { background: #818CF8; }

.btn--ghost {
  background: transparent;
  color: #9494A8;
  border: 1px solid #1E1E2E;
}
.btn--ghost:not(:disabled):hover { border-color: #2A2A3E; color: #F1F1F3; }

.btn--danger {
  background: #2D0A0A;
  color: #EF4444;
  border: 1px solid #3D1010;
}
.btn--danger:not(:disabled):hover { background: #3D1010; }
</style>