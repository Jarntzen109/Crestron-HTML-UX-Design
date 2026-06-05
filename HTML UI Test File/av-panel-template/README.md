# AV Panel Template
### React + Vite + CH5 — Visual Component Library for Crestron Touch Panels

---

## The Concept

This template is a **visual component library** — a parts bin.
Your programmers design pages by copying pre-built components, dropping
them into a page file, and wiring join numbers to their own SIMPL programs.
No custom CSS, no wrestling with Crestron Construct.

---

## Quick Start

```bash
npm install
npm run dev
```

Open `http://localhost:5173` — you'll see the **Component Library** page
showing every available component you can copy-paste.

---

## The Build Workflow (for programmers)

### Step 1 — Browse components
Open the dev server. The Component Library page shows everything available:
buttons, grouped buttons, PTZ joystick, sliders, gauges, layout containers.

### Step 2 — Create your page file
Duplicate `src/pages/CameraControl.tsx` and rename it (e.g. `AudioControl.tsx`).
Delete the contents and start fresh, or modify the existing layout.

### Step 3 — Copy-paste components
Copy a component block from `ComponentLibrary.tsx` into your page.
For example, a camera select group:

```tsx
<GroupBox title="Cameras" width={150}>
  <AVButtonGroup>
    <AVButton label="Audience"  joinNumber={1} size="lg" />
    <AVButton label="Presenter" joinNumber={2} size="lg" />
  </AVButtonGroup>
</GroupBox>
```

### Step 4 — Set your join numbers
Replace `joinNumber={1}` etc. with whatever digital/analog joins
your SIMPL program uses. The `joinNumber` prop is just a visual label in dev —
the actual CH5 wiring happens in your own `useCrestron` hook or directly
in the component's `onPress`/`onChange` callbacks.

### Step 5 — Wire CH5 in the callbacks (optional, your method)
Each component exposes `onPress`, `onRelease`, `onChange` props.
Wire them however your team handles CH5 — use CrComLib directly,
wrap in your own hook, whatever your standard is:

```tsx
<AVButton
  label="Audience"
  joinNumber={1}
  variant="toggle"
  onPress={() => CrComLib.publishEvent('boolean', '1', true)}
  onRelease={() => CrComLib.publishEvent('boolean', '1', false)}
/>
```

### Step 6 — Switch App.tsx to your page
In `src/App.tsx`, change `ACTIVE_PAGE` to your new page component.

### Step 7 — Retarget device if needed
In `src/config/devices.ts`, change `ACTIVE_DEVICE`:
- `'ts1070'`  → Crestron TS-1070  (1280×800)
- `'tst1080'` → Crestron TST-1080 (1280×800)
- `'ipad10'`  → iPad 10th gen landscape (1180×820)
- `'ipad9'`   → iPad 9th gen landscape (1080×810)

**One line change. Everything snaps to the new canvas size.**

### Step 8 — Build and deploy
```bash
npm run build
```
Copy `dist/` to `\USER\HTML\` on the processor via Toolbox File Manager
or `ch5-cli deploy`.

---

## Project Structure

```
src/
├── config/
│   └── devices.ts          ← Change ACTIVE_DEVICE here to retarget
├── styles/
│   └── tokens.css          ← All colors, spacing, font — edit to retheme
├── components/
│   ├── AVButton.tsx        ← Toggle, momentary, select buttons + AVButtonGroup
│   ├── GroupBox.tsx        ← Labeled border container (like VTPro group box)
│   ├── PTZControl.tsx      ← Camera joystick with pan/tilt/zoom + presets
│   ├── AVSlider.tsx        ← Horizontal fader (analog join)
│   │                          AVGauge — vertical level meter (read-only feedback)
│   └── PanelLayout.tsx     ← Root canvas + PageHeader
├── pages/
│   ├── ComponentLibrary.tsx ← THE PARTS BIN — browse this during development
│   └── CameraControl.tsx   ← Example completed page
└── App.tsx                 ← Change ACTIVE_PAGE to switch what renders
```

---

## Theming

All visual values live in `src/styles/tokens.css` as CSS custom properties.
Change colors, border radius, font — the entire UI updates.

Key variables:
```css
--av-accent          /* active/selected color (default: blue) */
--av-bg-page         /* page background */
--av-bg-elevated     /* button background */
--av-border-default  /* button borders */
--av-text-primary    /* main text */
--av-green           /* success / power on */
--av-red             /* danger / power off */
```

---

## Hiding Join Labels Before Deployment

The `joinNumber` prop renders a small faint label (e.g. `D1`, `A3`) during
development for easy SIMPL cross-referencing. Before deploying to a panel,
set this in `tokens.css`:

```css
--av-join-opacity: 0;
```

All join labels disappear across the entire UI instantly.

---

## Available Components

| Component | File | Use for |
|-----------|------|---------|
| `AVButton` | AVButton.tsx | Any button — toggle, momentary, select |
| `AVButtonGroup` | AVButton.tsx | Mutually-exclusive button sets |
| `GroupBox` | GroupBox.tsx | Labeled panel containers |
| `PTZControl` | PTZControl.tsx | Camera pan/tilt/zoom + presets |
| `AVSlider` | AVSlider.tsx | Volume faders, analog controls |
| `AVGauge` | AVSlider.tsx | Read-only level meters |
| `PanelLayout` | PanelLayout.tsx | Root canvas (wrap every page) |
| `PageHeader` | PanelLayout.tsx | Top bar with title + status |
