import { useState } from "react";
import { useNavigate } from "react-router-dom";
import SearchForm from "../components/SearchForm.jsx";
import PokemonList from "../components/PokemonList.jsx";
import TypeFilter from "../components/TypeFilter.jsx";
import { API_BASE_URL, MAX_POKEMON_ID } from "../config.js";
import { capitalize } from "../utils.js";

function ListPage() {
  const [selectedType, setSelectedType] = useState(null);
  const [isSurprising, setIsSurprising] = useState(false);
  const navigate = useNavigate();

  function handleSurprise() {
    if (isSurprising) return;
    setIsSurprising(true);

    const go = (name) => {
      if (name) navigate(`/pokemon/${name}`);
    };

    if (selectedType) {
      // Random within the filtered type (roster comes from /type/{name}).
      fetch(`${API_BASE_URL}/type/${selectedType}`)
        .then((res) => res.json())
        .then((data) => {
          const names = Array.from(
            new Set((data.pokemon || []).map((entry) => entry.pokemon.name)),
          );
          const pick =
            names.length > 0
              ? names[Math.floor(Math.random() * names.length)]
              : null;
          go(pick);
          setIsSurprising(false);
        })
        .catch(() => setIsSurprising(false));
    } else {
      const randomId = Math.floor(Math.random() * MAX_POKEMON_ID) + 1;
      fetch(`${API_BASE_URL}/pokemon/${randomId}`)
        .then((res) => res.json())
        .then((data) => go(data && data.name))
        .catch(() => {});
      setIsSurprising(false);
    }
  }

  return (
    <>
      <SearchForm />
      <TypeFilter
        selected={selectedType}
        onSelect={setSelectedType}
      />
      <button
        className="surprise-btn"
        onClick={handleSurprise}
        disabled={isSurprising}
      >
        🎲 Surprise me — random{" "}
        {selectedType ? capitalize(selectedType) : "Pokémon"}
      </button>
      <PokemonList selectedType={selectedType} />
    </>
  );
}

export default ListPage;
