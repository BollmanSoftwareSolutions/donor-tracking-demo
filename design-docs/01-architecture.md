# 01 — Architecture

## 1. Architectural style

- **Client:** Single-Page Application (React SPA) — thick client, server-agnostic via a typed
  API client.
- **Server (target):** ASP.NET Core **minimal API**, stateless, horizontally scalable behind a
  load balancer.
- **Data:** MongoDB, **pooled multi-tenancy** (shared DB + shared collections + `tenantId`).
- **Auth:** Firebase Authentication as the identity provider; the API validates Firebase ID
  tokens and reads `tenantId` / `role` custom claims.
- **Demo:** the entire server + DB is replaced by an in-browser **mock API** module (see
  [Mock Strategy](./06-mock-strategy.md)). The React app does not know the difference.

## 2. Logical architecture (C4 Level 2 — Containers)

```mermaid
flowchart TB
    subgraph Browser
      SPA[React SPA<br/>MUI · React Router · TanStack Query]
      SPA --> APIC[Typed API Client<br/>src/api]
    end

    APIC -.demo.-> MOCK[Mock API + localStorage<br/>seeded JSON]
    APIC ==prod==> GW{{HTTPS / API Gateway}}

    GW --> API[ASP.NET Core Minimal API]

    subgraph Backend[Backend services - target]
      API --> AUTHM[AuthN/AuthZ middleware<br/>Firebase JWT + claims]
      API --> TEN[Tenant context resolver]
      API --> SVC[Domain services<br/>Donors · Donations · Campaigns · Receipts]
      API --> RPT[Reporting / aggregation]
      API --> INT[Integration adapters]
    end

    SVC --> DAL[(Data-access layer<br/>enforces tenantId)]
    RPT --> DAL
    DAL --> MDB[(MongoDB)]

    INT --> STRIPE[(Stripe)]
    INT --> EMAIL[(Email provider)]
    AUTHM --> FB[(Firebase Auth)]
    SVC --> BLOB[(Object storage<br/>receipt PDFs)]

    classDef demo stroke-dasharray:4 4,fill:#ffe;
    class MOCK demo;
```

## 3. Technology stack

| Layer | Technology | Notes |
|-------|-----------|-------|
| UI framework | React 19 + TypeScript + Vite | Already scaffolded in this repo |
| Component lib | MUI (`@mui/material`, `@mui/x-charts`) | Data tables, forms, charts |
| Routing | React Router | Nested layouts per feature area |
| Server state | TanStack Query | Caching, optimistic updates, retries |
| API contract | REST + JSON, OpenAPI-described | Typed client generated/handwritten in `src/api` |
| Backend (target) | ASP.NET Core minimal API (.NET) | Stateless, containerized |
| Database | MongoDB | Shared collections, `tenantId` indexed |
| Auth | Firebase Authentication | ID token (JWT) with custom claims |
| Payments | Stripe | Payment Intents + webhooks |
| Email | SendGrid (or SMTP) | Receipt delivery |
| PDF | Server-side renderer (e.g., QuestPDF) | Receipt & statement generation |
| Object storage | S3/Azure Blob | Stores generated PDFs |

## 4. Request lifecycle (production)

```mermaid
sequenceDiagram
    participant U as User (SPA)
    participant FB as Firebase Auth
    participant API as Minimal API
    participant DAL as Data-access layer
    participant DB as MongoDB

    U->>FB: Sign in
    FB-->>U: ID token (JWT: uid)
    U->>U: Select active tenant (auto if only one)
    U->>API: GET /api/donors  (Bearer JWT + X-Tenant-Id)
    API->>API: Validate JWT signature
    API->>API: Verify membership(uid, tenantId) → role
    API->>API: Resolve TenantContext(tenantId, userId, role)
    API->>DAL: FindDonors(query)
    DAL->>DB: find({ tenantId, ... })
    DB-->>DAL: docs (tenant-scoped)
    DAL-->>API: donors
    API->>API: Apply field-level projection by role
    API-->>U: 200 donors (sensitive fields masked)
```

The two **non-negotiable choke points** are:
1. **Tenant scoping** — every query passes through the data-access layer which injects
   `tenantId`. No service method may query MongoDB directly.
2. **Field-level projection** — responses are shaped by role before leaving the API.

## 5. Deployment view (target)

```mermaid
flowchart LR
    CDN[CDN / Static hosting<br/>React build] --> LB[Load Balancer]
    LB --> C1[API container 1]
    LB --> C2[API container 2]
    C1 & C2 --> MRS[(MongoDB replica set)]
    C1 & C2 --> OBJ[(Object storage)]
    C1 & C2 --> SG[(Email)]
    C1 & C2 --> ST[(Stripe)]
    C1 & C2 --> FBA[(Firebase Auth)]
```

- Stateless API containers → scale horizontally.
- MongoDB replica set for HA; indexes on `{ tenantId, ... }` for every hot query.
- Static SPA served from CDN; environment flag switches the API client between **mock** and
  **live** transports.

## 6. Frontend module structure

Maps onto the existing repo layout (`src/api`, `src/components`, `src/hooks`, `src/routes`):

```
src/
  api/         # Typed client + transport (mock | http), DTOs, query keys
  routes/      # Route components per feature (donors, donations, campaigns, reports…)
  components/  # Reusable UI (tables, forms, charts, PII field, role guards)
  hooks/       # useDonors, useDonations, useAuth, useTenant, useReport…
  assets/
```

## 7. Environment switch (demo vs. live)

```mermaid
flowchart LR
    ENV{VITE_API_MODE} -->|mock| M[MockTransport<br/>localStorage]
    ENV -->|http| H[HttpTransport<br/>fetch → API]
    M --> QC[TanStack Query]
    H --> QC
    QC --> UI[React components]
```

A single environment variable selects the transport; all UI, hooks, and query logic are
identical in both modes. This keeps the demo faithful to the production design.

Next: [Data Model](./02-data-model.md).
