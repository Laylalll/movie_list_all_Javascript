const BASE_URL = 'https://movie-list.alphacamp.io'
const INDEX_URL = BASE_URL + '/api/v1/movies/'
const POSTER_URL = BASE_URL + '/posters/'
const movies = JSON.parse(localStorage.getItem('favoriteMovies')) || []

const dataPanel = document.querySelector('#data-panel')

const searchForm = document.querySelector('#search-form')
const searchKeyword = document.querySelector('#search-keyword')
const changeModeSwitched = document.querySelector('#change-mode')

changeModeSwitched.addEventListener('click', function onChangeModeSwitched(event) {
  if (event.target.matches('#card-mode-button')) {
    dataPanel.dataset.mode = 'card-mode'
    renderMovieList(movies)
  } else if (event.target.matches('#list-mode-button')) {
    dataPanel.dataset.mode = 'list-mode'
    renderMovieList(movies)
  }
})

dataPanel.addEventListener('click', function onPanelClicked(event) {
  if (event.target.matches('.btn-show-movie')) {
    showModalMovie(Number(event.target.dataset.id))  // 修改這裡
  } else if (event.target.matches('.btn-remove-favorite')) {
    removeFromFavorite(Number(event.target.dataset.id))
  }
})

function removeFromFavorite(id) {
  if (!movies || !movies.length) { return } //加上條件控制：一旦收藏清單是空的，即結束函式
    
 
  const movieIndex = movies.findIndex(movie => { return movie.id === id })   //透過 id 找到要刪除電影的 index
  if (movieIndex === -1) { return }  //加上條件控制：一旦傳入的 id 在收藏清單中不存在，即結束函式

  movies.splice(movieIndex, 1)  //刪除該筆電影
  localStorage.setItem('favoriteMovies', JSON.stringify(movies))    //存回 local storage
  renderMovieList(movies)   //更新頁面
}

function showModalMovie(id) {
  const modalTitle = document.querySelector('#movie-modal-title')
  const modalImage = document.querySelector('#movie-modal-image')
  const modalDate = document.querySelector('#movie-modal-date')
  const modalDescription = document.querySelector('#movie-modal-description')

  axios.get(INDEX_URL + id)
    .then(function (response) {
      const data = response.data.results
      modalTitle.innerText = data.title
      modalDate.innerText = 'Release date:' + data.release_date
      modalDescription.innerText = data.description
      modalImage.innerHTML = `<img
                src="${POSTER_URL + data.image}"
                alt="movie-poster" class="img-fluid">`
    })

}

function renderMovieList(data) {
  if (dataPanel.dataset.mode === 'card-mode') {
    let rawHTML = ''
    data.forEach(function (item) {
      // title, image, id 隨每個 item 改變
      rawHTML += `
      <div class="col-sm-3">
        <div class="mb-2">
          <div class="card">
            <img
              src="${POSTER_URL + item.image}"
              class="card-img-top" alt="Movie Poster">
            <div class="card-body">
              <h5 class="card-title">${item.title}</h5>
            </div>
            <div class="card-footer">
              <button class="btn btn-primary btn-show-movie" data-toggle="modal"
                data-target="#movie-modal" data-id="${item.id}">More</button>
              <button class="btn btn-danger btn-remove-favorite" data-id="${item.id}">x</button>
            </div>
          </div>
        </div>
      </div>
    `
    })

    dataPanel.innerHTML = rawHTML
  } else if (dataPanel.dataset.mode === 'list-mode') {
    let rawHTML = `<ul class="list-group list-group-flush col-sm-12 mb-2">`
    data.forEach(function (item) {
      // title, 隨每個 item 改變
      rawHTML += `
        <li class="list-group-item d-flex justify-content-between">
            <h5 class="card-title">${item.title}</h5>
            <div>
              <button class="btn btn-primary btn-show-movie" data-toggle="modal" data-target="#movie-modal" data-id="${item.id}">More</button>
              <button class="btn btn-danger btn-remove-favorite" data-id="${item.id}">x</button>
            </div>
          </li>
        `
    })
    rawHTML += `</ul>`

    dataPanel.innerHTML = rawHTML
  }
}


renderMovieList(movies)