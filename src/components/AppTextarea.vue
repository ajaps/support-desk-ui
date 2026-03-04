<template>
  <div class="field">
    <label v-if="label" class="field-label">{{ label }}</label>
    <textarea
      :value="modelValue"
      :placeholder="placeholder"
      :rows="rows"
      class="field-textarea"
      @input="$emit('update:modelValue', $event.target.value)"
    />
  </div>
</template>

<script setup>
defineProps({
  modelValue:  String,
  label:       String,
  placeholder: String,
  rows:        { type: Number, default: 4 },
})
defineEmits(['update:modelValue'])
</script>

<style scoped>
.field { display: flex; flex-direction: column; gap: 6px; }

.field-label { font-size: 13px; font-weight: 500; color: var(--text-secondary); }

.field-textarea {
  background: var(--bg-elevated);
  border: 1px solid var(--border);
  border-radius: 8px;
  padding: 10px 14px;
  color: var(--text-primary);
  font-size: 14px;
  outline: none;
  width: 100%;
  box-sizing: border-box;
  resize: vertical;
  font-family: inherit;
  line-height: 1.6;
  transition: border-color 0.15s;
}

.field-textarea::placeholder { color: var(--text-muted); }
.field-textarea:focus { border-color: var(--accent); }
</style>
