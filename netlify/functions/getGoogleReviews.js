// netlify/functions/getGoogleReviews.js
const axios = require('axios');
require('dotenv').config(); // For local development

exports.handler = async function(event) {
  // Set proper CORS headers
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Content-Type': 'application/json',
    'Cache-Control': 'public, max-age=3600'
  };

  // Handle preflight OPTIONS request
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers,
      body: ''
    };
  }

  const placeId = process.env.GOOGLE_PLACE_ID;
  const apiKey = process.env.GOOGLE_PLACES_API_KEY;
  
  if (!placeId || !apiKey) {
    console.error('Missing environment variables. PLACE_ID or API_KEY not found.');
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: 'Missing environment variables' })
    };
  }

  try {
    console.log('Fetching reviews for place ID:', placeId);
    const response = await axios.get(
      `https://maps.googleapis.com/maps/api/place/details/json?` +
      `place_id=${placeId}&` +
      `fields=reviews,rating,user_ratings_total&` +
      `key=${apiKey}`
    );
    
    // Check if response is valid
    if (response.data.status !== 'OK') {
      console.error('API returned non-OK status:', response.data.status);
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({ 
          reviews: [],
          error: `Google API returned status: ${response.data.status}`
        })
      };
    }
    
    // Extract all reviews
    const allReviews = response.data.result.reviews || [];
    console.log(`Found ${allReviews.length} total reviews`);
    
    // Filter to only 5-star reviews
    const fiveStarReviews = allReviews.filter(review => review.rating === 5);
    console.log(`Found ${fiveStarReviews.length} 5-star reviews`);
    
    // Format the response
    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({ 
        reviews: fiveStarReviews,
        rating: response.data.result.rating,
        user_ratings_total: response.data.result.user_ratings_total,
        totalReviewsCount: allReviews.length,
        fiveStarCount: fiveStarReviews.length
      })
    };
  } catch (error) {
    console.error('Error fetching Google reviews:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: 'Failed to fetch reviews', details: error.message })
    };
  }
};
