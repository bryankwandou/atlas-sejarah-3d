import type { PolityColorToken } from "../theme/designTokens";

export type EraId = "ancient" | "classical" | "medieval" | "early-modern" | "modern";

export interface HistoricalEra {
  id: EraId;
  nameUpper: string;
  toastTitle: string;
  startYear: number;
  endYear: number;
  rangeLabel: string;
}

export interface PolityTerritory {
  id: string;
  name: string;
  startYear: number;
  endYear: number;
  peakYear: number;
  peakAreaKm2: number;
  colorToken: PolityColorToken;
  labelLat: number;
  labelLng: number;
  capital: string;
  summary: string;
  /** Array of polygon rings in [lng, lat] degrees */
  rings: Array<Array<[number, number]>>;
}

export interface HistoricalEventItem {
  id: string;
  title: string;
  year: number;
  visibleStartYear: number;
  visibleEndYear: number;
  category: "PENDIRIAN" | "PERTEMPURAN" | "PERISTIWA" | "PERADABAN";
  iconType: "flag" | "sword" | "monument" | "scroll";
  lat: number;
  lng: number;
  description: string;
  artifactLabel: string;
  artifactTitle: string;
  artifactQuote: string;
  artifactStyle: "inscription" | "chronicle" | "map" | "seal" | "scroll";
}

export interface KisahStory {
  id: string;
  yearRangeLabel: string;
  title: string;
  description: string;
  accentToken: PolityColorToken;
  iconType: "temple" | "scroll" | "shield" | "globe" | "compass";
  targetYear: number;
  targetLat: number;
  targetLng: number;
  eventId?: string;
}

export const MIN_YEAR = -3000;
export const MAX_YEAR = 2024;

export const ERAS: HistoricalEra[] = [
  {
    id: "ancient",
    nameUpper: "ZAMAN KUNO",
    toastTitle: "Zaman Kuno",
    startYear: -3000,
    endYear: -501,
    rangeLabel: "3000 SM – 501 SM",
  },
  {
    id: "classical",
    nameUpper: "ZAMAN KLASIK",
    toastTitle: "Zaman Klasik",
    startYear: -500,
    endYear: 499,
    rangeLabel: "500 SM – 499 M",
  },
  {
    id: "medieval",
    nameUpper: "ABAD PERTENGAHAN",
    toastTitle: "Abad Pertengahan",
    startYear: 500,
    endYear: 1499,
    rangeLabel: "500 M – 1499 M",
  },
  {
    id: "early-modern",
    nameUpper: "AWAL ZAMAN MODERN",
    toastTitle: "Awal zaman modern",
    startYear: 1500,
    endYear: 1799,
    rangeLabel: "1500 M – 1799 M",
  },
  {
    id: "modern",
    nameUpper: "ZAMAN MODERN",
    toastTitle: "Zaman Modern",
    startYear: 1800,
    endYear: 2024,
    rangeLabel: "1800 M – 2024 M",
  },
];

export function formatYearLabel(year: number): { num: string; suffix: string; full: string } {
  const rounded = Math.round(year);
  if (rounded < 0) {
    const abs = Math.abs(rounded);
    return { num: String(abs), suffix: "SM", full: `${abs} SM` };
  }
  const safeYear = rounded === 0 ? 1 : rounded;
  return { num: String(safeYear), suffix: "M", full: `${safeYear} M` };
}

export function getEraForYear(year: number): HistoricalEra {
  for (const era of ERAS) {
    if (year >= era.startYear && year <= era.endYear) {
      return era;
    }
  }
  return year < ERAS[0].startYear ? ERAS[0] : ERAS[ERAS.length - 1];
}

/**
 * Non-linear slider mapping (0..1000) so medieval & modern centuries have rich granularity
 * while still covering 3000 SM to 2024 M smoothly across the 5 era segments.
 */
export function sliderValueToYear(sliderVal: number): number {
  const t = Math.max(0, Math.min(1, sliderVal / 1000));
  if (t <= 0.24) {
    // Ancient: -3000 to -500 (24% width)
    return Math.round(-3000 + (t / 0.24) * 2500);
  }
  if (t <= 0.44) {
    // Classical: -500 to 500 (20% width)
    return Math.round(-500 + ((t - 0.24) / 0.20) * 1000);
  }
  if (t <= 0.66) {
    // Medieval: 500 to 1500 (22% width)
    return Math.round(500 + ((t - 0.44) / 0.22) * 1000);
  }
  if (t <= 0.83) {
    // Early Modern: 1500 to 1800 (17% width)
    return Math.round(1500 + ((t - 0.66) / 0.17) * 300);
  }
  // Modern: 1800 to 2024 (17% width)
  return Math.round(1800 + ((t - 0.83) / 0.17) * 224);
}

export function yearToSliderValue(year: number): number {
  const y = Math.max(MIN_YEAR, Math.min(MAX_YEAR, year));
  if (y <= -500) {
    return Math.round(((y - -3000) / 2500) * 240);
  }
  if (y <= 500) {
    return Math.round(240 + ((y - -500) / 1000) * 200);
  }
  if (y <= 1500) {
    return Math.round(440 + ((y - 500) / 1000) * 220);
  }
  if (y <= 1800) {
    return Math.round(660 + ((y - 1500) / 300) * 170);
  }
  return Math.round(830 + ((y - 1800) / 224) * 170);
}

export const POLITIES: PolityTerritory[] = [
  // =========================================================================
  // ZAMAN KUNO (-3000 .. -500)
  // =========================================================================
  {
    id: "mesir-kuno",
    name: "Kerajaan Mesir Kuno",
    startYear: -3000,
    endYear: -525,
    peakYear: -1290,
    peakAreaKm2: 1000000,
    colorToken: "--polity-amber",
    labelLat: 26.5,
    labelLng: 31.2,
    capital: "Memphis / Thebes",
    summary: "Peradaban lembah Sungai Nil yang menyatukan Mesir Hulu dan Hilir selama hampir tiga milenium.",
    rings: [
      [
        [25.0, 31.6], [34.8, 31.5], [36.0, 33.2], [35.5, 28.0], [34.5, 22.0],
        [32.5, 18.5], [29.0, 20.0], [27.0, 26.0],
      ],
    ],
  },
  {
    id: "mesopotamia-akadia",
    name: "Kekaisaran Akkadia & Babilonia",
    startYear: -2800,
    endYear: -539,
    peakYear: -1750,
    peakAreaKm2: 850000,
    colorToken: "--polity-coral",
    labelLat: 33.2,
    labelLng: 44.0,
    capital: "Babilon",
    summary: "Pusat peradaban sungai Eufrat dan Tigris yang melahirkan sistem penulisan paku dan astronomi kuno.",
    rings: [
      [
        [36.5, 37.0], [43.5, 37.5], [48.8, 30.2], [46.5, 29.0], [40.0, 32.0], [36.0, 34.5],
      ],
    ],
  },
  {
    id: "lembah-indus",
    name: "Peradaban Lembah Indus",
    startYear: -2800,
    endYear: -1300,
    peakYear: -2000,
    peakAreaKm2: 1260000,
    colorToken: "--polity-teal",
    labelLat: 27.3,
    labelLng: 69.5,
    capital: "Mohenjo-daro / Harappa",
    summary: "Peradaban kota terencana di Asia Selatan dengan jaringan drainase dan pelabuhan dagang samudra.",
    rings: [
      [
        [64.5, 25.0], [67.0, 31.5], [75.5, 31.0], [74.0, 22.0], [68.0, 21.5],
      ],
    ],
  },
  {
    id: "dinasti-shang-zhou",
    name: "Dinasti Shang & Zhou",
    startYear: -2100,
    endYear: -221,
    peakYear: -1000,
    peakAreaKm2: 1500000,
    colorToken: "--polity-gold",
    labelLat: 35.2,
    labelLng: 113.5,
    capital: "Anyang / Haojing",
    summary: "Dinasti awal di lembah Sungai Kuning yang meletakkan dasar metalurgi perunggu dan aksara klasik Tiongkok.",
    rings: [
      [
        [106.0, 38.0], [120.5, 39.5], [122.0, 31.5], [113.0, 29.5], [105.5, 33.0],
      ],
    ],
  },

  // =========================================================================
  // ZAMAN KLASIK (-500 .. 499 M)
  // =========================================================================
  {
    id: "akhemeniyah",
    name: "Kekaisaran Akhemeniyah (Persia)",
    startYear: -550,
    endYear: -330,
    peakYear: -480,
    peakAreaKm2: 5500000,
    colorToken: "--polity-coral",
    labelLat: 32.5,
    labelLng: 52.0,
    capital: "Persepolis",
    summary: "Kekaisaran lintas benua pertama yang membentang dari Lembah Indus hingga Laut Aegea dan Mesir.",
    rings: [
      [
        [26.5, 41.0], [42.0, 41.5], [68.5, 37.5], [71.0, 26.0], [56.0, 25.0],
        [44.0, 29.0], [32.0, 24.0], [29.0, 31.5], [27.0, 37.5],
      ],
    ],
  },
  {
    id: "romawi",
    name: "Kekaisaran Romawi",
    startYear: -509,
    endYear: 476,
    peakYear: 117,
    peakAreaKm2: 5000000,
    colorToken: "--polity-crimson",
    labelLat: 41.9,
    labelLng: 14.5,
    capital: "Roma",
    summary: "Dari republik di Semenanjung Italia menjadi kekaisaran yang mengelilingi seluruh cekungan Laut Tengah.",
    rings: [
      [
        [-9.5, 43.0], [-1.5, 52.5], [8.0, 50.5], [19.0, 47.5], [29.0, 45.0],
        [41.0, 40.5], [44.0, 34.0], [35.0, 29.0], [20.0, 30.5], [10.0, 33.0],
        [-6.5, 34.0], [-9.5, 38.0],
      ],
    ],
  },
  {
    id: "dinasti-han",
    name: "Kekaisaran Qin & Dinasti Han",
    startYear: -221,
    endYear: 220,
    peakYear: 100,
    peakAreaKm2: 6000000,
    colorToken: "--polity-amber",
    labelLat: 34.3,
    labelLng: 109.5,
    capital: "Chang'an / Luoyang",
    summary: "Menyatukan Tiongkok dan membuka jaringan perdagangan Jalur Sutra menuju Asia Tengah.",
    rings: [
      [
        [92.0, 42.0], [124.0, 41.5], [122.5, 23.0], [106.0, 21.0], [99.0, 25.0], [86.0, 39.0],
      ],
    ],
  },
  {
    id: "maurya-gupta",
    name: "Kekaisaran Maurya & Gupta",
    startYear: -322,
    endYear: 540,
    peakYear: -250,
    peakAreaKm2: 4600000,
    colorToken: "--polity-emerald",
    labelLat: 24.5,
    labelLng: 79.0,
    capital: "Pataliputra",
    summary: "Menyatukan anak benua India dan mengembangkan ilmu pengetahuan, astronomi, serta jaringan pelayaran Samudra Hindia.",
    rings: [
      [
        [67.0, 34.0], [89.0, 26.5], [86.0, 14.0], [75.0, 12.0], [68.0, 23.5],
      ],
    ],
  },
  {
    id: "parthia",
    name: "Kekaisaran Parthia",
    startYear: -247,
    endYear: 224,
    peakYear: -50,
    peakAreaKm2: 2800000,
    colorToken: "--polity-purple",
    labelLat: 34.0,
    labelLng: 53.0,
    capital: "Ctesiphon",
    summary: "Kekuatan utama dataran tinggi Iran yang menguasai koridor perdagangan antara Romawi dan Asia Timur.",
    rings: [
      [
        [40.0, 37.5], [59.5, 38.5], [62.0, 26.0], [48.0, 29.5], [41.0, 33.5],
      ],
    ],
  },

  // =========================================================================
  // ABAD PERTENGAHAN AWAL (500 M .. 900 M) — EXACT MATCH WITH VIDEO 622 M & 682 M!
  // =========================================================================
  {
    id: "gokturk",
    name: "Kekhanan Turk (Göktürk)",
    startYear: 552,
    endYear: 744,
    peakYear: 622,
    peakAreaKm2: 6500000,
    colorToken: "--polity-crimson",
    labelLat: 45.5,
    labelLng: 78.0,
    capital: "Ordu-Baliq",
    summary: "Konfederasi stepa Eurasia yang membentang dari Laut Kaspia hingga perbatasan Manchuria.",
    rings: [
      [
        [52.0, 48.0], [85.0, 52.0], [116.0, 49.0], [112.0, 41.5], [82.0, 40.0],
        [64.0, 39.5], [51.0, 42.0],
      ],
    ],
  },
  {
    id: "sasaniyah",
    name: "Kekaisaran Sasaniyah",
    startYear: 224,
    endYear: 651,
    peakYear: 622,
    peakAreaKm2: 4400000,
    colorToken: "--polity-coral",
    labelLat: 32.5,
    labelLng: 53.5,
    capital: "Ctesiphon",
    summary: "Kekaisaran Persia pra-modern terakhir yang menjadi kekuatan besar di Asia Barat dan Tengah.",
    rings: [
      [
        [38.0, 38.5], [49.0, 41.0], [66.0, 38.0], [67.0, 25.5], [56.0, 22.5],
        [47.0, 27.5], [38.5, 33.0],
      ],
    ],
  },
  {
    id: "dinasti-sui",
    name: "Dinasti Sui",
    startYear: 581,
    endYear: 650,
    peakYear: 615,
    peakAreaKm2: 3300000,
    colorToken: "--polity-terracotta",
    labelLat: 33.5,
    labelLng: 111.0,
    capital: "Daxing (Chang'an)",
    summary: "Menyatukan kembali Tiongkok Utara dan Selatan serta membangun Terusan Besar Tiongkok.",
    rings: [
      [
        [98.0, 40.5], [121.5, 40.5], [122.5, 22.5], [105.5, 19.5], [101.0, 28.0],
      ],
    ],
  },
  {
    id: "dinasti-tang-song",
    name: "Dinasti Tang & Song",
    startYear: 651,
    endYear: 1205,
    peakYear: 715,
    peakAreaKm2: 5400000,
    colorToken: "--polity-amber",
    labelLat: 34.0,
    labelLng: 108.5,
    capital: "Chang'an / Kaifeng",
    summary: "Zaman keemasan kosmopolitan, penemuan teknologi cetak, kompas maritim, dan perdagangan lintas samudra.",
    rings: [
      [
        [82.0, 43.0], [123.0, 41.5], [122.5, 21.5], [105.0, 20.0], [96.0, 28.0], [80.0, 38.0],
      ],
    ],
  },
  {
    id: "bizantium",
    name: "Kekaisaran Bizantium",
    startYear: 395,
    endYear: 1453,
    peakYear: 555,
    peakAreaKm2: 1900000,
    colorToken: "--polity-terracotta",
    labelLat: 39.2,
    labelLng: 29.5,
    capital: "Konstantinopel",
    summary: "Kelanjutan Kekaisaran Romawi di Timur yang berpusat di Konstantinopel selama lebih dari seribu tahun.",
    rings: [
      [
        [15.0, 41.0], [20.0, 44.5], [29.5, 43.0], [41.5, 41.0], [38.0, 35.5],
        [35.0, 31.0], [25.0, 31.2], [19.5, 36.5],
      ],
    ],
  },
  {
    id: "avar",
    name: "Kekhanan Avar",
    startYear: 567,
    endYear: 804,
    peakYear: 622,
    peakAreaKm2: 960000,
    colorToken: "--polity-sky",
    labelLat: 47.0,
    labelLng: 20.5,
    capital: "Cekungan Pannonia",
    summary: "Kekuatan konfederasi berkuda yang menguasai Cekungan Karpatia dan Eropa Tengah.",
    rings: [
      [
        [15.0, 49.0], [26.0, 48.5], [26.5, 44.0], [16.0, 44.5],
      ],
    ],
  },
  {
    id: "franka",
    name: "Franka",
    startYear: 481,
    endYear: 987,
    peakYear: 800,
    peakAreaKm2: 680000,
    colorToken: "--polity-lime",
    labelLat: 47.5,
    labelLng: 4.5,
    capital: "Aachen / Paris",
    summary: "Kerajaan besar di Eropa Barat yang menyatukan Galia dan Jerman Barat pada Abad Pertengahan Awal.",
    rings: [
      [
        [-4.5, 48.5], [11.0, 52.0], [12.5, 45.5], [5.0, 43.0], [-1.8, 43.5],
      ],
    ],
  },
  {
    id: "visigoth",
    name: "Kerajaan Visigoth",
    startYear: 418,
    endYear: 720,
    peakYear: 622,
    peakAreaKm2: 530000,
    colorToken: "--polity-amber",
    labelLat: 40.0,
    labelLng: -4.0,
    capital: "Toledo",
    summary: "Kerajaan yang memerintah Semenanjung Iberia setelah berakhirnya kekuasaan Romawi Barat.",
    rings: [
      [
        [-9.3, 43.2], [3.2, 42.8], [0.5, 37.0], [-5.6, 36.0], [-9.2, 37.5],
      ],
    ],
  },
  {
    id: "peradaban-maya",
    name: "Peradaban Maya",
    startYear: -400,
    endYear: 1520,
    peakYear: 650,
    peakAreaKm2: 380000,
    colorToken: "--polity-emerald",
    labelLat: 18.5,
    labelLng: -89.5,
    capital: "Tikal / Chichen Itza",
    summary: "Jaringan negara-kota di Semenanjung Yucatan dan Mesoamerika yang unggul dalam astronomi dan matematika.",
    rings: [
      [
        [-93.0, 18.5], [-86.5, 21.8], [-87.5, 14.5], [-92.5, 14.2],
      ],
    ],
  },
  {
    id: "goguryeo",
    name: "Goguryeo",
    startYear: -37,
    endYear: 668,
    peakYear: 476,
    peakAreaKm2: 360000,
    colorToken: "--polity-indigo",
    labelLat: 40.8,
    labelLng: 126.5,
    capital: "Pyongyang",
    summary: "Salah satu dari Tiga Kerajaan Korea yang menguasai Korea utara dan sebagian besar Manchuria selatan.",
    rings: [
      [
        [121.5, 43.5], [131.0, 43.0], [129.0, 37.2], [124.0, 37.5],
      ],
    ],
  },
  {
    id: "funan",
    name: "Funan",
    startYear: 50,
    endYear: 680,
    peakYear: 500,
    peakAreaKm2: 250000,
    colorToken: "--polity-gold",
    labelLat: 11.5,
    labelLng: 105.0,
    capital: "Vyadhapura / Oc Eo",
    summary: "Kerajaan maritim dan agraris awal di Delta Mekong yang menghubungkan pelayaran Samudra Hindia dan Laut Tiongkok Selatan.",
    rings: [
      [
        [99.5, 15.0], [108.5, 14.5], [109.2, 10.0], [103.0, 9.5], [100.0, 12.0],
      ],
    ],
  },
  {
    id: "anglo-saxon",
    name: "Kerajaan-kerajaan Anglo-Saxon",
    startYear: 450,
    endYear: 1066,
    peakYear: 622,
    peakAreaKm2: 99000,
    colorToken: "--polity-lime",
    labelLat: 52.8,
    labelLng: -1.5,
    capital: "Winchester / York",
    summary: "Tujuh kerajaan utama (Heptarki) di kepulauan Britania yang kemudian bersatu membentuk Kerajaan Inggris.",
    rings: [
      [
        [-3.5, 55.8], [1.8, 53.0], [1.4, 50.8], [-5.2, 50.2], [-3.2, 53.5],
      ],
    ],
  },
  {
    id: "aksum",
    name: "Kerajaan Aksum",
    startYear: 100,
    endYear: 940,
    peakYear: 622,
    peakAreaKm2: 97000,
    colorToken: "--polity-coral",
    labelLat: 14.1,
    labelLng: 38.7,
    capital: "Aksum",
    summary: "Kekuatan perdagangan utama di Tanduk Afrika dan Laut Merah yang mencetak mata uang emasnya sendiri.",
    rings: [
      [
        [36.0, 17.5], [43.5, 15.5], [43.0, 11.0], [37.0, 11.5],
      ],
    ],
  },
  {
    id: "sriwijaya",
    name: "Sriwijaya",
    startYear: 650,
    endYear: 1290,
    peakYear: 850,
    peakAreaKm2: 1200000,
    colorToken: "--polity-coral",
    labelLat: -2.9,
    labelLng: 104.7,
    capital: "Palembang",
    summary: "Kemaharajaan bahari di Sumatra yang menguasai Selat Malaka, Selat Sunda, dan jalur perdagangan maritim Asia Tenggara.",
    rings: [
      [
        [95.0, 6.0], [104.5, 7.5], [106.8, -6.8], [104.0, -6.2], [98.0, -1.5],
      ],
    ],
  },
  {
    id: "kekaisaran-khmer",
    name: "Kekaisaran Khmer",
    startYear: 802,
    endYear: 1431,
    peakYear: 1190,
    peakAreaKm2: 1000000,
    colorToken: "--polity-amber",
    labelLat: 13.4,
    labelLng: 103.8,
    capital: "Angkor (Yasodharapura)",
    summary: "Kekaisaran di daratan Asia Tenggara yang membangun kompleks arsitektur dan tata air raksasa di Angkor.",
    rings: [
      [
        [99.0, 17.5], [108.5, 16.5], [109.0, 10.0], [102.0, 10.5], [99.5, 13.0],
      ],
    ],
  },
  {
    id: "umayyah-abbasiyah",
    name: "Kekhalifahan Umayyah & Abbasiyah",
    startYear: 652,
    endYear: 1258,
    peakYear: 750,
    peakAreaKm2: 11100000,
    colorToken: "--polity-teal",
    labelLat: 31.0,
    labelLng: 42.5,
    capital: "Damaskus / Baghdad",
    summary: "Wilayah kekuasaan besar yang mengembangkan ilmu pengetahuan, matematika, optik, dan kartografi di Baghdad dan Kordoba.",
    rings: [
      [
        [-8.0, 35.5], [10.5, 37.0], [35.0, 32.0], [42.0, 38.0], [64.0, 39.0],
        [68.0, 25.0], [58.0, 16.5], [43.0, 13.0], [34.0, 24.0], [12.0, 29.0], [-8.5, 30.0],
      ],
    ],
  },

  // =========================================================================
  // ABAD PERTENGAHAN AKHIR (1200 M .. 1499 M)
  // =========================================================================
  {
    id: "kekaisaran-mongol",
    name: "Kekaisaran Mongol",
    startYear: 1206,
    endYear: 1368,
    peakYear: 1279,
    peakAreaKm2: 24000000,
    colorToken: "--polity-purple",
    labelLat: 46.0,
    labelLng: 96.0,
    capital: "Karakorum / Khanbaliq",
    summary: "Kekaisaran daratan terluas dalam sejarah dunia yang menghubungkan Timur dan Barat di sepanjang Pax Mongolica.",
    rings: [
      [
        [38.0, 54.0], [90.0, 56.0], [134.0, 48.0], [122.0, 23.0], [100.0, 24.0],
        [65.0, 30.0], [44.0, 32.0], [36.0, 44.0],
      ],
    ],
  },
  {
    id: "majapahit",
    name: "Kemaharajaan Majapahit",
    startYear: 1293,
    endYear: 1527,
    peakYear: 1350,
    peakAreaKm2: 1500000,
    colorToken: "--polity-coral",
    labelLat: -7.5,
    labelLng: 112.5,
    capital: "Trowulan (Wilwatikta)",
    summary: "Kemaharajaan maritim Nusantara yang berpusat di Jawa Timur dan menjalin hubungan pelayaran di seluruh kepulauan.",
    rings: [
      [
        [96.0, 5.5], [119.0, 4.5], [134.0, -3.5], [130.0, -9.5], [114.0, -9.0], [104.0, -6.5],
      ],
    ],
  },
  {
    id: "mali-songhai",
    name: "Kekaisaran Mali & Songhai",
    startYear: 1235,
    endYear: 1591,
    peakYear: 1350,
    peakAreaKm2: 1400000,
    colorToken: "--polity-gold",
    labelLat: 16.2,
    labelLng: -3.5,
    capital: "Niani / Gao / Timbuktu",
    summary: "Pusat perdagangan emas dan keilmuan di Afrika Barat yang berpusat di sekitar Sungai Niger dan Timbuktu.",
    rings: [
      [
        [-16.5, 16.5], [4.0, 18.0], [5.5, 11.5], [-12.0, 10.5],
      ],
    ],
  },

  // =========================================================================
  // AWAL ZAMAN MODERN (1500 M .. 1799 M) — EXACT MATCH WITH VIDEO 00:08 - 00:09!
  // =========================================================================
  {
    id: "utsmaniyah",
    name: "Kesultanan Utsmaniyah",
    startYear: 1453,
    endYear: 1922,
    peakYear: 1683,
    peakAreaKm2: 5200000,
    colorToken: "--polity-sky",
    labelLat: 38.5,
    labelLng: 32.0,
    capital: "Konstantinopel (Istanbul)",
    summary: "Kekuatan lintas tiga benua yang menguasai Eropa Tenggara, Asia Barat, dan pesisir Afrika Utara.",
    rings: [
      [
        [16.0, 47.0], [29.0, 47.5], [44.0, 41.0], [48.5, 30.0], [38.0, 21.0],
        [31.0, 25.0], [10.0, 32.5], [3.0, 36.8], [19.0, 40.0],
      ],
    ],
  },
  {
    id: "mughal",
    name: "Kekaisaran Mughal",
    startYear: 1526,
    endYear: 1857,
    peakYear: 1700,
    peakAreaKm2: 4000000,
    colorToken: "--polity-rose",
    labelLat: 26.5,
    labelLng: 78.0,
    capital: "Agra / Shahjahanabad (Delhi)",
    summary: "Kekaisaran besar di anak benua India yang menyumbangkan sekitar seperempat produksi ekonomi dunia pada abad ke-17.",
    rings: [
      [
        [66.0, 34.5], [90.0, 26.5], [85.0, 13.5], [73.5, 14.0], [67.0, 24.0],
      ],
    ],
  },
  {
    id: "moskow-rusia",
    name: "Moskow (Ketsaran Rusia)",
    startYear: 1480,
    endYear: 1799,
    peakYear: 1700,
    peakAreaKm2: 14500000,
    colorToken: "--polity-blue",
    labelLat: 57.5,
    labelLng: 48.0,
    capital: "Moskow / Sankt-Peterburg",
    summary: "Berkembang dari Kadipaten Agung Moskow melintasi Pegunungan Ural hingga mencapai Samudra Pasifik.",
    rings: [
      [
        [28.0, 65.0], [95.0, 66.0], [135.0, 58.0], [120.0, 51.0], [55.0, 50.0],
        [37.0, 50.5], [30.0, 58.0],
      ],
    ],
  },
  {
    id: "polandia-lituania",
    name: "Persemakmuran Polandia-Lituania",
    startYear: 1500,
    endYear: 1795,
    peakYear: 1618,
    peakAreaKm2: 990000,
    colorToken: "--polity-emerald",
    labelLat: 52.5,
    labelLng: 25.0,
    capital: "Krakow / Warsawa",
    summary: "Salah satu negara terbesar dan terpadat di Eropa abad ke-16 hingga ke-17 dengan sistem monarki parlementer awal.",
    rings: [
      [
        [16.5, 54.5], [31.5, 56.0], [32.5, 48.0], [22.0, 48.5], [16.5, 51.5],
      ],
    ],
  },
  {
    id: "kekhanan-kazakh",
    name: "Kekhanan Kazakh",
    startYear: 1465,
    endYear: 1847,
    peakYear: 1600,
    peakAreaKm2: 2600000,
    colorToken: "--polity-lime",
    labelLat: 48.0,
    labelLng: 67.0,
    capital: "Sygnak / Turkistan",
    summary: "Negara stepa di Asia Tengah yang menguasai jalur kafilah antara Siberia, Volga, dan Transoxiana.",
    rings: [
      [
        [50.0, 51.0], [82.0, 50.5], [80.0, 42.5], [53.0, 42.0],
      ],
    ],
  },
  {
    id: "republik-venesia",
    name: "Republik Venesia",
    startYear: 1000,
    endYear: 1797,
    peakYear: 1550,
    peakAreaKm2: 120000,
    colorToken: "--polity-cyan",
    labelLat: 45.2,
    labelLng: 13.5,
    capital: "Venesia",
    summary: "Republik maritim yang mendominasi jaringan pelayaran dan niaga di Laut Adriatik dan Mediterania Timur.",
    rings: [
      [
        [10.5, 46.2], [16.5, 45.5], [19.0, 42.0], [12.0, 44.0],
      ],
    ],
  },
  {
    id: "spanyol-imperium",
    name: "Spanyol",
    startYear: 1492,
    endYear: 1898,
    peakYear: 1750,
    peakAreaKm2: 13700000,
    colorToken: "--polity-amber",
    labelLat: 40.2,
    labelLng: -3.7,
    capital: "Madrid",
    summary: "Salah satu imperium global pertama yang menghubungkan Eropa, Amerika, dan Asia-Pasifik.",
    rings: [
      [
        [-9.3, 43.5], [3.2, 42.5], [-0.5, 36.5], [-7.5, 37.0],
      ],
      [
        [-106.0, 28.0], [-87.0, 21.0], [-78.0, 8.0], [-70.0, -18.0], [-81.0, -5.0], [-105.0, 19.0],
      ],
    ],
  },
  {
    id: "kanem-bornu",
    name: "Kekaisaran Kanem-Bornu",
    startYear: 1380,
    endYear: 1893,
    peakYear: 1600,
    peakAreaKm2: 750000,
    colorToken: "--polity-indigo",
    labelLat: 13.0,
    labelLng: 14.5,
    capital: "Ngazargamu",
    summary: "Kekaisaran Afrika Tengah di cekungan Danau Chad yang bertahan selama lebih dari seribu tahun.",
    rings: [
      [
        [10.0, 17.5], [19.5, 17.0], [18.5, 10.0], [10.5, 10.5],
      ],
    ],
  },
  {
    id: "kekaisaran-etiopia",
    name: "Kekaisaran Etiopia",
    startYear: 1270,
    endYear: 1974,
    peakYear: 1600,
    peakAreaKm2: 1100000,
    colorToken: "--polity-purple",
    labelLat: 9.2,
    labelLng: 39.5,
    capital: "Gondar / Addis Ababa",
    summary: "Kerajaan dataran tinggi Afrika Timur yang mempertahankan kedaulatannya melintasi era kolonial.",
    rings: [
      [
        [35.0, 14.5], [44.0, 12.5], [43.5, 5.0], [35.0, 5.5],
      ],
    ],
  },
  {
    id: "kerajaan-kongo",
    name: "Kerajaan Kongo",
    startYear: 1390,
    endYear: 1885,
    peakYear: 1600,
    peakAreaKm2: 300000,
    colorToken: "--polity-teal",
    labelLat: -6.2,
    labelLng: 14.2,
    capital: "Mbanza Kongo",
    summary: "Kerajaan terpusat di pesisir Atlantik Afrika Tengah di selatan muara Sungai Kongo.",
    rings: [
      [
        [12.0, -4.0], [17.0, -4.5], [16.5, -9.5], [12.5, -9.0],
      ],
    ],
  },
  {
    id: "dinasti-ming-qing",
    name: "Dinasti Ming & Qing",
    startYear: 1368,
    endYear: 1911,
    peakYear: 1790,
    peakAreaKm2: 14700000,
    colorToken: "--polity-gold",
    labelLat: 35.5,
    labelLng: 106.0,
    capital: "Beijing",
    summary: "Memperluas wilayah Tiongkok hingga bentuk geografis modernnya dan memimpin pelayaran armada Zheng He.",
    rings: [
      [
        [76.0, 45.0], [132.0, 48.0], [122.5, 22.0], [106.0, 21.0], [88.0, 28.0], [75.0, 38.0],
      ],
    ],
  },
  {
    id: "kesultanan-nusantara",
    name: "Kesultanan Aceh, Mataram & Gowa",
    startYear: 1528,
    endYear: 1800,
    peakYear: 1640,
    peakAreaKm2: 950000,
    colorToken: "--polity-emerald",
    labelLat: -4.5,
    labelLng: 110.0,
    capital: "Kutaraja / Plered / Somba Opu",
    summary: "Jaringan kesultanan maritim dan agraris di Nusantara yang menjadi pusat perdagangan rempah dunia.",
    rings: [
      [
        [95.0, 5.8], [122.0, 2.0], [121.0, -8.8], [105.0, -8.0],
      ],
    ],
  },

  // =========================================================================
  // ZAMAN MODERN (1800 M .. 2024 M) — MATCHING 1818 M, 1945 M, 2024 M!
  // =========================================================================
  {
    id: "kekaisaran-britania",
    name: "Kekaisaran Britania / Inggris",
    startYear: 1707,
    endYear: 1997,
    peakYear: 1920,
    peakAreaKm2: 35500000,
    colorToken: "--polity-crimson",
    labelLat: 53.5,
    labelLng: -2.0,
    capital: "London",
    summary: "Imperium maritim dan industri global terbesar dalam sejarah modern.",
    rings: [
      [
        [-8.0, 58.5], [1.8, 58.0], [1.5, 50.2], [-6.0, 50.0],
      ],
      [
        [68.0, 33.0], [92.0, 27.0], [82.0, 8.0], [72.0, 18.0],
      ],
      [
        [113.0, -12.0], [153.5, -12.0], [151.0, -38.5], [115.0, -35.0],
      ],
    ],
  },
  {
    id: "rusia-modern",
    name: "Kekaisaran Rusia / Federasi Rusia",
    startYear: 1800,
    endYear: 2024,
    peakYear: 1895,
    peakAreaKm2: 17098242,
    colorToken: "--polity-blue",
    labelLat: 61.5,
    labelLng: 92.0,
    capital: "Moskow",
    summary: "Negara dengan bentang daratan terluas di dunia yang membentang di Eropa Timur dan seluruh Asia Utara.",
    rings: [
      [
        [29.0, 69.0], [170.0, 68.0], [142.0, 46.0], [80.0, 51.0], [38.0, 45.0], [30.0, 59.0],
      ],
    ],
  },
  {
    id: "indonesia-modern",
    name: "Republik Indonesia",
    startYear: 1945,
    endYear: 2024,
    peakYear: 2024,
    peakAreaKm2: 1904569,
    colorToken: "--polity-coral",
    labelLat: -2.5,
    labelLng: 117.0,
    capital: "Jakarta",
    summary: "Negara kepulauan terbesar di dunia yang membentang di sepanjang khatulistiwa dari Sabang sampai Merauke.",
    rings: [
      [
        [95.0, 6.0], [141.0, 2.5], [141.0, -9.2], [115.0, -10.5], [95.0, -6.0],
      ],
    ],
  },
  {
    id: "tiongkok-modern",
    name: "Tiongkok",
    startYear: 1912,
    endYear: 2024,
    peakYear: 2024,
    peakAreaKm2: 9596961,
    colorToken: "--polity-amber",
    labelLat: 35.8,
    labelLng: 104.2,
    capital: "Beijing",
    summary: "Negara besar di Asia Timur dengan peradaban berkesinambungan dari masa kuno hingga era industri modern.",
    rings: [
      [
        [74.0, 44.0], [134.0, 48.5], [122.0, 22.0], [100.0, 21.5], [78.0, 34.0],
      ],
    ],
  },
  {
    id: "amerika-serikat",
    name: "Amerika Serikat",
    startYear: 1776,
    endYear: 2024,
    peakYear: 2024,
    peakAreaKm2: 9833520,
    colorToken: "--polity-indigo",
    labelLat: 39.5,
    labelLng: -98.5,
    capital: "Washington, D.C.",
    summary: "Negara federasi di Amerika Utara yang membentang dari Samudra Atlantik hingga Samudra Pasifik.",
    rings: [
      [
        [-124.5, 49.0], [-67.0, 47.0], [-80.0, 25.2], [-97.5, 26.0], [-117.2, 32.5],
      ],
    ],
  },
  {
    id: "india-modern",
    name: "India",
    startYear: 1947,
    endYear: 2024,
    peakYear: 2024,
    peakAreaKm2: 3287263,
    colorToken: "--polity-teal",
    labelLat: 22.5,
    labelLng: 79.0,
    capital: "New Delhi",
    summary: "Negara di Asia Selatan yang mencakup sebagian besar wilayah anak benua India.",
    rings: [
      [
        [68.5, 34.0], [92.0, 27.5], [80.0, 8.2], [72.0, 19.0],
      ],
    ],
  },
  {
    id: "brasil-modern",
    name: "Brasil",
    startYear: 1822,
    endYear: 2024,
    peakYear: 2024,
    peakAreaKm2: 8515767,
    colorToken: "--polity-emerald",
    labelLat: -11.0,
    labelLng: -52.0,
    capital: "Brasilia",
    summary: "Negara terluas di Amerika Selatan yang mencakup cekungan Hutan Hujan Amazon.",
    rings: [
      [
        [-73.0, 4.0], [-34.8, -5.5], [-48.0, -28.0], [-58.0, -30.0], [-69.0, -11.0],
      ],
    ],
  },
];

export const HISTORICAL_EVENTS: HistoricalEventItem[] = [
  {
    id: "sriwijaya-682",
    title: "Bangkitnya Sriwijaya",
    year: 682,
    visibleStartYear: 550,
    visibleEndYear: 1050,
    category: "PENDIRIAN",
    iconType: "flag",
    lat: -2.99,
    lng: 104.76,
    description:
      "Pada 682 M, sebuah prasasti batu mencatat penguasa Sriwijaya memimpin ekspedisi di Palembang, menandai awal kerajaan maritim besar di Sumatra.",
    artifactLabel: "BUKTI ARKEOLOGIS • PRASASTI KEDUKAN BUKIT",
    artifactTitle: "605 Saka (16 Juni 682 M) • Aksara Pallawa, Melayu Kuno",
    artifactQuote:
      "Swasti sri sakawarsatita 605 ekadasi suklapaksa wulan Waisakha dapunta hyang nayik di samwau mangalap siddhayatra...",
    artifactStyle: "inscription",
  },
  {
    id: "pertempuran-yarmuk",
    title: "Pertempuran Yarmuk",
    year: 636,
    visibleStartYear: 580,
    visibleEndYear: 850,
    category: "PERTEMPURAN",
    iconType: "sword",
    lat: 32.81,
    lng: 35.95,
    description:
      "Pertempuran menentukan selama enam hari di dekat Sungai Yarmuk yang mengubah peta kekuasaan di wilayah Levant dan mengakhiri dominasi Bizantium di Suriah.",
    artifactLabel: "KRONIK SEJARAH • LEMBAH YARMUK",
    artifactTitle: "Agustus 636 M • Perbatasan Suriah-Yordania",
    artifactQuote:
      "Manuver kavaleri ringan di dataran tinggi Golan dan Sungai Yarmuk mengubah keseimbangan geopolitik Mediterania Timur.",
    artifactStyle: "chronicle",
  },
  {
    id: "konsolidasi-madinah",
    title: "Piagam & Konsolidasi Madinah",
    year: 622,
    visibleStartYear: 580,
    visibleEndYear: 820,
    category: "PERISTIWA",
    iconType: "scroll",
    lat: 24.47,
    lng: 39.61,
    description:
      "Pada 622 M, pembentukan komunitas dan piagam kesepakatan di Yatsrib (Madinah) menjadi titik awal penanggalan Hijriah serta penyatuan Jazirah Arab.",
    artifactLabel: "DOKUMEN SEJARAH • PIAGAM MADINAH",
    artifactTitle: "622 M • Hejaz, Jazirah Arab",
    artifactQuote:
      "Kesepakatan konstitusional tertulis yang mengatur hak, pertahanan bersama, dan tata kelola masyarakat majemuk di Madinah.",
    artifactStyle: "scroll",
  },
  {
    id: "pertempuran-tours",
    title: "Pertempuran Tours",
    year: 732,
    visibleStartYear: 600,
    visibleEndYear: 900,
    category: "PERTEMPURAN",
    iconType: "sword",
    lat: 46.8,
    lng: 0.54,
    description:
      "Pertempuran di antara kota Poitiers dan Tours di Galia yang menetapkan batas perbatasan antara Kerajaan Franka dan wilayah Iberia.",
    artifactLabel: "KRONIK MOZARABIK • 754 M",
    artifactTitle: "Oktober 732 M • Aquitaine, Prancis",
    artifactQuote:
      "Infanteri Franka membentuk formasi rapat di perbukitan berhutan antara Sungai Clain dan Vienne.",
    artifactStyle: "chronicle",
  },
  {
    id: "pertempuran-talas",
    title: "Pertempuran Talas",
    year: 751,
    visibleStartYear: 600,
    visibleEndYear: 950,
    category: "PERTEMPURAN",
    iconType: "sword",
    lat: 42.52,
    lng: 72.24,
    description:
      "Pertemuan militer di Lembah Sungai Talas, Asia Tengah, yang memfasilitasi penyebaran teknologi pembuatan kertas dari Tiongkok ke Samarkand dan Barat.",
    artifactLabel: "TRANSFER TEKNOLOGI • JALUR SUTRA",
    artifactTitle: "Juli 751 M • Sungai Talas, Perbatasan Kirgizstan-Kazakhstan",
    artifactQuote:
      "Para perajin kertas yang tertawan di Talas mendirikan pabrik kertas pertama di Samarkand, merevolusi literasi dunia.",
    artifactStyle: "map",
  },
  {
    id: "kekaisaran-khmer-802",
    title: "Kebangkitan Kekaisaran Khmer",
    year: 802,
    visibleStartYear: 600,
    visibleEndYear: 1250,
    category: "PENDIRIAN",
    iconType: "flag",
    lat: 13.41,
    lng: 103.86,
    description:
      "Pada 802 M, Jayawarman II mendeklarasikan kedaulatan di Phnom Kulen, menyatukan kerajaan-kerajaan Chenla menjadi Kekaisaran Khmer yang berpusat di Angkor.",
    artifactLabel: "PRASASTI SDOK KAK THOM • 1052 M",
    artifactTitle: "802 M • Mahendraparvata (Phnom Kulen), Kamboja",
    artifactQuote:
      "Catatan epigrafi Sanskerta dan Khmer Kuno mengenai penyatuan wilayah di dataran Danau Tonle Sap.",
    artifactStyle: "inscription",
  },
  {
    id: "nara-ibu-kota",
    title: "Nara Menjadi Ibu Kota Jepang",
    year: 710,
    visibleStartYear: 580,
    visibleEndYear: 950,
    category: "PERISTIWA",
    iconType: "monument",
    lat: 34.68,
    lng: 135.8,
    description:
      "Heijo-kyo (Nara) didirikan sebagai ibu kota permanen pertama Jepang dengan tata ruang grid simetris yang meniru Chang'an pada masa Dinasti Tang.",
    artifactLabel: "KRONIK SHOKU NIHONGI • 797 M",
    artifactTitle: "710 M • Heijo-kyo (Nara), Honshu",
    artifactQuote:
      "Pusat penyusunan karya sejarah Kojiki (712 M) dan Nihon Shoki (720 M) serta jalur akhir Jalur Sutra Maritim.",
    artifactStyle: "seal",
  },
  {
    id: "runtuhnya-romawi-barat",
    title: "Runtuhnya Kekaisaran Romawi Barat",
    year: 476,
    visibleStartYear: 300,
    visibleEndYear: 720,
    category: "PERISTIWA",
    iconType: "monument",
    lat: 44.41,
    lng: 12.2,
    description:
      "Turunnya Romulus Augustulus di Ravenna pada 476 M menandai berakhirnya Kekaisaran Romawi Barat dan peralihan Eropa menuju Abad Pertengahan.",
    artifactLabel: "ARSIP RAVENNA • 476 M",
    artifactTitle: "4 September 476 M • Ravenna, Italia",
    artifactQuote:
      "Insignia kekaisaran dikirimkan ke Konstantinopel, mengukuhkan Bizantium sebagai pewaris tunggal tradisi Romawi.",
    artifactStyle: "seal",
  },
  {
    id: "republik-romawi-509",
    title: "Pendirian Republik Romawi",
    year: -509,
    visibleStartYear: -800,
    visibleEndYear: 100,
    category: "PENDIRIAN",
    iconType: "flag",
    lat: 41.89,
    lng: 12.48,
    description:
      "Roma beralih dari sistem kerajaan menuju Republik dengan Senat dan konsul terpilih, memulai ekspansi di seluruh Semenanjung Italia dan Mediterania.",
    artifactLabel: "PRASASTI FASTI CONSULARES • FORUM ROMANUM",
    artifactTitle: "509 SM • Bukit Capitoline, Roma",
    artifactQuote:
      "Daftar kronologis para konsul terpilih yang diukir pada marmer di jantung Forum Romanum.",
    artifactStyle: "inscription",
  },
  {
    id: "majapahit-1336",
    title: "Sumpah Palapa & Puncak Majapahit",
    year: 1336,
    visibleStartYear: 1200,
    visibleEndYear: 1550,
    category: "PERADABAN",
    iconType: "flag",
    lat: -7.55,
    lng: 112.38,
    description:
      "Mahapatih Gajah Mada dan Raja Hayam Wuruk membawa Kemaharajaan Majapahit di Trowulan menjadi poros maritim dan perdagangan kepulauan Nusantara.",
    artifactLabel: "KAKAWIN NAGARAKRETAGAMA • 1365 M",
    artifactTitle: "1336 M – 1365 M • Trowulan, Jawa Timur",
    artifactQuote:
      "Naskah lontar karya Mpu Prapanca yang mendokumentasikan tata kota Majapahit dan jaringan wilayah Nusantara.",
    artifactStyle: "inscription",
  },
  {
    id: "utsmaniyah-1517",
    title: "Ekspansi Kesultanan Utsmaniyah & Jalur Rempah",
    year: 1517,
    visibleStartYear: 1450,
    visibleEndYear: 1799,
    category: "PERISTIWA",
    iconType: "sword",
    lat: 41.01,
    lng: 28.97,
    description:
      "Kesultanan Utsmaniyah menyatukan pesisir Mediterania Timur dan Laut Merah, mendorong penjelajahan samudra dunia menuju Nusantara dan Amerika.",
    artifactLabel: "PETA PIRI REIS • 1513 M",
    artifactTitle: "Abad ke-16 • Istanbul, Selat Bosporus",
    artifactQuote:
      "Kartografi maritim Utsmaniyah yang memetakan pesisir Samudra Atlantik, Mediterania, dan Samudra Hindia.",
    artifactStyle: "map",
  },
  {
    id: "kongres-wina-1818",
    title: "Tatanan Dunia Pasca-Kongres Wina",
    year: 1818,
    visibleStartYear: 1790,
    visibleEndYear: 1900,
    category: "PERISTIWA",
    iconType: "scroll",
    lat: 48.2,
    lng: 16.37,
    description:
      "Pada 1818 M, kekuatan-kekuatan Eropa menata ulang perbatasan benua dan keseimbangan diplomatik setelah era Perang Napoleon.",
    artifactLabel: "AKTA DIPLOMATIK • 1815–1818 M",
    artifactTitle: "1818 M • Wina & Aix-la-Chapelle",
    artifactQuote:
      "Restrukturisasi perbatasan Eropa Tengah dan pengakuan hukum diplomasi internasional modern.",
    artifactStyle: "seal",
  },
  {
    id: "proklamasi-indonesia-1945",
    title: "Kemerdekaan Republik Indonesia",
    year: 1945,
    visibleStartYear: 1910,
    visibleEndYear: 2024,
    category: "PENDIRIAN",
    iconType: "flag",
    lat: -6.2,
    lng: 106.85,
    description:
      "Pada 17 Agustus 1945, Indonesia memproklamasikan kemerdekaannya di Jakarta, mengawali era dekolonisasi besar-besaran di Asia dan Afrika.",
    artifactLabel: "NASKAH OTENTIK • 17 AGUSTUS 1945",
    artifactTitle: "1945 M • Jakarta, Indonesia",
    artifactQuote:
      "Lahirnya negara kepulauan berdaulat yang menyatukan ribuan pulau di sepanjang garis khatulistiwa.",
    artifactStyle: "chronicle",
  },
];

export const KISAH_STORIES: KisahStory[] = [
  {
    id: "kisah-romawi",
    yearRangeLabel: "509 SM – 476 M",
    title: "Kebangkitan dan kejatuhan Romawi",
    description:
      "Dari republik kecil menjadi kekaisaran di sekeliling Laut Tengah, hingga kejatuhannya di Barat.",
    accentToken: "--polity-amber",
    iconType: "temple",
    targetYear: 117,
    targetLat: 41.9,
    targetLng: 14.5,
    eventId: "republik-romawi-509",
  },
  {
    id: "kisah-tiongkok",
    yearRangeLabel: "215 SM – 1950 M",
    title: "Kekaisaran Tiongkok",
    description:
      "Dua ribu tahun dinasti, dari kaisar pertama hingga era modern Tiongkok.",
    accentToken: "--polity-coral",
    iconType: "scroll",
    targetYear: 622,
    targetLat: 34.2,
    targetLng: 109.0,
    eventId: "pertempuran-talas",
  },
  {
    id: "kisah-sriwijaya-nusantara",
    yearRangeLabel: "682 M – 1527 M",
    title: "Kemaharajaan Maritim Sriwijaya & Majapahit",
    description:
      "Bagaimana prasasti batu di Palembang tahun 682 M menandai kebangkitan jaringan maritim Nusantara hingga era Majapahit.",
    accentToken: "--polity-gold",
    iconType: "compass",
    targetYear: 682,
    targetLat: -2.99,
    targetLng: 104.76,
    eventId: "sriwijaya-682",
  },
  {
    id: "kisah-mongol",
    yearRangeLabel: "1206 M – 1294 M",
    title: "Kekaisaran Mongol",
    description:
      "Bagaimana suku-suku stepa, bersatu di bawah Jenghis Khan, membangun kekaisaran daratan terluas dalam sejarah.",
    accentToken: "--polity-teal",
    iconType: "shield",
    targetYear: 1279,
    targetLat: 45.0,
    targetLng: 95.0,
  },
  {
    id: "kisah-pd1",
    yearRangeLabel: "1914 M – 1924 M",
    title: "Perang Dunia I dan runtuhnya kekaisaran",
    description:
      "Bagaimana krisis di Sarajevo memicu perang dunia yang meruntuhkan empat kekaisaran besar.",
    accentToken: "--polity-purple",
    iconType: "shield",
    targetYear: 1914,
    targetLat: 48.0,
    targetLng: 18.0,
  },
  {
    id: "kisah-pd2",
    yearRangeLabel: "1938 M – 1945 M",
    title: "Perang Dunia II, dari tahun ke tahun",
    description:
      "Bagaimana konflik global di Eropa dan Asia-Pasifik mengubah peta dunia hingga lahirnya negara-negara merdeka.",
    accentToken: "--polity-indigo",
    iconType: "globe",
    targetYear: 1945,
    targetLat: -2.5,
    targetLng: 115.0,
    eventId: "proklamasi-indonesia-1945",
  },
  {
    id: "kisah-afrika",
    yearRangeLabel: "1880 M – 1994 M",
    title: "Afrika: dari penjajahan menuju kemerdekaan",
    description:
      "Bagaimana negara-negara Eropa membagi Afrika dan bagaimana rakyat Afrika merebut kembali kemerdekaan mereka.",
    accentToken: "--polity-emerald",
    iconType: "globe",
    targetYear: 1600,
    targetLat: 9.0,
    targetLng: 22.0,
  },
];

export function getActivePolitiesForYear(year: number): Array<{
  polity: PolityTerritory;
  currentAreaKm2: number;
}> {
  const active: Array<{ polity: PolityTerritory; currentAreaKm2: number }> = [];
  for (const polity of POLITIES) {
    if (year >= polity.startYear && year <= polity.endYear) {
      // Calculate realistic dynamic area curve based on proximity to peakYear
      const spanBefore = Math.max(1, polity.peakYear - polity.startYear);
      const spanAfter = Math.max(1, polity.endYear - polity.peakYear);
      const distRatio =
        year <= polity.peakYear
          ? (polity.peakYear - year) / spanBefore
          : (year - polity.peakYear) / spanAfter;
      // At exactly 622 M, preserve exact video leaderboard numbers!
      const scale = year === 622 ? 1.0 : Math.max(0.58, 1 - 0.35 * Math.pow(distRatio, 1.4));
      const area = Math.round((polity.peakAreaKm2 * scale) / 1000) * 1000;
      active.push({ polity, currentAreaKm2: area });
    }
  }
  active.sort((a, b) => b.currentAreaKm2 - a.currentAreaKm2);
  return active;
}

export function getActiveEventsForYear(year: number): HistoricalEventItem[] {
  return HISTORICAL_EVENTS.filter(
    (ev) => year >= ev.visibleStartYear && year <= ev.visibleEndYear
  );
}

export function formatAreaKm2(areaKm2: number): string {
  return `${areaKm2.toLocaleString("id-ID")} km²`;
}
