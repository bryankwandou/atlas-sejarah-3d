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
  ruler: string;
  summary: string;
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

export interface StoryChapter {
  year: number;
  lat: number;
  lng: number;
  zoom: number;
  chapterTitle: string;
  chapterText: string;
  highlightPolityId?: string;
  eventId?: string;
}

export interface KisahStory {
  id: string;
  yearRangeLabel: string;
  title: string;
  description: string;
  accentToken: PolityColorToken;
  iconType: "temple" | "scroll" | "shield" | "globe" | "plane" | "compass";
  targetYear: number;
  targetLat: number;
  targetLng: number;
  eventId?: string;
  chapters: StoryChapter[];
}

export interface QuizQuestion {
  id: string;
  mode: "siapa-berkuasa" | "tahun-berapa" | "harian";
  year: number;
  lat: number;
  lng: number;
  targetPolityId: string;
  prompt: string;
  options: string[];
  correctAnswer: string;
  explanation: string;
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

export function sliderValueToYear(sliderVal: number): number {
  const t = Math.max(0, Math.min(1, sliderVal / 1000));
  if (t <= 0.24) {
    return Math.round(-3000 + (t / 0.24) * 2500);
  }
  if (t <= 0.44) {
    return Math.round(-500 + ((t - 0.24) / 0.20) * 1000);
  }
  if (t <= 0.66) {
    return Math.round(500 + ((t - 0.44) / 0.22) * 1000);
  }
  if (t <= 0.83) {
    return Math.round(1500 + ((t - 0.66) / 0.17) * 300);
  }
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
  // ZAMAN KUNO (-3000 .. -501 SM)
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
    ruler: "Firaun Ramses II",
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
    ruler: "Hammurabi",
    summary: "Pusat peradaban sungai Eufrat dan Tigris yang melahirkan sistem hukum tertulis pertama dan astronomi kuno.",
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
    ruler: "Dewan Kota & Pendeta",
    summary: "Peradaban kota terencana di Asia Selatan dengan drainase canggih dan jaringan pelayaran teluk.",
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
    ruler: "Raja Wu dari Zhou",
    summary: "Dinasti awal di lembah Sungai Kuning yang meletakkan dasar aksara Hanzi dan mandat langit.",
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
    ruler: "Koresh Agung / Darius I",
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
    ruler: "Kaisar Trajanus",
    summary: "Dari republik di Semenanjung Italia menjadi kekaisaran yang mengelilingi seluruh cekungan Laut Tengah (Mare Nostrum).",
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
    ruler: "Kaisar Han Wu",
    summary: "Menyatukan Tiongkok dan membuka jaringan perdagangan Jalur Sutra menuju Asia Tengah dan Barat.",
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
    ruler: "Asoka Agung",
    summary: "Menyatukan anak benua India dan mengembangkan ilmu astronomi, angka desimal, dan jaringan perdagangan samudra.",
    rings: [
      [
        [67.0, 34.0], [89.0, 26.5], [86.0, 14.0], [75.0, 12.0], [68.0, 23.5],
      ],
    ],
  },

  // =========================================================================
  // ABAD PERTENGAHAN AWAL (500 M .. 900 M) — EXACT MATCH 622 M & 682 M
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
    ruler: "Bilge Khagan / Ishbara",
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
    ruler: "Khosrow II (Parviz)",
    summary: "Kekaisaran Persia pra-Islam terakhir yang menjadi kekuatan dominan di Mesopotamia dan dataran tinggi Iran.",
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
    peakYear: 622,
    peakAreaKm2: 3300000,
    colorToken: "--polity-terracotta",
    labelLat: 33.5,
    labelLng: 111.0,
    capital: "Daxing (Chang'an)",
    ruler: "Kaisar Wen dari Sui",
    summary: "Menyatukan kembali Tiongkok setelah tiga abad perpecahan dan membangun Terusan Besar.",
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
    ruler: "Kaisar Taizong",
    summary: "Zaman keemasan kosmopolitan Tiongkok, penemuan teknik cetak blok, kompas maritim, dan ekspansi Jalur Sutra.",
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
    peakYear: 622,
    peakAreaKm2: 1900000,
    colorToken: "--polity-sky",
    labelLat: 39.2,
    labelLng: 29.5,
    capital: "Konstantinopel",
    ruler: "Kaisar Heraklius",
    summary: "Kelanjutan Kekaisaran Romawi di Timur yang menguasai Anatolia, Yunani, dan Mediterania Timur.",
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
    colorToken: "--polity-cyan",
    labelLat: 47.0,
    labelLng: 20.5,
    capital: "Cekungan Pannonia",
    ruler: "Kagan Bayan I",
    summary: "Kekuatan kavaleri stepa yang memerintah di Eropa Tengah dan lembah Danube.",
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
    peakYear: 622,
    peakAreaKm2: 680000,
    colorToken: "--polity-lime",
    labelLat: 47.5,
    labelLng: 4.5,
    capital: "Paris / Aachen",
    ruler: "Dagobert I / Charlemagne",
    summary: "Kerajaan yang menyatukan Galia dan Jerman Barat pada Abad Pertengahan Awal.",
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
    colorToken: "--polity-coral",
    labelLat: 40.0,
    labelLng: -4.0,
    capital: "Toledo",
    ruler: "Raja Suintila",
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
    peakYear: 622,
    peakAreaKm2: 380000,
    colorToken: "--polity-teal",
    labelLat: 18.5,
    labelLng: -89.5,
    capital: "Tikal / Calakmul",
    ruler: "K'inich Janaab' Pakal",
    summary: "Jaringan negara-kota di Mesoamerika yang unggul dalam sistem kalender, hieroglif, dan arsitektur piramida bertingkat.",
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
    peakYear: 622,
    peakAreaKm2: 360000,
    colorToken: "--polity-purple",
    labelLat: 40.8,
    labelLng: 126.5,
    capital: "Pyongyang",
    ruler: "Raja Yeongyang / Yeon Gaesomun",
    summary: "Kerajaan kuno Korea yang mempertahankan kedaulatan di utara semenanjung dan wilayah Liaodong.",
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
    peakYear: 622,
    peakAreaKm2: 250000,
    colorToken: "--polity-gold",
    labelLat: 11.5,
    labelLng: 105.0,
    capital: "Vyadhapura / Oc Eo",
    ruler: "Rudravarman",
    summary: "Kerajaan pelabuhan awal di Delta Mekong yang menjadi pusat perdagangan antara India dan Tiongkok.",
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
    colorToken: "--polity-emerald",
    labelLat: 52.8,
    labelLng: -1.5,
    capital: "Winchester / York",
    ruler: "Edwin dari Northumbria",
    summary: "Heptarki kerajaan di Pulau Britania sebelum penyatuan menjadi Kerajaan Inggris.",
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
    ruler: "Negus Armah (Najashi)",
    summary: "Kerajaan niaga di Tanduk Afrika yang mengontrol rute maritim Laut Merah.",
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
    ruler: "Dapunta Hyang Sri Jayanasa / Balaputradewa",
    summary: "Kemaharajaan bahari di Sumatra yang menguasai Selat Malaka, Selat Sunda, dan perdagangan maritim Asia Tenggara.",
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
    ruler: "Jayawarman VII",
    summary: "Kekaisaran di daratan Asia Tenggara yang membangun kompleks candi Angkor Wat dan sistem tata air baray raksasa.",
    rings: [
      [
        [99.0, 17.5], [108.5, 16.5], [109.0, 10.0], [102.0, 10.5], [99.5, 13.0],
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
    capital: "Karakorum / Dadu (Beijing)",
    ruler: "Jenghis Khan / Kublai Khan",
    summary: "Kekaisaran daratan bersambung terluas dalam sejarah dunia yang membentang dari Laut Jepang hingga Eropa Timur.",
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
    ruler: "Hayam Wuruk & Mahapatih Gajah Mada",
    summary: "Kemaharajaan maritim Nusantara yang berpusat di Jawa Timur dan memelihara hubungan kedaulatan di seluruh kepulauan.",
    rings: [
      [
        [96.0, 5.5], [119.0, 4.5], [134.0, -3.5], [130.0, -9.5], [114.0, -9.0], [104.0, -6.5],
      ],
    ],
  },

  // =========================================================================
  // AWAL ZAMAN MODERN (1500 M .. 1799 M) — EXACT MATCH 00:08 VIDEO
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
    ruler: "Sultan Suleiman Al-Qanuni",
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
    ruler: "Akbar Agung / Shah Jahan",
    summary: "Kekaisaran besar di anak benua India yang membangun Taj Mahal dan menghasilkan 25% PDB dunia saat itu.",
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
    ruler: "Pyotr Agung",
    summary: "Berkembang dari Kadipaten Moskow melintasi Pegunungan Ural hingga Siberia dan Samudra Pasifik.",
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
    ruler: "Sigismund III Vasa",
    summary: "Salah satu negara terbesar di Eropa dengan sistem monarki elektif dan kebebasan toleransi beragama.",
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
    capital: "Turkistan",
    ruler: "Kasym Khan",
    summary: "Negara stepa di Asia Tengah yang menyatukan suku-suku nomaden Kazakh dari Laut Kaspia hingga Altai.",
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
    ruler: "Doge Venesia",
    summary: "Republik maritim yang mendominasi perdagangan rempah dan kain sutra di Laut Adriatik dan Mediterania.",
    rings: [
      [
        [10.5, 46.2], [16.5, 45.5], [19.0, 42.0], [12.0, 44.0],
      ],
    ],
  },
  {
    id: "kekaisaran-etiopia",
    name: "Kekaisaran Ethiopia",
    startYear: 1270,
    endYear: 1974,
    peakYear: 1600,
    peakAreaKm2: 1100000,
    colorToken: "--polity-purple",
    labelLat: 9.2,
    labelLng: 39.5,
    capital: "Gondar / Addis Ababa",
    ruler: "Kaisar Fasilides",
    summary: "Kerajaan dataran tinggi Afrika Timur yang menjaga kedaulatan dan tradisi monarki Solomonic.",
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
    ruler: "Manikongo Afonso I",
    summary: "Kerajaan terorganisasi di Afrika Tengah di sepanjang muara Sungai Kongo.",
    rings: [
      [
        [12.0, -4.0], [17.0, -4.5], [16.5, -9.5], [12.5, -9.0],
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
    ruler: "Mai Idris Alooma",
    summary: "Kekaisaran di cekungan Danau Chad yang menguasai rute perdagangan karavan Trans-Sahara.",
    rings: [
      [
        [10.0, 17.5], [19.5, 17.0], [18.5, 10.0], [10.5, 10.5],
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
    ruler: "Kaisar Qianlong / Yongle",
    summary: "Memperluas wilayah Tiongkok, memimpin armada kapal harta karun Laksamana Cheng Ho, dan membangun Kota Terlarang.",
    rings: [
      [
        [76.0, 45.0], [132.0, 48.0], [122.5, 22.0], [106.0, 21.0], [88.0, 28.0], [75.0, 38.0],
      ],
    ],
  },

  // =========================================================================
  // ZAMAN MODERN (1800 M .. 2024 M)
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
    ruler: "Ratu Victoria / Raja George V",
    summary: "Imperium global terbesar dalam sejarah yang mencakup seperempat daratan bumi pada awal abad ke-20.",
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
    ruler: "Tsar Aleksandr II / Presiden",
    summary: "Negara dengan bentang wilayah daratan terluas di dunia yang membentang di Eropa Timur dan Asia Utara.",
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
    capital: "Jakarta / Nusantara",
    ruler: "Soekarno (1945) / Presiden",
    summary: "Negara kepulauan terbesar di dunia dengan 17.000+ pulau yang membentang di sepanjang garis khatulistiwa dari Sabang hingga Merauke.",
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
    ruler: "Presiden Tiongkok",
    summary: "Negara berpenduduk terbesar di Asia Timur dengan sejarah peradaban berkesinambungan.",
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
    ruler: "Presiden AS",
    summary: "Negara federasi di Amerika Utara yang membentang dari Samudra Atlantik hingga Samudra Pasifik.",
    rings: [
      [
        [-124.5, 49.0], [-67.0, 47.0], [-80.0, 25.2], [-97.5, 26.0], [-117.2, 32.5],
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
      "Pertempuran menentukan selama enam hari di dekat Sungai Yarmuk yang mengubah peta kekuasaan di Levant dan mengakhiri kekuasaan Bizantium di Suriah.",
    artifactLabel: "KRONIK SEJARAH • LEMBAH YARMUK",
    artifactTitle: "Agustus 636 M • Perbatasan Suriah-Yordania",
    artifactQuote:
      "Manuver kavaleri di lembah ngarai Sungai Yarmuk mengubah tatanan geopolitik Mediterania Timur.",
    artifactStyle: "chronicle",
  },
  {
    id: "konsolidasi-madinah",
    title: "Hijrah ke Madinah",
    year: 622,
    visibleStartYear: 580,
    visibleEndYear: 820,
    category: "PERISTIWA",
    iconType: "scroll",
    lat: 24.47,
    lng: 39.61,
    description:
      "Pada 622 M, peristiwa Hijrah dan penyusunan Piagam Madinah di Yatsrib mengawali penanggalan Hijriah serta penyatuan masyarakat di Jazirah Arab.",
    artifactLabel: "DOKUMEN SEJARAH • PIAGAM MADINAH",
    artifactTitle: "622 M • Yatsrib (Madinah), Hejaz",
    artifactQuote:
      "Perjanjian tertulis yang mengatur tata tertib, hak-hak kemasyarakatan majemuk, dan persatuan pertahanan bersama.",
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
      "Pertempuran antara Poitiers dan Tours di Galia yang menentukan batas utara kekuasaan Muslim di Semenanjung Iberia dan mengokohkan Kekuatan Franka.",
    artifactLabel: "KRONIK MOZARABIK • 754 M",
    artifactTitle: "Oktober 732 M • Aquitaine, Prancis",
    artifactQuote:
      "Pasukan infanteri Charles Martel mempertahankan garis pertahanan kokoh di perbukitan berhutan Poitiers.",
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
      "Pertempuran di tepi Sungai Talas yang mempertemukan pasukan Dinasti Tang dengan Kekhalifahan Abbasiyah, membuka transfer teknologi pembuatan kertas ke Samarkand.",
    artifactLabel: "TRANSFER TEKNOLOGI • JALUR SUTRA",
    artifactTitle: "Juli 751 M • Sungai Talas, Asia Tengah",
    artifactQuote:
      "Para perajin kertas yang bermigrasi mendirikan pabrik kertas pertama di luar Tiongkok di Samarkand.",
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
      "Pada 802 M, Jayawarman II memproklamasikan kedaulatan di Phnom Kulen, menyatukan daratan Asia Tenggara dan meletakkan dasar peradaban Angkor.",
    artifactLabel: "PRASASTI SDOK KAK THOM",
    artifactTitle: "802 M • Phnom Kulen, Kamboja",
    artifactQuote:
      "Pengukuhan persatuan Chenla Darat dan Chenla Air menuju era peradaban maritim dan agraris Angkor.",
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
      "Heijo-kyo (Nara) diresmikan sebagai ibu kota permanen pertama Jepang dengan tata kota berpetak yang terinspirasi oleh Chang'an di Tiongkok.",
    artifactLabel: "KRONIK SHOKU NIHONGI",
    artifactTitle: "710 M • Heijo-kyo, Honshu",
    artifactQuote:
      "Pusat berkembangnya seni Buddha, penyusunan kitab sejarah Kojiki, dan tata hukum Ritsuryo.",
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
      "Turunnya takhta Romulus Augustulus di Ravenna pada 476 M menandai peralihan peradaban Eropa menuju Abad Pertengahan.",
    artifactLabel: "ARSIP RAVENNA • 476 M",
    artifactTitle: "September 476 M • Ravenna, Italia",
    artifactQuote:
      "Simbol kekaisaran dikirim ke Konstantinopel, mengukuhkan Bizantium sebagai pewaris tunggal gelar Romawi.",
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
      "Roma mengakhiri monarki Tarquin dan membentuk republik dengan institusi Senat dan konsul, menjadi fondasi hukum modern.",
    artifactLabel: "PRASASTI FASTI CAPITOLINI",
    artifactTitle: "509 SM • Forum Romanum, Roma",
    artifactQuote:
      "Catatan konsul-konsul tahunan yang terukir di marmer putih di jantung kota abadi Roma.",
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
      "Mahapatih Gajah Mada mengikrarkan Sumpah Palapa untuk menyatukan kepulauan Nusantara di bawah naungan panji Wilwatikta (Majapahit).",
    artifactLabel: "KITAB PARARATON & NAGARAKRETAGAMA",
    artifactTitle: "1336 M • Trowulan, Jawa Timur",
    artifactQuote:
      "Lamun huwus kalah nusantara isun amukti palapa...",
    artifactStyle: "inscription",
  },
  {
    id: "utsmaniyah-1517",
    title: "Ekspansi Kesultanan Utsmaniyah",
    year: 1517,
    visibleStartYear: 1450,
    visibleEndYear: 1799,
    category: "PERISTIWA",
    iconType: "sword",
    lat: 41.01,
    lng: 28.97,
    description:
      "Kesultanan Utsmaniyah menguasai Levant dan Mesir, menghubungkan rute dagang Mediterania Timur dan Laut Merah.",
    artifactLabel: "PETA PIRI REIS",
    artifactTitle: "1513 M – 1517 M • Istanbul",
    artifactQuote:
      "Peta navigasi dunia pertama yang menggambarkan Samudra Atlantik dan garis pantai Amerika dengan akurasi tinggi.",
    artifactStyle: "map",
  },
  {
    id: "proklamasi-indonesia-1945",
    title: "Proklamasi Kemerdekaan Indonesia",
    year: 1945,
    visibleStartYear: 1910,
    visibleEndYear: 2024,
    category: "PENDIRIAN",
    iconType: "flag",
    lat: -6.2,
    lng: 106.85,
    description:
      "Pada 17 Agustus 1945, Soekarno dan Mohammad Hatta memproklamasikan kemerdekaan bangsa Indonesia di Jalan Pegangsaan Timur 56, Jakarta.",
    artifactLabel: "NASKAH PROKLAMASI OTENTIK",
    artifactTitle: "17 Agustus 1945 • Jakarta, Indonesia",
    artifactQuote:
      "Kami bangsa Indonesia dengan ini menjatakan Kemerdekaan Indonesia. Hal-hal jang mengenai pemindahan kekoeasaan d.l.l., diselenggarakan dengan tjara seksama...",
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
    chapters: [
      {
        year: -509,
        lat: 41.89,
        lng: 12.48,
        zoom: 2.3,
        chapterTitle: "509 SM: Lahirnya Republik Romawi",
        chapterText: "Rakyat Roma mengusir raja Tarquinius Superbus dan mendirikan sistem republik dengan Senat serta dua konsul terpilih.",
        highlightPolityId: "romawi",
        eventId: "republik-romawi-509",
      },
      {
        year: -146,
        lat: 36.8,
        lng: 10.2,
        zoom: 2.2,
        chapterTitle: "146 SM: Menguasai Laut Mediterania",
        chapterText: "Setelah Perang Punisia melawan Kartago dan penaklukan Yunani, Roma menguasai seluruh cekungan barat Mediterania.",
        highlightPolityId: "romawi",
      },
      {
        year: 117,
        lat: 41.9,
        lng: 14.5,
        zoom: 2.4,
        chapterTitle: "117 M: Puncak Kejayaan Trajanus",
        chapterText: "Kekaisaran Romawi mencapai luas puncak 5.000.000 km² dari Britania dan Spanyol hingga Mesopotamia dan Mesir.",
        highlightPolityId: "romawi",
      },
      {
        year: 476,
        lat: 44.41,
        lng: 12.2,
        zoom: 2.1,
        chapterTitle: "476 M: Runtuhnya Romawi Barat",
        chapterText: "Kaisar terakhir Romulus Augustulus diturunkan di Ravenna, mengawali zaman kerajaan-kerajaan Abad Pertengahan di Eropa.",
        highlightPolityId: "franka",
        eventId: "runtuhnya-romawi-barat",
      },
    ],
  },
  {
    id: "kisah-tiongkok",
    yearRangeLabel: "215 SM – 1950 M",
    title: "Kekaisaran Tiongkok",
    description:
      "Dua ribu tahun dinasti, dari kaisar pertama hingga Republik Rakyat Tiongkok.",
    accentToken: "--polity-coral",
    iconType: "scroll",
    targetYear: 622,
    targetLat: 34.2,
    targetLng: 109.0,
    eventId: "pertempuran-talas",
    chapters: [
      {
        year: -221,
        lat: 34.3,
        lng: 109.5,
        zoom: 2.3,
        chapterTitle: "221 SM: Penyatuan Qin Shi Huang",
        chapterText: "Qin Shi Huang menyatukan tujuh negara berperang, membakukan mata uang, aksara Han, dan membangun Tembok Besar.",
        highlightPolityId: "dinasti-han",
      },
      {
        year: 622,
        lat: 33.5,
        lng: 111.0,
        zoom: 2.3,
        chapterTitle: "622 M: Dinasti Sui & Pembangunan Terusan Besar",
        chapterText: "Dinasti Sui menghubungkan Sungai Yangtze dan Sungai Kuning dengan kanal buatan terbesar di dunia.",
        highlightPolityId: "dinasti-sui",
      },
      {
        year: 715,
        lat: 34.0,
        lng: 108.5,
        zoom: 2.2,
        chapterTitle: "715 M: Zaman Keemasan Tang",
        chapterText: "Chang'an menjadi kota terbesar di dunia dengan 1 juta penduduk dan pusat pertukaran budaya Jalur Sutra.",
        highlightPolityId: "dinasti-tang-song",
      },
      {
        year: 1790,
        lat: 39.9,
        lng: 116.4,
        zoom: 2.2,
        chapterTitle: "1790 M: Puncak Dinasti Qing",
        chapterText: "Wilayah Tiongkok meluas hingga 14.700.000 km² di bawah pemerintahan Kaisar Qianlong.",
        highlightPolityId: "dinasti-ming-qing",
      },
    ],
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
    chapters: [
      {
        year: 682,
        lat: -2.99,
        lng: 104.76,
        zoom: 2.3,
        chapterTitle: "682 M: Ekspedisi Siddhayatra Sriwijaya",
        chapterText: "Dapunta Hyang memimpin ekspedisi 20.000 tentara di Palembang, mendirikan pusat kemaharajaan maritim Sriwijaya di Sumatra.",
        highlightPolityId: "sriwijaya",
        eventId: "sriwijaya-682",
      },
      {
        year: 850,
        lat: 3.1,
        lng: 101.7,
        zoom: 2.2,
        chapterTitle: "850 M: Penguasaan Selat Malaka & Selat Sunda",
        chapterText: "Sriwijaya memegang monopoli pelayaran niaga antara India dan Tiongkok serta menjadi pusat studi Buddhisme internasional.",
        highlightPolityId: "sriwijaya",
      },
      {
        year: 1293,
        lat: -7.55,
        lng: 112.38,
        zoom: 2.3,
        chapterTitle: "1293 M: Pendirian Majapahit di Trowulan",
        chapterText: "Raden Wijaya mengalahkan pasukan Tartar ekspedisi Mongol dan mendirikan Majapahit di lembah Sungai Brantas.",
        highlightPolityId: "majapahit",
      },
      {
        year: 1350,
        lat: -5.0,
        lng: 115.0,
        zoom: 2.1,
        chapterTitle: "1350 M: Sumpah Palapa & Kejayaan Nusantara",
        chapterText: "Hayam Wuruk dan Mahapatih Gajah Mada mempersatukan jaringan pelabuhan dan kerajaan pulau di seluruh Nusantara.",
        highlightPolityId: "majapahit",
        eventId: "majapahit-1336",
      },
    ],
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
    chapters: [
      {
        year: 1206,
        lat: 47.9,
        lng: 106.9,
        zoom: 2.3,
        chapterTitle: "1206 M: Kurultai di Sungai Onon",
        chapterText: "Temujin dinobatkan sebagai Jenghis Khan (Penguasa Semesta) dan menyatukan seluruh suku padang rumput Mongolia.",
        highlightPolityId: "kekaisaran-mongol",
      },
      {
        year: 1227,
        lat: 40.0,
        lng: 70.0,
        zoom: 2.1,
        chapterTitle: "1227 M: Penaklukan Asia Tengah & Kaspia",
        chapterText: "Kavaleri berkuda Mongol melintasi Pegunungan Tien Shan menaklukkan Khwarezmia dan membuka rute Pax Mongolica.",
        highlightPolityId: "kekaisaran-mongol",
      },
      {
        year: 1279,
        lat: 39.9,
        lng: 116.4,
        zoom: 2.1,
        chapterTitle: "1279 M: Kublai Khan & Dinasti Yuan",
        chapterText: "Mongol mencapai luas 24.000.000 km² dan menyatukan Tiongkok selatan, mendirikan ibu kota baru di Dadu (Beijing).",
        highlightPolityId: "kekaisaran-mongol",
      },
    ],
  },
  {
    id: "kisah-pd1",
    yearRangeLabel: "1914 M – 1924 M",
    title: "Perang Dunia I dan runtuhnya kekaisaran",
    description:
      "Bagaimana tembakan di Sarajevo memicu perang dunia yang meruntuhkan empat kekaisaran besar.",
    accentToken: "--polity-purple",
    iconType: "shield",
    targetYear: 1914,
    targetLat: 48.0,
    targetLng: 18.0,
    chapters: [
      {
        year: 1914,
        lat: 43.85,
        lng: 18.41,
        zoom: 2.3,
        chapterTitle: "1914 M: Pembunuhan di Sarajevo",
        chapterText: "Terbunuhnya Franz Ferdinand menyeret aliansi kekuatan Eropa ke kancah peperangan parit berskala massal.",
        highlightPolityId: "rusia-modern",
      },
      {
        year: 1918,
        lat: 48.85,
        lng: 2.35,
        zoom: 2.2,
        chapterTitle: "1918 M: Akhir Perang & Runtuhnya 4 Kekaisaran",
        chapterText: "Kekaisaran Jerman, Austria-Hongaria, Rusia Tsar, dan Kesultanan Utsmaniyah runtuh, melahirkan negara-negara bangsa baru.",
        highlightPolityId: "kekaisaran-britania",
      },
    ],
  },
  {
    id: "kisah-pd2",
    yearRangeLabel: "1938 M – 1945 M",
    title: "Perang Dunia II, dari tahun ke tahun",
    description:
      "Bagaimana Jerman Nazi dan Kekaisaran Jepang memperluas wilayah, dan bagaimana mereka dikalahkan.",
    accentToken: "--polity-indigo",
    iconType: "plane",
    targetYear: 1945,
    targetLat: -2.5,
    targetLng: 115.0,
    eventId: "proklamasi-indonesia-1945",
    chapters: [
      {
        year: 1939,
        lat: 52.2,
        lng: 21.0,
        zoom: 2.3,
        chapterTitle: "1939 M: Invasi Polandia",
        chapterText: "Perang pecah di Eropa dan menyebar ke seluruh penjuru dunia dengan taktik blitzkrieg modern.",
      },
      {
        year: 1942,
        lat: 1.35,
        lng: 103.8,
        zoom: 2.0,
        chapterTitle: "1942 M: Ekspansi Poros di Pasifik & Asia Tenggara",
        chapterText: "Front pertempuran membentang dari Stalingrad dan El Alamein hingga Singapura, Jawa, dan Kepulauan Solomon.",
      },
      {
        year: 1945,
        lat: -6.2,
        lng: 106.85,
        zoom: 2.2,
        chapterTitle: "1945 M: Kemenangan Sekutu & Kemerdekaan Indonesia",
        chapterText: "Perang berakhir dengan menyerahnya Blok Poros, disusul proklamasi kemerdekaan Republik Indonesia pada 17 Agustus 1945.",
        highlightPolityId: "indonesia-modern",
        eventId: "proklamasi-indonesia-1945",
      },
    ],
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
    chapters: [
      {
        year: 1600,
        lat: 13.0,
        lng: 14.5,
        zoom: 2.1,
        chapterTitle: "1600 M: Kerajaan-Kerajaan Berdaulat Afrika",
        chapterText: "Kanem-Bornu, Kerajaan Kongo, dan Kekaisaran Ethiopia mempertahankan tatanan niaga dan kedaulatan di benua Afrika.",
        highlightPolityId: "kanem-bornu",
      },
      {
        year: 1960,
        lat: 4.0,
        lng: 21.0,
        zoom: 2.0,
        chapterTitle: "1960 M: Tahun Afrika & Gelombang Kemerdekaan",
        chapterText: "17 negara Afrika meraih kemerdekaan dalam satu tahun, mengubah peta geopolitik dunia pasca-kolonial.",
      },
    ],
  },
];

export const QUIZ_QUESTIONS: QuizQuestion[] = [
  {
    id: "q-622-turk",
    mode: "siapa-berkuasa",
    year: 622,
    lat: 45.5,
    lng: 78.0,
    targetPolityId: "gokturk",
    prompt: "Pada tahun 622 M, kekaisaran stepa manakah yang menguasai wilayah luas dari Laut Kaspia hingga Manchuria dengan luas 6.500.000 km²?",
    options: ["Kekhanan Turk (Göktürk)", "Kekaisaran Sasaniyah", "Dinasti Sui", "Kekaisaran Bizantium"],
    correctAnswer: "Kekhanan Turk (Göktürk)",
    explanation: "Kekhanan Göktürk adalah negara terbesar di bumi pada tahun 622 M dengan luas wilayah mencapai 6,5 juta km².",
  },
  {
    id: "q-622-sasaniyah",
    mode: "siapa-berkuasa",
    year: 622,
    lat: 32.5,
    lng: 53.5,
    targetPolityId: "sasaniyah",
    prompt: "Pada tahun 622 M, kerajaan manakah yang beribu kota di Ctesiphon dan menjadi saingan utama Bizantium di Timur Dekat?",
    options: ["Kekaisaran Sasaniyah", "Dinasti Han", "Kerajaan Aksum", "Kekhalifahan Umayyah"],
    correctAnswer: "Kekaisaran Sasaniyah",
    explanation: "Kekaisaran Sasaniyah diperintah oleh Khosrow II dan menguasai sekitar 4,4 juta km² wilayah Persia dan Mesopotamia.",
  },
  {
    id: "q-682-sriwijaya",
    mode: "siapa-berkuasa",
    year: 682,
    lat: -2.99,
    lng: 104.76,
    targetPolityId: "sriwijaya",
    prompt: "Pada tahun 682 M, kerajaan maritim manakah yang tercatat dalam Prasasti Kedukan Bukit memimpin ekspedisi di Palembang, Sumatra?",
    options: ["Sriwijaya", "Majapahit", "Tarumanegara", "Singhasari"],
    correctAnswer: "Sriwijaya",
    explanation: "Prasasti Kedukan Bukit bertarikh 605 Saka (682 M) mencatat Dapunta Hyang memimpin ekspedisi mendirikan kemaharajaan maritim Sriwijaya.",
  },
  {
    id: "q-1350-majapahit",
    mode: "siapa-berkuasa",
    year: 1350,
    lat: -7.55,
    lng: 112.38,
    targetPolityId: "majapahit",
    prompt: "Pada tahun 1350 M, kemaharajaan Nusantara manakah yang berpusat di Trowulan dan dipimpin oleh Prabu Hayam Wuruk & Mahapatih Gajah Mada?",
    options: ["Kemaharajaan Majapahit", "Sriwijaya", "Kesultanan Demak", "Kerajaan Mataram Kuno"],
    correctAnswer: "Kemaharajaan Majapahit",
    explanation: "Majapahit mencapai puncak keemasannya di bawah Prabu Hayam Wuruk dan Gajah Mada yang mengikrarkan Sumpah Palapa.",
  },
  {
    id: "q-1600-utsmaniyah",
    mode: "siapa-berkuasa",
    year: 1600,
    lat: 38.5,
    lng: 32.0,
    targetPolityId: "utsmaniyah",
    prompt: "Pada awal zaman modern (1600 M), kesultanan adidaya manakah yang menguasai Konstantinopel, Balkan, dan Timur Tengah?",
    options: ["Kesultanan Utsmaniyah", "Kekaisaran Bizantium", "Kekaisaran Romawi Suci", "Kekaisaran Rusia"],
    correctAnswer: "Kesultanan Utsmaniyah",
    explanation: "Kesultanan Utsmaniyah (Ottoman) adalah kekhalifahan lintas benua yang beribu kota di Istanbul (Konstantinopel).",
  },
  {
    id: "q-yr-romawi",
    mode: "tahun-berapa",
    year: 117,
    lat: 41.9,
    lng: 14.5,
    targetPolityId: "romawi",
    prompt: "Kekaisaran Romawi mencapai luas puncak maksimum mengelilingi Laut Tengah di bawah Kaisar Trajanus pada tahun berapa?",
    options: ["117 M", "509 SM", "476 M", "1453 M"],
    correctAnswer: "117 M",
    explanation: "Pada tahun 117 M di akhir masa pemerintahan Kaisar Trajanus, Kekaisaran Romawi mencapai wilayah terluasnya (5.000.000 km²).",
  },
  {
    id: "q-yr-mongol",
    mode: "tahun-berapa",
    year: 1279,
    lat: 45.0,
    lng: 95.0,
    targetPolityId: "kekaisaran-mongol",
    prompt: "Kekaisaran Mongol berhasil menyatukan seluruh Tiongkok dan mencapai luas daratan terluas (24 juta km²) pada sekitar tahun berapa?",
    options: ["1279 M", "1066 M", "1500 M", "1914 M"],
    correctAnswer: "1279 M",
    explanation: "Pada tahun 1279 M, Kublai Khan memenangkan Pertempuran Yamen, menyatukan Dinasti Song dan menguasai 24 juta km².",
  },
  {
    id: "q-daily-sriwijaya",
    mode: "harian",
    year: 682,
    lat: -2.99,
    lng: 104.76,
    targetPolityId: "sriwijaya",
    prompt: "Tantangan Harian: Prasasti batu tertua di Palembang yang mencatat berdirinya wangsa pelayaran Sriwijaya dibuat pada tahun berapa?",
    options: ["682 M (605 Saka)", "1350 M", "509 SM", "1945 M"],
    correctAnswer: "682 M (605 Saka)",
    explanation: "Prasasti Kedukan Bukit ditemukan di tepi Sungai Tatang, Palembang, tertanggal 16 Juni 682 Masehi.",
  },
];

export function getActivePolitiesForYear(year: number): Array<{
  polity: PolityTerritory;
  currentAreaKm2: number;
}> {
  const active: Array<{ polity: PolityTerritory; currentAreaKm2: number }> = [];
  for (const polity of POLITIES) {
    if (year >= polity.startYear && year <= polity.endYear) {
      const spanBefore = Math.max(1, polity.peakYear - polity.startYear);
      const spanAfter = Math.max(1, polity.endYear - polity.peakYear);
      const distRatio =
        year <= polity.peakYear
          ? (polity.peakYear - year) / spanBefore
          : (year - polity.peakYear) / spanAfter;
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
