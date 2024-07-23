import React, { useState } from 'react';
import axios from 'axios';

function VenueSearch() {
  const [query, setQuery] = useState('');
  const [venues, setVenues] = useState([]);

  const handleSearch = async () => {
    try {
      const response = await axios.post('http://localhost:5000/api/search_venues', { query, top_k: 5 });
      setVenues(response.data);
    } catch (error) {
      console.error('Error searching venues:', error);
    }
  };

  return (
    <div>
      <h2>Venue Search</h2>
      <input
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Enter your search query"
      />
      <button onClick={handleSearch}>Search</button>

      <div>
        {venues.map((venue, index) => (
          <div key={index}>
            <h3>{venue.name}</h3>
            <p>Location: {venue.city}, {venue.state}</p>
            <p>Max Capacity: {venue.max_capacity}</p>
            <p>Starting Price: ${venue.starting_price}</p>
            <p>Relevance Score: {venue.score.toFixed(2)}</p>
            <hr />
          </div>
        ))}
      </div>
    </div>
  );
}

export default VenueSearch;