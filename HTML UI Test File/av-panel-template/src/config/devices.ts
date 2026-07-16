// ─────────────────────────────────────────────────────────────
//  DEVICE TARGET CONFIGURATION
//  Change ACTIVE_DEVICE to retarget the whole UI
// ─────────────────────────────────────────────────────────────

export type DeviceTarget = 'ts570' | 'ts570p' | 'ts770' | 'ts880' | 'ts1070' | 'ts1080';
export type Orientation = 'landscape' | 'portrait';

// Resolutions verified against Crestron's published specs (docs.crestron.com).
// PPI varies more than you'd expect across this lineup (186–294 ppi) — fontScale
// is a rough per-device multiplier to compensate if you wire it into your
// component sizing; it isn't applied automatically anywhere yet.
export const DEVICE_PROFILES: Record<DeviceTarget, {
  label: string;
  width: number;
  height: number;
  orientation: Orientation;
  fontScale: number;
  borderRadius: number;
}> = {
  ts570: {
    label: 'Crestron TSW-570',       // 5.0 in, 16:9 HD720, ~294 ppi
    width: 1280,
    height: 720,
    orientation: 'landscape',
    fontScale: 1.3,
    borderRadius: 4,
  },
  ts570p: {
    label: 'Crestron TSW-570P (Portrait)', // 5.0 in, 16:9 HD720 portrait, ~294 ppi
    width: 720,
    height: 1280,
    orientation: 'portrait',
    fontScale: 1.3,
    borderRadius: 4,
  },
  ts770: {
    label: 'Crestron TS-770',        // 7.0 in, 16:10 WXGA, ~216 ppi
    width: 1280,
    height: 800,
    orientation: 'landscape',
    fontScale: 1.0,
    borderRadius: 6,
  },
  ts880: {
    label: 'Crestron TS-880',        // 8.1 in, 16:10 WXGA, ~186 ppi
    width: 1280,
    height: 800,
    orientation: 'landscape',
    fontScale: 0.9,
    borderRadius: 6,
  },
  ts1070: {
    label: 'Crestron TS-1070',       // 10.1 in, 16:10 WUXGA, ~224 ppi
    width: 1920,
    height: 1200,
    orientation: 'landscape',
    fontScale: 1.0,
    borderRadius: 8,
  },
  ts1080: {
    label: 'Crestron TS-1080 / TST-1080', // 10.1 in, 16:10 WUXGA, ~224 ppi
    width: 1920,
    height: 1200,
    orientation: 'landscape',
    fontScale: 1.0,
    borderRadius: 8,
  },
};

// ← CHANGE THIS ONE LINE TO RETARGET THE WHOLE UI
export const ACTIVE_DEVICE: DeviceTarget = 'ts1070';

export const device = DEVICE_PROFILES[ACTIVE_DEVICE];
