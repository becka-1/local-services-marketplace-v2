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
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const tabs = [
    { id: "stats", icon: "fa-chart-bar", label: "Overview" },
    { id: "users", icon: "fa-users", label: "Users" },
    { id: "services", icon: "fa-screwdriver-wrench", label: "Services" },
    { id: "requests", icon: "fa-envelope-open-text", label: "Requests" },
    { id: "categories", icon: "fa-folder", label: "Categories" },
    { id: "reports", icon: "fa-flag", label: "Reports" },
  ];

  const handleTabSelect = (id) => {
    setActiveTab(id);
    setIsSidebarOpen(false); // close sidebar on mobile after selection
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case "stats": return <StatsTab onNavigate={handleTabSelect} />;
      case "users": return <UsersTab />;
      case "services": return <ServicesTab />;
      case "requests": return <RequestsTab />;
      case "categories": return <CategoriesTab />;
      case "reports": return <ReportsTab />;
      default: return <StatsTab onNavigate={handleTabSelect} />;
    }
  };

  return (
    <div className="admin-dashboard-layout">
      <div className="admin-mobile-header">
        <span className="admin-brand-mobile">Admin Console</span>
        <button
          className="admin-sidebar-toggle"
          onClick={() => setIsSidebarOpen(!isSidebarOpen)}
          aria-label="Toggle sidebar"
        >
          <i className={`fa-solid ${isSidebarOpen ? "fa-xmark" : "fa-bars"}`}></i>
        </button>
      </div>

      {isSidebarOpen && (
        <div className="admin-sidebar-overlay" onClick={() => setIsSidebarOpen(false)} />
      )}

      <aside className={`admin-sidebar ${isSidebarOpen ? "mobile-open" : ""}`}>
        <h2 className="admin-brand">Admin Console</h2>
        <nav className="admin-nav">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              className={`admin-nav-btn ${activeTab === tab.id ? "active" : ""}`}
              onClick={() => handleTabSelect(tab.id)}
            >
              <i className={`fa-solid ${tab.icon}`}></i>
              <span>{tab.label}</span>
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
