import React, { useEffect, useState } from "react";
import { settingsService } from "../../services";
import { useToast } from "../../context/ToastContext";
import { FormInput, Select } from "../../components/common/FormInput";
import { Settings, Shield, Server, Bell, Save } from "lucide-react";

export default function SuperAdminSettingsPage() {
  const { success } = useToast();
  const [platformName, setPlatformName] = useState(
    "EduEnterprise Global School CRM",
  );
  const [supportEmail, setSupportEmail] = useState("support@schoolcrm.io");
  const [sessionTimeout, setSessionTimeout] = useState("60");
  const [maintenanceMode, setMaintenanceMode] = useState(false);
  const [academicYear, setAcademicYear] = useState("2025-2026");
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    const loadSettings = async () => {
      try {
        const data = await settingsService.getSuperAdminSettings();

        if (data) {
          setPlatformName(
            data.platformName || "EduEnterprise Global School CRM",
          );
          setSupportEmail(data.supportEmail || "support@schoolcrm.io");
          setAcademicYear(data.academicYear || "2025-2026");
          setSessionTimeout(data.sessionTimeout || "60");
          setMaintenanceMode(data.maintenanceMode ?? false);
        }
      } catch (error) {
        console.error("Failed to load super admin settings:", error);
      } finally {
        setLoading(false);
      }
    };

    loadSettings();
  }, []);

  const handleSave = async (e) => {
    e.preventDefault();

    try {
      await settingsService.updateSuperAdminSettings({
        platformName,
        supportEmail,
        academicYear,
        sessionTimeout,
        maintenanceMode,
      });

      success("Platform settings saved successfully");
    } catch (error) {
      console.error("Failed to save super admin settings:", error);
      success("Failed to save platform settings");
    }
  };
  return (
    <div style={{ maxWidth: "900px" }}>
      <div className="page-header">
        <div>
          <h1 className="page-title">
            <Settings size={26} color="var(--primary)" />
            Platform & System Settings
          </h1>
          <p className="page-subtitle">
            Configure global defaults, multi-tenant parameters and system
            governance
          </p>
        </div>
      </div>

      <form onSubmit={handleSave}>
        <div className="card" style={{ marginBottom: "24px" }}>
          <div className="card-header">
            <h3 className="card-title">Global Platform Identity</h3>
          </div>
          <div className="grid-2">
            <FormInput
              label="Platform Branding Name"
              value={platformName}
              onChange={(e) => setPlatformName(e.target.value)}
            />
            <FormInput
              label="Global Tech Support Email"
              type="email"
              value={supportEmail}
              onChange={(e) => setSupportEmail(e.target.value)}
            />
          </div>
          <div className="grid-2">
            <Select
              label="Default Academic Year Schema"
              value={academicYear}
              onChange={(e) => setAcademicYear(e.target.value)}
              options={["2025-2026", "2026-2027"]}
            />
            <FormInput
              label="Session Inactivity Timeout (Minutes)"
              value={sessionTimeout}
              onChange={(e) => setSessionTimeout(e.target.value)}
            />
          </div>
        </div>

        <div className="card" style={{ marginBottom: "24px" }}>
          <div className="card-header">
            <h3 className="card-title">Security & Maintenance</h3>
          </div>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              padding: "12px 0",
            }}
          >
            <div>
              <div style={{ fontWeight: 700 }}>Maintenance Mode</div>
              <div
                style={{ fontSize: "0.8rem", color: "var(--text-secondary)" }}
              >
                Restrict access across all school subdomains for scheduled
                upgrades
              </div>
            </div>
            <input
              type="checkbox"
              checked={maintenanceMode}
              onChange={(e) => setMaintenanceMode(e.target.checked)}
              style={{
                width: "20px",
                height: "20px",
                accentColor: "var(--primary)",
                cursor: "pointer",
              }}
            />
          </div>
        </div>

        <button type="submit" className="btn btn-primary btn-lg">
          <Save size={18} />
          <span>Save Global Configurations</span>
        </button>
      </form>
    </div>
  );
}
