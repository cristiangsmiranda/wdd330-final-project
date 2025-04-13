const ANILIST_API_URL = "https://graphql.anilist.co";

// Query GraphQL para os animes mais populares da semana
const query = `
  query {
    Page(perPage: 20) {
      media(type: ANIME, sort: TRENDING_DESC) {
        id
        title {
          romaji
        }
        coverImage {
          large
        }
      }
    }
  }
`;

async function fetchAnimeData() {
    try {
        const response = await fetch(ANILIST_API_URL, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Accept": "application/json",
            },
            body: JSON.stringify({ query }),
        });

        const result = await response.json();
        return result.data.Page.media;
    } catch (error) {
        console.error("Erro ao buscar dados do AniList:", error);
        return [];
    }
}

async function displayAnimes() {
  const animes = await fetchAnimeData();
  const track = document.querySelector(".animes-track");
  const prevBtn = document.querySelector(".animes .prev-button");
  const nextBtn = document.querySelector(".animes .next-button");

  if (!track) {
      console.warn("Track de animes não encontrada.");
      return;
  }

  track.innerHTML = "";

  animes.forEach(anime => {
      const card = document.createElement("div");
      card.classList.add("carousel-card");

      card.innerHTML = `
          <h3>${anime.title.romaji}</h3>
          <img src="${anime.coverImage.large}" alt="${anime.title.romaji}" loading="lazy">
      `;

      track.appendChild(card);
  });

  startCarousel(track, animes.length, prevBtn, nextBtn);
}


function startCarousel(track, totalItems, prevBtn, nextBtn) {
  let index = 0;

  function getVisibleItems() {
      return window.innerWidth < 800 ? 2 : 5;
  }

  function updateCarousel() {
      const visibleItems = getVisibleItems();
      const maxIndex = totalItems - visibleItems;
      if (index > maxIndex) index = 0;
      if (index < 0) index = maxIndex;      

      track.style.transform = `translateX(-${index * (100 / visibleItems)}%)`;
  }

  function moveNext() {
      index++;
      updateCarousel();
  }

  function movePrev() {
      index--;
      updateCarousel();
  }

  // Auto scroll
  let interval = setInterval(moveNext, 3000);

  // Pausar ao passar o mouse
  track.addEventListener("mouseenter", () => clearInterval(interval));
  track.addEventListener("mouseleave", () => {
      interval = setInterval(moveNext, 3000);
  });

  // Eventos dos botões
  if (nextBtn && prevBtn) {
      nextBtn.addEventListener("click", moveNext);
      prevBtn.addEventListener("click", movePrev);
  }

  // Responsivo: recalcular quando redimensionar a tela
  window.addEventListener("resize", () => {
      index = 0; // volta pro início quando redimensionar
      updateCarousel();
  });

  updateCarousel();
}





document.addEventListener("DOMContentLoaded", displayAnimes);
