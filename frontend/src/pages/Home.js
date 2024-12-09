import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

function Home() {
  const [contents, setContents] = useState([]);
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const storedUser = JSON.parse(localStorage.getItem('user'));
    if (storedUser) setUser(storedUser);

    const fetchData = async () => {
      try {
        const response = await fetch('/api');
        if (!response.ok) {
          throw new Error('Failed to fetch content data');
        }

        const data = await response.json();
        setContents(data);
      } catch (error) {
        console.error('Error fetching content:', error);
      }
    };

    fetchData();
  }, []);

  const handleAddClick = () => {
    if (!user) {
      alert("Please log in to edit content.");
      navigate('/login');
    } else if (user.role_id === 1 || user.role_id === 2 || (user.role_id === 3)) {
      navigate(`/addcontent`);
    } else {
      alert("You are not authorized to edit this content.");
    }
  };

  return (
    <div className="main">
      <div className="content">
        <div class="welcome-box">
          <h2>Wiki Pemda DIY</h2>
          <p>Knowledge Management system Pemda DIY untuk berbagi pengetahuan</p>
        </div>

        <h1 id="welcome">Selamat datang di Wiki Pemda DIY</h1>
        <p>Selamat datang di wiki Pemda DIY. Disini anda akan menemukan banyak informasi, panduan dan petunjuk terkait SPBE
          (Sistem Pemerintahan Berbasis Elektronik) di lingkungan Pemerintah Daerah DIY.</p>

        <h2 id="organisasi">Organisasi Perangkat Daerah Pemda DIY</h2>
        <ul className="numbered">
          {contents.map(content => (
            <li key={content.id}>
              <Link to={`/informasi/${content.id}`}>{content.title}</Link>
            </li>
          ))}
        </ul>

        {user && (user.role_id === 1 || user.role_id === 2 || user.role_id === 3) && (
          <input
            type="button"
            value="Create New Content"
            className="btn btn-blue"
            onClick={handleAddClick}
          />
        )}
      </div>
    </div>
  );
}

export default Home;