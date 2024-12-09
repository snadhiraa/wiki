import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { FaEye, FaEyeSlash } from "react-icons/fa";

const DetailUser = () => {
    const [user, setUser] = useState(null);
    const [roles, setRoles] = useState([]);
    const [instances, setInstances] = useState([]);
    const [isEditing, setIsEditing] = useState(false);
    const [formData, setFormData] = useState({
        id: "",
        name: "",
        nip: "",
        email: "",
        password: "",
        role_id: "",
        instance_id: "",
    });
    const [histories, setHistories] = useState([]);
    const [showHistory, setShowHistory] = useState(false);
    const [contents, setContents] = useState([]);
    const { id } = useParams();
    const [passwordVisible, setPasswordVisible] = useState(false);

    useEffect(() => {
        fetch(`http://localhost:3000/api/user/${id}`)
            .then((res) => res.json())
            .then((data) => {
                setUser(data);
                setFormData({
                    id: data.id,
                    name: data.name,
                    nip: data.nip,
                    email: data.email,
                    password: data.password,
                    role_id: data.role_id,
                    instance_id: data.instance_id,
                });
            })
            .catch((err) => console.error("Failed to fetch user:", err));

        fetch("http://localhost:3000/api/roles")
            .then((res) => res.json())
            .then((data) => setRoles(data))
            .catch((err) => console.error("Failed to fetch roles:", err));

        fetch("http://localhost:3000/api/instances")
            .then((res) => res.json())
            .then((data) => setInstances(data))
            .catch((err) => console.error("Failed to fetch instances:", err));

        fetch("http://localhost:3000/api")
            .then((res) => res.json())
            .then((data) => setContents(data || []))
            .catch((err) => console.error("Failed to fetch contents:", err));
    }, [id]);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData((prevState) => ({
            ...prevState,
            [name]: value,
        }));
    };

    const handleFormSubmit = (e) => {
        e.preventDefault();

        const formattedData = {
            ...formData,
            nip: parseInt(formData.nip, 10),
            role_id: parseInt(formData.role_id, 10),
            instance_id: parseInt(formData.instance_id, 10),
        };

        fetch(`http://localhost:3000/api/user/edit/${formData.id}`, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(formattedData),
        })
            .then((res) => {
                if (!res.ok) {
                    throw new Error("Failed to update user");
                }
                return res.json();
            })
            .then(() => {
                alert("User updated successfully!");
                setIsEditing(false);
                fetch(`http://localhost:3000/api/user/${id}`)
                    .then((res) => res.json())
                    .then((data) => setUser(data))
                    .catch((err) => console.error("Failed to fetch updated user:", err));
            })
            .catch((err) => console.error("Failed to update user:", err));
    };

    const loadHistories = () => {
        fetch(`http://localhost:3000/api/history/user/${id}`)
            .then((res) => res.json())
            .then((data) => setHistories(data || []))
            .catch((err) => console.error("Failed to fetch histories:", err));

        fetch(`http://localhost:3000/api/contents/user/${id}`)
            .then((res) => res.json())
            .then((data) => setContents(data || [])) // Ensure contents is always an array
            .catch((err) => console.error("Failed to fetch contents:", err));
    };

    const handleToggleHistory = () => {
        if (!showHistory) {
            loadHistories();
        }
        setShowHistory(!showHistory);
    };

    const formatDateTime = (dateTime) => {
        if (!dateTime) return "Invalid Date";
    
        const parsedDate = new Date(dateTime.replace(" ", "T"));
        if (isNaN(parsedDate)) return "Invalid Date"; // Cek apakah parsing valid
    
        // Format waktu (jam:menit)
        const optionsTime = {
            hour: "2-digit",
            minute: "2-digit",
        };
        const formattedTime = new Intl.DateTimeFormat("id-ID", optionsTime).format(parsedDate);
    
        // Format tanggal (tanggal bulan tahun dalam bahasa Indonesia)
        const optionsDate = {
            day: "numeric",
            month: "long",  // Menggunakan bulan lengkap (Desember)
            year: "numeric",
        };
        const formattedDate = new Intl.DateTimeFormat("id-ID", optionsDate).format(parsedDate);
    
        // Gabungkan jam dan tanggal dengan pemisah "-"
        return `${formattedTime} - ${formattedDate}`;
    };
    

    const getContentTitle = (contentId) => {
        const content = contents.find((c) => c.id === contentId);
        return content ? (
            <Link to={`/informasi/${content.id}`}>{content.title}</Link>
        ) : (
            "Unknown Content"
        );
    };

    const mergedData = [
        ...contents.map(content => ({
            type: 'content',
            id: content.id,
            title: getContentTitle(content.id),  // Menggunakan getContentTitle untuk menampilkan judul konten
            created_at: content.created_at,
            action: 'Create',  // Menandakan ini adalah Create
        })),
        ...histories.map(history => ({
            type: 'history',
            id: history.id,
            title: getContentTitle(history.content_id), // Menggunakan getContentTitle untuk menampilkan judul konten
            created_at: history.edited_at,
            action: 'Edit',  // Menandakan ini adalah Edit
        }))
    ];

    mergedData.sort((a, b) => new Date(b.created_at) - new Date(a.created_at)); // Urutkan berdasarkan tanggal terbaru


    if (!user || !histories || !contents) {
        return <div>Loading...</div>;
    }

    return (
        <div className="container-wrapper profile-wrapper">
            <div className="container">
                <div className="text text-gradient">Detail User</div>
                {!isEditing ? (
                    <>
                        <table className="profile-table">
                            <tbody>
                                <tr>
                                    <td><strong>Name</strong></td>
                                    <td>{user.name}</td>
                                </tr>
                                <tr>
                                    <td><strong>NIP</strong></td>
                                    <td>{user.nip}</td>
                                </tr>
                                <tr>
                                    <td><strong>Email</strong></td>
                                    <td>{user.email}</td>
                                </tr>
                                <tr>
                                    <td><strong>Role</strong></td>
                                    <td>{user.role_name}</td>
                                </tr>
                                <tr>
                                    <td><strong>Instance</strong></td>
                                    <td>{user.instance}</td>
                                </tr>
                            </tbody>
                        </table>
                        <input
                            type="button"
                            value="Edit"
                            className="btn btn-blue"
                            onClick={() => setIsEditing(true)}
                        />
                    </>
                ) : (
                    <form onSubmit={handleFormSubmit}>
                        <div className="form-row">
                            <div className="input-data">
                                <label>Name</label>
                                <input
                                    type="text"
                                    name="name"
                                    value={formData.name}
                                    onChange={handleInputChange}
                                    required
                                />
                            </div>

                        </div>
                        <div className="form-row">
                            <div className="input-data">
                                <label>NIP:</label>
                                <input
                                    type="text"
                                    name="nip"
                                    value={formData.nip}
                                    onChange={handleInputChange}
                                    required
                                />
                            </div>
                        </div>
                        <div className="form-row">
                            <div className="input-data">
                                <label>Email:</label>
                                <input
                                    type="email"
                                    name="email"
                                    value={formData.email}
                                    onChange={handleInputChange}
                                    required
                                />
                            </div>
                        </div>
                        <div className="form-row">
                            <div className="input-data">
                                <label>Password</label>
                                <div style={{ display: "flex", alignItems: "center" }}>
                                    <input
                                        type={passwordVisible ? "text" : "password"} // Toggle password visibility
                                        name="password"
                                        value={formData.password}
                                        onChange={handleInputChange}
                                        required
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setPasswordVisible(!passwordVisible)}
                                        style={{ marginLeft: "10px", background: "none", border: "none" }}
                                    >
                                        {passwordVisible ? <FaEyeSlash /> : <FaEye />}  {/* Icon to toggle visibility */}
                                    </button>
                                </div>
                            </div>
                        </div>
                        <div className="form-row">
                            <label>Role:</label>
                            <select
                                name="role_id"
                                value={formData.role_id}
                                onChange={handleInputChange}
                                required
                            >
                                <option value="">Select Role</option>
                                {roles.map((role) => (
                                    <option key={role.id} value={role.id}>
                                        {role.name}
                                    </option>
                                ))}
                            </select>
                        </div>
                        <div className="form-row">
                            <label>Instance:</label>
                            <select
                                name="instance_id"
                                value={formData.instance_id}
                                onChange={handleInputChange}
                                required
                            >
                                <option value="">Select Instance</option>
                                {instances.map((instance) => (
                                    <option key={instance.id} value={instance.id}>
                                        {instance.name}
                                    </option>
                                ))}
                            </select>
                        </div>
                        <div className="form-row submit-btn">
                            <div className="input-data">
                                <div className="inner"></div>
                                {/* <input type="submit" value="Save Changes" /> */}
                                <input
                                    type="submit"
                                    value="Save Changes"
                                    className="btn btn-blue"
                                />
                            </div>
                        </div>

                        <input
                            type="button"
                            value="Cancel"
                            className="btn btn-gray"
                            onClick={() => setIsEditing(false)}
                        />
                    </form>
                )}

                <input
                    type="button"
                    value={showHistory ? "Hide History" : "Show History"}
                    className="btn btn-gray"
                    onClick={handleToggleHistory}
                />

                {showHistory && (
                    <table className="history-table">
                        <thead className="thead">
                            <tr>
                                <th>Title</th>
                                <th>Date</th>
                                <th>Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {mergedData.map((item) => (
                                <tr key={item.id}>
                                    <td>{item.title}</td>
                                    <td>{formatDateTime(item.created_at)}</td>
                                    <td>{item.action}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}

            </div>
        </div>
    );
};

export default DetailUser;
