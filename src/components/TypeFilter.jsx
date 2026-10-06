import { TYPE_LIST, TYPE_COLORS } from "../config.js";
import { capitalize } from "../utils.js";

function TypeFilter({ selected, onSelect }) {
  return (
    <div className="type-filter" role="tablist" aria-label="Filter by type">
      <button
        className={
          "type-chip" +
          (selected === null ? " type-chip--active" : "")
        }
        style={
          selected === null
            ? {
                background: "var(--accent)",
                borderColor: "var(--accent)",
              }
            : undefined
        }
        onClick={() => onSelect(null)}
      >
        All
      </button>
      {TYPE_LIST.map((type) => (
        <button
          key={type}
          className={
            "type-chip" +
            (selected === type ? " type-chip--active" : "")
          }
          style={{
            background: selected === type ? TYPE_COLORS[type] : "transparent",
            color: selected === type ? "#fff" : undefined,
          }}
          onClick={() => onSelect(selected === type ? null : type)}
        >
          {capitalize(type)}
        </button>
      ))}
    </div>
  );
}

export default TypeFilter;
