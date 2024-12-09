import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaEye, FaEyeSlash } from "react-icons/fa";

function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();
  const [passwordVisible, setPasswordVisible] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const response = await fetch('http://localhost:3000/api/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();
      // console.log(data);

      if (response.ok && data) {
        const user = {
          id: data.id,
          name: data.name,
          email: data.email,
          user_instance_id: data.instance_id,
          role_id: data.role_id
        };
        localStorage.setItem('user', JSON.stringify(user));
        window.dispatchEvent(new Event('storage'));
        navigate('/');
      } else {
        alert(data.error || 'Invalid login credentials');
      }
    } catch (error) {
      console.error("Login failed:", error);
      alert('Failed to connect to server');
    }
  };

  return (
    <div className="container-wrapper profile-container-wrapper">
      <div className="container">
        <div className="text text-gradient">Login</div>

        <div className="login-container">
          <form onSubmit={handleSubmit}>
            <div className="form-row">
              <div className="input-data">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
                <div className="underline"></div>
                <label>Email</label>
              </div>
            </div>

            <div className="form-row">
              <div className="input-data">
                <div style={{ display: "flex", alignItems: "center" }}>
                  <input
                    type={passwordVisible ? "text" : "password"} // Toggle password visibility
                    name="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
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
                <div className="underline"></div>
                <label>Password</label>
              </div>
            </div>

            <div className="form-row submit-btn">
              <div className="input-data">
                <div className="inner"></div>
                <input type="submit" value="Login" />
              </div>
            </div>
          </form>
        </div>

      </div>
    </div>
  );
}

export default Login;
