export interface SavedPlaceItem {
  id: string;
  name: string;
  japaneseName?: string;
  category: "Temple" | "Ryokan" | "Mountain Hut" | "Viewpoint" | "Food" | "Trail";
  city: string;
  region: string;
  elevation: string;
  coordinates: string;
  image: string;
  offlineCached: boolean;
  notes: string;
  proximityKm?: number;
}

export const savedPlacesList: SavedPlaceItem[] = [
  {
    id: "sp-01",
    name: "Kiyomizu-dera Clifftop Stage",
    japaneseName: "清水寺",
    category: "Temple",
    city: "Kyoto",
    region: "Higashiyama",
    elevation: "185m",
    coordinates: "34.9949° N, 135.7850° E",
    image: "/images/stitch/saved-kiyomizu-dera.jpg",
    offlineCached: true,
    notes: "Sunrise arrival at 06:00 is essential. 13-meter cantilevered wooden stage without single nail.",
    proximityKm: 1.2
  },
  {
    id: "sp-02",
    name: "Ryokan Motonaga Historic Inn",
    japaneseName: "元奈古 旅館",
    category: "Ryokan",
    city: "Kyoto",
    region: "Higashiyama",
    elevation: "62m",
    coordinates: "34.9995° N, 135.7801° E",
    image: "/images/stitch/saved-ryokan-motonaga.jpg",
    offlineCached: true,
    notes: "Traditional sukiya inn next to Ishibei-koji stone path. Cedar wooden soaking tubs.",
    proximityKm: 0.4
  },
  {
    id: "sp-03",
    name: "Tateyama Mountain Hut & Ridge Camp",
    japaneseName: "立山室堂 山小屋",
    category: "Mountain Hut",
    city: "Toyama",
    region: "Northern Alps",
    elevation: "2,450m",
    coordinates: "36.5772° N, 137.5956° E",
    image: "/images/stitch/saved-tateyama-hut.jpg",
    offlineCached: true,
    notes: "High alpine basecamp above volcanic Murodo plateau. Air-gapped weather barometer station.",
    proximityKm: 185.0
  },
  {
    id: "sp-04",
    name: "Arashiyama Sagano Bamboo Grove",
    japaneseName: "嵐山 嵯峨野 竹林",
    category: "Trail",
    city: "Kyoto",
    region: "Ukyo Ward",
    elevation: "70m",
    coordinates: "35.0170° N, 135.6713° E",
    image: "/images/stitch/kyoto-arashiyama-bamboo.jpg",
    offlineCached: true,
    notes: "Wind whistling through 30m stalks. Best soundscape recorded at 06:30 before crowds.",
    proximityKm: 8.5
  },
  {
    id: "sp-05",
    name: "Tenryu-ji Sogenchi Zen Garden",
    japaneseName: "天龍寺 曹源池庭園",
    category: "Temple",
    city: "Kyoto",
    region: "Arashiyama",
    elevation: "65m",
    coordinates: "35.0158° N, 135.6776° E",
    image: "/images/stitch/kyoto-tenryuji-zen-garden.jpg",
    offlineCached: true,
    notes: "14th-century pond garden borrowing scenery from Arashiyama mountains.",
    proximityKm: 8.2
  },
  {
    id: "sp-06",
    name: "Pontocho Alley River Verandas",
    japaneseName: "先斗町 鴨川",
    category: "Food",
    city: "Kyoto",
    region: "Nakagyo Ward",
    elevation: "45m",
    coordinates: "35.0061° N, 135.7712° E",
    image: "/images/stitch/kyoto-pontocho-dusk.jpg",
    offlineCached: true,
    notes: "Historic lantern-lit alleyway between Shijo and Sanjo. Counter yakitori and seasonal river kawayuka dining.",
    proximityKm: 1.8
  }
];
