const API_KEY = import.meta.env.VITE_TMDB_API_KEY;
const BASE_URL = "https://api.themoviedb.org/3";
const IMAGE_URL = "https://image.tmdb.org/t/p/w200";

// Função para buscar dados da API
async function fetchTMDbData(endpoint) {
    try {
        const response = await fetch(`${BASE_URL}${endpoint}?api_key=${API_KEY}&language=en-US`);
        const data = await response.json();
        return data.results.slice(0, 10); // Pegando os 10 primeiros resultados
    } catch (error) {
        console.error("Erro ao buscar dados da API:", error);
    }
}

// Função para exibir os filmes/séries/animes na página
async function displayContent() {
    const sections = [
        { id: "series", endpoint: "/tv/popular" },
        { id: "movies", endpoint: "/movie/popular" },
        { id: "animes", endpoint: "/discover/tv?with_genres=16" } // Corrigindo a query de animes
    ];

    for (const section of sections) {
        const items = await fetchTMDbData(section.endpoint);
        const container = document.querySelector(`.${section.id} .image-container`);
        container.innerHTML = ""; // Limpa antes de adicionar os novos

        items.forEach(item => {
            const img = document.createElement("img");
            img.src = `${IMAGE_URL}${item.poster_path}`;
            img.alt = item.name || item.title;
            container.appendChild(img);
        });
    }
}

// Chama a função ao carregar a página
document.addEventListener("DOMContentLoaded", displayContent);
