import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

const AddSubheading = () => {
    const [subheading, setSubheading] = useState('');
    const [description, setDescription] = useState('');
    const navigate = useNavigate();
    const { id } = useParams();
    const [user, setUser] = useState(null);

    useEffect(() => {
        const storedUser = JSON.parse(localStorage.getItem('user'));
        if (storedUser && storedUser.id) {
            setUser(storedUser);
        } else {
            console.warn('User ID not found in localStorage.');
        }
    }, []);

    const handleAddSubheading = async (e) => {
        e.preventDefault();

        const subheadingData = {
            content_id: parseInt(id, 10),
            subheading,
            subheading_description: description,
            author_id: user?.id,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
            editor_id: user?.id, 
        };

        try {
            const response = await fetch(`http://localhost:3000/api/subheading/add/${id}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(subheadingData),
            });

            if (!response.ok) throw new Error('Failed to add subheading');
            const responseData = await response.json();
            console.log(responseData);

            const historyData = {
                content_id: parseInt(id, 10),
                editor_id: user.id, 
                edited_at: new Date().toISOString(),
            };

            const historyResponse = await fetch("http://localhost:3000/api/history/add", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(historyData),
            });

            if (!historyResponse.ok) {
                console.error("Failed to record add subheading history");
            }

            navigate(`/informasi/${id}`);
        } catch (error) {
            console.error(error);
            alert('Error adding subheading');
        }
    };

    return (
        <div className="container-wrapper">
            <div className="container">
                <div className="text text-gradient">Tambah Sub Judul</div>
                <form onSubmit={handleAddSubheading}>
                    <div className="form-row">
                        <div className="input-data">
                            <input
                                type="text"
                                value={subheading}
                                onChange={(e) => setSubheading(e.target.value)}
                                required
                            />
                            <div className="underline"></div>
                            <label>Sub Judul</label>
                        </div>
                    </div>

                    <div className="form-row">
                        <div className="input-data textarea">
                            <textarea
                                rows="2"
                                value={description}
                                onChange={(e) => {
                                    setDescription(e.target.value);
                                    e.target.style.height = 'auto';
                                    e.target.style.height = `${e.target.scrollHeight}px`;
                                }}
                                required
                            />
                            <div className="underline"></div>
                            <label>Deskripsi</label>
                        </div>
                    </div>

                    <div className="form-row submit-btn">
                        <div className="input-data">
                            <div className="inner"></div>
                            <input type="submit" value="Add Subheading" />
                        </div>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default AddSubheading;
