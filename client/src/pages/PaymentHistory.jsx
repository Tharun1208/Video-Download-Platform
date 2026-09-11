import React, { useEffect, useState } from "react";
import {
  CreditCard,
  CheckCircle,
  Clock,
  XCircle,
  IndianRupee,
  Receipt,
} from "lucide-react";

import { getPaymentHistory } from "../api/subscriptionApi";

function PaymentHistory() {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);

  // ==========================================
  // FETCH PAYMENT HISTORY
  // ==========================================

  useEffect(() => {
    fetchPaymentHistory();
  }, []);

  const fetchPaymentHistory = async () => {
    try {
      setLoading(true);

      const response = await getPaymentHistory();

      if (response?.data?.success) {
        setPayments(response.data.payments || []);
      } else {
        setPayments([]);
      }
    } catch (error) {
      console.error("Payment history error:", error);
      setPayments([]);
    } finally {
      setLoading(false);
    }
  };

  // ==========================================
  // FORMAT DATE & TIME
  // ==========================================

  const formatDate = (date) => {
    if (!date) return "N/A";
    return new Date(date).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  const formatTime = (date) => {
    if (!date) return "";
    return new Date(date).toLocaleTimeString("en-IN", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // ==========================================
  // STATUS HELPERS
  // ==========================================

  const getStatusIcon = (status) => {
    if (status === "Success") {
      return <CheckCircle size={16} className="text-emerald-500" />;
    }
    if (status === "Pending") {
      return <Clock size={16} className="text-amber-500" />;
    }
    return <XCircle size={16} className="text-red-500" />;
  };

  const getStatusStyle = (status) => {
    if (status === "Success") {
      return "bg-emerald-500/10 text-emerald-500 border-emerald-500/20";
    }
    if (status === "Pending") {
      return "bg-amber-500/10 text-amber-500 border-amber-500/20";
    }
    return "bg-red-500/10 text-red-400 border-red-500/20";
  };

  // ==========================================
  // LOADING STATE
  // ==========================================

  if (loading) {
    return (
      <div className="min-h-screen theme-bg theme-text flex items-center justify-center p-6 transition-colors duration-500">
        <div className="text-center">
          <div className="w-10 h-10 border-4 border-gray-300 dark:border-gray-700 border-t-blue-600 dark:border-t-blue-500 rounded-full animate-spin mx-auto" />
          <p className="theme-text-muted mt-4 text-sm sm:text-base">
            Loading payment history...
          </p>
        </div>
      </div>
    );
  }

  // ==========================================
  // MAIN UI
  // ==========================================

  return (
    <div className="min-h-screen theme-bg theme-text p-4 sm:p-6 lg:p-8 transition-colors duration-500">
      <div className="max-w-5xl mx-auto space-y-6">
        {/* HEADER */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-2">
          <div className="flex items-center gap-3.5">
            <div className="p-3 rounded-2xl bg-blue-500/10 border border-blue-500/20 text-blue-500 shrink-0">
              <CreditCard size={26} />
            </div>

            <div>
              <h1 className="text-2xl sm:text-3xl font-bold theme-text tracking-tight">
                Payment History
              </h1>
              <p className="mt-1 text-xs sm:text-sm theme-text-secondary">
                View your subscription payments, receipts, and transactions.
              </p>
            </div>
          </div>

          {payments.length > 0 && (
            <div className="self-start sm:self-auto flex items-center gap-1.5 px-3 py-1.5 rounded-full theme-card border theme-border text-xs font-semibold theme-text-secondary shadow-xs">
              <Receipt size={14} className="text-blue-500" />
              <span>{payments.length} Transaction{payments.length > 1 ? "s" : ""}</span>
            </div>
          )}
        </div>

        {/* EMPTY STATE */}
        {payments.length === 0 ? (
          <div className="theme-card theme-border border rounded-3xl p-10 sm:p-14 text-center shadow-sm">
            <div className="w-16 h-16 rounded-2xl bg-gray-500/10 theme-text-muted flex items-center justify-center mx-auto mb-4">
              <CreditCard size={32} />
            </div>

            <h2 className="text-xl sm:text-2xl font-bold theme-text">
              No Payment History
            </h2>

            <p className="mt-2 text-sm theme-text-secondary max-w-md mx-auto">
              You haven't made any subscription payments yet. When you upgrade your plan, receipts will appear here.
            </p>
          </div>
        ) : (
          /* PAYMENT LIST */
          <div className="space-y-4">
            {payments.map((payment) => (
              <div
                key={payment._id}
                className="theme-card theme-border border rounded-2xl p-5 sm:p-6 transition-all duration-300 hover:border-blue-500/50 hover:shadow-lg shadow-sm"
              >
                {/* TOP ROW */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                  {/* PLAN INFO */}
                  <div className="flex items-center gap-3.5">
                    <div className="p-2.5 rounded-xl bg-blue-500/10 text-blue-500 shrink-0">
                      <CreditCard size={22} />
                    </div>

                    <div>
                      <h2 className="text-lg sm:text-xl font-bold theme-text">
                        {payment.plan} Plan
                      </h2>

                      <p className="text-xs theme-text-muted mt-0.5">
                        {formatDate(payment.createdAt)}
                        {payment.createdAt && " • "}
                        {formatTime(payment.createdAt)}
                      </p>
                    </div>
                  </div>

                  {/* AMOUNT & STATUS */}
                  <div className="flex items-center justify-between sm:justify-end gap-4">
                    <div className="flex items-center theme-text">
                      <IndianRupee size={20} className="text-blue-500" />
                      <span className="text-2xl font-black tracking-tight">
                        {payment.amount}
                      </span>
                    </div>

                    <div
                      className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border shrink-0 ${getStatusStyle(
                        payment.paymentStatus
                      )}`}
                    >
                      {getStatusIcon(payment.paymentStatus)}
                      <span>{payment.paymentStatus}</span>
                    </div>
                  </div>
                </div>

                {/* TRANSACTION DETAILS */}
                <div className="border-t theme-border mt-5 pt-4 grid grid-cols-1 sm:grid-cols-2 gap-3.5 text-xs">
                  <div className="p-3 rounded-xl theme-bg border theme-border">
                    <span className="theme-text-muted font-medium block">
                      Razorpay Order ID
                    </span>
                    <span className="theme-text font-mono font-semibold break-all mt-1 block">
                      {payment.razorpayOrderId || "N/A"}
                    </span>
                  </div>

                  <div className="p-3 rounded-xl theme-bg border theme-border">
                    <span className="theme-text-muted font-medium block">
                      Razorpay Payment ID
                    </span>
                    <span className="theme-text font-mono font-semibold break-all mt-1 block">
                      {payment.razorpayPaymentId || "N/A"}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default PaymentHistory;