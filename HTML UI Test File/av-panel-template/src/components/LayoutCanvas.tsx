// ─────────────────────────────────────────────────────────────
//  LayoutCanvas
//  Free-form drag-to-position canvas — the Construct-style
//  alternative to hand-writing flex/grid CSS. Wrap <Positioned>
//  components in this, flip on "Edit Layout", drag them where
//  you want, then "Copy Positions" to grab an updated
//  coordinates object to paste back into your page.
//
//  COPY-PASTE USAGE:
//
//    <PanelLayout>
//      <LayoutCanvas width={device.width - 32} height={device.height - 96}>
//        <Positioned id="camAudience" x={20} y={20} w={140} h={72}>
//          <AVButton label="Audience" joinNumber={1} />
//        </Positioned>
//      </LayoutCanvas>
//    </PanelLayout>
//
//  Grid snap defaults to 8px — pass grid={1} to disable snapping.
//  In a flex-column parent (like PanelLayout's content area),
//  LayoutCanvas stretches to fill by default; pass explicit
//  width/height for a fixed-size region instead.
// ─────────────────────────────────────────────────────────────

import React, { createContext, useCallback, useContext, useRef, useState } from 'react';

interface Rect { x: number; y: number; w: number; h: number; }

interface LayoutEditContextValue {
  editMode: boolean;
  grid: number;
  registerPosition: (id: string, rect: Rect) => void;
}

const LayoutEditContext = createContext<LayoutEditContextValue | null>(null);

export function useLayoutEdit() {
  return useContext(LayoutEditContext);
}

interface LayoutCanvasProps {
  children: React.ReactNode;
  width?: number | string;
  height?: number | string;
  grid?: number;
}

export const LayoutCanvas: React.FC<LayoutCanvasProps> = ({
  children,
  width = '100%',
  height = '100%',
  grid = 8,
}) => {
  const [editMode, setEditMode] = useState(false);
  const [copied, setCopied] = useState(false);
  const positions = useRef<Record<string, Rect>>({});

  const registerPosition = useCallback((id: string, rect: Rect) => {
    positions.current[id] = rect;
  }, []);

  const copyPositions = async () => {
    const lines = Object.entries(positions.current)
      .map(([id, r]) => `  ${id}: { x: ${r.x}, y: ${r.y}, w: ${r.w}, h: ${r.h} },`)
      .join('\n');
    const code = `const POSITIONS = {\n${lines}\n};`;
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      // clipboard blocked (e.g. insecure context) — fall back to console
      console.log(code);
    }
  };

  return (
    <LayoutEditContext.Provider value={{ editMode, grid, registerPosition }}>
      <div style={{
        position: 'relative',
        width, height,
        flex: '1 1 auto',
        minHeight: 0,
        border: '1px solid var(--av-border-subtle)',
        borderRadius: 'var(--av-radius-sm)',
      }}>
        <div style={{
          position: 'absolute', inset: 0,
          backgroundImage: editMode
            ? 'linear-gradient(to right, var(--av-border-subtle) 1px, transparent 1px), linear-gradient(to bottom, var(--av-border-subtle) 1px, transparent 1px)'
            : 'none',
          backgroundSize: `${grid}px ${grid}px`,
        }}>
          {children}
        </div>

        {/* Edit mode controls — dev-only, strip before deploy */}
        <div style={{ position: 'absolute', top: 4, right: 4, display: 'flex', gap: 6, zIndex: 9999 }}>
          <button
            onClick={() => setEditMode(v => !v)}
            style={{
              fontSize: 10, padding: '4px 8px', borderRadius: 4,
              border: `1px solid ${editMode ? 'var(--av-accent)' : 'var(--av-border-default)'}`,
              background: editMode ? 'var(--av-active-bg)' : 'var(--av-bg-elevated)',
              color: editMode ? 'var(--av-active-text)' : 'var(--av-text-secondary)',
              cursor: 'pointer', fontFamily: 'var(--av-font-mono)',
            }}
          >
            {editMode ? '✓ Edit Layout' : 'Edit Layout'}
          </button>
          {editMode && (
            <button
              onClick={copyPositions}
              style={{
                fontSize: 10, padding: '4px 8px', borderRadius: 4,
                border: '1px solid var(--av-border-default)',
                background: 'var(--av-bg-elevated)', color: 'var(--av-text-secondary)',
                cursor: 'pointer', fontFamily: 'var(--av-font-mono)',
              }}
            >
              {copied ? 'Copied!' : 'Copy Positions'}
            </button>
          )}
        </div>
      </div>
    </LayoutEditContext.Provider>
  );
};
