import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { capitalize } from "../utils.js";

const STORAGE_KEY = "pokedex-recent";
const MAX_ITEMS = 6;
const EVENT_NAME = "pokedex-history-change";

function readHistory() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

// Records a search name into recent history (dedup, capped), then
// notifies any mounted SearchHistory to refresh.
export function useSearchRecord() {
  const record = useCallback((name) => {
    try {
      const current = readHistory();
      const next = [name, ...current.filter((n) => n !== name)].slice(
        0,
        MAX_ITEMS,
      );
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      window.dispatchEvent(new CustomEvent(EVENT_NAME));
    } catch {
      // localStorage unavailable — skip silently
    }
  }, []);
  return record;
}

function SearchHistory() {
  const [items, setItems] = useState(readHistory);
  const navigate = useNavigate();

  useEffect(() => {
    function refresh() {
      setItems(readHistory());
    }
    window.addEventListener(EVENT_NAME, refresh);
    window.addEventListener("storage", refresh);
    return () => {
      window.removeEventListener(EVENT_NAME, refresh);
      window.removeEventListener("storage", refresh);
    };
  }, []);

  function clear() {
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch {
      // ignore
    }
    setItems([]);
    window.dispatchEvent(new CustomEvent(EVENT_NAME));
  }

  if (items.length === 0) return null;

  return (
    <div className="search-history">
      <span className="search-history-label">Recent</span>
      <div className="search-history-chips">
        {items.map((name) => (
          <button
            key={name}
            className="history-chip"
            onClick={() => navigate(`/pokemon/${name}`)}
          >
            {capitalize(name)}
          </button>
        ))}
        <button
          className="history-chip history-chip--clear"
          onClick={clear}
          title="Clear recent searches"
        >
          ✕
        </button>
      </div>
    </div>
  );
}

export default SearchHistory;
