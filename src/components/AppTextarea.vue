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

.field-label { font-size: 13px; font-weight: 500; color: #9494A8; }

.field-textarea {
  background: #16161F;
  border: 1px solid #1E1E2E;
  border-radius: 8px;
  padding: 10px 14px;
  color: #F1F1F3;
  font-size: 14px;
  outline: none;
  width: 100%;
  box-sizing: border-box;
  resize: vertical;
  font-family: inherit;
  line-height: 1.6;
  transition: border-color 0.15s;
}

.field-textarea::placeholder { color: #4A4A62; }
.field-textarea:focus { border-color: #6366F1; }
</style>
