// ─────────────────────────────────────────────────────────────
//  ExampleRoom.tsx  — THE TEMPLATE ROOM. Duplicate this file to
//  start any new room, regardless of what that room actually is —
//  the name is just this example's, the pattern is generic.
//
//  Built with the drag-to-position workflow (LayoutCanvas +
//  Positioned) rather than hand-written flex/grid, because it's
//  the easiest one to hand to a programmer who's never used this
//  template before: drag things where they belong, copy the
//  resulting coordinates, and paste them in. Plain flex/grid still
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

import React, { useEffect, useState } from 'react';
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
  sources: { x: 24, y: 8, w: 1200, h: 100 },
  camera: { x: 400, y: 152, w: 460, h: 380 },
  audio: { x: 944, y: 152, w: 280, h: 380 },
  display: { x: 24, y: 152, w: 280, h: 100 },
  screen: { x: 24, y: 432, w: 280, h: 100 },
  projector: { x: 24, y: 288, w: 280, h: 100 },
};

export const TrainingRoom: React.FC = () => {
  // Power feedback — driven entirely by the processor, never by the button
  // press itself. fb34 (Display_Power_fb) and fb36 (Proj_Power_fb) are each
  // a single feedback signal that drives BOTH the On and Off button
  // highlights for their box (On lit when true, Off lit when false) — see
  // the join list: press34/35 share fb34, press36/37 share fb36.
  //
  // Starts at null (unknown), not false — false IS a real feedback value
  // ("confirmed off"), so using it as the initial/no-signal-yet default
  // made Off light up before the processor had said anything at all.
  // Neither button lights while the state is still null.
  const [displayPowerOn, setDisplayPowerOn] = useState<boolean | null>(null);
  const [projectorPowerOn, setProjectorPowerOn] = useState<boolean | null>(null);

  useEffect(() => {
    const displayFbId = window.CrComLib.subscribeState('boolean', '34', setDisplayPowerOn);
    const projectorFbId = window.CrComLib.subscribeState('boolean', '36', setProjectorPowerOn);
    return () => {
      window.CrComLib.unsubscribeState('boolean', '34', displayFbId);
      window.CrComLib.unsubscribeState('boolean', '36', projectorFbId);
    };
  }, []);

  return (
    <PanelLayout showDevFrame expectOrientation="landscape">

      <PageHeader
        title="Training Room Main"
        statusOk={true}
      />

      <LayoutCanvas grid={8}>

        <Positioned id="sources" {...POSITIONS.sources}>
          <GroupBox title="Sources Route to Display" width="100%">
            <AVButtonGroup columns={4}>
              <AVButton label="Teams"   joinNumber={30} size="lg" />
              <AVButton label="Table HDMI" joinNumber={31} size="lg" />
              <AVButton label="Room PC"  joinNumber={32} size="lg" />
              <AVButton label="Blank"  joinNumber={33} size="lg" />
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
              size="lg"
              presets={[
                { label: 'Podium', recallJoin: 39, saveJoin: 40 },
                { label: 'Wide',   recallJoin: 38, saveJoin: 41 },
              ]}
              onPress={(join) => window.CrComLib.publishEvent('boolean', String(join), true)}
              onRelease={(join) => window.CrComLib.publishEvent('boolean', String(join), false)}
            />
          </GroupBox>
        </Positioned>

        <Positioned id="audio" {...POSITIONS.audio}>
          <GroupBox title="Audio" direction="row" gap="32px" style={{ height: '100%', justifyContent: 'space-evenly' }}>
           <AVSlider label="Room Volume" joinNumber={3} defaultValue={55} orientation="vertical" size="lg" length={240} />
           <AVSlider label="HH Volume" joinNumber={4} defaultValue={55} orientation="vertical" size="lg" length={240} />
           <AVSlider label="Lav Volume" joinNumber={5} defaultValue={55} orientation="vertical" size="lg" length={240} />
          </GroupBox>
        </Positioned>


        <Positioned id="display" {...POSITIONS.display}>
          {/* Momentary + controlled `active`: pressing only publishes a
              pulse (press34/press35) — it never assumes the result. The
              highlight comes entirely from displayPowerOn, set by the fb34
              subscription above. */}
          <GroupBox title="Display" direction="row" style={{ height: '100%' }}>
            <AVButton
              label="Off"
              joinNumber={35}
              color="danger"
              variant="momentary"
              size="lg"
              active={displayPowerOn === false}
              onPress={() => window.CrComLib.publishEvent('boolean', '35', true)}
              onRelease={() => window.CrComLib.publishEvent('boolean', '35', false)}
            />
            <AVButton
              label="On"
              joinNumber={34}
              color="success"
              variant="momentary"
              size="lg"
              active={displayPowerOn === true}
              onPress={() => window.CrComLib.publishEvent('boolean', '34', true)}
              onRelease={() => window.CrComLib.publishEvent('boolean', '34', false)}
            />
          </GroupBox>
        </Positioned>

        <Positioned id="screen" {...POSITIONS.screen}>
        <GroupBox title="Screen" direction="row" style={{ height: '100%' }}>
            <AVButton label="▲ Up"   joinNumber={52} variant="momentary" size="lg" />
            <AVButton label="▼ Down" joinNumber={53} variant="momentary" size="lg" />
          </GroupBox>
        </Positioned>

        <Positioned id="projector" {...POSITIONS.projector}>
          <GroupBox title="Projector" direction="row" style={{ height: '100%' }}>
            <AVButton
              label="Off"
              joinNumber={37}
              color="danger"
              variant="momentary"
              size="lg"
              active={projectorPowerOn === false}
              onPress={() => window.CrComLib.publishEvent('boolean', '37', true)}
              onRelease={() => window.CrComLib.publishEvent('boolean', '37', false)}
            />
            <AVButton
              label="On"
              joinNumber={36}
              color="success"
              variant="momentary"
              size="lg"
              active={projectorPowerOn === true}
              onPress={() => window.CrComLib.publishEvent('boolean', '36', true)}
              onRelease={() => window.CrComLib.publishEvent('boolean', '36', false)}
            />
          </GroupBox>
        </Positioned>

      </LayoutCanvas>

    </PanelLayout>
  );
};
