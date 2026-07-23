// Type declarations for window.CrComLib — loaded globally via the
// <script src="/cr-com-lib.js"> tag in index.html, not an ES import
// (the @crestron/ch5-crcomlib package ships UMD-only, no module entry
// point — see index.html for why). Signatures match the real ones in
// node_modules/@crestron/ch5-crcomlib/build_bundles/umd/@types.

type CrComLibSignalType = 'boolean' | 'b' | 'number' | 'numeric' | 'n' | 'string' | 's' | 'object' | 'o';
type CrComLibSignalValue = boolean | number | string | object;

interface CrComLib {
  publishEvent: (signalType: CrComLibSignalType, signalName: string, value: CrComLibSignalValue) => void;
  subscribeState: (
    signalType: CrComLibSignalType,
    signalName: string,
    callback: (value: any) => void,
  ) => string;
  unsubscribeState: (signalType: CrComLibSignalType, signalName: string, subscriptionId: string) => void;
}

interface Window {
  CrComLib: CrComLib;
}
