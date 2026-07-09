// Find the date picker inputs and the button on the page
const startInput = document.getElementById('startDate');
const endInput = document.getElementById('endDate');
const getImagesButton = document.getElementById('getImagesButton');
const gallery = document.getElementById('gallery');
const factText = document.getElementById('factText');
const modal = document.getElementById('imageModal');
const modalMedia = document.getElementById('modalMedia');
const modalTitle = document.getElementById('modalTitle');
const modalDate = document.getElementById('modalDate');
const modalExplanation = document.getElementById('modalExplanation');
const closeModalButton = document.getElementById('closeModal');

// Call the setupDateInputs function from dateRange.js
// This sets up the date pickers to:
// - Default to a range of 9 days (from 9 days ago to today)
// - Restrict dates to NASA's image archive (starting from 1995)
setupDateInputs(startInput, endInput);
showRandomFact();

// When the user clicks the button, fetch APOD data for the selected date range
getImagesButton.addEventListener('click', () => {
  const startDate = startInput.value;
  const endDate = endInput.value;

  if (!startDate || !endDate) {
    showMessage('Please choose a start date and an end date.');
    return;
  }

  if (new Date(startDate) > new Date(endDate)) {
    showMessage('The start date must be before or equal to the end date.');
    return;
  }

  showMessage('🔄 Loading space photos. Please wait...');

  const apiKey = window.NASA_API_KEY || 'DEMO_KEY';
  const apiUrl = `https://api.nasa.gov/planetary/apod?api_key=${apiKey}&start_date=${startDate}&end_date=${endDate}`;

  fetch(apiUrl)
    .then((response) => {
      if (!response.ok) {
        throw new Error('Unable to fetch NASA APOD data.');
      }

      return response.json();
    })
    .then((data) => {
      if (!Array.isArray(data) || data.length === 0) {
        showMessage('No images were found for that date range.');
        return;
      }

      const apodItems = data
        .filter((item) => item.url)
        .map((item) => ({
          url: item.url,
          title: item.title || 'Untitled entry',
          date: item.date || '',
          explanation: item.explanation || 'No explanation available.',
          mediaType: item.media_type || 'image',
          thumbnailUrl: item.thumbnail_url || ''
        }));

      if (apodItems.length === 0) {
        showMessage('No image URLs were returned for that date range.');
        return;
      }

      renderGallery(apodItems);
    })
    .catch((error) => {
      console.error(error);
      showMessage('Something went wrong while loading the gallery.');
    });
});

function renderGallery(items) {
  gallery.innerHTML = '';

  items.forEach((item) => {
    const card = document.createElement('article');
    card.className = 'gallery-item';

    const media = document.createElement('div');
    media.className = 'gallery-media';

    const previewUrl = getPreviewUrl(item);

    if (item.mediaType === 'video' && previewUrl) {
      const image = document.createElement('img');
      image.src = previewUrl;
      image.alt = item.title;
      image.addEventListener('click', () => openModal(item));
      media.appendChild(image);
    } else if (item.mediaType === 'video') {
      const videoLabel = document.createElement('div');
      videoLabel.className = 'video-placeholder';
      videoLabel.innerHTML = '<div class="placeholder-icon">🎬</div><p>Video entry</p>';

      const videoLink = document.createElement('a');
      videoLink.href = item.url;
      videoLink.textContent = 'Watch video';
      videoLink.target = '_blank';
      videoLink.rel = 'noopener noreferrer';
      videoLink.className = 'video-link';

      media.appendChild(videoLabel);
      media.appendChild(videoLink);
    } else {
      const image = document.createElement('img');
      image.src = item.url;
      image.alt = item.title;
      image.addEventListener('click', () => openModal(item));
      media.appendChild(image);
    }

    const title = document.createElement('h3');
    title.textContent = item.title;

    const date = document.createElement('p');
    date.textContent = item.date;

    card.appendChild(media);
    card.appendChild(title);
    card.appendChild(date);

    gallery.appendChild(card);
  });
}

function openModal(item) {
  modalMedia.innerHTML = '';

  const previewUrl = getPreviewUrl(item);

  if (item.mediaType === 'video' && previewUrl) {
    const image = document.createElement('img');
    image.src = previewUrl;
    image.alt = item.title;
    modalMedia.appendChild(image);

    const videoLink = document.createElement('a');
    videoLink.href = item.url;
    videoLink.textContent = 'Open video in a new tab';
    videoLink.target = '_blank';
    videoLink.rel = 'noopener noreferrer';
    videoLink.className = 'video-link';

    modalMedia.appendChild(videoLink);
  } else if (item.mediaType === 'video') {
    const videoMessage = document.createElement('p');
    videoMessage.textContent = 'This APOD entry is a video.';

    const videoLink = document.createElement('a');
    videoLink.href = item.url;
    videoLink.textContent = 'Open video in a new tab';
    videoLink.target = '_blank';
    videoLink.rel = 'noopener noreferrer';
    videoLink.className = 'video-link';

    modalMedia.appendChild(videoMessage);
    modalMedia.appendChild(videoLink);
  } else {
    const image = document.createElement('img');
    image.src = item.url;
    image.alt = item.title;
    modalMedia.appendChild(image);
  }

  modalTitle.textContent = item.title;
  modalDate.textContent = item.date;
  modalExplanation.textContent = item.explanation;
  modal.classList.add('show');
  modal.setAttribute('aria-hidden', 'false');
}

function closeModal() {
  modal.classList.remove('show');
  modal.setAttribute('aria-hidden', 'true');
}

closeModalButton.addEventListener('click', closeModal);

modal.addEventListener('click', (event) => {
  if (event.target === modal) {
    closeModal();
  }
});

function getPreviewUrl(item) {
  if (item.mediaType === 'video') {
    if (item.thumbnailUrl) {
      return item.thumbnailUrl;
    }

    const videoId = extractYouTubeVideoId(item.url);
    if (videoId) {
      return `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`;
    }
  }

  return item.url;
}

function extractYouTubeVideoId(url) {
  const cleanUrl = url || '';
  const match = cleanUrl.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([a-zA-Z0-9_-]{11})/);

  return match ? match[1] : '';
}

function showRandomFact() {
  const facts = [
    'A day on Venus is longer than a year on Venus.',
    'Jupiter has a storm so large it could fit Earth inside it.',
    'Neutron stars can spin hundreds of times per second.',
    'There are more stars in the universe than grains of sand on Earth.',
    'The Sun makes up about 99.8% of the mass of our solar system.'
  ];

  const randomFact = facts[Math.floor(Math.random() * facts.length)];
  factText.textContent = randomFact;
}

function showMessage(message) {
  gallery.innerHTML = `
    <div class="placeholder">
      <div class="placeholder-icon">🔭</div>
      <p>${message}</p>
    </div>
  `;
}
