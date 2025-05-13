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
  
  console.log('Fetching reviews from: /.netlify/functions/getGoogleReviews');
  
  // Fetch reviews from our Netlify function
  fetch('/.netlify/functions/getGoogleReviews')
    .then(response => {
      console.log('Response status:', response.status);
      if (!response.ok) {
        throw new Error(`Network error: ${response.status} ${response.statusText}`);
      }
      return response.json();
    })
    .then(data => {
      console.log('Received data:', data);
      
      // Check for the structure of the data
      let reviews = [];
      
      if (data.reviews) {
        // If our function already processed the reviews
        reviews = data.reviews;
      } else if (data.result && data.result.reviews) {
        // If we're getting raw API data
        reviews = data.result.reviews;
      }
      
      // Filter to only show 5-star reviews
      reviews = reviews.filter(review => review.rating === 5);
      
      // Sort by most recent first
      reviews.sort((a, b) => b.time - a.time);
      
      // Limit to exactly 6 reviews for even display
      const displayReviews = reviews.slice(0, 6);
      
      console.log('Filtered and sorted reviews:', displayReviews);
      
      if (!displayReviews || displayReviews.length === 0) {
        reviewsContainer.innerHTML = '<div class="text-center">No 5-star reviews available at this time.</div>';
        return;
      }
      
      // Create HTML for reviews
      const reviewsHTML = displayReviews.map(review => `
        <div class="testimonial review-item">
          <div class="review-header">
            <div class="review-author-info">
              <img src="${review.profile_photo_url || '/images/default-avatar.png'}" alt="${review.author_name}" class="review-avatar">
              <div class="review-name-stars">
                <h4 class="review-author">${review.author_name}</h4>
                <div class="review-stars">★★★★★</div>
              </div>
            </div>
            <div class="review-date">${formatDate(review.time)}</div>
          </div>
          <p class="testimonial-text">${review.text}</p>
        </div>
      `).join('');
      
      // Get the place ID for the "Write a Review" button
      const placeId = reviewsContainer.dataset.placeid;
      
      reviewsContainer.innerHTML = `
        <div class="reviews-heading">
          <h3>What Our Patients Say</h3>
          <a href="https://search.google.com/local/writereview?placeid=${placeId}" target="_blank" class="btn btn-primary review-btn">
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
      
      reviewsContainer.innerHTML = `
        <div class="text-center">
          <p>Failed to load reviews. Please try again later.</p>
          <p style="color: #888; font-size: 0.8rem;">${error.message}</p>
        </div>`;
    });
  
  // Format date helper function
  function formatDate(timestamp) {
    const date = new Date(timestamp * 1000);
    const months = ['January', 'February', 'March', 'April', 'May', 'June', 
                    'July', 'August', 'September', 'October', 'November', 'December'];
    return `${months[date.getMonth()]} ${date.getDate()}, ${date.getFullYear()}`;
  }
}
