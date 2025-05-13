// static/js/main.js - Combine all site JavaScript here

document.addEventListener('DOMContentLoaded', function() {
  
  // Initialize Google Reviews
  initGoogleReviews();
  
  // Any other site-wide initializations can be added here
});

// === GOOGLE REVIEWS ===
function initGoogleReviews() {
  const reviewsContainer = document.getElementById('google-reviews');
  if (!reviewsContainer) return;
  
  // Show loading indicator
  reviewsContainer.innerHTML = '<div class="text-center"><i class="fa fa-spinner fa-spin" style="font-size: 2rem; color: var(--primary);"></i><p>Loading reviews...</p></div>';
  
  // Function to format the review date
  function formatDate(timestamp) {
    const date = new Date(timestamp * 1000);
    const months = ['January', 'February', 'March', 'April', 'May', 'June', 
                    'July', 'August', 'September', 'October', 'November', 'December'];
    return `${months[date.getMonth()]} ${date.getDate()}, ${date.getFullYear()}`;
  }
  
  // Function to render stars
  function renderStars(rating) {
    return '<div class="review-stars">' + 
      '★'.repeat(5) +
      '</div>';
  }
  
  // Fetch reviews from our Netlify function
  fetch('/.netlify/functions/getGoogleReviews')
    .then(response => {
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      return response.json();
    })
    .then(data => {
      if (!data.reviews || data.reviews.length === 0) {
        reviewsContainer.innerHTML = '<div class="text-center">No 5-star reviews available at this time.</div>';
        return;
      }
      
      // Create HTML for reviews
      const reviewsHTML = data.reviews.map(review => `
        <div class="testimonial review-item">
          <div class="review-header">
            <div class="review-author-info">
              <img src="${review.profile_photo_url || '/images/default-avatar.png'}" alt="${review.author_name}" class="review-avatar">
              <div class="review-name-stars">
                <h4 class="review-author">${review.author_name}</h4>
                ${renderStars(review.rating)}
              </div>
            </div>
            <div class="review-date">${formatDate(review.time)}</div>
          </div>
          <p class="testimonial-text">${review.text}</p>
        </div>
      `).join('');
      
      reviewsContainer.innerHTML = `
        <div class="reviews-heading">
          <h3>What Our Patients Say</h3>
          <a href="#" onclick="window.open('https://search.google.com/local/writereview?placeid=${reviewsContainer.dataset.placeid}', '_blank')" class="btn btn-primary review-btn">
            <i class="fa fa-pencil" aria-hidden="true"></i> Write a Review
          </a>
        </div>
        <div class="reviews-slider">
          ${reviewsHTML}
        </div>
      `;
    })
    .catch(error => {
      console.error('Error fetching reviews:', error);
      reviewsContainer.innerHTML = '<div class="text-center">Failed to load reviews. Please try again later.</div>';
    });
}
