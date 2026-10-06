import { SPRITE_BASE_URL } from "./config.js";

export function getIdFromUrl(url) {
  // url looks like "https://pokeapi.co/api/v2/pokemon/25/"
  const parts = url.split("/").filter(Boolean);
  return parts[parts.length - 1];
}

export function capitalize(name) {
  return name.charAt(0).toUpperCase() + name.slice(1);
}

export function getSpriteUrl(id) {
  return `${SPRITE_BASE_URL}/${id}.png`;
}

export function formatStatName(name) {
  // "special-attack" -> "Special Attack"
  return name
    .split("-")
    .map(capitalize)
    .join(" ");
}

// Stats run up to ~150 for common Pokémon; cap the bar at 100%.
export function statBarWidth(baseStat) {
  return Math.min(100, Math.round((baseStat / 150) * 100));
}

export function formatMoveName(name) {
  // "flame-burst" -> "Flame Burst"
  return formatStatName(name);
}

// Sum of the six base stats, for the "total" readout on the detail page.
export function baseStatTotal(pokemon) {
  return (pokemon.stats || []).reduce((sum, s) => sum + s.base_stat, 0);
}
