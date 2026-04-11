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
import './styles/global.css';

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
        <Route path="/" element={<Navigate to="/battle" replace />} />
      </Routes>
    </BrowserRouter>
  );
};

export default App;
