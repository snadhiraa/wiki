import React, { useState } from 'react';
import { BrowserRouter as Router, Route, Routes, useLocation } from 'react-router-dom';
import Home from './pages/Home';
import Informasi from './pages/Informasi';
import Navbar from './component/Navbar';
import Sidebar from './component/Sidebar';
import Footer from './component/Footer';
// import './styles/App.css';
import './styles/index.css';
import Edit from './pages/Edit';
import Login from './pages/Login';
import Profile from './pages/Profile';
import AddContent from './pages/AddContent';
import AddSubheading from './pages/AddSubheading';
import SearchContent from './pages/SearchContent';
import ManageUser from './pages/ManageUser';
import DetailUser from './pages/DetailUser';

const App = () => {
  const [subheadings, setSubheadings] = useState([]);
  const [tags, setTags] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [updatedAt, setUpdatedAt] = useState('');
  const [authorName, setAuthorName] = useState('');
  const [contentId, setContentId] = useState(null);

  const SidebarWrapper = () => {
    const location = useLocation();
    const isHomePage = location.pathname === '/';
    const isSidebarVisible = location.pathname === '/' || location.pathname.startsWith('/informasi/');

    return isSidebarVisible ? (
      <Sidebar
        subheadings={subheadings}
        tags={tags}
        setSearchTerm={setSearchTerm}
        updatedAt={!isHomePage ? updatedAt : ''}
        contentId={contentId}
        authorName={authorName}
      />
    ) : null;
  };

  const FooterWrapper = () => {
    const location = useLocation();
    const isFooterVisible =
      location.pathname === '/' || location.pathname.startsWith('/informasi/');
    return isFooterVisible ? <Footer /> : null;
  };

  return (
    <Router>
      <Navbar searchTerm={searchTerm} setSearchTerm={setSearchTerm} />
      <SidebarWrapper />
      <div className="App">
        <Routes>
          <Route path="/" element={<Home
            setSubheadings={setSubheadings}
            setTags={setTags} />} />
          <Route path="/informasi/:id" element={<Informasi
            setSubheadings={setSubheadings}
            setTags={setTags}
            setUpdatedAt={setUpdatedAt}
            setContentId={setContentId}
            setAuthorName={setAuthorName} />} />
          <Route path="/edit/:id" element={<Edit />} />
          <Route path="/login" element={<Login />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/addcontent" element={<AddContent />} />
          <Route path="/addsubheading/:id" element={<AddSubheading />} />
          <Route path="/search/:term" element={<SearchContent />} />
          <Route path="/manage" element={<ManageUser />} />
          <Route path="/detail/:id" element={<DetailUser />} />
        </Routes>
      </div>
      <FooterWrapper />
    </Router>
  );
};

export default App;
