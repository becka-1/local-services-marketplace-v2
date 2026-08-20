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
    { id: "stats", label: <><i className="fa-solid fa-chart-bar"></i> Overview</> },
    { id: "users", label: <><i className="fa-solid fa-users"></i> Users</> },
    { id: "services", label: <><i className="fa-solid fa-screwdriver-wrench"></i> Services</> },
    { id: "requests", label: <><i className="fa-solid fa-envelope-open-text"></i> Requests</> },
    { id: "categories", label: <><i className="fa-solid fa-folder"></i> Categories</> },
    { id: "reports", label: <><i className="fa-solid fa-flag"></i> Reports</> },
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
