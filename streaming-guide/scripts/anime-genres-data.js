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

export async function fetchAnimesByGenre(genre, limit = 10) {
  const query = `
    query ($genre: String, $perPage: Int) {
      Page(perPage: $perPage) {
        media(genre_in: [$genre], type: ANIME, sort: POPULARITY_DESC) {
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

  const variables = {
    genre,
    perPage: limit
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
