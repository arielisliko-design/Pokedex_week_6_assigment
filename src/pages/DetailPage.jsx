import { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import {
  API_BASE_URL,
  TYPE_COLORS,
  MAX_POKEMON_ID,
  stageGradients,
} from "../config.js";
import {
  capitalize,
  formatStatName,
  statBarWidth,
  baseStatTotal,
} from "../utils.js";
import PowerProfile from "../components/PowerProfile.jsx";
import AnimatedSprite from "../components/AnimatedSprite.jsx";
import MovesEffects from "../components/MovesEffects.jsx";

function TypeBadge({ type }) {
  const name = capitalize(type);
  const bg = TYPE_COLORS[type] ?? "#9aa3b2";
  return (
    <span className="type-badge" style={{ background: bg }}>
      {name}
    </span>
  );
}

function DetailSkeleton() {
  return (
    <div className="detail-grid">
      <div className="detail-card" aria-hidden="true">
        <span className="skeleton-detail-sprite" />
        <span className="skeleton-text skeleton-detail-id" />
        <span className="skeleton-text skeleton-detail-title" />
      </div>
      <div className="detail-card detail-data-card" aria-hidden="true">
        <span className="skeleton-text skeleton-detail-title" style={{ width: 120 }} />
        <ul className="stat-list">
          {Array.from({ length: 6 }, (_, i) => (
            <li key={i}>
              <div className="stat-top">
                <span className="skeleton-text skeleton-stat-name" />
              </div>
              <div className="stat-bar">
                <div
                  className="stat-bar-fill"
                  style={{ width: "40%" }}
                />
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

function DetailPage() {
  const { name } = useParams();
  const navigate = useNavigate();
  const [pokemon, setPokemon] = useState(null);
  const [species, setSpecies] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [neighbors, setNeighbors] = useState({ prev: null, next: null });

  useEffect(() => {
    let isCurrent = true;
    async function loadPokemon() {
      setIsLoading(true);
      setError(null);
      setPokemon(null);
      setSpecies(null);

      try {
        const response = await fetch(`${API_BASE_URL}/pokemon/${name}`);
        if (!response.ok) {
          throw new Error(`No Pokémon named “${name}” — check the spelling.`);
        }
        const data = await response.json();
        if (isCurrent) {
          setPokemon(data);
          // Species payload carries the official flavor text (Pokédex entry).
          fetch(`${API_BASE_URL}/pokemon-species/${name}`)
            .then((res) => (res.ok ? res.json() : null))
            .then((sp) => {
              if (isCurrent && sp) setSpecies(sp);
            })
            .catch(() => {});
        }
      } catch (err) {
        if (isCurrent) {
          setError(err.message);
        }
      } finally {
        if (isCurrent) {
          setIsLoading(false);
        }
      }
    }

    loadPokemon();
    return () => {
      isCurrent = false;
    };
  }, [name]);

  // Load the neighboring Pokémon names for the prev/next bar (cheap:
  // only fetch when the loaded Pokémon has an id).
  useEffect(() => {
    if (!pokemon || !pokemon.id) return;
    let isCurrent = true;
    const id = Number(pokemon.id);
    const loadName = (n) =>
      fetch(`${API_BASE_URL}/pokemon/${n}`)
        .then((res) => (res.ok ? res.json() : null))
        .then((data) => data && data.name)
        .catch(() => null);

    Promise.all([loadName(id - 1), loadName(id + 1)]).then(([prev, next]) => {
      if (isCurrent) {
        setNeighbors({
          prev: id - 1 >= 1 ? prev : null,
          next: id + 1 <= MAX_POKEMON_ID ? next : null,
        });
      }
    });

    return () => {
      isCurrent = false;
    };
  }, [pokemon]);

  if (isLoading) {
    return (
      <div className="detail-page">
        <DetailSkeleton />
      </div>
    );
  }

  if (error) {
    return (
      <div className="detail-page">
        <p className="status status-error">{error}</p>
        <Link to="/" className="back-link">← Back to list</Link>
      </div>
    );
  }

  const id = Number(pokemon.id);
  const spriteUrl =
    pokemon.sprites.front_default ||
    pokemon.sprites.other.default.front_default;
  const height = pokemon.height / 10;
  const weight = pokemon.weight / 10;
  const abilities = (pokemon.abilities || []).map(
    (a) => capitalize(a.ability.name.replace("-", " ")),
  );
  const total = baseStatTotal(pokemon);
  const primaryType = pokemon.types?.[0]?.type?.name;
  const stageStyle = {
    ...stageGradients(pokemon),
    "--stage-color": TYPE_COLORS[primaryType] ?? "var(--accent)",
  };

  return (
    <div className="detail-page">
      <Link to="/" className="back-link">← Back to list</Link>

      <div className="detail-grid">
        <div className="detail-card detail-identity-card">
          <div className="stage" style={stageStyle}>
            <img
              className="detail-sprite"
              src={spriteUrl}
              alt={capitalize(name)}
            />
          </div>

          <p className="detail-id">#{String(id).padStart(3, "0")}</p>
          <h1 className="detail-name">{capitalize(name)}</h1>

          <div className="type-row">
            {pokemon.types.map((t) => (
              <TypeBadge key={t.type.name} type={t.type.name} />
            ))}
          </div>

          <div className="detail-meta">
          <div className="detail-meta-item">
            <span className="detail-meta-label">Height</span>
            <span className="detail-meta-value">{height} m</span>
          </div>
          <div className="detail-meta-item">
            <span className="detail-meta-label">Weight</span>
            <span className="detail-meta-value">{weight} kg</span>
          </div>
          {abilities.length > 0 && (
            <div className="detail-meta-item detail-meta-item--full">
              <span className="detail-meta-label">Abilities</span>
              <span className="detail-meta-value">{abilities.join(", ")}</span>
            </div>
          )}
          </div>
        </div>

        <div className="detail-card detail-data-card">
          <AnimatedSprite pokemon={pokemon} />

          <div className="stat-head">
            <h2 className="section-title">Base stats</h2>
            <div className="stat-total">
              <span className="stat-total-label">Total</span>
              <span className="stat-total-value">{total}</span>
            </div>
          </div>

          <ul className="stat-list">
            {pokemon.stats.map((s) => (
              <li key={s.stat.name}>
                <div className="stat-top">
                  <span className="stat-name">{formatStatName(s.stat.name)}</span>
                  <span className="stat-value">{s.base_stat}</span>
                </div>
                <div className="stat-bar">
                  <div
                    className="stat-bar-fill"
                    style={{ width: `${statBarWidth(s.base_stat)}%` }}
                  />
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <PowerProfile pokemon={pokemon} species={species} />

      <MovesEffects pokemon={pokemon} />

      <div className="detail-nav">
          <button
            className="detail-nav-btn"
            disabled={!neighbors.prev}
            onClick={() =>
              neighbors.prev &&
              navigate(`/pokemon/${neighbors.prev}`)
            }
          >
            ← {neighbors.prev ? capitalize(neighbors.prev) : "Start"}
          </button>
          <button
            className="detail-nav-btn"
            disabled={!neighbors.next}
            onClick={() =>
              neighbors.next &&
              navigate(`/pokemon/${neighbors.next}`)
            }
          >
            {neighbors.next ? capitalize(neighbors.next) : "End"} →
          </button>
        </div>
    </div>
  );
}

export default DetailPage;
