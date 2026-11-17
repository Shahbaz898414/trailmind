"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  ChevronRight,
  CheckCheck,
  SlidersHorizontal,
  Shield,
  Satellite,
  Eye,
  Layers,
  BatteryMedium,
  Wind,
  CloudSync,
  Radio,
  CheckCircle2,
  Bell,
  Clock,
  Terminal,
  Download,
  AlertTriangle,
  X,
  Bed,
  Battery,
  AlertCircle,
  Watch,
  Smartphone,
  MessageSquare,
  Lock,
} from "lucide-react";

import { useAuth } from "@/components/auth/auth-provider";
import { useAsyncResource } from "@/hooks/use-async-resource";
import {
  deleteNotification,
  listNotifications,
  markAllNotificationsRead,
  markNotificationRead,
  markNotificationUnread,
  type NotificationRecord,
} from "@/services/notifications";

type AlertCategory = "critical" | "weather" | "storage" | "mesh" | "state";

/** View-model for one row of the alert feed (mapped from a NotificationRecord). */
interface AlertItem {
  id: string;
  category: AlertCategory;
  severity: NotificationRecord["severity"];
  title: string;
  description: string;
  timestamp: string;
  read: boolean;
  borderClass: string;
  badgeBg: string;
  badgeText: string;
  badgeLabel: string;
  telemetry: {
    device: string;
    detail1: string;
    detail2: string;
  };
}

/** Severity → the exact palette the design already uses for each tier. */
const SEVERITY_STYLES: Record<
  NotificationRecord["severity"],
  { borderClass: string; badgeBg: string; badgeText: string }
> = {
  critical: {
    borderClass: "bg-rose-600",
    badgeBg: "bg-rose-100",
    badgeText: "text-rose-800",
  },
  warning: {
    borderClass: "bg-amber-500",
    badgeBg: "bg-amber-100",
    badgeText: "text-amber-900",
  },
  success: {
    borderClass: "bg-emerald-600",
    badgeBg: "bg-secondary-fixed",
    badgeText: "text-primary",
  },
  info: {
    borderClass: "bg-primary",
    badgeBg: "bg-primary/10",
    badgeText: "text-primary",
  },
};

/** Firestore category → the icon segment the feed already renders. */
function categoryToSegment(
  category: NotificationRecord["category"]
): AlertCategory {
  switch (category) {
    case "Weather":
      return "weather";
    case "Offline Sync":
      return "storage";
    case "Transit":
      return "state";
    case "Emergency":
      return "critical";
    case "Satellite":
    default:
      return "mesh";
  }
}

function toAlertItem(record: NotificationRecord): AlertItem {
  const styles = SEVERITY_STYLES[record.severity] ?? SEVERITY_STYLES.info;
  return {
    id: record.id,
    category: categoryToSegment(record.category),
    severity: record.severity,
    title: record.title,
    description: record.body || "No details were recorded with this alert.",
    timestamp: record.timestamp,
    read: record.read,
    borderClass: styles.borderClass,
    badgeBg: styles.badgeBg,
    badgeText: styles.badgeText,
    badgeLabel: `${record.severity} • ${record.category}`,
    telemetry: {
      device: record.category,
      detail1: `Severity: ${record.severity}`,
      detail2: record.read ? "Read" : "Unread",
    },
  };
}

/** Severity filter cycle used by the "Filter by Severity" button. */
const SEVERITY_CYCLE = ["all", "critical", "warning", "info", "success"] as const;

export default function NotificationsCenterPage() {
  const { user } = useAuth();
  const uid = user?.uid ?? null;

  // Bumped after every mutation so the feed re-reads Firestore/local cache.
  const [reloadKey, setReloadKey] = useState(0);
  const [acting, setActing] = useState(false);
  const [activeTab, setActiveTab] = useState<string>("all");
  const [severityIdx, setSeverityIdx] = useState(0);
  const [quietHours, setQuietHours] = useState(true);
  const [batteryConservation, setBatteryConservation] = useState(true);
  const [fallDetection, setFallDetection] = useState(true);
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  const notifKey = uid ? `notifications:${uid}:${reloadKey}` : null;
  const { data, error, loading } = useAsyncResource<NotificationRecord[]>(
    notifKey,
    async () => {
      if (!uid) return [];
      const page = await listNotifications(uid, { pageSize: 100 });
      return page.items;
    }
  );

  const notifications = data ?? [];
  const alerts = React.useMemo(
    () => notifications.map(toAlertItem),
    [notifications]
  );
  const unreadCount = notifications.filter((n) => !n.read).length;
  const criticalUnread = notifications.filter(
    (n) => !n.read && n.severity === "critical"
  ).length;
  const offlineSyncCount = notifications.filter(
    (n) => n.category === "Offline Sync"
  ).length;
  const categoryCount = new Set(notifications.map((n) => n.category)).size;
  const readPercent =
    notifications.length === 0
      ? 0
      : Math.round(
          ((notifications.length - unreadCount) / notifications.length) * 100
        );

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3000);
  };

  const severityFilter = SEVERITY_CYCLE[severityIdx];
  const cycleSeverity = () => {
    const next = (severityIdx + 1) % SEVERITY_CYCLE.length;
    setSeverityIdx(next);
    showToast(
      SEVERITY_CYCLE[next] === "all"
        ? "Showing alerts of every severity."
        : `Filtered to ${SEVERITY_CYCLE[next]} severity.`
    );
  };

  const markAllRead = async () => {
    if (!uid || acting) return;
    setActing(true);
    try {
      const count = await markAllNotificationsRead(uid);
      showToast(
        count === 0
          ? "Nothing to mark — every alert is already read."
          : `${count} alert${count === 1 ? "" : "s"} marked as read.`
      );
      setReloadKey((k) => k + 1);
    } catch (err) {
      showToast(
        err instanceof Error ? err.message : "Could not update notifications."
      );
    } finally {
      setActing(false);
    }
  };

  const toggleRead = async (alert: AlertItem) => {
    if (!uid || acting) return;
    setActing(true);
    try {
      if (alert.read) await markNotificationUnread(uid, alert.id);
      else await markNotificationRead(uid, alert.id);
      setReloadKey((k) => k + 1);
    } catch (err) {
      showToast(
        err instanceof Error ? err.message : "Could not update that alert."
      );
    } finally {
      setActing(false);
    }
  };

  const dismissAlert = async (id: string) => {
    if (!uid || acting) return;
    setActing(true);
    try {
      await deleteNotification(uid, id);
      showToast("Alert dismissed.");
      setReloadKey((k) => k + 1);
    } catch (err) {
      showToast(
        err instanceof Error ? err.message : "Could not dismiss that alert."
      );
    } finally {
      setActing(false);
    }
  };

  const filteredAlerts = alerts.filter((alert) => {
    if (severityFilter !== "all" && alert.severity !== severityFilter) {
      return false;
    }
    if (activeTab === "all") return true;
    if (activeTab === "satellite") return alert.category === "critical" || alert.category === "mesh";
    if (activeTab === "weather") return alert.category === "weather";
    if (activeTab === "storage") return alert.category === "storage" || alert.category === "state";
    return true;
  });

  return (
    <div className="w-full bg-surface min-h-screen">
      <div className="flex flex-col w-full">
        <div className="px-4 lg:px-8 py-6 max-w-[1400px] mx-auto w-full flex flex-col gap-6">
          {/* Top Context & Header Row */}
          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-1.5 text-on-surface-variant text-xs tracking-wider uppercase font-mono">
              <Link href="/settings" className="hover:text-primary transition-colors">
                Settings & Governance
              </Link>
              <ChevronRight className="w-3.5 h-3.5" />
              <span className="text-primary font-bold">Expedition Notifications & Satellite Alerts</span>
            </div>

            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mt-1">
              <div className="flex flex-col gap-1">
                <h1 className="text-3xl font-extrabold text-primary tracking-tight font-serif flex items-center gap-3 flex-wrap">
                  <span>Expedition Notifications & Satellite Alerts</span>
                  {criticalUnread > 0 ? (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full bg-rose-100 text-rose-800 text-xs font-semibold">
                      <span className="w-1.5 h-1.5 rounded-full bg-rose-600 mr-1.5 animate-ping" />
                      {criticalUnread} Critical Dispatch
                      {criticalUnread === 1 ? "" : "es"}
                    </span>
                  ) : (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full bg-secondary-fixed text-on-secondary-fixed text-xs font-semibold">
                      No critical alerts
                    </span>
                  )}
                </h1>
                <p className="text-sm text-on-surface-variant max-w-3xl">
                  Priority telemetry, low-power satellite dispatch queues, hardware watchdog alarms, and
                  offline cache invalidation logs across active field nodes.
                </p>
              </div>

              <div className="flex items-center gap-2 shrink-0 flex-wrap">
                <button
                  onClick={() => void markAllRead()}
                  disabled={acting}
                  className="px-3.5 py-2 rounded-lg bg-surface-container hover:bg-surface-container-high text-on-surface text-xs font-semibold transition-all flex items-center gap-1.5 shadow-sm active:scale-95 border border-outline-variant/30 disabled:opacity-60"
                >
                  <CheckCheck className="w-3.5 h-3.5" />
                  <span>Mark All Read</span>
                </button>
                <button
                  onClick={cycleSeverity}
                  className="px-3.5 py-2 rounded-lg bg-surface-container-lowest hover:bg-surface-container text-primary text-xs font-semibold transition-all flex items-center gap-1.5 shadow-sm border border-outline-variant/30"
                >
                  <SlidersHorizontal className="w-3.5 h-3.5" />
                  <span>
                    Severity: {severityFilter === "all" ? "All" : severityFilter}
                  </span>
                </button>
                <Link
                  href="/settings/hardware"
                  className="px-4 py-2 rounded-lg bg-primary text-white hover:bg-primary-container text-xs font-semibold transition-all flex items-center gap-1.5 shadow-sm"
                >
                  <Shield className="w-3.5 h-3.5" />
                  <span>Configure Alert Rules</span>
                </Link>
              </div>
            </div>
          </div>

          {/* Toast Notification */}
          {toastMsg && (
            <div className="p-3 bg-secondary-fixed/50 border border-primary/20 rounded-xl flex items-center gap-3 text-primary text-sm font-medium animate-in fade-in slide-in-from-top duration-200">
              <CheckCircle2 className="w-4 h-4 text-primary shrink-0" />
              <span>{toastMsg}</span>
            </div>
          )}

          {/* Telemetry Stat Strip (4 Metric Tiles) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Stat 1 */}
            <div className="bg-surface-container-lowest rounded-xl p-4 shadow-sm flex flex-col justify-between gap-2 relative overflow-hidden group hover:shadow-md transition-shadow border border-outline-variant/30">
              <div className="flex items-center justify-between">
                <span className="text-[10px] text-on-surface-variant tracking-wider uppercase font-semibold">
                  Critical Dispatches
                </span>
                <span className="p-1.5 rounded-lg bg-rose-100 text-rose-800 flex items-center justify-center">
                  <Satellite className="w-4 h-4" />
                </span>
              </div>
              <div className="flex items-baseline gap-1.5">
                <span className="text-2xl font-extrabold text-on-surface font-mono">
                  {criticalUnread}
                </span>
                <span className="text-xs text-rose-600 font-semibold">Unread critical</span>
              </div>
              <div className="flex items-center justify-between text-on-surface-variant text-[11px] pt-1 border-t border-outline-variant/20">
                <span className="flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-rose-600" /> Severity: critical
                </span>
                <span className="text-primary font-mono font-medium">{notifications.length} total</span>
              </div>
            </div>

            {/* Stat 2 */}
            <div className="bg-surface-container-lowest rounded-xl p-4 shadow-sm flex flex-col justify-between gap-2 relative overflow-hidden group hover:shadow-md transition-shadow border border-outline-variant/30">
              <div className="flex items-center justify-between">
                <span className="text-[10px] text-on-surface-variant tracking-wider uppercase font-semibold">
                  Unread Alerts
                </span>
                <span className="p-1.5 rounded-lg bg-secondary-fixed text-primary flex items-center justify-center">
                  <Eye className="w-4 h-4" />
                </span>
              </div>
              <div className="flex items-baseline gap-1.5">
                <span className="text-2xl font-extrabold text-primary font-serif">{unreadCount}</span>
                <span className="text-xs text-on-surface-variant">of {notifications.length} stored</span>
              </div>
              <div className="w-full bg-surface-container-high rounded-full h-1.5 overflow-hidden mt-1">
                <div className="bg-primary h-full rounded-full transition-all" style={{ width: `${readPercent}%` }} />
              </div>
              <span className="text-[11px] text-on-surface-variant">{readPercent}% read</span>
            </div>

            {/* Stat 3 */}
            <div className="bg-surface-container-lowest rounded-xl p-4 shadow-sm flex flex-col justify-between gap-2 relative overflow-hidden group hover:shadow-md transition-shadow border border-outline-variant/30">
              <div className="flex items-center justify-between">
                <span className="text-[10px] text-on-surface-variant tracking-wider uppercase font-semibold">
                  Offline Sync Notices
                </span>
                <span className="p-1.5 rounded-lg bg-secondary-fixed text-primary flex items-center justify-center">
                  <Layers className="w-4 h-4" />
                </span>
              </div>
              <div className="flex items-baseline gap-1.5">
                <span className="text-2xl font-extrabold text-on-surface font-mono">{offlineSyncCount}</span>
                <span className="text-xs text-amber-700 font-semibold">Sync events</span>
              </div>
              <div className="flex items-center justify-between text-on-surface-variant text-[11px] pt-1 border-t border-outline-variant/20">
                <span className="truncate">Notifications stored</span>
                <span className="bg-surface-container-high text-on-surface px-1.5 py-0.2 rounded font-mono text-[10px]">
                  {notifications.length}
                </span>
              </div>
            </div>

            {/* Stat 4 */}
            <div className="bg-surface-container-lowest rounded-xl p-4 shadow-sm flex flex-col justify-between gap-2 relative overflow-hidden group hover:shadow-md transition-shadow border border-outline-variant/30">
              <div className="flex items-center justify-between">
                <span className="text-[10px] text-on-surface-variant tracking-wider uppercase font-semibold">
                  Alert Categories
                </span>
                <span className="p-1.5 rounded-lg bg-surface-container-high text-primary flex items-center justify-center">
                  <BatteryMedium className="w-4 h-4" />
                </span>
              </div>
              <div className="flex items-baseline gap-1.5">
                <span className="text-2xl font-extrabold text-primary font-serif">{categoryCount}</span>
                <span className="text-xs text-emerald-700 font-medium font-mono">In use</span>
              </div>
              <div className="flex items-center justify-between text-on-surface-variant text-[11px] pt-1 border-t border-outline-variant/20">
                <span className="truncate">
                  Satellite • Weather • Sync • Emergency • Transit
                </span>
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
              </div>
            </div>
          </div>

          {/* Main Content Area: Split View (8 cols / 4 cols) */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* Left Column: Filter Tabs + Notification Feed (8 Cols) */}
            <div className="lg:col-span-8 flex flex-col gap-4">
              {/* Filter Tabs */}
              <div className="flex items-center gap-2 overflow-x-auto pb-1">
                <button
                  onClick={() => setActiveTab("all")}
                  className={`px-3.5 py-1.5 rounded-full text-xs whitespace-nowrap shadow-sm flex items-center gap-1.5 font-semibold transition-all ${
                    activeTab === "all"
                      ? "bg-primary text-white"
                      : "bg-surface-container-lowest hover:bg-surface-container text-on-surface-variant border border-outline-variant/30"
                  }`}
                >
                  <span>All Alerts</span>
                  <span
                    className={`px-1.5 py-0.2 rounded-full text-[10px] font-mono ${
                      activeTab === "all" ? "bg-white/20 text-white" : "bg-surface-container text-on-surface"
                    }`}
                  >
                    {alerts.length}
                  </span>
                </button>
                <button
                  onClick={() => setActiveTab("satellite")}
                  className={`px-3.5 py-1.5 rounded-full text-xs whitespace-nowrap shadow-sm flex items-center gap-1.5 font-semibold transition-all ${
                    activeTab === "satellite"
                      ? "bg-primary text-white"
                      : "bg-surface-container-lowest hover:bg-surface-container text-on-surface-variant border border-outline-variant/30"
                  }`}
                >
                  <span>Satellite & Mesh</span>
                </button>
                <button
                  onClick={() => setActiveTab("weather")}
                  className={`px-3.5 py-1.5 rounded-full text-xs whitespace-nowrap shadow-sm flex items-center gap-1.5 font-semibold transition-all ${
                    activeTab === "weather"
                      ? "bg-primary text-white"
                      : "bg-surface-container-lowest hover:bg-surface-container text-on-surface-variant border border-outline-variant/30"
                  }`}
                >
                  <span>Weather Advisories</span>
                </button>
                <button
                  onClick={() => setActiveTab("storage")}
                  className={`px-3.5 py-1.5 rounded-full text-xs whitespace-nowrap shadow-sm flex items-center gap-1.5 font-semibold transition-all ${
                    activeTab === "storage"
                      ? "bg-primary text-white"
                      : "bg-surface-container-lowest hover:bg-surface-container text-on-surface-variant border border-outline-variant/30"
                  }`}
                >
                  <span>Storage & State</span>
                </button>
              </div>

              {/* Alerts List */}
              <div className="flex flex-col gap-3">
                {loading ? (
                  <div className="p-6 rounded-xl bg-surface-container-lowest border border-outline-variant/30 text-center text-xs text-on-surface-variant">
                    Loading your alerts…
                  </div>
                ) : error ? (
                  <div className="p-6 rounded-xl bg-surface-container-lowest border border-outline-variant/30 text-center">
                    <p className="text-xs text-error">{error}</p>
                    <p className="text-[11px] text-on-surface-variant mt-1">
                      Alerts saved on this device are still shown once loaded.
                    </p>
                  </div>
                ) : filteredAlerts.length === 0 ? (
                  <div className="p-6 rounded-xl bg-surface-container-lowest border border-outline-variant/30 text-center text-xs text-on-surface-variant">
                    {alerts.length === 0
                      ? "No alerts yet — events from trips, sync and uploads show up here."
                      : "No alerts match this filter."}
                  </div>
                ) : null}

                {filteredAlerts.map((alert) => (
                  <div
                    key={alert.id}
                    className={`bg-surface-container-lowest rounded-xl p-5 shadow-sm hover:shadow-md transition-all flex flex-col gap-3 relative overflow-hidden border border-outline-variant/30 ${
                      alert.read ? "opacity-80" : ""
                    }`}
                  >
                    <div className={`absolute left-0 top-0 bottom-0 w-1.5 ${alert.borderClass}`} />
                    <div className="flex items-start justify-between gap-4 flex-wrap sm:flex-nowrap">
                      <div className="flex items-start gap-3">
                        <div className="p-2.5 rounded-xl bg-surface-container shrink-0 shadow-sm mt-0.5 text-primary">
                          {alert.category === "critical" && <Satellite className="w-5 h-5 text-rose-600" />}
                          {alert.category === "weather" && <Wind className="w-5 h-5 text-amber-600" />}
                          {alert.category === "storage" && <CloudSync className="w-5 h-5 text-emerald-600" />}
                          {alert.category === "mesh" && <Radio className="w-5 h-5 text-primary" />}
                          {alert.category === "state" && <CheckCircle2 className="w-5 h-5 text-on-surface-variant" />}
                        </div>
                        <div className="flex flex-col gap-0.5">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span
                              className={`px-2 py-0.5 rounded-full ${alert.badgeBg} ${alert.badgeText} text-[11px] font-bold tracking-wider uppercase`}
                            >
                              {alert.badgeLabel}
                            </span>
                            <span className="text-[11px] text-on-surface-variant font-mono">
                              ID: {alert.id.slice(0, 8)}
                            </span>
                          </div>
                          <h2 className="text-base font-bold text-on-surface mt-1 tracking-tight font-serif">
                            {alert.title}
                          </h2>
                        </div>
                      </div>
                      <span className="text-xs text-on-surface-variant whitespace-nowrap bg-surface-container-low px-2 py-1 rounded-md font-mono">
                        {alert.timestamp}
                      </span>
                    </div>

                    <p className="text-xs text-on-surface-variant ml-0 sm:ml-12 leading-relaxed">
                      {alert.description}
                    </p>

                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2 ml-0 sm:ml-12 border-t border-outline-variant/20">
                      <div className="flex items-center gap-2 text-on-surface-variant text-[11px] flex-wrap font-mono">
                        <span className="font-medium text-on-surface">{alert.telemetry.device}</span>
                        <span>•</span>
                        <span>{alert.telemetry.detail1}</span>
                        <span>•</span>
                        <span>{alert.telemetry.detail2}</span>
                      </div>
                      <div className="flex items-center gap-2 self-end sm:self-center">
                        <button
                          onClick={() => void toggleRead(alert)}
                          disabled={acting}
                          className="px-2.5 py-1 rounded-lg bg-surface-container hover:bg-surface-container-high text-on-surface text-xs font-mono transition-colors flex items-center gap-1 disabled:opacity-60"
                        >
                          {alert.read ? (
                            <>
                              <AlertCircle className="w-3.5 h-3.5" />
                              <span>Mark Unread</span>
                            </>
                          ) : (
                            <>
                              <CheckCircle2 className="w-3.5 h-3.5" />
                              <span>Mark Read</span>
                            </>
                          )}
                        </button>
                        <button
                          onClick={() => void dismissAlert(alert.id)}
                          disabled={acting}
                          className="px-2.5 py-1 rounded-lg bg-surface-container-lowest hover:bg-rose-50 hover:text-rose-700 text-on-surface-variant text-xs transition-colors border border-outline-variant/30 disabled:opacity-60"
                        >
                          Dismiss
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* In-Field Telemetry Mini-Log footer */}
              <div className="p-3.5 rounded-xl bg-surface-container flex items-center justify-between gap-4 text-on-surface-variant border border-outline-variant/30">
                <div className="flex items-center gap-2 text-xs">
                  <Radio className="w-4 h-4 text-primary shrink-0" />
                  <span className="text-on-surface">
                    {notifications.length} alert
                    {notifications.length === 1 ? "" : "s"} in your account •{" "}
                    {unreadCount} unread • stored in your account and cached on
                    this device for offline reading.
                  </span>
                </div>
                <span className="font-mono text-xs text-primary uppercase font-bold tracking-widest shrink-0">
                  {unreadCount} Unread
                </span>
              </div>
            </div>

            {/* Right Column: Escalation Hierarchy & Controls Rail (4 Cols) */}
            <div className="lg:col-span-4 flex flex-col gap-4">
              {/* Satellite Escalation Hierarchy Card */}
              <div className="bg-surface-container-lowest rounded-xl p-6 shadow-sm flex flex-col gap-4 border border-outline-variant/30">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="p-1.5 rounded-lg bg-primary text-white flex items-center justify-center">
                      <Shield className="w-4 h-4" />
                    </span>
                    <h3 className="text-lg font-bold text-primary font-serif">Escalation Ladder</h3>
                  </div>
                  <span className="text-[10px] text-on-surface-variant bg-surface-container px-2 py-0.5 rounded-md font-mono">
                    POL-SAR-09
                  </span>
                </div>
                <p className="text-xs text-on-surface-variant leading-relaxed">
                  Automated dispatcher failsafe when telemetry heartbeat goes silent past the programmed
                  deadline.
                </p>

                {/* Ladder Visual */}
                <div className="flex flex-col gap-3 relative pl-6 border-l-2 border-outline-variant/40 my-1">
                  {/* Tier 1 */}
                  <div className="relative flex flex-col gap-1 pb-2">
                    <span className="absolute -left-[31px] top-0 w-4 h-4 rounded-full bg-rose-600 border-2 border-white shadow-sm flex items-center justify-center text-[9px] text-white font-bold">
                      1
                    </span>
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-rose-700 font-bold uppercase tracking-wider">
                        Priority 1 • SAR SOS
                      </span>
                      <span className="font-mono text-[10px] text-on-surface-variant">T + 120m</span>
                    </div>
                    <p className="text-xs text-on-surface font-medium leading-tight">
                      Iridium Satellite Distress burst to Prefectural Police Mountain SAR Relay.
                    </p>
                  </div>

                  {/* Tier 2 */}
                  <div className="relative flex flex-col gap-1 pb-2">
                    <span className="absolute -left-[31px] top-0 w-4 h-4 rounded-full bg-amber-500 border-2 border-white shadow-sm flex items-center justify-center text-[9px] text-white font-bold">
                      2
                    </span>
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-amber-800 font-bold uppercase tracking-wider">
                        Priority 2 • Basecamp
                      </span>
                      <span className="font-mono text-[10px] text-on-surface-variant">T + 60m</span>
                    </div>
                    <p className="text-xs text-on-surface font-medium leading-tight">
                      LoRa Peer Ping broadcast across high-gain valley relay towers.
                    </p>
                  </div>

                  {/* Tier 3 */}
                  <div className="relative flex flex-col gap-1">
                    <span className="absolute -left-[31px] top-0 w-4 h-4 rounded-full bg-primary border-2 border-white shadow-sm flex items-center justify-center text-[9px] text-white font-bold">
                      3
                    </span>
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-primary font-bold uppercase tracking-wider">
                        Priority 3 • In-Situ Tone
                      </span>
                      <span className="font-mono text-[10px] text-on-surface-variant">T + 0m</span>
                    </div>
                    <p className="text-xs text-on-surface font-medium leading-tight">
                      Local audio buzzer alert & BLE vibration pulses to Suunto watch.
                    </p>
                  </div>
                </div>

                <div className="p-3 rounded-lg bg-surface-container-low flex items-center justify-between text-xs border border-outline-variant/20">
                  <span className="text-on-surface-variant">
                    Escalation:{" "}
                    <strong className="text-on-surface">Not configured</strong>
                  </span>
                  <button
                    onClick={() =>
                      showToast(
                        "No escalation watchdog is configured — no ping was sent."
                      )
                    }
                    className="text-primary font-bold hover:underline"
                  >
                    Ping Now
                  </button>
                </div>
              </div>

              {/* Quiet Hours & Low-Power Dwell Policy */}
              <div className="bg-surface-container-lowest rounded-xl p-6 shadow-sm flex flex-col gap-4 border border-outline-variant/30">
                <div className="flex items-center gap-2">
                  <span className="p-1.5 rounded-lg bg-secondary-fixed text-primary flex items-center justify-center">
                    <Bed className="w-4 h-4" />
                  </span>
                  <h3 className="text-lg font-bold text-primary font-serif">Dwell & Quiet Policy</h3>
                </div>

                <div className="flex flex-col gap-3 text-xs">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <span className="font-bold text-on-surface block">Mute Bivouac Buzzers</span>
                      <span className="text-[11px] text-on-surface-variant leading-relaxed">
                        Silence non-critical tones between 21:00 & 05:30 JST. SOS bypasses mute.
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => setQuietHours(!quietHours)}
                      className={`w-11 h-6 rounded-full transition-colors relative p-0.5 shrink-0 ${
                        quietHours ? "bg-primary" : "bg-outline-variant"
                      }`}
                    >
                      <span
                        className={`block w-5 h-5 rounded-full bg-white transition-transform ${
                          quietHours ? "translate-x-5" : "translate-x-0"
                        }`}
                      />
                    </button>
                  </div>

                  <div className="h-px bg-outline-variant/30" />

                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <span className="font-bold text-on-surface block">Battery Conservation Guard</span>
                      <span className="text-[11px] text-on-surface-variant leading-relaxed">
                        Suppress background DEM & vector sync when phone charge &lt; 25%.
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => setBatteryConservation(!batteryConservation)}
                      className={`w-11 h-6 rounded-full transition-colors relative p-0.5 shrink-0 ${
                        batteryConservation ? "bg-primary" : "bg-outline-variant"
                      }`}
                    >
                      <span
                        className={`block w-5 h-5 rounded-full bg-white transition-transform ${
                          batteryConservation ? "translate-x-5" : "translate-x-0"
                        }`}
                      />
                    </button>
                  </div>

                  <div className="h-px bg-outline-variant/30" />

                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <span className="font-bold text-on-surface block">Fall-Detection Auto-Beacon</span>
                      <span className="text-[11px] text-on-surface-variant leading-relaxed">
                        Trigger Iridium burst if 4G+ impact is followed by 90s immobility.
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => setFallDetection(!fallDetection)}
                      className={`w-11 h-6 rounded-full transition-colors relative p-0.5 shrink-0 ${
                        fallDetection ? "bg-primary" : "bg-outline-variant"
                      }`}
                    >
                      <span
                        className={`block w-5 h-5 rounded-full bg-white transition-transform ${
                          fallDetection ? "translate-x-5" : "translate-x-0"
                        }`}
                      />
                    </button>
                  </div>
                </div>
              </div>

              {/* Notification Delivery Channels */}
              <div className="bg-surface-container-lowest rounded-xl p-6 shadow-sm flex flex-col gap-4 border border-outline-variant/30">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="p-1.5 rounded-lg bg-surface-container text-primary flex items-center justify-center">
                      <Bell className="w-4 h-4" />
                    </span>
                    <h3 className="text-lg font-bold text-primary font-serif">Delivery Channels</h3>
                  </div>
                  <span className="text-xs text-on-surface-variant font-bold">Not set up</span>
                </div>

                <div className="flex flex-col gap-2.5">
                  <div className="flex items-center justify-between p-3 rounded-lg bg-surface-container-low border border-outline-variant/20">
                    <div className="flex items-center gap-2.5">
                      <Smartphone className="w-4 h-4 text-primary" />
                      <div>
                        <div className="text-xs font-bold text-on-surface">Native OS Push</div>
                        <div className="text-[10px] text-on-surface-variant">Lockscreen alerts</div>
                      </div>
                    </div>
                    <span className="px-2 py-0.5 rounded-full bg-surface-container-highest text-on-surface-variant text-[10px] font-bold">
                      Not configured
                    </span>
                  </div>

                  <div className="flex items-center justify-between p-3 rounded-lg bg-surface-container-low border border-outline-variant/20">
                    <div className="flex items-center gap-2.5">
                      <Watch className="w-4 h-4 text-primary" />
                      <div>
                        <div className="text-xs font-bold text-on-surface">LED Strobe & Haptic</div>
                        <div className="text-[10px] text-on-surface-variant">No watch paired</div>
                      </div>
                    </div>
                    <span className="px-2 py-0.5 rounded-full bg-surface-container-highest text-on-surface-variant text-[10px] font-bold">
                      Not paired
                    </span>
                  </div>

                  <div className="flex items-center justify-between p-3 rounded-lg bg-surface-container-low border border-outline-variant/20">
                    <div className="flex items-center gap-2.5">
                      <MessageSquare className="w-4 h-4 text-primary" />
                      <div>
                        <div className="text-xs font-bold text-on-surface">Satellite SMS Gateway</div>
                        <div className="text-[10px] text-on-surface-variant">Emergency Dispatch Roster</div>
                      </div>
                    </div>
                    <span className="px-2 py-0.5 rounded-full bg-surface-container-highest text-on-surface-variant text-[10px] font-bold">
                      Not configured
                    </span>
                  </div>
                </div>

                <div className="pt-1 flex items-center justify-between text-xs text-on-surface-variant border-t border-outline-variant/20">
                  <span className="flex items-center gap-1 font-mono text-[11px]">
                    <Lock className="w-3.5 h-3.5 text-primary" />
                    AES-256 Payload Hash
                  </span>
                  <Link href="/settings/profile" className="text-primary font-bold hover:underline">
                    Edit Contacts
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
