// ─────────────────────────────────────────────────────────────
//  CameraControl.tsx  — example completed page
//
//  This is what a programmer produces after copy-pasting
//  components from ComponentLibrary.tsx and wiring in their
//  own join numbers.
//
//  TO BUILD YOUR OWN PAGE:
//  1. Duplicate this file and rename it (e.g. AudioControl.tsx)
//  2. Replace components and join numbers with your own
//  3. Import your page in App.tsx
// ─────────────────────────────────────────────────────────────

import React from 'react';
import { PanelLayout, PageHeader } from '../components/PanelLayout';
import { GroupBox } from '../components/GroupBox';
import { AVButton, AVButtonGroup } from '../components/AVButton';
import { AVSlider, AVGauge } from '../components/AVSlider';
import { PTZControl } from '../components/PTZControl';

export const CameraControlPage: React.FC = () => {
  return (
    <PanelLayout showDevFrame expectOrientation="landscape">

      {/* ── Page header ──────────────────────────────────── */}
      <PageHeader
        title="Camera Control"
        statusText="Connected"
        statusOk={true}
      />

      {/* ── Main content row ─────────────────────────────── */}
      <div style={{ display: 'flex', gap: 12, flex: 1, overflow: 'hidden' }}>

        {/* Left column: camera select */}
        <GroupBox title="Cameras" width={150}>
          <AVButtonGroup>
            <AVButton label="Audience"  joinNumber={1} size="lg" />
            <AVButton label="Presenter" joinNumber={2} size="lg" />
            <AVButton label="Lectern"   joinNumber={3} size="lg" />
          </AVButtonGroup>
        </GroupBox>

        {/* Center column: PTZ + audio */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 12 }}>

          <GroupBox title="PTZ Control" style={{ flex: 1, justifyContent: 'center' }}>
            <PTZControl
              panLeftJoin={10}  panRightJoin={11}
              tiltUpJoin={12}   tiltDownJoin={13}
              zoomInJoin={14}   zoomOutJoin={15}
              homeJoin={16}
              presets={[
                { label: 'Wide',     recallJoin: 20, saveJoin: 30 },
                { label: 'Podium',   recallJoin: 21, saveJoin: 31 },
                { label: 'Audience', recallJoin: 22, saveJoin: 32 },
              ]}
            />
          </GroupBox>

          <GroupBox title="Audio Levels" direction="row" style={{ alignItems: 'center' }}>
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 8 }}>
              <AVSlider label="Room Volume" joinNumber={1} defaultValue={75} />
              <AVSlider label="Mic Level"   joinNumber={2} defaultValue={60} />
              <AVSlider label="BG Music"    joinNumber={3} defaultValue={20} />
            </div>
            <div style={{ display: 'flex', gap: 8, paddingLeft: 12 }}>
              <AVGauge label="VOL" value={75} color="accent" />
              <AVGauge label="MIC" value={60} color="green" />
              <AVGauge label="BGM" value={20} color="amber" />
            </div>
          </GroupBox>

        </div>

        {/* Right column: mode + display + power */}
        <div style={{ width: 150, display: 'flex', flexDirection: 'column', gap: 12 }}>

          <GroupBox title="Camera Mode">
            <AVButtonGroup>
              <AVButton label="Auto Framing"   joinNumber={10} size="lg" />
              <AVButton label="Manual Control" joinNumber={11} size="lg" />
            </AVButtonGroup>
          </GroupBox>

          <GroupBox title="Display Mode">
            <AVButtonGroup>
              <AVButton label="Teams"          subLabel="Right Mon"       joinNumber={20} />
              <AVButton label="Local"          subLabel="Both Monitors"   joinNumber={21} />
              <AVButton label="Duplicate"      subLabel="Right → Left"    joinNumber={22} />
            </AVButtonGroup>
          </GroupBox>

          <GroupBox title="Power" direction="row" style={{ marginTop: 'auto' }}>
            <AVButton label="Off" joinNumber={50} color="danger"  variant="toggle" />
            <AVButton label="On"  joinNumber={51} color="success" variant="toggle" />
          </GroupBox>

        </div>
      </div>

      {/* ── Bottom bar ───────────────────────────────────── */}
      <div style={{ display: 'flex', gap: 8, marginTop: 12, flexShrink: 0 }}>
        <AVButton label="🎙 Mic Control"  joinNumber={30} variant="toggle" size="sm" style={{ width: 140 }} />
        <div style={{ flex: 1 }} />
        <AVButton label="⬅ Back"         joinNumber={99} size="sm" style={{ width: 80 }} />
      </div>

    </PanelLayout>
  );
};
