import { useState } from "react";
import StatsTab from "./admin/StatsTab.jsx";
import UsersTab from "./admin/UsersTab.jsx";
import ServicesTab from "./admin/ServicesTab.jsx";
import RequestsTab from "./admin/RequestsTab.jsx";
import CategoriesTab from "./admin/CategoriesTab.jsx";
import ReportsTab from "./admin/ReportsTab.jsx";
import "./AdminDashboard.css";

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState("stats");

  const tabs = [
    { id: "stats", label: "📊 Overview" },
    { id: "users", label: "👥 Users" },
    { id: "services", label: "🛠️ Services" },
    { id: "requests", label: "📨 Requests" },
    { id: "categories", label: "📁 Categories" },
    { id: "reports", label: "🚩 Reports" },
  ];

  const renderTabContent = () => {
    switch (activeTab) {
      case "stats":
        return <StatsTab />;
      case "users":
        return <UsersTab />;
      case "services":
        return <ServicesTab />;
      case "requests":
        return <RequestsTab />;
      case "categories":
        return <CategoriesTab />;
      case "reports":
        return <ReportsTab />;
      default:
        return <StatsTab />;
    }
  };

  return (
    <div className="admin-dashboard-layout">
      <aside className="admin-sidebar">
        <h2 className="admin-brand">Admin Console</h2>
        <nav className="admin-nav">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              className={`admin-nav-btn ${activeTab === tab.id ? "active" : ""}`}
              onClick={() => setActiveTab(tab.id)}
            >
              {tab.label}
            </button>
          ))}
        </nav>
      </aside>
      
      <main className="admin-main-content">
        {renderTabContent()}
      </main>
    </div>
  );
};

export default AdminDashboard;
