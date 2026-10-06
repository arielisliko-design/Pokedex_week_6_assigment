import { Outlet, Link } from "react-router-dom";
import ThemeToggle from "./ThemeToggle.jsx";

// Classic pokéball mark — the visual identity of the app. Colours come
// from theme variables so it adapts to light/dark automatically.
function PokeballMark() {
  return (
    <svg
      className="pokeball-mark"
      viewBox="0 0 40 40"
      width="40"
      height="40"
      aria-hidden="true"
    >
      <circle cx="20" cy="20" r="18" fill="var(--card-bg)" />
      <path d="M2 20a18 18 0 0 1 36 0Z" fill="var(--accent)" />
      <line x1="2" y1="20" x2="38" y2="20" stroke="var(--text-main)" strokeWidth="2.5" />
      <circle cx="20" cy="20" r="18" fill="none" stroke="var(--text-main)" strokeWidth="2.5" />
      <circle cx="20" cy="20" r="5.5" fill="var(--card-bg)" stroke="var(--text-main)" strokeWidth="2.5" />
    </svg>
  );
}

function Layout() {
  return (
    <div className="app">
      <header className="app-header">
        <div className="app-header-row">
          <div className="brand">
            <Link to="/" className="app-title-link">
              <PokeballMark />
              <h1>
                <span className="accent">Poké</span>Dex Mini
              </h1>
            </Link>
            <p className="header-sub">
              Search &amp; explore Pokémon — stat bars, moves and live
              animation. Data by PokéAPI.
            </p>
          </div>
          <ThemeToggle />
        </div>
      </header>
      <main>
        <Outlet />
      </main>
      <footer className="app-footer">
        Data &amp; sprites by PokéAPI — an unofficial fan project
      </footer>
    </div>
  );
}

export default Layout;
