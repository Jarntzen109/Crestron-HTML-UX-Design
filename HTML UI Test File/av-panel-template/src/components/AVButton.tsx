// ─────────────────────────────────────────────────────────────
//  AVButton
//  The workhorse button component. Covers 90% of panel use cases.
//
//  COPY-PASTE USAGE:
//
//  Momentary (fires on press, releases on let-go):
//    <AVButton label="Lights On" joinNumber={1} variant="momentary" />
//
//  Toggle (stays active until pressed again):
//    <AVButton label="Mute" joinNumber={5} variant="toggle" />
//
//  Select (one active at a time — use inside <AVButtonGroup>):
//    <AVButtonGroup>
//      <AVButton label="HDMI 1" joinNumber={10} variant="select" />
//      <AVButton label="HDMI 2" joinNumber={11} variant="select" />
//    </AVButtonGroup>
//
//  Danger/Success color variants:
//    <AVButton label="Power Off" joinNumber={50} variant="toggle" color="danger" />
//    <AVButton label="Power On"  joinNumber={51} variant="toggle" color="success" />
//
//  Sizes: "sm" | "md" | "lg"  (default: "md")
//  ─────────────────────────────────────────────────────────────

import React, { useState } from 'react';

export type AVButtonVariant = 'momentary' | 'toggle' | 'select';
export type AVButtonColor   = 'default' | 'danger' | 'success' | 'accent';
export type AVButtonSize    = 'sm' | 'md' | 'lg';

interface AVButtonProps {
  label:        string;
  subLabel?:    string;          // second line of text
  joinNumber?:  number;          // digital join — shown as dev hint, wired by programmer
  variant?:     AVButtonVariant; // default: 'momentary'
  color?:       AVButtonColor;   // default: 'default'
  size?:        AVButtonSize;    // default: 'md'
  active?:      boolean;         // controlled active state (from CH5 feedback join)
  onPress?:     () => void;      // called on press
  onRelease?:   () => void;      // called on release (momentary only)
  disabled?:    boolean;
  style?:       React.CSSProperties;
  className?:   string;
}

const heights: Record<AVButtonSize, string> = {
  sm: 'var(--av-btn-height-sm)',
  md: 'var(--av-btn-height-md)',
  lg: 'var(--av-btn-height-lg)',
};

const fontSizes: Record<AVButtonSize, string> = {
  sm: '11px',
  md: '13px',
  lg: '15px',
};

export const AVButton: React.FC<AVButtonProps> = ({
  label,
  subLabel,
  joinNumber,
  variant = 'momentary',
  color = 'default',
  size = 'md',
  active: controlledActive,
  onPress,
  onRelease,
  disabled = false,
  style,
  className = '',
}) => {
  const [internalActive, setInternalActive] = useState(false);
  const isActive = controlledActive !== undefined ? controlledActive : internalActive;

  const handlePointerDown = () => {
    if (disabled) return;
    if (variant === 'toggle') setInternalActive(v => !v);
    if (variant === 'momentary') setInternalActive(true);
    onPress?.();
  };

  const handlePointerUp = () => {
    if (disabled) return;
    if (variant === 'momentary') {
      setInternalActive(false);
      onRelease?.();
    }
  };

  const colorStyles = (): React.CSSProperties => {
    if (isActive) {
      if (color === 'danger')  return { background: 'var(--av-red-dim)',   borderColor: 'var(--av-red)',   color: 'var(--av-red)' };
      if (color === 'success') return { background: 'var(--av-green-dim)', borderColor: 'var(--av-green)', color: 'var(--av-green)' };
      return { background: 'var(--av-active-bg)', borderColor: 'var(--av-active-border)', color: 'var(--av-active-text)' };
    }
    if (color === 'danger')  return { color: 'var(--av-red)' };
    if (color === 'success') return { color: 'var(--av-green)' };
    return {};
  };

  return (
    <button
      className={`av-btn-base ${className}`}
      onPointerDown={handlePointerDown}
      onPointerUp={handlePointerUp}
      onPointerLeave={handlePointerUp}
      disabled={disabled}
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        height: heights[size],
        width: '100%',
        background: 'var(--av-bg-elevated)',
        borderWidth: '1px',
        borderStyle: 'solid',
        borderColor: 'var(--av-border-default)',
        borderRadius: 'var(--av-radius-md)',
        color: 'var(--av-text-primary)',
        fontSize: fontSizes[size],
        fontWeight: 500,
        fontFamily: 'var(--av-font)',
        cursor: disabled ? 'not-allowed' : 'pointer',
        opacity: disabled ? 0.4 : 1,
        userSelect: 'none',
        WebkitUserSelect: 'none',
        touchAction: 'none',
        transition: 'background 0.08s, border-color 0.08s, color 0.08s',
        gap: '2px',
        padding: '6px 10px',
        ...colorStyles(),
        ...style,
      }}
    >
      <span>{label}</span>
      {subLabel && (
        <span style={{ fontSize: '10px', color: 'inherit', opacity: 0.7 }}>{subLabel}</span>
      )}
      {joinNumber !== undefined && (
        <span className="join-label" style={{ fontSize: '9px', fontFamily: 'var(--av-font-mono)', marginTop: '2px' }}>
          D{joinNumber}
        </span>
      )}
    </button>
  );
};

// ─────────────────────────────────────────────────────────────
//  AVButtonGroup
//  Wraps AVButton children so only one can be active at a time.
//
//  COPY-PASTE USAGE (uncontrolled — group tracks its own selection):
//    <AVButtonGroup columns={2}>
//      <AVButton label="HDMI 1" joinNumber={10} variant="select" />
//      <AVButton label="HDMI 2" joinNumber={11} variant="select" />
//      <AVButton label="Teams"  joinNumber={12} variant="select" />
//    </AVButtonGroup>
//
//  CONTROLLED BY CH5 FEEDBACK — pass activeIndex so the highlighted
//  button reflects your program's actual select join, not just the
//  last thing pressed on screen. Use onSelect to publish the join:
//    <AVButtonGroup
//      activeIndex={sourceFeedbackIndex}
//      onSelect={(i) => CrComLib.publishEvent('boolean', String(10 + i), true)}
//    >
//      <AVButton label="HDMI 1" joinNumber={10} variant="select" />
//      <AVButton label="HDMI 2" joinNumber={11} variant="select" />
//      <AVButton label="Teams"  joinNumber={12} variant="select" />
//    </AVButtonGroup>
//
//  Each button's own onPress (if set) still fires before onSelect.
//  Default initial selection is index 0 — pass defaultActiveIndex={null}
//  for no selection until feedback arrives.
// ─────────────────────────────────────────────────────────────

interface AVButtonGroupProps {
  columns?: number;
  children: React.ReactNode;
  style?: React.CSSProperties;
  activeIndex?: number | null;        // controlled — drive from CH5 feedback join
  defaultActiveIndex?: number | null; // uncontrolled initial selection (default: 0)
  onSelect?: (index: number) => void; // fired when a button in the group is pressed
}

export const AVButtonGroup: React.FC<AVButtonGroupProps> = ({
  columns = 1,
  children,
  style,
  activeIndex: controlledActiveIndex,
  defaultActiveIndex = 0,
  onSelect,
}) => {
  const [internalActiveIndex, setInternalActiveIndex] = useState<number | null>(defaultActiveIndex);
  const activeIndex = controlledActiveIndex !== undefined ? controlledActiveIndex : internalActiveIndex;

  const wrappedChildren = React.Children.map(children, (child, index) => {
    if (!React.isValidElement(child)) return child;
    const childProps = child.props as AVButtonProps;
    return React.cloneElement(child as React.ReactElement<AVButtonProps>, {
      active: activeIndex === index,
      onPress: () => {
        childProps.onPress?.();
        if (controlledActiveIndex === undefined) setInternalActiveIndex(index);
        onSelect?.(index);
      },
      variant: 'select',
    });
  });

  return (
    <div style={{
      display: 'grid',
      gridTemplateColumns: `repeat(${columns}, 1fr)`,
      gap: 'var(--av-gap-sm)',
      ...style,
    }}>
      {wrappedChildren}
    </div>
  );
};
