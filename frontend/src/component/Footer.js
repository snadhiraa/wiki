import React from 'react';
import logo from '../assets/logojogja.png';

const Footer = () => {
    return (
        <footer className="footer">
            <div className="footer-content">
                <p className="footer-logo">
                    <img src={logo} alt="Logo Pemda DIY" className="logo" />
                    &copy; 2024 Pemda DIY. All rights reserved.
                </p>
            </div>
        </footer>
    );
};

export default Footer;
