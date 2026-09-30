import React, { useEffect, useState } from "react";
import api from "../../services/api";
import { Bell, Calendar } from "lucide-react";

export default function TeacherNoticesPage() {
  const [notices, setNotices] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadNotices = async () => {
      try {
        setLoading(true);

        const response = await api.get("/notices");

        setNotices(response?.notices || []);
      } catch (error) {
        console.error("Failed to load notices:", error);
        setNotices([]);
      } finally {
        setLoading(false);
      }
    };

    loadNotices();
  }, []);

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">
            <Bell size={26} color="var(--primary)" />
            Faculty Notice Bulletin
          </h1>
          <p className="page-subtitle">
            Academic directives, staff circulars and institutional announcements
          </p>
        </div>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
        {loading ? (
          <div className="card">
            <p style={{ color: "var(--text-secondary)" }}>Loading notices...</p>
          </div>
        ) : notices.length === 0 ? (
          <div className="card">
            <p style={{ color: "var(--text-secondary)" }}>
              No notices available.
            </p>
          </div>
        ) : (
          notices.map((notice) => (
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
                    Issued by <strong>{notice.author}</strong> on{" "}
                    {new Date(notice.createdAt).toLocaleDateString("en-GB", {
                      day: "2-digit",
                      month: "short",
                      year: "numeric",
                    })}
                  </div>
                </div>
                <span className="badge badge-primary">
                  Audience: {notice.audience}
                </span>
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
          ))
        )}
      </div>
    </div>
  );
}
