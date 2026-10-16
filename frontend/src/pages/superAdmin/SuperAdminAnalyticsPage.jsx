import React, { useEffect, useState } from "react";
import { BarChart, DonutChart } from "../../components/common/Charts";
import StatCard from "../../components/common/StatCard";
import { BarChart3, Users, DollarSign, Award, School } from "lucide-react";
import { superAdminAnalyticsService } from "../../services";

export default function SuperAdminAnalyticsPage() {
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadAnalytics = async () => {
      try {
        setLoading(true);
        setError("");

        const response = await superAdminAnalyticsService.getAnalytics();

        if (response?.data) {
          setAnalytics(response.data);
        } else {
          setAnalytics(response);
        }
      } catch (error) {
        console.error("Failed to load super admin analytics:", error);
        setError("Unable to load platform analytics.");
      } finally {
        setLoading(false);
      }
    };

    loadAnalytics();
  }, []);

  if (loading) {
    return (
      <div>
        <div className="page-header">
          <div>
            <h1 className="page-title">
              <BarChart3 size={26} color="var(--primary)" />
              Platform Multi-School Analytics
            </h1>
            <p className="page-subtitle">
              Cross-institutional benchmarks, growth trajectories and
              performance metrics
            </p>
          </div>
        </div>

        <div className="card">
          <div
            style={{
              minHeight: "250px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "var(--text-secondary)",
              fontSize: "16px",
            }}
          >
            Loading platform analytics...
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div>
        <div className="page-header">
          <div>
            <h1 className="page-title">
              <BarChart3 size={26} color="var(--primary)" />
              Platform Multi-School Analytics
            </h1>
            <p className="page-subtitle">
              Cross-institutional benchmarks, growth trajectories and
              performance metrics
            </p>
          </div>
        </div>

        <div className="card">
          <div
            style={{
              minHeight: "200px",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              gap: "12px",
              color: "var(--text-secondary)",
              textAlign: "center",
            }}
          >
            <h3 style={{ margin: 0, color: "var(--text-primary)" }}>
              Unable to load platform analytics
            </h3>

            <p style={{ margin: 0 }}>
              Please check your connection or try again later.
            </p>
          </div>
        </div>
      </div>
    );
  }

  const multiSchoolBar =
    analytics?.schoolWiseStudents?.map((school) => ({
      label: school.label,
      value: Number(school.value || 0),
      color: "#6366f1",
    })) || [];

  const revenueBySchool =
    analytics?.revenue?.bySchool?.map((school, index) => ({
      label: school.label,
      value: Number(school.value || 0),
      color: ["#10b981", "#0ea5e9", "#f59e0b", "#8b5cf6"][index % 4],
    })) || [];

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">
            <BarChart3 size={26} color="var(--primary)" />
            Platform Multi-School Analytics
          </h1>

          <p className="page-subtitle">
            Cross-institutional benchmarks, growth trajectories and performance
            metrics
          </p>
        </div>
      </div>

      <div className="grid-4" style={{ marginBottom: "24px" }}>
        <StatCard
          title="Platform Active Students"
          value={analytics?.users?.students ?? 0}
          icon={Users}
          color="indigo"
        />

        <StatCard
          title="Total Collected Revenue"
          value={`₹${Number(analytics?.revenue?.total || 0).toLocaleString(
            "en-IN",
          )}`}
          icon={DollarSign}
          color="emerald"
        />

        <StatCard
          title="Active Schools"
          value={`${analytics?.schools?.active ?? 0} / ${
            analytics?.schools?.total ?? 0
          }`}
          icon={School}
          color="sky"
          subtitle="Currently active institutions"
        />

        <StatCard
          title="Exam Pass Rate"
          value={`${Number(analytics?.exam?.passRate || 0).toFixed(1)}%`}
          icon={Award}
          color="purple"
          subtitle={
            analytics?.exam?.totalEvaluated
              ? `${analytics.exam.passed} of ${analytics.exam.totalEvaluated} evaluated`
              : "No exam data available"
          }
        />
      </div>

      <div className="grid-2" style={{ marginBottom: "24px" }}>
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">
              Enrollment Distribution by Institution
            </h3>
          </div>

          <BarChart data={multiSchoolBar} height={220} />
        </div>

        <div className="card">
          <div className="card-header">
            <h3 className="card-title">Fee Revenue Contribution (₹)</h3>
          </div>

          <DonutChart data={revenueBySchool} size={160} />
        </div>
      </div>

      <div className="card">
        <div className="card-header">
          <h3 className="card-title">Platform Workforce Distribution</h3>

          <span className="badge badge-success">Live Data</span>
        </div>

        <BarChart
          data={[
            {
              label: "Faculty",
              value: Number(analytics?.users?.faculty || 0),
              color: "#0ea5e9",
            },
            {
              label: "Staff",
              value: Number(analytics?.users?.staff || 0),
              color: "#8b5cf6",
            },
          ]}
          height={180}
        />
      </div>
    </div>
  );
}
