export interface DestinationBlueprint {
  id: string;
  title: string;
  location: string;
  elevation: string;
  duration: string;
  distance: string;
  badge1: string;
  badge2: string;
  connectivityBadge: string;
  connectivityIcon: string;
  image: string;
  description: string;
}

export const recommendedDestinations: DestinationBlueprint[] = [
  {
    id: "dolomites-alta-via",
    title: "Alta Via 1 High Route",
    location: "Cortina d'Ampezzo • Italy",
    elevation: "2,752m Max Pass",
    duration: "8 Days",
    distance: "120 km",
    badge1: "Topo 1:25k Staged",
    badge2: "Offline Verified",
    connectivityBadge: "Cellular Deadzones",
    connectivityIcon: "signal_cellular_off",
    image: "/images/stitch/dashboard-dolomites-autumn.jpg",
    description: "Iconic alpine traverse threading limestone towers, World War I via ferrata tunnels, and historic mountain refuges."
  },
  {
    id: "zanskar-monasteries",
    title: "Hidden Monasteries of Zanskar",
    location: "Ladakh • India",
    elevation: "4,200m Avg Elev",
    duration: "11 Days",
    distance: "130 km",
    badge1: "Cultural Immersion",
    badge2: "Heritage Audio",
    connectivityBadge: "Satellite Sync Only",
    connectivityIcon: "signal_disconnected",
    image: "/images/stitch/dashboard-zanskar-monastery.jpg",
    description: "Historic pilgrimage paths traversing high Himalayan passes connecting remote cliff-hanging Buddhist gompas."
  },
  {
    id: "abel-tasman-coastal",
    title: "Abel Tasman Coastal Sanctuary",
    location: "South Island • New Zealand",
    elevation: "Tidal Estuary Crossings",
    duration: "5 Days",
    distance: "60 km",
    badge1: "Tidal Recalculation",
    badge2: "AI Curated",
    connectivityBadge: "Intermittent Cellular",
    connectivityIcon: "signal_cellular_1_bar",
    image: "/images/stitch/dashboard-abel-tasman.jpg",
    description: "Golden coves, limestone headlands, and granite bushland with automated local tide schedule predictions."
  },
  {
    id: "hornstrandir-arctic",
    title: "Hornstrandir Arctic Wilderness",
    location: "Westfjords • Iceland",
    elevation: "Sea Level to 534m",
    duration: "6 Days",
    distance: "75 km",
    badge1: "Zero Cellular Grid",
    badge2: "Arctic Pack Staged",
    connectivityBadge: "SOS Satellite Sole Link",
    connectivityIcon: "satellite_alt",
    image: "/images/stitch/dashboard-hornstrandir-fjord.jpg",
    description: "Strictly uninhabited Arctic fox habitat, towering bird cliffs, driftwood beaches, and fog-shrouded basalt fjords."
  }
];
