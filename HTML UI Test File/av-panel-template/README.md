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

### Step 3b — Or drag-position instead of hand-editing CSS
Most components (`GroupBox`, flex rows, etc.) lay out with normal CSS
flex/grid. If you'd rather freely place things by dragging — closer to
how Construct's canvas works — wrap them in `LayoutCanvas` +
`Positioned` instead:

```tsx
const POSITIONS = {
  camAudience: { x: 20, y: 20, w: 140, h: 72 },
  camPresenter: { x: 180, y: 20, w: 140, h: 72 },
};

<LayoutCanvas width={device.width - 32} height={device.height - 96}>
  <Positioned id="camAudience" {...POSITIONS.camAudience}>
    <AVButton label="Audience" joinNumber={1} />
  </Positioned>
  <Positioned id="camPresenter" {...POSITIONS.camPresenter}>
    <AVButton label="Presenter" joinNumber={2} />
  </Positioned>
</LayoutCanvas>
```

Click **Edit Layout** in the canvas corner, drag components to where
you want them (snaps to an 8px grid), then **Copy Positions** — it
copies an updated `POSITIONS` object to your clipboard. Paste it back
over the one in your page file to persist the new layout. Try it live
in the Component Library page under "LayoutCanvas + Positioned."

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

**Two worked examples, two different build styles:**
- `CameraControl.tsx` — hand-written flex/grid layout (columns, gaps).
  Fastest to write, reflows reasonably across panel sizes on its own.
- `TrainingRoom.tsx` — built with `LayoutCanvas` + `Positioned`
  (drag-to-place). Slower to set up per control, but layout is exact
  and adjustable by dragging instead of editing CSS. The comment block
  at the top of the file walks through the actual step-by-step loop
  used to build it, control by control.

Neither is "correct" — flex/grid for pages that are mostly rows and
columns anyway, `LayoutCanvas` for pages where controls need exact,
non-grid placement (e.g. overlaying controls on a room floorplan).

### Step 7 — Retarget device if needed
In `src/config/devices.ts`, change `ACTIVE_DEVICE`:
- `'ts570'`   → Crestron TSW-570          (1280×720, landscape)
- `'ts570p'`  → Crestron TSW-570P         (720×1280, **portrait**)
- `'ts770'`   → Crestron TS-770           (1280×800, landscape)
- `'ts880'`   → Crestron TS-880           (1280×800, landscape)
- `'ts1070'`  → Crestron TS-1070          (1920×1200, landscape)
- `'ts1080'`  → Crestron TS-1080/TST-1080 (1920×1200, landscape)

Resolutions are verified against Crestron's published specs. Note TS-1070
and TS-1080 are the same 1920×1200 panel size but were previously
mis-set to 1280×800 in an earlier revision of this template — if you
built anything against those old dimensions, re-check the layout.

---

## Switching Between Device Profiles — What Actually Needs to Change

Flipping `ACTIVE_DEVICE` always resizes the canvas. What else your page
needs depends on *how* you built it and *how different* the new target is:

### Same orientation, different size (e.g. TS-770 → TS-1070)
Pages built with normal flex/grid (like `CameraControl.tsx`) mostly
reflow on their own — columns using `flex: 1` absorb the extra width,
`GroupBox` widths stay fixed. Still eyeball it: a 640px gain in width
going from TS-770 to TS-1070 usually shows up as dead space on the
right rather than broken layout, but check spacing/proportions before
calling it done.

If the page uses `LayoutCanvas` + `Positioned` (drag-placed), the
coordinates are pixel-absolute and **do not scale**. A button dragged
to `x: 1800` will sit off-canvas on a 1280-wide panel. For a page that
needs to support multiple resolutions, keep a separate `POSITIONS`
object per device and pick one based on `ACTIVE_DEVICE`:

```tsx
import { ACTIVE_DEVICE } from '../config/devices';

const POSITIONS_BY_DEVICE = {
  ts770:  { camAudience: { x: 20, y: 20, w: 140, h: 72 } /* ... */ },
  ts1070: { camAudience: { x: 40, y: 40, w: 160, h: 84 } /* ... */ },
};
const POSITIONS = POSITIONS_BY_DEVICE[ACTIVE_DEVICE] ?? POSITIONS_BY_DEVICE.ts770;
```

### Portrait (TSW-570P)
This isn't a resize — width and height swap, so a 3-column landscape
layout has nowhere to go. **Build a dedicated page** for portrait
targets rather than reusing a landscape page; duplicate a page file the
same way you would for any new page (Step 2 above) and stack content
vertically instead of in columns.

To catch someone pointing a landscape page at a portrait device (or
vice versa) by mistake, declare the orientation the page was built for
and `PanelLayout` will show a full-screen warning if it doesn't match
`ACTIVE_DEVICE`:

```tsx
<PanelLayout expectOrientation="landscape">
```

`CameraControl.tsx` and `ComponentLibrary.tsx` both do this already —
try setting `ACTIVE_DEVICE` to `'ts570p'` and reloading to see it fire.

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
│   ├── LayoutCanvas.tsx    ← Drag-to-position canvas (Construct-style free placement)
│   ├── Positioned.tsx      ← Draggable/absolute-positioned wrapper, used inside LayoutCanvas
│   └── PanelLayout.tsx     ← Root canvas + PageHeader
├── pages/
│   ├── ComponentLibrary.tsx ← THE PARTS BIN — browse this during development
│   ├── CameraControl.tsx   ← Example page: hand-written flex/grid layout
│   └── TrainingRoom.tsx    ← Example page: drag-to-place LayoutCanvas layout
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
| `LayoutCanvas` | LayoutCanvas.tsx | Drag-to-position region — wraps `Positioned` children |
| `Positioned` | Positioned.tsx | Draggable absolute-position wrapper for any component |
| `PanelLayout` | PanelLayout.tsx | Root canvas (wrap every page) |
| `PageHeader` | PanelLayout.tsx | Top bar with title + status |
