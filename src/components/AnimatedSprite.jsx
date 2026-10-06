import { useState } from "react";
import { ANIMATED_SPRITE_URL, SPRITE_BASE_URL } from "../config.js";
import { capitalize } from "../utils.js";

// Shows the Pokémon as an animated GIF ("live video") with a fallback to
// the static official artwork when the animation doesn't exist (newer
// DLC Pokémon 404 on the Gen V animated sprite set).
function AnimatedSprite({ pokemon }) {
  const id = Number(pokemon.id);
  const [failed, setFailed] = useState(false);

  const gifUrl = `${ANIMATED_SPRITE_URL}/${id}.gif`;
  const fallbackUrl =
    pokemon.sprites.other?.["official-artwork"]?.front_default ||
    pokemon.sprites.front_default ||
    `${SPRITE_BASE_URL}/${id}.png`;

  return (
    <div className="animated-panel">
      <img
        className="animated-sprite"
        src={failed ? fallbackUrl : gifUrl}
        alt={`${capitalize(pokemon.name)} ${failed ? "artwork" : "animation"}`}
        onError={() => setFailed(true)}
      />
      <p className="animated-caption">
        {failed
          ? "Official artwork (no animation available for this Pokémon)"
          : "▶ Live animation"}
      </p>
    </div>
  );
}

export default AnimatedSprite;
