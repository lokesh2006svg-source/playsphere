import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { fetchMyBookings, cancelMyBooking } from "../api";
import PaymentQR from "../components/PaymentQR";
import {
  Ticket,
  Calendar,
  Clock,
  MapPin,
  XCircle,
  CheckCircle2,
  AlertCircle,
  ArrowLeft,
  ExternalLink,
  QrCode,
  CreditCard,
  Banknote,
  RefreshCw,
  Receipt,
  FileCheck,
  Eye,
  X,
} from "lucide-react";

const MyBookings = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");
  const [actionLoading, setActionLoading] = useState(null);
  const [activePaymentBooking, setActivePaymentBooking] = useState(null);
  const [viewingProof, setViewingProof] = useState(null);

  const loadBookings = async () => {
    try {
      setLoading(true);
      const res = await fetchMyBookings();
      if (res.data.success) {
        setBookings(res.data.bookings || []);
      }
    } catch (err) {
      console.error("Error loading bookings:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadBookings();
  }, []);

  const handleCancel = async (id) => {
    if (!window.confirm("Are you sure you want to cancel this booking? A refund simulation will be initiated.")) {
      return;
    }

    try {
      setActionLoading(id);
      const res = await cancelMyBooking(id);
      if (res.data.success) {
        setBookings((prev) =>
          prev.map((b) => (b._id === id ? { ...b, status: "cancelled", paymentStatus: "refunded" } : b))
        );
      }
    } catch (err) {
      alert(err.response?.data?.message || "Failed to cancel booking.");
    } finally {
      setActionLoading(null);
    }
  };

  const filteredBookings = bookings.filter((b) => {
    if (filter === "confirmed") return b.status === "confirmed";
    if (filter === "pending") return b.status === "pending" || b.paymentStatus === "unpaid";
    if (filter === "cancelled") return b.status === "cancelled";
    return true;
  });

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6 animate-fade-in text-[#F5F0E6]">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Ticket className="w-6 h-6 text-gold" />
            <h1 className="text-2xl sm:text-3xl font-black text-[#F5F0E6]">My Court Bookings</h1>
          </div>
          <p className="text-xs text-[#9B9691] mt-1">
            Track your reserved slots, receipts, UPI QR payments, and cancellation statuses
          </p>
        </div>

        <Link
          to="/venues"
          className="px-5 py-2.5 bg-gradient-to-r from-gold via-amber-400 to-gold-hover hover:from-gold-hover hover:to-amber-500 text-court-950 font-black rounded-xl text-xs shadow-md shadow-gold/20 transition-all self-start sm:self-auto"
        >
          Book New Turf Slot
        </Link>
      </div>

      {/* Tabs */}
      <div className="flex flex-wrap gap-2 border-b border-court-700 pb-3">
        {[
          { key: "all", label: `All (${bookings.length})` },
          {
            key: "confirmed",
            label: `Confirmed Slots (${bookings.filter((b) => b.status === "confirmed").length})`,
          },
          {
            key: "pending",
            label: `Pending Payment (${bookings.filter((b) => b.status === "pending" || b.paymentStatus === "unpaid").length})`,
          },
          {
            key: "cancelled",
            label: `Cancelled / Refunded (${bookings.filter((b) => b.status === "cancelled").length})`,
          },
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => setFilter(tab.key)}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              filter === tab.key
                ? "bg-gold text-court-950 shadow-md shadow-gold/20 font-black"
                : "bg-court-900 text-[#9B9691] hover:bg-court-800 hover:text-white border border-court-700"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Payment QR Modal if paying from MyBookings */}
      {activePaymentBooking && (
        <PaymentQR
          booking={activePaymentBooking}
          venue={activePaymentBooking.venueId}
          onSuccess={(updatedBooking) => {
            setBookings((prev) =>
              prev.map((b) => (b._id === updatedBooking._id ? { ...b, ...updatedBooking } : b))
            );
            setActivePaymentBooking(null);
          }}
          onCancel={() => setActivePaymentBooking(null)}
        />
      )}

      {/* Bookings List */}
      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="h-36 bg-court-900 border border-court-700 rounded-3xl animate-pulse"
            ></div>
          ))}
        </div>
      ) : filteredBookings.length === 0 ? (
        <div className="bg-court-900 border border-court-700 rounded-3xl p-12 text-center max-w-md mx-auto shadow-xl">
          <Ticket className="w-12 h-12 text-gold mx-auto mb-3" />
          <h3 className="text-lg font-bold text-[#F5F0E6] mb-1">No Bookings Found</h3>
          <p className="text-xs text-[#9B9691] mb-6">
            You don't have any bookings matching this filter.
          </p>
          <Link
            to="/venues"
            className="px-5 py-2.5 bg-gradient-to-r from-gold to-amber-500 text-court-950 font-black rounded-xl text-xs shadow-md shadow-gold/20"
          >
            Browse Available Venues
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredBookings.map((b) => {
            const isPaid = b.paymentStatus === "paid";
            const isUnpaid = b.paymentStatus === "unpaid" || b.paymentStatus === "pending";
            const isRefunded = b.paymentStatus === "refunded";
            const isCash = b.paymentMethod === "cash_on_arrival";

            return (
              <div
                key={b._id}
                className="bg-court-900 border border-court-700 rounded-3xl p-6 shadow-lg flex flex-col md:flex-row items-start md:items-center justify-between gap-6 hover:border-gold/40 transition-colors shadow-gold/5"
              >
                <div className="space-y-2.5 flex-1">
                  {/* Status Badges Row */}
                  <div className="flex flex-wrap items-center gap-2">
                    {/* Booking Status Badge */}
                    <span
                      className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider ${
                        b.status === "confirmed"
                          ? "bg-emerald-500/15 border border-emerald-500/30 text-emerald-300"
                          : b.status === "pending"
                          ? "bg-amber-500/15 border border-amber-500/30 text-amber-300"
                          : "bg-red-500/15 border border-red-500/30 text-red-400"
                      }`}
                    >
                      {b.status === "pending" ? "Pending Payment" : b.status}
                    </span>

                    {/* Payment Status Badge */}
                    {isPaid && (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/15 border border-emerald-500/30 text-emerald-300">
                        <CheckCircle2 className="w-3 h-3" />
                        <span>Paid</span>
                      </span>
                    )}

                    {isUnpaid && (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/15 border border-amber-500/30 text-amber-300">
                        <Clock className="w-3 h-3" />
                        <span>Payment Pending</span>
                      </span>
                    )}

                    {isRefunded && (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-purple-500/15 border border-purple-500/30 text-purple-300">
                        <RefreshCw className="w-3 h-3" />
                        <span>Refunded</span>
                      </span>
                    )}

                    {/* Payment Method Badge */}
                    <span className="text-[10px] text-[#9B9691] font-medium flex items-center gap-1">
                      {isCash ? (
                        <>
                          <Banknote className="w-3 h-3 text-amber-400" />
                          <span>Cash on Arrival</span>
                        </>
                      ) : (
                        <>
                          <QrCode className="w-3 h-3 text-gold" />
                          <span>UPI QR Payment</span>
                        </>
                      )}
                    </span>
                  </div>

                  {/* Venue Name & Sport */}
                  <div>
                    <h3 className="text-lg font-bold text-[#F5F0E6] flex items-center gap-2">
                      <span>{b.venueId?.name || "Sports Ground"}</span>
                      {b.venueId?.sportType && (
                        <span className="text-[11px] font-semibold px-2 py-0.5 bg-court-950 border border-court-700 rounded-md text-[#F5F0E6]">
                          {b.venueId.sportType}
                        </span>
                      )}
                    </h3>
                  </div>

                  {/* Date, Time & City */}
                  <div className="flex flex-wrap items-center gap-4 text-xs text-[#9B9691]">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5 text-gold" />
                      {b.bookingDate}
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5 text-gold" />
                      {b.startTime} - {b.endTime}
                    </span>
                    <span className="flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5 text-gold" />
                      {b.venueId?.city || "Tamil Nadu"}
                    </span>
                  </div>

                  {/* Transaction Reference & Proof Tag */}
                  <div className="flex flex-wrap items-center gap-3">
                    {b.paymentTransactionId && (
                      <div className="text-[10px] font-mono text-[#9B9691]">
                        Txn Ref: <span className="text-[#F5F0E6]">{b.paymentTransactionId}</span>
                      </div>
                    )}

                    {b.paymentScreenshot && (
                      <button
                        onClick={() => setViewingProof(b.paymentScreenshot)}
                        className="inline-flex items-center gap-1 px-2.5 py-0.5 bg-court-950 hover:bg-court-800 border border-gold/40 text-gold text-[10px] font-bold rounded-lg transition-colors"
                      >
                        <FileCheck className="w-3 h-3 text-gold" />
                        <span>View Payment Receipt</span>
                      </button>
                    )}
                  </div>
                </div>

                {/* Right / Bottom Action Block */}
                <div className="flex flex-col md:items-end gap-3 w-full md:w-auto shrink-0 pt-4 md:pt-0 border-t md:border-t-0 border-court-700">
                  <div className="text-right">
                    <span className="text-[10px] uppercase text-[#9B9691] font-bold block">Total Fare</span>
                    <span className="text-2xl font-black text-gold">₹{b.totalPrice}</span>
                  </div>

                  <div className="flex flex-wrap items-center gap-2">
                    {/* Pay via QR Button for Unpaid/Pending */}
                    {isUnpaid && b.status !== "cancelled" && (
                      <button
                        onClick={() => setActivePaymentBooking(b)}
                        className="px-4 py-2 bg-gradient-to-r from-gold via-amber-400 to-gold-hover hover:from-gold-hover hover:to-amber-500 text-court-950 font-black rounded-xl text-xs flex items-center gap-1.5 shadow-md shadow-gold/20 transition-all transform hover:-translate-y-0.5"
                      >
                        <QrCode className="w-3.5 h-3.5" />
                        <span>Pay via QR (₹{b.totalPrice})</span>
                      </button>
                    )}

                    {/* Cancel Slot Button for Confirmed */}
                    {b.status === "confirmed" && (
                      <button
                        onClick={() => handleCancel(b._id)}
                        disabled={actionLoading === b._id}
                        className="px-4 py-1.5 bg-red-500/10 hover:bg-red-500/20 border border-red-500/30 text-red-400 hover:text-red-300 font-bold rounded-xl text-xs transition-colors disabled:opacity-50"
                      >
                        {actionLoading === b._id ? "Cancelling..." : "Cancel Slot"}
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Payment Screenshot Preview Modal */}
      {viewingProof && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-md animate-fade-in"
          onClick={() => setViewingProof(null)}
        >
          <div
            className="relative max-w-lg w-full bg-court-950 border border-court-700 rounded-3xl p-5 space-y-3"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-2 border-b border-court-700">
              <span className="text-xs font-bold text-[#F5F0E6] flex items-center gap-2">
                <FileCheck className="w-4 h-4 text-gold" />
                <span>Uploaded Payment Screenshot</span>
              </span>
              <button
                type="button"
                onClick={() => setViewingProof(null)}
                className="p-1 text-[#9B9691] hover:text-white bg-court-800 rounded-full"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="max-h-[65vh] overflow-auto rounded-xl border border-court-700">
              <img
                src={viewingProof}
                alt="Payment Proof"
                className="w-full h-auto object-contain rounded-xl"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MyBookings;
