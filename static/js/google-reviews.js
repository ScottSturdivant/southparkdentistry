// static/js/main.js - Combine all site JavaScript here

document.addEventListener('DOMContentLoaded', function() {
  
  // Initialize Google Reviews
  initGoogleReviews();
  
  // Any other site-wide initializations can be added here
});

// === GOOGLE REVIEWS ===
// Updated initGoogleReviews function with better empty review handling
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
      
      if (!data.reviews || data.reviews.length === 0) {
        reviewsContainer.innerHTML = '<div class="text-center">No reviews available at this time.</div>';
        return;
      }
      
      // Sort by most recent first (should already be sorted, but just to be sure)
      data.reviews.sort((a, b) => b.time - a.time);
      
      // Limit to 6 reviews for display
      const displayReviews = data.reviews.slice(0, 6);
      
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
      
      // If we don't have enough reviews to fill the grid, add a special message in the last slot
      if (displayReviews.length < 6 && displayReviews.length > 0) {
        const reviewsSlider = reviewsContainer.querySelector('.reviews-slider');
        const emptySlots = 6 - displayReviews.length;
        
        for (let i = 0; i < emptySlots; i++) {
          const writeReviewElement = document.createElement('div');
          writeReviewElement.className = 'testimonial review-item write-review-prompt';
          writeReviewElement.innerHTML = `
            <div class="write-review-content">
              <h4>Love Your Experience?</h4>
              <p>We appreciate your feedback! Share your experience with others by leaving a review.</p>
              <a href="https://search.google.com/local/writereview?placeid=${placeId}" target="_blank" class="btn btn-primary">
                <i class="fa fa-pencil" aria-hidden="true"></i> Write a Review
              </a>
            </div>
          `;
          reviewsSlider.appendChild(writeReviewElement);
        }
      }
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
