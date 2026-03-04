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

          <div
            v-if="filteredTickets.length === 0"
            class="text-center py-10 text-gray-500"
          >
            No tickets found.
          </div>

          <div
            v-for="t in filteredTickets"
            :key="t.id"
            class="table-row"
            :style="gridStyle"
            @click="goToTicket(t.id)"
          >
            <!-- Ticket title + meta -->
            <div>
              <div class="ticket-meta">
                <span class="ticket-id">{{ t.id }}</span>
                <span v-if="t.priority === 'high'" class="priority-tag"
                  >HIGH</span
                >
              </div>
              <div class="ticket-title">{{ t.title }}</div>
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
  background: #0a0a0f;
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
  background: #111118;
  border: 1px solid #1e1e2e;
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
  color: #f1f1f3;
  margin-top: 4px;
}
.stat-sub {
  font-size: 11px;
  color: #4a4a62;
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
  color: #f1f1f3;
}

.filter-bar {
  display: flex;
  gap: 4px;
  background: #111118;
  border: 1px solid #1e1e2e;
  border-radius: 9px;
  padding: 3px;
}
.filter-btn {
  padding: 5px 14px;
  border-radius: 6px;
  border: none;
  background: transparent;
  color: #9494a8;
  font-size: 12px;
  font-weight: 400;
  cursor: pointer;
  font-family: inherit;
  transition: all 0.1s;
}
.filter-btn.active {
  background: #16161f;
  color: #f1f1f3;
  font-weight: 600;
}

.table-card {
  background: #111118;
  border: 1px solid #1e1e2e;
  border-radius: 12px;
  overflow: hidden;
}

.table-header {
  display: grid;
  grid-template-columns: 1fr 120px 100px 32px;
  padding: 10px 20px;
  border-bottom: 1px solid #1e1e2e;
  font-size: 11px;
  font-weight: 700;
  color: #4a4a62;
  letter-spacing: 0.06em;
  text-transform: uppercase;
}

.table-row {
  display: grid;
  padding: 14px 20px;
  cursor: pointer;
  border-bottom: 1px solid #1e1e2e;
  transition: background 0.1s;
  align-items: center;
}
.table-row:last-child {
  border-bottom: none;
}
.table-row:hover {
  background: #16161f;
}

.ticket-meta {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 4px;
}
.ticket-id {
  font-family: monospace;
  font-size: 11px;
  color: #4a4a62;
  font-weight: 600;
}
.priority-tag {
  font-size: 10px;
  background: #2d1218;
  color: #ef4444;
  padding: 1px 6px;
  border-radius: 4px;
  font-weight: 700;
  letter-spacing: 0.04em;
}
.ticket-title {
  font-size: 13px;
  color: #f1f1f3;
  font-weight: 500;
  line-height: 1.4;
}

.customer-cell {
  display: flex;
  align-items: center;
  gap: 7px;
  font-size: 12px;
  color: #9494a8;
}
.agent-cell {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 12px;
  color: #9494a8;
}
.unassigned-tag {
  font-size: 11px;
  background: #1a1a2a;
  color: #4a4a62;
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
  color: #4a4a62;
  display: flex;
  align-items: center;
}
.cell-caret {
  font-size: 16px;
}

.export-btn {
  padding: 7px 14px;
  background: #16161f;
  border: 1px solid #1e1e2e;
  border-radius: 8px;
  font-size: 13px;
  color: #9494a8;
  text-decoration: none;
  transition: all 0.15s;
  white-space: nowrap;
}
.export-btn:hover {
  border-color: #2a2a3e;
  color: #f1f1f3;
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
    gap: 6px;
    align-items: flex-start;
    padding: 14px 16px;
  }

  .cell-muted.cell-caret {
    display: none;
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