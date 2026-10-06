import { useState, useEffect, useMemo } from "react";
import { Link } from "react-router-dom";
import { API_BASE_URL, TYPE_COLORS } from "../config.js";
import { capitalize, getSpriteUrl } from "../utils.js";

const PAGE_SIZE = 20;

function SkeletonList() {
  return (
    <div className="pokemon-list" aria-hidden="true">
      {Array.from({ length: PAGE_SIZE }, (_, i) => (
        <div key={i} className="pokemon-card skeleton">
          <span className="skeleton-sprite" />
          <span className="skeleton-text skeleton-id" />
          <span className="skeleton-text skeleton-name" />
        </div>
      ))}
    </div>
  );
}

function PokemonList({ selectedType = null }) {
  const [page, setPage] = useState(1);
  const [pokemons, setPokemons] = useState([]);
  const [total, setTotal] = useState(0);
  const [typeNames, setTypeNames] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let isCurrent = true;
    setIsLoading(true);
    setError(null);

    async function load() {
      try {
        if (selectedType) {
          // The /pokemon list endpoint cannot filter by type, so fetch the
          // type's Pokémon roster from /type/{name} and paginate locally.
          const response = await fetch(`${API_BASE_URL}/type/${selectedType}`);
          if (!response.ok) {
            throw new Error(`Server responded with status ${response.status}`);
          }
          const data = await response.json();
          const names = Array.from(
            new Set((data.pokemon || []).map((entry) => entry.pokemon.name)),
          );
          if (isCurrent) {
            setTypeNames(names);
            setTotal(names.length);
            setPokemons([]);
          }
        } else {
          // No filter: server-side pagination over the whole dex.
          const offset = (page - 1) * PAGE_SIZE;
          const response = await fetch(
            `${API_BASE_URL}/pokemon?limit=${PAGE_SIZE}&offset=${offset}`,
          );
          if (!response.ok) {
            throw new Error(
              `Server responded with status ${response.status}`,
            );
          }
          const data = await response.json();
          if (isCurrent) {
            setPokemons(data.results);
            setTotal(data.count);
            setTypeNames([]);
          }
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

    load();
    return () => {
      isCurrent = false;
    };
  }, [page, selectedType]);

  // Reset to page 1 whenever the filter changes.
  useEffect(() => {
    setPage(1);
  }, [selectedType]);

  // Client-side page slice when a type filter is active.
  const pageSlice = useMemo(() => {
    if (!selectedType) return [];
    const start = (page - 1) * PAGE_SIZE;
    return typeNames.slice(start, start + PAGE_SIZE);
  }, [selectedType, page, typeNames]);

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const cards = selectedType ? pageSlice : pokemons;

  if (error) {
    return (
      <div className="retry-box">
        <p className="status status-error">Couldn't load the list: {error}</p>
        <button
          className="pagination-btn"
          onClick={() => {
            setError(null);
            setPage(1);
          }}
        >
          Try again
        </button>
      </div>
    );
  }

  return (
    <>
      <div className="list-header">
        <span className="list-count">
          {selectedType ? `${capitalize(selectedType)} type · ` : ""}
          Page {page} of {totalPages}
        </span>
        {!isLoading && total === 0 && (
          <span className="list-empty">No Pokémon found.</span>
        )}
      </div>

      {isLoading ? (
        <SkeletonList />
      ) : cards.length === 0 ? (
        <p className="status">No Pokémon found for this filter.</p>
      ) : (
        <div className="pokemon-list">
          {cards.map((item, index) => {
            // cards is either a name string (type mode) or a result object.
            const name = typeof item === "string" ? item : item.name;
            // For type mode we only know the name; fetch-free id via the
            // sprite fallback is not available, so look it up lazily.
            return <TypeCard key={name} name={name} index={index} />;
          })}
        </div>
      )}

      {!isLoading && total > 0 && (
        <div className="pagination">
          <button
            className="pagination-btn"
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
          >
            ← Prev
          </button>
          <span className="pagination-info">
            {page} / {totalPages}
          </span>
          <button
            className="pagination-btn"
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
          >
            Next →
          </button>
        </div>
      )}
    </>
  );
}

function TypeCard({ name, index }) {
  // Type mode gives us the name without an id; fetch just the details we
  // need (id + sprite + types) to keep the card consistent with the
  // unfiltered view.
  const [info, setInfo] = useState(null);

  useEffect(() => {
    let isCurrent = true;
    fetch(`${API_BASE_URL}/pokemon/${name}`)
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (isCurrent && data) {
          setInfo({
            id: data.id,
            types: (data.types || []).map((t) => t.type.name),
          });
        }
      })
      .catch(() => {});
    return () => {
      isCurrent = false;
    };
  }, [name]);

  return (
    <Link
      to={`/pokemon/${name}`}
      className="pokemon-card"
      style={{ "--i": index }}
    >
      {info ? (
        <img
          className="pokemon-sprite"
          src={getSpriteUrl(info.id)}
          alt={capitalize(name)}
          width={84}
          height={84}
          loading="lazy"
        />
      ) : (
        <span className="skeleton-sprite" style={{ margin: "0 auto" }} />
      )}
      <span className="pokemon-id">
        {info ? `#${String(info.id).padStart(3, "0")}` : "···"}
      </span>
      <span className="pokemon-name">{capitalize(name)}</span>
      {info && info.types.length > 0 ? (
        <span className="card-type-dots" aria-hidden="true">
          {info.types.slice(0, 2).map((type) => (
            <span
              key={type}
              className="type-dot"
              style={{ background: TYPE_COLORS[type] ?? "#6a768c" }}
              title={capitalize(type)}
            />
          ))}
        </span>
      ) : null}
    </Link>
  );
}

export default PokemonList;
