// ─────────────────────────────────────────────────────────────
//  AVSlider  — horizontal fader, maps to an analog join
//  AVGauge   — vertical level meter, read-only analog feedback
//
//  COPY-PASTE USAGE:
//
//  Slider (programmer wires to analog join):
//    <AVSlider label="Room Volume" joinNumber={1} defaultValue={75} />
//    <AVSlider label="Mic Level"   joinNumber={2} defaultValue={50} showValue />
//
//  Gauge (read-only feedback, value driven by analog join):
//    <AVGauge label="VOL" value={75} color="accent" />
//    <AVGauge label="MIC" value={40} color="green" />
//    <AVGauge label="BGM" value={20} color="amber" />
//
//  Row of gauges:
//    <div style={{ display: 'flex', gap: 8 }}>
//      <AVGauge label="L" value={80} />
//      <AVGauge label="R" value={75} />
//    </div>
// ─────────────────────────────────────────────────────────────

import React, { useState } from 'react';

// ─── AVSlider ────────────────────────────────────────────────

interface AVSliderProps {
  label:        string;
  joinNumber?:  number;
  defaultValue?: number;
  min?:         number;
  max?:         number;
  showValue?:   boolean;
  onChange?:    (value: number) => void;
  value?:       number;        // controlled
  style?:       React.CSSProperties;
}

export const AVSlider: React.FC<AVSliderProps> = ({
  label,
  joinNumber,
  defaultValue = 50,
  min = 0,
  max = 100,
  showValue = true,
  onChange,
  value: controlled,
  style,
}) => {
  const [internal, setInternal] = useState(defaultValue);
  const value = controlled !== undefined ? controlled : internal;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const v = Number(e.target.value);
    setInternal(v);
    onChange?.(v);
  };

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--av-gap-sm)', ...style }}>
      <span style={{ fontSize: 11, color: 'var(--av-text-secondary)', minWidth: 64, flexShrink: 0 }}>
        {label}
        {joinNumber !== undefined && (
          <span className="join-label" style={{ display: 'block', fontSize: 8, fontFamily: 'var(--av-font-mono)' }}>A{joinNumber}</span>
        )}
      </span>
      <input
        type="range"
        min={min}
        max={max}
        step={1}
        value={value}
        onChange={handleChange}
        style={{
          flex: 1,
          WebkitAppearance: 'none',
          appearance: 'none',
          height: 4,
          background: `linear-gradient(to right, var(--av-accent) ${value}%, var(--av-border-default) ${value}%)`,
          borderRadius: 2,
          outline: 'none',
          cursor: 'pointer',
        }}
      />
      {showValue && (
        <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--av-text-primary)', minWidth: 28, textAlign: 'right', fontFamily: 'var(--av-font-mono)' }}>
          {value}
        </span>
      )}
    </div>
  );
};

// ─── AVGauge ─────────────────────────────────────────────────

type GaugeColor = 'accent' | 'green' | 'amber' | 'red';

interface AVGaugeProps {
  label:       string;
  value:       number;   // 0–100
  color?:      GaugeColor;
  width?:      number;
  height?:     number;
  showValue?:  boolean;
  style?:      React.CSSProperties;
}

const gaugeColors: Record<GaugeColor, string> = {
  accent: 'var(--av-accent)',
  green:  'var(--av-green)',
  amber:  'var(--av-amber)',
  red:    'var(--av-red)',
};

export const AVGauge: React.FC<AVGaugeProps> = ({
  label,
  value,
  color = 'accent',
  width = 28,
  height = 80,
  showValue = true,
  style,
}) => {
  const clamped = Math.max(0, Math.min(100, value));
  const fillHeight = (clamped / 100) * height;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4, ...style }}>
      <div style={{
        width, height,
        background: 'var(--av-bg-elevated)',
        border: '1px solid var(--av-border-default)',
        borderRadius: 'var(--av-radius-sm)',
        position: 'relative',
        overflow: 'hidden',
      }}>
        <div style={{
          position: 'absolute',
          bottom: 0, left: 0, right: 0,
          height: fillHeight,
          background: gaugeColors[color],
          borderRadius: 'var(--av-radius-sm)',
          transition: 'height 0.2s',
        }} />
      </div>
      {showValue && (
        <span style={{ fontSize: 11, fontWeight: 600, color: 'var(--av-text-primary)', fontFamily: 'var(--av-font-mono)' }}>
          {clamped}
        </span>
      )}
      <span style={{ fontSize: 10, color: 'var(--av-text-muted)', fontWeight: 600, letterSpacing: '0.08em' }}>
        {label}
      </span>
    </div>
  );
};
