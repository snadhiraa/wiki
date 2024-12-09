import React, { useEffect, useState } from "react";
import { useLocation, Link } from "react-router-dom";

const Sidebar = ({ subheadings, tags, updatedAt, contentId, authorName }) => {
    const location = useLocation();
    const [editorName, setEditorName] = useState("Loading...");
    const isHomePage = location.pathname === "/";

    const defaultHomeContents = [
        { id: "welcome", title: "Selamat datang di Wiki Pemda" },
        { id: "organisasi", title: "Organisasi Perangkat" },
    ];

    useEffect(() => {
        if (contentId) {
            // Pastikan contentId ada sebelum melakukan fetch
            fetch(`http://localhost:3000/api/latest-editor-name/${contentId}`)
                .then((res) => res.json())
                .then((data) => {
                    setEditorName(data.editorName || "Unknown Editor");
                })
                .catch(() => setEditorName("Unknown Editor"));
        }
    }, [contentId]); // Hanya akan dijalankan saat contentId berubah

    return (
        <main className="main">
            <aside className="sidebar">
                <div className="sidebar-box">
                    <ul>
                        {(isHomePage || subheadings.length > 0) && (
                            <div className="small-box">
                                <h5 className="tags-title">PAGE CONTENTS</h5>
                                <ul className="link-list">
                                    {isHomePage
                                        ? defaultHomeContents.map((content) => (
                                            <li key={content.id}>
                                                <a href={`#${content.id}`}>{content.title}</a>
                                            </li>
                                        ))
                                        : subheadings.map((subheading) => (
                                            <li key={subheading.id}>
                                                <a href={`#${subheading.subheading}`}>
                                                    {subheading.subheading}
                                                </a>
                                            </li>
                                        ))}
                                </ul>
                            </div>
                        )}
                        <br />
                        <div className="small-box">
                            <h5 className="tags-title">TAGS</h5>
                            <ul className="link-list">
                                {location.pathname === "/" && (
                                    <li>
                                        <Link to="/" className="tag-link">
                                            <img
                                                src={require(`../assets/tag.png`)}
                                                alt="tag"
                                                className="tag"
                                            />
                                            Home
                                        </Link>
                                    </li>
                                )}
                                {tags &&
                                    tags.length > 0 &&
                                    tags.map((tag, index) => (
                                        <li key={index}>
                                            <Link
                                                to={`/search/${tag.trim()}`}
                                                className="tag-link"
                                            >
                                                <img
                                                    src={require(`../assets/tag.png`)}
                                                    alt="tag"
                                                    className="tag"
                                                />
                                                {tag.trim()}
                                            </Link>
                                        </li>
                                    ))}
                            </ul>
                        </div>
                        <br />
                        {!isHomePage && (
                            <div className="small-box">
                                <h5 className="tags-title">LAST EDITED BY</h5>
                                <ul className="link-list">
                                    {/* <li>{editorName}</li>
                                    {updatedAt && <li>at {updatedAt}</li>} */}
                                    <li>{editorName === "Unknown Editor" ? authorName : editorName}</li>
                                    {updatedAt && <li>at {updatedAt}</li>}
                                </ul>
                            </div>
                        )}
                    </ul>
                </div>
            </aside>
        </main>
    );
};

export default Sidebar;
