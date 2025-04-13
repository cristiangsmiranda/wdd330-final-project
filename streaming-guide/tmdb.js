const API_KEY = import.meta.env.VITE_TMDB_API_KEY;
const BASE_URL = "https://api.themoviedb.org/3";
const IMAGE_URL = "https://image.tmdb.org/t/p/w200";

// Função para buscar dados da API
async function fetchTMDbData(endpoint) {
    try {
        const response = await fetch(`${BASE_URL}${endpoint}?api_key=${API_KEY}&language=en-US`);
        const data = await response.json();
        return data.results.slice(0, 20); // Pegando os 10 primeiros resultados
    } catch (error) {
        console.error("Erro ao buscar dados da API:", error);
    }
}

// Função para exibir os filmes/séries/animes na página
async function displayContent() {
    const sections = [
        { id: "series", endpoint: "/tv/popular", class: "series-track", prev: ".series-prev", next: ".series-next" },
        { id: "movies", endpoint: "/movie/popular", class: "movies-track", prev: ".movies-prev", next: ".movies-next" },
    ];

    for (const section of sections) {
        const items = await fetchTMDbData(section.endpoint);
        const track = document.querySelector(`.${section.class}`);
        const prevBtn = document.querySelector(section.prev);
        const nextBtn = document.querySelector(section.next);

        track.innerHTML = "";

        items.forEach(item => {
            const card = document.createElement("div");
            card.classList.add("carousel-card");

            const title = item.title || item.name;
            const imgPath = item.poster_path ? `${IMAGE_URL}${item.poster_path}` : "";

            card.innerHTML = `
                <h3>${title}</h3>
                <img src="${imgPath}" alt="${title}" loading="lazy">
            `;

            track.appendChild(card);
        });

        startCarousel(track, items.length, prevBtn, nextBtn);
    }
}


export async function getRandomPopularContent() {
    const API_KEY = import.meta.env.VITE_TMDB_API_KEY;
    const IMAGE_URL = "https://image.tmdb.org/t/p/w500";
  
    const endpoints = [
      { type: "movie", endpoint: "/movie/popular" },
      { type: "tv", endpoint: "/tv/popular" }
    ];
  
    // Escolhe um tipo (filme ou série) aleatoriamente
    const randomType = endpoints[Math.floor(Math.random() * endpoints.length)];
  
    try {
      const res = await fetch(`https://api.themoviedb.org/3${randomType.endpoint}?api_key=${API_KEY}&language=en-US`);
      const data = await res.json();
      const contents = data.results;
  
      // Escolhe um conteúdo aleatório
      const randomContent = contents[Math.floor(Math.random() * contents.length)];
  
      // Busca provedores de streaming
      const providersRes = await fetch(
        `https://api.themoviedb.org/3/${randomType.type}/${randomContent.id}/watch/providers?api_key=${API_KEY}`
      );
      const providersData = await providersRes.json();
  
      const platforms = providersData.results?.US?.flatrate?.map(p => p.provider_name) || ["Not available"];
  
      return {
        title: randomContent.title || randomContent.name,
        image: `${IMAGE_URL}${randomContent.poster_path}`,
        platforms
      };
    } catch (error) {
      console.error("Erro ao buscar conteúdo aleatório:", error);
      return null;
    }
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






// Chama a função ao carregar a página
document.addEventListener("DOMContentLoaded", displayContent);
