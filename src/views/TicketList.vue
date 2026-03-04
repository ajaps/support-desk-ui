<template>
  <div class="page">
    <!-- Sidebar only renders for agents -->
    <AppSidebar
      v-if="isAgent"
      :openTicketCount="openTicketsCount"
      :closedTicketCount="closedTicketsCount"
    />

    <div class="page-main">
      <AppTopbar
        :title="isAgent ? 'Dashboard' : 'My Tickets'"
        :subtitle="isAgent ? today : 'Track and manage your support requests'"
      >
        <template #actions>
          <!-- Agent only: CSV export -->
          <a
            v-if="isAgent"
            class="export-btn"
            href="#"
            @click.prevent="exportCSV"
          >
            ⬇ Export CSV
          </a>
          <!-- Customer only: new ticket -->
          <AppButton v-if="isCustomer" sm @click="router.push('/tickets/new')">
            <span class="plus">+</span> New ticket
          </AppButton>
        </template>
      </AppTopbar>

      <div class="page-body">
        <AppAlert :errors="errors" />

        <!-- Stats -->
        <div class="stats-grid" :class="{ 'stats-grid--4': isAgent }">
          <div class="stat-card" v-for="s in stats" :key="s.label">
            <div class="stat-value" :style="{ color: s.color || '#F1F1F3' }">
              {{ s.value }}
            </div>
            <div class="stat-label">{{ s.label }}</div>
            <div class="stat-sub">{{ s.sub }}</div>
          </div>
        </div>

        <!-- Section header -->
        <div class="section-head">
          <h2 class="section-title">
            {{ isAgent ? "All Tickets" : "My Tickets" }}
          </h2>
          <div class="filter-bar">
            <button
              v-for="f in filters"
              :key="f.value"
              :class="['filter-btn', { active: activeFilter === f.value }]"
              @click="activeFilter = f.value"
            >
              {{ f.label }}
            </button>
          </div>
        </div>

        <!-- Table -->
        <div class="table-card">
          <div class="table-header" :style="gridStyle">
            <!-- Agent gets extra columns -->
            <span>Ticket</span>
            <span v-if="isAgent">Customer</span>
            <span>Status</span>
            <span v-if="isAgent">Assigned</span>
            <span>Created</span>
            <span></span>
          </div>


          <div v-if="filteredTickets.length === 0" class="empty-state">
            <div class="empty-icon">
              <svg v-if="isCustomer && activeFilter === 'all' && allTickets.length === 0" xmlns="http://www.w3.org/2000/svg" width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
                <polyline points="22 12 16 12 14 15 10 15 8 12 2 12"/>
                <path d="M5.45 5.11L2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.45-6.89A2 2 0 0 0 16.76 4H7.24a2 2 0 0 0-1.79 1.11z"/>
              </svg>
              <svg v-else xmlns="http://www.w3.org/2000/svg" width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
                <circle cx="11" cy="11" r="8"/>
                <line x1="21" y1="21" x2="16.65" y2="16.65"/>
              </svg>
            </div>

            <div class="empty-title">
              <template v-if="isCustomer && activeFilter === 'all' && allTickets.length === 0">No tickets yet</template>
              <template v-else-if="activeFilter !== 'all'">No {{ activeFilter }} tickets</template>
              <template v-else>No tickets found</template>
            </div>

            <div class="empty-sub">
              <template v-if="isCustomer && activeFilter === 'all' && allTickets.length === 0">
                You haven't submitted any support requests yet. Create your first ticket and our team will get back to you shortly.
              </template>
              <template v-else-if="activeFilter !== 'all'">
                There are no {{ activeFilter }} tickets to show right now.
              </template>
              <template v-else>
                There are no tickets matching the current filter.
              </template>
            </div>

            <AppButton
              v-if="isCustomer && activeFilter === 'all' && allTickets.length === 0"
              sm
              @click="router.push('/tickets/new')"
            >
              <span class="plus">+</span> New ticket
            </AppButton>
          </div>

          <div
            v-for="t in filteredTickets"
            :key="t.id"
            class="table-row"
            :style="gridStyle"
            @click="goToTicket(t.id)"
          >
            <!-- Ticket ID chip + title -->
            <div class="ticket-cell">
              <div class="ticket-id-row">
                <span class="ticket-id-chip">Tik-{{ t.id }}</span>
                <span v-if="t.priority === 'high'" class="priority-tag">HIGH</span>
              </div>
              <div class="ticket-title">{{ t.title }}</div>
              <!-- Mobile-only: show status + date inline under title -->
              <div class="ticket-mobile-meta">
                <AppBadge :status="t.status" />
                <span class="ticket-mobile-date">{{ t.created }}</span>
              </div>
            </div>

            <!-- Agent only: customer column -->
            <div v-if="isAgent" class="customer-cell">
              <AppAvatar :name="t.customer" :size="22" color="#3B82F6" />
              <span>{{ t.customer }}</span>
            </div>

            <!-- Status -->
            <div class="cell-center">
              <AppBadge :status="t.status" />
            </div>

            <!-- Agent only: assigned column -->
            <div v-if="isAgent">
              <div v-if="t.agent" class="agent-cell">
                <AppAvatar :name="t.agent" :size="20" />
                <span>{{ t.agent }}</span>
              </div>
              <span v-else class="unassigned-tag">Unassigned</span>
            </div>

            <!-- Created -->
            <div class="cell-muted">{{ t.created }}</div>

            <!-- Caret -->
            <div class="cell-muted cell-caret">›</div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch } from "vue";
import { useRouter } from "vue-router";
import { useAuthStore } from "@/stores/auth";
import AppSidebar from "@/layout/AppSidebar.vue";
import AppTopbar from "@/layout/AppTopbar.vue";
import AppButton from "@/components/AppButton.vue";
import AppBadge from "@/components/AppBadge.vue";
import AppAvatar from "@/components/AppAvatar.vue";
import AppAlert from "@/components/AppAlert.vue";
import { useQuery, useMutation } from "@vue/apollo-composable";
import { GET_TICKETS } from "@/graphql/tickets.gql";
import gql from "graphql-tag";
import { AVG_RESPONSE_TIME } from "@/graphql/analytics.gql";
import { useGraphqlErrors } from "@/composables/useGraphqlErrors";

const router = useRouter();
const auth = useAuthStore();

const isAgent = computed(() => auth.isAgent);
const isCustomer = computed(() => auth.isCustomer);

const today = new Date().toLocaleDateString("en-US", {
  weekday: "long",
  day: "numeric",
  month: "long",
  year: "numeric",
});

function goToTicket(id) {
  router.push(`/tickets/${id}`);
}

const EXPORT_MUTATION = gql`
  mutation ExportRecentlyClosedTickets {
    exportRecentlyClosedTickets(input: {}) {
      message
      success
    }
  }
`;

const { errors, captureErrors } = useGraphqlErrors();
const { result, error: queryError } = useQuery(GET_TICKETS, null, { fetchPolicy: "cache-and-network" });
watch(queryError, (e) => captureErrors(e));
const { mutate: exportMutate, loading: exportLoading } =
  useMutation(EXPORT_MUTATION); // ← fix
const { result: analytics, refetch } = useQuery(
  AVG_RESPONSE_TIME,
  null,
  { fetchPolicy: "cache-and-network" }
);

const tickets = computed(() => result.value?.tickets?.nodes || []);

const allTickets = computed(() =>
  tickets.value.map((t) => ({
    id: t.id,
    title: t.title,
    status: t.status,
    customer: t.customer.name,
    agent: t.agent ? t.agent.name : null,
    created: formatDate(t.createdAt),
  }))
);

const openTicketsCount = computed(
  () => tickets.value.filter((t) => t.status === "open").length
);
const closedTicketsCount = computed(
  () => tickets.value.filter((t) => t.status === "closed").length
);

const formatDate = (date) => new Date(date).toLocaleDateString();

const exportCSV = async () => {
  try {
    const { data } = await exportMutate();

    if (data.exportRecentlyClosedTickets.success) {
      alert(data.exportRecentlyClosedTickets.message);
    } else {
      alert("Export failed: " + data.exportRecentlyClosedTickets.message);
    }
  } catch (e) {
    alert("Export failed: " + e.message);
  }
};

const activeFilter = ref("all");
const filters = [
  { label: "All", value: "all" },
  { label: "Open", value: "open" },
  { label: "Closed", value: "closed" },
];

const filteredTickets = computed(() => {
  if (activeFilter.value === "all") return allTickets.value;
  return allTickets.value.filter((t) => t.status === activeFilter.value);
});

const stats = computed(() =>
  isAgent.value
    ? [
        {
          label: "Open",
          value: openTicketsCount.value,
          color: "#3B82F6",
          sub: "Unassigned",
        },
        {
          label: "Closed",
          value: closedTicketsCount.value,
          color: "#10B981",
          sub: "Last 30 days",
        },
        {
          label: "Avg Response",
          value: analytics.value ? `${analytics.value.averageAgentResponseTime}` : "N/A",
          color: "#818CF8",
          sub: "This Month",
        },
      ]
    : [
        { label: "Total", value: allTickets.value.length, sub: "All time" },
        {
          label: "Open",
          value: openTicketsCount.value,
          color: "#F59E0B",
          sub: "Active now",
        },
        {
          label: "Resolved",
          value: closedTicketsCount.value,
          color: "#10B981",
          sub: "Last 30 days",
        },
      ]
);

const gridStyle = computed(() => ({
  gridTemplateColumns: isAgent.value
    ? "1fr 130px 110px 120px 80px 32px"
    : "1fr 120px 100px 32px",
}));
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
.page-body {
  padding: 28px 32px;
}
.plus {
  font-size: 16px;
  line-height: 1;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 14px;
  margin-bottom: 28px;
}
.stats-grid--4 {
  grid-template-columns: repeat(4, 1fr);
}

.stat-card {
  background: var(--bg-surface);
  border: 1px solid var(--border);
  border-radius: 12px;
  padding: 18px 20px;
}
.stat-value {
  font-size: 30px;
  font-weight: 800;
  letter-spacing: -0.04em;
}
.stat-label {
  font-size: 13px;
  font-weight: 600;
  color: var(--text-primary);
  margin-top: 4px;
}
.stat-sub {
  font-size: 11px;
  color: var(--text-muted);
  margin-top: 2px;
}

.section-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 14px;
}
.section-title {
  font-size: 15px;
  font-weight: 700;
  color: var(--text-primary);
}

.filter-bar {
  display: flex;
  gap: 4px;
  background: var(--bg-surface);
  border: 1px solid var(--border);
  border-radius: 9px;
  padding: 3px;
}
.filter-btn {
  padding: 5px 14px;
  border-radius: 6px;
  border: none;
  background: transparent;
  color: var(--text-secondary);
  font-size: 12px;
  font-weight: 400;
  cursor: pointer;
  font-family: inherit;
  transition: all 0.1s;
}
.filter-btn.active {
  background: var(--bg-elevated);
  color: var(--text-primary);
  font-weight: 600;
}

.table-card {
  background: var(--bg-surface);
  border: 1px solid var(--border);
  border-radius: 12px;
  overflow: hidden;
}

.table-header {
  display: grid;
  grid-template-columns: 1fr 120px 100px 32px;
  padding: 10px 20px;
  border-bottom: 1px solid var(--border);
  font-size: 11px;
  font-weight: 700;
  color: var(--text-muted);
  letter-spacing: 0.06em;
  text-transform: uppercase;
}

.table-row {
  display: grid;
  padding: 14px 20px;
  cursor: pointer;
  border-bottom: 1px solid var(--border);
  transition: background 0.1s;
  align-items: center;
}
.table-row:last-child {
  border-bottom: none;
}
.table-row:hover {
  background: var(--bg-elevated);
}

.ticket-cell {
  display: flex;
  flex-direction: column;
  gap: 5px;
  min-width: 0;
}

.ticket-id-row {
  display: flex;
  align-items: center;
  gap: 6px;
}

.ticket-id-chip {
  font-family: monospace;
  font-size: 11px;
  font-weight: 700;
  color: var(--mono-color);
  background: var(--accent-bg);
  padding: 2px 7px;
  border-radius: 4px;
  letter-spacing: 0.02em;
  white-space: nowrap;
  flex-shrink: 0;
}

.priority-tag {
  font-size: 10px;
  background: var(--priority-bg);
  color: var(--priority-text);
  padding: 1px 6px;
  border-radius: 4px;
  font-weight: 700;
  letter-spacing: 0.04em;
}

.ticket-title {
  font-size: 13px;
  color: var(--text-primary);
  font-weight: 500;
  line-height: 1.4;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

/* Mobile-only metadata row (status + date) shown inside the ticket cell */
.ticket-mobile-meta {
  display: none;
}

.customer-cell {
  display: flex;
  align-items: center;
  gap: 7px;
  font-size: 12px;
  color: var(--text-secondary);
}
.agent-cell {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 12px;
  color: var(--text-secondary);
}
.unassigned-tag {
  font-size: 11px;
  background: var(--unassigned-bg);
  color: var(--unassigned-text);
  padding: 2px 8px;
  border-radius: 4px;
  font-weight: 600;
}
.cell-center {
  display: flex;
  align-items: center;
}
.cell-muted {
  font-size: 12px;
  color: var(--text-muted);
  display: flex;
  align-items: center;
}
.cell-caret {
  font-size: 16px;
}

.export-btn {
  padding: 7px 14px;
  background: var(--bg-elevated);
  border: 1px solid var(--border);
  border-radius: 8px;
  font-size: 13px;
  color: var(--text-secondary);
  text-decoration: none;
  transition: all 0.15s;
  white-space: nowrap;
}
.export-btn:hover {
  border-color: var(--border-strong);
  color: var(--text-primary);
}

/* ── Empty state ─────────────────────────────── */
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 56px 24px;
  text-align: center;
  gap: 10px;
}

.empty-icon {
  width: 56px;
  height: 56px;
  border-radius: 16px;
  background: var(--bg-elevated);
  border: 1px solid var(--border);
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--text-muted);
  margin-bottom: 6px;
}

.empty-title {
  font-size: 15px;
  font-weight: 700;
  color: var(--text-primary);
}

.empty-sub {
  font-size: 13px;
  color: var(--text-muted);
  max-width: 300px;
  line-height: 1.6;
  margin-bottom: 4px;
}

/* ── Responsive ──────────────────────────────── */
@media (max-width: 900px) {
  .stats-grid--4 {
    grid-template-columns: repeat(2, 1fr) !important;
  }
}

@media (max-width: 768px) {
  .page {
    flex-direction: column;
  }

  .page-body {
    padding: 16px;
  }

  .stats-grid {
    grid-template-columns: repeat(2, 1fr);
    gap: 10px;
    margin-bottom: 20px;
  }

  .stats-grid--4 {
    grid-template-columns: repeat(2, 1fr) !important;
  }

  .section-head {
    flex-direction: column;
    align-items: flex-start;
    gap: 10px;
  }

  /* Table: hide header, show rows as cards */
  .table-header {
    display: none !important;
  }

  .table-row {
    display: flex !important;
    flex-direction: column;
    gap: 0;
    align-items: stretch;
    padding: 14px 16px;
  }

  /* Show mobile meta row (status + date) inside ticket cell */
  .ticket-mobile-meta {
    display: flex;
    align-items: center;
    gap: 10px;
    margin-top: 8px;
  }

  .ticket-mobile-date {
    font-size: 11px;
    color: var(--text-muted);
  }

  /* Don't truncate title on mobile */
  .ticket-title {
    white-space: normal;
  }

  /* Hide standalone status/date/agent/caret cells on mobile */
  .cell-center,
  .cell-muted,
  .customer-cell,
  .agent-cell,
  .unassigned-tag,
  .cell-caret {
    display: none !important;
  }
}

@media (max-width: 480px) {
  .stats-grid,
  .stats-grid--4 {
    grid-template-columns: 1fr !important;
  }

  .stat-value {
    font-size: 24px;
  }
}
</style>