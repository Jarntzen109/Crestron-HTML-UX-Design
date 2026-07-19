// ─────────────────────────────────────────────────────────────
//  ExampleRoom.tsx  — THE TEMPLATE ROOM. Duplicate this file to
//  start any new room, regardless of what that room actually is —
//  the name is just this example's, the pattern is generic.
//
//  Built with the drag-to-position workflow (LayoutCanvas +
//  Positioned) rather than hand-written flex/grid, because it's
//  the easiest one to hand to a programmer who's never used this
//  template before: drag things where they belong, copy the
//  resulting coordinates, paste them in. Plain flex/grid still
//  works fine too (just wrap children in normal divs with
//  style={{ display: 'flex', ... }} instead of LayoutCanvas/
//  Positioned) if a page is mostly simple rows and columns.
//
//  HOW THIS PAGE WAS ACTUALLY BUILT — the real per-control loop:
//
//  1. Pick a component from ComponentLibrary.tsx (e.g. AVButtonGroup
//     for the source selector) and paste its usage snippet in below.
//  2. Wrap it in <Positioned id="..." x={0} y={0} w={..} h={..}>
//     with a rough guess at size/position — the numbers don't need
//     to be right yet.
//  3. Set the join numbers to whatever your SIMPL program uses.
//  4. Run the dev server, click "Edit Layout" on the canvas, and
//     drag the block to where it actually belongs on screen.
//  5. Click "Copy Positions" and paste the result over the
//     POSITIONS object below — that's what makes the drag
//     permanent instead of resetting on next reload.
//  6. Repeat for the next control.
//
//  TO BUILD YOUR OWN ROOM:
//  1. Duplicate this file and rename it (e.g. Classroom305.tsx)
//  2. Delete the Positioned blocks you don't need, add your own
//     following steps 1-6 above
//  3. Import your page in App.tsx
// ─────────────────────────────────────────────────────────────

import React from 'react';
import { PanelLayout, PageHeader } from '../components/PanelLayout';
import { GroupBox } from '../components/GroupBox';
import { AVButton, AVButtonGroup } from '../components/AVButton';
import { AVSlider } from '../components/AVSlider';
import { PTZControl } from '../components/PTZControl';
import { LayoutCanvas } from '../components/LayoutCanvas';
import { Positioned } from '../components/Positioned';

// Dragged coordinates live here. This is exactly what "Copy Positions"
// hands you — paste it over this object to update the layout.
// Sized for the default ACTIVE_DEVICE (TS-1070, 1920×1200) — see the
// README's "Switching Between Device Profiles" section for what
// changes if you retarget this page to a smaller panel.
const POSITIONS = {
  sources: { x: 24, y: 24, w: 280, h: 380 },
  camera: { x: 600, y: 336, w: 580, h: 380 },
  audio: { x: 1368, y: 568, w: 380, h: 380 },
  lighting: { x: 1368, y: 120, w: 280, h: 380 },
  display: { x: 24, y: 456, w: 280, h: 200 },
  screen: { x: 24, y: 704, w: 280, h: 200 },
  help: { x: 608, y: 404, w: 584, h: 200 },
};

export const ExampleRoomPage: React.FC = () => {
  return (
    <PanelLayout showDevFrame expectOrientation="landscape">

      <PageHeader
        title="Training Room 204"
        statusText="Connected"
        statusOk={true}
      />

      <LayoutCanvas grid={8}>

        <Positioned id="sources" {...POSITIONS.sources}>
          <GroupBox title="Sources" width="100%">
            <AVButtonGroup columns={2}>
              <AVButton label="Laptop"   joinNumber={10} size="lg" />
              <AVButton label="PC"       joinNumber={11} size="lg" />
              <AVButton label="Doc Cam"  joinNumber={12} size="lg" />
              <AVButton label="Blu-ray"  joinNumber={13} size="lg" />
              <AVButton label="Teams"    joinNumber={14} size="lg" />
              <AVButton label="Table HDMI"    joinNumber={27} size="md" />
            </AVButtonGroup>
          </GroupBox>
        </Positioned>

        <Positioned id="camera" {...POSITIONS.camera}>
          <GroupBox title="Lecture Camera" style={{ height: '100%', justifyContent: 'center' }}>
            <PTZControl
              panLeftJoin={20}  panRightJoin={21}
              tiltUpJoin={22}   tiltDownJoin={23}
              zoomInJoin={24}   zoomOutJoin={25}
              homeJoin={26}
              presets={[
                { label: 'Podium', recallJoin: 30, saveJoin: 40 },
                { label: 'Wide',   recallJoin: 31, saveJoin: 41 },
              ]}
            />
          </GroupBox>
        </Positioned>

        <Positioned id="audio" {...POSITIONS.audio}>
          <GroupBox title="Audio" style={{ height: '100%', justifyContent: 'center' }}>
            <AVSlider label="Room Volume" joinNumber={1} defaultValue={70} />
            <AVSlider label="Mic Level"   joinNumber={2} defaultValue={55} />
          </GroupBox>
        </Positioned>

        <Positioned id="lighting" {...POSITIONS.lighting}>
          <GroupBox title="Lighting" width="100%">
            <AVButtonGroup>
              <AVButton label="Full" joinNumber={60} size="lg" />
              <AVButton label="Dim"  joinNumber={61} size="lg" />
              <AVButton label="Off"  joinNumber={62} size="lg" />
            </AVButtonGroup>
          </GroupBox>
        </Positioned>

        <Positioned id="display" {...POSITIONS.display}>
          <GroupBox title="Display" direction="row" style={{ height: '100%' }}>
            <AVButton label="Off" joinNumber={50} color="danger"  variant="toggle" size="lg" />
            <AVButton label="On"  joinNumber={51} color="success" variant="toggle" size="lg" />
          </GroupBox>
        </Positioned>

        <Positioned id="screen" {...POSITIONS.screen}>
          <GroupBox title="Screen" direction="row" style={{ height: '100%' }}>
            <AVButton label="▲ Up"   joinNumber={52} variant="momentary" size="lg" />
            <AVButton label="▼ Down" joinNumber={53} variant="momentary" size="lg" />
          </GroupBox>
        </Positioned>

      </LayoutCanvas>

    </PanelLayout>
  );
};
