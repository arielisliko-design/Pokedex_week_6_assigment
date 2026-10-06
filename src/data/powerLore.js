import { capitalize, formatStatName } from "../utils.js";

// Short, evocative lore for each type — calm state vs. full-power state.
// Kept deliberately concise so two lines per state fit a calm layout.
export const TYPE_LORE = {
  normal: {
    calm: "It moves at its own easy pace, power coiled inside with no visible edge.",
    powered: "Raw kinetic force is unleashed — pure, unelemental impact that never slows down.",
  },
  fire: {
    calm: "Its flames drop to a gentle ember; it looks sleepy and warm, hiding a furnace beneath the skin.",
    powered: "The body catches fire and roars; the hotter it burns, the faster and fiercer it becomes.",
  },
  water: {
    calm: "It drifts on the current, calm as a still pond, barely making a ripple.",
    powered: "Pressure builds into crushing tides; the mist turns cold and the waves refuse to break.",
  },
  electric: {
    calm: "Charge drains away slowly; it dozes with harmless static crackling around it.",
    powered: "The air snaps and crackles — a flash of lightning that lands before the enemy can blink.",
  },
  grass: {
    calm: "It sips sunlight lazily, resting among the leaves with a slow, patient pulse.",
    powered: "Leaves harden into blades; solar energy surges through vines, thorns, and roots at once.",
  },
  ice: {
    calm: "It floats on a quiet stillness, the cold around it peaceful rather than deadly.",
    powered: "Breath turns to blizzard; every touch is instant frost and every movement cuts the air.",
  },
  fighting: {
    calm: "Disciplined and still, its strength is held tight like a coiled spring waiting to be released.",
    powered: "Every muscle locks into place — the strikes come rapid, heavy, and impossible to stop.",
  },
  poison: {
    calm: "Toxins circulate slowly; it seems lazy, but the air around it already hangs heavy.",
    powered: "Its whole body becomes the weapon — every scratch, bite, and touch carries the venom.",
  },
  ground: {
    calm: "It stands with heavy, quiet feet; its power stays buried, dormant, and deeply rooted.",
    powered: "The earth trembles — impacts and shockwaves open the ground beneath the enemy's feet.",
  },
  flying: {
    calm: "It glides on the wind with half-closed wings, light, high, and completely at ease.",
    powered: "Wings beat hard and the wind turns into a storm no one can track or dodge.",
  },
  psychic: {
    calm: "Thoughts are quiet; it sits still, watching everything without touching anything.",
    powered: "The mind becomes the weapon — the enemy's will crumbles and space itself bends.",
  },
  bug: {
    calm: "It moves soft through the grass; its strength lies in stealth, numbers, and camouflage.",
    powered: "Swarm instinct takes over — relentless, sharp, and harder to break than it looks.",
  },
  rock: {
    calm: "It looks like a living stone, heavy, patient, and completely unbothered.",
    powered: "Its body turns to living rock; the harder it hits, the harder it becomes.",
  },
  ghost: {
    calm: "It dissolves into a quiet mist, unnoticed, drifting peacefully out of the light.",
    powered: "The mist condenses into dread; a cold that chills the blood before the first move is even seen.",
  },
  dragon: {
    calm: "Ancient power sleeps behind its eyes; it moves with a slow, quiet authority.",
    powered: "The primal aura wakes — fire and wind obey it, and every move arrives like a storm.",
  },
  dark: {
    calm: "It hides in the shadow, quiet and patient, reading the room without being read.",
    powered: "The shadow moves first; its strikes are silent, certain, and never seen coming.",
  },
  steel: {
    calm: "Its body rests cold and heavy — a quiet, immoveable wall of metal.",
    powered: "The whole body becomes a fortress; the metal is so hard that nothing ordinary breaks through.",
  },
  fairy: {
    calm: "Soft light rings around it; it moves gently, like it is dancing to itself.",
    powered: "Grace turns into radiance; every move lands as an enchantment the enemy cannot shrug off.",
  },
};

// Human labels for the six base stats, used when writing power lines.
export const STAT_LABELS = {
  "hp": "Stamina",
  "attack": "raw power",
  "defense": "guard",
  "special-attack": "technique power",
  "special-defense": "resistance",
  "speed": "speed",
};

// Builds a compact power profile from the pokemon + species payloads:
// { tagline, calmText, poweredText, flavor }
export function buildPowerProfile(pokemon, species) {
  const lore = TYPE_LORE[pokemon.types[0].type.name] ?? TYPE_LORE.normal;

  // Highest stat (excluding HP, which is treated separately as stamina).
  const combatStats = (pokemon.stats || []).filter(
    (s) => s.stat.name !== "hp",
  );
  const top = combatStats.reduce((a, b) =>
    b.base_stat > a.base_stat ? b : a,
  );
  const topLabel = formatStatName(top.stat.name);
  const topValue = top.base_stat;

  const calmText = `${lore.calm} Even at rest, its ${topLabel.toLowerCase()} of ${topValue} never sleeps.`;
  const poweredText = `${lore.powered} In battle mode, that ${topLabel.toLowerCase()} of ${topValue} becomes the weapon.`;

  const tagline = `${capitalize(
    pokemon.types.map((t) => t.type.name).join(" & "),
  )} · strongest in ${topLabel} (${topValue})`;

  return {
    tagline,
    calmText,
    poweredText,
    flavor: getFlavorText(species),
  };
}

// Map a game version name to its generation number (for picking the
// newest flavor text). Flavor entries in the species payload carry
// `version`, not `generation`.
const VERSION_GENERATION = {
  red: 1,
  blue: 1,
  yellow: 2,
  gold: 2,
  silver: 2,
  crystal: 2,
  ruby: 3,
  sapphire: 3,
  emerald: 3,
  firered: 3,
  leafgreen: 3,
  diamond: 4,
  pearl: 4,
  platinum: 4,
  heartgold: 4,
  soulsilver: 4,
  black: 5,
  white: 5,
  "black-2": 5,
  "white-2": 5,
  x: 6,
  y: 6,
  "omega-ruby": 6,
  "alpha-sapphire": 6,
  sun: 7,
  moon: 7,
  "ultra-sun": 7,
  "ultra-moon": 7,
  "lets-go-pikachu": 7,
  "lets-go-eevee": 7,
  sword: 8,
  shield: 8,
  "legends-arceus": 9,
};

// Latest-generation English flavor text from the SPECIES payload
// (the /pokemon endpoint no longer ships flavor_text_entries).
// Returns { text, cite } where cite is the version name (e.g. "Sword").
export function getFlavorText(species) {
  if (!species) return { text: null, cite: "Pokédex" };
  // language may be a string ("en") or an object ({name:"en",url:...}).
  const isEn = (lang) =>
    lang === "en" || (lang && typeof lang === "object" && lang.name === "en");
  // The API lists entries oldest-first, so fall back to list position
  // when a version is unknown (keeps the newest entry winning).
  const entries = (species.flavor_text_entries || [])
    .filter((e) => isEn(e.language) && e.flavor_text && e.flavor_text.trim())
    .map((e, i) => ({
      e,
      rank: VERSION_GENERATION[e.version?.name] ?? i,
      index: i,
    }))
    .sort((a, b) => b.rank - a.rank || b.index - a.index);
  if (entries.length === 0) return { text: null, cite: "Pokédex" };
  const first = entries[0].e;
  const text = first.flavor_text
    .replace(/[\f\n\r]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
  return {
    text: text || null,
    cite: capitalize(
      first.version.name.replace(/-/g, " ") || "Pokédex",
    ),
  };
}
