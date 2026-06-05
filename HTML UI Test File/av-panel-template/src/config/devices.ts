// ─────────────────────────────────────────────────────────────
//  DEVICE TARGET CONFIGURATION
//  Change ACTIVE_DEVICE to retarget the whole UI
// ─────────────────────────────────────────────────────────────

export type DeviceTarget = 'ts1070' | 'tst1080' | 'ipad10' | 'ipad9';

export const DEVICE_PROFILES: Record<DeviceTarget, {
  label: string;
  width: number;
  height: number;
  fontScale: number;
  borderRadius: number;
}> = {
  ts1070: {
    label: 'Crestron TS-1070',
    width: 1280,
    height: 800,
    fontScale: 1.0,
    borderRadius: 6,
  },
  tst1080: {
    label: 'Crestron TST-1080',
    width: 1280,
    height: 800,
    fontScale: 1.0,
    borderRadius: 6,
  },
  ipad10: {
    label: 'iPad 10th Gen (landscape)',
    width: 1180,
    height: 820,
    fontScale: 1.05,
    borderRadius: 10,
  },
  ipad9: {
    label: 'iPad 9th Gen (landscape)',
    width: 1080,
    height: 810,
    fontScale: 1.0,
    borderRadius: 10,
  },
};

// ← CHANGE THIS ONE LINE TO RETARGET THE WHOLE UI
export const ACTIVE_DEVICE: DeviceTarget = 'ts1070';

export const device = DEVICE_PROFILES[ACTIVE_DEVICE];
