import axios from 'axios';
import SimpleLightbox from 'simplelightbox';
import { Notify } from 'notiflix/build/notiflix-notify-aio';

const apiKey = '43744686-ca280592068fd12aba9ca6a42';
const apiUrl = 'https://pixabay.com/api/';
const searchForm = document.querySelector('form.search-form');
const gallery = document.querySelector('div.results');
const button = document.querySelector('button.more-results');
let enteredValue = '';
let page = 1;

button.setAttribute('hidden', '');

const createImage = photoData => {
  const galleryElement = document.createElement('div');
  galleryElement.classList.add('single-result');
  galleryElement.innerHTML = `<a href="${photoData.webformatURL}" data-lightbox="gallery"><img src="${photoData.webformatURL}" alt="${photoData.tags}" loading="lazy" /></a>
  <div class="info">
    <p>
      Likes:<span class="info-item">${photoData.likes}</span>
    </p>
    <p>
      Views: <span class="info-item">${photoData.views}</span>
    </p>
    <p>
      Comments: <span class="info-item">${photoData.comments}</span>
    </p>
    <p>
      Downloads: <span class="info-item">${photoData.downloads}</span>
    </p>
  </div>`;
  gallery.append(galleryElement);
};

const fetchImages = async () => {
  try {
    const results = await axios.get(
      `${apiUrl}?key=${apiKey}&q=${enteredValue}&image_type=photo&orientation=horizontal&safesearch=true&page=${page}&perPage=40`
    );
    return results.data;
  } catch (error) {
    Notify.failure(error.message);
    throw error;
  }
};

const displayImages = (photos, totalPages) => {
  if (page >= totalPages) {
    Notify.failure(
      "We're sorry, but you've reached the end of search results."
    );
  } else {
    Notify.info(`Page ${page} from ${Math.floor(totalPages)} is displayed`);
    const photosData = photos.hits;
    photosData.forEach(photoData => {
      createImage(photoData);
    });
  }
};

searchForm.addEventListener('submit', async event => {
  event.preventDefault();
  page = 1;
  const form = event.target;
  enteredValue = form.elements.searchQuery.value;
  try {
    const photos = await fetchImages();
    if (photos.total === 0) {
      Notify.failure(
        'Sorry, there are no images matching your search query. Please try again.'
      );
      return;
    }
    Notify.info(`Hooray! We found ${photos.totalHits} images.`);
    gallery.innerHTML = '';
    displayImages(photos, Math.ceil(photos.totalHits / 40));
    button.removeAttribute('hidden');
  } catch (error) {
    console.log(error);
  }
});

button.addEventListener('click', async () => {
  page += 1;
  button.setAttribute('hidden', '');
  try {
    const photos = await fetchImages();
    displayImages(photos, Math.ceil(photos.totalHits / 40));
  } catch (error) {
    console.log(error);
  } finally {
    button.removeAttribute('hidden');
  }
});

document.addEventListener('DOMContentLoaded', function () {
  const lightbox = new SimpleLightbox('.gallery a', {
    captionsData: 'alt',
    captionDelay: 250,
  });
});
