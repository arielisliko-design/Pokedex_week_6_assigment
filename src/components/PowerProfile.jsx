import { buildPowerProfile } from "../data/powerLore.js";

function PowerProfile({ pokemon, species }) {
  const profile = buildPowerProfile(pokemon, species);

  return (
    <div className="power-section">
      <div className="section-divider" aria-hidden="true">
        <span className="divider-ball" />
      </div>
      <p className="power-tagline">{profile.tagline}</p>

      <div className="power-duo">
        <div className="power-card">
          <span className="power-card-icon" aria-hidden="true">
            🌿
          </span>
          <h3 className="power-card-title">When at rest</h3>
          <p className="power-card-text">{profile.calmText}</p>
        </div>

        <div className="power-card power-card--powered">
          <span className="power-card-icon" aria-hidden="true">
            ⚔️
          </span>
          <h3 className="power-card-title">When powering up</h3>
          <p className="power-card-text">{profile.poweredText}</p>
        </div>
      </div>

      {profile.flavor?.text && (
        <blockquote className="power-flavor">
          <p>{profile.flavor.text}</p>
          <cite>{profile.flavor.cite}</cite>
        </blockquote>
      )}
    </div>
  );
}

export default PowerProfile;
