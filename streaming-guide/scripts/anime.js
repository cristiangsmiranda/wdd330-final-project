const ANIME_API_URL = "https://api.jikan.moe/v4";

async function fetchAnimeData() {
    try {
        const response = await fetch(`${ANIME_API_URL}/top/anime`);
        const data = await response.json();
        return data.data.slice(0, 10); // Pega os 10 primeiros animes
    } catch (error) {
        console.error("Erro ao buscar animes:", error);
        return [];
    }
}

async function displayAnime() {
    const animes = await fetchAnimeData();
    const container = document.querySelector(".animes .image-container");

    if (!container) {
        console.warn("Container de animes não encontrado.");
        return;
    }

    container.innerHTML = "";

    animes.forEach(anime => {
        const img = document.createElement("img");
        img.src = anime.images.webp.image_url;
        img.alt = anime.title;
        container.appendChild(img);
    });
}

document.addEventListener("DOMContentLoaded", displayAnime);
