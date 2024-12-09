import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';

function SearchContent() {
  const { term } = useParams();
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const timeAgo = (dateString) => {
    const now = new Date();
    const past = new Date(dateString);
    const diffInSeconds = Math.floor((now - past) / 1000);

    const secondsInMinute = 60;
    const secondsInHour = 3600;
    const secondsInDay = 86400;
    const secondsInMonth = 2592000;
    const secondsInYear = 31536000;

    if (diffInSeconds < secondsInMinute) {
      return `${diffInSeconds} seconds ago`;
    } else if (diffInSeconds < secondsInHour) {
      const minutes = Math.floor(diffInSeconds / secondsInMinute);
      return `${minutes} minutes ago`;
    } else if (diffInSeconds < secondsInDay) {
      const hours = Math.floor(diffInSeconds / secondsInHour);
      return `${hours} hours ago`;
    } else if (diffInSeconds < secondsInMonth) {
      const days = Math.floor(diffInSeconds / secondsInDay);
      return `${days} days ago`;
    } else if (diffInSeconds < secondsInYear) {
      const months = Math.floor(diffInSeconds / secondsInMonth);
      return `${months} months ago`;
    } else {
      const years = Math.floor(diffInSeconds / secondsInYear);
      return `${years} years ago`;
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const response = await fetch(`http://localhost:3000/api/content?q=${term}`);
        if (!response.ok) {
          console.error("Error fetching data:", response.statusText);
          setResults([]);
        } else {
          const data = await response.json();
          setResults(data.data);
        }
      } catch (error) {
        console.error("Fetch error:", error);
        setResults([]);
      }
      setLoading(false);
    };
  
    if (term) fetchData();
  }, [term]);
  

  return (
    <div className="search-content-page">
      <div className="search-content">
        {/* <h2>Cari : "{term || 'No Search Term'}"</h2> */}

        {loading ? (
          <p>Loading...</p>
        ) : (
          <div>
            {results.length > 0 ? (
              <div className="wiki-pemda-container">
                {results.map((content) => (
                  <Link to={`/informasi/${content.id}`} key={content.id} className="wiki-pemda-item-link">
                    <div className="wiki-pemda-item">
                      <div className="title-container">
                        <h4 className="search">{content.title}</h4>
                      </div>
                      <br />
                      <hr className="divider" />
                      <br />
                      <p className="description">
                        {content.description.String.slice(0, 86)}
                      </p>
                      <p className="last-updated">
                        Last updated {content.updated_at && timeAgo(content.updated_at)}
                      </p>
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <p>No results found.</p>
            )}
          </div>
        )}

      </div>
    </div>
  );

}

export default SearchContent;
