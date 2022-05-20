const API_KEY = "2a7ca420";
const API_URL = `https://www.omdbapi.com/?apikey=${API_KEY}&type=movie`;
const searchContainer = document.getElementById("search-bar");
const searchField = document.getElementById("search");
const movieContent = document.getElementById("movie-content-container");
const emptyFindPage = document.getElementById("empty-find-page");
const movieMissing = document.getElementById("movie-missing");
const emptyFavoriteList = document.getElementById("empty-favorlist"); ///CHANGE

if (searchContainer) {
    searchContainer.addEventListener("submit", (event) => {
    event.preventDefault();
    const searchCondition = searchField.value;

    fetch(`${API_URL}&s=${searchCondition}`)
      .then((res) => {
        if (!res.ok) {
          throw Error("Search is unavailable");
        }
        return res.json();
      })

      .then((data) => data.Search.map((movieResult) => movieResult.imdbID))

      .then((movieIDs) => getMovieData(movieIDs))
      .then((movies) => watchMovieData(movies))
      .catch((err) => resultDisplayError());
  });
}

//get data from API
const getMovieData = (movieIDs) => {
  return Promise.all(
    movieIDs.map((movieID) => {
      return fetch(`${API_URL}&i=${movieID}`);
    })
  ).then((responses) =>
    Promise.all(responses.map((response) => response.json()))
  );
};

//SHOW Movies on page
const watchMovieData = (movies) => {
  const IDsList = JSON.parse(window.localStorage.getItem("IDsList") || "[]");
  const parseToHTML = movies.map((movie) => {
    const movieIMG = movie.Poster;
    const movieTitle = movie.Title;
    const movieRating = movie.imdbRating;
    const movieDuration = movie.Runtime;
    const movieGenre = movie.Genre;
    const plot =
      movie.Plot === "N/A" || movie.Plot.slice(-1) === "."
        ? movie.Plot
        : `${movie.Plot.trim()}...`;
    const movieID = movie.imdbID;
    const inFavList = IDsList.includes(movieID);
    return `
      <div class="movie-result">
        <a class="movie-poster" href="https://www.imdb.com/title/${movieID}/"> 
        <img
          src="${movieIMG === "N/A" ? "images/default-movie-poster.jpg" : movieIMG}"
          alt="movie poster"
          width="300"
          height="447"
        />
        </a> 
        <div class="title-rating">
          <h3 class="movie-title"><a href="https://www.imdb.com/title/${movieID}/">${movieTitle}</a></h3>
          <span class="movie-rating"
            ><img
              class="rating-icon"
              src="images/star-icon.svg"
              width="15"
              height="15"
              alt="rating icon"
            /> ${movieRating}</span
          >
        </div>
        <div class="movie-details">
          <span class="movie-duration">${movieDuration}</span>
          <span class="movie-genre">${movieGenre}</span>
          <button class="${
            !inFavList ? "add-favlist" : "remove-favlist"
          }" data-id="${movieID}">
            <svg
              width="16"
              height="16"
              viewBox="0 0 16 16"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              class="plus-icon"
            >
              <path
                fill-rule="evenodd"
                clip-rule="evenodd"
                d="M8 16C12.4183 16 16 12.4183 16 8C16 3.58172 12.4183 0 8 0C3.58172 0 0 3.58172 0 8C0 12.4183 3.58172 16 8 16ZM9 5C9 4.44772 8.55228 4 8 4C7.44772 4 7 4.44772 7 5V7H5C4.44772 7 4 7.44771 4 8C4 8.55228 4.44772 9 5 9H7V11C7 11.5523 7.44772 12 8 12C8.55228 12 9 11.5523 9 11V9H11C11.5523 9 12 8.55228 12 8C12 7.44772 11.5523 7 11 7H9V5Z"
              />
            </svg>
            <svg
                width="16"
                height="16"
                viewBox="0 0 16 16"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                class="remove-icon"
              >
                <path
                  fill-rule="evenodd"
                  clip-rule="evenodd"
                  d="M8 16C12.4183 16 16 12.4183 16 8C16 3.58172 12.4183 0 8 0C3.58172 0 0 3.58172 0 8C0 12.4183 3.58172 16 8 16ZM5 7C4.44772 7 4 7.44772 4 8C4 8.55228 4.44772 9 5 9H11C11.5523 9 12 8.55229 12 8C12 7.44772 11.5523 7 11 7H5Z"
                />
              </svg>
            Watchlist
          </button>
        </div>
        <p class="movie-summary">
          ${plot}
        </p>
      </div>
    `;
  });

  movieContent.innerHTML = parseToHTML.join("");
  if (emptyFindPage) {
    emptyFindPage.style.display = "none";
  }

  if (movieMissing) {
    movieMissing.style.display = "none";
  }
  movieContent.style.display = "block";
};

const resultDisplayError = () => {
    movieContent.style.display = "none";
  emptyFindPage.style.display = "none";
  movieMissing.style.display = "grid";
};

movieContent.addEventListener("click", (event) => {
  const target = event.target.closest(".add-favlist");

  if (target && target.classList.contains("add-favlist")) {
    addToLocalStorage(target);
    event.stopImmediatePropagation();
  }
});

const addToLocalStorage = (target) => {
  const ID = target.dataset.id;
  const IDsList = JSON.parse(window.localStorage.getItem("IDsList") || "[]");

  if (!IDsList.includes(ID)) {
    IDsList.push(ID);
    window.localStorage.setItem("IDsList", JSON.stringify(IDsList));
  }

  target.classList.toggle("add-favlist");
  target.classList.toggle("remove-favlist");
};

movieContent.addEventListener("click", (event) => {
  const target = event.target.closest(".remove-favlist");

  if (target && target.classList.contains("remove-favlist")) {
    removeFromStorage(target);

    if (movieContent.classList.contains("movie-favorites-list")) {
      target.closest(".movie-result").remove();
      if (!movieContent.children.length) {
        emptyFavoriteList.style.display = "grid";
      }
    }

    event.stopImmediatePropagation();
  }
});

const removeFromStorage = (target) => {
  const ID = target.dataset.id;
  const IDsList = JSON.parse(window.localStorage.getItem("IDsList") || "[]");

  if (IDsList.includes(ID)) {
    const newIDsList = IDsList.filter((item) => {
      return item !== ID;
    });
    window.localStorage.setItem("IDsList", JSON.stringify(newIDsList));
  }

  target.classList.toggle("add-favlist");
  target.classList.toggle("remove-favlist");
};

const showFavList = async () => {
  if (!movieContent.classList.contains("movie-favorites-list")) {
    return;
  }

  const IDsList = JSON.parse(window.localStorage.getItem("IDsList") || "[]");

  if (!IDsList.length) {
    return;
  }
  emptyFavoriteList.style.display = "none";
  const favMovieList = await getMovieData(IDsList);
  watchMovieData(favMovieList);
};

showFavList();