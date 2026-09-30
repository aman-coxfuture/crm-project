import React, { useState, useEffect } from "react";
import { useToast } from "../../context/ToastContext";
import api from "../../services/api";
import StatCard from "../../components/common/StatCard";
import Modal from "../../components/common/Modal";
import {
  DollarSign,
  CreditCard,
  CheckCircle2,
  AlertCircle,
  Receipt,
  Printer,
} from "lucide-react";

export default function StudentFeesPage() {
  const { success } = useToast();

  const [student, setStudent] = useState(null);
  const [fees, setFees] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);

  const [isPayModalOpen, setIsPayModalOpen] = useState(false);
  const [paymentMode, setPaymentMode] = useState("UPI");

  useEffect(() => {
    const loadFeeData = async () => {
      try {
        setLoading(true);

        const [profileResponse, feesResponse, paymentsResponse] =
          await Promise.all([
            api.get("/students/me"),
            api.get("/fees/my"),
            api.get("/fee-payments/my"),
          ]);

        setStudent(profileResponse.student);
        setFees(feesResponse.fees || []);
        setTransactions(paymentsResponse.payments || []);
      } catch (error) {
        console.error("Failed to load student fee data:", error);
      } finally {
        setLoading(false);
      }
    };

    loadFeeData();
  }, []);

  const totalFee = fees.reduce(
    (sum, fee) => sum + Number(fee.totalAmount || 0),
    0,
  );

  const paidFee = fees.reduce(
    (sum, fee) => sum + Number(fee.paidAmount || 0),
    0,
  );

  const pendingAmount = fees.reduce(
    (sum, fee) => sum + Number(fee.pendingAmount || 0),
    0,
  );

  if (loading) {
    return (
      <div className="page-container">
        <div className="card">Loading fee details...</div>
      </div>
    );
  }

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">
            <DollarSign size={26} color="var(--primary)" />
            Student Fee Account & Payment Receipts
          </h1>
          <p className="page-subtitle">
            View fee ledgers, outstanding balances and download verified payment
            receipts
          </p>
        </div>

        {pendingAmount > 0 && (
          <button
            className="btn btn-primary"
            onClick={() => setIsPayModalOpen(true)}
          >
            <CreditCard size={16} />
            <span>Pay Pending Fee (₹{pendingAmount})</span>
          </button>
        )}
      </div>

      <div className="grid-3" style={{ marginBottom: "24px" }}>
        <StatCard
          title="Total Annual Fee"
          value={`₹${totalFee}`}
          icon={DollarSign}
          color="indigo"
        />

        <StatCard
          title="Total Paid to Date"
          value={`₹${paidFee}`}
          icon={CheckCircle2}
          color="emerald"
        />
        <StatCard
          title="Outstanding Balance"
          value={`₹${pendingAmount}`}
          icon={AlertCircle}
          color={pendingAmount > 0 ? "amber" : "emerald"}
          subtitle={
            pendingAmount > 0 ? "Pending fee balance" : "All fees fully settled"
          }
        />
      </div>

      {/* Payment History Table */}
      <div className="card" style={{ padding: "0", overflow: "hidden" }}>
        <div
          style={{
            padding: "16px 20px",
            borderBottom: "1px solid var(--border-color)",
          }}
        >
          <h3 style={{ fontSize: "1.05rem", fontWeight: 700 }}>
            Payment Receipts History
          </h3>
        </div>
        <div
          className="table-container"
          style={{ border: "none", borderRadius: "0" }}
        >
          <table className="custom-table">
            <thead>
              <tr>
                <th>Receipt Number</th>
                <th>Paid Date</th>
                <th>Fee Head / Description</th>
                <th>Amount Paid</th>
                <th>Payment Mode</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {transactions.map((t) => (
                <tr key={t.id}>
                  <td>
                    <strong style={{ color: "var(--success-text)" }}>
                      ₹{t.amount}
                    </strong>
                  </td>
                  <td>{t.paidDate}</td>
                  <td>{t.feeHead}</td>
                  <td>
                    <strong style={{ color: "var(--success-text)" }}>
                      ${t.amount}
                    </strong>
                  </td>
                  <td>
                    <span className="badge badge-info">{t.mode}</span>
                  </td>
                  <td>
                    <span className="badge badge-success">Success</span>
                  </td>
                </tr>
              ))}
              {transactions.length === 0 && (
                <tr>
                  <td
                    colSpan={6}
                    style={{
                      textAlign: "center",
                      padding: "24px",
                      color: "var(--text-tertiary)",
                    }}
                  >
                    No prior transaction history found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Payment Modal */}
      <Modal
        isOpen={isPayModalOpen}
        onClose={() => setIsPayModalOpen(false)}
        title="Pay Outstanding School Dues"
        subtitle="Select your preferred payment mode"
      >
        <div>
          {/* Payment Summary */}
          <div
            className="card"
            style={{
              padding: "16px",
              backgroundColor: "var(--bg-tertiary)",
              marginBottom: "20px",
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                marginBottom: "10px",
              }}
            >
              <span>Student:</span>
              <strong>{student?.name || "—"}</strong>
            </div>

            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                borderTop: "1px solid var(--border-color)",
                paddingTop: "10px",
              }}
            >
              <span style={{ fontWeight: 800 }}>Amount Payable:</span>
              <span
                style={{
                  fontWeight: 800,
                  color: "var(--primary)",
                  fontSize: "1.2rem",
                }}
              >
                ₹{pendingAmount}
              </span>
            </div>
          </div>

          {/* Payment Mode */}
          <div style={{ marginBottom: "20px" }}>
            <label
              style={{
                display: "block",
                fontWeight: 700,
                marginBottom: "10px",
              }}
            >
              Payment Mode
            </label>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: "12px",
              }}
            >
              {/* UPI */}
              <button
                type="button"
                onClick={() => setPaymentMode("UPI")}
                style={{
                  padding: "16px",
                  borderRadius: "12px",
                  border:
                    paymentMode === "UPI"
                      ? "2px solid var(--primary)"
                      : "1px solid var(--border-color)",
                  backgroundColor:
                    paymentMode === "UPI"
                      ? "rgba(79, 70, 229, 0.08)"
                      : "var(--bg-secondary)",
                  cursor: "pointer",
                  textAlign: "left",
                }}
              >
                <div style={{ fontSize: "1.5rem", marginBottom: "6px" }}>
                  📱
                </div>

                <div style={{ fontWeight: 800 }}>UPI</div>

                <div
                  style={{
                    fontSize: "0.75rem",
                    color: "var(--text-tertiary)",
                    marginTop: "4px",
                  }}
                >
                  Pay using UPI
                </div>
              </button>

              {/* Cash */}
              <button
                type="button"
                onClick={() => setPaymentMode("CASH")}
                style={{
                  padding: "16px",
                  borderRadius: "12px",
                  border:
                    paymentMode === "CASH"
                      ? "2px solid var(--primary)"
                      : "1px solid var(--border-color)",
                  backgroundColor:
                    paymentMode === "CASH"
                      ? "rgba(79, 70, 229, 0.08)"
                      : "var(--bg-secondary)",
                  cursor: "pointer",
                  textAlign: "left",
                }}
              >
                <div style={{ fontSize: "1.5rem", marginBottom: "6px" }}>
                  💵
                </div>

                <div style={{ fontWeight: 800 }}>Cash</div>

                <div
                  style={{
                    fontSize: "0.75rem",
                    color: "var(--text-tertiary)",
                    marginTop: "4px",
                  }}
                >
                  Pay at school office
                </div>
              </button>
            </div>
          </div>

          {/* UPI Gateway Placeholder */}
          {paymentMode === "UPI" && (
            <div
              style={{
                padding: "14px 16px",
                borderRadius: "10px",
                backgroundColor: "rgba(79, 70, 229, 0.06)",
                border: "1px solid rgba(79, 70, 229, 0.15)",
                marginBottom: "20px",
                fontSize: "0.85rem",
                color: "var(--text-secondary)",
              }}
            >
              <strong>UPI Payment</strong>
              <div style={{ marginTop: "4px" }}>
                Online payment gateway will be available here.
              </div>
            </div>
          )}

          {/* Cash Information */}
          {paymentMode === "CASH" && (
            <div
              style={{
                padding: "14px 16px",
                borderRadius: "10px",
                backgroundColor: "rgba(16, 185, 129, 0.06)",
                border: "1px solid rgba(16, 185, 129, 0.15)",
                marginBottom: "20px",
                fontSize: "0.85rem",
                color: "var(--text-secondary)",
              }}
            >
              <strong>Cash Payment</strong>
              <div style={{ marginTop: "4px" }}>
                Please visit the school accounts office to complete the payment.
              </div>
            </div>
          )}

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
              onClick={() => setIsPayModalOpen(false)}
            >
              Cancel
            </button>

            <button
              type="button"
              className="btn btn-primary"
              onClick={() => {
                setIsPayModalOpen(false);
                success(
                  paymentMode === "UPI"
                    ? "UPI payment gateway will be connected here."
                    : "Please complete the cash payment at the school office.",
                );
              }}
            >
              {paymentMode === "UPI"
                ? "Continue with UPI"
                : "Confirm Cash Payment"}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
