// composables/useTimeAgo.js

import { ref, onMounted, onUnmounted } from "vue"
import dayjs from "dayjs"
import relativeTime from "dayjs/plugin/relativeTime"

dayjs.extend(relativeTime)

const now = ref(Date.now())
let interval

function start() {
  if (!interval) {
    interval = setInterval(() => {
      now.value = Date.now()
    }, 60000) // update every minute
  }
}

function stop() {
  if (interval) {
    clearInterval(interval)
    interval = null
  }
}

export function useTimeAgo() {
  onMounted(start)
  onUnmounted(stop)

  function timeAgo(date) {
    if (!date) return "-"
    const formatedDate = new Date(date)
    if (isNaN(formatedDate.getTime())) return "-"
    now.value // establish reactivity
    return dayjs(formatedDate).fromNow()
  }

  return { timeAgo }
}