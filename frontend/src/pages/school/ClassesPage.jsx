import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useToast } from "../../context/ToastContext";
import Modal from "../../components/common/Modal";
import { FormInput } from "../../components/common/FormInput";
import { Layers, Plus, Users, Clock } from "lucide-react";
import api from "../../services/api";

export default function ClassesPage() {
  const navigate = useNavigate();
  const { success, error } = useToast();

  const [classes, setClasses] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [loading, setLoading] = useState(true);

  const [isAddSectionModalOpen, setIsAddSectionModalOpen] = useState(false);
  const [targetClass, setTargetClass] = useState(null);

  const [newSection, setNewSection] = useState({
    name: "Section C",
    classTeacher: "",
    studentCount: 30,
    room: "Room 208",
  });

  // Load classes + teachers from backend
  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);

      const [classesResponse, teachersResponse] = await Promise.all([
        api.get("/classes"),
        api.get("/faculty"),
      ]);

      const backendClasses = classesResponse?.classes || [];
      const backendTeachers = teachersResponse?.faculty || [];

      setClasses(backendClasses);
      setTeachers(backendTeachers);
    } catch (err) {
      console.error("Failed to load classes:", err);

      error(
        err?.response?.data?.message ||
          "Failed to load classes. Please try again.",
      );
    } finally {
      setLoading(false);
    }
  };

  const handleAddSectionSubmit = async (e) => {
    e.preventDefault();

    if (!targetClass) return;

    const sectionName = newSection.name.replace(/^Section\s+/i, "").trim();

    if (!sectionName) {
      error("Please enter a section name.");
      return;
    }

    // Backend SchoolClass currently stores sections as strings.
    const existingSections = targetClass.sections || [];

    if (
      existingSections.some(
        (section) =>
          String(section).toLowerCase() === sectionName.toLowerCase(),
      )
    ) {
      error(`Section ${sectionName} already exists.`);
      return;
    }

    try {
      const updatedSections = [...existingSections, sectionName];

      await api.put(`/classes/${targetClass._id}`, {
        name: targetClass.name,
        sections: updatedSections,
      });

      setIsAddSectionModalOpen(false);

      setNewSection({
        name: "Section C",
        classTeacher: "",
        studentCount: 30,
        room: "Room 208",
      });

      success(`New section added to Class ${targetClass.name}!`);

      await loadData();
    } catch (err) {
      console.error("Failed to add section:", err);

      error(
        err?.response?.data?.message ||
          "Failed to add section. Please try again.",
      );
    }
  };

  const getClassNumericGrade = (className) => {
    const match = String(className || "").match(/\d+/);
    return match ? match[0] : className;
  };

  if (loading) {
    return (
      <div>
        <div className="page-header">
          <div>
            <h1 className="page-title">
              <Layers size={26} color="var(--primary)" />
              Class & Section Management (Nursery – Class 10)
            </h1>
            <p className="page-subtitle">
              Configure grades, divisions, assigned educators and 7-period
              subject curriculum
            </p>
          </div>
        </div>

        <div className="card" style={{ padding: "40px", textAlign: "center" }}>
          Loading classes...
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">
            <Layers size={26} color="var(--primary)" />
            Class & Section Management (Nursery – Class 10)
          </h1>

          <p className="page-subtitle">
            Configure grades, divisions, assigned educators and 7-period subject
            curriculum
          </p>
        </div>
      </div>

      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: "20px",
        }}
      >
        {classes.length === 0 ? (
          <div
            className="card"
            style={{
              padding: "40px",
              textAlign: "center",
              color: "var(--text-tertiary)",
            }}
          >
            No classes found.
          </div>
        ) : (
          classes.map((cls) => (
            <div key={cls._id} className="card">
              <div className="card-header">
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "12px",
                  }}
                >
                  <div
                    style={{
                      width: "46px",
                      height: "46px",
                      borderRadius: "var(--radius-md)",
                      backgroundColor: "var(--primary-light)",
                      color: "var(--primary)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontWeight: 800,
                      fontSize: "1rem",
                    }}
                  >
                    {getClassNumericGrade(cls.name)}
                  </div>

                  <div>
                    <h3 className="card-title">Class {cls.name}</h3>

                    <div
                      style={{
                        fontSize: "0.8rem",
                        color: "var(--text-tertiary)",
                      }}
                    >
                      {cls.sections?.length || 0} Sections
                    </div>
                  </div>
                </div>

                <div style={{ display: "flex", gap: "8px" }}>
                  <button
                    className="btn btn-secondary btn-sm"
                    onClick={() => navigate("/school-admin/timetable")}
                  >
                    <Clock size={14} />
                    <span>7-Period Timetable</span>
                  </button>

                  <button
                    className="btn btn-primary btn-sm"
                    onClick={() => {
                      setTargetClass(cls);

                      setNewSection({
                        name: "Section C",
                        classTeacher: teachers[0]?.name || "",
                        studentCount: 30,
                        room: "Room 208",
                      });

                      setIsAddSectionModalOpen(true);
                    }}
                  >
                    <Plus size={14} />
                    <span>Add Section</span>
                  </button>
                </div>
              </div>

              {/* Sections */}
              <div className="grid-3" style={{ marginBottom: "16px" }}>
                {(cls.sections || []).map((section, sIdx) => (
                  <div
                    key={sIdx}
                    style={{
                      padding: "16px",
                      borderRadius: "var(--radius-lg)",
                      border: "1px solid var(--border-color)",
                      backgroundColor: "var(--bg-tertiary)",
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "flex-start",
                        marginBottom: "10px",
                      }}
                    >
                      <h4
                        style={{
                          fontWeight: 800,
                          fontSize: "1rem",
                          color: "var(--text-primary)",
                        }}
                      >
                        Section {section}
                      </h4>

                      <span className="badge badge-primary">
                        <Users size={12} /> Students
                      </span>
                    </div>

                    <div
                      style={{
                        fontSize: "0.825rem",
                        color: "var(--text-tertiary)",
                      }}
                    >
                      Section {section}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Add Section Modal */}
      <Modal
        isOpen={isAddSectionModalOpen}
        onClose={() => setIsAddSectionModalOpen(false)}
        title={`Add Section to ${targetClass?.name || ""}`}
        subtitle="Create an additional division with assigned educator"
      >
        <form onSubmit={handleAddSectionSubmit}>
          <FormInput
            label="Section Division Name"
            required
            value={newSection.name}
            onChange={(e) =>
              setNewSection({
                ...newSection,
                name: e.target.value,
              })
            }
            placeholder="e.g. Section C"
          />

          <div className="form-group">
            <label className="form-label">Class Teacher</label>

            <select
              className="form-select"
              value={newSection.classTeacher}
              onChange={(e) =>
                setNewSection({
                  ...newSection,
                  classTeacher: e.target.value,
                })
              }
            >
              {teachers.map((teacher) => (
                <option key={teacher._id} value={teacher.name}>
                  {teacher.name}
                </option>
              ))}
            </select>
          </div>

          <div className="grid-2">
            <FormInput
              label="Student Capacity"
              type="number"
              value={newSection.studentCount}
              onChange={(e) =>
                setNewSection({
                  ...newSection,
                  studentCount: e.target.value,
                })
              }
            />

            <FormInput
              label="Room Number / Wing"
              value={newSection.room}
              onChange={(e) =>
                setNewSection({
                  ...newSection,
                  room: e.target.value,
                })
              }
              placeholder="Room 205"
            />
          </div>

          <div
            className="modal-footer"
            style={{
              margin: "20px -24px -24px",
              padding: "16px 24px",
            }}
          >
            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => setIsAddSectionModalOpen(false)}
            >
              Cancel
            </button>

            <button type="submit" className="btn btn-primary">
              Create Section
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
