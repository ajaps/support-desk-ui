     Full-width alert banner. Supports error | warning | success variants.
     Usage: <AppAlert :errors="errors" />  or  <AppAlert message="Something went wrong" />
──────────────────────────────────────────────────────────────────────────── -->
<template>
  <transition name="alert-slide">
    <div v-if="visible" :class="['alert', `alert--${variant}`]" role="alert">
      <span class="alert-icon">{{ icon }}</span>
      <div class="alert-body">
        <!-- Multiple errors (e.g. validation list) -->
        <ul v-if="normalised.length > 1" class="alert-list">
          <li v-for="(msg, i) in normalised" :key="i">{{ msg }}</li>
        </ul>
        <!-- Single error -->
        <span v-else>{{ normalised[0] }}</span>
      </div>
      <button class="alert-close" @click="dismissed = true" aria-label="Dismiss">✕</button>
    </div>
  </transition>
</template>

<script setup>
import { ref, computed, watch } from 'vue'

const props = defineProps({
  /** Pass the reactive errors array from useGraphqlErrors */
  errors:  { type: Array,  default: () => [] },
  /** Or a single plain string */
  message: { type: String, default: '' },
  variant: { type: String, default: 'error' }, // error | warning | success
})

const dismissed = ref(false)

// Reset dismissed whenever the error content changes
watch(() => [...props.errors, props.message], () => { dismissed.value = false })

const normalised = computed(() => {
  if (props.errors.length) return props.errors
  if (props.message)       return [props.message]
  return []
})

const visible = computed(() => !dismissed.value && normalised.value.length > 0)

const icon = computed(() => ({ error: '⊗', warning: '⚠', success: '✓' }[props.variant]))
</script>

<style scoped>
.alert {
  display: flex;
  align-items: flex-start;
  gap: 10px;
  padding: 12px 16px;
  border-radius: 10px;
  font-size: 13px;
  line-height: 1.5;
  border: 1px solid transparent;
}

.alert--error   { background: var(--alert-error-bg);   border-color: var(--alert-error-border);   color: var(--alert-error-text); }
.alert--warning { background: var(--alert-warning-bg); border-color: var(--alert-warning-border); color: var(--alert-warning-text); }
.alert--success { background: var(--alert-success-bg); border-color: var(--alert-success-border); color: var(--alert-success-text); }

.alert-icon { font-size: 15px; flex-shrink: 0; margin-top: 1px; }

.alert-body { flex: 1; }

.alert-list {
  margin: 0;
  padding-left: 16px;
  display: flex;
  flex-direction: column;
  gap: 3px;
}

.alert-close {
  background: none;
  border: none;
  cursor: pointer;
  color: inherit;
  opacity: 0.5;
  font-size: 12px;
  padding: 0;
  flex-shrink: 0;
  line-height: 1;
  margin-top: 2px;
  transition: opacity 0.15s;
}
.alert-close:hover { opacity: 1; }

/* Slide-in transition */
.alert-slide-enter-active { transition: all 0.2s ease; }
.alert-slide-leave-active { transition: all 0.15s ease; }
.alert-slide-enter-from   { opacity: 0; transform: translateY(-6px); }
.alert-slide-leave-to     { opacity: 0; transform: translateY(-6px); }
</style>