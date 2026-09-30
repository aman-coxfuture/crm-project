import React, { useEffect, useState } from "react";
import api from "../../services/api";
import { Bell } from "lucide-react";

export default function StudentNoticesPage() {
  const [notices, setNotices] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadNotices = async () => {
      try {
        setLoading(true);

        const response = await api.get("/notices/student");

        setNotices(response.notices || []);
      } catch (error) {
        console.error("Failed to load student notices:", error);
        setNotices([]);
      } finally {
        setLoading(false);
      }
    };

    loadNotices();
  }, []);

  if (loading) {
    return (
      <div className="page-container">
        <div className="card">Loading announcements...</div>
      </div>
    );
  }

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">
            <Bell size={26} color="var(--primary)" />
            Student Announcements & Circulars
          </h1>
          <p className="page-subtitle">
            School event announcements, holiday circulars and examination
            notifications
          </p>
        </div>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
        {notices.map((notice) => (
          <div key={notice._id} className="card card-hover">
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "flex-start",
                flexWrap: "wrap",
                gap: "10px",
                marginBottom: "8px",
              }}
            >
              <div>
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                    flexWrap: "wrap",
                  }}
                >
                  <h3 style={{ fontSize: "1.1rem", fontWeight: 800 }}>
                    {notice.title}
                  </h3>
                  <span
                    className={`badge ${notice.priority === "High" ? "badge-danger" : "badge-info"}`}
                  >
                    {notice.priority}
                  </span>
                </div>
                <div
                  style={{
                    fontSize: "0.75rem",
                    color: "var(--text-tertiary)",
                    marginTop: "3px",
                  }}
                >
                  Published by <strong>{notice.author}</strong> on{" "}
                  {notice.createdAt
                    ? new Date(notice.createdAt).toLocaleDateString("en-IN", {
                        day: "2-digit",
                        month: "short",
                        year: "numeric",
                      })
                    : "—"}
                </div>
              </div>
            </div>
            <p
              style={{
                fontSize: "0.9rem",
                color: "var(--text-secondary)",
                lineHeight: "1.6",
              }}
            >
              {notice.content}
            </p>
          </div>
        ))}
        {notices.length === 0 && (
          <div className="card">
            <div
              style={{
                textAlign: "center",
                padding: "32px",
                color: "var(--text-tertiary)",
              }}
            >
              No announcements or circulars available.
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
