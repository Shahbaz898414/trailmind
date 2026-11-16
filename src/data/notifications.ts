export interface NotificationAlert {
  id: string;
  category: "Satellite" | "Weather" | "Offline Sync" | "Emergency" | "Transit";
  title: string;
  body: string;
  timestamp: string;
  read: boolean;
  severity: "critical" | "warning" | "info" | "success";
  actionLabel?: string;
  actionHref?: string;
}

export const sampleNotificationsList: NotificationAlert[] = [
  {
    id: "notif-1",
    category: "Satellite",
    title: "Iridium Polar Azimuth Sync Established",
    body: "Garmin inReach Mini 2 successfully paired on 1616.0 MHz. 14 spatial waypoints broadcasted to base camp.",
    timestamp: "12 min ago",
    read: false,
    severity: "success",
    actionLabel: "View Hardware Hub",
    actionHref: "/settings/hardware"
  },
  {
    id: "notif-2",
    category: "Offline Sync",
    title: "Kyoto Higashiyama Pack Checksum Verified",
    body: "612 MB DEM elevation contours, vector offline maps, and offline TTS voice synthesized (SHA-256: 4f8b2e...)",
    timestamp: "1 hr ago",
    read: false,
    severity: "info",
    actionLabel: "Inspect Pack",
    actionHref: "/downloads"
  },
  {
    id: "notif-3",
    category: "Weather",
    title: "High Mountain Wind Advisory — Mt. Hiei & Kurama Ridge",
    body: "Gusts reaching 45 knots expected along northern Kyoto mountain ridges between 14:00 and 18:00.",
    timestamp: "3 hrs ago",
    read: false,
    severity: "warning",
    actionLabel: "View Route Advisory",
    actionHref: "/trips/trip-kyoto-2026/itinerary"
  },
  {
    id: "notif-4",
    category: "Transit",
    title: "JR Shinkansen Nozomi #23 Ticket Active",
    body: "Departure from Kyoto Station scheduled for 11:45 AM. Car 7, Seat 14-E barcode cached in offline wallet.",
    timestamp: "Yesterday",
    read: true,
    severity: "info",
    actionLabel: "Open Ticket",
    actionHref: "/wallet/documents/doc-nozomi-23"
  },
  {
    id: "notif-5",
    category: "Emergency",
    title: "SOS Hardware Interlock Test Passed",
    body: "Dual-stage satellite SOS hardware interlock verified with emergency response dispatch simulation.",
    timestamp: "2 days ago",
    read: true,
    severity: "success",
    actionLabel: "Emergency Directives",
    actionHref: "/wallet/emergency"
  }
];
