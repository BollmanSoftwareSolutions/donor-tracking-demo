# Donor & Donation Tracking — High-Level Design

This directory contains the high-level design (HLD) for a **multi-tenant donor and donation
tracking system**. The production shape of the system is a React SPA backed by an
ASP.NET Core minimal API over MongoDB. For the portfolio **demo**, the backend is *mocked*
in the browser (in-memory API + seeded JSON persisted to `localStorage`), so the UI is fully
interactive without any server.

## Document index

| # | Document | Purpose |
|---|----------|---------|
| 00 | [Overview](./00-overview.md) | Goals, scope, personas, context diagram, glossary |
| 01 | [Architecture](./01-architecture.md) | Logical & deployment architecture, tech stack, component view |
| 02 | [Data Model](./02-data-model.md) | Entities, relationships (ERD), MongoDB collection shapes |
| 03 | [Multi-Tenancy & Security](./03-multitenancy-security.md) | Tenant isolation, RBAC, field-level access, PII/GDPR |
| 04 | [Features](./04-features.md) | Reporting, receipts, payments, import/export, audit |
| 05 | [API Design](./05-api-design.md) | REST resources, auth, tenant scoping, error model |
| 06 | [Mock Backend Strategy](./06-mock-strategy.md) | How the demo simulates the backend in-browser |
| 07 | [UI & Information Architecture](./07-ui-ia.md) | Routes, screens, component structure, navigation |
| 08 | [Roadmap & Decisions](./08-roadmap-decisions.md) | Phasing, deferred items, key decisions (ADRs) |

## Key decisions at a glance

| Area | Decision |
|------|----------|
| Frontend | React 19 + TypeScript + Vite, MUI, React Router, TanStack Query |
| Target backend | ASP.NET Core minimal API (.NET) |
| Database | MongoDB — **shared DB, shared collections, `tenantId` field** (app-level filtering) |
| Auth | Firebase Authentication; ID token identifies the user. Active tenant chosen after login; role from per-tenant membership |
| Demo backend | In-memory mock API + seeded JSON, persisted to `localStorage` |
| Multi-tenancy | Pooled model: every tenant-scoped document tagged with `tenantId`; users are global and join orgs via `memberships` (multi-tenant) |
| Roles | Admin, Staff, Viewer (internal users only; no donor logins) |

## Scope summary

**In scope:** donor contacts, donations (one-time monetary, offline cash/check, in-kind),
campaigns & campaign groups, funds, reporting/dashboards, per-donation + annual receipts,
Stripe payment integration, CSV bulk import/export, audit logging & GDPR tooling.

**Deferred (but modeled for):** recurring donations & pledges, donor self-service portal,
multi-currency settlement, advanced marketing automation.
