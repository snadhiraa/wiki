import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

const Profile = () => {
    const navigate = useNavigate();
    const [user, setUser] = useState(null);

    useEffect(() => {
        const fetchUserData = async () => {
            const userData = JSON.parse(localStorage.getItem('user'));
            if (!userData) {
                navigate('/login');
                return;
            }

            try {
                const response = await fetch(`http://localhost:3000/api/user/${userData.id}`);
                if (response.ok) {
                    const data = await response.json();
                    setUser(data);
                } else {
                    throw new Error('Failed to fetch user data');
                }
            } catch (error) {
                console.error(error);
                navigate('/login');
            }
        };

        fetchUserData();
    }, [navigate]);

    const handleLogoutConfirmation = () => {
        const isConfirmed = window.confirm("Apakah Anda yakin ingin keluar dari akun?");
        if (isConfirmed) {
            handleLogout();
        }
    };

    const handleLogout = () => {
        localStorage.removeItem('user');
        navigate('/');
    };

    if (!user) {
        return <p>Loading...</p>;
    }

    return (
        <div className="container-wrapper profile-container-wrapper">
            <div className="container">
                <div className="text text-gradient">User Info</div>
                <table className="profile-table">
                    <tbody>
                        <tr>
                            <td><strong>Nama</strong></td>
                            <td>{user.name}</td>
                        </tr>
                        <tr>
                            <td><strong>NIP (Nomor Induk Pegawai)</strong></td>
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
                            <td><strong>Instansi</strong></td>
                            <td>{user.instance}</td>
                        </tr>
                    </tbody>
                </table>
                <button onClick={handleLogoutConfirmation} className="btn btn-red">Logout</button>
            </div>
        </div>
    );
};

export default Profile;

