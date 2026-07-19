// ─────────────────────────────────────────────────────────────
//  App.tsx
//
//  Switch between pages by changing the component rendered here.
//
//  During development, render <ComponentLibrary /> to browse
//  all available components. When building a specific page,
//  swap it to that page's component.
//
//  For multi-page panels, a programmer would add React Router
//  here and map routes to page components.
// ─────────────────────────────────────────────────────────────

import './styles/tokens.css';

// ── Import your pages ────────────────────────────────────────
import { ComponentLibrary } from './pages/ComponentLibrary';
import { ExampleRoomPage } from './pages/Example Room';
// Each new room gets its own import here, e.g.:
// import { CEOOfficePage } from './pages/CEOOffice'; ← doesn't exist yet, just an example

// ── CHANGE THIS LINE to switch what renders ──────────────────
//
//  Browse components:  <ComponentLibrary />
//  Specific page:       <ExampleRoomPage />
//
// Each page is a SEPARATE PANEL/BUILD — one processor, one room.
// Build with one active here, deploy, then switch and rebuild for
// the next room. This is not a multi-room router.
//
//const ACTIVE_PAGE = <ComponentLibrary />;
 const ACTIVE_PAGE = <ExampleRoomPage />;

// ─────────────────────────────────────────────────────────────

export default function App() {
  return ACTIVE_PAGE;
}
