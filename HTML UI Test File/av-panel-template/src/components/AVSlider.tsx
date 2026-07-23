// ─────────────────────────────────────────────────────────────
//  AVSlider  — fader, maps to an analog join. Horizontal or vertical.
//  AVGauge   — vertical level meter, read-only analog feedback
//
//  COPY-PASTE USAGE:
//
//  Slider (programmer wires to analog join):
//    <AVSlider label="Room Volume" joinNumber={1} defaultValue={75} />
//    <AVSlider label="Mic Level"   joinNumber={2} defaultValue={50} showValue />
//
//  Vertical slider (audio faders, PA-style channel strips):
//    <AVSlider label="Room Volume" joinNumber={1} defaultValue={75} orientation="vertical" />
//    <AVSlider label="Mic Level"   joinNumber={2} defaultValue={50} orientation="vertical" length={160} />
//
//  Row of vertical faders:
//    <div style={{ display: 'flex', gap: 16 }}>
//      <AVSlider label="Ch 1" joinNumber={1} orientation="vertical" />
//      <AVSlider label="Ch 2" joinNumber={2} orientation="vertical" />
//    </div>
//
//  Bigger track + thumb (default is "md"):
//    <AVSlider label="Room Volume" joinNumber={1} orientation="vertical" size="lg" length={220} />
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

import React, { useRef, useState } from 'react';

// ─── AVSlider ────────────────────────────────────────────────

type AVSliderOrientation = 'horizontal' | 'vertical';
type AVSliderSize = 'sm' | 'md' | 'lg';

const SLIDER_SIZES: Record<AVSliderSize, { track: number; wrapperThickness: number; thumb: number; thumbClass: string }> = {
  sm: { track: 3, wrapperThickness: 20, thumb: 12, thumbClass: 'av-slider-thumb av-slider-thumb-sm' },
  md: { track: 4, wrapperThickness: 24, thumb: 16, thumbClass: 'av-slider-thumb av-slider-thumb-md' },
  lg: { track: 6, wrapperThickness: 32, thumb: 22, thumbClass: 'av-slider-thumb av-slider-thumb-lg' },
};

interface AVSliderProps {
  label:        string;
  joinNumber?:  number;
  defaultValue?: number;
  min?:         number;
  max?:         number;
  showValue?:   boolean;
  onChange?:    (value: number) => void;
  value?:       number;        // controlled
  orientation?: AVSliderOrientation; // default: 'horizontal'
  length?:      number;        // track length in px — mainly useful for vertical (default: 120)
  size?:        AVSliderSize;  // track thickness + thumb size (default: 'md')
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
  orientation = 'horizontal',
  length = 120,
  size = 'md',
  style,
}) => {
  const [internal, setInternal] = useState(defaultValue);
  const value = controlled !== undefined ? controlled : internal;
  const s = SLIDER_SIZES[size];
  const trackRef = useRef<HTMLDivElement>(null);

  const commit = (v: number) => {
    const stepped = Math.round(v);
    const clamped = Math.min(max, Math.max(min, stepped));
    setInternal(clamped);
    onChange?.(clamped);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    commit(Number(e.target.value));
  };

  // Vertical fader is a custom pointer-driven control rather than a
  // rotated/writing-mode <input type="range"> — native range inputs have
  // inconsistent (and in testing, outright broken) drag-position tracking
  // when forced into a vertical orientation across browsers. Computing the
  // value directly from pointer position sidesteps that entirely.
  const updateFromClientY = (clientY: number) => {
    const track = trackRef.current;
    if (!track) return;
    const rect = track.getBoundingClientRect();
    const fraction = Math.min(1, Math.max(0, (rect.bottom - clientY) / rect.height));
    commit(min + fraction * (max - min));
  };

  const handleTrackPointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    e.currentTarget.setPointerCapture(e.pointerId);
    updateFromClientY(e.clientY);
  };

  const handleTrackPointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (e.buttons !== 1) return;
    updateFromClientY(e.clientY);
  };

  const handleTrackKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (e.key === 'ArrowUp' || e.key === 'ArrowRight') commit(value + 1);
    else if (e.key === 'ArrowDown' || e.key === 'ArrowLeft') commit(value - 1);
    else if (e.key === 'Home') commit(min);
    else if (e.key === 'End') commit(max);
    else return;
    e.preventDefault();
  };

  const trackStyle: React.CSSProperties = {
    WebkitAppearance: 'none',
    appearance: 'none',
    background: `linear-gradient(to right, var(--av-accent) ${value}%, var(--av-border-default) ${value}%)`,
    borderRadius: 2,
    outline: 'none',
    cursor: 'pointer',
  };

  const valueLabel = showValue && (
    <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--av-text-primary)', minWidth: 28, textAlign: 'center', fontFamily: 'var(--av-font-mono)' }}>
      {value}
    </span>
  );

  const nameLabel = (
    <span style={{ fontSize: 11, color: 'var(--av-text-secondary)', textAlign: 'center', flexShrink: 0 }}>
      {label}
      {joinNumber !== undefined && (
        <span className="join-label" style={{ display: 'block', fontSize: 8, fontFamily: 'var(--av-font-mono)' }}>A{joinNumber}</span>
      )}
    </span>
  );

  if (orientation === 'vertical') {
    const fraction = (value - min) / (max - min);
    const fillHeight = fraction * length;
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 'var(--av-gap-sm)', ...style }}>
        {nameLabel}
        <div
          ref={trackRef}
          role="slider"
          tabIndex={0}
          aria-orientation="vertical"
          aria-valuemin={min}
          aria-valuemax={max}
          aria-valuenow={value}
          onPointerDown={handleTrackPointerDown}
          onPointerMove={handleTrackPointerMove}
          onKeyDown={handleTrackKeyDown}
          style={{
            position: 'relative',
            width: s.wrapperThickness,
            height: length,
            cursor: 'pointer',
            touchAction: 'none',
            outline: 'none',
          }}
        >
          {/* track */}
          <div style={{
            position: 'absolute', left: '50%', top: 0, bottom: 0,
            width: s.track, transform: 'translateX(-50%)',
            background: 'var(--av-border-default)', borderRadius: 2,
          }} />
          {/* filled portion */}
          <div style={{
            position: 'absolute', left: '50%', bottom: 0,
            width: s.track, height: fillHeight, transform: 'translateX(-50%)',
            background: 'var(--av-accent)', borderRadius: 2,
          }} />
          {/* thumb */}
          <div style={{
            position: 'absolute', left: '50%',
            bottom: fillHeight - s.thumb / 2,
            width: s.thumb, height: s.thumb, transform: 'translateX(-50%)',
            background: 'var(--av-accent)', borderRadius: '50%',
            pointerEvents: 'none',
          }} />
        </div>
        {valueLabel}
      </div>
    );
  }

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
        className={s.thumbClass}
        min={min}
        max={max}
        step={1}
        value={value}
        onChange={handleChange}
        style={{
          ...trackStyle,
          flex: 1,
          height: s.track,
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
