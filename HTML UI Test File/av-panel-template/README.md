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

Open `http://localhost:5173` — you'll see whatever page is currently
set as `ACTIVE_PAGE` in `src/App.tsx`. To browse every available
component (the parts bin), open `src/App.tsx` and set `ACTIVE_PAGE`
to `<ComponentLibrary />`. When you're building or previewing a
specific room instead, point `ACTIVE_PAGE` at that page's component —
whatever's set there is what loads when you open the dev server.

**Pulled new changes, or opening this on a different machine? Run
`npm install` again.** `node_modules` doesn't update itself — it only
reflects whatever `package.json` said the *last* time you ran
`npm install`. If a teammate adds a dependency and you pull their
changes, your local copy is out of sync until you reinstall. Symptoms
of this: `npm run dev` or `npm run package` suddenly failing with a
missing-module error, or a command "not found" that used to work.
When in doubt, run `npm install` — it's harmless to run again even if
nothing changed.

---

## The Build Workflow (for programmers)

### Step 1 — Install prerequisites
Before anything else, you need two things on your machine:

1. **Node.js** — version 18 or later (the current LTS release from
   [nodejs.org](https://nodejs.org) is the safe default). This is what
   gives you `npm`, which every command in this guide runs through.
2. **A code editor** — VS Code is the common choice, but anything that
   can open a folder and a terminal works.

Open this project's folder in your editor, open a terminal inside it,
and run:
```bash
npm install
```
This reads `package.json` and downloads everything the project
depends on — React, Vite, TypeScript, the CH5 libraries — into a
`node_modules` folder. **Nothing else in this guide works until this
finishes** — it can take a minute or two the first time. (Pulled new
changes later and things stop working? Run it again — see the note
under Quick Start above.)

### Step 2 — Browse components
In `src/App.tsx`, set `ACTIVE_PAGE` to `<ComponentLibrary />` and open
the dev server. That page shows everything available: buttons, grouped
buttons, PTZ joystick, sliders, gauges, layout containers.

### Step 3 — Create your page file
Duplicate `src/pages/ExampleRoom.tsx` and rename it (e.g. `AudioControl.tsx`).
Delete the `Positioned` blocks you don't need, then build up your own —
the comment block at the top of that file walks through the actual
step-by-step loop used to build it, control by control.

### Step 4 — Copy-paste components
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

### Step 4b — Or drag-position instead of hand-editing CSS
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

### Step 5 — Set your join numbers
Replace `joinNumber={1}` etc. with whatever digital/analog joins
your SIMPL program uses. The `joinNumber` prop is just a visual label in dev —
the actual CH5 wiring happens in the component's `onPress`/`onRelease`/
`onChange` callbacks, covered next in Step 6.

### Step 6 — Wire CH5 in the callbacks
Each component exposes `onPress`, `onRelease`, `onChange` props.
CrComLib is already set up for you (see "CrComLib Setup" below) and
available anywhere as `window.CrComLib` — no import needed.

This template calls `window.CrComLib` directly in these callbacks
rather than using Crestron's native CH5 web components (`<ch5-button>`
and similar, which route joins on their own). That's deliberate: those
components would conflict with the `LayoutCanvas` drag-and-drop editor
(Step 4b), which depends on plain React components and normal pointer
events. Don't swap in CH5's native elements — it'll break drag-to-place.

There are two patterns depending on what the control needs:

**Simple, fire-and-forget** — just publish on press. Fine for
selects/routes where you don't need the UI to reflect real feedback:
```tsx
<AVButton
  label="Audience"
  joinNumber={1}
  variant="toggle"
  onPress={() => window.CrComLib.publishEvent('boolean', '1', true)}
  onRelease={() => window.CrComLib.publishEvent('boolean', '1', false)}
/>
```

**Feedback-driven** — for anything where the highlight should reflect
what the processor is actually doing (power on/off is the classic
case), don't let the UI decide its own highlighted state. Use
`variant="momentary"` so pressing only reports intent, and drive the
`active` prop from a state variable fed by a feedback subscription.
Default that state to `false`, and don't try to distinguish it from
"nothing sent yet" with `null` — CrComLib fires the subscription
callback synchronously on subscribe with the join's current value,
even for a join nothing has ever touched, and for a boolean that
value is `false`. Unlike a serial join (empty string is a safe
"nothing yet" signal), a digital join has no third "unset" state on
the wire — `false` is both the real "confirmed off" value and the
untouched default, and there's no way to tell them apart:
```tsx
const [displayPowerOn, setDisplayPowerOn] = useState(false);

useEffect(() => {
  const id = window.CrComLib.subscribeState('boolean', '34', setDisplayPowerOn);
  return () => window.CrComLib.unsubscribeState('boolean', '34', id);
}, []);

<AVButton
  label="On"
  variant="momentary"
  active={displayPowerOn}
  onPress={() => window.CrComLib.publishEvent('boolean', '34', true)}
  onRelease={() => window.CrComLib.publishEvent('boolean', '34', false)}
/>
```
The button only lights up because the processor said so — never
because it was clicked. In practice that means the "off" side of a
pair like this shows lit by default until the processor reports
otherwise, which is normal and matches how most real Crestron feedback
behaves. See `TrainingRoom.tsx`'s Display/Projector power buttons for
a complete working example.

**Serial text with a default** — for anything text-driven (room
names, status messages), use the `useSerialJoin` hook
(`src/hooks/useSerialJoin.ts`) instead of subscribing by hand. It
returns `null` until the processor sends something real, so `??`
gives you a fallback instead of a blank label on startup:
```tsx
import { useSerialJoin } from '../hooks/useSerialJoin';

const roomName = useSerialJoin(1) ?? 'Training Room';
<PageHeader title={roomName} />
```
One gotcha the hook already handles for you: CrComLib fires the
subscription callback immediately on subscribe, even for a join
nothing has ever sent to — with `''` (empty string), not `null`. A
naive subscription would treat that `''` as "real data" and never
fall back to your default; `useSerialJoin` normalizes `''` to `null`
so `??` works the way you'd expect. See `TrainingRoom.tsx`'s room
name (serial join 1) or the `useSerialJoin` section in
`ComponentLibrary.tsx` for working examples.

### CrComLib Setup (already done — here for reference)
`@crestron/ch5-crcomlib` ships UMD-only with no import entry point
(check its `package.json` — no `main`/`module`/`exports`, only
`types`), so it can't be `import`ed. It's loaded as a global instead:
- `public/cr-com-lib.js` — a copy of the library, loaded as a plain
  `<script>` (anything in `public/` is served as-is by Vite).
- `index.html` loads that script *before* the app bundle, so
  `window.CrComLib` exists by the time any component tries to use it.
- `src/globals.d.ts` types `window.CrComLib` for TypeScript.

If you ever bump the `@crestron/ch5-crcomlib` version in
`package.json`, re-copy the file so `public/` matches:
```bash
cp node_modules/@crestron/ch5-crcomlib/build_bundles/umd/cr-com-lib.js public/cr-com-lib.js
```

### Step 7 — Switch App.tsx to your page
In `src/App.tsx`, add an import for your new page file and change
`ACTIVE_PAGE` to your new page component.

`ExampleRoom.tsx` is the one worked example this template ships with,
built with `LayoutCanvas` + `Positioned` (drag-to-place) — that's the
recommended default for new rooms since it's the easiest to hand to
someone who's never used this template before: drag things where they
belong, copy the coordinates, paste them in.

Plain flex/grid (hand-written `style={{ display: 'flex', ... }}`
containers, no `LayoutCanvas`) still works fine for a page that's
mostly simple rows and columns — it's just not what the shipped
example demonstrates.

### Step 8 — Retarget device if needed
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

### Step 9 — Package and deploy
```bash
npm run package
```
This builds the app and packages it into `release/av-panel-template.ch5z`
— a single file ready to load onto a touch panel. Each panel/room is
its own build: package once per `ACTIVE_PAGE` you set in Step 7.

The output goes to `release/`, not `dist/`, on purpose — `dist/` is
also the *source* directory `ch5-cli archive` reads from (`-d dist`).
Pointing its output (`-o`) at that same folder makes it re-scan its
own still-growing archive as input on every pass, which doesn't error,
it just balloons — we hit a multi-GB runaway file from exactly this
before fixing it. Keep `-d` and `-o` pointed at different folders in
`package.json`'s `package` script if you ever touch it.

Load the `.ch5z` onto the panel with either:
- **Toolbox** → Web Pages and Mobility Projects, drag in the `.ch5z`, or
- The panel's own **Project Upload** page (its local web config UI —
  browse to the panel's IP, find Applications → Project Upload)

Both are self-contained: once uploaded, the panel runs the project
from its own storage, no server or network dependency needed to keep
it running. (`ch5-cli deploy` is also available for scripted deploys —
see the CH5 CLI docs — but isn't necessary for a one-off upload.)

---

## Switching Between Device Profiles — What Actually Needs to Change

Flipping `ACTIVE_DEVICE` always resizes the canvas. What else your page
needs depends on *how* you built it and *how different* the new target is:

### Same orientation, different size (e.g. TS-770 → TS-1070)
Pages built with normal flex/grid mostly reflow on their own — columns
using `flex: 1` absorb the extra width, `GroupBox` widths stay fixed.
Still eyeball it: a 640px gain in width going from TS-770 to TS-1070
usually shows up as dead space on the right rather than broken layout,
but check spacing/proportions before calling it done.

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
same way you would for any new page (Step 3 above) and stack content
vertically instead of in columns.

To catch someone pointing a landscape page at a portrait device (or
vice versa) by mistake, declare the orientation the page was built for
and `PanelLayout` will show a full-screen warning if it doesn't match
`ACTIVE_DEVICE`:

```tsx
<PanelLayout expectOrientation="landscape">
```

`ExampleRoom.tsx` and `ComponentLibrary.tsx` both do this already —
try setting `ACTIVE_DEVICE` to `'ts570p'` and reloading to see it fire.

**One line change. Everything snaps to the new canvas size.**

---

## Project Structure

```
public/
└── cr-com-lib.js           ← CrComLib, loaded as a global — see "CrComLib Setup" above
index.html                  ← Loads cr-com-lib.js before the app bundle
src/
├── globals.d.ts             ← Types window.CrComLib for TypeScript
├── config/
│   └── devices.ts          ← Change ACTIVE_DEVICE here to retarget
├── styles/
│   └── tokens.css          ← All colors, spacing, font — edit to retheme
├── components/
│   ├── AVButton.tsx        ← Toggle, momentary, select buttons + AVButtonGroup
│   ├── GroupBox.tsx        ← Labeled border container (like VTPro group box)
│   ├── PTZControl.tsx      ← Camera joystick with pan/tilt/zoom + presets
│   ├── AVSlider.tsx        ← Horizontal or vertical fader (analog join)
│   │                          AVGauge — level meter (read-only feedback)
│   ├── LayoutCanvas.tsx    ← Drag-to-position canvas (Construct-style free placement)
│   ├── Positioned.tsx      ← Draggable/absolute-positioned wrapper, used inside LayoutCanvas
│   └── PanelLayout.tsx     ← Root canvas + PageHeader
├── hooks/
│   └── useSerialJoin.ts    ← Serial join text with a fallback default (see Step 6)
├── pages/
│   ├── ComponentLibrary.tsx ← THE PARTS BIN — browse this during development
│   └── ExampleRoom.tsx     ← THE TEMPLATE ROOM — duplicate this to start any new room
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
