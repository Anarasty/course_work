const API_KEY = "4722b43c";
const API_URL = `https://www.omdbapi.com/?apikey=${API_KEY}&type=movie`;
const searchContainer = document.getElementById("search-container");
const searchField = document.getElementById("search");
const movieContent = document.getElementById("movie-content-container");
const emptyFindPage = document.getElementById("empty-find-page");
const movieMissing = document.getElementById("movie-missing");
const emptyFavoriteList = document.getElementById("empty-favorlist"); 

// Search btn
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
    <a class="movie-img-main" href="https://www.imdb.com/title/${movieID}/" target="_blank"><img src="${movieIMG === "N/A" ? "images/default-movie-poster.jpg" : movieIMG}" alt="movieIMG"></a>
    <div class="card-info">
      <h2 class="card-title">${movieTitle}</h2>
    </div>
    <div class="card-info-more">
      <h4 class="card-duration">Duration: ${movieDuration}</h4>
      <h4 class="card-genre">Genres: ${movieGenre}</h4>
    </div>
    <div class="card-plot-box">
      <p class="card-plot">${plot}</p>
    </div>
    <div class="card-btn-box"><button class="${!inFavList ? "add-favlist" : "remove-favlist"}" data-id="${movieID}">Favorites</button></div>
    <div class="rate">
    <input type="radio" id="star5" name="rate" value="5" />
    <label for="star5" title="text">5 stars</label>
    <input type="radio" id="star4" name="rate" value="4" />
    <label for="star4" title="text">4 stars</label>
    <input type="radio" id="star3" name="rate" value="3" />
    <label for="star3" title="text">3 stars</label>
    <input type="radio" id="star2" name="rate" value="2" />
    <label for="star2" title="text">2 stars</label>
    <input type="radio" id="star1" name="rate" value="1" />
    <label for="star1" title="text">1 star</label>
  </div>
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
  movieContent.style.display = "grid";
};

// if wrong input
const resultDisplayError = () => {
    movieContent.style.display = "none";
  emptyFindPage.style.display = "none";
  movieMissing.style.display = "grid";
};

movieContent.addEventListener("click", (event) => {
  const target = event.target.closest(".add-favlist");

  if (target && target.classList.contains("add-favlist")) {
    addToStorage(target);
    event.stopImmediatePropagation();
  }
});

const addToStorage = (target) => {
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