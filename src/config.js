export const API_BASE_URL = "https://pokeapi.co/api/v2";
export const SPRITE_BASE_URL =
  "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon";
// Generation V (Black & White) animated GIFs — available for national
// dex ids 1..976; newer DLC Pokémon 404, so callers must handle onError.
export const ANIMATED_SPRITE_URL =
  "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/versions/generation-v/black-white/animated";

// Deep, saturated "jewel" type colors — white badge text on every one
// (all pairs verified >= 4.5:1 WCAG AA). Shared by type chips, badges,
// move-detail headers and the detail-page stage tint.
export const TYPE_COLORS = {
  normal: "#6a768c",
  fire: "#b8431f",
  water: "#2870b5",
  electric: "#8f6106",
  grass: "#2f7d43",
  ice: "#0e7d99",
  fighting: "#b52e2e",
  poison: "#9a4cc7",
  ground: "#8f6530",
  flying: "#6f5cbb",
  psychic: "#b83a75",
  bug: "#5f7f24",
  rock: "#75644e",
  ghost: "#6a63a0",
  dragon: "#4f62d6",
  dark: "#645a4e",
  steel: "#5d7288",
  fairy: "#c2497a",
};

// All types in a stable, display-friendly order.
export const TYPE_LIST = [
  "normal",
  "fire",
  "water",
  "electric",
  "grass",
  "ice",
  "fighting",
  "poison",
  "ground",
  "flying",
  "psychic",
  "bug",
  "rock",
  "ghost",
  "dragon",
  "dark",
  "steel",
  "fairy",
];

// Highest National Dex number currently in the PokéAPI.
export const MAX_POKEMON_ID = 1025;

// A soft radial "stage" gradient for the detail-page sprite, mixed from the
// Pokémon's own types (primary + secondary when dual). This is the identity
// motif of the page: every Pokémon gets a stage tinted to its type, so the
// detail view is specific to the creature instead of a generic card.
export function stageGradients(pokemon) {
  const names = (pokemon.types || []).map((t) => t.type.name);
  const colors = names.map((n) => TYPE_COLORS[n] ?? "#9aa3b2");
  const c1 = colors[0];
  const c2 = colors[1] ?? c1;
  return {
    background: [
      "radial-gradient(120% 90% at 50% 8%, color-mix(in srgb, " +
        c1 + " 22%, transparent) 0%, transparent 55%)",
      "radial-gradient(90% 70% at 78% 88%, color-mix(in srgb, " +
        c2 + " 18%, transparent) 0%, transparent 50%)",
      "var(--sprite-bg)",
    ].join(", "),
  };
}
