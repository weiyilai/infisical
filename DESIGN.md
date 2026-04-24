# Infisical Design System (v3)

This document captures the v3 visual language and product voice used across
Infisical. It is the single reference for engineers, designers, and AI coding
agents producing new UI or user-visible copy.

**Source of truth for tokens:** [`frontend/src/index.css`](frontend/src/index.css) (`@theme` block).
**Canonical semantic reference:** [`Badge.stories.tsx`](frontend/src/components/v3/generic/Badge/Badge.stories.tsx).
**Canonical page references:** [`OverviewPage`](frontend/src/pages/secret-manager/OverviewPage) and [`AccessControlPage`](frontend/src/pages/project/AccessControlPage).

---

## 1. Visual Theme & Atmosphere

Infisical is a security tool for operators. The interface reads like
infrastructure: dense, calm, and legible — never ornamental. Dark is the native
medium; the page canvas is `#19191c`, and light themes are not part of the
system yet.

Color carries **meaning before brand**. A danger badge is red because the
action is destructive, not because red is the accent. A project-colored button
signals project scope, not visual variety. Designers pick intent; hex values
follow.

Depth is drawn with borders and surface tones, not shadows. Motion is
restrained — 200ms ease-in-out, no springs, no decorative animation. Secret
values are masked by default; revealing one is an intentional act.

**Key characteristics:**

- Dark-native; `#19191c` page canvas
- Semantic-first color (danger / success / warning / info / neutral)
- Scope-aware (org / sub-org / project / admin)
- Border-defined depth, no decorative shadows
- Inter, one family, across everything
- Secrets masked by default; reveal is an act

## 2. Color Palette & Roles

All colors are defined as CSS custom properties in
[`frontend/src/index.css`](frontend/src/index.css) and consumed via Tailwind v4
utilities (`bg-org`, `text-danger`, etc.). Never introduce a hex that is not
in this file.

### Scope colors (hierarchy)

Used to signal the scope a surface, badge, or action belongs to.

| Scope            | Token              | Hex       |
| ---------------- | ------------------ | --------- |
| Organization     | `--color-org`      | `#30b3ff` |
| Sub-Organization | `--color-sub-org`  | `#96ff59` |
| Project          | `--color-project`  | `#e0ed34` |
| Admin            | `--color-admin`    | `#c0c0c8` |

### Semantic colors

| Intent   | Token              | Hex       | Use                                              |
| -------- | ------------------ | --------- | ------------------------------------------------ |
| Success  | `--color-success`  | `#2ecc71` | Healthy states, completed rotations              |
| Info     | `--color-info`     | `#63b0bd` | Informational states, external documentation     |
| Warning  | `--color-warning`  | `#f1c40f` | Attention-warranting states, stale items         |
| Danger   | `--color-danger`   | `#e74c3c` | Destructive actions, errors, expired access      |
| Neutral  | `--color-neutral`  | `#adaeb0` | Disabled, muted, "empty" states                  |

### Surface & chrome

| Role               | Token                    | Hex       |
| ------------------ | ------------------------ | --------- |
| Page background    | `--color-background`     | `#19191c` |
| Foreground text    | `--color-foreground`     | `#ebebeb` |
| Card surface       | `--color-card`           | `#16181a` |
| Popover / Sheet    | `--color-popover`        | `#141617` |
| Container          | `--color-container`      | `#1a1c1e` |
| Container (hover)  | `--color-container-hover`| `#1f2123` |
| Border             | `--color-border`         | `#2b2c30` |
| Focus ring         | `--color-ring`           | `#2d2f33` |
| Accent text        | `--color-accent`         | `#7d7f80` |
| Muted text         | `--color-muted`          | `#707174` |
| Label text         | `--color-label`          | `#adaeb0` |

The `mineshaft-*` scale (50–900) is the underlying neutral ramp; see
`index.css` for the full list. Prefer semantic tokens (`card`, `border`,
`accent`) over raw mineshaft values.

### Product-area accents (secret-manager)

Reserved for resource types in the secret management product:
`--color-folder` `#a4873e`, `--color-secret` `#7d7f80`,
`--color-dynamic-secret` `#a6702b`, `--color-import` `#457d91`,
`--color-secret-rotation` `#4c6081`, `--color-override` `#694c81`.
Do not repurpose these for generic UI.

### Tint pattern

Colored variants always layer as tinted backgrounds with matching borders —
never as solid fills. The two canonical recipes:

- **Badge** — `bg-<c>/15 border-<c>/10 text-<c>`, hover `bg-<c>/35`
  (see [`Badge.tsx`](frontend/src/components/v3/generic/Badge/Badge.tsx))
- **Button** — `bg-<c>/10 border-<c>/25 text-foreground`, hover `bg-<c>/15 border-<c>/30`
  (see [`Button.tsx`](frontend/src/components/v3/generic/Button/Button.tsx))

### Quick color reference

```
Page bg        #19191c    Border       #2b2c30
Card           #16181a    Popover      #141617
Foreground     #ebebeb    Accent       #7d7f80
Org            #30b3ff    Success      #2ecc71
Sub-Org        #96ff59    Info         #63b0bd
Project        #e0ed34    Warning      #f1c40f
Admin          #c0c0c8    Danger       #e74c3c
```

## 3. Typography

Inter is the only font family (`--font-inter`). All weights and sizes use
Tailwind's default scale.

| Role                     | Class                                   | Notes                                                                 |
| ------------------------ | --------------------------------------- | --------------------------------------------------------------------- |
| Page title (h1)          | `text-2xl font-medium underline underline-offset-4 decoration-<scope>/90` | In `PageHeader`; scope icon (size 26) sits inline before the title    |
| Page description         | `text-mineshaft-300`                    | Sits under the title, `mt-1.5`                                        |
| Card title               | `text-lg font-semibold leading-none`    | `flex gap-1.5` so badges can sit inline                               |
| Card description         | `text-sm text-accent`                   |                                                                       |
| Body                     | `text-sm`                               | Default for table cells, form values, dialog content                  |
| Label / meta             | `text-xs text-accent`                   | Field labels, table column captions, metadata                         |
| Badge                    | `text-xs` (auto, via `Badge`)           | Never override                                                        |
| Button                   | `text-sm` (md/sm/lg), `text-xs` (xs)    | Auto via `Button` sizing                                              |

Sentence case for descriptions, helper text, and empty states. Title Case for
page titles and button labels. See §8 for voice rules on copy itself.

## 4. Component Stylings

New UI must use v3 components from [`frontend/src/components/v3/`](frontend/src/components/v3).
The v2 library is legacy; only fall back when no v3 equivalent exists.
`PageHeader` is the notable exception — still v2, still canonical for page titles.

For exact tokens, class lists, and every variant, read the component source
and its `*.stories.tsx` — this doc cites them rather than duplicating them.

| Component | Source | Key specs & usage |
| --- | --- | --- |
| **Button** | [`Button.tsx`](frontend/src/components/v3/generic/Button/Button.tsx) | Sizes `xs`/`sm`/`md`(default)/`lg` (h-7/8/9/10). Variants: `outline` (default), `ghost`, `neutral`, `project`, `org`, `sub-org`, `success`, `info`, `warning`, `danger`. Primary actions use the scope variant of the current surface. |
| **IconButton** | — | Sizing parity with Button; `isSquare` for icon-only actions. |
| **Badge** | [`Badge.tsx`](frontend/src/components/v3/generic/Badge/Badge.tsx) + [stories](frontend/src/components/v3/generic/Badge/Badge.stories.tsx) | h-4.5, text-xs, rounded-sm. Variants mirror Button plus `default` (solid, key-value keys) + `outline` (values). Props: `asChild`, `isTruncatable`, `isSquare`, `isFullWidth`. Pick by intent per the stories matrix. |
| **Card** | [`Card.tsx`](frontend/src/components/v3/generic/Card/Card.tsx) | Default section container. `p-5 gap-5 rounded-lg bg-card border-border shadow-sm`. `CardHeader` + `CardTitle` + `CardDescription` + `CardAction` (auto top-right) + `CardContent` + `CardFooter`. Tables, filters, forms, empty states all live in a Card. |
| **Table** | [`Table.tsx`](frontend/src/components/v3/generic/Table/Table.tsx) | Semantic `<table>` in a scroll container. Rows h-[40px], `hover:bg-container-hover`. Sortable headers rotate `ChevronDownIcon`. Pair with `Empty` (zero-state) + `Pagination` (`1–10 of 19`, 10/20/50/100). |
| **Sheet** | [`Sheet.tsx`](frontend/src/components/v3/generic/Sheet/Sheet.tsx) | Right-side panel. `bg-popover`, `w-3/4`, `sm:max-w-md`. `SheetHeader` (p-4) + `SheetContent` + `SheetFooter` (p-4, gap-2). **Use Sheet — not Dialog — for create/edit forms.** Create Secret is the reference. |
| **Field** | [`Field.tsx`](frontend/src/components/v3/generic/Field/Field.tsx) | `Field` > `FieldLabel` + `FieldContent` + optional `FieldDescription` + `FieldError`. Never render a bare `Input` in a form. |
| **Input / InputGroup / TextArea / Switch / Select / ReactSelect** | — | h-9, rounded-md, 3px focus ring. `InputGroup` wraps with left/right addons — use for search (`SearchIcon` + input) and key-value metadata. |
| **DropdownMenu + ButtonGroup** | — | Split-button pattern: `Button` (rounded-right-off) + `DropdownMenuTrigger` wrapping an `IconButton` (`ChevronDown`) of matching variant, inside `ButtonGroup`. Use when an action has a default plus alternates (`Add Secret ▾`). |
| **Sidebar** | [`Sidebar.tsx`](frontend/src/components/v3/generic/Sidebar/Sidebar.tsx) | 16rem expanded / 3rem collapsed, cookie-persisted. Scope-aware via `SidebarScope`. Below 1024px collapses into a Sheet overlay. |
| **Alert / AlertDialog / Toast** | — | `Alert` inline in a page. `AlertDialog` for confirmations (destructive included). `Toast` for transient post-action feedback. Never `alert()`. |
| **Scope icons** | [`ScopeIcons.tsx`](frontend/src/components/v3/platform/ScopeIcons.tsx) | `OrgIcon`, `SubOrgIcon`, `ProjectIcon`, `InstanceIcon`. Prefer these over raw Lucide when the intent is scope. |
| **DocumentationLinkBadge** | — | `info` Badge (`asChild` → `<a>`) with `ExternalLinkIcon`, labelled "Documentation". Inline in `CardTitle`. |

**Icons** — [`lucide-react`](https://lucide.dev). Sizing is bound to the
host component; don't override unless necessary. Badge strokes are 2.25,
Button strokes 1.5–1.75.

## 5. Layout Principles

- **Page container** — `max-w-8xl` (88rem) centered, `bg-bunker-800`.
- **Page header** — `PageHeader` with scope icon + underlined `h1` + description. See [`PageHeader.tsx`](frontend/src/components/v2/PageHeader/PageHeader.tsx). Always set `scope` to the correct hierarchy level.
- **Section** — one `Card` per logical section. Title + optional `DocumentationLinkBadge` in `CardHeader`; primary action in `CardAction` (top-right).
- **Tables inside Cards** — filters and search sit in the `CardHeader` above the table; pagination sits in the `CardFooter` or bottom of `CardContent`.
- **Forms inside Sheets** — create / edit flows open in a right-side Sheet, never inline, never as a full-page route. Multi-step forms remain inside the Sheet.
- **Spacing rhythm** — `gap-1.5` (intra-element), `gap-2 / gap-3` (adjacent elements), `p-4 / p-5` (section padding). Card = `p-5 gap-5`; Sheet header/footer = `p-4`.

## 6. Depth & Elevation

Depth is conveyed by layered surface tones and borders. Shadows are reserved
for elements that float (Popover, DropdownMenu, Sheet).

| Layer               | Surface            | Border        |
| ------------------- | ------------------ | ------------- |
| Page                | `bg-bunker-800`    | —             |
| Card                | `bg-card` #16181a  | `border-border` |
| Popover / Sheet     | `bg-popover` #141617 | `border-border` + `shadow-lg` |
| Row hover           | `bg-container-hover` #1f2123 | — |
| Focus               | — | 3px ring, `--color-ring` #2d2f33 |
| Disabled            | `opacity-50 / 75`, `pointer-events-none` | — |

Never add a box-shadow to a Card, Table row, or Badge; it breaks the
border-defined system.

## 7. Do's and Don'ts

- **DO** choose Badge and Button variants by **intent** (danger / success /
  warning / info / neutral), not by color preference.
- **DO** use scope colors (`org`, `sub-org`, `project`, `admin`) to reinforce
  hierarchy — the scope of a page, a primary button, a scope-link badge.
- **DO** mask secret values by default. Reveal must be an explicit user
  action and should be logged.
- **DO** put large create / edit forms in a right-side Sheet; smaller forms can be in Dialogs.
- **DO** pair destructive confirmations with the resource name and the
  consequence (see §9).
- **DO** cite tokens (`bg-card`) over hex (`#16181a`) in new code.
- **DON'T** use v2 components when a v3 equivalent exists unless the existing scope is v2.
- **DON'T** add box-shadows as a depth cue — borders and surface tones do
  that work. The exception is elements that genuinely float (Popover,
  DropdownMenu, Sheet), which already include it.
- **DON'T** invent new colors. If it isn't in `index.css` `@theme`, it
  doesn't belong.
- **DON'T** use `project` yellow, `org` blue, or `sub-org` green as generic
  accents. They are scope signals; repurposing them creates false hierarchy.
- **DON'T** mix font families. Inter only.
- **DON'T** animate for decoration. Motion should clarify state change only.

## 8. Voice & Content Tone

Copy should read as if written by an engineer for another engineer: direct,
technical, specific. The domain is serious — secrets, access, compliance —
and the voice reflects that.

### Stance

- Direct. Active voice. Lead with the subject: "Delete this role" — not
  "This role will be deleted".
- Specific. Name the resource, the action, the consequence. Avoid vague
  verbs ("handle", "manage") when a precise verb exists (`rotate`, `revoke`,
  `import`).
- Calm. No exclamation marks. No second-person cheer ("Awesome!",
  "You're all set!"). No emoji.
- Honest. Never claim speed, power, or ease in UI copy ("seamless",
  "powerful", "blazing-fast"). Those belong on the marketing site, not here.

### Shapes

- **Labels & buttons** — Title Case, imperative: "Add Secret", "Revoke
  Access", "Rotate Key".
- **Descriptions & helper text** — sentence case, one short sentence.
- **Empty states** — state what's missing, then the next action:
  "No secrets yet. Add your first secret to get started."
- **Errors** — name the failure and the remedy. Never "Something went wrong":
  "Could not rotate secret — token lacks `secrets:write` permission."
- **Destructive confirmation** — name the resource and the consequence "Delete "API_KEY" — this cannot be undone."
- **Success toasts** — past tense, specific: "Secret "API_KEY" created".

### Secrets & sensitive values

Never include a secret's value in any user-visible copy — UI, logs, toasts,
errors, audit trails, or analytics. Refer to secrets by key only. Mask
tokens and keys in screenshots and docs as well.

### Documentation links

Use `DocumentationLinkBadge` (info variant, external-link icon). Label it
"Documentation" — not "Learn more", "Read docs", "See more".

## 9. Agent Prompt Guide

Pasteable prompt fragments for AI coding agents producing new UI.

**Adding a section to an existing page:**
> Wrap the section in a `Card` from `@app/components/v3`. Use `CardHeader`
> with `CardTitle` + optional `CardDescription` + `CardAction` for the
> top-right primary button (variant `project` on a project page). Put the
> table or content in `CardContent`.

**A new create/edit form:**
> Put the form in a right-side `Sheet` (`Sheet`, `SheetContent`,
> `SheetHeader` with `SheetTitle` + `SheetDescription`, `SheetFooter` with
> the action buttons). Use `react-hook-form` with a Zod resolver. Each input
> is wrapped in `Field` + `FieldLabel` + `FieldContent` + `FieldError`. Primary button is
> variant is scope dependent `project`, secondary is `outline`, cancel is `ghost`.

**A status indicator:**
> Use `Badge` from `@app/components/v3`. Pick the variant by intent:
> `danger` for errors or expired access, `warning` for stale or
> attention-warranting, `success` for healthy / completed, `info` for
> informational, `neutral` for disabled / empty, `project` / `org` /
> `sub-org` for scope references. Include a matching Lucide icon as the
> first child.

**A destructive confirmation:**
> Use `AlertDialog`. Title: "Delete `<resource-name>`". Description: one
> sentence naming the consequence, ending with "This cannot be undone."
> Confirm button is variant `danger`. Cancel button is variant `outline`.

**A documentation link in a section:**
> Use `DocumentationLinkBadge` from `@app/components/v3/platform`. Place it
> in the `CardTitle` next to the section name.

**Refer to:**

- [`Badge.stories.tsx`](frontend/src/components/v3/generic/Badge/Badge.stories.tsx) — canonical semantic reference for variant choice.
- [`OverviewPage`](frontend/src/pages/secret-manager/OverviewPage) — full-page reference (PageHeader, Card-with-table, Create Secret Sheet, filters, DropdownMenu + ButtonGroup).
- [`AccessControlPage`](frontend/src/pages/project/AccessControlPage) — full-page reference (permission-gated actions, `DocumentationLinkBadge`, role badges with `ClockAlertIcon` for expired access).
- §8 above for any user-visible copy.

## Appendix: Iteration Guide

1. **Run Storybook** — `cd frontend && npm run storybook` (port 6006). Open
   Badge, Button, Card, Table, Sheet first.
2. **Read the two reference pages** — `OverviewPage` and `AccessControlPage`
   render the full v3 vocabulary in production.
3. **Tokens live in `index.css`** — `@theme` block, lines 56–214. Never
   introduce a hex that is not here.
4. **Adding a variant** — extend the `cva()` block in the component and add
   a story. Keep the tint pattern (`bg-<c>/15 border-<c>/10` for Badge,
   `bg-<c>/10 border-<c>/25` for Button).
5. **Never use v2 for new code** — unless no v3 equivalent exists.
   `PageHeader` is the notable v2 exception still used by all pages.
6. **Before merging** — `make reviewable-ui` (lint + type-check).
7. **When in doubt** — mirror `OverviewPage`.
