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
import { AVSlider, AVGauge } from '../components/AVSlider';
import { PTZControl } from '../components/PTZControl';
import { LayoutCanvas } from '../components/LayoutCanvas';
import { Positioned } from '../components/Positioned';
import { useSerialJoin } from '../hooks/useSerialJoin';

// Dragged coordinates live here. This is exactly what "Copy Positions"
// hands you — paste it over this object to update the layout.
// Sized for the default ACTIVE_DEVICE (TS-1070, 1920×1200) — see the
// README's "Switching Between Device Profiles" section for what
// changes if you retarget this page to a smaller panel.
const POSITIONS = {
  sources: { x: 24, y: 16, w: 1200, h: 100 },
  camera: { x: 336, y: 152, w: 460, h: 380 },
  audio: { x: 832, y: 152, w: 180, h: 380 },
  roomVolume: { x: 1048, y: 152, w: 175, h: 380 },
  display: { x: 24, y: 432, w: 280, h: 100 },
  screen: { x: 24, y: 288, w: 280, h: 100 },
  projector: { x: 24, y: 152, w: 280, h: 100 },
};

export const TrainingRoom: React.FC = () => {
  // Room name — serial join 1. Shows "Default Text" until the
  // processor actually sends a string on join 1, then switches to
  // whatever that says. See src/hooks/useSerialJoin.ts.
  const roomName = useSerialJoin(1) ?? 'Default Text';

  // Power feedback — driven entirely by the processor, never by the button
  // press itself. fb34 (Display_Power_fb) and fb36 (Proj_Power_fb) are each
  // a single feedback signal that drives BOTH the On and Off button
  // highlights for their box (On lit when true, Off lit when false) — see
  // the join list: press34/35 share fb34, press36/37 share fb36.
  //
  // Defaults to false, and that's the only option — CrComLib fires the
  // subscription callback synchronously on subscribe with the join's
  // current value, even for a join nothing has ever sent to, and for a
  // boolean that default IS false. Unlike strings (empty string is a safe
  // "nothing yet" signal to fall back from), false is a real, meaningful
  // digital state with no third "unset" value on the wire — there's no way
  // to tell "confirmed off" apart from "haven't heard anything yet."
  const [displayPowerOn, setDisplayPowerOn] = useState(false);
  const [projectorPowerOn, setProjectorPowerOn] = useState(false);

  useEffect(() => {
    const displayFbId = window.CrComLib.subscribeState('boolean', '34', setDisplayPowerOn);
    const projectorFbId = window.CrComLib.subscribeState('boolean', '36', setProjectorPowerOn);
    return () => {
      window.CrComLib.unsubscribeState('boolean', '34', displayFbId);
      window.CrComLib.unsubscribeState('boolean', '36', projectorFbId);
    };
  }, []);

  // Source select feedback — same false-default reality as power above
  // (see the comment on displayPowerOn for why). Each source has its own
  // feedback join (unlike Display/Projector's one shared join), so we
  // track them separately and derive a single AVButtonGroup activeIndex
  // from whichever one is true. "Blank" isn't part of this — it's a
  // momentary clear pulse (press29) with no feedback of its own, so it
  // lives outside the group entirely.
  //
  // That's also how clearing the selection works with no extra code here:
  // when Blank is pressed, the SIMPL program is expected to drop fb30/
  // fb31/fb32 back to false, at which point sourceIndex below naturally
  // falls back to null and AVButtonGroup shows nothing selected — the UI
  // never needs to know Blank was pressed, only that nothing is routed.
  const [teamsFb, setTeamsFb] = useState(false);
  const [tableHdmiFb, setTableHdmiFb] = useState(false);
  const [roomPcFb, setRoomPcFb] = useState(false);
  const SOURCE_PRESS_JOINS = [30, 31, 32]; // index order matches the AVButtonGroup children below
  const sourceIndex = teamsFb ? 0 : tableHdmiFb ? 1 : roomPcFb ? 2 : null;

  useEffect(() => {
    const teamsId = window.CrComLib.subscribeState('boolean', '30', setTeamsFb);
    const tableHdmiId = window.CrComLib.subscribeState('boolean', '31', setTableHdmiFb);
    const roomPcId = window.CrComLib.subscribeState('boolean', '32', setRoomPcFb);
    return () => {
      window.CrComLib.unsubscribeState('boolean', '30', teamsId);
      window.CrComLib.unsubscribeState('boolean', '31', tableHdmiId);
      window.CrComLib.unsubscribeState('boolean', '32', roomPcId);
    };
  }, []);

  // Volume levels — analog joins 3/4/5, confirmed from your Analog Scaler
  // symbols (Room/HH/Lav). Sliders update this state locally in onChange
  // too (not just from the subscription) so dragging feels instant instead
  // of waiting on a round-trip — the subscription then keeps it in sync if
  // the level changes from somewhere else (another panel, a preset, etc).
  const [roomVolumeLevel, setRoomVolumeLevel] = useState(0);
  const [hhVolumeLevel, setHhVolumeLevel] = useState(0);
  const [lavVolumeLevel, setLavVolumeLevel] = useState(0);

  useEffect(() => {
    const roomId = window.CrComLib.subscribeState('number', '3', setRoomVolumeLevel);
    const hhId = window.CrComLib.subscribeState('number', '4', setHhVolumeLevel);
    const lavId = window.CrComLib.subscribeState('number', '5', setLavVolumeLevel);
    return () => {
      window.CrComLib.unsubscribeState('number', '3', roomId);
      window.CrComLib.unsubscribeState('number', '4', hhId);
      window.CrComLib.unsubscribeState('number', '5', lavId);
    };
  }, []);

  // Room volume up/down/mute — PLACEHOLDER joins (60/61/62). You said
  // you'll build this logic in SIMPL next; swap these three numbers for
  // the real ones once you have them (search for 60, 61, 62 below).
  const [roomMuted, setRoomMuted] = useState(false);

  useEffect(() => {
    const muteId = window.CrComLib.subscribeState('boolean', '62', setRoomMuted);
    return () => window.CrComLib.unsubscribeState('boolean', '62', muteId);
  }, []);

  return (
    <PanelLayout showDevFrame expectOrientation="landscape">

      <PageHeader
        title={roomName}
        statusOk={true}
      />

      <LayoutCanvas grid={8}>

        <Positioned id="sources" {...POSITIONS.sources}>
          <GroupBox title="Sources Route to Display" width="100%">
            <div style={{ display: 'flex', gap: 'var(--av-gap-sm)' }}>
              <div style={{ flex: 3 }}>
                <AVButtonGroup
                  columns={3}
                  activeIndex={sourceIndex}
                  onSelect={(i) => window.CrComLib.publishEvent('boolean', String(SOURCE_PRESS_JOINS[i]), true)}
                >
                  <AVButton label="Teams"       joinNumber={30} size="lg" />
                  <AVButton label="Table HDMI"  joinNumber={31} size="lg" />
                  <AVButton label="Room PC"     joinNumber={32} size="lg" />
                </AVButtonGroup>
              </div>
              <div style={{ flex: 1 }}>
                <AVButton
                  label="Blank"
                  joinNumber={29}
                  size="lg"
                  variant="momentary"
                  onPress={() => window.CrComLib.publishEvent('boolean', '29', true)}
                  onRelease={() => window.CrComLib.publishEvent('boolean', '29', false)}
                />
              </div>
            </div>
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
          {/* Room Volume moved to the gauge + up/down/mute setup, bottom
              right — this box now covers the two channels that still use
              a direct slider. */}
          <GroupBox title="Audio" direction="row" gap="28px" style={{ height: '100%', justifyContent: 'space-evenly' }}>
           <AVSlider
             label="HH Volume"
             joinNumber={4}
             orientation="vertical"
             size="lg"
             length={240}
             value={hhVolumeLevel}
             onChange={(v) => { setHhVolumeLevel(v); window.CrComLib.publishEvent('number', '4', v); }}
           />
           <AVSlider
             label="Lav Volume"
             joinNumber={5}
             orientation="vertical"
             size="lg"
             length={240}
             value={lavVolumeLevel}
             onChange={(v) => { setLavVolumeLevel(v); window.CrComLib.publishEvent('number', '5', v); }}
           />
          </GroupBox>
        </Positioned>

        <Positioned id="roomVolume" {...POSITIONS.roomVolume}>
          {/* Gauge + up/down/mute instead of a slider — the pattern you
              actually use most. Up/Down are plain momentary pulses (no
              feedback needed, just "ramp while held"). Mute follows the
              same feedback-driven rule as every other toggle-like control
              in this file: it only lights because the processor confirmed
              it, never because it was clicked. */}
          <GroupBox title="Room Volume" style={{ height: '100%', justifyContent: 'center', alignItems: 'center' }}>
            <AVButton
              label="▲"
              joinNumber={60}
              variant="momentary"
              size="md"
              style={{ width: 64 }}
              onPress={() => window.CrComLib.publishEvent('boolean', '42', true)}
              onRelease={() => window.CrComLib.publishEvent('boolean', '42', false)}
            />
            <AVGauge label="VOL" value={roomVolumeLevel} color="accent" height={180} width={32} />
            <div style={{ display: 'flex', gap: 8 }}>
              <AVButton
                label="▼"
                joinNumber={61}
                variant="momentary"
                size="md"
                style={{ width: 64 }}
                onPress={() => window.CrComLib.publishEvent('boolean', '43', true)}
                onRelease={() => window.CrComLib.publishEvent('boolean', '43', false)}
              />
              <AVButton
                label="Mute"
                joinNumber={62}
                variant="momentary"
                size="md"
                color="danger"
                style={{ width: 64 }}
                active={roomMuted}
                onPress={() => window.CrComLib.publishEvent('boolean', '44', true)}
                onRelease={() => window.CrComLib.publishEvent('boolean', '44', false)}
              />
            </div>
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
              active={!displayPowerOn}
              onPress={() => window.CrComLib.publishEvent('boolean', '35', true)}
              onRelease={() => window.CrComLib.publishEvent('boolean', '35', false)}
            />
            <AVButton
              label="On"
              joinNumber={34}
              color="success"
              variant="momentary"
              size="lg"
              active={displayPowerOn}
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
              active={!projectorPowerOn}
              onPress={() => window.CrComLib.publishEvent('boolean', '37', true)}
              onRelease={() => window.CrComLib.publishEvent('boolean', '37', false)}
            />
            <AVButton
              label="On"
              joinNumber={36}
              color="success"
              variant="momentary"
              size="lg"
              active={projectorPowerOn}
              onPress={() => window.CrComLib.publishEvent('boolean', '36', true)}
              onRelease={() => window.CrComLib.publishEvent('boolean', '36', false)}
            />
          </GroupBox>
        </Positioned>

      </LayoutCanvas>

    </PanelLayout>
  );
};
