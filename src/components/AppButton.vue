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
  background: var(--accent);
  color: #fff;
  box-shadow: 0 0 20px rgba(99, 102, 241, 0.25);
}
.btn--primary:not(:disabled):hover { background: var(--accent-hover); }

.btn--ghost {
  background: transparent;
  color: var(--text-secondary);
  border: 1px solid var(--border);
}
.btn--ghost:not(:disabled):hover { border-color: var(--border-strong); color: var(--text-primary); }

.btn--danger {
  background: var(--btn-danger-bg);
  color: var(--btn-danger-text);
  border: 1px solid var(--btn-danger-border);
}
.btn--danger:not(:disabled):hover { background: var(--btn-danger-hover-bg); }
</style>
