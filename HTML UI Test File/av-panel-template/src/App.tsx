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
import { ComponentLibrary }   from './pages/ComponentLibrary';
import { CameraControlPage }  from './pages/CameraControl';
import { TrainingRoomPage }   from './pages/TrainingRoom';

// ── CHANGE THIS LINE to switch what renders ──────────────────
//
//  Browse components:  <ComponentLibrary />
//  Specific page:       <CameraControlPage />
//                        <TrainingRoomPage />
//
const ACTIVE_PAGE = <TrainingRoomPage />;
// const ACTIVE_PAGE = <ComponentLibrary />;
// const ACTIVE_PAGE = <CameraControlPage />;

// ─────────────────────────────────────────────────────────────

export default function App() {
  return ACTIVE_PAGE;
}
