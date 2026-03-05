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
        <div v-if="mode === 'register'">
          <AppInput
            v-model="confirmPassword"
            label="Confirm password"
            type="password"
            placeholder="••••••••"
          />
          <p v-if="confirmPassword && !passwordsMatch" class="password-mismatch">
            Passwords do not match
          </p>
        </div>
      </div>

      <AppButton full :disabled="loading || !email.trim() || !password.trim() || (mode === 'register' && (!name.trim() || !passwordsMatch))" @click="handleSubmit">
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
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { useGraphqlErrors } from '@/composables/useGraphqlErrors'
import AppInput      from '@/components/AppInput.vue'
import AppButton     from '@/components/AppButton.vue'
import AppAlert      from '@/components/AppAlert.vue'

const router   = useRouter()
const auth     = useAuthStore()
const { errors, safeCall } = useGraphqlErrors()

const mode            = ref('login')
const name            = ref('')
const email           = ref('')
const password        = ref('')
const confirmPassword = ref('')
const loading         = ref(false)

const passwordsMatch = computed(
  () => mode.value === 'login' || password.value === confirmPassword.value
)

function toggleMode() {
  mode.value = mode.value === 'login' ? 'register' : 'login'
  errors.value = []
  confirmPassword.value = ''
}

async function handleSubmit() {
  loading.value = true
  const mutationKey = mode.value === 'login' ? 'signIn' : 'signUp'

  await safeCall(
    () => mode.value === 'login'
      ? auth.signIn(email.value, password.value)
      : auth.signUp(name.value, email.value, password.value),
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
  background: var(--bg-base);
  display: flex;
  align-items: center;
  justify-content: center;
  font-family: -apple-system, BlinkMacSystemFont, 'Inter', sans-serif;
  position: relative;
  padding: 24px 16px;
}

.auth-grid {
  position: fixed;
  inset: 0;
  pointer-events: none;
  background-image:
    linear-gradient(var(--auth-grid-color) 1px, transparent 1px),
    linear-gradient(90deg, var(--auth-grid-color) 1px, transparent 1px);
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
  background: var(--bg-surface);
  border: 1px solid var(--border);
  border-radius: 16px;
  padding: 36px;
  box-shadow: var(--shadow-card);
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
  color: var(--text-primary);
  letter-spacing: -0.03em;
}

.auth-heading {
  font-size: 22px;
  font-weight: 700;
  color: var(--text-primary);
  margin-bottom: 6px;
  letter-spacing: -0.02em;
}

.auth-sub {
  font-size: 14px;
  color: var(--text-secondary);
  margin-bottom: 28px;
}

.auth-fields {
  display: flex;
  flex-direction: column;
  gap: 14px;
  margin-bottom: 24px;
}

.auth-alert {
  margin-bottom: 16px;
  margin-left: 4px;
  opacity: 0.8;
}

.auth-switch {
  margin-top: 20px;
  padding-top: 20px;
  border-top: 1px solid var(--border);
  text-align: center;
  font-size: 13px;
  color: var(--text-secondary);
}

.auth-switch-link {
  color: var(--accent-hover);
  cursor: pointer;
  font-weight: 600;
  margin-left: 4px;
}

.auth-switch-link:hover {
  text-decoration: underline;
}

.password-mismatch {
  margin: 6px 0 0;
  font-size: 12px;
  color: var(--alert-error-text);
}

@media (max-width: 480px) {
  .auth-card {
    padding: 24px 20px;
  }
}
</style>