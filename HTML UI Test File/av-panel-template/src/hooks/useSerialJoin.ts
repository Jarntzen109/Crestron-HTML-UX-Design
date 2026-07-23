// ─────────────────────────────────────────────────────────────
//  useSerialJoin
//  Subscribes to a serial (string) join and returns its current value.
//  Returns null until the processor actually sends something — same
//  "unknown until proven otherwise" approach as the boolean feedback
//  in TrainingRoom.tsx (a room name that's briefly blank while the
//  processor is still coming up looks broken; falling back to a
//  default text until real data arrives reads as intentional).
//
//  COPY-PASTE USAGE:
//
//    const roomName = useSerialJoin(1) ?? 'Training Room';
//    <PageHeader title={roomName} />
//
//  Works for any serial-driven text, not just a room name — a status
//  message, a video call ID, whatever your program sends as a string.
// ─────────────────────────────────────────────────────────────

import { useEffect, useState } from 'react';

export function useSerialJoin(joinNumber: number): string | null {
  const [value, setValue] = useState<string | null>(null);

  useEffect(() => {
    // CrComLib fires the callback synchronously on subscribe, even for a
    // join nothing has ever sent to — with '' (empty string), not null.
    // Treat that the same as "nothing yet" so a fallback default (`??`)
    // at the call site actually applies instead of silently losing to ''.
    const id = window.CrComLib.subscribeState('string', String(joinNumber), (v: string) => {
      setValue(v || null);
    });
    return () => window.CrComLib.unsubscribeState('string', String(joinNumber), id);
  }, [joinNumber]);

  return value;
}
