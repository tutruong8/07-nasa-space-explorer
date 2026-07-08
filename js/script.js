// Find the date picker inputs and the button on the page
const startInput = document.getElementById('startDate');
const endInput = document.getElementById('endDate');
const getImagesButton = document.getElementById('getImagesButton');
const gallery = document.getElementById('gallery');

// Call the setupDateInputs function from dateRange.js
// This sets up the date pickers to:
// - Default to a range of 9 days (from 9 days ago to today)
// - Restrict dates to NASA's image archive (starting from 1995)
setupDateInputs(startInput, endInput);

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

  showMessage('Loading space images...');

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
          title: item.title || 'Untitled image',
          date: item.date || '',
          explanation: item.explanation || 'No explanation available.'
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

    const image = document.createElement('img');
    image.src = item.url;
    image.alt = item.title;

    const title = document.createElement('h3');
    title.textContent = item.title;

    const date = document.createElement('p');
    date.innerHTML = `<strong>Date:</strong> ${item.date}`;

    const explanation = document.createElement('p');
    explanation.textContent = item.explanation;

    card.appendChild(image);
    card.appendChild(title);
    card.appendChild(date);
    card.appendChild(explanation);

    gallery.appendChild(card);
  });
}

function showMessage(message) {
  gallery.innerHTML = `
    <div class="placeholder">
      <div class="placeholder-icon">🔭</div>
      <p>${message}</p>
    </div>
  `;
}
