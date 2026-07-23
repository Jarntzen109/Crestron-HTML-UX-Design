// ─────────────────────────────────────────────────────────────
//  PTZControl
//  Full camera pan/tilt/zoom joystick with preset buttons.
//  Each direction fires onPress/onRelease for momentary joins.
//
//  COPY-PASTE USAGE:
//
//  Minimal (just the joystick):
//    <PTZControl
//      panLeftJoin={10}  panRightJoin={11}
//      tiltUpJoin={12}   tiltDownJoin={13}
//      zoomInJoin={14}   zoomOutJoin={15}
//    />
//
//  With presets:
//    <PTZControl
//      panLeftJoin={10}  panRightJoin={11}
//      tiltUpJoin={12}   tiltDownJoin={13}
//      zoomInJoin={14}   zoomOutJoin={15}
//      presets={[
//        { label: 'Wide',     recallJoin: 20, saveJoin: 30 },
//        { label: 'Podium',   recallJoin: 21, saveJoin: 31 },
//        { label: 'Audience', recallJoin: 22, saveJoin: 32 },
//      ]}
//    />
//
//  Show/hide zoom controls:
//    <PTZControl ... showZoom={false} />
//
//  Bigger buttons (default is "md"):
//    <PTZControl ... size="lg" />
// ─────────────────────────────────────────────────────────────

import React, { useState } from 'react';

interface PTZPreset {
  label:       string;
  recallJoin?: number;
  saveJoin?:   number;
}

type PTZSize = 'sm' | 'md' | 'lg';

const PTZ_SIZES: Record<PTZSize, {
  joystick:        number;
  zoom:            number;
  presetHeight:    number;
  presetSaveWidth: number;
  iconFontSize:    number;
  homeFontSize:    number;
  labelFontSize:   number;
  smallFontSize:   number;
}> = {
  sm: { joystick: 36, zoom: 30, presetHeight: 26, presetSaveWidth: 30, iconFontSize: 14, homeFontSize: 8,  labelFontSize: 9,  smallFontSize: 8  },
  md: { joystick: 48, zoom: 40, presetHeight: 32, presetSaveWidth: 36, iconFontSize: 18, homeFontSize: 9,  labelFontSize: 11, smallFontSize: 9  },
  lg: { joystick: 64, zoom: 52, presetHeight: 40, presetSaveWidth: 44, iconFontSize: 24, homeFontSize: 11, labelFontSize: 13, smallFontSize: 11 },
};

interface PTZControlProps {
  panLeftJoin?:  number;
  panRightJoin?: number;
  tiltUpJoin?:   number;
  tiltDownJoin?: number;
  zoomInJoin?:   number;
  zoomOutJoin?:  number;
  homeJoin?:     number;
  showZoom?:     boolean;
  presets?:      PTZPreset[];
  size?:         PTZSize; // default: 'md'
  onPress?:      (join: number) => void;
  onRelease?:    (join: number) => void;
}

const PtzButton: React.FC<{
  label: string;
  join?: number;
  size: number;
  fontSize: number;
  onPress?: (j: number) => void;
  onRelease?: (j: number) => void;
  style?: React.CSSProperties;
}> = ({ label, join, size, fontSize, onPress, onRelease, style }) => {
  const [pressed, setPressed] = useState(false);
  return (
    <button
      onPointerDown={() => { setPressed(true); join && onPress?.(join); }}
      onPointerUp={() => { setPressed(false); join && onRelease?.(join); }}
      onPointerLeave={() => { setPressed(false); join && onRelease?.(join); }}
      style={{
        width: size, height: size,
        background: pressed ? 'var(--av-active-bg)' : 'var(--av-bg-elevated)',
        border: `1px solid ${pressed ? 'var(--av-active-border)' : 'var(--av-border-default)'}`,
        borderRadius: 'var(--av-radius-md)',
        color: pressed ? 'var(--av-active-text)' : 'var(--av-text-primary)',
        fontSize,
        cursor: 'pointer',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        userSelect: 'none', touchAction: 'none',
        transition: 'background 0.06s, border-color 0.06s',
        ...style,
      }}
    >
      {label}
    </button>
  );
};

export const PTZControl: React.FC<PTZControlProps> = ({
  panLeftJoin, panRightJoin, tiltUpJoin, tiltDownJoin,
  zoomInJoin, zoomOutJoin, homeJoin,
  showZoom = true,
  presets = [],
  size = 'md',
  onPress, onRelease,
}) => {
  const s = PTZ_SIZES[size];
  return (
    <div style={{ display: 'flex', gap: 'var(--av-gap-lg)', alignItems: 'center' }}>

      {/* Joystick grid */}
      <div style={{ display: 'grid', gridTemplateColumns: `repeat(3, ${s.joystick}px)`, gridTemplateRows: `repeat(3, ${s.joystick}px)`, gap: 4 }}>
        <div />
        <PtzButton label="▲" join={tiltUpJoin}   size={s.joystick} fontSize={s.iconFontSize} onPress={onPress} onRelease={onRelease} />
        <div />
        <PtzButton label="◀" join={panLeftJoin}  size={s.joystick} fontSize={s.iconFontSize} onPress={onPress} onRelease={onRelease} />
        {/* Center HOME button */}
        <button
          onPointerDown={() => homeJoin && onPress?.(homeJoin)}
          onPointerUp={() => homeJoin && onRelease?.(homeJoin)}
          style={{
            width: s.joystick, height: s.joystick,
            background: 'var(--av-bg-surface)',
            border: '1px solid var(--av-border-subtle)',
            borderRadius: 'var(--av-radius-md)',
            color: 'var(--av-text-muted)',
            fontSize: s.homeFontSize, fontWeight: 700, letterSpacing: '0.08em',
            cursor: 'pointer', userSelect: 'none',
          }}
        >
          {homeJoin && <span className="join-label" style={{ fontSize: 8, display: 'block', fontFamily: 'var(--av-font-mono)' }}>D{homeJoin}</span>}
          HOME
        </button>
        <PtzButton label="▶" join={panRightJoin} size={s.joystick} fontSize={s.iconFontSize} onPress={onPress} onRelease={onRelease} />
        <div />
        <PtzButton label="▼" join={tiltDownJoin} size={s.joystick} fontSize={s.iconFontSize} onPress={onPress} onRelease={onRelease} />
        <div />
      </div>

      {/* Zoom column */}
      {showZoom && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 4, alignItems: 'center' }}>
          <span style={{ fontSize: s.smallFontSize, color: 'var(--av-text-muted)', fontWeight: 600, letterSpacing: '0.1em' }}>ZOOM</span>
          <PtzButton label="＋" join={zoomInJoin}  size={s.zoom} fontSize={s.iconFontSize} onPress={onPress} onRelease={onRelease} />
          <PtzButton label="－" join={zoomOutJoin} size={s.zoom} fontSize={s.iconFontSize} onPress={onPress} onRelease={onRelease} />
        </div>
      )}

      {/* Presets column */}
      {presets.length > 0 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
          <span style={{ fontSize: s.smallFontSize, color: 'var(--av-text-muted)', fontWeight: 600, letterSpacing: '0.1em' }}>PRESETS</span>
          {presets.map((preset, i) => (
            <div key={i} style={{ display: 'flex', gap: 4 }}>
              {preset.saveJoin && (
                <button
                  onPointerDown={() => onPress?.(preset.saveJoin!)}
                  onPointerUp={() => onRelease?.(preset.saveJoin!)}
                  style={{
                    width: s.presetSaveWidth, height: s.presetHeight, fontSize: s.smallFontSize, fontWeight: 600,
                    background: 'var(--av-bg-elevated)', border: '1px solid var(--av-border-default)',
                    borderRadius: 'var(--av-radius-sm)', color: 'var(--av-amber)',
                    cursor: 'pointer', userSelect: 'none',
                  }}
                  title={`Save ${preset.label}`}
                >
                  SAVE
                </button>
              )}
              <button
                onPointerDown={() => preset.recallJoin && onPress?.(preset.recallJoin)}
                onPointerUp={() => preset.recallJoin && onRelease?.(preset.recallJoin)}
                style={{
                  flex: 1, height: s.presetHeight, fontSize: s.labelFontSize, fontWeight: 500, minWidth: 64,
                  background: 'var(--av-bg-elevated)', border: '1px solid var(--av-border-default)',
                  borderRadius: 'var(--av-radius-sm)', color: 'var(--av-text-primary)',
                  cursor: 'pointer', userSelect: 'none', padding: '0 8px',
                }}
              >
                {preset.label}
                {preset.recallJoin && (
                  <span className="join-label" style={{ display: 'block', fontSize: 8, fontFamily: 'var(--av-font-mono)' }}>D{preset.recallJoin}</span>
                )}
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
