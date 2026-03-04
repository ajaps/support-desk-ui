<template>
  <div class="auth-root">
    <!-- Background grid -->
    <div class="auth-grid" />
    <!-- Glow -->
    <div class="auth-glow" />

    <div class="auth-card">
      <!-- Logo -->
      <div class="auth-logo">
        <div class="logo-mark">S</div>
        <span class="logo-text">SupportDesk</span>
      </div>

      <h2 class="auth-heading">
        {{ mode === 'login' ? 'Welcome back' : 'Create your account' }}
      </h2>
      <p class="auth-sub">
        {{ mode === 'login' ? 'Sign in to your workspace.' : 'Get started in seconds.' }}
      </p>

      <!-- Role toggle (register only) -->
      <div v-if="mode === 'register'" class="role-toggle">
        <button
          v-for="r in ['customer', 'agent']" :key="r"
          :class="['role-btn', { active: role === r }]"
          @click="role = r"
        >
          {{ r === 'customer' ? 'Customer' : 'Support Agent' }}
        </button>
      </div>

      <!-- Error banner -->
      <AppAlert :errors="errors" class="auth-alert" />

      <div class="auth-fields">
        <div>
          <AppInput
            v-if="mode === 'register'"
            v-model="name"
            label="Full name"
            placeholder="Alex Johnson"
          />
        </div>
        <div>
          <AppInput
            v-model="email"
            label="Email address"
            type="email"
            placeholder="you@company.com"
          />
        </div>
        <div>
          <AppInput
            v-model="password"
            label="Password"
            type="password"
            placeholder="••••••••"
          />
        </div>
      </div>

      <AppButton full :disabled="loading || !email.trim() || !password.trim() || (mode === 'register' && !name.trim())" @click="handleSubmit">
        {{ mode === 'login' ? 'Sign in' : 'Create account' }}
        <span class="btn-arrow">→</span>
      </AppButton>

      <div class="auth-switch">
        {{ mode === 'login' ? "Don't have an account?" : 'Already have an account?' }}
        <span class="auth-switch-link" @click="toggleMode">
          {{ mode === 'login' ? 'Sign up' : 'Sign in' }}
        </span>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { useGraphqlErrors } from '@/composables/useGraphqlErrors'
import AppInput      from '@/components/AppInput.vue'
import AppButton     from '@/components/AppButton.vue'
import AppAlert      from '@/components/AppAlert.vue'

const router   = useRouter()
const auth     = useAuthStore()
const { errors, safeCall } = useGraphqlErrors()

const mode     = ref('login')
const role     = ref('customer')
const name     = ref('')
const email    = ref('')
const password = ref('')
const loading  = ref(false)

function toggleMode() {
  mode.value = mode.value === 'login' ? 'register' : 'login'
  errors.value = []
}

async function handleSubmit() {
  loading.value = true
  const mutationKey = mode.value === 'login' ? 'signIn' : 'signUp'

  await safeCall(
    () => mode.value === 'login'
      ? auth.signIn(email.value, password.value)
      : auth.signUp(name.value, email.value, password.value, role.value),
    mutationKey
  )

  loading.value = false
  if (!errors.value.length) {
    router.push('/tickets')
  }
}
</script>

<style scoped>
.auth-root {
  min-height: 100vh;
  background: #0A0A0F;
  display: flex;
  align-items: center;
  justify-content: center;
  font-family: -apple-system, BlinkMacSystemFont, 'Inter', sans-serif;
  position: relative;
}

.auth-grid {
  position: fixed;
  inset: 0;
  pointer-events: none;
  background-image:
    linear-gradient(#1E1E2E 1px, transparent 1px),
    linear-gradient(90deg, #1E1E2E 1px, transparent 1px);
  background-size: 40px 40px;
  opacity: 0.4;
}

.auth-glow {
  position: fixed;
  top: 20%;
  left: 50%;
  transform: translateX(-50%);
  width: 600px;
  height: 300px;
  border-radius: 50%;
  background: radial-gradient(ellipse, rgba(99,102,241,0.12), transparent 70%);
  pointer-events: none;
}

.auth-card {
  position: relative;
  width: 100%;
  max-width: 420px;
  z-index: 1;
  background: #111118;
  border: 1px solid #1E1E2E;
  border-radius: 16px;
  padding: 36px;
  box-shadow: 0 32px 80px rgba(0,0,0,0.5);
}

.auth-logo {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 32px;
}

.logo-mark {
  width: 36px;
  height: 36px;
  border-radius: 10px;
  background: linear-gradient(135deg, #6366F1, #818CF8);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 17px;
  font-weight: 800;
  color: #fff;
}

.logo-text {
  font-weight: 800;
  font-size: 18px;
  color: #F1F1F3;
  letter-spacing: -0.03em;
}

.auth-heading {
  font-size: 22px;
  font-weight: 700;
  color: #F1F1F3;
  margin-bottom: 6px;
  letter-spacing: -0.02em;
}

.auth-sub {
  font-size: 14px;
  color: #9494A8;
  margin-bottom: 28px;
}

.role-toggle {
  display: flex;
  background: #16161F;
  border-radius: 9px;
  padding: 3px;
  margin-bottom: 20px;
  border: 1px solid #1E1E2E;
}

.role-btn {
  flex: 1;
  padding: 7px 0;
  border-radius: 7px;
  border: none;
  background: transparent;
  color: #9494A8;
  font-weight: 600;
  font-size: 13px;
  cursor: pointer;
  text-transform: capitalize;
  transition: all 0.15s;
}

.role-btn.active {
  background: #6366F1;
  color: #fff;
}

.auth-fields {
  display: flex;
  flex-direction: column;
  gap: 14px;
  margin-bottom: 24px;
}

.auth-alert { margin-bottom: 16px;
  margin-left: 4px;
  opacity: 0.8;
}

.auth-switch {
  margin-top: 20px;
  padding-top: 20px;
  border-top: 1px solid #1E1E2E;
  text-align: center;
  font-size: 13px;
  color: #9494A8;
}

.auth-switch-link {
  color: #818CF8;
  cursor: pointer;
  font-weight: 600;
  margin-left: 4px;
}

.auth-switch-link:hover {
  text-decoration: underline;
}
</style>