import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './components/Navbar';
import Login from './pages/Login';
import Register from './pages/Register';
import Ranking from './pages/Ranking';
import Profile from './pages/Profile';
import Custom from './pages/Custom';
import Typing from './pages/Typing';
import Battle from './pages/Battle';
import Home from './pages/Home';
import Landing from './pages/Landing';
import './styles/global.css';

/** localStorage에 auth 플래그가 있으면 /home으로, 없으면 랜딩 */
const RootRoute: React.FC = () => {
  const isLoggedIn = localStorage.getItem('typers_auth') === 'true';
  return isLoggedIn ? <Navigate to="/home" replace /> : <Landing />;
};

const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <>
    <Navbar />
    {children}
  </>
);

const App: React.FC = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route
          path="/ranking"
          element={
            <Layout>
              <Ranking />
            </Layout>
          }
        />
        <Route
          path="/profile"
          element={
            <Layout>
              <Profile />
            </Layout>
          }
        />
        <Route
          path="/custom"
          element={
            <Layout>
              <Custom />
            </Layout>
          }
        />
        <Route
          path="/typing"
          element={
            <Layout>
              <Typing />
            </Layout>
          }
        />
        <Route
          path="/battle"
          element={
            <Layout>
              <Battle />
            </Layout>
          }
        />
        <Route path="/" element={<RootRoute />} />
        <Route
          path="/home"
          element={
            <Layout>
              <Home />
            </Layout>
          }
        />
      </Routes>
    </BrowserRouter>
  );
};

export default App;
