// ─────────────────────────────────────────────────────────────
//  Positioned
//  Drag-to-place wrapper for absolute pixel positioning inside
//  a <LayoutCanvas>. Works like Construct's free-form canvas:
//  drop a component in, drag it where you want, copy the
//  resulting coordinates back into your page source.
//
//  COPY-PASTE USAGE:
//
//    const POSITIONS = {
//      camAudience: { x: 20, y: 20, w: 140, h: 72 },
//    };
//
//    <LayoutCanvas>
//      <Positioned id="camAudience" {...POSITIONS.camAudience}>
//        <AVButton label="Audience" joinNumber={1} />
//      </Positioned>
//    </LayoutCanvas>
//
//  Click "Edit Layout" in the canvas corner to drag components
//  around (snaps to an 8px grid by default), then
//  "Copy Positions" to grab an updated POSITIONS object to
//  paste back into your page file.
// ─────────────────────────────────────────────────────────────

import React, { useEffect, useRef, useState } from 'react';
import { useLayoutEdit } from './LayoutCanvas';

interface PositionedProps {
  id: string;
  x: number;
  y: number;
  w: number;
  h: number;
  children: React.ReactNode;
}

export const Positioned: React.FC<PositionedProps> = ({ id, x, y, w, h, children }) => {
  const ctx = useLayoutEdit();
  const [pos, setPos] = useState({ x, y });
  const dragging = useRef<{ startX: number; startY: number; origX: number; origY: number } | null>(null);

  useEffect(() => {
    ctx?.registerPosition(id, { x: pos.x, y: pos.y, w, h });
  }, [pos.x, pos.y, w, h, id, ctx]);

  const snap = (v: number) => {
    const g = ctx?.grid ?? 1;
    return Math.round(v / g) * g;
  };

  const onPointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!ctx?.editMode) return;
    e.currentTarget.setPointerCapture(e.pointerId);
    dragging.current = { startX: e.clientX, startY: e.clientY, origX: pos.x, origY: pos.y };
  };

  const onPointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!dragging.current) return;
    const dx = e.clientX - dragging.current.startX;
    const dy = e.clientY - dragging.current.startY;
    setPos({
      x: snap(dragging.current.origX + dx),
      y: snap(dragging.current.origY + dy),
    });
  };

  const onPointerUp = () => {
    dragging.current = null;
  };

  return (
    <div
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      style={{
        position: 'absolute',
        left: pos.x,
        top: pos.y,
        width: w,
        height: h,
        cursor: ctx?.editMode ? 'grab' : 'default',
        outline: ctx?.editMode ? '1px dashed var(--av-accent)' : 'none',
        outlineOffset: 2,
        touchAction: 'none',
      }}
    >
      <div style={{ width: '100%', height: '100%', pointerEvents: ctx?.editMode ? 'none' : 'auto' }}>
        {children}
      </div>
      {ctx?.editMode && (
        <div style={{
          position: 'absolute', top: -16, left: 0,
          fontSize: 9, fontFamily: 'var(--av-font-mono)',
          color: 'var(--av-accent)', whiteSpace: 'nowrap',
          pointerEvents: 'none',
        }}>
          {id} · x{pos.x} y{pos.y}
        </div>
      )}
    </div>
  );
};
