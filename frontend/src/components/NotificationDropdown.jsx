import React, { useState, useEffect, useRef } from "react";
import { Bell, CheckCheck, ExternalLink, Sparkles } from "lucide-react";
import { Link } from "react-router-dom";
import { fetchNotifications, markNotificationRead, markAllNotificationsRead } from "../api";
import { useAuth } from "../context/AuthContext";

const NotificationDropdown = () => {
  const { user } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const dropdownRef = useRef(null);

  const loadNotifications = async () => {
    if (!user) return;
    try {
      setLoading(true);
      const res = await fetchNotifications();
      if (res.data.success) {
        setNotifications(res.data.notifications || []);
        setUnreadCount(res.data.unreadCount || 0);
      }
    } catch (err) {
      console.warn("Failed to load notifications:", err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadNotifications();
    const interval = setInterval(loadNotifications, 30000); // refresh every 30s
    return () => clearInterval(interval);
  }, [user]);

  // Close on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleMarkAllRead = async () => {
    try {
      await markAllNotificationsRead();
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
      setUnreadCount(0);
    } catch (err) {
      console.error(err);
    }
  };

  const handleItemClick = async (n) => {
    if (!n.isRead) {
      try {
        await markNotificationRead(n._id);
        setNotifications((prev) =>
          prev.map((item) => (item._id === n._id ? { ...item, isRead: true } : item))
        );
        setUnreadCount((c) => Math.max(0, c - 1));
      } catch (err) {
        console.error(err);
      }
    }
    setIsOpen(false);
  };

  if (!user) return null;

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 rounded-xl text-[#9B9691] hover:text-[#F5F0E6] hover:bg-court-800 transition-colors"
        aria-label="Notifications"
      >
        <Bell className="w-5 h-5" />
        {unreadCount > 0 && (
          <span className="absolute top-1 right-1 w-4 h-4 bg-gradient-to-r from-gold to-amber-500 text-court-950 text-[10px] font-black rounded-full flex items-center justify-center shadow-md shadow-gold/30 animate-pulse">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-3 w-80 sm:w-96 bg-court-900 border border-court-700 rounded-2xl shadow-2xl z-50 overflow-hidden text-[#F5F0E6]">
          <div className="flex items-center justify-between px-4 py-3 border-b border-court-700 bg-court-950/80">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-gold" />
              <span className="font-bold text-sm">Notifications</span>
              {unreadCount > 0 && (
                <span className="px-2 py-0.5 text-xs bg-gold/20 text-gold-light rounded-full font-semibold border border-gold/30">
                  {unreadCount} new
                </span>
              )}
            </div>

            {unreadCount > 0 && (
              <button
                onClick={handleMarkAllRead}
                className="text-xs text-[#9B9691] hover:text-gold flex items-center gap-1 transition-colors"
              >
                <CheckCheck className="w-3.5 h-3.5" />
                Mark all read
              </button>
            )}
          </div>

          <div className="max-h-80 overflow-y-auto divide-y divide-court-700/60">
            {loading && notifications.length === 0 ? (
              <div className="p-6 text-center text-xs text-[#9B9691]">Loading notifications...</div>
            ) : notifications.length === 0 ? (
              <div className="p-8 text-center text-[#9B9691] text-xs">
                No notifications right now. Activity on bookings, team invites, and matches will appear here.
              </div>
            ) : (
              notifications.map((n) => (
                <Link
                  key={n._id}
                  to={n.link || "#"}
                  onClick={() => handleItemClick(n)}
                  className={`block px-4 py-3 hover:bg-court-800 transition-colors ${
                    !n.isRead ? "bg-gold/5 border-l-2 border-gold" : ""
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <p className="text-xs font-bold text-[#F5F0E6]">{n.title}</p>
                    <span className="text-[10px] text-[#9B9691] whitespace-nowrap">
                      {new Date(n.createdAt).toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </span>
                  </div>
                  <p className="text-[11px] text-[#9B9691] mt-1 line-clamp-2">{n.message}</p>
                </Link>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationDropdown;
