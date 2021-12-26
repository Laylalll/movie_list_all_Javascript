const BASE_URL = 'https://movie-list.alphacamp.io'
const INDEX_URL = BASE_URL + '/api/v1/movies/'
const POSTER_URL = BASE_URL + '/posters/'

const MOVIES_PER_PAGE = 12
let currentPage = 1  // 宣告currentPage紀錄當前分頁，確保切換模式時分頁不會跑掉；預設初始頁為P1

const movies = []
let filteredMovies = [] //儲存符合篩選條件的項目

const dataPanel = document.querySelector('#data-panel')
const searchForm = document.querySelector('#search-form')
const searchKeyword = document.querySelector('#search-keyword')
const paginator = document.querySelector('#paginator')
const changeModeSwitched = document.querySelector('#change-mode')

changeModeSwitched.addEventListener('click', function onChangeModeSwitched(event) {
  if (event.target.matches('#card-mode-button')) {
    dataPanel.dataset.mode = 'card-mode'
    renderMovieList(getMoviesByPage(currentPage))
  } else if (event.target.matches('#list-mode-button')) {
    dataPanel.dataset.mode = 'list-mode'
    renderMovieList(getMoviesByPage(currentPage))
  }
})

paginator.addEventListener('click', function onPaginatorClicked(event) {
  if (event.target.tagName !== 'A') { return }  //如果被點擊的不是 a 標籤，結束函式

  const page = Number(event.target.dataset.page) //透過 dataset 取得被點擊的頁數；dataset都是字串，要轉成數字
  currentPage = page // 目前頁面等於當下點擊分頁
  renderMovieList(getMoviesByPage(currentPage))
})

searchForm.addEventListener('submit', function onSearchFormSubmitted(event) {
  event.preventDefault()  //取消預設事件
  const keyword = searchKeyword.value.trim().toLowerCase() //取得搜尋關鍵字  //錯誤處理：排除空格、全部取的值轉為小寫

  //條件篩選
  filteredMovies = movies.filter(movie => { return movie.title.toLowerCase().includes(keyword) }) //作法二

  //錯誤處理：無符合條件的結果
  if (filteredMovies.length === 0) {
    return alert(`Cannot find movie with ${keyword}.`)
  }

  renderPaginator(filteredMovies.length)  //重製分頁器
  currentPage = 1 //重製currentPage 的值
  renderMovieList(getMoviesByPage(currentPage))  //預設顯示第1頁的搜尋結果

})

dataPanel.addEventListener('click', function onPanelClicked(event) {
  if (event.target.matches('.btn-show-movie')) {
    showModalMovie(Number(event.target.dataset.id))
  } else if (event.target.matches('.btn-add-favorite')) {
    addToFavorite(Number(event.target.dataset.id))
  }
})



function getMoviesByPage(page) {
  const data = filteredMovies.length ? filteredMovies : movies  //如果搜尋清單有東西，就取搜尋清單 filteredMovies，否則就還是取總清單 movies
  const startIndex = (page - 1) * MOVIES_PER_PAGE  //計算起始 index 
  return data.slice(startIndex, startIndex + MOVIES_PER_PAGE)  //回傳切割後的新陣列
}

function renderPaginator(amount) {
  //計算總頁數
  const numberOfPages = Math.ceil(amount / MOVIES_PER_PAGE)
  //製作 template 
  let rawHTML = ''
  for (let page = 1; page <= numberOfPages; page++) {
    rawHTML += `<li class="page-item"><a class="page-link" href="#" data-page="${page}">${page}</a></li>`
  }
  //放回 HTML
  paginator.innerHTML = rawHTML
}

function addToFavorite(id) {
  const list = JSON.parse(localStorage.getItem('favoriteMovies')) || []
  const movie = movies.find(movie => { return movie.id === id })
  if (list.some(movie => movie.id === id)) {
    return alert('此電影已經在收藏清單中！')
  }
  list.push(movie)
  localStorage.setItem('favoriteMovies', JSON.stringify(list))
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
              <button class="btn btn-info btn-add-favorite" data-id="${item.id}">+</button>
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
              <button class="btn btn-info btn-add-favorite" data-id="${item.id}">+</button>
            </div>
          </li>
        `
    })
    rawHTML += `</ul>`

    dataPanel.innerHTML = rawHTML
  }
}

axios.get(INDEX_URL)
  .then(function (response) {
    movies.push(...response.data.results)
    console.log(movies)
    renderPaginator(movies.length)
    renderMovieList(getMoviesByPage(1))
  })
  .catch(function (error) {
    console.log(error);
  })


