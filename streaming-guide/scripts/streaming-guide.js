import { fetchAnimesByGenre } from "./anime-genres-data.js";

document.addEventListener("DOMContentLoaded", () => {
  initImageCarousel();
  highlightCurrentNav();
  setupFilterEvents();
  setupResetButton();
  setupSearchEnterKey();
  updateFooterInfo();
});

let currentPage = 1;

// =======================
// Image Carousel
// =======================
function initImageCarousel() {
  const images = document.querySelectorAll(".image-container img");
  let currentIndex = 0;

  function showImages() {
    const imageContainer = document.querySelector(".image-container");
    if (!imageContainer || images.length === 0) return;
    currentIndex = (currentIndex + 1) % images.length;
    const offset = -currentIndex * 200;
    imageContainer.style.transform = `translateX(${offset}px)`;
  }

  setInterval(showImages, 3000);
  showImages();
}

// =======================
// Navigation Highlight
// =======================
function highlightCurrentNav() {
  const currentPath = window.location.pathname.replace(/^\//, "");
  const navLinks = document.querySelectorAll(".navigation-home a");

  navLinks.forEach((link) => {
    if (currentPath.endsWith(link.getAttribute("href"))) {
      link.classList.add("active");
      link.style.backgroundColor = "white";
      link.style.color = "black";
    }
  });
}

// =======================
// Reset Button
// =======================
function setupResetButton() {
  const resetBtn = document.getElementById("reset-filters");
  if (!resetBtn) return;

  resetBtn.addEventListener("click", () => {
    document.getElementById("search-input").value = "";
    document.getElementById("type-filter").value = "";
    document.getElementById("results-filter").value = "";
    document.getElementById("results-container").innerHTML = "";

    const genreInputs = [
      "genre-movie-filter",
      "genre-series-filter",
      "anime-genre-filter",
    ];
    genreInputs.forEach((id) => {
      const el = document.getElementById(id);
      if (el) el.value = "";
    });

    currentPage = 1;
  });
}

// =======================
// Setup Enter Key
// =======================
function setupSearchEnterKey() {
  const input = document.getElementById("search-input");
  const applyBtn = document.getElementById("apply-filters");
  if (!input || !applyBtn) return;

  input.addEventListener("keypress", (e) => {
    if (e.key === "Enter") {
      applyBtn.click();
    }
  });
}

// =======================
// Filter Events
// =======================
function setupFilterEvents() {
  const applyBtn = document.getElementById("apply-filters");
  if (!applyBtn) return;

  applyBtn.addEventListener("click", async () => {
    const query = document.getElementById("search-input").value.trim();
    const type = document.getElementById("type-filter").value;
    let genre = "";

    if (type === "movie") {
      genre = document.getElementById("genre-movie-filter").value;
    } else if (type === "series") {
      genre = document.getElementById("genre-series-filter").value;
    } else if (type === "anime") {
      genre = document.getElementById("anime-genre-filter").value;
    }

    const resultsLimit = document.getElementById("results-filter").value || 10;

    if (!query && !type && !genre) {
      alert("Fill in at least one filter to search.");
      return;
    }

    currentPage = 1;

    if (type === "anime") {
      await fetchFromAnilist(query, genre, resultsLimit, currentPage);
    } else {
      const resolvedType = type || "tv";
      await fetchFromTMDb(query, resolvedType, genre, resultsLimit, currentPage);
    }
  });
}

// =======================
// Fetch from Anilist
// =======================
async function fetchFromAnilist(query, genre, limit = 10, page = 1) {
  const animes = await fetchAnimesByGenre(genre || "", limit, query, page); // Modificado para permitir busca sem gênero
  if (!animes || animes.length === 0) {
    alert("No results found.");
    return;
  }

  const formatted = await Promise.all(
    animes.map(async (item) => {
      const title = item.title.english || item.title.romaji;
      const platforms = await fetchAnimePlatformsFromTMDb(title);

      return {
        fromAnilist: true,
        title,
        imageUrl: item.coverImage.medium,
        synopsis: item.description || "No synopsis available.",
        rating: item.averageScore ? `${item.averageScore}/100` : "",
        platforms: platforms.length > 0
          ? platforms.join(", ")
          : "This content doesn't seem to be classified on popular platforms, but perhaps it can be found online.",
      };
    })
  );

  renderResults(formatted, "anilist", limit);
}

// =======================
// Fetch platforms from TMDb (for anime)
// =======================
async function fetchAnimePlatformsFromTMDb(title) {
  const apiKey = import.meta.env.VITE_TMDB_API_KEY;

  try {
    const searchUrl = `https://api.themoviedb.org/3/search/tv?api_key=${apiKey}&language=en-US&query=${encodeURIComponent(title)}`;
    const searchRes = await fetch(searchUrl);
    const searchData = await searchRes.json();

    if (!searchData.results || searchData.results.length === 0) return [];

    const anime = searchData.results[0];
    const providersUrl = `https://api.themoviedb.org/3/tv/${anime.id}/watch/providers?api_key=${apiKey}`;
    const providersRes = await fetch(providersUrl);
    const providersData = await providersRes.json();

    const country = 'US';
    const regionData = providersData.results?.[country];

    if (!regionData) return [];

    const providerList = [
      ...(regionData.flatrate || []),
      ...(regionData.buy || []),
      ...(regionData.rent || []),
    ];

    const uniqueProviders = [...new Set(providerList.map(p => p.provider_name))];

    return uniqueProviders;
  } catch (err) {
    console.error("Error when searching for anime platforms:", err);
    return [];
  }
}

// =======================
// Fetch from TMDb (Movies and Series)
// =======================
async function fetchFromTMDb(query, type, genre, limit = 10, page = 1) {
  const apiKey = import.meta.env.VITE_TMDB_API_KEY;

  const useDiscover = genre || !query;
  const endpoint = `https://api.themoviedb.org/3/${useDiscover ? "discover" : "search"}/${type === "movie" ? "movie" : "tv"}`;

  const params = new URLSearchParams({
    api_key: apiKey,
    language: "en-US",
    page: page.toString(),
  });

  if (useDiscover) {
    if (genre) params.append("with_genres", genre);
  } else {
    params.append("query", query);
  }

  const url = `${endpoint}?${params.toString()}`;

  try {
    const response = await fetch(url);
    const data = await response.json();

    if (!data.results || data.results.length === 0) {
      alert("No results found.");
      return;
    }

    const items = data.results.slice(0, limit);

    const detailedItems = await Promise.all(
      items.map(async (item) => {
        try {
          const [platformsRes, ratingRes] = await Promise.all([
            fetch(`https://api.themoviedb.org/3/${type}/${item.id}/watch/providers?api_key=${apiKey}`),
            fetch(`https://api.themoviedb.org/3/${type}/${item.id}/release_dates?api_key=${apiKey}`),
          ]);

          const platformsData = await platformsRes.json();
          const ratingData = await ratingRes.json();

          const platforms = platformsData.results?.US?.flatrate?.map((p) => p.provider_name) || [];

          let certification = "";
          if (ratingData.results) {
            const usRating = ratingData.results.find((r) => r.iso_3166_1 === "US");
            certification = usRating?.release_dates?.[0]?.certification || "";
          }

          return { ...item, platforms, certification };
        } catch (error) {
          console.warn("Error when searching for details:", error);
          return { ...item, platforms: [], certification: "" };
        }
      })
    );

    renderResults(detailedItems, "tmdb", limit);
  } catch (err) {
    console.error("Error when searching TMDb:", err);
    alert("There was an error fetching the data.");
  }
}

// =======================
// Render Results (com paginação dupla)
// =======================
function renderResults(items, source, limit = 10) {
  const container = document.getElementById("results-container");
  if (!container) return;

  container.innerHTML = "";

  // Paginação no topo
  container.appendChild(createPaginationButtons(items.length >= limit));

  items.forEach((item) => {
    let title = "";
    let imageUrl = "";
    let synopsis = "";
    let platforms = "";
    let rating = "";

    if (source === "anilist") {
      title = item.title;
      imageUrl = item.imageUrl;
      synopsis = item.synopsis;
      rating = item.rating ? `<p><strong>Score:</strong> ${item.rating}</p>` : "";
      platforms = `<p class="platform-info"><strong>Platforms:</strong> ${item.platforms}</p>`;
    } else if (source === "tmdb") {
      title = item.title || item.name;
      imageUrl = item.poster_path
        ? `https://image.tmdb.org/t/p/w342${item.poster_path}`
        : "";
      synopsis = item.overview || "No synopsis available.";
      platforms =
        item.platforms?.length > 0
          ? `<p class="platform-info"><strong>Platforms:</strong> ${item.platforms.join(", ")}</p>`
          : `<p class="platform-info">This content doesn't seem to be classified on popular platforms, but perhaps it can be found online.</p>`;
      rating = item.certification
        ? `<p><strong>Rating:</strong> ${item.certification}</p>`
        : "";
    }

    const card = document.createElement("div");
    card.classList.add("result-card");
    card.innerHTML = `
      <img src="${imageUrl}" alt="${title}" class="result-image" />
      <div class="result-info">
        <h3>${title}</h3>
        <p>${synopsis}</p>
        ${rating}
        ${platforms}
      </div>
    `;

    container.appendChild(card);
  });

  // Paginação no final
  container.appendChild(createPaginationButtons(items.length >= limit));
}

// =======================
// Criação de botões de paginação
// =======================
function createPaginationButtons(hasNextPage = true) {
  const pagination = document.createElement("div");
  pagination.className = "pagination-buttons";

  pagination.innerHTML = `
    <button id="prev-page" ${currentPage === 1 ? "disabled" : ""}>← Voltar</button>
    <span>Page ${currentPage}</span>
    <button id="next-page" ${!hasNextPage ? "disabled" : ""}>→ Próximo</button>
  `;

  // Eventos
  setTimeout(() => {
    const prev = pagination.querySelector("#prev-page");
    const next = pagination.querySelector("#next-page");

    if (prev) {
      prev.addEventListener("click", () => {
        if (currentPage > 1) {
          currentPage--;
          reapplyFilters();
        }
      });
    }

    if (next) {
      next.addEventListener("click", () => {
        currentPage++;
        reapplyFilters();
      });
    }
  }, 0);

  return pagination;
}

// =======================
// Reapply Filters (Pagination)
// =======================
function reapplyFilters() {
  const query = document.getElementById("search-input").value.trim();
  const type = document.getElementById("type-filter").value;
  let genre = "";

  if (type === "movie") {
    genre = document.getElementById("genre-movie-filter").value;
  } else if (type === "series") {
    genre = document.getElementById("genre-series-filter").value;
  } else if (type === "anime") {
    genre = document.getElementById("anime-genre-filter").value;
  }

  const resultsLimit = document.getElementById("results-filter").value || 10;

  if (type === "anime") {
    fetchFromAnilist(query, genre, resultsLimit, currentPage);
  } else {
    fetchFromTMDb(query, type, genre, resultsLimit, currentPage);
  }
}
