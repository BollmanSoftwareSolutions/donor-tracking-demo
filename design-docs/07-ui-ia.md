# 07 — UI & Information Architecture

React 19 + TypeScript + Vite, MUI components, React Router for navigation, TanStack Query for
server state. Layout is a persistent app shell (top bar + side nav) with feature areas as nested
routes.

## 1. Navigation map

```mermaid
flowchart TB
    LOGIN[/login/] --> SELECT[/select-tenant/<br/>auto-skip if single membership]
    SELECT --> SHELL[App shell<br/>active tenant + role aware]
    SHELL --> DASH[/dashboard/]
    SHELL --> DONORS[/donors/]
    DONORS --> DONOR[/donors/:id/]
    SHELL --> DONATIONS[/donations/]
    DONATIONS --> DONATION[/donations/:id/]
    SHELL --> CAMPAIGNS[/campaigns/]
    CAMPAIGNS --> CAMPAIGN[/campaigns/:id/]
    CAMPAIGNS --> GROUPS[/campaigns/groups/]
    SHELL --> FUNDS[/funds/]
    SHELL --> RECEIPTS[/receipts/]
    SHELL --> REPORTS[/reports/]
    SHELL --> IMPORT[/data/import-export/]
    SHELL --> AUDIT[/admin/audit/]
    SHELL --> SETTINGS[/admin/settings/]
    SHELL --> USERS[/admin/users/]
```

Admin-only routes (`/admin/*`) are guarded; unauthorized roles never see the nav entries and are
redirected if they deep-link.

After sign-in the user lands on **tenant selection**. If they have exactly one active membership
it is auto-selected and the screen is skipped; otherwise they pick an organization. The chosen
tenant becomes the **active tenant** for the session and can be changed anytime from the top-bar
tenant switcher, which re-scopes all data and the effective role.

## 2. Screen inventory

| Route | Screen | Key elements | Min role |
|-------|--------|--------------|:--------:|
| `/select-tenant` | Tenant selection | List of the user's organizations + role; auto-skip if only one | any authenticated |
| `/dashboard` | Overview | KPI cards, giving trend, top donors, recent gifts, filters | Viewer |
| `/donors` | Donor list | Search, filters, table, quick-add | Viewer (edit: Staff) |
| `/donors/:id` | Donor detail | Profile, masked PII w/ reveal, giving history, receipts, consent/GDPR | Viewer |
| `/donations` | Donation list | Filters (date/type/campaign/fund), table, add donation | Viewer |
| `/donations/:id` | Donation detail | Type-specific fields, payment/receipt status, void/refund | Viewer |
| `/campaigns` | Campaign list | Progress vs. goal, group chips, status | Viewer |
| `/campaigns/:id` | Campaign detail | Performance, donations, donors | Viewer |
| `/campaigns/groups` | Groups | Group list + rollups, assign campaigns | Viewer (edit: Admin) |
| `/funds` | Funds | List, restricted flag | Viewer (edit: Admin) |
| `/receipts` | Receipts | Issue per-donation, run annual batch, delivery status | Staff |
| `/reports` | Reports | Campaign/fund performance, retention/lapsed, export | Viewer |
| `/data/import-export` | Bulk data | CSV upload → map → validate → preview → commit; exports | Staff/Admin |
| `/admin/audit` | Audit log | Searchable trail | Admin |
| `/admin/settings` | Org settings | Receipt templates, branding, funds config | Admin |
| `/admin/users` | Users | Invite, assign roles, disable | Admin |

## 3. App shell & guards

```mermaid
flowchart LR
    subgraph Shell
      TOP[Top bar<br/>tenant switcher · user · role-switch demo]
      NAV[Side nav<br/>filtered by role]
      MAIN[Route outlet]
    end
    AUTHG[RequireAuth] --> ROLEG[RequireRole]
    ROLEG --> MAIN
    NAV -->|role-filtered links| MAIN
```

- `RequireAuth` gates all app routes; `RequireRole` gates admin/edit actions.
- Guards are **UX only** — the API is the real security boundary
  ([Security](./03-multitenancy-security.md)).

## 4. Sensitive field component

```mermaid
flowchart LR
    F[SensitiveField] --> R{role}
    R -->|Admin| SHOW[Show value]
    R -->|Staff| MASK[Masked + Reveal button]
    MASK -->|click| REV[POST /reveal → value + audit]
    R -->|Viewer| NONE[Not rendered]
```

A single reusable `<SensitiveField>` component encapsulates masking/reveal and calls the audited
reveal endpoint, keeping PII handling consistent across screens.

## 5. Component architecture

```mermaid
flowchart TB
    subgraph Presentational
      TABLE[DataTable]
      CHART[Chart wrappers - MUI X-Charts]
      FORM[Form fields + validation]
      SENS[SensitiveField]
      KPI[KpiCard]
    end
    subgraph Containers - route components
      LISTS[List pages]
      DETAILS[Detail pages]
      WIZ[Import wizard]
    end
    subgraph Data
      HOOKS[Feature hooks]
      QUERY[TanStack Query cache]
      CLIENT[Typed API client]
    end
    LISTS & DETAILS & WIZ --> HOOKS --> QUERY --> CLIENT
    LISTS --> TABLE
    DETAILS --> SENS & FORM
    DASHBOARD[Dashboard] --> KPI & CHART
```

## 6. Key UX flows

### Sign in & choose organization

```mermaid
flowchart LR
    LOGIN[Sign in - Firebase] --> MEM[Load memberships]
    MEM --> COUNT{How many orgs?}
    COUNT -->|One| AUTO[Auto-select tenant]
    COUNT -->|Many| PICK[Show tenant picker]
    AUTO & PICK --> CTX[Set active tenant + role]
    CTX --> DASH[Enter app / dashboard]
    DASH -. anytime .-> SWITCH[Top-bar tenant switcher -> re-scope]
    SWITCH --> DASH
```

### Add a donor

```mermaid
flowchart LR
    START[+ Add donor] --> TYPE{Donor type}
    TYPE -->|Individual| IND[Enter name, emails, phones]
    TYPE -->|Organization| ORG[Enter org name, contacts]
    IND & ORG --> ADDR[Add address_es_]
    ADDR --> CONSENT[Record consent + GDPR basis]
    CONSENT --> SENS[Optional sensitive fields<br/>Admin only]
    SENS --> DUPE{Possible duplicate?}
    DUPE -->|Yes| REVIEW[Review match → merge or continue]
    DUPE -->|No| SAVE[Save → audit: create]
    REVIEW --> SAVE
```

### Add a campaign

```mermaid
flowchart LR
    START[+ Add campaign] --> DETAILS[Enter name, description]
    DETAILS --> GROUP{Group it?}
    GROUP -->|Yes| PICK[Select campaign group]
    GROUP -->|No| STANDALONE[Standalone]
    PICK & STANDALONE --> GOAL[Set goal + start/end dates]
    GOAL --> STATUS[Set status: draft/active]
    STATUS --> SAVE[Save → audit: create]
```

### Add a donation

```mermaid
flowchart LR
    START[+ Add donation] --> TYPE{Type}
    TYPE -->|Online monetary| PAY[Enter amount → Stripe confirm → settled via webhook]
    TYPE -->|Offline cash/check| OFF[Enter amount, method, check no. → recorded]
    TYPE -->|In-kind| IK[Enter description + fair-market value → recorded]
    PAY & OFF & IK --> LINK[Optionally link campaign + fund]
    LINK --> RECEIPT{Issue receipt now?}
    RECEIPT -->|Yes| GEN[Generate PDF + email]
    RECEIPT -->|No| DONE[Save]
```

### Bulk import

```mermaid
flowchart LR
    UP[Upload CSV] --> MAP[Map columns] --> VALID[Validate] --> PREV[Preview + errors] --> COMMIT[Commit valid rows] --> REPORT[Result + error file]
```

## 7. Responsiveness & accessibility

- MUI responsive grid; tables collapse to card lists on small screens.
- Keyboard-navigable forms/tables, ARIA labels, sufficient color contrast for chart palettes.
- Loading/empty/error states standardized via shared components and TanStack Query status.

Next: [Roadmap & Decisions](./08-roadmap-decisions.md).
