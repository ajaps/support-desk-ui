<template>
  <div class="page">
    <AppSidebar v-if="isAgent" />

    <div class="page-main">
      <AppTopbar
        :title="ticket.id ? `Tik-${ticket.id}` : 'Ticket detail'"
        subtitle="Support request"
      >
        <template #actions>
          <!-- Agent only: status updater + assign button -->
          <template v-if="isAgent">
            <select
              v-if="isAgent"
              :value="ticket.status"
              class="status-select"
              :disabled="ticket.status === 'closed'"
              @change="updateTicketStatus($event.target.value)"
            >
              <option value="open">Open</option>
              <option value="awaiting_agent" disabled>Awaiting Agent</option>
              <option value="awaiting_customer" disabled>Awaiting Customer</option>
              <option value="closed">Closed</option>
            </select>
            <AppButton v-if="!ticket.agent" sm @click="assignToSelf">
              Assign to me
            </AppButton>
          </template>

          <AppButton variant="ghost" sm @click="router.back()"
            >← Back</AppButton
          >
        </template>
      </AppTopbar>

      <AppAlert :errors="actionErrors" class="auth-alert" />

      <!-- Not found / not authorized error state -->
      <div v-if="ticketNotFound" class="error-state">
        <div class="error-icon">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" width="28" height="28">
            <circle cx="12" cy="12" r="10"/>
            <line x1="12" y1="8" x2="12" y2="12"/>
            <line x1="12" y1="16" x2="12.01" y2="16"/>
          </svg>
        </div>
        <div class="error-title">Ticket not found</div>
        <div class="error-sub">This ticket doesn't exist or you don't have permission to view it.</div>
        <AppButton sm @click="router.push('/tickets')">← Back to tickets</AppButton>
      </div>

      <div v-else-if="!ticketNotFound && ticket.id" class="detail-body">
        <!-- Main column -->
        <div class="detail-main">
          <!-- Ticket card -->
          <div class="card">
            <div class="ticket-head">
              <h2 class="ticket-title">{{ ticket.title }}</h2>
              <AppBadge :status="ticket.status" />
            </div>

            <p class="ticket-desc">{{ ticket.description }}</p>

            <div v-if="ticket.fileUrl" class="attachments">
              <div class="attachments-label">Attachment</div>

              <img
                v-if="isImageAttachment"
                :src="ticket.fileUrl"
                alt="attachment"
                class="attachment-image"
              />
              <a
                v-else
                :href="ticket.fileUrl"
                target="_blank"
                rel="noopener noreferrer"
                class="attachment-pdf"
              >
                <span class="attachment-pdf__icon">PDF</span>
                <span class="attachment-pdf__name">View attachment</span>
                <span class="attachment-pdf__arrow">↗</span>
              </a>
            </div>
          </div>

          <!-- Comment thread -->
          <div class="card card--flush">
            <div class="thread-header">
              <span class="thread-title">Conversation</span>
              <span class="thread-count">{{ comments.length }} messages</span>
            </div>

            <div
              v-for="(c, i) in comments"
              :key="c.id"
              :class="[
                'comment',
                {
                  'comment--agent': c.role === 'agent',
                  'comment--last': i === comments.length - 1,
                },
              ]"
            >
              <div class="comment-meta">
                <AppAvatar
                  :name="c.name"
                  :size="28"
                  :color="c.role === 'agent' ? '#6366F1' : '#10B981'"
                />
                <div>
                  <div class="comment-author">
                    {{ c.name }}
                    <span v-if="c.role === 'agent'" class="agent-tag"
                      >AGENT</span
                    >
                  </div>
                  <span class="comment-time">{{ c.formatedCreatedAt }}</span>
                </div>
              </div>
              <p class="comment-body">{{ c.body }}</p>
            </div>

            <!-- Customer waiting message -->
            <div v-if="isCustomer && !agentHasCommented" class="reply-waiting">
              Replies will be available once a support agent responds.
            </div>
          </div>

          <!-- Reply card — separated from thread for visibility -->
          <div v-if="canReply && ticket.status !== 'closed'" class="reply-card">
            <div class="reply-card-header">
              <svg class="reply-card-icon" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M2 5a2 2 0 012-2h12a2 2 0 012 2v7a2 2 0 01-2 2H6l-4 3V5z" stroke="currentColor" stroke-width="1.5" stroke-linejoin="round"/>
              </svg>
              <div>
                <div class="reply-card-label">Add a reply</div>
                <div v-if="isAgent" class="reply-card-hint">Your reply will be sent to the customer</div>
              </div>
            </div>
            <AppAlert :errors="commentErrors" />
            <AppTextarea
              v-model="reply"
              placeholder="Write your reply…"
              :rows="4"
            />
            <div class="reply-footer">
              <AppButton
                :disabled="!reply.trim() || submitting"
                @click="postComment"
              >
                {{ submitting ? "Sending…" : "Send reply" }}
              </AppButton>
            </div>
          </div>

          <div v-else-if="ticket.status === 'closed'" class="reply-closed">
            <svg viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg" width="16" height="16">
              <path d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2z" stroke="currentColor" stroke-width="1.5"/>
            </svg>
            This ticket is closed. Reopen it to add replies.
          </div>
        </div>

        <!-- Meta sidebar -->
        <div class="detail-sidebar">
          <div class="meta-card" v-for="row in metaRows" :key="row.label">
            <div class="meta-label">{{ row.label }}</div>
            <div class="meta-value">
              <AppBadge v-if="row.isBadge" :status="row.value" />
              <div v-else-if="row.isAgent" class="meta-agent">
                <AppAvatar :name="row.value" :size="22" />
                <span>{{ row.value }}</span>
              </div>
              <span v-else :class="{ 'meta-mono': row.mono }">{{
                row.value
              }}</span>
            </div>
          </div>

          <div v-if="isAgent" class="meta-card">
            <div class="meta-label">Customer</div>
            <div class="meta-agent">
              <AppAvatar
                :name="ticket.customer?.name"
                :size="22"
                color="#3B82F6"
              />
              <div>
                <div class="meta-customer-name">
                  {{ ticket.customer?.name }}
                </div>
                <div class="meta-customer-email">
                  {{ ticket.customer?.email }}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch } from "vue";
import { useRoute, useRouter } from "vue-router";
import { useQuery, useMutation } from "@vue/apollo-composable";
import { useAuthStore } from "@/stores/auth";
import { useGraphqlErrors } from "@/composables/useGraphqlErrors";
import { CREATE_COMMENT } from "@/graphql/comments.gql";
import { GET_TICKET, CLOSE_TICKET, ASSIGN_TICKET } from "@/graphql/tickets.gql";
import AppSidebar from "@/layout/AppSidebar.vue";
import AppTopbar from "@/layout/AppTopbar.vue";
import AppButton from "@/components/AppButton.vue";
import AppBadge from "@/components/AppBadge.vue";
import AppAvatar from "@/components/AppAvatar.vue";
import AppTextarea from "@/components/AppTextarea.vue";
import AppAlert from "@/components/AppAlert.vue";
import { useTimeAgo } from "@/composables/useTimeAgo";

const route = useRoute();
const router = useRouter();
const auth = useAuthStore();
const { timeAgo } = useTimeAgo();

const isAgent = computed(() => auth.isAgent);
const isCustomer = computed(() => auth.isCustomer);

const { errors: pageErrors, captureErrors: capturePageErrors } =
  useGraphqlErrors();
const { errors: commentErrors, safeCall: commentCall } = useGraphqlErrors();
const { errors: actionErrors, safeCall: actionCall } = useGraphqlErrors();
const { result, loading: ticketLoading, error: queryError, refetch } = useQuery(GET_TICKET, {
  id: route.params.id,
});
watch(queryError, (e) => capturePageErrors(e));

// True once the query has settled and no ticket was returned (not found / not authorized)
const ticketNotFound = computed(() =>
  !ticketLoading.value && result.value != null && !result.value?.ticket
  || (pageErrors.value.length > 0)
);

const ticket = computed(() => ({
  id: result.value?.ticket?.id,
  title: result.value?.ticket?.title,
  description: result.value?.ticket?.description,
  status: result.value?.ticket?.status,
  customer: result.value?.ticket?.customer,
  agent: result.value?.ticket?.agent,
  createdAt: result.value?.ticket?.createdAt,
  formatedCreatedAt: timeAgo(result.value?.ticket?.createdAt),
  fileUrl: result.value?.ticket?.fileUrl || null,
}));

const isImageAttachment = computed(() =>
  /\.(png|jpe?g|gif|webp)(\?|$)/i.test(ticket.value.fileUrl ?? "")
)

const comments = computed(() =>
  (result.value?.ticket?.comments || []).map((c) => ({
    id: c.id,
    role: c.author.role,
    name: c.author.name,
    time: new Date(c.createdAt).toLocaleString(),
    body: c.body,
    createdAt: c.createdAt,
    formatedCreatedAt: timeAgo(c.createdAt),
  }))
);

const agentHasCommented = computed(() =>
  comments.value.some((c) => c.role === "agent")
);
const canReply = computed(
  () => isAgent.value || (isCustomer.value && agentHasCommented.value)
);

const { mutate: addComment } = useMutation(CREATE_COMMENT);
const reply = ref("");
const submitting = ref(false);

async function postComment() {
  submitting.value = true;
  await commentCall(
    () => addComment({ ticketId: route.params.id, body: reply.value }),
    "createComment"
  );
  submitting.value = false;
  if (!commentErrors.value.length) {
    reply.value = "";
    refetch();
  }
}

const { mutate: closeTicket } = useMutation(CLOSE_TICKET);
const { mutate: assignTicket } = useMutation(ASSIGN_TICKET);

async function updateTicketStatus(status) {
  if (status === "closed") {
    await closeTicket({ ticketId: ticket.value.id });
    refetch()
  }
}

async function assignToSelf() {
  await actionCall(
    () => assignTicket({ ticketId: ticket.value.id }),
    "assignTicket"
  );
}

// --- Sidebar meta rows ---
const metaRows = computed(() => [
  { label: "Status", value: ticket.value.status, isBadge: true },
  { label: "Ticket ID", value: ticket.value.id ? `Tik-${ticket.value.id}` : '—', mono: true },
  { label: "Opened", value: ticket.value.formatedCreatedAt },
  {
    label: "Last update",
    value:
      comments.value[comments.value.length - 1]?.formatedCreatedAt ||
      ticket.value.formatedCreatedAt,
  },
  {
    label: "Agent",
    value: ticket.value.agent?.name ?? "Unassigned",
    isAgent: !!ticket.value.agent,
  },
]);
</script>

<style scoped>
.page {
  display: flex;
  min-height: 100vh;
  background: var(--bg-base);
  font-family: -apple-system, BlinkMacSystemFont, "Inter", sans-serif;
}
.page-main {
  flex: 1;
  display: flex;
  flex-direction: column;
  min-width: 0;
}

.error-state {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 12px;
  padding: 80px 24px;
  text-align: center;
}

.error-icon {
  width: 60px;
  height: 60px;
  border-radius: 16px;
  background: var(--alert-error-bg);
  border: 1px solid var(--alert-error-border);
  color: var(--alert-error-text);
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 4px;
}

.error-title {
  font-size: 17px;
  font-weight: 700;
  color: var(--text-primary);
}

.error-sub {
  font-size: 14px;
  color: var(--text-muted);
  max-width: 320px;
  line-height: 1.6;
  margin-bottom: 4px;
}

.detail-body {
  display: grid;
  grid-template-columns: 1fr 280px;
  gap: 24px;
  padding: 28px 32px;
}

.detail-main {
  display: flex;
  flex-direction: column;
  gap: 20px;
}
.detail-sidebar {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.card {
  background: var(--bg-surface);
  border: 1px solid var(--border);
  border-radius: 12px;
  padding: 24px;
}
.card--flush {
  padding: 0;
  overflow: hidden;
}

.ticket-head {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 16px;
  margin-bottom: 14px;
}
.ticket-title {
  font-size: 18px;
  font-weight: 700;
  color: var(--text-primary);
  line-height: 1.4;
  letter-spacing: -0.02em;
}
.ticket-desc {
  font-size: 14px;
  color: var(--text-secondary);
  line-height: 1.7;
}

.attachments {
  margin-top: 16px;
  padding-top: 16px;
  border-top: 1px solid var(--border);
}
.attachments-label {
  font-size: 12px;
  color: var(--text-muted);
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  margin-bottom: 8px;
}
.attachment-image {
  max-width: 100%;
  max-height: 320px;
  border-radius: 10px;
  margin-top: 10px;
  object-fit: contain;
  border: 1px solid var(--border);
}
.attachment-pdf {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-top: 10px;
  padding: 12px 16px;
  background: var(--bg-elevated);
  border: 1px solid var(--border);
  border-radius: 10px;
  text-decoration: none;
  transition: border-color 0.15s;
}
.attachment-pdf:hover {
  border-color: var(--accent);
}
.attachment-pdf__icon {
  font-size: 10px;
  font-weight: 800;
  letter-spacing: 0.04em;
  color: var(--priority-text);
  background: var(--priority-bg);
  padding: 3px 6px;
  border-radius: 4px;
  flex-shrink: 0;
}
.attachment-pdf__name {
  font-size: 13px;
  color: var(--text-secondary);
  flex: 1;
}
.attachment-pdf__arrow {
  font-size: 14px;
  color: var(--text-muted);
}

.thread-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 20px;
  border-bottom: 1px solid var(--border);
}
.thread-title {
  font-size: 13px;
  font-weight: 700;
  color: var(--text-primary);
}
.thread-count {
  font-size: 12px;
  color: var(--text-muted);
}

.comment {
  padding: 18px 20px;
  border-bottom: 1px solid var(--border);
}
.comment--agent {
  background: var(--accent-bg);
}
.comment--last {
  border-bottom: none;
}

.comment-meta {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 10px;
}
.comment-author {
  font-size: 13px;
  font-weight: 600;
  color: var(--text-primary);
  display: flex;
  align-items: center;
  gap: 8px;
}
.comment-time {
  font-size: 11px;
  color: var(--text-muted);
  display: block;
  margin-top: 1px;
}
.comment-body {
  font-size: 14px;
  color: var(--text-secondary);
  line-height: 1.7;
  padding-left: 38px;
}

.agent-tag {
  font-size: 10px;
  background: var(--accent-badge-bg);
  color: var(--accent-badge-text);
  padding: 1px 6px;
  border-radius: 4px;
  font-weight: 700;
  letter-spacing: 0.04em;
}

.reply-waiting {
  padding: 16px 20px;
  font-size: 13px;
  color: var(--text-muted);
  border-top: 1px solid var(--border);
  text-align: center;
}

.reply-card {
  background: var(--bg-surface);
  border: 1px solid var(--border);
  border-left: 3px solid var(--accent);
  border-radius: 12px;
  padding: 20px 24px;
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.reply-card-header {
  display: flex;
  align-items: center;
  gap: 12px;
}

.reply-card-icon {
  width: 20px;
  height: 20px;
  color: var(--accent);
  flex-shrink: 0;
}

.reply-card-label {
  font-size: 14px;
  font-weight: 700;
  color: var(--text-primary);
}

.reply-card-hint {
  font-size: 12px;
  color: var(--text-muted);
  margin-top: 2px;
}

.reply-footer {
  display: flex;
  justify-content: flex-end;
}

.reply-closed {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 14px 18px;
  background: var(--bg-elevated);
  border: 1px solid var(--border);
  border-radius: 10px;
  font-size: 13px;
  color: var(--text-muted);
}

.meta-card {
  background: var(--bg-surface);
  border: 1px solid var(--border);
  border-radius: 10px;
  padding: 14px 16px;
}
.meta-label {
  font-size: 11px;
  color: var(--text-muted);
  font-weight: 700;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  margin-bottom: 8px;
}
.meta-value {
  font-size: 13px;
  color: var(--text-secondary);
}
.meta-mono {
  font-family: monospace;
  color: var(--mono-color);
}
.meta-agent {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 13px;
  color: var(--text-primary);
}

.meta-customer-name {
  font-size: 13px;
  color: var(--text-primary);
  font-weight: 500;
}
.meta-customer-email {
  font-size: 11px;
  color: var(--text-muted);
  margin-top: 1px;
}

.status-select {
  background: var(--bg-elevated);
  border: 1px solid var(--border);
  border-radius: 8px;
  padding: 7px 12px;
  color: var(--text-primary);
  font-size: 13px;
  font-family: inherit;
  cursor: pointer;
  outline: none;
  transition: border-color 0.15s;
}
.status-select:focus {
  border-color: var(--accent);
}

/* ── Responsive ──────────────────────────────── */
@media (max-width: 768px) {
  .page {
    flex-direction: column;
  }

  .detail-body {
    grid-template-columns: 1fr;
    padding: 16px;
    gap: 16px;
  }

  .detail-sidebar {
    order: -1;
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 10px;
  }

  .card {
    padding: 18px;
  }

  .comment-body {
    padding-left: 0;
  }
}

@media (max-width: 480px) {
  .detail-sidebar {
    grid-template-columns: 1fr;
  }

  .ticket-title {
    font-size: 16px;
  }
}
</style>