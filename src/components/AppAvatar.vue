<template>
  <div class="avatar" :style="sizeStyle">
    {{ initial }}
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  name:  String,
  size:  { type: Number, default: 32 },
  color: { type: String, default: '#6366F1' },
})

const initial  = computed(() => props.name?.[0]?.toUpperCase() ?? '?')
const sizeStyle = computed(() => ({
  width:      `${props.size}px`,
  height:     `${props.size}px`,
  fontSize:   `${Math.round(props.size * 0.38)}px`,
  background: `linear-gradient(135deg, ${props.color}33, ${props.color}66)`,
  border:     `1px solid ${props.color}44`,
  color:       props.color,
}))
</script>

<style scoped>
.avatar {
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
  flex-shrink: 0;
}
</style>