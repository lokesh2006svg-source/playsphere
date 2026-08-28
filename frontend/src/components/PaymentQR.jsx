import React, { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { generateBookingPaymentQR, confirmBookingPayment } from "../api";
import {
  QrCode,
  CheckCircle2,
  Clock,
  ShieldCheck,
  Copy,
  Check,
  AlertTriangle,
  ArrowRight,
  Sparkles,
  Calendar,
  CreditCard,
  Banknote,
  X,
  RefreshCw,
  UploadCloud,
  Image as ImageIcon,
  Trash2,
  FileCheck,
  Eye,
} from "lucide-react";
import confetti from "canvas-confetti";

const PaymentQR = ({ booking, venue, onSuccess, onCancel }) => {
  const [paymentMethod, setPaymentMethod] = useState("upi_qr"); // 'upi_qr' | 'cash_on_arrival'
  const [qrData, setQrData] = useState(null);
  const [loadingQr, setLoadingQr] = useState(true);
  const [confirming, setConfirming] = useState(false);
  const [confirmedBooking, setConfirmedBooking] = useState(null);
  const [transactionId, setTransactionId] = useState("");
  const [error, setError] = useState("");
  const [copiedUpi, setCopiedUpi] = useState(false);
  const [copiedTxn, setCopiedTxn] = useState(false);

  // Payment proof states
  const [screenshot, setScreenshot] = useState(null); // base64 string
  const [screenshotName, setScreenshotName] = useState("");
  const [screenshotSize, setScreenshotSize] = useState("");
  const [screenshotPreview, setScreenshotPreview] = useState(null);
  const [utrNumber, setUtrNumber] = useState("");
  const [showProofModal, setShowProofModal] = useState(false);

  const fileInputRef = useRef(null);
  const upiId = qrData?.upiId || "lokesh2006svg@okhdfcbank";

  // Fetch Payment QR Code
  useEffect(() => {
    let isMounted = true;

    const loadPaymentQR = async () => {
      if (!booking?._id) return;
      try {
        setLoadingQr(true);
        setError("");
        const res = await generateBookingPaymentQR(booking._id);
        if (isMounted && res.data.success) {
          setQrData(res.data);
        }
      } catch (err) {
        if (isMounted) {
          setError(err.response?.data?.message || "Failed to generate UPI payment QR code.");
        }
      } finally {
        if (isMounted) setLoadingQr(false);
      }
    };

    loadPaymentQR();

    return () => {
      isMounted = false;
    };
  }, [booking?._id]);

  const handleCopyUpi = () => {
    navigator.clipboard.writeText(upiId);
    setCopiedUpi(true);
    setTimeout(() => setCopiedUpi(false), 2000);
  };

  const handleCopyTxn = () => {
    if (!transactionId) return;
    navigator.clipboard.writeText(transactionId);
    setCopiedTxn(true);
    setTimeout(() => setCopiedTxn(false), 2000);
  };

  // Handle Screenshot File Selection
  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate type
    if (!file.type.startsWith("image/")) {
      setError("Please select a valid image file (PNG, JPG, JPEG, WEBP).");
      return;
    }

    // Validate size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setError("Payment screenshot image size must be less than 5MB.");
      return;
    }

    setError("");
    setScreenshotName(file.name);
    setScreenshotSize(`${(file.size / 1024).toFixed(1)} KB`);

    const reader = new FileReader();
    reader.onload = () => {
      const base64 = reader.result;
      setScreenshot(base64);
      setScreenshotPreview(base64);
    };
    reader.onerror = () => {
      setError("Failed to read image file. Please try again.");
    };
    reader.readAsDataURL(file);
  };

  // Remove uploaded screenshot
  const handleRemoveScreenshot = () => {
    setScreenshot(null);
    setScreenshotPreview(null);
    setScreenshotName("");
    setScreenshotSize("");
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  // Confirm Payment Submission
  const handleConfirmPayment = async () => {
    if (!booking?._id) return;

    try {
      setConfirming(true);
      setError("");

      const payload = {
        paymentMethod,
        paymentUtrNumber: utrNumber.trim() || undefined,
        paymentScreenshot: screenshot || undefined,
      };

      const res = await confirmBookingPayment(booking._id, payload);

      if (res.data.success) {
        setConfirmedBooking(res.data.booking);
        setTransactionId(res.data.booking?.paymentUtrNumber || res.data.booking?.paymentTransactionId || "PS-TXN-SUCCESS");

        // Fire celebratory confetti with championship gold colors
        try {
          confetti({
            particleCount: 90,
            spread: 70,
            origin: { y: 0.6 },
            colors: ["#D4AF37", "#F0B90B", "#F5F0E6", "#10B981"],
          });
        } catch {}

        if (onSuccess) {
          onSuccess(res.data.booking);
        }
      }
    } catch (err) {
      setError(err.response?.data?.message || "Failed to confirm payment. Please try again.");
    } finally {
      setConfirming(false);
    }
  };

  const venueName = venue?.name || booking?.venueId?.name || "Sports Arena";
  const venueCity = venue?.city || booking?.venueId?.city || "Tamil Nadu";
  const sportType = venue?.sportType || booking?.venueId?.sportType || "Sports";
  const totalPrice = booking?.totalPrice || qrData?.amount || 0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-court-950/90 backdrop-blur-md animate-fade-in overflow-y-auto">
      <div className="relative w-full max-w-xl bg-court-900 border border-court-700 rounded-3xl shadow-2xl shadow-gold/10 overflow-hidden my-8 max-h-[90vh] flex flex-col">
        {/* Header Ribbon & Close Button */}
        <div className="p-5 sm:p-6 border-b border-court-700 flex items-center justify-between bg-gradient-to-r from-court-950 via-court-900 to-court-950 shrink-0">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-gold/20 text-gold-light border border-gold/40">
                Step 2 of 3 • Review & Pay
              </span>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-500/15 text-amber-300 font-bold border border-amber-500/30">
                Demo Simulation
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-[#F5F0E6] mt-1">
              {confirmedBooking ? "Booking Confirmed! 🎉" : "Complete Court Reservation"}
            </h2>
          </div>

          {!confirmedBooking && (
            <button
              onClick={onCancel}
              className="p-2 text-[#9B9691] hover:text-[#F5F0E6] bg-court-800 hover:bg-court-750 rounded-full transition-colors border border-court-700"
              title="Cancel and return"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* Visual Progress Steps */}
        <div className="grid grid-cols-3 text-center text-xs font-bold py-3 bg-court-950/80 border-b border-court-700 shrink-0">
          <div className="flex items-center justify-center gap-1.5 text-gold">
            <CheckCircle2 className="w-4 h-4" />
            <span>1. Slot Selected</span>
          </div>
          <div className={`flex items-center justify-center gap-1.5 ${confirmedBooking ? "text-gold" : "text-amber-400"}`}>
            {confirmedBooking ? <CheckCircle2 className="w-4 h-4" /> : <Clock className="w-4 h-4 animate-pulse" />}
            <span>2. Pay & Submit Proof</span>
          </div>
          <div className={`flex items-center justify-center gap-1.5 ${confirmedBooking ? "text-emerald-400" : "text-[#9B9691]"}`}>
            <Sparkles className="w-4 h-4" />
            <span>3. Confirmed</span>
          </div>
        </div>

        {/* Modal Body Container */}
        <div className="overflow-y-auto p-6 sm:p-8 space-y-6">
          {/* ============================================================ */}
          {/* SUCCESS VIEW (Step 3: Confirmed) */}
          {/* ============================================================ */}
          {confirmedBooking ? (
            <div className="space-y-6 text-center animate-fade-in">
              <div className="w-20 h-20 rounded-full bg-gold/20 text-gold border-2 border-gold/50 flex items-center justify-center mx-auto shadow-lg shadow-gold/20 animate-bounce">
                <Check className="w-10 h-10 stroke-[3]" />
              </div>

              <div>
                <h3 className="text-2xl sm:text-3xl font-black text-[#F5F0E6]">
                  Slot Reserved & Confirmed!
                </h3>
                <p className="text-xs text-[#9B9691] mt-1.5">
                  Your payment proof has been submitted and verified. We've notified the venue manager and confirmed your reservation.
                </p>
              </div>

              {/* Receipt Box */}
              <div className="bg-court-950 border border-court-700 rounded-2xl p-5 text-left space-y-3 shadow-inner">
                <div className="flex items-center justify-between pb-3 border-b border-court-700">
                  <div>
                    <span className="text-[10px] uppercase font-bold text-[#9B9691] block">Venue & Sport</span>
                    <strong className="text-sm font-bold text-[#F5F0E6]">{venueName}</strong>
                    <span className="text-xs text-[#9B9691] block capitalize">{sportType} • {venueCity}</span>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] uppercase font-bold text-[#9B9691] block">Amount Paid</span>
                    <span className="text-xl font-black text-gold">₹{totalPrice}</span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3 text-xs text-[#9B9691]">
                  <div>
                    <span className="text-[#9B9691] block text-[10px] uppercase font-semibold">Date & Time</span>
                    <span className="font-bold text-[#F5F0E6] flex items-center gap-1 mt-0.5">
                      <Calendar className="w-3.5 h-3.5 text-gold" />
                      {booking?.bookingDate}
                    </span>
                    <span className="font-bold text-[#F5F0E6] flex items-center gap-1 mt-0.5">
                      <Clock className="w-3.5 h-3.5 text-gold" />
                      {booking?.startTime} - {booking?.endTime}
                    </span>
                  </div>

                  <div>
                    <span className="text-[#9B9691] block text-[10px] uppercase font-semibold">Payment Status</span>
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 rounded-full font-bold text-[11px] mt-1">
                      <CheckCircle2 className="w-3 h-3" /> Paid & Confirmed
                    </span>
                  </div>
                </div>

                {/* Screenshot Attached Pill */}
                {screenshotPreview && (
                  <div className="p-3 bg-court-900 border border-gold/30 rounded-xl flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2 text-xs text-[#F5F0E6]">
                      <FileCheck className="w-4 h-4 text-gold" />
                      <span className="font-semibold truncate">Payment Proof Screenshot Attached</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => setShowProofModal(true)}
                      className="px-2.5 py-1 bg-gold/20 hover:bg-gold/30 text-gold-light rounded-lg text-[11px] font-bold border border-gold/40 flex items-center gap-1 transition-colors"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      <span>View</span>
                    </button>
                  </div>
                )}

                {/* Transaction Ref */}
                {transactionId && (
                  <div className="pt-2 border-t border-court-700 flex items-center justify-between text-xs">
                    <span className="text-[#9B9691] text-[11px]">Transaction / UTR Ref:</span>
                    <button
                      onClick={handleCopyTxn}
                      className="flex items-center gap-1 font-mono text-gold font-bold bg-court-900 px-2.5 py-1 rounded-lg border border-court-700 hover:border-gold transition-colors"
                    >
                      <span>{transactionId}</span>
                      {copiedTxn ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                )}
              </div>

              {/* Actions */}
              <div className="flex flex-col sm:flex-row gap-3 pt-2">
                <Link
                  to="/bookings"
                  className="flex-1 py-3.5 bg-gradient-to-r from-gold via-amber-400 to-gold-hover hover:from-gold-hover hover:to-amber-500 text-court-950 font-black rounded-xl text-xs transition-all flex items-center justify-center gap-1.5 shadow-lg shadow-gold/20"
                >
                  <span>View in My Bookings</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
                <button
                  onClick={onCancel}
                  className="px-6 py-3.5 bg-court-800 hover:bg-court-750 text-[#F5F0E6] font-bold rounded-xl text-xs transition-colors border border-court-700"
                >
                  Book Another Slot
                </button>
              </div>
            </div>
          ) : (
            /* ============================================================ */
            /* PAYMENT STEP VIEW (Step 2: Scan & Pay & Submit Screenshot) */
            /* ============================================================ */
            <div className="space-y-6">
              {error && (
                <div className="p-3.5 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400 text-xs font-semibold flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              {/* Booking Summary Mini Bar */}
              <div className="p-4 bg-court-950 border border-court-700 rounded-2xl flex flex-wrap items-center justify-between gap-3 text-xs">
                <div className="space-y-0.5">
                  <div className="font-bold text-[#F5F0E6] text-sm">{venueName}</div>
                  <div className="text-[#9B9691] flex items-center gap-2">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5 text-gold" />
                      {booking?.bookingDate}
                    </span>
                    <span>•</span>
                    <span className="flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5 text-gold" />
                      {booking?.startTime} - {booking?.endTime}
                    </span>
                  </div>
                </div>

                <div className="text-right">
                  <span className="text-[10px] text-[#9B9691] uppercase font-bold block">Total Amount</span>
                  <span className="text-xl font-black text-gold">₹{totalPrice}</span>
                </div>
              </div>

              {/* Payment Method Selector Tabs */}
              <div className="grid grid-cols-2 gap-2 p-1 bg-court-950 border border-court-700 rounded-2xl">
                <button
                  type="button"
                  onClick={() => setPaymentMethod("upi_qr")}
                  className={`py-2.5 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all ${
                    paymentMethod === "upi_qr"
                      ? "bg-gold text-court-950 shadow-md shadow-gold/20"
                      : "text-[#9B9691] hover:text-white"
                  }`}
                >
                  <QrCode className="w-4 h-4" />
                  <span>UPI QR Code (Instant)</span>
                </button>
                <button
                  type="button"
                  onClick={() => setPaymentMethod("cash_on_arrival")}
                  className={`py-2.5 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all ${
                    paymentMethod === "cash_on_arrival"
                      ? "bg-gold text-court-950 shadow-md shadow-gold/20"
                      : "text-[#9B9691] hover:text-white"
                  }`}
                >
                  <Banknote className="w-4 h-4" />
                  <span>Pay on Arrival</span>
                </button>
              </div>

              {/* Option A: UPI QR FLOW */}
              {paymentMethod === "upi_qr" && (
                <div className="space-y-5">
                  {/* QR Code Container */}
                  <div className="bg-court-950 border-2 border-dashed border-gold/40 rounded-3xl p-6 flex flex-col items-center justify-center relative shadow-inner">
                    {loadingQr ? (
                      <div className="py-16 flex flex-col items-center gap-3">
                        <div className="w-10 h-10 border-4 border-gold border-t-transparent rounded-full animate-spin"></div>
                        <span className="text-xs text-[#9B9691]">Generating Secure UPI QR Code...</span>
                      </div>
                    ) : qrData?.qrCode ? (
                      <div className="space-y-4 flex flex-col items-center">
                        <div className="p-3 bg-white rounded-2xl shadow-xl border-4 border-gold/30 relative group">
                          <img
                            src={qrData.qrCode}
                            alt="PlaySphere UPI Payment QR"
                            className="w-48 h-48 sm:w-52 sm:h-52 object-contain rounded-lg"
                          />
                          <div className="absolute inset-0 border-2 border-gold/0 group-hover:border-gold/60 rounded-xl transition-all pointer-events-none"></div>
                        </div>

                        <div className="text-center space-y-1">
                          <div className="text-sm font-black text-[#F5F0E6]">
                            Scan with any UPI app to pay <span className="text-gold text-base">₹{totalPrice}</span>
                          </div>
                          <div className="text-xs text-[#F5F0E6] font-medium">
                            Paying to: <span className="text-gold font-bold">PlaySphere ({upiId})</span>
                          </div>
                          <p className="text-[11px] text-[#9B9691]">
                            Google Pay • PhonePe • Paytm • BHIM • Cred UPI
                          </p>
                        </div>
                      </div>
                    ) : (
                      <div className="py-8 text-center text-xs text-red-400">
                        Failed to render QR code. Please try reloading.
                      </div>
                    )}
                  </div>

                  {/* UPI ID Copy Field */}
                  <div className="flex items-center justify-between px-4 py-2.5 bg-court-950 border border-court-700 rounded-xl text-xs">
                    <div className="flex items-center gap-2 truncate mr-2">
                      <CreditCard className="w-4 h-4 text-gold shrink-0" />
                      <span className="text-[#9B9691] shrink-0">Paying to:</span>
                      <span className="text-[#F5F0E6] font-semibold truncate">
                        PlaySphere <strong className="text-gold font-mono">({upiId})</strong>
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={handleCopyUpi}
                      className="flex items-center gap-1 px-2.5 py-1 bg-court-800 hover:bg-court-750 text-[#F5F0E6] text-[11px] font-bold rounded-lg border border-court-700 transition-colors shrink-0"
                    >
                      {copiedUpi ? (
                        <>
                          <Check className="w-3 h-3 text-emerald-400" />
                          <span className="text-emerald-400 font-bold">Copied!</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3 h-3 text-[#9B9691]" />
                          <span>Copy UPI</span>
                        </>
                      )}
                    </button>
                  </div>

                  {/* Proof of Payment Upload */}
                  <div className="p-4 sm:p-5 bg-court-950 border border-gold/30 rounded-2xl space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <UploadCloud className="w-4 h-4 text-gold" />
                        <span className="text-xs font-black uppercase tracking-wider text-[#F5F0E6]">
                          Submit Payment Proof
                        </span>
                      </div>
                      <span className="text-[10px] text-[#9B9691] font-medium">Step 2 of 2</span>
                    </div>

                    {/* Image Upload Area */}
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleFileChange}
                      className="hidden"
                      id="payment-screenshot-input"
                    />

                    {!screenshotPreview ? (
                      <label
                        htmlFor="payment-screenshot-input"
                        className="cursor-pointer border-2 border-dashed border-court-700 hover:border-gold/60 bg-court-900/60 hover:bg-court-900 rounded-xl p-4 flex flex-col items-center justify-center gap-2 text-center transition-all group"
                      >
                        <div className="w-10 h-10 rounded-full bg-gold/10 text-gold flex items-center justify-center group-hover:scale-110 transition-transform">
                          <ImageIcon className="w-5 h-5" />
                        </div>
                        <div>
                          <span className="text-xs font-bold text-[#F5F0E6] block">
                            Click to Upload Payment Screenshot
                          </span>
                          <span className="text-[11px] text-[#9B9691]">
                            Attach your UPI receipt / screenshot (PNG, JPG up to 5MB)
                          </span>
                        </div>
                      </label>
                    ) : (
                      /* Attached Screenshot Card */
                      <div className="p-3 bg-court-900 border border-gold/40 rounded-xl flex items-center justify-between gap-3 animate-fade-in">
                        <div className="flex items-center gap-3 min-w-0">
                          <img
                            src={screenshotPreview}
                            alt="Payment Proof"
                            className="w-12 h-12 object-cover rounded-lg border border-court-700 shrink-0"
                          />
                          <div className="min-w-0">
                            <span className="text-xs font-bold text-[#F5F0E6] block truncate">
                              {screenshotName || "Payment_Screenshot.png"}
                            </span>
                            <div className="flex items-center gap-2 text-[11px] text-[#9B9691]">
                              <span>{screenshotSize}</span>
                              <span>•</span>
                              <span className="text-emerald-400 font-semibold flex items-center gap-1">
                                <CheckCircle2 className="w-3 h-3" /> Ready
                              </span>
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-1.5 shrink-0">
                          <button
                            type="button"
                            onClick={() => fileInputRef.current?.click()}
                            className="px-2.5 py-1 bg-court-800 hover:bg-court-750 text-[#F5F0E6] rounded-lg text-[11px] font-semibold transition-colors border border-court-700"
                          >
                            Change
                          </button>
                          <button
                            type="button"
                            onClick={handleRemoveScreenshot}
                            className="p-1.5 text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-lg transition-colors"
                            title="Remove screenshot"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    )}

                    {/* UTR / Transaction ID Input Field */}
                    <div>
                      <label className="block text-[11px] font-bold text-[#9B9691] mb-1">
                        UPI Reference / UTR Number (Optional)
                      </label>
                      <input
                        type="text"
                        value={utrNumber}
                        onChange={(e) => setUtrNumber(e.target.value)}
                        placeholder="e.g. 423891029482 or UPI Txn Ref ID"
                        className="w-full bg-court-900 border border-court-700 text-[#F5F0E6] rounded-xl px-3.5 py-2.5 text-xs focus:ring-2 focus:ring-gold focus:outline-none placeholder:text-[#656C7D] font-mono"
                      />
                    </div>
                  </div>

                  {/* Prominent Demo Mode Disclaimer Box */}
                  <div className="p-4 bg-amber-500/15 border-2 border-amber-500/50 rounded-2xl flex items-start gap-3 text-xs text-amber-100 shadow-lg shadow-amber-500/5">
                    <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5 animate-pulse" />
                    <div className="space-y-1">
                      <strong className="font-extrabold text-amber-300 text-sm block tracking-wide">
                        ⚠️ Demo Mode: For Testing Only
                      </strong>
                      <p className="leading-relaxed text-amber-200/90 font-medium">
                        This QR code is for testing only. Do not send real money. This project does not have a verified payment gateway integration.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Option B: CASH ON ARRIVAL FLOW */}
              {paymentMethod === "cash_on_arrival" && (
                <div className="p-6 bg-court-950 border border-court-700 rounded-3xl space-y-4 text-xs">
                  <div className="flex items-center gap-3 text-amber-400">
                    <div className="p-3 bg-amber-500/20 rounded-2xl">
                      <Banknote className="w-6 h-6" />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-[#F5F0E6]">Pay Counter at Turf Arrival</h4>
                      <p className="text-[#9B9691] text-[11px]">Pay the manager in cash before match commencement</p>
                    </div>
                  </div>

                  <div className="p-4 bg-court-900/60 border border-court-700 rounded-2xl space-y-2 text-[#F5F0E6]">
                    <div className="flex justify-between font-semibold">
                      <span>Payable on Arrival:</span>
                      <span className="text-gold font-bold text-sm">₹{totalPrice}</span>
                    </div>
                    <div className="flex justify-between text-[11px] text-[#9B9691]">
                      <span>Slot Status:</span>
                      <span className="text-[#F5F0E6]">Reserved for 15 mins before kick-off</span>
                    </div>
                  </div>

                  <p className="text-[11px] text-[#9B9691] italic text-center">
                    Please reach the venue 10 minutes before your slot to verify your PlaySphere Athlete ID card and settle counter payment.
                  </p>
                </div>
              )}

              {/* Submit & Confirm Button */}
              <div className="space-y-2.5 pt-2">
                <button
                  type="button"
                  onClick={handleConfirmPayment}
                  disabled={confirming || (paymentMethod === "upi_qr" && loadingQr)}
                  className="w-full py-4 bg-gradient-to-r from-gold via-amber-400 to-gold-hover hover:from-gold-hover hover:to-amber-500 text-court-950 font-black rounded-2xl shadow-xl shadow-gold/20 transition-all transform hover:-translate-y-0.5 disabled:opacity-40 flex items-center justify-center gap-2 text-sm"
                >
                  {confirming ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      <span>Submitting Proof & Confirming...</span>
                    </>
                  ) : paymentMethod === "upi_qr" ? (
                    <>
                      <ShieldCheck className="w-5 h-5" />
                      <span>
                        {screenshot
                          ? "Submit Screenshot & Confirm Booking 🚀"
                          : "I've Paid — Confirm Booking"}
                      </span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="w-5 h-5" />
                      <span>Confirm Pay on Arrival Booking</span>
                    </>
                  )}
                </button>

                <button
                  type="button"
                  onClick={onCancel}
                  disabled={confirming}
                  className="w-full py-2.5 text-xs text-[#9B9691] hover:text-white font-semibold transition-colors text-center"
                >
                  Cancel and return to slot selection
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Lightbox / Preview Modal for Attached Screenshot */}
      {showProofModal && screenshotPreview && (
        <div
          className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-black/90 backdrop-blur-md animate-fade-in"
          onClick={() => setShowProofModal(false)}
        >
          <div className="relative max-w-lg w-full bg-court-950 border border-court-700 rounded-3xl p-4 space-y-3" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between pb-2 border-b border-court-700">
              <span className="text-xs font-bold text-[#F5F0E6] flex items-center gap-2">
                <FileCheck className="w-4 h-4 text-gold" />
                <span>Submitted Payment Screenshot</span>
              </span>
              <button
                type="button"
                onClick={() => setShowProofModal(false)}
                className="p-1 text-[#9B9691] hover:text-white bg-court-800 rounded-full"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="max-h-[60vh] overflow-auto rounded-xl">
              <img
                src={screenshotPreview}
                alt="Uploaded Payment Receipt"
                className="w-full h-auto object-contain rounded-xl"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PaymentQR;
