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
    
    // Get reviews from the API, sorted by newest
    const response = await axios.get(
      `https://maps.googleapis.com/maps/api/place/details/json?` +
      `place_id=${placeId}&` +
      `fields=reviews,rating,user_ratings_total&` +
      `reviews_sort=newest&` +
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
    
    // Extract reviews from API
    const apiReviews = response.data.result.reviews || [];
    console.log(`Found ${apiReviews.length} total reviews from API`);
    
    // Additional reviews that we know of but may not be in the API results
    // These reviews come from the JSON you shared previously
    const additionalKnownReviews = [
      {
        "author_name": "deceptacon 101",
        "profile_photo_url": "https://lh3.googleusercontent.com/a/ACg8ocJHPQwRGKtdAybWn2KC72VJHCJyqzUaqsh5H7QFQKq2P_5Nc7TN=s128-c0x00000000-cc-rp-mo-ba3",
        "rating": 5,
        "relative_time_description": "a year ago",
        "text": "I had such an amazing time at my appointment. The staff member at the front was very friendly and helpful with all of my questions. Sandra took my X-rays and did my cleaning and was so friendly and thorough. She explained everything going on and made my experience really great! Dr. Sturdivant was also so friendly and really nice and funny which made my experience really fun! She did a really great job examining my teeth and it didn't hurt at all, she was very gentle and thorough. It was a great experience!",
        "time": 1691168476,
      },
      {
        "author_name": "La Sc",
        "profile_photo_url": "https://lh3.googleusercontent.com/a/ACg8ocL2ixICl0LuohkgTaMS7uFyoE-YnUKVitUvO6-BtXYNmsfZ3g=s128-c0x00000000-cc-rp-mo-ba3",
        "rating": 5,
        "relative_time_description": "a year ago",
        "text": "As a new patient, I have to say that Heather and her staff did a fantastic job of making me feel welcome, setting up an appointment (and reminding me of it which I love) and getting my insurance submitted in a timely manner! I now actually look forward to the Dentist, since I know they'll take care of me!",
        "time": 1715109422,
      },
      {
        "author_name": "Ashleigh Evans",
        "profile_photo_url": "https://lh3.googleusercontent.com/a/ACg8ocKufnNFkSXovLhLWijfOX1TJXNlHsW6-Uh_Wgvvm2KjX3CjKg=s128-c0x00000000-cc-rp-mo",
        "rating": 5,
        "relative_time_description": "4 years ago",
        "text": "I can't say enough wonderful things about this practice and it's employees!! They are sweet , efficient,  comforting and flexible.  I have been going there for 10+ years and they only get better.  All three of my babies have been seeing Dr. Sturdivant and myself for as long as I can remember.  She goes above and beyond to help clean, save and protect your teeth . She never recommends things unnecessary  unless you really need it.. She listens and is GREAT at what she does. 1000% recommend them!",
        "time": 1613700594,
      },
      {
        "author_name": "Sheryl Davidson",
        "profile_photo_url": "https://lh3.googleusercontent.com/a/ACg8ocKf26lrvVYYyUHis-nac-QTstqtPLFuqQ6VA1Ut464iYSBfcA=s128-c0x00000000-cc-rp-mo",
        "rating": 5,
        "relative_time_description": "5 years ago",
        "text": "Dr. Sturdivant is a great dentist!  I've had extensive dental work done on my teeth, so I know an excellent dentist when I experience one.  She Is extremely professional and explains my options before and during complex procedures.  She is also very gentle and attempts to alleviate any discomfort I may experience.   She has followed up with me after difficult procedures and has been available when I needed a last-minute appointment for a painful tooth.  Her staff is really friendly and efficient.",
        "time": 1569355943,
      },
      {
        "author_name": "JP Ferraro",
        "profile_photo_url": "https://lh3.googleusercontent.com/a-/ALV-UjVIjdsvmF9KpNropcT7VrMS7Ci_ml_pp_PJggZruE6j89sVrzVkGg=s128-c0x00000000-cc-rp-mo-ba4",
        "rating": 5,
        "relative_time_description": "3 years ago",
        "text": "Great doctor and staff. It is fantastic that part of their mission is to provide great dental care to people of all means, income levels, and types of insurances. When I walked in for my cleaning, Dr. Sturdivant was hugging one of her team members- a great example of her genuine love and concern for people.",
        "time": 1649225168,
      }
    ];
    
    // Combine reviews from API and our additional known reviews
    let allReviews = [...apiReviews];
    
    // Add additional reviews that aren't already included (based on author name)
    const existingAuthorNames = allReviews.map(review => review.author_name);
    
    additionalKnownReviews.forEach(review => {
      if (!existingAuthorNames.includes(review.author_name)) {
        allReviews.push(review);
      }
    });
    
    // Filter to only 5-star reviews
    const fiveStarReviews = allReviews.filter(review => review.rating === 5);
    console.log(`Found ${fiveStarReviews.length} 5-star reviews total`);
    
    // Sort by newest first
    fiveStarReviews.sort((a, b) => b.time - a.time);
    
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
