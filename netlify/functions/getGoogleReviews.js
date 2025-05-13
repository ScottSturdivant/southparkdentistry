// netlify/functions/getGoogleReviews.js
const axios = require('axios');
require('dotenv').config(); // For local development

exports.handler = async function() {
  const placeId = process.env.GOOGLE_PLACE_ID;
  const apiKey = process.env.GOOGLE_PLACES_API_KEY;
  
  if (!placeId || !apiKey) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Missing environment variables' })
    };
  }

  try {
    const response = await axios.get(
      `https://maps.googleapis.com/maps/api/place/details/json?` +
      `place_id=${placeId}&` +
      `fields=reviews,rating,user_ratings_total&` +
      `key=${apiKey}`
    );
    
    return {
      statusCode: 200,
      body: JSON.stringify(response.data),
      headers: {
        'Cache-Control': 'public, max-age=3600',
        'Access-Control-Allow-Origin': '*' // For local testing
      }
    };
  } catch (error) {
    console.error('Error fetching Google reviews:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Failed to fetch reviews', details: error.message })
    };
  }
};
