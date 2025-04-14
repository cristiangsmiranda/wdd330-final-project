export const animeGenres = [
  "Action",
  "Adventure",
  "Comedy",
  "Drama",
  "Fantasy",
  "Horror",
  "Mecha",
  "Romance",
  "Sci-Fi",
  "Slice of Life",
  "Sports",
  "Supernatural",
  "Mystery",
  "Psychological",
  "Thriller",
  "Magic",
  "Ecchi",
  "Music",
  "Game",
  "Military",
  "School",
  "Super Power",
  "Martial Arts",
  "Shounen",
  "Shoujo",
  "Seinen",
  "Josei"
];

export async function fetchAnimesByGenre(genre, perPage = 10, search = "", page = 1) {
  // Atualizando a consulta GraphQL para permitir gênero nulo ou vazio
  const query = `
    query ($genre: String, $search: String, $page: Int, $perPage: Int) {
      Page(page: $page, perPage: $perPage) {
        media(
          ${genre ? `genre_in: [$genre],` : ""}
          search: $search,
          type: ANIME,
          sort: POPULARITY_DESC
        ) {
          title {
            romaji
            english
          }
          coverImage {
            medium
          }
          description(asHtml: false)
          averageScore
        }
      }
    }
  `;

  // Variáveis para a requisição
  const variables = {
    genre: genre || null,  // Permite que gênero seja null ou vazio
    search: search || null,  // Permite que pesquisa seja nula
    page,
    perPage
  };

  try {
    const response = await fetch("https://graphql.anilist.co", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Accept": "application/json",
      },
      body: JSON.stringify({
        query,
        variables
      })
    });

    const data = await response.json();
    return data.data.Page.media;
  } catch (error) {
    console.error("Erro ao buscar animes por gênero na Anilist:", error);
    return [];
  }
}
