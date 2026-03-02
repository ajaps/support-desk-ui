<template>
  <div class="page">
    <AppSidebar v-if="isAgent" />

    <div class="page-main">
      <AppTopbar
        :title="ticket.id"
        subtitle="Ticket detail"
        :show-logo="!isAgent"
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

      <div class="detail-body">
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
                :src="ticket.fileUrl"
                alt="attachment"
                class="attachment-image"
              />
            </div>
            <!-- <div v-if="ticket.fileUrl" class="attachments">
              <div class="attachments-label">Attachment</div>

              <a
                :href="ticket.fileUrl"
                target="_blank"
                class="attachment-link"
              >
                📎 View file
              </a>
            </div> -->
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

            <div v-if="canReply" class="reply-box">
              <AppAlert :errors="commentErrors" />
              <AppTextarea
                v-model="reply"
                placeholder="Write a reply…"
                :rows="3"
              />
              <div class="reply-footer">
                <AppButton
                  :disabled="!reply.trim() || submitting"
                  sm
                  @click="postComment"
                >
                  {{ submitting ? "Sending…" : "Send reply" }}
                </AppButton>
              </div>
            </div>

            <!-- Customer waiting message -->
            <div v-else-if="isCustomer" class="reply-waiting">
              Replies will be available once a support agent responds.
            </div>
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
const { result, error: queryError } = useQuery(GET_TICKET, {
  id: route.params.id,
});
watch(queryError, (e) => capturePageErrors(e));

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
  if (!commentErrors.value.length) reply.value = "";
}

const { mutate: closeTicket } = useMutation(CLOSE_TICKET);
const { mutate: assignTicket } = useMutation(ASSIGN_TICKET);

async function updateTicketStatus(status) {
  if (status === "closed") {
    await closeTicket({ ticketId: ticket.value.id });
    ticket.value.status = status; // optimistic update
  }
}

async function assignToSelf() {
  await actionCall(
    () => assignTicket({ ticketId: ticket.value.id }),
    "assignTicket"
  );

  ticket.value.agent = { name: auth.user.name }; // optimistic update
}

// --- Sidebar meta rows ---
const metaRows = computed(() => [
  { label: "Status", value: ticket.value.status, isBadge: true },
  { label: "Ticket ID", value: ticket.value.id, mono: true },
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
  background: #0a0a0f;
  font-family: -apple-system, BlinkMacSystemFont, "Inter", sans-serif;
}
.page-main {
  flex: 1;
  display: flex;
  flex-direction: column;
  min-width: 0;
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
  background: #111118;
  border: 1px solid #1e1e2e;
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
  color: #f1f1f3;
  line-height: 1.4;
  letter-spacing: -0.02em;
}
.ticket-desc {
  font-size: 14px;
  color: #9494a8;
  line-height: 1.7;
}

.attachments {
  margin-top: 16px;
  padding-top: 16px;
  border-top: 1px solid #1e1e2e;
}
.attachments-label {
  font-size: 12px;
  color: #4a4a62;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  margin-bottom: 8px;
}
.attachment-link {
  display: inline-block;
  font-size: 13px;
  color: #818cf8;
  margin-right: 12px;
  text-decoration: none;
}
.attachment-image {
  max-width: 100%;
  max-height: 320px;
  border-radius: 10px;
  margin-top: 10px;
  object-fit: contain;
  border: 1px solid #1e1e2e;
}
.attachment-link:hover {
  text-decoration: underline;
}

.thread-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 20px;
  border-bottom: 1px solid #1e1e2e;
}
.thread-title {
  font-size: 13px;
  font-weight: 700;
  color: #f1f1f3;
}
.thread-count {
  font-size: 12px;
  color: #4a4a62;
}

.comment {
  padding: 18px 20px;
  border-bottom: 1px solid #1e1e2e;
}
.comment--agent {
  background: rgba(99, 102, 241, 0.03);
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
  color: #f1f1f3;
  display: flex;
  align-items: center;
  gap: 8px;
}
.comment-time {
  font-size: 11px;
  color: #4a4a62;
  display: block;
  margin-top: 1px;
}
.comment-body {
  font-size: 14px;
  color: #9494a8;
  line-height: 1.7;
  padding-left: 38px;
}

.agent-tag {
  font-size: 10px;
  background: #312e81;
  color: #818cf8;
  padding: 1px 6px;
  border-radius: 4px;
  font-weight: 700;
  letter-spacing: 0.04em;
}

.reply-box {
  padding: 20px;
  background: #16161f;
  border-top: 1px solid #1e1e2e;
  display: flex;
  flex-direction: column;
  gap: 12px;
}
.reply-footer {
  display: flex;
  justify-content: flex-end;
}

.reply-waiting {
  padding: 16px 20px;
  font-size: 13px;
  color: #4a4a62;
  border-top: 1px solid #1e1e2e;
  text-align: center;
}

.meta-card {
  background: #111118;
  border: 1px solid #1e1e2e;
  border-radius: 10px;
  padding: 14px 16px;
}
.meta-label {
  font-size: 11px;
  color: #4a4a62;
  font-weight: 700;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  margin-bottom: 8px;
}
.meta-value {
  font-size: 13px;
  color: #9494a8;
}
.meta-mono {
  font-family: monospace;
  color: #818cf8;
}
.meta-agent {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 13px;
  color: #f1f1f3;
}

.meta-customer-name {
  font-size: 13px;
  color: #f1f1f3;
  font-weight: 500;
}
.meta-customer-email {
  font-size: 11px;
  color: #4a4a62;
  margin-top: 1px;
}

.status-select {
  background: #16161f;
  border: 1px solid #1e1e2e;
  border-radius: 8px;
  padding: 7px 12px;
  color: #f1f1f3;
  font-size: 13px;
  font-family: inherit;
  cursor: pointer;
  outline: none;
  transition: border-color 0.15s;
}
.status-select:focus {
  border-color: #6366f1;
}
</style>