import React from "react";
import { BrowserRouter, Routes, Route, Link } from "react-router-dom";
import { Layout, Menu } from "antd";
import HomePage from "./pages/HomePage";
import GalleryPage from "./pages/GalleryPage";
import DetailPage from "./pages/DetailPage";
import VideoGalleryPage from "./pages/VideoGalleryPage";

const { Header, Content, Footer } = Layout;

function App() {
  // Define menu items using Ant Design structure
  const menuItems = [
    {
      key: "1",
      label: <Link to="/">Process Workspace</Link>,
    },
    {
      key: "2",
      label: <Link to="/video-library">Video Library</Link>, // New menu item!
    },
    {
      key: "3",
      label: <Link to="/gallery">Frames Gallery</Link>,
    },
  ];

  return (
    <BrowserRouter>
      <Layout style={{ minHeight: "100vh" }}>
        {/* Navbar Header using Ant Design */}
        <Header style={{ display: "flex", alignItems: "center" }}>
          <div
            style={{
              color: "white",
              fontWeight: "bold",
              marginRight: "40px",
              fontSize: "18px",
            }}
          >
            🧠 Video AI Classifier
          </div>
          <Menu
            theme="dark"
            mode="horizontal"
            defaultSelectedKeys={["1"]}
            items={menuItems}
            style={{ flex: 1 }}
          />
        </Header>

        {/* Dynamic Route Content */}
        <Content style={{ padding: "0 50px", marginTop: "24px" }}>
          <div
            style={{
              background: "#fff",
              padding: "24px",
              minHeight: "380px",
              borderRadius: "8px",
            }}
          >
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/video-library" element={<VideoGalleryPage />} />
              <Route path="/gallery" element={<GalleryPage />} />
              <Route path="/frame/:frameId" element={<DetailPage />} />
            </Routes>
          </div>
        </Content>

        {/* Shich Footer */}
        <Footer style={{ textAlign: "center" }}>
          Video Classification Project ©2026 Powered by Django & PyTorch
          Ensemble
        </Footer>
      </Layout>
    </BrowserRouter>
  );
}

export default App;
