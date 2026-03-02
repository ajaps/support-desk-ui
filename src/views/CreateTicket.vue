<template>
  <div class="page">
    <AppTopbar title="New Ticket" subtitle="Submit a support request" show-logo>
      <template #actions>
        <AppButton variant="ghost" sm @click="router.back()">← Cancel</AppButton>
      </template>
    </AppTopbar>

    <div class="form-wrap">
      <div class="form-card">
        <div class="form-fields">
          <AppInput v-model="title" label="Subject/Title" placeholder="Briefly describe your issue" />
          <AppTextarea
            v-model="description" label="Description" :rows="6"
            placeholder="Steps to reproduce, expected vs actual behavior, error messages…"
          />

          <!-- Upload -->
          <div>
            <label class="field-label">
              Attachments <span class="field-label--muted">(optional)</span>
            </label>
            <div class="upload-zone">
              <div class="upload-icon">⬆</div>
              <div class="upload-text">
                Drag & drop or <span class="upload-link">browse</span>
              </div>
              <div class="upload-hint">PNG, JPG, PDF up to 10MB</div>
            </div>
          </div>

          <div class="form-footer">
            <!-- Errors sit just above the submit button -->
            <AppAlert :errors="errors" style="flex: 1; margin-right: 8px;" />
            <div style="display: flex; gap: 10px; flex-shrink: 0;">
              <AppButton variant="ghost" @click="router.back()">Cancel</AppButton>
              <AppButton :disabled="!title.trim() || !description.trim() || submitting" @click="submit">
                {{ submitting ? 'Submitting…' : 'Submit ticket →' }}
              </AppButton>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useMutation } from '@vue/apollo-composable'
import { useGraphqlErrors } from '@/composables/useGraphqlErrors'
import { CREATE_TICKET } from '@/graphql/tickets.gql'
import AppTopbar   from '@/layout/AppTopbar.vue'
import AppButton   from '@/components/AppButton.vue'
import AppInput    from '@/components/AppInput.vue'
import AppTextarea from '@/components/AppTextarea.vue'
import AppAlert    from '@/components/AppAlert.vue'

const router      = useRouter()
const title       = ref('')
const description = ref('')
const submitting  = ref(false)

const { errors, safeCall } = useGraphqlErrors()
const { mutate } = useMutation(CREATE_TICKET)

const priorities = [
  { value: 'low',    label: 'Low',    color: '#10B981' },
  { value: 'medium', label: 'Medium', color: '#F59E0B' },
  { value: 'high',   label: 'High',   color: '#EF4444' },
]

async function submit() {
  submitting.value = true
  await safeCall(
    () => mutate({ title: title.value, description: description.value }),
    'createTicket'
  )
  submitting.value = false
  if (!errors.value.length) router.push('/tickets')
}
</script>

<style scoped>
.page     { min-height: 100vh; background: #0A0A0F; font-family: -apple-system, BlinkMacSystemFont, 'Inter', sans-serif; }
.form-wrap { max-width: 660px; margin: 36px auto; padding: 0 24px; }

.form-card   { background: #111118; border: 1px solid #1E1E2E; border-radius: 14px; padding: 28px; }
.form-fields { display: flex; flex-direction: column; gap: 20px; }

.field-label       { display: block; font-size: 13px; font-weight: 500; color: #9494A8; margin-bottom: 8px; }
.field-label--muted { color: #4A4A62; }

.upload-zone {
  border: 1px dashed #2A2A3E;
  border-radius: 10px;
  padding: 28px 20px;
  text-align: center;
  cursor: pointer;
  background: #16161F;
  transition: border-color 0.15s;
}
.upload-zone:hover { border-color: #6366F1; }
.upload-icon  { font-size: 22px; margin-bottom: 8px; opacity: 0.4; }
.upload-text  { font-size: 13px; color: #9494A8; }
.upload-link  { color: #818CF8; font-weight: 600; }
.upload-hint  { font-size: 11px; color: #4A4A62; margin-top: 4px; }

.form-footer { display: flex; justify-content: flex-end; gap: 10px; padding-top: 4px; }
</style>