import { CAMERA_DATABASE } from '../data/cameras';
import { SUPPORTED_LANGUAGES, TRANSLATIONS, type Language } from '../data/i18n';
import {
  calculateDof,
  calculateMacroDof,
  calculateMicroscopeDof,
  formatDistance,
  type DofResult
} from '../lib/dof-engine';

export function initApp() {
  // Global State
  const state = {
    isImperial: false,
    selectedCameraId: 'canon-full-frame',
    focalLength: 50,
    aperture: 2.8,
    subjectDistance: 2.5, // in meters
    teleconverter: 1.0,
    customCoc: 0.030,
    customWidth: 36.0,
    customHeight: 24.0,
    useCustomCoc: false
  };

  // --- DOM Elements ---
  const cameraSelect = document.getElementById('camera-select') as HTMLSelectElement | null;
  const brandPills = document.querySelectorAll('.brand-pill');
  const sensorSpecsDisplay = document.getElementById('sensor-specs-display');

  const customCocInput = document.getElementById('custom-coc-input') as HTMLInputElement | null;
  const customSwInput = document.getElementById('custom-sw-input') as HTMLInputElement | null;
  const customShInput = document.getElementById('custom-sh-input') as HTMLInputElement | null;

  const focalNum = document.getElementById('focal-length-num') as HTMLInputElement | null;
  const focalSlider = document.getElementById('focal-length-slider') as HTMLInputElement | null;
  const focalPills = document.querySelectorAll('.focal-pill');
  const tcBtns = document.querySelectorAll('.tc-btn');

  const apertureNum = document.getElementById('aperture-num') as HTMLInputElement | null;
  const apertureSlider = document.getElementById('aperture-slider') as HTMLInputElement | null;
  const apertureBtns = document.querySelectorAll('.aperture-btn');

  const distNum = document.getElementById('distance-num') as HTMLInputElement | null;
  const distSlider = document.getElementById('distance-slider') as HTMLInputElement | null;
  const distPills = document.querySelectorAll('.dist-pill');
  const distUnitLabel = document.getElementById('distance-unit-label');

  // Results DOM
  const resTotalDof = document.getElementById('res-total-dof');
  const resTotalDofSub = document.getElementById('res-total-dof-sub');
  const resNearLimit = document.getElementById('res-near-limit');
  const resFarLimit = document.getElementById('res-far-limit');
  const resHyperfocal = document.getElementById('res-hyperfocal');
  const resFov = document.getElementById('res-fov');
  const resFovSub = document.getElementById('res-fov-sub');
  const resMagnification = document.getElementById('res-magnification');
  const resEffAperture = document.getElementById('res-eff-aperture');
  const resAiryDisc = document.getElementById('res-airy-disc');

  const resFrontPct = document.getElementById('res-front-pct');
  const resFrontDist = document.getElementById('res-front-dist');
  const resRearPct = document.getElementById('res-rear-pct');
  const resRearDist = document.getElementById('res-rear-dist');
  const distBarFront = document.getElementById('dist-bar-front');
  const distBarRear = document.getElementById('dist-bar-rear');

  // Optical Diagram SVG Elements
  const diagSummaryVal = document.getElementById('diag-summary-val');
  const svgLightCone = document.getElementById('svg-light-cone');
  const svgDofZone = document.getElementById('svg-dof-zone');
  const svgNearGroup = document.getElementById('svg-near-group');
  const svgSubjectGroup = document.getElementById('svg-subject-group');
  const svgFarGroup = document.getElementById('svg-far-group');
  const svgHyperGroup = document.getElementById('svg-hyper-group');
  const svgNearLabel = document.getElementById('svg-near-label');
  const svgSubjectLabel = document.getElementById('svg-subject-label');
  const svgFarLabel = document.getElementById('svg-far-label');
  const svgHyperLabel = document.getElementById('svg-hyper-label');
  const svgIrisTop = document.getElementById('svg-iris-top');
  const svgIrisBot = document.getElementById('svg-iris-bot');

  // Helper to get current active sensor
  function getActiveSensor() {
    const cam = CAMERA_DATABASE.find(c => c.id === state.selectedCameraId) || CAMERA_DATABASE[0];
    if (state.useCustomCoc) {
      return {
        ...cam,
        coc: state.customCoc,
        sensorWidth: state.customWidth,
        sensorHeight: state.customHeight,
        cropFactor: Math.round((43.27 / Math.sqrt(state.customWidth * state.customWidth + state.customHeight * state.customHeight)) * 100) / 100
      };
    }
    return cam;
  }

  // --- Main Update Function ---
  function updateAll() {
    const sensor = getActiveSensor();
    const effectiveFocal = state.focalLength * state.teleconverter;
    const effectiveAperture = state.aperture * state.teleconverter;

    // Calculate DOF
    const dofResult: DofResult = calculateDof({
      focalLength: effectiveFocal,
      aperture: effectiveAperture,
      subjectDistance: state.subjectDistance,
      coc: sensor.coc,
      sensorWidth: sensor.sensorWidth,
      sensorHeight: sensor.sensorHeight,
      cropFactor: sensor.cropFactor
    });

    // Update HUD Metrics
    renderHudMetrics(dofResult, sensor);

    // Update SVG Optical Diagram
    renderOpticalDiagram(dofResult);
  }

  function renderHudMetrics(res: DofResult, sensor: any) {
    const effectiveFocal = state.focalLength * state.teleconverter;
    const effectiveAperture = state.aperture * state.teleconverter;

    // Populate Classic DOFMaster Table
    const tableSubject = document.getElementById('table-val-subject');
    const tableNear = document.getElementById('table-val-near');
    const tableFar = document.getElementById('table-val-far');
    const tableTotal = document.getElementById('table-val-total');
    const tableFront = document.getElementById('table-val-front');
    const tableRear = document.getElementById('table-val-rear');
    const tableHyper = document.getElementById('table-val-hyper');
    const tableCoc = document.getElementById('table-val-coc');
    const tableFov = document.getElementById('table-val-fov');
    const tableEquiv = document.getElementById('table-val-equiv');

    if (tableSubject) tableSubject.textContent = formatDistance(state.subjectDistance, state.isImperial);
    if (tableNear) tableNear.textContent = formatDistance(res.nearLimit, state.isImperial);
    if (tableFar) tableFar.textContent = res.isFarLimitInfinity ? 'Infinity (∞)' : formatDistance(res.farLimit, state.isImperial);
    if (tableTotal) tableTotal.textContent = res.isFarLimitInfinity ? 'Infinity (∞)' : formatDistance(res.totalDof, state.isImperial);
    if (tableFront) tableFront.textContent = `${formatDistance(res.dofInFront, state.isImperial)} (${res.dofInFrontPercent}%)`;
    if (tableRear) tableRear.textContent = res.isFarLimitInfinity ? 'Infinity (∞)' : `${formatDistance(res.dofBehind, state.isImperial)} (${res.dofBehindPercent}%)`;
    if (tableHyper) tableHyper.textContent = formatDistance(res.hyperfocalDistance, state.isImperial);
    if (tableCoc) tableCoc.textContent = `${sensor.coc.toFixed(3)} mm`;
    if (tableFov) tableFov.textContent = `${res.fieldOfViewDiagonal}° (H: ${res.fieldOfViewHorizontal}°)`;
    if (tableEquiv) tableEquiv.textContent = `${res.equivalentFocalLength35mm}mm @ f/${res.equivalentAperture35mm}`;

    // Update Physical Lens Barrel Markings
    const lensBadge = document.getElementById('lens-barrel-focal-badge');
    const lensSubjectTick = document.getElementById('scale-subject-tick');
    const barrelActiveAp = document.getElementById('barrel-active-ap');
    const lensNearMark = document.getElementById('lens-near-mark');
    const lensFocusMark = document.getElementById('lens-focus-mark');
    const lensFarMark = document.getElementById('lens-far-mark');

    if (lensBadge) lensBadge.textContent = `${effectiveFocal}mm Lens`;
    if (lensSubjectTick) lensSubjectTick.textContent = state.isImperial ? (state.subjectDistance * 3.28084).toFixed(1) : state.subjectDistance.toFixed(1);
    if (barrelActiveAp) barrelActiveAp.textContent = `${effectiveAperture}`;
    if (lensNearMark) lensNearMark.textContent = formatDistance(res.nearLimit, state.isImperial);
    if (lensFocusMark) lensFocusMark.textContent = formatDistance(state.subjectDistance, state.isImperial);
    if (lensFarMark) lensFarMark.textContent = res.isFarLimitInfinity ? '∞' : formatDistance(res.farLimit, state.isImperial);

    // Distribution Bar
    if (resFrontPct && resRearPct && distBarFront && distBarRear) {
      if (res.isFarLimitInfinity) {
        resFrontPct.textContent = `0% In Front`;
        resRearPct.textContent = `100% Behind`;
        distBarFront.style.width = `20%`;
        distBarRear.style.width = `80%`;
      } else {
        resFrontPct.textContent = `${res.dofInFrontPercent}% In Front`;
        resRearPct.textContent = `${res.dofBehindPercent}% Behind`;
        distBarFront.style.width = `${res.dofInFrontPercent}%`;
        distBarRear.style.width = `${res.dofBehindPercent}%`;
      }
    }

    // Sensor specs display
    if (sensorSpecsDisplay) {
      sensorSpecsDisplay.innerHTML = `<span>Sensor: ${sensor.sensorWidth} × ${sensor.sensorHeight} mm</span> • <span>Crop: ${sensor.cropFactor}x</span> • <span>CoC: ${sensor.coc} mm</span>`;
    }
  }

  function renderOpticalDiagram(res: DofResult) {
    if (!diagSummaryVal || !svgDofZone) return;

    diagSummaryVal.textContent = res.isFarLimitInfinity ? '∞ (Infinity)' : formatDistance(res.totalDof, state.isImperial);

    // Dynamic Diagram Scaling: Mapping distance range 0 to maxDistance (in meters) into SVG coordinates (100 to 860)
    const svgMinX = 110;
    const svgMaxX = 860;
    const availableWidth = svgMaxX - svgMinX;

    // Determine scale ceiling (e.g., 1.5 * max(subjectDistance, hyperfocal, farLimit))
    const refFar = res.isFarLimitInfinity ? Math.min(state.subjectDistance * 3.5, 40) : res.farLimit;
    const maxMeters = Math.max(state.subjectDistance * 1.8, Math.min(res.hyperfocalDistance * 1.2, 50), refFar * 1.3);

    function metersToSvgX(m: number): number {
      const clamped = Math.min(m, maxMeters);
      const ratio = clamped / maxMeters;
      return svgMinX + ratio * availableWidth;
    }

    const subjectX = metersToSvgX(state.subjectDistance);
    const nearX = Math.max(svgMinX + 15, metersToSvgX(res.nearLimit));
    const farX = res.isFarLimitInfinity ? svgMaxX : Math.min(svgMaxX, metersToSvgX(res.farLimit));
    const hyperX = Math.min(svgMaxX - 10, metersToSvgX(res.hyperfocalDistance));

    // Update Subject
    if (svgSubjectGroup && svgSubjectLabel) {
      svgSubjectGroup.setAttribute('transform', `translate(${subjectX}, 0)`);
      svgSubjectLabel.textContent = `🎯 SUBJECT: ${formatDistance(state.subjectDistance, state.isImperial)}`;
    }

    // Update Near Limit
    if (svgNearGroup && svgNearLabel) {
      svgNearGroup.setAttribute('transform', `translate(${nearX}, 0)`);
      svgNearLabel.textContent = `NEAR: ${formatDistance(res.nearLimit, state.isImperial)}`;
    }

    // Update Far Limit
    if (svgFarGroup && svgFarLabel) {
      svgFarGroup.setAttribute('transform', `translate(${farX}, 0)`);
      svgFarLabel.textContent = res.isFarLimitInfinity ? `FAR: ∞ (Infinity)` : `FAR: ${formatDistance(res.farLimit, state.isImperial)}`;
    }

    // Update Hyperfocal Mark
    if (svgHyperGroup && svgHyperLabel) {
      svgHyperGroup.setAttribute('transform', `translate(${hyperX}, 0)`);
      svgHyperLabel.textContent = `⚡ HYPERFOCAL: ${formatDistance(res.hyperfocalDistance, state.isImperial)}`;
    }

    // Update In-Focus Green/Cyan Zone Rect
    const dofWidth = Math.max(6, farX - nearX);
    svgDofZone.setAttribute('x', `${nearX}`);
    svgDofZone.setAttribute('width', `${dofWidth}`);

    if (res.isFarLimitInfinity) {
      svgDofZone.setAttribute('fill', 'url(#infinityFade)');
    } else {
      svgDofZone.setAttribute('fill', 'url(#dofZoneGradient)');
    }

    // Aperture iris opening visual
    const irisGap = Math.max(4, Math.min(22, 26 - state.aperture * 1.5));
    if (svgIrisTop && svgIrisBot) {
      svgIrisTop.setAttribute('y2', `${50 - irisGap / 2}`);
      svgIrisBot.setAttribute('y1', `${50 + irisGap / 2}`);
    }

    // Update light cone polygon
    if (svgLightCone) {
      const coneAngle = Math.max(25, Math.min(85, 95 - state.aperture * 3.5));
      svgLightCone.setAttribute('points', `100,140 850,${140 - coneAngle} 850,${140 + coneAngle}`);
    }
  }

  // --- Comparison Mode Logic ---
  function updateComparison() {
    const camAId = (document.getElementById('cmp-cam-a') as HTMLSelectElement)?.value || 'canon-full-frame';
    const focalA = parseFloat((document.getElementById('cmp-focal-a') as HTMLInputElement)?.value || '50');
    const apA = parseFloat((document.getElementById('cmp-aperture-a') as HTMLInputElement)?.value || '1.8');
    const distA = parseFloat((document.getElementById('cmp-dist-a') as HTMLInputElement)?.value || '2.5');

    const camBId = (document.getElementById('cmp-cam-b') as HTMLSelectElement)?.value || 'fujifilm-x';
    const focalB = parseFloat((document.getElementById('cmp-focal-b') as HTMLInputElement)?.value || '33');
    const apB = parseFloat((document.getElementById('cmp-aperture-b') as HTMLInputElement)?.value || '1.4');
    const distB = parseFloat((document.getElementById('cmp-dist-b') as HTMLInputElement)?.value || '2.5');

    const camA = CAMERA_DATABASE.find(c => c.id === camAId) || CAMERA_DATABASE[0];
    const camB = CAMERA_DATABASE.find(c => c.id === camBId) || CAMERA_DATABASE[0];

    const resA = calculateDof({ focalLength: focalA, aperture: apA, subjectDistance: distA, coc: camA.coc, sensorWidth: camA.sensorWidth, sensorHeight: camA.sensorHeight });
    const resB = calculateDof({ focalLength: focalB, aperture: apB, subjectDistance: distB, coc: camB.coc, sensorWidth: camB.sensorWidth, sensorHeight: camB.sensorHeight });

    const dofAEl = document.getElementById('cmp-res-dof-a');
    const limitsAEl = document.getElementById('cmp-res-limits-a');
    const hyperAEl = document.getElementById('cmp-res-hyper-a');
    const fovAEl = document.getElementById('cmp-res-fov-a');

    const dofBEl = document.getElementById('cmp-res-dof-b');
    const limitsBEl = document.getElementById('cmp-res-limits-b');
    const hyperBEl = document.getElementById('cmp-res-hyper-b');
    const fovBEl = document.getElementById('cmp-res-fov-b');

    if (dofAEl) dofAEl.textContent = formatDistance(resA.totalDof, state.isImperial);
    if (limitsAEl) limitsAEl.textContent = `${formatDistance(resA.nearLimit, state.isImperial)} — ${resA.isFarLimitInfinity ? '∞' : formatDistance(resA.farLimit, state.isImperial)}`;
    if (hyperAEl) hyperAEl.textContent = formatDistance(resA.hyperfocalDistance, state.isImperial);
    if (fovAEl) fovAEl.textContent = `${resA.fieldOfViewDiagonal}°`;

    if (dofBEl) dofBEl.textContent = formatDistance(resB.totalDof, state.isImperial);
    if (limitsBEl) limitsBEl.textContent = `${formatDistance(resB.nearLimit, state.isImperial)} — ${resB.isFarLimitInfinity ? '∞' : formatDistance(resB.farLimit, state.isImperial)}`;
    if (hyperBEl) hyperBEl.textContent = formatDistance(resB.hyperfocalDistance, state.isImperial);
    if (fovBEl) fovBEl.textContent = `${resB.fieldOfViewDiagonal}°`;

    // Verdict summary
    const verdictTitle = document.getElementById('cmp-verdict-title');
    const verdictDesc = document.getElementById('cmp-verdict-desc');

    if (verdictTitle && verdictDesc) {
      if (!resA.isFarLimitInfinity && !resB.isFarLimitInfinity) {
        const diff = Math.abs(resA.totalDof - resB.totalDof);
        const shallower = resA.totalDof < resB.totalDof ? 'Setup A' : 'Setup B';
        const pct = Math.round((diff / Math.max(resA.totalDof, resB.totalDof)) * 100);
        verdictTitle.textContent = `${shallower} produces ${pct}% shallower Depth of Field (more background blur)`;
      } else {
        verdictTitle.textContent = `One or both setups are focused near or beyond hyperfocal distance`;
      }
      const cropRatio = camB.cropFactor / camA.cropFactor;
      const eqFocal = Math.round(focalA * (1 / cropRatio));
      const eqAp = (apA * (1 / cropRatio)).toFixed(1);
      verdictDesc.innerHTML = `To match Setup A (${focalA}mm f/${apA}) on Setup B, use an equivalent <strong>${eqFocal}mm f/${eqAp}</strong> lens.`;
    }
  }

  // --- Specialized Calculators (Macro, Cinema, Microscope) ---
  function updateSpecialized() {
    // 1. Macro
    const macroMag = parseFloat((document.getElementById('macro-mag-slider') as HTMLInputElement)?.value || '1.0');
    const macroFocal = parseFloat((document.getElementById('macro-focal') as HTMLInputElement)?.value || '100');
    const macroAp = parseFloat((document.getElementById('macro-aperture') as HTMLInputElement)?.value || '8.0');
    const macroCoc = parseFloat((document.getElementById('macro-coc-select') as HTMLSelectElement)?.value || '0.030');

    const mRes = calculateMacroDof({ focalLength: macroFocal, aperture: macroAp, magnification: macroMag, coc: macroCoc });
    const macroResDof = document.getElementById('macro-res-dof');
    const macroResMicrons = document.getElementById('macro-res-microns');
    const macroResEffF = document.getElementById('macro-res-eff-f');
    const macroResWd = document.getElementById('macro-res-wd');
    const macroResStacking = document.getElementById('macro-res-stacking');

    if (macroResDof) macroResDof.textContent = `${mRes.totalDofMm} mm`;
    if (macroResMicrons) macroResMicrons.textContent = `${mRes.totalDofMicrons} micrometers (µm)`;
    if (macroResEffF) macroResEffF.textContent = `f / ${mRes.effectiveAperture} (${(Math.log2(mRes.effectiveAperture / macroAp) * 2).toFixed(1)} Stop Light Loss)`;
    if (macroResWd) macroResWd.textContent = `${mRes.workingDistance} mm (${(mRes.workingDistance / 10).toFixed(1)} cm)`;
    if (macroResStacking) macroResStacking.textContent = `Step Size ~ ${(mRes.totalDofMm * 0.6).toFixed(2)} mm`;

    // 2. Cinema
    const cinemaSensorId = (document.getElementById('cinema-sensor-select') as HTMLSelectElement)?.value || 'arri-super35';
    const cinemaFocal = parseFloat((document.getElementById('cinema-focal') as HTMLInputElement)?.value || '35');
    const cinemaTstop = parseFloat((document.getElementById('cinema-tstop') as HTMLInputElement)?.value || '2.0');
    const cinemaDist = parseFloat((document.getElementById('cinema-dist') as HTMLInputElement)?.value || '3.0');

    const cCam = CAMERA_DATABASE.find(c => c.id === cinemaSensorId) || CAMERA_DATABASE[0];
    const cRes = calculateDof({ focalLength: cinemaFocal, aperture: cinemaTstop, subjectDistance: cinemaDist, coc: cCam.coc, sensorWidth: cCam.sensorWidth, sensorHeight: cCam.sensorHeight });

    const cRange = document.getElementById('cinema-res-range');
    const cTotal = document.getElementById('cinema-res-total');
    const cHyper = document.getElementById('cinema-res-hyper');
    const cHaov = document.getElementById('cinema-res-haov');
    const cTolerance = document.getElementById('cinema-res-tolerance');

    if (cRange) cRange.textContent = `${formatDistance(cRes.nearLimit, state.isImperial)} — ${cRes.isFarLimitInfinity ? '∞' : formatDistance(cRes.farLimit, state.isImperial)}`;
    if (cTotal) cTotal.textContent = `Total Depth: ${formatDistance(cRes.totalDof, state.isImperial)}`;
    if (cHyper) cHyper.textContent = formatDistance(cRes.hyperfocalDistance, state.isImperial);
    if (cHaov) cHaov.textContent = `${cRes.fieldOfViewHorizontal}°`;
    if (cTolerance) cTolerance.textContent = `± ${(cRes.totalDof / 2 * 100).toFixed(1)} cm`;

    // 3. Microscope
    const microNa = parseFloat((document.getElementById('micro-na') as HTMLInputElement)?.value || '0.40');
    const microMag = parseFloat((document.getElementById('micro-mag') as HTMLInputElement)?.value || '20');
    const microLambda = parseFloat((document.getElementById('micro-lambda') as HTMLInputElement)?.value || '550');
    const microN = parseFloat((document.getElementById('micro-n-select') as HTMLSelectElement)?.value || '1.0');
    const microPixel = parseFloat((document.getElementById('micro-pixel') as HTMLInputElement)?.value || '3.45');

    const micRes = calculateMicroscopeDof({ numericalAperture: microNa, magnification: microMag, wavelengthNm: microLambda, refractiveIndex: microN, sensorPixelPitchMicrons: microPixel });

    const microResTotal = document.getElementById('micro-res-total');
    const microResBreakdown = document.getElementById('micro-res-breakdown');
    const microResResolution = document.getElementById('micro-res-resolution');
    const microResZstep = document.getElementById('micro-res-zstep');

    if (microResTotal) microResTotal.textContent = `${micRes.totalDepthOfFocusMicrons} µm`;
    if (microResBreakdown) microResBreakdown.textContent = `Wave: ${micRes.waveOpticsDofMicrons} µm | Geometric: ${micRes.geometricDofMicrons} µm`;
    if (microResResolution) microResResolution.textContent = `${micRes.lateralResolutionMicrons} µm`;
    if (microResZstep) microResZstep.textContent = `${(micRes.totalDepthOfFocusMicrons / 2).toFixed(2)} µm (Nyquist)`;
  }

  // --- Hyperfocal Matrix Table Updater ---
  function updateHyperfocalTable() {
    const tableCamSelect = document.getElementById('table-camera-select') as HTMLSelectElement | null;
    if (!tableCamSelect) return;

    const camId = tableCamSelect.value;
    const cam = CAMERA_DATABASE.find(c => c.id === camId) || CAMERA_DATABASE[0];
    const coc = cam.coc;

    const cells = document.querySelectorAll('#matrix-table td[data-focal]');
    cells.forEach(td => {
      const f = parseFloat(td.getAttribute('data-focal') || '50');
      const ap = parseFloat(td.getAttribute('data-aperture') || '2.8');
      const hMeters = ((f * f) / (ap * coc) + f) / 1000;
      td.textContent = formatDistance(hMeters, state.isImperial);
    });
  }

  // --- Event Listeners Setup ---

  // Camera selection & brand filter
  cameraSelect?.addEventListener('change', (e) => {
    state.selectedCameraId = (e.target as HTMLSelectElement).value;
    state.useCustomCoc = state.selectedCameraId === 'custom-coc';
    updateAll();
  });

  brandPills.forEach(pill => {
    pill.addEventListener('click', () => {
      brandPills.forEach(p => p.classList.remove('active'));
      pill.classList.add('active');
      const brand = pill.getAttribute('data-brand');

      if (cameraSelect) {
        Array.from(cameraSelect.options).forEach(opt => {
          if (brand === 'all' || opt.getAttribute('data-brand') === brand) {
            opt.style.display = '';
          } else {
            opt.style.display = 'none';
          }
        });
        // Select first visible option
        const firstVisible = Array.from(cameraSelect.options).find(opt => opt.style.display !== 'none');
        if (firstVisible) {
          cameraSelect.value = firstVisible.value;
          state.selectedCameraId = firstVisible.value;
          state.useCustomCoc = state.selectedCameraId === 'custom-coc';
          updateAll();
        }
      }
    });
  });

  // Custom CoC & Sensor size
  customCocInput?.addEventListener('input', () => {
    state.customCoc = parseFloat(customCocInput.value) || 0.030;
    state.useCustomCoc = true;
    updateAll();
  });

  customSwInput?.addEventListener('input', () => {
    state.customWidth = parseFloat(customSwInput.value) || 36.0;
    state.useCustomCoc = true;
    updateAll();
  });

  customShInput?.addEventListener('input', () => {
    state.customHeight = parseFloat(customShInput.value) || 24.0;
    state.useCustomCoc = true;
    updateAll();
  });

  // Focal length sync
  focalNum?.addEventListener('input', () => {
    const val = parseFloat(focalNum.value) || 50;
    state.focalLength = val;
    if (focalSlider) focalSlider.value = `${Math.min(600, val)}`;
    updateFocalPills(val);
    updateAll();
  });

  focalSlider?.addEventListener('input', () => {
    const val = parseFloat(focalSlider.value) || 50;
    state.focalLength = val;
    if (focalNum) focalNum.value = `${val}`;
    updateFocalPills(val);
    updateAll();
  });

  focalPills.forEach(pill => {
    pill.addEventListener('click', () => {
      const f = parseFloat(pill.getAttribute('data-focal') || '50');
      state.focalLength = f;
      if (focalNum) focalNum.value = `${f}`;
      if (focalSlider) focalSlider.value = `${f}`;
      updateFocalPills(f);
      updateAll();
    });
  });

  function updateFocalPills(f: number) {
    focalPills.forEach(p => {
      if (parseFloat(p.getAttribute('data-focal') || '0') === f) p.classList.add('active');
      else p.classList.remove('active');
    });
  }

  // Teleconverter
  tcBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      tcBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      state.teleconverter = parseFloat(btn.getAttribute('data-tc') || '1.0');
      updateAll();
    });
  });

  // Aperture sync
  apertureNum?.addEventListener('input', () => {
    const val = parseFloat(apertureNum.value) || 2.8;
    state.aperture = val;
    if (apertureSlider) apertureSlider.value = `${Math.min(64, val)}`;
    updateApertureBtns(val);
    updateAll();
  });

  apertureSlider?.addEventListener('input', () => {
    const val = parseFloat(apertureSlider.value) || 2.8;
    state.aperture = val;
    if (apertureNum) apertureNum.value = `${val}`;
    updateApertureBtns(val);
    updateAll();
  });

  apertureBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const ap = parseFloat(btn.getAttribute('data-aperture') || '2.8');
      state.aperture = ap;
      if (apertureNum) apertureNum.value = `${ap}`;
      if (apertureSlider) apertureSlider.value = `${ap}`;
      updateApertureBtns(ap);
      updateAll();
    });
  });

  function updateApertureBtns(ap: number) {
    apertureBtns.forEach(b => {
      if (parseFloat(b.getAttribute('data-aperture') || '0') === ap) b.classList.add('active');
      else b.classList.remove('active');
    });
  }

  // Distance sync
  distNum?.addEventListener('input', () => {
    const rawVal = parseFloat(distNum.value) || 2.5;
    const m = state.isImperial ? rawVal / 3.28084 : rawVal;
    state.subjectDistance = m;
    if (distSlider) distSlider.value = `${Math.min(25, m)}`;
    updateAll();
  });

  distSlider?.addEventListener('input', () => {
    const m = parseFloat(distSlider.value) || 2.5;
    state.subjectDistance = m;
    if (distNum) distNum.value = state.isImperial ? (m * 3.28084).toFixed(2) : m.toFixed(2);
    updateAll();
  });

  distPills.forEach(pill => {
    pill.addEventListener('click', () => {
      distPills.forEach(p => p.classList.remove('active'));
      pill.classList.add('active');
      const m = parseFloat(pill.getAttribute('data-dist') || '2.5');
      state.subjectDistance = m;
      if (distNum) distNum.value = state.isImperial ? (m * 3.28084).toFixed(2) : m.toFixed(2);
      if (distSlider) distSlider.value = `${m}`;
      updateAll();
    });
  });

  // Global Unit Toggle (Header Buttons & DOFMaster Radio Buttons)
  const unitToggleBtns = document.querySelectorAll('#global-unit-toggle .unit-btn');
  const unitRadios = document.querySelectorAll('input[name="dof-units"]');

  function setImperial(isImp: boolean) {
    state.isImperial = isImp;
    unitToggleBtns.forEach(b => {
      if ((b.getAttribute('data-unit') === 'imperial') === isImp) b.classList.add('active');
      else b.classList.remove('active');
    });
    unitRadios.forEach(r => {
      const radio = r as HTMLInputElement;
      if (radio.value === (isImp ? 'imperial' : 'metric')) radio.checked = true;
    });

    if (distUnitLabel) distUnitLabel.textContent = isImp ? 'ft' : 'm';
    if (distNum) distNum.value = isImp ? (state.subjectDistance * 3.28084).toFixed(2) : state.subjectDistance.toFixed(2);

    updateAll();
    updateComparison();
    updateSpecialized();
    updateHyperfocalTable();
  }

  unitToggleBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      setImperial(btn.getAttribute('data-unit') === 'imperial');
    });
  });

  unitRadios.forEach(r => {
    r.addEventListener('change', (e) => {
      setImperial((e.target as HTMLInputElement).value === 'imperial');
    });
  });

  // Calculate Button
  document.getElementById('dofmaster-calc-btn')?.addEventListener('click', () => {
    updateAll();
  });

  // Sub-tabs in Specialized section
  const specTabBtns = document.querySelectorAll('#spec-tabs .sub-tab-btn');
  const subPanels = document.querySelectorAll('.sub-content-panel');
  specTabBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      specTabBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      const panelId = btn.getAttribute('data-subtab');
      subPanels.forEach(p => {
        if (p.id === panelId) p.classList.add('active');
        else p.classList.remove('active');
      });
    });
  });

  // Comparison Listeners
  ['cmp-cam-a', 'cmp-focal-a', 'cmp-aperture-a', 'cmp-dist-a', 'cmp-cam-b', 'cmp-focal-b', 'cmp-aperture-b', 'cmp-dist-b'].forEach(id => {
    document.getElementById(id)?.addEventListener('input', updateComparison);
    document.getElementById(id)?.addEventListener('change', updateComparison);
  });

  // Specialized Listeners
  ['macro-mag-slider', 'macro-focal', 'macro-aperture', 'macro-coc-select', 'cinema-sensor-select', 'cinema-focal', 'cinema-tstop', 'cinema-dist', 'micro-na', 'micro-mag', 'micro-lambda', 'micro-n-select', 'micro-pixel'].forEach(id => {
    document.getElementById(id)?.addEventListener('input', updateSpecialized);
    document.getElementById(id)?.addEventListener('change', updateSpecialized);
  });

  const magBtns = document.querySelectorAll('.mag-btn');
  magBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      magBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      const mag = parseFloat(btn.getAttribute('data-mag') || '1.0');
      const slider = document.getElementById('macro-mag-slider') as HTMLInputElement | null;
      if (slider) slider.value = `${mag}`;
      updateSpecialized();
    });
  });

  // Hyperfocal Table camera selector
  document.getElementById('table-camera-select')?.addEventListener('change', updateHyperfocalTable);

  // Print Table
  document.getElementById('btn-print-table')?.addEventListener('click', () => {
    window.print();
  });

  // Export CSV
  document.getElementById('btn-export-csv')?.addEventListener('click', () => {
    const table = document.getElementById('matrix-table') as HTMLTableElement | null;
    if (!table) return;
    let csv = '';
    for (let r = 0; r < table.rows.length; r++) {
      const row = table.rows[r];
      const rowData = [];
      for (let c = 0; c < row.cells.length; c++) {
        rowData.push(`"${row.cells[c].innerText.replace(/"/g, '""')}"`);
      }
      csv += rowData.join(',') + '\r\n';
    }
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.setAttribute('download', 'hyperfocal_cheat_sheet.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  });

  // --- Theme Management (Dark & Light Mode) ---
  function getPreferredTheme(): 'dark' | 'light' {
    const savedTheme = localStorage.getItem('dof-theme');
    if (savedTheme === 'light' || savedTheme === 'dark') return savedTheme;
    return window.matchMedia && window.matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark';
  }

  function applyTheme(theme: 'dark' | 'light') {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('dof-theme', theme);
  }

  // Initialize theme
  applyTheme(getPreferredTheme());

  const themeToggleBtn = document.getElementById('theme-toggle-btn');
  themeToggleBtn?.addEventListener('click', () => {
    const currentTheme = document.documentElement.getAttribute('data-theme') === 'light' ? 'light' : 'dark';
    const nextTheme = currentTheme === 'light' ? 'dark' : 'light';
    applyTheme(nextTheme);
  });

  // --- Multi-Language Management (Top Countries) ---
  let currentLang: Language = (localStorage.getItem('dof-lang') as Language) || 'en';
  if (!TRANSLATIONS[currentLang]) currentLang = 'en';

  const langMenuBtn = document.getElementById('lang-menu-btn');
  const langDropdownMenu = document.getElementById('lang-dropdown-menu');
  const langFlagEl = document.getElementById('lang-current-flag');
  const langLabelEl = document.getElementById('lang-current-label');
  const langOptionBtns = document.querySelectorAll('.lang-option-btn');

  function applyLanguage(lang: Language) {
    currentLang = lang;
    localStorage.setItem('dof-lang', lang);
    const langMeta = SUPPORTED_LANGUAGES.find(l => l.code === lang) || SUPPORTED_LANGUAGES[0];

    if (langFlagEl) langFlagEl.textContent = langMeta.flag;
    if (langLabelEl) langLabelEl.textContent = lang.toUpperCase();

    // Update active class on dropdown items
    langOptionBtns.forEach(btn => {
      if (btn.getAttribute('data-lang') === lang) {
        btn.classList.add('active');
      } else {
        btn.classList.remove('active');
      }
    });

    // Translate all [data-i18n] elements
    const dict = TRANSLATIONS[lang] || TRANSLATIONS.en;
    document.querySelectorAll('[data-i18n]').forEach(el => {
      const key = el.getAttribute('data-i18n');
      if (key && dict[key]) {
        el.textContent = dict[key];
      }
    });

    // Close dropdown
    langDropdownMenu?.classList.remove('show');
  }

  langMenuBtn?.addEventListener('click', (e) => {
    e.stopPropagation();
    langDropdownMenu?.classList.toggle('show');
  });

  document.addEventListener('click', (e) => {
    if (!langDropdownMenu?.contains(e.target as Node) && e.target !== langMenuBtn) {
      langDropdownMenu?.classList.remove('show');
    }
  });

  langOptionBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const lang = btn.getAttribute('data-lang') as Language;
      if (lang && TRANSLATIONS[lang]) {
        applyLanguage(lang);
      }
    });
  });

  // Apply initial language
  applyLanguage(currentLang);

  // Initial Runs
  updateAll();
  updateComparison();
  updateSpecialized();
  updateHyperfocalTable();
}
