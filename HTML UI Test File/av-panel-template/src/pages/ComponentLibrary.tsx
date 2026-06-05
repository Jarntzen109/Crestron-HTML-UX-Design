// ─────────────────────────────────────────────────────────────
//  ComponentLibrary.tsx
//
//  THE PARTS BIN — open this page during development to browse
//  every available component. Copy the usage snippet from the
//  comment block at the top of each component file, then paste
//  it into your page.
//
//  To view: set App.tsx to render <ComponentLibrary /> instead
//  of your target page.
// ─────────────────────────────────────────────────────────────

import React, { useState } from 'react';
import { PanelLayout } from '../components/PanelLayout';
import { GroupBox } from '../components/GroupBox';
import { AVButton, AVButtonGroup } from '../components/AVButton';
import { AVSlider, AVGauge } from '../components/AVSlider';
import { PTZControl } from '../components/PTZControl';

// ── Section wrapper for the library ──────────────────────────
const Section: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => (
  <div style={{ marginBottom: 28 }}>
    <div style={{
      fontSize: 10, fontWeight: 700, letterSpacing: '0.15em',
      color: 'var(--av-accent)', textTransform: 'uppercase',
      borderBottom: '1px solid var(--av-border-subtle)',
      paddingBottom: 6, marginBottom: 14,
    }}>
      {title}
    </div>
    {children}
  </div>
);

export const ComponentLibrary: React.FC = () => {
  const [gaugeVal, setGaugeVal] = useState(65);

  return (
    <PanelLayout showDevFrame>
      {/* Scrollable library canvas */}
      <div style={{ overflow: 'auto', flex: 1, paddingRight: 4 }}>

        {/* Header */}
        <div style={{ marginBottom: 20 }}>
          <div style={{ fontSize: 18, fontWeight: 300, letterSpacing: '0.15em', color: 'var(--av-text-primary)', textTransform: 'uppercase' }}>
            Component Library
          </div>
          <div style={{ fontSize: 11, color: 'var(--av-text-muted)', marginTop: 4 }}>
            Copy any component below into your page file. Wire joins in your own SIMPL program.
          </div>
        </div>

        {/* ── BUTTONS ─────────────────────────────────────── */}
        <Section title="AVButton — sizes">
          <div style={{ display: 'flex', gap: 8, alignItems: 'flex-end' }}>
            <div style={{ width: 120 }}>
              <AVButton label="Small" joinNumber={1} size="sm" />
            </div>
            <div style={{ width: 120 }}>
              <AVButton label="Medium" joinNumber={2} size="md" />
            </div>
            <div style={{ width: 120 }}>
              <AVButton label="Large" subLabel="Presenter Cam" joinNumber={3} size="lg" />
            </div>
          </div>
        </Section>

        <Section title="AVButton — variants & colors">
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            <div style={{ width: 120 }}>
              <AVButton label="Momentary" joinNumber={4} variant="momentary" />
            </div>
            <div style={{ width: 120 }}>
              <AVButton label="Toggle" joinNumber={5} variant="toggle" />
            </div>
            <div style={{ width: 120 }}>
              <AVButton label="Power Off" joinNumber={50} color="danger" variant="toggle" />
            </div>
            <div style={{ width: 120 }}>
              <AVButton label="Power On" joinNumber={51} color="success" variant="toggle" />
            </div>
          </div>
        </Section>

        <Section title="AVButtonGroup — mutually exclusive select">
          <div style={{ width: 360 }}>
            <AVButtonGroup columns={3}>
              <AVButton label="HDMI 1"   joinNumber={10} />
              <AVButton label="HDMI 2"   joinNumber={11} />
              <AVButton label="Teams PC" joinNumber={12} />
            </AVButtonGroup>
          </div>
        </Section>

        {/* ── GROUP BOX ────────────────────────────────────── */}
        <Section title="GroupBox — labeled container">
          <div style={{ display: 'flex', gap: 12 }}>
            <GroupBox title="Cameras" width={140}>
              <AVButton label="Audience"  joinNumber={1} />
              <AVButton label="Presenter" joinNumber={2} />
              <AVButton label="Lectern"   joinNumber={3} />
            </GroupBox>

            <GroupBox title="Camera Mode" width={140}>
              <AVButtonGroup>
                <AVButton label="Auto Framing"   joinNumber={10} />
                <AVButton label="Manual Control" joinNumber={11} />
              </AVButtonGroup>
            </GroupBox>

            <GroupBox title="Display" direction="row">
              <AVButton label="Teams" subLabel="Right Mon" joinNumber={20} size="sm" style={{ width: 100 }} />
              <AVButton label="Local" subLabel="Both Mons"  joinNumber={21} size="sm" style={{ width: 100 }} />
            </GroupBox>
          </div>
        </Section>

        {/* ── PTZ ─────────────────────────────────────────── */}
        <Section title="PTZControl — camera joystick">
          <GroupBox title="PTZ Control" direction="row" style={{ display: 'inline-flex' }}>
            <PTZControl
              tiltUpJoin={12}   tiltDownJoin={13}
              panLeftJoin={10}  panRightJoin={11}
              zoomInJoin={14}   zoomOutJoin={15}
              homeJoin={16}
              presets={[
                { label: 'Wide',    recallJoin: 20, saveJoin: 30 },
                { label: 'Podium',  recallJoin: 21, saveJoin: 31 },
                { label: 'Audience',recallJoin: 22, saveJoin: 32 },
              ]}
            />
          </GroupBox>
        </Section>

        {/* ── SLIDERS ─────────────────────────────────────── */}
        <Section title="AVSlider — analog fader">
          <div style={{ maxWidth: 480, display: 'flex', flexDirection: 'column', gap: 10 }}>
            <AVSlider label="Room Volume" joinNumber={1} defaultValue={75} onChange={setGaugeVal} />
            <AVSlider label="Mic Level"   joinNumber={2} defaultValue={50} />
            <AVSlider label="BG Music"    joinNumber={3} defaultValue={20} />
          </div>
        </Section>

        {/* ── GAUGES ──────────────────────────────────────── */}
        <Section title="AVGauge — analog level meter (read-only feedback)">
          <div style={{ display: 'flex', gap: 12, alignItems: 'flex-end' }}>
            <AVGauge label="VOL" value={gaugeVal} color="accent" />
            <AVGauge label="MIC" value={50} color="green" />
            <AVGauge label="BGM" value={20} color="amber" />
            <AVGauge label="CLIP" value={92} color="red" />
            <AVGauge label="Tall" value={60} color="accent" height={120} width={36} />
          </div>
          <div style={{ marginTop: 8, fontSize: 10, color: 'var(--av-text-muted)' }}>
            ↑ VOL gauge follows the Room Volume slider above
          </div>
        </Section>

        {/* ── COMPOSITION EXAMPLE ─────────────────────────── */}
        <Section title="Composition example — copy this whole block for a camera page">
          <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>

            <GroupBox title="Cameras" width={140}>
              <AVButtonGroup>
                <AVButton label="Audience"  joinNumber={1} size="md" />
                <AVButton label="Presenter" joinNumber={2} size="md" />
                <AVButton label="Lectern"   joinNumber={3} size="md" />
              </AVButtonGroup>
            </GroupBox>

            <GroupBox title="PTZ Control" style={{ flex: 1 }}>
              <PTZControl
                tiltUpJoin={12} tiltDownJoin={13}
                panLeftJoin={10} panRightJoin={11}
                zoomInJoin={14} zoomOutJoin={15}
                homeJoin={16}
                presets={[
                  { label: 'Wide',   recallJoin: 20, saveJoin: 30 },
                  { label: 'Podium', recallJoin: 21, saveJoin: 31 },
                ]}
              />
            </GroupBox>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <GroupBox title="Camera Mode" width={140}>
                <AVButtonGroup>
                  <AVButton label="Auto Framing" joinNumber={10} />
                  <AVButton label="Manual"       joinNumber={11} />
                </AVButtonGroup>
              </GroupBox>
              <GroupBox title="Power" direction="row" width={140}>
                <AVButton label="Off" joinNumber={50} color="danger" variant="toggle" />
                <AVButton label="On"  joinNumber={51} color="success" variant="toggle" />
              </GroupBox>
            </div>

          </div>
        </Section>

      </div>
    </PanelLayout>
  );
};
