# Account Dashboard — Framework-Agnostic Design Spec

## 1. Product and page goal

**Subject:** account-management dashboard for a signed-in SaaS user.  
**Audience:** desktop-first users managing their profile, password, sessions, and two-factor authentication.  
**Single job:** let the user review account status and reach security/account actions quickly.

The interface should feel compact, serious, and native to a developer-facing product. It must not look like a generic admin template.

---

## 2. Visual direction

**Subject:** embedded BaaS auth/account chrome for host-app end users.  
**Audience:** people signing in and managing security inside a product.  
**Single job:** authenticate and reach account actions without leaving the app.

Dark instrument-panel graphite with a cooler content rail. Use thin neutral borders, modest corner radii, restrained signal-blue for identity/status, and coral-red only for destructive sign-out actions. Avoid cream+serif, acid-green-on-black, and zero-radius broadsheet defaults — this product should feel like a precise control surface, not a marketing template.

**Signature element:** one large rounded application shell with a powered **signal edge** (subtle left rail accent + top rim highlight) divided into a fixed navigation rail and a dense account workspace. The shell, rather than individual cards, is the dominant visual object. On phones the shell becomes a bottom sheet with a grip handle and pill-style horizontal nav.

---

## 3. Design tokens

### Colors

```css
--page-bg: #070809;
--shell-bg: #1c1d1b;
--sidebar-bg: #121312;
--surface-1: #272825;
--surface-2: #161715;
--surface-hover: #30312e;
--border: #3e3f3b;
--border-soft: #2f302d;
--text-primary: #f3f3ef;
--text-secondary: #b6b6b0;
--text-muted: #82837d;
--accent-blue: #4aa3f5;
--accent-blue-bg: #0a3358;
--danger: #ff6b65;
--focus: #8fc8ff;
--signal: var(--accent-blue);
```

### Typography

Use a neutral system grotesk with compact proportions. Mono only for OTP digits and codes.

```css
font-family: Inter, "SF Pro Text", "Segoe UI", system-ui, Arial, sans-serif;
```

| Role | Size | Weight | Line height |
|---|---:|---:|---:|
| Page title | 24px | 700 | 1.15 |
| Section/card title | 16px | 650–700 | 1.25 |
| Body | 15px | 500 | 1.35 |
| Secondary body | 14px | 500–600 | 1.35 |
| Label/meta | 12–13px | 500 | 1.25 |
| Navigation | 15px | 600 | 1 |

Avoid oversized headings, serif type, gradients, and excessive letter spacing.

### Radius

```css
--radius-shell: 18px;
--radius-card: 14px;
--radius-control: 10px;
--radius-pill: 999px;
```

### Touch

```css
--touch: 44px; /* minimum interactive target on phone layouts */
```

### Spacing

Use a 4px base grid.

```css
--space-1: 4px;
--space-2: 8px;
--space-3: 12px;
--space-4: 16px;
--space-5: 20px;
--space-6: 24px;
--space-8: 32px;
```

---

## 4. Page geometry

### Desktop

- Page background: full viewport, `#0b0c0c`.
- Outer shell: approximately `742 × 692px` in the reference, centered with 8–12px viewport margin.
- Shell minimum desktop width: `720px`.
- Sidebar: `232–236px` fixed width.
- Main content: flexible, around `506px`.
- Shell border: `1px solid var(--border)`.
- Shell radius: `19px`.
- Shell overflow: hidden.

```text
┌─────────────────────────────────────────────────────────┐
│ Sidebar 232px │ Main account workspace                 │
│               │                                         │
│ Brand         │ Eyebrow                                 │
│ User          │ Title                                   │
│ Navigation    │ Summary card                            │
│               │ Action list                             │
│               │ Sign-out row                            │
│ Sign out      │                                         │
└─────────────────────────────────────────────────────────┘
```

### Main content spacing

- Main panel padding: `28–30px` horizontal, `26–28px` vertical.
- Vertical gap from intro to account summary: `18px`.
- Summary to action list: `20px`.
- Action list to sign-out section: `20px`.

---

## 5. Sidebar specification

### Structure

1. Product mark and `Account` label.
2. Compact signed-in user row.
3. Primary navigation.
4. Destructive sign-out action pinned to bottom.

### Product mark

- Size: `24 × 24px`.
- Radius: `6px`.
- Dark fill, subtle border.
- Centered single-letter mark.

### User row

- Avatar: `42 × 42px`, circular.
- Avatar background: deep navy `#00376a`.
- Initials: blue `#54a9f8`, 15px, 600.
- Text container must truncate with ellipsis.
- Primary email: 15px, 650.
- Secondary email: 13px, muted.

### Navigation item

- Height: `36px`.
- Horizontal padding: `11px`.
- Gap between icon and label: `10px`.
- Radius: `10px`.
- Icon size: `18px`.
- Default text: secondary.
- Active background: `#2d2e2b`.
- Active border: `1px solid #43443f`.
- Active text/icon: primary.
- Optional right-side count aligned to the far edge.

### Sign-out item

- Positioned at sidebar bottom.
- Same horizontal rhythm as navigation.
- Danger text/icon: `var(--danger)`.
- No filled danger background by default.

---

## 6. Main header

- Eyebrow: `Account`, 14px, muted.
- Title: `Welcome back`, 24px, 700.
- Subtitle: `Manage your profile, password, and active sessions.`, 15px, secondary.
- Keep header compact; no illustration, badge cluster, or decorative gradient.

---

## 7. Account summary card

### Container

- Background: `var(--surface-2)`.
- Radius: `14px`.
- Padding: `18px 20px`.
- No visible outer border.

### Identity row

- Avatar: `44 × 44px`.
- Email/title: 16px, 700.
- Membership badge: small blue pill, approximately `56 × 20px`.
- Secondary email below: 14px, secondary.

### Divider

- `1px solid var(--border-soft)`.
- Margin top: `16px`.
- Margin bottom: `14px`.

### Metadata grid

Three equal columns:

1. Joined
2. Other devices
3. Last sign-in

- Labels: 12–13px, muted.
- Values: 15–16px, 700, primary.
- Do not add vertical dividers.

---

## 8. Account action list

### Container

- Background: transparent or same as main panel.
- Border: `1px solid var(--border)`.
- Radius: `14px`.
- Overflow: hidden.

### Row anatomy

```text
[icon] [title + description] [status / chevron / switch]
```

- Minimum height: `82px`.
- Padding: `14–16px 18–20px`.
- Icon column: `20px` wide.
- Content gap: `14px`.
- Row separators: `1px solid var(--border)`.
- Title: 15–16px, 700.
- Description: 14px, secondary, max width around `300px`.
- Right status: 13px, muted.
- Chevron: 18px, muted.

### Rows

- Edit profile → chevron.
- Password & security → status text `Password set`.
- Active sessions → status text `24 other`.
- Two-factor authentication → switch.

### Hover/focus

- Hover background: `rgba(255,255,255,0.025)`.
- Keyboard focus: visible 2px focus ring inset or outline using `var(--focus)`.

---

## 9. Toggle switch

- Track: `38 × 22px`.
- Radius: pill.
- Off track: `#555752`.
- Knob: `18 × 18px`, `#2c2d2b` or light neutral depending on contrast.
- On track: `var(--accent-blue)`.
- Knob translates `16px` when enabled.
- Transition: `160ms ease`.
- Use a real checkbox or button with `role="switch"` and `aria-checked`.

---

## 10. Bottom sign-out section

- Separated by a horizontal rule.
- Top margin: `20px`.
- Padding top: `18px`.
- Left: title and one-line explanation.
- Right: outlined `Sign out` button.

Button:

- Height: `37px`.
- Padding: `0 16px`.
- Border: `1px solid #575853`.
- Radius: `9px`.
- Background: transparent.
- Text: primary, 14px, 650.
- Hover: surface hover.
- Focus: blue ring.

---

## 11. Icons

Use one consistent outline icon set such as:

- Lucide
- Phosphor regular
- Heroicons outline

Recommended mappings:

- Overview: layout grid
- Profile: user round
- Security: shield check
- Sessions: panels/top-left
- Edit profile: circle user
- Password: lock
- Active sessions: copy/panels
- Two-factor authentication: shield
- Sign out: log-out

Stroke width should remain visually consistent, approximately `1.8–2px`.

---

## 12. Responsive behavior

### Desktop: above 780px

- Centered shell with rail + workspace grid (`236px` rail).
- Signal edge visible on the shell left.
- Sidebar navigation; mobile head hidden.

### Tablet: 781–900px

- Shell still two-column; rail may shrink to `~200px`.
- Main padding reduces to `22px`.

### Mobile: max-width 780px

Preferred structure — **bottom sheet**:

```text
┌────────────────────────────┐
│           ── grip ──       │
│ Close                 title│
│ [Overview][Profile][…] pills│
├────────────────────────────┤
│ Main account content       │
│ (full width, no rail)      │
└────────────────────────────┘
```

- Hide the fixed sidebar; show `.kt-mobile-head` pill nav (horizontal scroll).
- Dialog anchors to the bottom, animates as a sheet (`kt-sheet`), shows `.kt-sheet-grip`.
- Primary actions and form buttons stack full width; min touch target `44px`.
- Toasts move to the bottom safe area.
- Sign-out section stacks; button full width.
- Auth dialog also becomes a bottom sheet.

### Narrow phone: max-width 420px

- Sheet goes edge-to-edge (`border-radius: 0`, full `100dvh`).
- Summary metadata becomes a 2-column grid.
- Action row status labels may hide; descriptions wrap.

---

## 13. Interaction requirements

- Clicking a navigation item updates the active state.
- Clicking an action row performs the same action as its title control.
- Toggle updates visually and exposes an accessible state.
- Sign-out requires an explicit confirmation before ending the session.
- Truncated email addresses must expose the full value through `title`, tooltip, or accessible label.
- Keyboard focus is always visible (`:focus-visible` ring using `--focus`).
- `prefers-reduced-motion: reduce` zeroes animation/transition durations.
- Do not animate the entire page repeatedly. A single `180–240ms` shell fade/slide on initial load is enough.

Respect:

```css
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 0.01ms !important;
    transition-duration: 0.01ms !important;
  }
}
```

---

## 14. Accessibility

- Minimum text contrast: WCAG AA.
- All interactive rows and controls keyboard accessible.
- Visible focus state on every interactive element.
- Use semantic landmarks: `aside`, `nav`, `main`, `section`.
- Navigation uses `aria-current="page"` for the active item.
- Toggle has a visible text label and programmatic state.
- Icon-only controls require accessible names.
- Touch targets should be at least `40 × 40px` on mobile.

---

## 15. Framework mapping

Suggested component tree:

```text
AccountShell
├── AccountSidebar
│   ├── BrandMark
│   ├── UserIdentity
│   ├── AccountNavigation
│   │   └── NavigationItem[]
│   └── SidebarSignOut
└── AccountMain
    ├── AccountHeader
    ├── AccountSummaryCard
    │   ├── UserIdentity
    │   └── AccountMetadata[]
    ├── AccountActionList
    │   └── AccountActionRow[]
    └── DeviceSignOutSection
```

This structure maps directly to React, Vue, Svelte, Solid, Angular, Flutter Web, or server-rendered templates.

### Suggested component props

```ts
type NavigationItem = {
  id: string;
  label: string;
  icon: IconComponent;
  count?: number;
  active?: boolean;
};

type AccountAction = {
  id: string;
  title: string;
  description: string;
  icon: IconComponent;
  trailing?:
    | { type: "chevron" }
    | { type: "status"; label: string }
    | { type: "switch"; checked: boolean };
};
```

---

## 16. Acceptance checklist

- The page reads as one cohesive application shell, not several unrelated cards.
- Sidebar and main panel have visibly different dark tones.
- The active navigation item is clear without using a bright accent fill.
- Blue is limited to avatar/status identity elements.
- Red is reserved for sign-out.
- Main content matches the compact density of the reference.
- Email text truncates safely.
- Desktop and mobile layouts remain usable without horizontal scrolling.
- All actions are keyboard accessible and have visible focus.
