export interface CameraSensor {
  id: string;
  name: string;
  brand: string;
  category: 'Full Frame' | 'APS-C' | 'Micro Four Thirds' | 'Medium Format' | 'Large Format' | 'Cinema' | 'Compact / Mobile' | 'Specialty';
  sensorWidth: number; // mm
  sensorHeight: number; // mm
  cropFactor: number;
  coc: number; // mm (Circle of Confusion)
  popularModels?: string[];
}

export const SENSOR_CATEGORIES = [
  'All Brands',
  'Canon',
  'Sony',
  'Nikon',
  'Fujifilm',
  'Leica',
  'Panasonic / OM',
  'Cinema (ARRI/RED/BMPCC)',
  'Medium & Large Format',
  'Smartphones & Mobile'
] as const;

export const CAMERA_DATABASE: CameraSensor[] = [
  // --- CANON FULL FRAME ---
  {
    id: 'canon-full-frame',
    name: 'Canon Full Frame (EOS R5, R6, R3, 5D, 6D, 1D X)',
    brand: 'Canon',
    category: 'Full Frame',
    sensorWidth: 36.0,
    sensorHeight: 24.0,
    cropFactor: 1.0,
    coc: 0.030,
    popularModels: ['Canon EOS R5 II', 'Canon EOS R5', 'Canon EOS R6 II', 'Canon EOS R3', 'Canon EOS R8', 'Canon EOS 5D Mark IV', 'Canon EOS 6D Mark II', 'Canon EOS 1D X Mark III']
  },
  // --- CANON APS-C ---
  {
    id: 'canon-apsc',
    name: 'Canon APS-C 1.6x (EOS R7, R10, R50, R100, 90D, 7D II, Rebel)',
    brand: 'Canon',
    category: 'APS-C',
    sensorWidth: 22.3,
    sensorHeight: 14.9,
    cropFactor: 1.6,
    coc: 0.019,
    popularModels: ['Canon EOS R7', 'Canon EOS R10', 'Canon EOS R50', 'Canon EOS R100', 'Canon 90D', 'Canon Rebel T8i / 850D', 'Canon EOS 7D Mark II']
  },

  // --- SONY FULL FRAME ---
  {
    id: 'sony-full-frame',
    name: 'Sony Full Frame (A7 IV, A7R V, A7S III, A1, A9 III, FX3, ZV-E1)',
    brand: 'Sony',
    category: 'Full Frame',
    sensorWidth: 35.6,
    sensorHeight: 23.8,
    cropFactor: 1.0,
    coc: 0.030,
    popularModels: ['Sony Alpha 7 IV', 'Sony Alpha 7R V', 'Sony Alpha 7S III', 'Sony Alpha 1', 'Sony Alpha 9 III', 'Sony FX3', 'Sony FX6', 'Sony ZV-E1']
  },
  // --- SONY APS-C ---
  {
    id: 'sony-apsc',
    name: 'Sony APS-C 1.5x (A6700, A6400, A6600, FX30, ZV-E10)',
    brand: 'Sony',
    category: 'APS-C',
    sensorWidth: 23.5,
    sensorHeight: 15.6,
    cropFactor: 1.53,
    coc: 0.020,
    popularModels: ['Sony A6700', 'Sony A6400', 'Sony A6600', 'Sony FX30', 'Sony ZV-E10 II', 'Sony ZV-E10']
  },

  // --- NIKON FULL FRAME (FX) ---
  {
    id: 'nikon-fx',
    name: 'Nikon Full Frame / FX (Z8, Z9, Z6 III, Zf, D850, D780)',
    brand: 'Nikon',
    category: 'Full Frame',
    sensorWidth: 35.9,
    sensorHeight: 23.9,
    cropFactor: 1.0,
    coc: 0.030,
    popularModels: ['Nikon Z8', 'Nikon Z9', 'Nikon Z6 III', 'Nikon Z7 II', 'Nikon Zf', 'Nikon D850', 'Nikon D780', 'Nikon D6']
  },
  // --- NIKON APS-C (DX) ---
  {
    id: 'nikon-dx',
    name: 'Nikon APS-C / DX (Z50, Z30, Z fc, D7500, D500)',
    brand: 'Nikon',
    category: 'APS-C',
    sensorWidth: 23.5,
    sensorHeight: 15.7,
    cropFactor: 1.53,
    coc: 0.020,
    popularModels: ['Nikon Z50', 'Nikon Z30', 'Nikon Z fc', 'Nikon D7500', 'Nikon D500', 'Nikon D5600']
  },

  // --- FUJIFILM APS-C (X-SERIES) ---
  {
    id: 'fujifilm-x',
    name: 'Fujifilm X-Series APS-C (X-T5, X-T4, X100VI, X-H2, X-S20, X-T30 II)',
    brand: 'Fujifilm',
    category: 'APS-C',
    sensorWidth: 23.5,
    sensorHeight: 15.6,
    cropFactor: 1.53,
    coc: 0.020,
    popularModels: ['Fujifilm X100VI', 'Fujifilm X-T5', 'Fujifilm X-H2S', 'Fujifilm X-H2', 'Fujifilm X-S20', 'Fujifilm X-T4', 'Fujifilm X-T30 II', 'Fujifilm X100V']
  },
  // --- FUJIFILM MEDIUM FORMAT (GFX) ---
  {
    id: 'fujifilm-gfx',
    name: 'Fujifilm GFX Medium Format (GFX 100 II, GFX 100S II, GFX 50S II)',
    brand: 'Fujifilm',
    category: 'Medium Format',
    sensorWidth: 43.8,
    sensorHeight: 32.9,
    cropFactor: 0.79,
    coc: 0.038,
    popularModels: ['Fujifilm GFX 100 II', 'Fujifilm GFX 100S II', 'Fujifilm GFX 50S II', 'Fujifilm GFX 100S']
  },

  // --- MICRO FOUR THIRDS ---
  {
    id: 'mft-standard',
    name: 'Micro Four Thirds (OM-1, GH6, GH7, G9 II, BMPCC 4K, E-M1)',
    brand: 'Panasonic / OM',
    category: 'Micro Four Thirds',
    sensorWidth: 17.3,
    sensorHeight: 13.0,
    cropFactor: 2.0,
    coc: 0.015,
    popularModels: ['OM System OM-1 Mark II', 'Panasonic Lumix GH7', 'Panasonic Lumix GH6', 'Panasonic Lumix G9 II', 'Blackmagic Pocket Cinema Camera 4K', 'Olympus OM-D E-M1 Mark III']
  },

  // --- LEICA ---
  {
    id: 'leica-m',
    name: 'Leica Full Frame (M11, SL3, Q3, M10-R, SL2)',
    brand: 'Leica',
    category: 'Full Frame',
    sensorWidth: 36.0,
    sensorHeight: 24.0,
    cropFactor: 1.0,
    coc: 0.030,
    popularModels: ['Leica Q3', 'Leica M11', 'Leica M11-P', 'Leica SL3', 'Leica SL2', 'Leica M10']
  },
  {
    id: 'leica-s',
    name: 'Leica S Medium Format (Leica S3, S2)',
    brand: 'Leica',
    category: 'Medium Format',
    sensorWidth: 45.0,
    sensorHeight: 30.0,
    cropFactor: 0.80,
    coc: 0.040,
    popularModels: ['Leica S3', 'Leica S (Typ 007)']
  },

  // --- PANASONIC FULL FRAME (LUMIX S) ---
  {
    id: 'panasonic-s',
    name: 'Panasonic Lumix Full Frame (S5 II, S5 IIX, S1H, S1R, S9)',
    brand: 'Panasonic / OM',
    category: 'Full Frame',
    sensorWidth: 35.6,
    sensorHeight: 23.8,
    cropFactor: 1.0,
    coc: 0.030,
    popularModels: ['Panasonic Lumix S5 II', 'Panasonic Lumix S5 IIX', 'Panasonic Lumix S9', 'Panasonic Lumix S1H', 'Panasonic Lumix S1R']
  },

  // --- CINEMA CAMERAS ---
  {
    id: 'arri-super35',
    name: 'ARRI Super 35 (Alexa 35, Alexa Mini, Amira)',
    brand: 'Cinema (ARRI/RED/BMPCC)',
    category: 'Cinema',
    sensorWidth: 27.99,
    sensorHeight: 19.22,
    cropFactor: 1.30,
    coc: 0.021,
    popularModels: ['ARRI Alexa 35', 'ARRI Alexa Mini', 'ARRI Amira']
  },
  {
    id: 'arri-lf',
    name: 'ARRI Large Format (Alexa Mini LF, Alexa LF)',
    brand: 'Cinema (ARRI/RED/BMPCC)',
    category: 'Cinema',
    sensorWidth: 36.70,
    sensorHeight: 25.54,
    cropFactor: 0.98,
    coc: 0.031,
    popularModels: ['ARRI Alexa Mini LF', 'ARRI Alexa LF']
  },
  {
    id: 'red-v-raptor',
    name: 'RED V-Raptor 8K VV / Monstro Full Frame',
    brand: 'Cinema (ARRI/RED/BMPCC)',
    category: 'Cinema',
    sensorWidth: 40.96,
    sensorHeight: 21.60,
    cropFactor: 0.92,
    coc: 0.032,
    popularModels: ['RED V-Raptor 8K VV', 'RED Monstro 8K VV', 'RED Komodo-X (Super 35)']
  },
  {
    id: 'bmpcc-6k',
    name: 'Blackmagic Pocket Cinema Camera 6K / Cinema 6K Full Frame',
    brand: 'Cinema (ARRI/RED/BMPCC)',
    category: 'Cinema',
    sensorWidth: 36.0,
    sensorHeight: 24.0,
    cropFactor: 1.0,
    coc: 0.030,
    popularModels: ['Blackmagic Cinema Camera 6K', 'Blackmagic PYXIS 6K', 'Blackmagic Pocket Cinema Camera 6K Pro', 'Blackmagic URSA Mini Pro 12K']
  },
  {
    id: 'cinema-16mm',
    name: 'Standard 16mm & Super 16mm Film',
    brand: 'Cinema (ARRI/RED/BMPCC)',
    category: 'Cinema',
    sensorWidth: 12.52,
    sensorHeight: 7.41,
    cropFactor: 2.88,
    coc: 0.010,
    popularModels: ['Arriflex 16SR3', 'Bolex H16', 'Aaton XTR Prod', 'Digital Bolex D16']
  },
  {
    id: 'cinema-35mm-anamorphic',
    name: '35mm Film 4-Perf / Anamorphic 2x',
    brand: 'Cinema (ARRI/RED/BMPCC)',
    category: 'Cinema',
    sensorWidth: 21.95,
    sensorHeight: 18.6,
    cropFactor: 1.45,
    coc: 0.020,
    popularModels: ['Panavision Panaflex Millennium XL2', 'Arriflex 435', 'ARRI Alexa Studio']
  },

  // --- MEDIUM FORMAT TRADITIONAL ---
  {
    id: 'hasselblad-x2d',
    name: 'Hasselblad X2D 100C / 907X (44x33mm)',
    brand: 'Medium & Large Format',
    category: 'Medium Format',
    sensorWidth: 43.8,
    sensorHeight: 32.9,
    cropFactor: 0.79,
    coc: 0.038,
    popularModels: ['Hasselblad X2D 100C', 'Hasselblad 907X & CFV 100C', 'Hasselblad X1D II 50C']
  },
  {
    id: 'medium-format-645',
    name: 'Medium Format 6x4.5 Film (Mamiya 645, Pentax 645)',
    brand: 'Medium & Large Format',
    category: 'Medium Format',
    sensorWidth: 56.0,
    sensorHeight: 41.5,
    cropFactor: 0.62,
    coc: 0.045,
    popularModels: ['Mamiya 645 Pro TL', 'Pentax 645N II', 'Contax 645', 'Hasselblad H6D-100c']
  },
  {
    id: 'medium-format-6x6',
    name: 'Medium Format 6x6 Film (Hasselblad 500 C/M, Rolleiflex)',
    brand: 'Medium & Large Format',
    category: 'Medium Format',
    sensorWidth: 56.0,
    sensorHeight: 56.0,
    cropFactor: 0.55,
    coc: 0.050,
    popularModels: ['Hasselblad 500 C/M', 'Rolleiflex 2.8F', 'Yashica Mat-124G', 'Mamiya C330']
  },
  {
    id: 'medium-format-6x7',
    name: 'Medium Format 6x7 Film (Mamiya RB67 / RZ67, Pentax 67)',
    brand: 'Medium & Large Format',
    category: 'Medium Format',
    sensorWidth: 69.5,
    sensorHeight: 56.0,
    cropFactor: 0.48,
    coc: 0.060,
    popularModels: ['Mamiya RZ67 Pro II', 'Mamiya RB67 Pro SD', 'Pentax 67 II', 'Fuji GW690 III']
  },

  // --- LARGE FORMAT ---
  {
    id: 'large-format-4x5',
    name: 'Large Format 4x5 Sheet Film (Linhof, Toyo, Sinar, Intrepid)',
    brand: 'Medium & Large Format',
    category: 'Large Format',
    sensorWidth: 120.0,
    sensorHeight: 95.0,
    cropFactor: 0.28,
    coc: 0.100,
    popularModels: ['Linhof Master Technika 4x5', 'Toyo-View 45A II', 'Sinar P2 4x5', 'Intrepid 4x5 MK4', 'Chamonix 45F-2']
  },
  {
    id: 'large-format-8x10',
    name: 'Large Format 8x10 Sheet Film (Deardorff, Tachihara)',
    brand: 'Medium & Large Format',
    category: 'Large Format',
    sensorWidth: 240.0,
    sensorHeight: 190.0,
    cropFactor: 0.14,
    coc: 0.200,
    popularModels: ['Deardorff 8x10 V8', 'Toyo-View 810G', 'Chamonix 810V', 'Intrepid 8x10']
  },

  // --- SMARTPHONES & COMPACT ---
  {
    id: 'smartphone-1inch',
    name: '1-Inch Type Sensor (Sony RX100 VII, Xiaomi 13/14 Ultra, DJI Pocket 3)',
    brand: 'Smartphones & Mobile',
    category: 'Compact / Mobile',
    sensorWidth: 13.2,
    sensorHeight: 8.8,
    cropFactor: 2.72,
    coc: 0.011,
    popularModels: ['Sony RX100 VII', 'Sony ZV-1 II', 'DJI Osmo Pocket 3', 'Xiaomi 14 Ultra (Main)', 'Vivo X100 Ultra']
  },
  {
    id: 'smartphone-iphone-main',
    name: 'iPhone 15 Pro / 16 Pro Main Sensor (1/1.28")',
    brand: 'Smartphones & Mobile',
    category: 'Compact / Mobile',
    sensorWidth: 9.8,
    sensorHeight: 7.3,
    cropFactor: 3.5,
    coc: 0.008,
    popularModels: ['Apple iPhone 16 Pro Max', 'Apple iPhone 16 Pro', 'Apple iPhone 15 Pro Max', 'Apple iPhone 15 Pro', 'Apple iPhone 14 Pro']
  },
  {
    id: 'smartphone-standard-mobile',
    name: 'Standard Smartphone Sensor (1/2.55")',
    brand: 'Smartphones & Mobile',
    category: 'Compact / Mobile',
    sensorWidth: 5.76,
    sensorHeight: 4.29,
    cropFactor: 6.0,
    coc: 0.005,
    popularModels: ['Google Pixel 8a', 'Samsung Galaxy S24 (Wide)', 'iPhone 13', 'iPhone SE (3rd Gen)']
  },

  // --- SPECIALTY / INDUSTRIAL ---
  {
    id: 'custom-coc',
    name: 'Custom Sensor / Custom Circle of Confusion (CoC)',
    brand: 'Specialty',
    category: 'Specialty',
    sensorWidth: 36.0,
    sensorHeight: 24.0,
    cropFactor: 1.0,
    coc: 0.030,
    popularModels: ['Custom Optical Bench', 'Industrial Machine Vision Camera', 'Microscope C-Mount (1/2", 2/3")']
  }
];

export const STANDARD_APERTURES = [
  { value: 0.7, label: 'f/0.7' },
  { value: 0.95, label: 'f/0.95' },
  { value: 1.2, label: 'f/1.2' },
  { value: 1.4, label: 'f/1.4' },
  { value: 1.8, label: 'f/1.8' },
  { value: 2.0, label: 'f/2' },
  { value: 2.8, label: 'f/2.8' },
  { value: 4.0, label: 'f/4' },
  { value: 5.6, label: 'f/5.6' },
  { value: 8.0, label: 'f/8' },
  { value: 11.0, label: 'f/11' },
  { value: 16.0, label: 'f/16' },
  { value: 22.0, label: 'f/22' },
  { value: 32.0, label: 'f/32' },
  { value: 45.0, label: 'f/45' },
  { value: 64.0, label: 'f/64' },
  { value: 90.0, label: 'f/90' }
];

export const POPULAR_FOCAL_LENGTHS = [
  12, 14, 16, 20, 24, 28, 35, 50, 58, 85, 105, 135, 200, 300, 400, 600, 800
];
