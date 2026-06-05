// ─────────────────────────────────────────────────────────────
//  GroupBox
//  Labeled border container — like the "Cameras" and
//  "Camera Mode" panels in VTPro. Drop any components inside.
//
//  COPY-PASTE USAGE:
//
//    <GroupBox title="Cameras">
//      <AVButton label="Audience" joinNumber={1} />
//      <AVButton label="Presenter" joinNumber={2} />
//    </GroupBox>
//
//    With fixed width:
//    <GroupBox title="Camera Mode" width={160}>
//      ...
//    </GroupBox>
//
//    With a row layout inside:
//    <GroupBox title="Display Mode" direction="row">
//      ...
//    </GroupBox>
// ─────────────────────────────────────────────────────────────

import React from 'react';

interface GroupBoxProps {
  title?:     string;
  children:   React.ReactNode;
  width?:     number | string;
  minWidth?:  number | string;
  direction?: 'column' | 'row';
  gap?:       string;
  padding?:   string;
  style?:     React.CSSProperties;
}

export const GroupBox: React.FC<GroupBoxProps> = ({
  title,
  children,
  width,
  minWidth,
  direction = 'column',
  gap = 'var(--av-gap-sm)',
  padding = '12px',
  style,
}) => {
  return (
    <div style={{
      position: 'relative',
      border: '1px solid var(--av-border-default)',
      borderRadius: 'var(--av-radius-lg)',
      padding,
      paddingTop: title ? '18px' : padding,
      width,
      minWidth,
      display: 'flex',
      flexDirection: direction,
      gap,
      ...style,
    }}>
      {title && (
        <div style={{
          position: 'absolute',
          top: '-9px',
          left: '12px',
          background: 'var(--av-bg-page)',
          padding: '0 6px',
          fontSize: '10px',
          fontWeight: 600,
          letterSpacing: '0.1em',
          color: 'var(--av-text-muted)',
          textTransform: 'uppercase',
          whiteSpace: 'nowrap',
        }}>
          {title}
        </div>
      )}
      {children}
    </div>
  );
};
