Here is the master document summarizing the best practices for the SurgiFlow design system, followed by a prioritized implementation plan to deploy these changes across all screens.

---

# PART 1: The Master Document — SurgiFlow (SF-RCC) Unified Design System

### Purpose & Mission

Make every SF screen (Dashboard, Patient Form, Rapid View popup, Readmission Checklist, SF-CCOIP) feel like one integrated product. This specification acts as the source of truth; all screens must inherit these tokens and components. No screen or component may invent its own navigation, border radius, badge style, or status color meaning.

## 1. Core Principles: Diagnosis & Remedies

Current cohesion breaks down due to drift in key UI areas. The system must enforce these fixes:

1. **Unified Navigation:** Every screen must use an identical navigation component with consistent logo alignment, centering, and active tab states.
2. **Strict Typography Hierarchy:** Section headers and micro-labels are UPPERCASE for structure. All other text (page titles, card titles, body text) must use Sentence case to remove the "shouting" feel of the current UI.
3. **Meaningful Status Colors:** Five status colors are defined with strict, singular meanings. Red means critical/high-risk, not error. **The critical change:** Purple is restricted to Brand/Interactive ONLY and is no longer a data category.
4. **Flat and Simple Components:** Remove gradients from all badges, chips, and banners. Simplify complex components like Unit Cards by removing heavy metric backgrounds.
5. **Receding Controls:** Filter panels and input areas must recede visually (lighter borders, no shadows, faint backgrounds), allowing primary content (patient data, KPIs) to dominate the hierarchy.

## 2. Design Tokens (`:root`)

This CSS snippet must be the foundation of the SurgiFlow CSS architecture (or SPFx theme). No hard-coded hex codes may be used; every component must reference these `var(--sf-*)` tokens.

```css
:root {
  /* Surfaces */
  --sf-nav: #0F1B2D;
  --sf-bg: #F5F7FB;
  --sf-card: #FFFFFF;
  --sf-border: #E3E9F1;
  --sf-border-strong: #CBD5E6;

  /* Text */
  --sf-text: #1B2536;
  --sf-text-2: #66758A;
  --sf-text-inv: #FFFFFF;

  /* Brand / Interactive */
  --sf-primary: #5B3FD8;
  --sf-primary-tint: #F4F2FE;
  --sf-accent: #22B8CF;

  /* Status Colors */
  --sf-red: #C90019;
  --sf-red-bg: #FFF9F9;
  --sf-red-bd: #FFD8D8;
  --sf-amber: #B7791F;
  --sf-amber-bg: #FFFBEB;
  --sf-amber-bd: #FDE68A;
  --sf-green: #067647;
  --sf-green-bg: #F0FDF4;
  --sf-green-bd: #BBF7D0;
  --sf-slate: #5A6B82;
  --sf-slate-bg: #F3F6FA;
  --sf-slate-bd: #E1E8F1;

  /* Spacing Rhythm (8pt scale) */
  --s1: 4px; --s2: 8px; --s3: 12px; --s4: 16px;
  --s5: 20px; --s6: 24px; --s7: 28px; --s8: 32px;

  /* Radius Policy */
  --r-pill: 999px;  /* Tabs, filter pills, toggles */
  --r-card: 12px;   /* KPI, unit, patient cards */
  --r-panel: 10px;  /* Filter panels, sections */
  --r-input: 8px;   /* Form inputs, buttons */
  --r-badge: 6px;   /* Stats badges (LOS, Bed #) */

  /* Elevation (Shading) */
  --sh-sm: 0 1px 2px rgba(16, 27, 45, .06);  /* Cards, smaller elements */
  --sh-md: 0 4px 12px rgba(16, 27, 45, .08); /* Important panels, popups */

  /* Typography Scale (Segoe UI) */
  --t-page: 24px;       /* Page Title */
  --t-section: 12px;    /* Section Header (Upper) */
  --t-cardtitle: 16px;  /* Card Title (Sentence) */
  --t-kpi: 34px;        /* KPI Number */
  --t-body: 14px;       /* Body Text */
  --t-label: 11px;      /* Micro-label (Upper) */
  --font: "Segoe UI", Inter, system-ui, sans-serif;
}

```

## 3. Typography Rules

| Role | Specification | Case | Color |
| --- | --- | --- | --- |
| Page title | 24 / 800 (Extra Bold) | **Sentence case** | `--sf-text` |
| Section header | 12 / 700, tracking .06em | **UPPERCASE** | `--sf-text-2` |
| Card title | 16 / 700 (Bold) | **Sentence case** | `--sf-text` |
| KPI number | 34 / 800 (Extra Bold) | — | status color |
| Body | 14 / 400 (Normal) | **Sentence case** | `--sf-text` |
| Label / helper | 11 / 600, tracking .04em | **UPPERCASE** | `--sf-text-2` |

## 4. Component Standards

### 4.1 Navigation (Global)

This navigation component is identical across all four screens.

* **Structure:** `[≡] [SURGIFLOW LOGO] SF-RCC Cardiac Hospital · v6.1 | [Archive Action] [Discharge Action]`
* **Row 2:** `Cardiac Hospital | Patient Form | Readmission Checklist | SF-CCOIP` (Tabs)
* **Specification:**
* Height: **64px**, background: `--sf-nav`.
* Active Tab: PURPLE pill, `--r-pill`, `padding: 6px 14px`.
* Logo cyan: `--sf-accent`. Version text: `--sf-text-2` (12px).



### 4.2 KPI Card (Dashboard)

A single, standardized card for key metrics.

* **Specification:**
* Background: `--sf-card`, border: 1px `--sf-border`.
* Radius: `--r-card` (**12px**), elevation: `--sh-sm`.
* Padding: 16px 18px.


* **Urgency Rule:** High-risk cards use `--sf-red-bg` background and `--sf-red-bd` border. The background must be a light tint, never solid red. Number is `--sf-red`.
* **Text Rule:** Helper text max **1 line** ("Huddle required").

### 4.3 Unit Card (Dashboard)

This component is dramatically simplified by removing multiple inner containers.

* **Specification:**
* Radius: **12px** (`--r-card`), `--sh-sm`.


* **Interior Layout:**
* Unit Name (Card title spec), Bed Count (`.badge` slate).
* ████████████ (Census status bar).
* 0 DRIPS | 12 BARRIERS | 0 OR TODAY (A single row separated by thin `--sf-border` dividers. Numbers are 16/700, labels are 11/600 UPPERCASE).



### 4.4 Status Banner (Form, Popup, Checklist)

A unified, state-driven banner that replaces three previous distinct designs. Same layout everywhere.

* **Specification:** Radius: **10px** (`--r-panel`), padding: 12px 16px. Border: 1px solid.
* **Variants:**
* `.banner--high`: red tint, `--sf-red`.
* `.banner--ready`: green tint, `--sf-green`.
* `.banner--info`: slate tint, `--sf-slate`.



### 4.5 Pills & Badges

* **Pills (`.pill`):** Shape is `--r-pill`. Padding 4px 12px. Bordered. Core Pathways are `.pill` (slate) when inactive, and `.pill--on` (purple) when selected.
* **Badges (`.badge`):** Shape is `--r-badge`. Padding 2px 8px. Stat badges (POD/LOS/GMLOS/BM) are **flat** status tints, removing all gradients. Bed count is a slate `.badge`.

### 4.6 Toggles (Readmission Checklist Y/N/NA)

* **Structure:** A 3-cell segmented control, shape `--r-pill`.
* **States:**
* Y: Green tint on select.
* N: Red tint on select.
* N/A: Slate tint on select.
* Unselected: Plain, neutral background.


* **Rule:** Red-line items in the checklist only keep a red left-accent and a red icon; the entire cell must be neutral until selected.

### 4.7 Form Fields & Buttons (Patient Form)

* **Specification:** All inputs/selects height 38px, border `--sf-border`, `--r-input` (**8px**). Purple focus ring. Required fields mark with a 3px left purple border. Section headers use `--sf-primary` with sentence case titles.
* **Buttons:** Standard height **40px**, shape **8px** (`--r-input`).
* Primary Action: `.btn--primary` (solid purple).
* Secondary Action: `.btn--ghost` (bordered transparent).
* Danger Action (e.g., Discharge): `.btn--danger` (solid red).



### 4.8 Panels (Filter Areas, CCOIP Imports)

Filters and background areas recede visually to prioritize content.

* **Specification:** Background `#F8FAFD` (faint bg), border `--sf-border`, shape **10px** (`--r-panel`), **no shadow**, smaller UPPERCASE header. CCOIP import gradient banner is removed, replaced by a flat header bar in `--sf-nav` with a cyan title, matching the nav pattern.

## 5. Spacing Rhythm & Radius Policy

A consistent 8pt scale must be applied to every screen to ensure a predictable hierarchy.

| Rule | Specification |
| --- | --- |
| **Rhythm** |  |
| Nav → Page title | 28px |
| Page title → Subtitle | 4px |
| Subtitle → First block | 18px |
| Section → Section | 30px |
| Heading → Its content | 14px |
| Card row → Card row | 18px |
| Content → Panel/Footer | 26px |
| **Radius Policy** |  |
| Pills / Tabs | **999px** (`--r-pill`) |
| KPI, Unit, Patient Cards | **12px** (`--r-card`) |
| Panels, Large Sections | **10px** (`--r-panel`) |
| Inputs / Buttons | **8px** (`--r-input`) |
| Stats Badges | **6px** (`--r-badge`) |

---

# PART 2: The Implementation Plan

This plan organizes the high-impact fixes into four logical phases. This is designed for immediate impact on visual cohesion, followed by component-level standardization.

### Automation Note

Prioritize automating the style deployment. Section 2 (Design Tokens) must be implemented in a single `tokens.css` file (or SPFx theme). All components must reference `var(--sf-*)`. This ensures that a single brand or status color update propagates automatically across all five screens, eliminating hard-coded styling.

## Phase 1: High-Impact Foundation (Weeks 1–2)

*Goal: Implement global recoloring and status logic for the biggest cohesion gain.*

1. **Ship Tokens & Status Colors:** Implement §2 (Design Tokens) and §3 (Typography) globally. Create the single `tokens.css` asset. Execute a global recoloring pass, applying status tints (`--sf-*-bg`, `--sf-*-bd`) and removing hard-coded hex codes.
2. **Redefine Purple Status:** Enforce the critical logic: Purple is reserved for Brand/Interactive ONLY (§1). This immediately changes Core Pathways data to neutral (slate) until selected (purple), freeing up purple from data categorization.

## Phase 2: Core Global Components (Weeks 3–4)

*Goal: Unify the interface elements used on every screen.*

1. **Standardize Global Navigation:** Implement §4.1 (Navigation) across all five screens. This creates an identical 64px header, centers the titles, standardizes the tabs, and aligns all logo/archive/discharge elements.
2. **Unify Pills & Badges:** Build and deploy §4.5. Critically, flatten all stat badges (LOS, BM) by removing gradients and implement flat status tints.
3. **One Status Banner:** Deploy §4.4 (Status Banner) as a single component to replace the multiple, incompatible banner styles in Patient Form, Rapid View, and Checklist.

## Phase 3: Major Screen Overhauls (Weeks 5–6)

*Goal: Rebuild the two primary workspaces: Dashboard and Popup.*

1. **Simplify Dashboard Hierarchy & Units:** Implement §4.2 (KPI Card) and §4.3 (Unit Card). Simplified unit-card interiors (§4.3) are a major simplification. Apply §5 (Spacing Rhythm) to the dashboard.
2. **Rebuild Rapid View Popup:** Apply the new Status Banner logic (§4.4) to the High Risk header. Rebuild the IV/Drips/Tubes row as a `.badge` set. Replicate the consolidated card logic for Reason/Barriers/Leader (one card, amber accent, thin dividers). Enforce button standards (§4.7).

## Phase 4: Field & Form Optimization (Weeks 7–8)

*Goal: Finalize interaction consistency for forms and special modules.*

1. **Standardize Form Interactions:** Implement §4.7 (Form Fields & Buttons), §4.8 (Tabs), and §4.6 (Toggles Y/N/NA). This standardize interaction height (38px inputs, 40px buttons), radius, and focus logic. Update the checklist toggle to the segmented control pattern.
2. **Recede Filter/Import Panels:** Apply §4.10 (Panels) to the Dashboard filters and CCOIP imports, removing shadow and applying the receding visual spec. Crucially, replace the heavy CCOIP gradient with the standard flat nav header pattern (§4.10).
3. **Apply Spacing Pass:** Conduct a final pass across all screens to strictly enforce §5 (Spacing Rhythm), ensuring every section gap and heading-to-content spacing is predictable and standard.