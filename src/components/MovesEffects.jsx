import { useState, useEffect, useMemo } from "react";
import { API_BASE_URL, TYPE_COLORS } from "../config.js";
import { capitalize, formatMoveName } from "../utils.js";

const MAX_VISIBLE = 18;

// Numeric id of a version-group entry. The API only ships {name, url},
// so the id must be parsed out of the url (.../version-group/21/ -> 21).
function versionGroupId(group) {
  return Number((group?.url || "").split("/").filter(Boolean).pop());
}

// Same parsing for effect entries' version_group.
function versionGroupNum(group) {
  const match = /version-group\/(\d+)/.exec(group?.url || "");
  return match ? Number(match[1]) : 0;
}

// Newest version group this Pokémon appears in = its "current" move list.
function buildMoveNames(pokemon) {
  const groups = (pokemon.moves || []).flatMap(
    (m) => m.version_group_details,
  );
  if (groups.length === 0) return { moveNames: [], totalMoves: 0 };

  const latestGroup = Math.max(
    ...groups.map((d) => versionGroupId(d.version_group)),
  );
  const names = new Set();
  for (const m of pokemon.moves || []) {
    if (
      m.version_group_details.some(
        (d) => versionGroupId(d.version_group) === latestGroup,
      )
    ) {
      names.add(m.move.name);
    }
  }
  const moveNames = [...names];
  return { moveNames, totalMoves: moveNames.length };
}

function pickEffect(move) {
  const entries = (move.effect_entries || []).filter(
    (e) =>
      (e.language?.name === "en" || e.language === "en") &&
      e.effect &&
      e.effect.trim(),
  );
  if (entries.length === 0) return null;
  entries.sort((a, b) => versionGroupNum(b.version_group) - versionGroupNum(a.version_group));
  return entries[0].effect.replace(/\n+/g, " ").trim();
}

function MoveDetailPanel({ moveName, onDone }) {
  const [move, setMove] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let isCurrent = true;
    setIsLoading(true);
    setError(null);
    setMove(null);

    fetch(`${API_BASE_URL}/move/${moveName}`)
      .then((res) => {
        if (!res.ok) throw new Error(`Status ${res.status}`);
        return res.json();
      })
      .then((data) => {
        if (isCurrent) setMove(data);
      })
      .catch((err) => {
        if (isCurrent) setError(err.message);
      })
      .finally(() => {
        if (isCurrent) setIsLoading(false);
      });

    return () => {
      isCurrent = false;
    };
  }, [moveName]);

  if (isLoading) {
    return <p className="move-detail-status">Loading move…</p>;
  }

  if (error) {
    return (
      <p className="move-detail-status move-detail-status--error">{error}</p>
    );
  }

  const type = move.type?.name || "normal";
  const typeBg = TYPE_COLORS[type] ?? "#9aa3b2";
  const power = move.power;
  const pp = move.pp;
  const accuracy =
    move.accuracy === null ? "Always hits" : `${move.accuracy}%`;
  const effect = pickEffect(move);

  return (
    <div className="move-detail">
      <div className="move-detail-head">
        <span className="type-badge" style={{ background: typeBg }}>
          {capitalize(type)}
        </span>
        <span className="move-detail-name">{formatMoveName(moveName)}</span>
        <button
          className="move-detail-close"
          onClick={onDone}
          aria-label="Close move details"
        >
          ✕
        </button>
      </div>

      <div className="move-detail-stats">
        <span className="move-detail-stat">
          <span className="move-detail-stat-label">Power</span>
          <span>{power}</span>
        </span>
        {pp !== null && pp !== undefined && (
          <span className="move-detail-stat">
            <span className="move-detail-stat-label">PP</span>
            <span>{pp}</span>
          </span>
        )}
        <span className="move-detail-stat">
          <span className="move-detail-stat-label">Accuracy</span>
          <span>{accuracy}</span>
        </span>
      </div>

      {effect && <p className="move-detail-effect">{effect}</p>}
    </div>
  );
}

function MovesEffects({ pokemon }) {
  const [selected, setSelected] = useState(null);
  const [showAll, setShowAll] = useState(false);

  const { moveNames, totalMoves } = useMemo(
    () => buildMoveNames(pokemon),
    [pokemon],
  );
  const visible = showAll ? moveNames : moveNames.slice(0, MAX_VISIBLE);

  if (moveNames.length === 0) {
    return null;
  }

  return (
    <div className="moves-section">
      <div className="section-divider" aria-hidden="true">
        <span className="divider-ball" />
      </div>
      <h2 className="section-title">Moves &amp; effects</h2>
      <p className="section-hint">
        Tap a move to see what it does ({totalMoves} total).
      </p>

      <div className="move-chips">
        {visible.map((name) => (
          <button
            key={name}
            className={
              "move-chip" + (selected === name ? " move-chip--active" : "")
            }
            onClick={() => setSelected(selected === name ? null : name)}
          >
            {formatMoveName(name)}
          </button>
        ))}
      </div>

      {totalMoves > MAX_VISIBLE && (
        <button
          className="show-all-btn"
          onClick={() => setShowAll((s) => !s)}
        >
          {showAll ? "Show less" : `Show all ${totalMoves} moves`}
        </button>
      )}

      {selected && (
        <MoveDetailPanel moveName={selected} onDone={() => setSelected(null)} />
      )}
    </div>
  );
}

export default MovesEffects;
