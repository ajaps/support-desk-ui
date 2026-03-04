<template>
  <div class="page">
    <AppTopbar title="New Ticket" subtitle="Submit a support request">
      <template #actions>
        <AppButton variant="ghost" sm @click="router.back()"
          >← Cancel</AppButton
        >
      </template>
    </AppTopbar>

    <div class="form-wrap">
      <div class="form-card">
        <div class="form-fields">
          <AppInput
            v-model="title"
            label="Subject/Title"
            placeholder="Briefly describe your issue"
          />
          <AppTextarea
            v-model="description"
            label="Description"
            :rows="6"
            placeholder="Steps to reproduce, expected vs actual behavior, error messages…"
          />

          <div>
            <label class="field-label">
              Attachment <span class="field-label--muted">(optional)</span>
            </label>

            <div
              v-if="!file"
              class="upload-zone"
              :class="{ 'upload-zone--dragging': dragging }"
              @dragover.prevent="dragging = true"
              @dragleave.prevent="dragging = false"
              @drop.prevent="handleDrop"
              @click="browse"
            >
              <div class="upload-icon">⬆</div>
              <div class="upload-text">
                Drag & drop or <span class="upload-link">browse</span>
              </div>
              <div class="upload-hint">PNG, JPG, PDF up to 4MB</div>
              <input
                ref="fileInput"
                type="file"
                accept=".png,.jpg,.jpeg,.pdf"
                hidden
                @change="handleSelect"
              />
            </div>

            <!-- File preview + progress -->
            <div v-if="file" class="file-preview">
              <div class="file-preview__info">
                <span class="file-preview__name">{{ file.name }}</span>
                <span class="file-preview__size">{{
                  formatSize(file.size)
                }}</span>
              </div>

              <div v-if="uploading" class="progress-bar">
                <div
                  class="progress-bar__fill"
                  :style="{ width: uploadProgress + '%' }"
                />
                <span class="progress-bar__label">{{ uploadProgress }}%</span>
              </div>
              <div v-else-if="signedId" class="file-preview__done">✔ Ready</div>

              <button
                v-if="!uploading"
                type="button"
                class="file-preview__remove"
                @click="removeFile"
              >
                Remove
              </button>
            </div>
          </div>

          <div class="form-footer">
            <!-- Errors sit just above the submit button -->
            <AppAlert :errors="errors" style="flex: 1; margin-right: 8px" />
            <div style="display: flex; gap: 10px; flex-shrink: 0">
              <AppButton variant="ghost" @click="router.back()"
                >Cancel</AppButton
              >
              <AppButton
                :disabled="
                  !title.trim() ||
                  !description.trim() ||
                  submitting ||
                  uploading
                "
                @click="submit"
              >
                {{ submitting ? "Submitting…" : "Submit ticket →" }}
              </AppButton>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from "vue";
import { useRouter } from "vue-router";
import { useMutation } from "@vue/apollo-composable";
import { useGraphqlErrors } from "@/composables/useGraphqlErrors";
import { CREATE_TICKET } from "@/graphql/tickets.gql";
import AppTopbar from "@/layout/AppTopbar.vue";
import AppButton from "@/components/AppButton.vue";
import AppInput from "@/components/AppInput.vue";
import AppTextarea from "@/components/AppTextarea.vue";
import AppAlert from "@/components/AppAlert.vue";
import { uploadFile } from "@/utils/upload";

const router = useRouter();

const title = ref("");
const description = ref("");
const submitting = ref(false);

const fileInput = ref(null);
const file = ref(null);
const signedId = ref(null); // set after successful direct upload
const uploading = ref(false);
const uploadProgress = ref(0);
const dragging = ref(false);

const { errors, safeCall } = useGraphqlErrors();
const { mutate: createTicket } = useMutation(CREATE_TICKET);

const MAX_SIZE = 4 * 1024 * 1024;
const ALLOWED_TYPES = ["image/png", "image/jpeg", "application/pdf"];

function browse() {
  fileInput.value?.click();
}

function handleSelect(e) {
  processFile(e.target.files[0]);
}

function handleDrop(e) {
  dragging.value = false;
  processFile(e.dataTransfer.files[0]);
}

function removeFile() {
  file.value = null;
  signedId.value = null;
  uploadProgress.value = 0;
  if (fileInput.value) fileInput.value.value = "";
}

function formatSize(bytes) {
  return (bytes / 1024 / 1024).toFixed(2) + " MB";
}

async function processFile(selected) {
  if (!selected) return;

  if (!ALLOWED_TYPES.includes(selected.type)) {
    errors.value = ["Invalid file type. Allowed: PNG, JPG, PDF"];
    return;
  }
  if (selected.size > MAX_SIZE) {
    errors.value = ["File exceeds 4 MB limit"];
    return;
  }

  file.value = selected;
  signedId.value = null;
  uploadProgress.value = 0;
  uploading.value = true;

  try {
    signedId.value = await uploadFile(selected, (pct) => {
      uploadProgress.value = pct;
    });
  } catch (err) {
    errors.value = [`Upload failed: ${err.message}`];
    file.value = null;
  } finally {
    uploading.value = false;
  }
}

async function submit() {
  if (uploading.value) return; // guard: still uploading

  submitting.value = true;
  await safeCall(
    () =>
      createTicket({
        title: title.value,
        description: description.value,
        fileSignedId: signedId.value,
      }),
    "createTicket"
  );

  submitting.value = false;
  if (!errors.value.length) router.push("/tickets");
}
</script>

<style scoped>
.page {
  min-height: 100vh;
  background: #0a0a0f;
  font-family: -apple-system, BlinkMacSystemFont, "Inter", sans-serif;
}
.form-wrap {
  max-width: 660px;
  margin: 36px auto;
  padding: 0 24px;
}

.form-card {
  background: #111118;
  border: 1px solid #1e1e2e;
  border-radius: 14px;
  padding: 28px;
}
.form-fields {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.field-label {
  display: block;
  font-size: 13px;
  font-weight: 500;
  color: #9494a8;
  margin-bottom: 8px;
}
.field-label--muted {
  color: #4a4a62;
}

.upload-zone {
  border: 1px dashed #2a2a3e;
  border-radius: 10px;
  padding: 28px 20px;
  text-align: center;
  cursor: pointer;
  background: #16161f;
  transition: border-color 0.15s;
}
.upload-zone:hover {
  border-color: #6366f1;
}
.upload-icon {
  font-size: 22px;
  margin-bottom: 8px;
  opacity: 0.4;
}
.upload-text {
  font-size: 13px;
  color: #9494a8;
}
.upload-link {
  color: #818cf8;
  font-weight: 600;
}
.upload-hint {
  font-size: 11px;
  color: #4a4a62;
  margin-top: 4px;
}

.form-footer {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  padding-top: 4px;
  flex-wrap: wrap;
}

/* ── Responsive ──────────────────────────────── */
@media (max-width: 768px) {
  .form-wrap {
    margin: 20px auto;
    padding: 0 16px;
  }

  .form-card {
    padding: 20px;
  }
}

@media (max-width: 480px) {
  .form-footer {
    flex-direction: column;
  }

  .form-footer > div {
    width: 100%;
    justify-content: stretch;
  }
}
</style>