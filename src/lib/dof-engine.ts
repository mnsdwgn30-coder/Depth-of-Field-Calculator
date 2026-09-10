/**
 * High-Precision Depth of Field & Optical Engine
 */

export interface DofInput {
  focalLength: number; // in mm (e.g., 50)
  aperture: number; // f-number (e.g., 2.8)
  subjectDistance: number; // in meters (e.g., 2.5)
  coc: number; // Circle of Confusion in mm (e.g., 0.030)
  sensorWidth?: number; // in mm (e.g., 36)
  sensorHeight?: number; // in mm (e.g., 24)
  cropFactor?: number; // (e.g., 1.0)
}

export interface DofResult {
  hyperfocalDistance: number; // in meters
  nearLimit: number; // in meters
  farLimit: number; // in meters, Infinity if beyond hyperfocal
  isFarLimitInfinity: boolean;
  totalDof: number; // in meters, Infinity if far limit is infinity
  dofInFront: number; // in meters
  dofBehind: number; // in meters, Infinity if far limit is infinity
  dofInFrontPercent: number; // e.g. 33.3%
  dofBehindPercent: number; // e.g. 66.7%
  magnification: number; // reproduction ratio (e.g., 0.02)
  effectiveAperture: number; // effective f-number accounting for close focus
  airyDiscDiameter: number; // in microns (diffraction limit at 550nm green light)
  isDiffractionLimited: boolean; // whether Airy disc > CoC
  fieldOfViewHorizontal: number; // degrees
  fieldOfViewVertical: number; // degrees
  fieldOfViewDiagonal: number; // degrees
  equivalentFocalLength35mm: number; // mm
  equivalentAperture35mm: number; // f-stop
}

export interface MacroInput {
  focalLength: number; // mm
  aperture: number; // f-stop
  magnification: number; // reproduction ratio e.g., 1.0 for 1:1, 0.5 for 1:2
  coc: number; // mm
}

export interface MacroResult {
  effectiveAperture: number; // N * (1 + m)
  workingDistance: number; // mm (distance from subject to front lens element approx)
  totalDofMm: number; // in millimeters
  totalDofMicrons: number; // in micrometers
  pupilMagnification: number; // assumption: 1.0 for symmetric lenses
}

export interface MicroscopeInput {
  numericalAperture: number; // NA e.g., 0.25 to 1.4
  magnification: number; // e.g. 10x, 40x, 100x
  wavelengthNm: number; // e.g. 550 nm (green light)
  refractiveIndex: number; // n (1.0 for air, 1.515 for oil immersion)
  sensorPixelPitchMicrons?: number; // e.g. 3.45 um for machine vision camera
}

export interface MicroscopeResult {
  waveOpticsDofMicrons: number; // diffraction-limited DOF
  geometricDofMicrons: number; // sensor pixel based depth
  totalDepthOfFocusMicrons: number; // total in micrometers
  lateralResolutionMicrons: number; // Abbe diffraction resolution limit
}

/**
 * Calculate Standard Depth of Field
 */
export function calculateDof(input: DofInput): DofResult {
  const f = Math.max(1, input.focalLength); // mm
  const N = Math.max(0.5, input.aperture); // f-number
  const c = Math.max(0.001, input.coc); // mm
  const sMeters = Math.max(0.01, input.subjectDistance); // meters
  const s = sMeters * 1000; // convert subject distance to mm

  // Hyperfocal distance: H = (f^2) / (N * c) + f  (in mm)
  const H_mm = (Math.pow(f, 2) / (N * c)) + f;
  const hyperfocalMeters = H_mm / 1000;

  // Near focus limit: Dn = (s * (H - f)) / (H + s - 2f)
  let near_mm = (s * (H_mm - f)) / (H_mm + (s - 2 * f));
  if (near_mm <= 0 || isNaN(near_mm)) {
    near_mm = f;
  }
  const nearLimitMeters = Math.min(sMeters, near_mm / 1000);

  // Far focus limit: Df = (s * (H - f)) / (H - s)
  let farLimitMeters: number;
  let isFarLimitInfinity = false;

  if (s >= (H_mm - f) || s >= H_mm) {
    // Focused at or beyond hyperfocal distance
    farLimitMeters = Infinity;
    isFarLimitInfinity = true;
  } else {
    const far_mm = (s * (H_mm - f)) / (H_mm - s);
    if (far_mm <= 0 || isNaN(far_mm) || far_mm > 10000000) {
      farLimitMeters = Infinity;
      isFarLimitInfinity = true;
    } else {
      farLimitMeters = far_mm / 1000;
    }
  }

  // Total DOF
  const totalDof = isFarLimitInfinity ? Infinity : (farLimitMeters - nearLimitMeters);
  const dofInFront = sMeters - nearLimitMeters;
  const dofBehind = isFarLimitInfinity ? Infinity : (farLimitMeters - sMeters);

  let dofInFrontPercent = 33.3;
  let dofBehindPercent = 66.7;

  if (!isFarLimitInfinity && totalDof > 0) {
    dofInFrontPercent = Math.min(100, Math.max(0, (dofInFront / totalDof) * 100));
    dofBehindPercent = 100 - dofInFrontPercent;
  } else if (isFarLimitInfinity) {
    dofInFrontPercent = 0;
    dofBehindPercent = 100;
  }

  // Magnification: m = f / (s - f)
  const magnification = s > f ? (f / (s - f)) : 1;
  const effectiveAperture = N * (1 + magnification);

  // Diffraction Airy Disc Diameter: d = 2.44 * lambda * N (with green light lambda = 0.55 microns)
  const airyDiscDiameter = 2.44 * 0.55 * N; // in microns
  const cocMicrons = c * 1000; // in microns
  const isDiffractionLimited = airyDiscDiameter > cocMicrons;

  // Field of view
  const sw = input.sensorWidth || 36;
  const sh = input.sensorHeight || 24;
  const diag = Math.sqrt(sw * sw + sh * sh);

  const fovH = 2 * Math.atan(sw / (2 * f)) * (180 / Math.PI);
  const fovV = 2 * Math.atan(sh / (2 * f)) * (180 / Math.PI);
  const fovD = 2 * Math.atan(diag / (2 * f)) * (180 / Math.PI);

  const crop = input.cropFactor || 1.0;
  const eqFocal = f * crop;
  const eqAperture = N * crop;

  return {
    hyperfocalDistance: hyperfocalMeters,
    nearLimit: nearLimitMeters,
    farLimit: farLimitMeters,
    isFarLimitInfinity,
    totalDof,
    dofInFront,
    dofBehind,
    dofInFrontPercent: Math.round(dofInFrontPercent * 10) / 10,
    dofBehindPercent: Math.round(dofBehindPercent * 10) / 10,
    magnification: Math.round(magnification * 1000) / 1000,
    effectiveAperture: Math.round(effectiveAperture * 10) / 10,
    airyDiscDiameter: Math.round(airyDiscDiameter * 100) / 100,
    isDiffractionLimited,
    fieldOfViewHorizontal: Math.round(fovH * 10) / 10,
    fieldOfViewVertical: Math.round(fovV * 10) / 10,
    fieldOfViewDiagonal: Math.round(fovD * 10) / 10,
    equivalentFocalLength35mm: Math.round(eqFocal * 10) / 10,
    equivalentAperture35mm: Math.round(eqAperture * 10) / 10
  };
}

/**
 * Calculate Bokeh Blur Circle Diameter on Sensor (in mm)
 * For a point source located at distance d (meters) when camera is focused at s (meters)
 */
export function calculateBlurCircle(
  focalLengthMm: number,
  aperture: number,
  focusDistanceMeters: number,
  pointDistanceMeters: number
): number {
  const f = focalLengthMm;
  const s = focusDistanceMeters * 1000;
  const d = pointDistanceMeters * 1000;
  const A = f / aperture; // Entrance pupil diameter in mm

  if (d <= 0 || s <= 0 || Math.abs(d - s) < 0.001) return 0;

  // Formula for blur circle diameter b on image sensor:
  // b = | A * (f / (s - f)) * ( (s - d) / d ) |
  const b = Math.abs(A * (f / (s - f)) * ((s - d) / d));
  return isNaN(b) ? 0 : b;
}

/**
 * Macro Depth of Field Calculator
 */
export function calculateMacroDof(input: MacroInput): MacroResult {
  const { focalLength: f, aperture: N, magnification: m, coc: c } = input;
  const effectiveAperture = N * (1 + m);

  // Total DOF in mm for macro photography (symmetric lens):
  // DOF = 2 * N * c * (m + 1) / (m^2)
  const totalDofMm = (2 * N * c * (m + 1)) / (m * m);
  const totalDofMicrons = totalDofMm * 1000;

  // Working distance approximation:
  // Subject to lens distance: s = f * (1 + 1/m)
  const workingDistance = f * (1 + (1 / Math.max(0.01, m)));

  return {
    effectiveAperture: Math.round(effectiveAperture * 100) / 100,
    workingDistance: Math.round(workingDistance * 10) / 10,
    totalDofMm: Math.round(totalDofMm * 1000) / 1000,
    totalDofMicrons: Math.round(totalDofMicrons * 10) / 10,
    pupilMagnification: 1.0
  };
}

/**
 * Microscope & Machine Vision Depth of Field Calculator
 */
export function calculateMicroscopeDof(input: MicroscopeInput): MicroscopeResult {
  const { numericalAperture: NA, magnification: M, wavelengthNm: lambdaNm, refractiveIndex: n } = input;
  const lambdaMicrons = lambdaNm / 1000; // e.g. 0.55 um
  const eMicrons = input.sensorPixelPitchMicrons || 3.45; // camera pixel pitch or visual CoC

  // 1. Wave optics (Diffraction limit depth of focus):
  // d_wave = (n * lambda) / (NA^2)
  const waveOpticsDofMicrons = (n * lambdaMicrons) / (NA * NA);

  // 2. Geometric optics depth of focus (sensor detector limit):
  // d_geom = (e * n) / (M * NA)
  const geometricDofMicrons = (eMicrons * n) / (M * NA);

  // Total Depth of Focus:
  const totalDepthOfFocusMicrons = waveOpticsDofMicrons + geometricDofMicrons;

  // Lateral resolution limit (Abbe limit): r = 0.61 * lambda / NA
  const lateralResolutionMicrons = (0.61 * lambdaMicrons) / NA;

  return {
    waveOpticsDofMicrons: Math.round(waveOpticsDofMicrons * 100) / 100,
    geometricDofMicrons: Math.round(geometricDofMicrons * 100) / 100,
    totalDepthOfFocusMicrons: Math.round(totalDepthOfFocusMicrons * 100) / 100,
    lateralResolutionMicrons: Math.round(lateralResolutionMicrons * 100) / 100
  };
}

/**
 * Unit Formatting Helpers
 */
export function formatDistance(meters: number, isImperial: boolean): string {
  if (meters === Infinity || isNaN(meters)) return 'Infinity (∞)';
  if (meters < 0) return '0';

  if (!isImperial) {
    if (meters < 0.01) {
      return `${(meters * 1000).toFixed(1)} mm`;
    }
    if (meters < 1) {
      return `${(meters * 100).toFixed(1)} cm`;
    }
    if (meters >= 1000) {
      return `${(meters / 1000).toFixed(2)} km`;
    }
    return `${meters.toFixed(2)} m`;
  } else {
    // Imperial (Feet & Inches)
    const totalInches = meters * 39.3701;
    if (totalInches < 12) {
      return `${totalInches.toFixed(1)} in`;
    }
    const feet = Math.floor(totalInches / 12);
    const inches = Math.round(totalInches % 12);
    if (inches === 0) {
      return `${feet} ft`;
    }
    return `${feet} ft ${inches} in (${(meters * 3.28084).toFixed(2)} ft)`;
  }
}
