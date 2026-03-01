     Inline error under a specific field.
     Usage: <AppFieldError message="Email is invalid" />
──────────────────────────────────────────────────────────────────────────── -->
<template>
  <transition name="field-err">
    <p v-if="message" class="field-error" role="alert">
      <span class="field-error-icon">⊗</span> {{ message }}
    </p>
  </transition>
</template>

<script setup>
defineProps({ message: { type: String, default: '' } })
</script>

<style scoped>
.field-error {
  display: flex;
  align-items: center;
  gap: 5px;
  font-size: 12px;
  color: #FCA5A5;
  margin-top: 5px;
}

.field-error-icon { font-size: 13px; flex-shrink: 0; }

.field-err-enter-active { transition: all 0.15s ease; }
.field-err-leave-active { transition: all 0.1s ease; }
.field-err-enter-from   { opacity: 0; transform: translateY(-4px); }
.field-err-leave-to     { opacity: 0; }
</style>