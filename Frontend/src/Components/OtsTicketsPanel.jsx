import React, { useState, useEffect, useCallback } from "react";
import {
  Banknote,
  QrCode,
  DollarSign,
  Plus,
  Trash2,
  RefreshCcw,
  Clock,
  Ticket,
  Wallet,
  CreditCard,
  Edit,
  CheckCircle2,
  AlertCircle,
  UserCheck,
  X
} from "lucide-react";
import { otsTicketAPI, referralCodeAPI } from "../api";

export default function OtsTicketsPanel({ canViewMoney = true }) {
  const [sales, setSales] = useState([]);
  const [hasMoneyAccess, setHasMoneyAccess] = useState(Boolean(canViewMoney));
  const [stats, setStats] = useState({
    totalTickets: 0,
    totalRevenue: 0,
    totalCashRevenue: 0,
    totalCashTickets: 0,
    totalQrisRevenue: 0,
    totalQrisTickets: 0,
  });
  const [committees, setCommittees] = useState([]);
  const [selectedCommittee, setSelectedCommittee] = useState("");
  const [defaultPrice, setDefaultPrice] = useState(35000);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [lastNotice, setLastNotice] = useState(null);
  const [customQty, setCustomQty] = useState(1);
  const [priceModalOpen, setPriceModalOpen] = useState(false);
  const [priceInput, setPriceInput] = useState(35000);

  useEffect(() => {
    if (typeof canViewMoney === "boolean") {
      setHasMoneyAccess(canViewMoney);
    }
  }, [canViewMoney]);

  const fetchCommittees = useCallback(async () => {
    try {
      const res = await referralCodeAPI.getAll();
      if (Array.isArray(res.data)) {
        setCommittees(res.data);
      }
    } catch {}
  }, []);

  const fetchSalesData = useCallback(async () => {
    try {
      setLoading(true);
      setError("");
      const res = await otsTicketAPI.getAll();
      setSales(res.data.sales || []);
      if (typeof res.data.canViewMoney === "boolean") {
        setHasMoneyAccess(res.data.canViewMoney);
      }
      setStats(
        res.data.stats || {
          totalTickets: 0,
          totalRevenue: 0,
          totalCashRevenue: 0,
          totalCashTickets: 0,
          totalQrisRevenue: 0,
          totalQrisTickets: 0,
        }
      );
      if (res.data.defaultPrice) {
        setDefaultPrice(res.data.defaultPrice);
        setPriceInput(res.data.defaultPrice);
      }
    } catch (err) {
      setError(err.userMessage || "Failed to load OTS sales data.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSalesData();
    fetchCommittees();
  }, [fetchSalesData, fetchCommittees]);

  const playChime = () => {
    try {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "sine";
      osc.frequency.setValueAtTime(587.33, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(880, ctx.currentTime + 0.1);
      gain.gain.setValueAtTime(0.2, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.15);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.15);
    } catch {}
  };

  const handleRecord = async (qty, paymentMethod) => {
    if (busy) return;
    setBusy(true);
    try {
      const recordedCommittee = selectedCommittee.trim();
      await otsTicketAPI.record({
        quantity: qty,
        paymentMethod,
        pricePerTicket: defaultPrice,
        committee: recordedCommittee,
      });

      playChime();
      const totalRecorded = qty * defaultPrice;
      const amountNotice = hasMoneyAccess ? `: Rp ${totalRecorded.toLocaleString("id-ID")}` : "";
      const committeeNotice = recordedCommittee ? ` [Referred by: ${recordedCommittee}]` : "";
      setLastNotice(`+${qty} Ticket (${paymentMethod.toUpperCase()})${committeeNotice} recorded${amountNotice}`);
      setTimeout(() => setLastNotice(null), 4000);

      await fetchSalesData();
      fetchCommittees();
      setCustomQty(1);
      setSelectedCommittee("");
    } catch (err) {
      alert(err.userMessage || "Failed to record OTS ticket sale.");
    } finally {
      setBusy(false);
    }
  };

  const handleDelete = async (id, amount, qty, method, committeeName) => {
    const amountStr = hasMoneyAccess && amount !== null && amount !== undefined ? `, Rp ${amount.toLocaleString("id-ID")}` : "";
    const refStr = committeeName ? ` (Referred: ${committeeName})` : "";
    if (
      !window.confirm(
        `Delete this entry (${qty} ticket${qty > 1 ? "s" : ""}${amountStr}, ${method}${refStr})? This will subtract it from total revenue and committee quota.`
      )
    ) {
      return;
    }
    setBusy(true);
    try {
      await otsTicketAPI.delete(id);
      await fetchSalesData();
      fetchCommittees();
    } catch (err) {
      alert(err.userMessage || "Failed to delete ticket record.");
    } finally {
      setBusy(false);
    }
  };

  const handleSavePrice = async (e) => {
    e.preventDefault();
    const num = Number(priceInput);
    if (isNaN(num) || num <= 0) {
      alert("Please enter a valid ticket price.");
      return;
    }
    try {
      await otsTicketAPI.updateSettings({ defaultPrice: num });
      setDefaultPrice(num);
      setPriceModalOpen(false);
    } catch (err) {
      alert(err.userMessage || "Failed to update ticket price.");
    }
  };

  const formatRupiah = (num) => {
    if (!hasMoneyAccess || num === null || num === undefined) {
      return "••••••";
    }
    return `Rp ${(Number(num) || 0).toLocaleString("id-ID")}`;
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-pink-500/15 border border-pink-500/30 text-xs sm:text-sm text-pink-200">
            <span className="text-pink-400/80">OTS Price:</span>
            <span className="font-bold text-white">Rp {(Number(defaultPrice) || 0).toLocaleString("id-ID")}</span>
            <button
              type="button"
              onClick={() => {
                setPriceInput(defaultPrice);
                setPriceModalOpen(true);
              }}
              className="text-xs text-pink-400 hover:text-pink-200 underline ml-1 inline-flex items-center gap-1"
            >
              <Edit size={12} /> Edit
            </button>
          </div>

          <button
            type="button"
            onClick={() => {
              fetchSalesData();
              fetchCommittees();
            }}
            disabled={loading}
            className="p-2.5 rounded-xl bg-pink-500/15 hover:bg-pink-500/25 text-pink-200 disabled:opacity-50 border border-pink-500/20"
            title="Refresh Data"
          >
            <RefreshCcw size={16} className={loading ? "animate-spin" : ""} />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="account-panel rounded-2xl p-5 border-2 border-emerald-500/40 bg-gradient-to-br from-emerald-950/30 to-black shadow-xl">
          <div className="flex items-center justify-between">
            <p className="text-xs font-bold text-emerald-400 uppercase tracking-wider">
              Total Money Collected
            </p>
            <div className="p-2 rounded-xl bg-emerald-500/20 text-emerald-400">
              <DollarSign size={20} />
            </div>
          </div>
          <p className="text-3xl sm:text-4xl font-black text-emerald-300 mt-2 tracking-tight">
            {formatRupiah(stats.totalRevenue)}
          </p>
          {!hasMoneyAccess && (
            <p className="text-xs text-emerald-400/70 mt-1 font-semibold">
              Finance and IT Admin Only
            </p>
          )}
        </div>

        <div className="account-panel rounded-2xl p-5 border border-pink-500/30 shadow-lg">
          <div className="flex items-center justify-between">
            <p className="text-xs font-bold text-pink-300 uppercase tracking-wider">
              Total OTS Tickets
            </p>
            <div className="p-2 rounded-xl bg-pink-500/20 text-pink-400">
              <Ticket size={20} />
            </div>
          </div>
          <p className="text-3xl sm:text-4xl font-black text-white mt-2">
            {stats.totalTickets} <span className="text-base font-semibold text-pink-300">tickets</span>
          </p>
        </div>

        <div className="account-panel rounded-2xl p-5 border border-emerald-500/25 shadow-lg">
          <div className="flex items-center justify-between">
            <p className="text-xs font-bold text-emerald-400 uppercase tracking-wider">
              Cash
            </p>
            <div className="p-2 rounded-xl bg-emerald-500/20 text-emerald-400">
              <Wallet size={20} />
            </div>
          </div>
          <p className="text-2xl sm:text-3xl font-extrabold text-white mt-2">
            {formatRupiah(stats.totalCashRevenue)}
          </p>
          {!hasMoneyAccess && (
            <p className="text-xs text-emerald-400/70 mt-1 font-semibold">
              Finance and IT Admin Only
            </p>
          )}
        </div>

        <div className="account-panel rounded-2xl p-5 border border-cyan-500/25 shadow-lg">
          <div className="flex items-center justify-between">
            <p className="text-xs font-bold text-cyan-400 uppercase tracking-wider">
              QRIS
            </p>
            <div className="p-2 rounded-xl bg-cyan-500/20 text-cyan-400">
              <QrCode size={20} />
            </div>
          </div>
          <p className="text-2xl sm:text-3xl font-extrabold text-white mt-2">
            {formatRupiah(stats.totalQrisRevenue)}
          </p>
          {!hasMoneyAccess && (
            <p className="text-xs text-cyan-400/70 mt-1 font-semibold">
              Finance and IT Admin Only
            </p>
          )}
        </div>
      </div>

      <div className="account-panel rounded-3xl p-5 sm:p-7 border border-pink-500/30 bg-black/60 shadow-2xl">
        {lastNotice && (
          <div className="mb-4 p-3 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-sm font-semibold flex items-center gap-2 animate-in fade-in slide-in-from-top-2">
            <CheckCircle2 size={18} className="shrink-0" />
            <span>{lastNotice}</span>
          </div>
        )}

        <div className="mb-5 p-4 rounded-2xl bg-black/40 border border-pink-500/25">
          <div className="flex items-center justify-between mb-1.5">
            <label className="text-xs font-bold text-pink-300 uppercase tracking-wider flex items-center gap-1.5">
              <UserCheck size={15} className="text-pink-400" />
              <span>Referred by Committee (Fulfill Quota)</span>
            </label>
            {selectedCommittee && (
              <button
                type="button"
                onClick={() => setSelectedCommittee("")}
                className="text-xs text-pink-400 hover:text-white flex items-center gap-0.5 underline font-medium"
              >
                <X size={12} /> Clear
              </button>
            )}
          </div>
          <div className="relative">
            <input
              type="text"
              list="committee-referral-options"
              value={selectedCommittee}
              onChange={(e) => setSelectedCommittee(e.target.value)}
              placeholder="Type or select committee name or RAC- code (optional)..."
              className="admin-field w-full px-4 py-2.5 text-sm font-medium"
            />
            <datalist id="committee-referral-options">
              {committees.map((c) => (
                <option
                  key={c._id}
                  value={`${c.panitiaName} (${c.code})`}
                >
                  Quota: {c.approvedCount || 0}/{c.targetQuota || 10} sold
                </option>
              ))}
            </datalist>
          </div>
          <p className="text-[11px] text-pink-300/60 mt-1.5">
            If an attendee mentions a committee member at the OTS desk, enter their name or code above to count these tickets towards their quota.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-5">
          <button
            type="button"
            disabled={busy}
            onClick={() => handleRecord(1, "cash")}
            className="flex flex-col items-center justify-center p-5 rounded-2xl bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-400 active:scale-[0.98] text-white shadow-xl shadow-emerald-900/40 transition-all border border-emerald-400/40 disabled:opacity-50"
          >
            <div className="flex items-center gap-2 font-black text-xl sm:text-2xl">
              <Banknote size={26} />
              <span> + CASH</span>
            </div>
          </button>

          <button
            type="button"
            disabled={busy}
            onClick={() => handleRecord(1, "qris")}
            className="flex flex-col items-center justify-center p-5 rounded-2xl bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 active:scale-[0.98] text-white shadow-xl shadow-cyan-900/40 transition-all border border-cyan-400/40 disabled:opacity-50"
          >
            <div className="flex items-center gap-2 font-black text-xl sm:text-2xl">
              <QrCode size={26} />
              <span>+ QRIS </span>
            </div>
          </button>
        </div>

        <div className="pt-4 border-t border-pink-500/20 flex flex-wrap items-center justify-between gap-4">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs font-semibold text-pink-300">Quick Cash Batches:</span>
            {[2, 3, 5].map((q) => (
              <button
                key={q}
                type="button"
                disabled={busy}
                onClick={() => handleRecord(q, "cash")}
                className="px-3 py-1.5 rounded-xl bg-pink-500/15 hover:bg-pink-500/30 text-pink-200 text-xs font-bold border border-pink-500/25 transition-all"
              >
                +{q} Cash {hasMoneyAccess ? `(${formatRupiah(q * defaultPrice)})` : ""}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-2 bg-black/40 p-1.5 rounded-2xl border border-pink-500/20">
            <span className="text-xs text-pink-300 font-semibold px-2">Custom Qty:</span>
            <button
              type="button"
              onClick={() => setCustomQty((prev) => Math.max(1, prev - 1))}
              className="w-8 h-8 rounded-xl bg-pink-500/20 hover:bg-pink-500/30 text-white font-bold text-sm"
            >
              -
            </button>
            <span className="w-8 text-center font-bold text-white text-sm">
              {customQty}
            </span>
            <button
              type="button"
              onClick={() => setCustomQty((prev) => prev + 1)}
              className="w-8 h-8 rounded-xl bg-pink-500/20 hover:bg-pink-500/30 text-white font-bold text-sm"
            >
              +
            </button>
            <button
              type="button"
              disabled={busy}
              onClick={() => handleRecord(customQty, "cash")}
              className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow transition-all ml-1"
            >
              Cash {hasMoneyAccess ? `(${formatRupiah(customQty * defaultPrice)})` : ""}
            </button>
            <button
              type="button"
              disabled={busy}
              onClick={() => handleRecord(customQty, "qris")}
              className="px-3 py-1.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-bold shadow transition-all"
            >
              QRIS
            </button>
          </div>
        </div>
      </div>

      <div className="account-panel rounded-3xl p-5 sm:p-6 border border-pink-500/25 shadow-xl">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-xl font-bold text-white flex items-center gap-2">
              <Clock size={20} className="text-pink-400" />
              Transaction History
            </h3>
          </div>
          <span className="text-xs font-semibold px-3 py-1 rounded-full bg-pink-500/20 text-pink-300 border border-pink-500/30">
            {sales.length} records
          </span>
        </div>

        {error && (
          <div className="p-3 rounded-xl bg-red-500/20 border border-red-500 text-red-200 text-sm mb-4">
            {error}
          </div>
        )}

        <div className="overflow-x-auto -mx-4 sm:mx-0 px-4 sm:px-0">
          <table className="w-full min-w-[800px] whitespace-nowrap">
            <thead>
              <tr className="border-b border-pink-500/20 text-xs text-pink-300 uppercase tracking-wider">
                <th className="text-left py-3.5">#</th>
                <th className="text-left py-3.5">Time</th>
                <th className="text-center py-3.5">Tickets</th>
                <th className="text-right py-3.5">Price / Ticket</th>
                <th className="text-right py-3.5 font-bold">Total Amount</th>
                <th className="text-center py-3.5">Payment Method</th>
                <th className="text-left py-3.5">Committee</th>
                <th className="text-left py-3.5">Recorded By</th>
                <th className="text-right py-3.5">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-pink-500/10 text-sm">
              {loading && sales.length === 0 ? (
                <tr>
                  <td colSpan="9" className="py-8 text-center text-pink-300">
                    Loading OTS transactions...
                  </td>
                </tr>
              ) : sales.length === 0 ? (
                <tr>
                  <td colSpan="9" className="py-8 text-center text-pink-300/60">
                    No OTS tickets recorded yet.
                  </td>
                </tr>
              ) : (
                sales.map((item, idx) => {
                  const date = new Date(item.createdAt);
                  const timeStr = date.toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                    second: "2-digit",
                  });
                  const dateStr = date.toLocaleDateString([], {
                    month: "short",
                    day: "numeric",
                  });

                  return (
                    <tr
                      key={item._id}
                      className="hover:bg-pink-500/5 transition-colors"
                    >
                      <td className="py-3.5 text-xs text-pink-300/60 font-mono">
                        {sales.length - idx}
                      </td>
                      <td className="py-3.5">
                        <div className="font-semibold text-white">{timeStr}</div>
                        <div className="text-xs text-pink-300/60">{dateStr}</div>
                      </td>
                      <td className="text-center">
                        <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-pink-500/20 text-pink-300 border border-pink-500/30">
                          {item.quantity} {item.quantity > 1 ? "tickets" : "ticket"}
                        </span>
                      </td>
                      <td className="text-right text-zinc-300 text-xs">
                        {formatRupiah(item.pricePerTicket)}
                      </td>
                      <td className="text-right font-black text-emerald-300 text-base">
                        {formatRupiah(item.totalAmount)}
                      </td>
                      <td className="text-center">
                        {item.paymentMethod === "cash" ? (
                          <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                            💵 CASH
                          </span>
                        ) : item.paymentMethod === "qris" ? (
                          <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-cyan-500/20 text-cyan-400 border border-cyan-500/30">
                            📱 QRIS
                          </span>
                        ) : (
                          <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-zinc-700 text-zinc-300">
                            {item.paymentMethod}
                          </span>
                        )}
                      </td>
                      <td className="text-xs">
                        {item.committeeName || item.referralCode ? (
                          <div className="flex flex-col max-w-[160px]">
                            <span className="font-semibold text-white truncate">
                              {item.committeeName || item.referralCode}
                            </span>
                            {item.referralCode && (
                              <span className="text-[10px] font-mono font-bold text-pink-400">
                                {item.referralCode}
                              </span>
                            )}
                          </div>
                        ) : (
                          <span className="text-zinc-500">-</span>
                        )}
                      </td>
                      <td className="text-xs text-zinc-300 font-medium">
                        {item.recordedBy || "Admin"}
                      </td>
                      <td className="text-right">
                        <button
                          type="button"
                          disabled={busy}
                          onClick={() =>
                            handleDelete(
                              item._id,
                              item.totalAmount,
                              item.quantity,
                              item.paymentMethod,
                              item.committeeName || item.referralCode
                            )
                          }
                          className="p-1.5 rounded-lg text-red-400 hover:bg-red-500/20 transition-colors"
                          title="Undo / Delete"
                        >
                          <Trash2 size={16} />
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {priceModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="account-panel w-full max-w-sm rounded-3xl p-6 border border-pink-500/30 shadow-2xl animate-in fade-in zoom-in duration-200">
            <h3 className="text-xl font-bold text-pink-500 mb-2">
              Set OTS Ticket Price
            </h3>
            <p className="text-xs text-pink-200/70 mb-4">
              Enter the standard on-the-spot price per ticket.
            </p>

            <form onSubmit={handleSavePrice} className="space-y-4">
              <div>
                <label className="account-label block mb-2">Price Per Ticket (IDR)</label>
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 font-bold text-pink-400">
                    Rp
                  </span>
                  <input
                    type="number"
                    min="1000"
                    step="1000"
                    required
                    value={priceInput}
                    onChange={(e) => setPriceInput(e.target.value)}
                    className="admin-field w-full pl-12 pr-4 py-2.5 font-bold text-lg"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-pink-500/20">
                <button
                  type="button"
                  onClick={() => setPriceModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-pink-500/30 text-pink-200 text-sm font-semibold hover:bg-pink-500/10"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-pink-600 hover:bg-pink-500 text-white text-sm font-bold shadow-lg shadow-pink-600/30"
                >
                  Save Price
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
