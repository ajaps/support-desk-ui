# Support Desk UI

A customer support ticketing system built with Vue 3. Customers submit and track support requests; agents manage, assign, and resolve them — all through a shared GraphQL API.

## Tech Stack

- **Vue 3** (Composition API) + **Vite**
- **Apollo Client** — GraphQL queries & mutations
- **Pinia** — auth state management
- **Vue Router** — client-side routing with navigation guards
- **Rails ActiveStorage** — direct file uploads
- **Tailwind CSS v4**

## Features

### Customer

- Sign up / sign in
- Submit tickets with an optional file attachment (PNG, JPG, PDF up to 4 MB) via drag-and-drop or file browser
- View all personal tickets with status filtering (All / Open / Closed)
- Reply to a ticket once a support agent has responded

### Agent

- Dashboard with open/closed ticket counts and stats
- View all tickets across all customers
- Assign a ticket to themselves
- Close tickets
- Export recently closed tickets as CSV

## Local Development

### 1. Install dependencies

```bash
npm install
```

### 2. Configure environment

```bash
cp .env.example .env
```

| Variable | Default | Description |
| --- | --- | --- |
| `VITE_GRAPHQL_URL` | `http://localhost:3000/graphql` | GraphQL endpoint |
| `VITE_BE_URL` | `http://localhost:3000` | Base backend URL (ActiveStorage uploads) |

Update these values if your Rails backend runs on a different port or host.

### 3. Start the dev server

```bash
npm run dev
```

The app runs at `http://localhost:5173`. Your Rails backend must be running and have CORS configured to accept requests from that origin.

## Project Structure

```text
src/
├── apollo/          # Apollo Client setup (auth headers, HTTP link)
├── composables/     # useGraphqlErrors, useTimeAgo
├── graphql/         # GQL query/mutation definitions
├── layout/          # AppTopbar, AppSidebar
├── components/      # Shared UI components (AppButton, AppBadge, etc.)
├── stores/          # Pinia stores (auth)
├── utils/           # uploadFile (ActiveStorage direct upload)
├── views/           # Auth, TicketList, TicketDetail, CreateTicket
└── router/          # Routes + auth/role guards
```

## Deployment (Cloudflare Pages)

Build settings:

- Build command: `npm run build`
- Output directory: `dist`

Environment variables — set these in the Cloudflare Pages dashboard under *Settings → Environment Variables*:

- `VITE_GRAPHQL_URL` — production GraphQL endpoint
- `VITE_BE_URL` — production backend base URL

SPA routing is handled by [`public/_redirects`](public/_redirects), which redirects all 404s to `index.html`.

Your Rails backend must also allow the Cloudflare Pages domain as a CORS origin.

## Backend

This frontend requires a compatible Rails GraphQL API. The API must expose:

- `signIn` / `signUp` mutations returning a JWT and user object
- `tickets` query and `createTicket`, `closeTicket`, `assignTicket`, `exportRecentlyClosedTickets` mutations
- `createComment` mutation
- ActiveStorage direct upload endpoint at `/rails/active_storage/direct_uploads`
