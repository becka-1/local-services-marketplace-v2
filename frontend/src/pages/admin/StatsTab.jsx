import { useState, useEffect, useCallback } from "react";
import { getAdminStats } from "../../services/adminApi.js";

const StatsTab = ({ onNavigate }) => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");
  const [lastUpdated, setLastUpdated] = useState(null);

  const fetchStats = useCallback(async (isRefresh = false) => {
    try {
      if (isRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }
      setError("");
      const data = await getAdminStats();
      setStats(data);
      setLastUpdated(new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }));
    } catch (err) {
      console.error("Error fetching stats:", err);
      setError("Failed to load statistics. Please try again.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  if (loading) {
    return (
      <div className="admin-overview-wrapper">
        <div className="admin-tab-header">
          <div className="admin-tab-header-text">
            <h2>Marketplace Overview</h2>
            <p>Loading real-time marketplace metrics...</p>
          </div>
        </div>
        <div className="stats-grid">
          {[1, 2, 3, 4, 5].map((item) => (
            <div key={item} className="stat-card stat-card-skeleton">
              <div className="skeleton-header">
                <div className="skeleton-line skeleton-title"></div>
                <div className="skeleton-icon"></div>
              </div>
              <div className="skeleton-line skeleton-value"></div>
              <div className="skeleton-line skeleton-footer"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="admin-overview-wrapper">
        <div className="admin-tab-header">
          <div className="admin-tab-header-text">
            <h2>Marketplace Overview</h2>
            <p>Platform metrics and summary</p>
          </div>
        </div>
        <div className="admin-error-card">
          <div className="admin-error-icon">
            <i className="fa-solid fa-triangle-exclamation"></i>
          </div>
          <h3>Unable to Load Statistics</h3>
          <p>{error}</p>
          <button className="admin-btn-retry" onClick={() => fetchStats()}>
            <i className="fa-solid fa-rotate-right"></i> Try Again
          </button>
        </div>
      </div>
    );
  }

  if (!stats) return null;

  // Derived metrics
  const totalReq = stats.totalRequests || 0;
  const compReq = stats.completedRequests || 0;
  const pendReq = stats.pendingRequests || 0;
  const otherReq = Math.max(0, totalReq - (compReq + pendReq));

  const completionRate = totalReq > 0 ? Math.round((compReq / totalReq) * 100) : 0;
  const pendingRate = totalReq > 0 ? Math.round((pendReq / totalReq) * 100) : 0;
  const otherRate = totalReq > 0 ? Math.round((otherReq / totalReq) * 100) : 0;

  const statCards = [
    {
      id: "users",
      title: "Total Users",
      value: stats.totalUsers ?? 0,
      icon: "fa-users",
      theme: "theme-users",
      helper: "Registered accounts",
      badgeIcon: "fa-user-check",
      targetTab: "users",
      actionText: "Manage Users"
    },
    {
      id: "services",
      title: "Total Services",
      value: stats.totalServices ?? 0,
      icon: "fa-screwdriver-wrench",
      theme: "theme-services",
      helper: "Active listings",
      badgeIcon: "fa-briefcase",
      targetTab: "services",
      actionText: "View Services"
    },
    {
      id: "requests",
      title: "Total Requests",
      value: stats.totalRequests ?? 0,
      icon: "fa-envelope-open-text",
      theme: "theme-requests",
      helper: "All-time bookings",
      badgeIcon: "fa-list-check",
      targetTab: "requests",
      actionText: "All Requests"
    },
    {
      id: "pending",
      title: "Pending Requests",
      value: stats.pendingRequests ?? 0,
      icon: "fa-hourglass-half",
      theme: "theme-pending",
      helper: `${pendingRate}% of total`,
      badgeIcon: "fa-clock",
      targetTab: "requests",
      actionText: "Action Needed"
    },
    {
      id: "completed",
      title: "Completed Requests",
      value: stats.completedRequests ?? 0,
      icon: "fa-circle-check",
      theme: "theme-completed",
      helper: `${completionRate}% success rate`,
      badgeIcon: "fa-circle-check",
      targetTab: "requests",
      actionText: "Fulfilled"
    }
  ];

  return (
    <div className="admin-overview-wrapper">
      {/* Overview Header */}
      <div className="admin-tab-header">
        <div className="admin-tab-header-text">
          <h2>Marketplace Overview</h2>
          <p>Real-time platform performance and operational metrics</p>
        </div>
        <div className="admin-tab-header-actions">
          <div className="admin-live-badge">
            <span className="live-pulse-dot"></span>
            <span>Live Data</span>
            {lastUpdated && <span className="last-sync-time">({lastUpdated})</span>}
          </div>
          <button
            className={`admin-refresh-btn ${refreshing ? "spinning" : ""}`}
            onClick={() => fetchStats(true)}
            disabled={refreshing}
            title="Refresh statistics"
            aria-label="Refresh statistics"
          >
            <i className={`fa-solid fa-rotate-right ${refreshing ? "fa-spin" : ""}`}></i>
            <span>{refreshing ? "Updating..." : "Refresh"}</span>
          </button>
        </div>
      </div>

      {/* Main Metric Cards Grid */}
      <div className="stats-grid">
        {statCards.map((card) => (
          <div
            key={card.id}
            className={`stat-card ${card.theme}`}
            onClick={() => onNavigate && card.targetTab && onNavigate(card.targetTab)}
            role={onNavigate ? "button" : undefined}
            tabIndex={onNavigate ? 0 : undefined}
            onKeyDown={(e) => {
              if (e.key === "Enter" && onNavigate && card.targetTab) {
                onNavigate(card.targetTab);
              }
            }}
          >
            <div className="stat-card-header">
              <span className="stat-card-title">{card.title}</span>
              <div className={`stat-card-icon-wrap icon-${card.id}`}>
                <i className={`fa-solid ${card.icon}`}></i>
              </div>
            </div>

            <div className="stat-card-body">
              <span className="stat-card-value">
                {typeof card.value === "number" ? card.value.toLocaleString() : card.value}
              </span>
            </div>

            <div className="stat-card-footer">
              <span className="stat-card-helper">
                <i className={`fa-solid ${card.badgeIcon}`}></i>
                <span>{card.helper}</span>
              </span>
              {onNavigate && (
                <span className="stat-card-action-link">
                  <span>{card.actionText}</span>
                  <i className="fa-solid fa-chevron-right"></i>
                </span>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Additional Overview Boxes: Fulfillment Breakdown & Quick Navigation */}
      <div className="overview-bottom-grid">
        {/* Request Fulfillment Breakdown Card */}
        <div className="overview-insight-card">
          <div className="insight-card-header">
            <div className="insight-card-title-group">
              <div className="insight-icon-box fulfillment-icon">
                <i className="fa-solid fa-chart-pie"></i>
              </div>
              <div>
                <h3>Request Fulfillment Analytics</h3>
                <p>Status breakdown across {totalReq} total service requests</p>
              </div>
            </div>
            <span className="insight-pill-badge">{completionRate}% Fulfilled</span>
          </div>

          {/* Segmented Multi-Color Progress Bar */}
          <div className="fulfillment-progress-bar-container">
            <div className="fulfillment-progress-track">
              {totalReq === 0 ? (
                <div className="progress-segment segment-empty" style={{ width: "100%" }}></div>
              ) : (
                <>
                  <div
                    className="progress-segment segment-completed"
                    style={{ width: `${completionRate}%` }}
                    title={`Completed: ${compReq} (${completionRate}%)`}
                  ></div>
                  <div
                    className="progress-segment segment-pending"
                    style={{ width: `${pendingRate}%` }}
                    title={`Pending: ${pendReq} (${pendingRate}%)`}
                  ></div>
                  <div
                    className="progress-segment segment-other"
                    style={{ width: `${otherRate}%` }}
                    title={`Other/Cancelled/Rejected: ${otherReq} (${otherRate}%)`}
                  ></div>
                </>
              )}
            </div>
          </div>

          {/* Metrics Legends */}
          <div className="fulfillment-legend-grid">
            <div className="legend-item legend-completed">
              <span className="legend-dot dot-completed"></span>
              <div className="legend-info">
                <span className="legend-name">Completed</span>
                <span className="legend-count">{compReq} ({completionRate}%)</span>
              </div>
            </div>
            <div className="legend-item legend-pending">
              <span className="legend-dot dot-pending"></span>
              <div className="legend-info">
                <span className="legend-name">Pending</span>
                <span className="legend-count">{pendReq} ({pendingRate}%)</span>
              </div>
            </div>
            <div className="legend-item legend-other">
              <span className="legend-dot dot-other"></span>
              <div className="legend-info">
                <span className="legend-name">Other / Rejected</span>
                <span className="legend-count">{otherReq} ({otherRate}%)</span>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Management Shortcuts */}
        <div className="overview-insight-card">
          <div className="insight-card-header">
            <div className="insight-card-title-group">
              <div className="insight-icon-box shortcuts-icon">
                <i className="fa-solid fa-bolt"></i>
              </div>
              <div>
                <h3>Quick Management Shortcuts</h3>
                <p>Fast access to frequent administration workflows</p>
              </div>
            </div>
          </div>

          <div className="quick-shortcuts-grid">
            <button
              className="shortcut-btn"
              onClick={() => onNavigate && onNavigate("users")}
            >
              <div className="shortcut-icon-wrap icon-users">
                <i className="fa-solid fa-users"></i>
              </div>
              <div className="shortcut-text">
                <strong>Manage Users</strong>
                <span>Inspect roles & profiles</span>
              </div>
              <i className="fa-solid fa-arrow-right shortcut-arrow"></i>
            </button>

            <button
              className="shortcut-btn"
              onClick={() => onNavigate && onNavigate("services")}
            >
              <div className="shortcut-icon-wrap icon-services">
                <i className="fa-solid fa-screwdriver-wrench"></i>
              </div>
              <div className="shortcut-text">
                <strong>Service Catalog</strong>
                <span>Review & moderate services</span>
              </div>
              <i className="fa-solid fa-arrow-right shortcut-arrow"></i>
            </button>

            <button
              className="shortcut-btn"
              onClick={() => onNavigate && onNavigate("requests")}
            >
              <div className="shortcut-icon-wrap icon-requests">
                <i className="fa-solid fa-envelope-open-text"></i>
              </div>
              <div className="shortcut-text">
                <strong>Service Requests</strong>
                <span>Track booking workflows</span>
              </div>
              <i className="fa-solid fa-arrow-right shortcut-arrow"></i>
            </button>

            <button
              className="shortcut-btn"
              onClick={() => onNavigate && onNavigate("categories")}
            >
              <div className="shortcut-icon-wrap icon-categories">
                <i className="fa-solid fa-folder-plus"></i>
              </div>
              <div className="shortcut-text">
                <strong>Categories</strong>
                <span>Add & organize categories</span>
              </div>
              <i className="fa-solid fa-arrow-right shortcut-arrow"></i>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StatsTab;
