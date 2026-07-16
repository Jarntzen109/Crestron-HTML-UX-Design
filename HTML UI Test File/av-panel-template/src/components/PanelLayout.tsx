// ─────────────────────────────────────────────────────────────
//  PanelLayout
//  Root canvas that enforces exact device pixel dimensions and
//  optionally shows a device-frame overlay during development.
//
//  Every page you build wraps its content in this component.
//  Change the device target in src/config/devices.ts and
//  everything snaps to the new resolution automatically.
//
//  COPY-PASTE USAGE:
//
//    function MyPage() {
//      return (
//        <PanelLayout>
//          {/* your page content here */}
//        </PanelLayout>
//      );
//    }
//
//  Dev frame (shows the panel outline during development):
//    <PanelLayout showDevFrame>
//
//  Orientation guard — portrait panels (TSW-570P) need a page built
//  for a tall/narrow canvas, not a resized landscape page. Declare
//  what this page was built for and get a warning if ACTIVE_DEVICE
//  doesn't match:
//    <PanelLayout expectOrientation="landscape">
// ─────────────────────────────────────────────────────────────

import React from 'react';
import { device } from '../config/devices';
import type { Orientation } from '../config/devices';

interface PanelLayoutProps {
  children:     React.ReactNode;
  showDevFrame?: boolean;
  padding?:     number;
  expectOrientation?: Orientation;
}

export const PanelLayout: React.FC<PanelLayoutProps> = ({
  children,
  showDevFrame = false,
  padding = 16,
  expectOrientation,
}) => {
  const orientationMismatch = expectOrientation !== undefined && expectOrientation !== device.orientation;

  return (
    /* Outer shell: centers the panel in the browser window during dev */
    <div style={{
      width: '100vw',
      height: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: '#050505',
      overflow: 'hidden',
    }}>
      {/* The panel canvas — exact device dimensions */}
      <div style={{
        width:    device.width,
        height:   device.height,
        background: 'var(--av-bg-page)',
        position: 'relative',
        overflow: 'hidden',
        flexShrink: 0,
        outline: showDevFrame ? `2px dashed rgba(74,158,255,0.3)` : 'none',
        outlineOffset: -2,
        padding,
        display: 'flex',
        flexDirection: 'column',
      }}>

        {/* Dev frame label */}
        {showDevFrame && (
          <div style={{
            position: 'absolute', top: 6, right: 10,
            fontSize: 10, color: 'rgba(74,158,255,0.5)',
            fontFamily: 'var(--av-font-mono)',
            letterSpacing: '0.06em',
            pointerEvents: 'none',
            zIndex: 9999,
          }}>
            {device.label} · {device.width}×{device.height}
          </div>
        )}

        {/* Orientation mismatch warning — this page was built for a
            different shape canvas than ACTIVE_DEVICE currently targets */}
        {orientationMismatch && (
          <div style={{
            position: 'absolute', inset: 0,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            background: 'rgba(20,4,4,0.92)',
            zIndex: 10000,
            padding: 24, textAlign: 'center',
          }}>
            <div>
              <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--av-red)', letterSpacing: '0.08em', marginBottom: 8 }}>
                ORIENTATION MISMATCH
              </div>
              <div style={{ fontSize: 11, color: 'var(--av-text-secondary)', maxWidth: 340 }}>
                This page was built for <b>{expectOrientation}</b>, but{' '}
                <b>{device.label}</b> ({device.width}×{device.height}) is{' '}
                <b>{device.orientation}</b>. Build a dedicated page for this
                device instead of reusing a page from the other orientation.
              </div>
            </div>
          </div>
        )}

        {children}
      </div>
    </div>
  );
};

// ─────────────────────────────────────────────────────────────
//  PageHeader
//  Top bar with page title and optional status indicator.
//
//  COPY-PASTE USAGE:
//    <PageHeader title="Camera Control" />
//    <PageHeader title="Audio" statusText="Connected" statusOk />
// ─────────────────────────────────────────────────────────────

interface PageHeaderProps {
  title:        string;
  statusText?:  string;
  statusOk?:    boolean;
  leftSlot?:    React.ReactNode;  // e.g. back button or nav
  rightSlot?:   React.ReactNode;  // e.g. clock or room label
}

export const PageHeader: React.FC<PageHeaderProps> = ({
  title,
  statusText,
  statusOk = true,
  leftSlot,
  rightSlot,
}) => {
  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginBottom: 16,
      flexShrink: 0,
    }}>
      <div style={{ minWidth: 160 }}>{leftSlot}</div>

      <h1 style={{
        fontSize: 22,
        fontWeight: 300,
        letterSpacing: '0.12em',
        color: 'var(--av-text-primary)',
        textTransform: 'uppercase',
        textAlign: 'center',
      }}>
        {title}
      </h1>

      <div style={{ minWidth: 160, display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: 8 }}>
        {statusText && (
          <div style={{
            display: 'flex', alignItems: 'center', gap: 6,
            background: 'var(--av-bg-elevated)',
            border: `1px solid ${statusOk ? 'var(--av-green-dim)' : 'var(--av-red-dim)'}`,
            borderRadius: 20, padding: '4px 10px',
          }}>
            <div style={{
              width: 6, height: 6, borderRadius: '50%',
              background: statusOk ? 'var(--av-green)' : 'var(--av-red)',
            }} />
            <span style={{ fontSize: 11, color: statusOk ? 'var(--av-green)' : 'var(--av-red)', fontWeight: 600 }}>
              {statusText}
            </span>
          </div>
        )}
        {rightSlot}
      </div>
    </div>
  );
};
