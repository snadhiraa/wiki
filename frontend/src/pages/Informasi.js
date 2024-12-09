import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';

const Informasi = ({ setSubheadings, setTags, setUpdatedAt, setContentId, setAuthorName }) => {
  const [user, setUser] = useState(null);
  const [content, setContent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { id } = useParams();
  const navigate = useNavigate();

  const formatDate = (dateString) => {
    const options = { day: 'numeric', month: 'long', year: 'numeric' };
    return new Date(dateString).toLocaleDateString('id-ID', options);
  };

  useEffect(() => {
    const storedUser = JSON.parse(localStorage.getItem('user'));
    if (storedUser) setUser(storedUser);

    const fetchData = async () => {
      try {
        const response = await fetch(`http://localhost:3000/api/content/${id}`);
        if (!response.ok) throw new Error('Failed to fetch data');
        const data = await response.json();

        setContent(data);
        setSubheadings(data?.subheadings || []); // Kirim subheadings ke Sidebar
        setTags(data.content.tag ? data.content.tag.split(',') : []); // Kirim tags ke Sidebar
        setUpdatedAt(formatDate(data.content.updated_at)); // Send updated_at to Sidebar
        setContentId(id)
        setAuthorName(data.author_name)
      } catch (err) {
        setError("Failed to fetch data. Please check your connection or try again later.");
      } finally {
        setLoading(false);
      }
    };

    if (id) fetchData();
  }, [id, setSubheadings, setTags, setUpdatedAt, setContentId, setAuthorName]);

  useEffect(() => {
    return () => {
      setContent(null); // Reset content
      setSubheadings([]); // Reset subheadings
      setTags([]); // Reset tags
    };
  }, [setSubheadings, setTags]);

  const handleEditClick = () => {
    if (!user) {
      alert("Please log in to edit content.");
    } else if (user.role_id === 1 || user.role_id === 2 || (user.role_id === 3 && user.user_instance_id === content?.content?.instance_id)) {
      navigate(`/edit/${id}`);
    } else {
      alert("You are not authorized to edit this content.");
    }
  };

  const handleDeleteClick = async () => {
    if (!user) {
      alert("Please log in to delete content.");
    } else if (user.role_id === 1 || user.role_id === 2 || (user.role_id === 3 && user.user_instance_id === content?.content?.instance_id)) {
      const confirmDelete = window.confirm("Are you sure you want to delete this content?");
      if (confirmDelete) {
        try {
          const response = await fetch(`http://localhost:3000/api/content/delete/${id}`, {
            method: 'DELETE',
          });

          if (response.ok) {
            alert("Content deleted successfully");
            navigate('/');
          } else {
            alert("Failed to delete content");
          }
        } catch (err) {
          alert("An error occurred while deleting the content");
        }
      }
    } else {
      alert("You are not authorized to delete this content.");
    }
  };

  if (loading) return <div>Loading content...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div className="main">
      <div className="content">
        <h1>{content?.content?.title || "No Title Available"}</h1>
        <p>
          {content?.content?.description?.String &&
            content.content.description.String.split('\n').map((line, index) => (
              <span key={index}>
                {line}
                <br />
              </span>
            ))}
        </p>

        <ul className="no-number">
          {content?.subheadings?.length > 0 &&
            content.subheadings.map((subheading) => (
              <li key={subheading.id} id={subheading.subheading}>
                <strong id="subheading">{subheading.subheading}</strong>
                <p>
                  {subheading.subheading_description &&
                    subheading.subheading_description
                      .split('\n')
                      .map((line, index) => (
                        <span key={index}>
                          {line.trim()}
                          <br />
                        </span>
                      ))}
                </p>
              </li>
            ))}
        </ul>

        {user && (user.role_id === 1 || user.role_id === 2 || user.role_id === 3) && (
          <div className="submit-btn">
            <input
              type="button"
              value="Edit Konten"
              className="btn btn-blue"
              onClick={handleEditClick}
            />
            <input
              type="button"
              value="Hapus Konten"
              className="btn btn-red"
              onClick={handleDeleteClick}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default Informasi;