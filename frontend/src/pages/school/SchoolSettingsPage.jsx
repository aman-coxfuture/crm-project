import React, { useEffect, useState } from "react";
import { settingsService } from "../../services";
import { useAuth } from "../../context/AuthContext";
import { useToast } from "../../context/ToastContext";
import { FormInput, Select, Textarea } from "../../components/common/FormInput";
import { Settings, Save } from "lucide-react";

export default function SchoolSettingsPage() {
  const { selectedSchool, changeSchool } = useAuth();
  const { success } = useToast();

  const [formData, setFormData] = useState({
    name: selectedSchool?.name || "Greenwood International Public School",
    schoolCode: selectedSchool?.schoolCode || "GIPS-101",
    principal: selectedSchool?.principal || "Dr. Robert Harrison",
    email: selectedSchool?.email || "principal@greenwood.edu",
    phone: selectedSchool?.phone || "+1 (555) 234-5678",
    address:
      selectedSchool?.address || "452 Elmwood Avenue, North District, NY 10024",
    website: selectedSchool?.website || "https://greenwood.edu",
    establishedYear: selectedSchool?.establishedYear || "2005",
    affiliation: selectedSchool?.affiliation || "CBSE / State Board",
    academicSession: selectedSchool?.academicSession || "2025-2026",
    logo: selectedSchool?.logo || "🏫",
  });

  useEffect(() => {
    const loadSchoolSettings = async () => {
      try {
        const data = await settingsService.getInstitutionSettings();

        if (!data) return;

        const hasSavedProfile =
          data.institutionName ||
          data.schoolCode ||
          data.principal ||
          data.email ||
          data.phone ||
          data.address ||
          data.website ||
          data.establishedYear;

        // If MongoDB already has school profile data,
        // load it into the form.
        if (hasSavedProfile) {
          setFormData((prev) => ({
            ...prev,
            name: data.institutionName || prev.name,
            schoolCode: data.schoolCode || prev.schoolCode,
            principal: data.principal || prev.principal,
            email: data.email || prev.email,
            phone: data.phone || prev.phone,
            address: data.address || prev.address,
            website: data.website || prev.website,
            establishedYear: data.establishedYear || prev.establishedYear,
            affiliation: data.affiliation || prev.affiliation,
            academicSession: data.academicSession || prev.academicSession,
            logo: data.logo || prev.logo,
          }));
        }
      } catch (error) {
        console.error("Failed to load school settings:", error);
      }
    };

    loadSchoolSettings();
  }, []);

  const handleSave = async (e) => {
    e.preventDefault();

    try {
      const updatedSettings = await settingsService.updateInstitutionSettings({
        institutionName: formData.name,
        schoolCode: formData.schoolCode,
        principal: formData.principal,
        email: formData.email,
        phone: formData.phone,
        address: formData.address,
        website: formData.website,
        establishedYear: formData.establishedYear,
        affiliation: formData.affiliation,
        academicSession: formData.academicSession,
        logo: formData.logo,
      });

      // Keep the currently selected school in sync
      changeSchool({
        ...selectedSchool,
        name: formData.name,
        schoolCode: formData.schoolCode,
        principal: formData.principal,
        email: formData.email,
        phone: formData.phone,
        address: formData.address,
        website: formData.website,
        establishedYear: formData.establishedYear,
        affiliation: formData.affiliation,
        academicSession: formData.academicSession,
        logo: formData.logo,
      });

      success(
        updatedSettings
          ? "School profile and branding updated successfully!"
          : "School profile updated successfully!",
      );
    } catch (error) {
      console.error("Failed to save school settings:", error);

      success("Failed to update school profile.");
    }
  };

  return (
    <div style={{ maxWidth: "960px" }}>
      <div className="page-header">
        <div>
          <h1 className="page-title">
            <Settings size={26} color="var(--primary)" />
            School Profile & Institutional Branding
          </h1>
          <p className="page-subtitle">
            Configure school identity, academic session cycles, affiliation and
            official contact info
          </p>
        </div>
      </div>

      <form onSubmit={handleSave}>
        <div className="card" style={{ marginBottom: "24px" }}>
          <div className="card-header">
            <h3 className="card-title">Institutional Brand & Identity</h3>
          </div>

          <div
            style={{
              display: "flex",
              gap: "16px",
              alignItems: "center",
              marginBottom: "20px",
            }}
          >
            <div
              style={{
                width: "64px",
                height: "64px",
                borderRadius: "var(--radius-lg)",
                backgroundColor: "var(--primary-light)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "2rem",
              }}
            >
              {formData.logo}
            </div>
            <div>
              <div style={{ fontWeight: 700 }}>Campus Mascot / Emoji Logo</div>
              <div style={{ display: "flex", gap: "6px", marginTop: "6px" }}>
                {["🏫", "⛪", "🌲", "🚀", "🏛️", "🎓", "📚"].map((emoji) => (
                  <button
                    key={emoji}
                    type="button"
                    onClick={() => setFormData({ ...formData, logo: emoji })}
                    style={{
                      padding: "4px 8px",
                      fontSize: "1.2rem",
                      border:
                        formData.logo === emoji
                          ? "2px solid var(--primary)"
                          : "1px solid var(--border-color)",
                      borderRadius: "var(--radius-sm)",
                      background: "var(--bg-tertiary)",
                      cursor: "pointer",
                    }}
                  >
                    {emoji}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="grid-2">
            <FormInput
              label="School Official Name"
              required
              value={formData.name}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
            />
            <FormInput
              label="School Code / Registration ID"
              value={formData.schoolCode}
              onChange={(e) =>
                setFormData({ ...formData, schoolCode: e.target.value })
              }
            />
          </div>

          <div className="grid-2">
            <FormInput
              label="Principal / Head of School"
              required
              value={formData.principal}
              onChange={(e) =>
                setFormData({ ...formData, principal: e.target.value })
              }
            />
            <FormInput
              label="Official Email Address"
              type="email"
              value={formData.email}
              onChange={(e) =>
                setFormData({ ...formData, email: e.target.value })
              }
            />
          </div>

          <div className="grid-2">
            <FormInput
              label="Telephone / Contact Line"
              value={formData.phone}
              onChange={(e) =>
                setFormData({ ...formData, phone: e.target.value })
              }
            />
            <FormInput
              label="Official Website URL"
              value={formData.website}
              onChange={(e) =>
                setFormData({ ...formData, website: e.target.value })
              }
            />
          </div>

          <div className="grid-3">
            <Select
              label="Academic Session Cycle"
              value={formData.academicSession}
              onChange={(e) =>
                setFormData({ ...formData, academicSession: e.target.value })
              }
              options={["2025-2026", "2026-2027"]}
            />
            <Select
              label="Accreditation & Board"
              value={formData.affiliation}
              onChange={(e) =>
                setFormData({ ...formData, affiliation: e.target.value })
              }
              options={[
                "CBSE / State Board",
                "ICSE / Cambridge",
                "IB World School",
                "Other State Board",
              ]}
            />
            <FormInput
              label="Established Year"
              value={formData.establishedYear}
              onChange={(e) =>
                setFormData({ ...formData, establishedYear: e.target.value })
              }
            />
          </div>

          <Textarea
            label="Campus Postal Address"
            value={formData.address}
            onChange={(e) =>
              setFormData({ ...formData, address: e.target.value })
            }
            rows={2}
          />
        </div>

        <button type="submit" className="btn btn-primary btn-lg">
          <Save size={18} />
          <span>Save School Profile</span>
        </button>
      </form>
    </div>
  );
}
