import { animeGenres } from "./anime-genres-data.js";

document.addEventListener("DOMContentLoaded", () => {
  const genreSelect = document.getElementById("anime-genre-filter");

  if (genreSelect) {
    genreSelect.innerHTML = `<option value="">Genre (Animes)</option>`;

    animeGenres.forEach((genre) => {
      const option = document.createElement("option");
      option.value = genre;
      option.textContent = genre;
      genreSelect.appendChild(option);
    });
  } else {
    console.warn("Elemento #anime-genre-filter não encontrado.");
  }
});
