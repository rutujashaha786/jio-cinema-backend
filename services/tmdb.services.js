const headers = {
    accept: 'application/json',
    Authorization: `Bearer ${process.env.TMDB_KEY}`
};

const tmdbBASEURL = "https://api.themoviedb.org/3/";

const TMDB_ENDPOINT = {
    //discover
    fetchNowPlaying: `/movie/now_playing`,
    fetchTrending: `/trending/all/week`,
    fetchUpcoming: `/movie/upcoming?include_video=true`,
    fetchTopRated: `/movie/top_rated?include_video=true`,

    // Movies
    fetchActionMovies: `/discover/movie?language=en-US&with_genres=28`,
    fetchComedyMovies: `/discover/movie?language=en-US&with_genres=35`,
    fetchHorrorMovies: `/discover/movie?language=en-US&with_genres=27`,
    fetchRomanceMovies: `/discover/movie?language=en-US&with_genres=10749`,
    fetchAnimeMovies: '/discover/movie?language=en-US&with_genres=16',
    fetchMovieVideos: (id) => `/movie/${id}/videos`,

    // Tv Shows
    fetchActionTvShows: `/discover/tv?language=en-US&with_genres=10759`,
    fetchComedyTvShows: `/discover/tv?language=en-US&with_genres=35`,
    fetchMysteryTvShows: `/discover/tv?language=en-US&with_genres=9648`,
    fetchDramaTvShows: `/discover/tv?language=en-US&with_genres=18`,
    fetchCrimeTvShows: `/discover/tv?language=en-US&with_genres=80`,
    fetchTvShowVideos: (id) => `/tv/${id}/videos`,
};


const tmdbApi = {
    get: async (endpoint) => {
        const url = tmdbBASEURL + endpoint;
        const response = await fetch(url, { method: 'GET', headers: headers })
        const data = await response.json();
        return data;
    }
}

module.exports={
    tmdbApi, TMDB_ENDPOINT, 
}