import "./styles/main.css";
import {
  ERAS,
  formatAreaKm2,
  formatYearLabel,
  getActiveEventsForYear,
  getActivePolitiesForYear,
  getEraForYear,
  HISTORICAL_EVENTS,
  KISAH_STORIES,
  MAX_YEAR,
  MIN_YEAR,
  POLITIES,
  sliderValueToYear,
  yearToSliderValue,
  type EraId,
  type HistoricalEventItem,
  type PolityTerritory,
} from "./data/historyData";
import { HistoricalGlobe } from "./globe/HistoricalGlobe";
import { getTokenColor } from "./theme/designTokens";

interface AtlasState {
  currentYear: number;
  currentEraId: EraId;
  showEvents: boolean;
  showLeaderboard: boolean;
  showKisah: boolean;
  selectedEvent: HistoricalEventItem | null;
  selectedPolity: PolityTerritory | null;
  activeMode: "jelajahi" | "siapa-berkuasa" | "tahun-berapa" | "harian";
  isPlaying: boolean;
  playbackSpeedIndex: number;
  quizScore: number;
  quizTotal: number;
}

const PLAYBACK_SPEEDS = [1, 2, 5, 10];

function getEventSvgIcon(iconType: HistoricalEventItem["iconType"]): string {
  switch (iconType) {
    case "sword":
      return `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" aria-hidden="true">
        <polyline points="14.5 17.5 3 6 3 3 6 3 17.5 14.5"></polyline>
        <line x1="13" y1="19" x2="19" y2="13"></line>
        <line x1="16" y1="16" x2="20" y2="20"></line>
      </svg>`;
    case "flag":
      return `<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
        <path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z"></path>
        <line x1="4" y1="22" x2="4" y2="15" stroke="currentColor" stroke-width="2.4"></line>
      </svg>`;
    case "monument":
      return `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" aria-hidden="true">
        <polygon points="12 2 3 7 21 7 12 2"></polygon>
        <line x1="6" y1="7" x2="6" y2="17"></line>
        <line x1="12" y1="7" x2="12" y2="17"></line>
        <line x1="18" y1="7" x2="18" y2="17"></line>
        <line x1="3" y1="20" x2="21" y2="20"></line>
      </svg>`;
    case "scroll":
      return `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" aria-hidden="true">
        <path d="M8 21h12a2 2 0 0 0 2-2v-2H10v2a2 2 0 1 1-4 0V5a2 2 0 1 0-4 0v3h4"></path>
        <path d="M19 17V5a2 2 0 0 0-2-2H4"></path>
      </svg>`;
  }
}

function getKisahSvgIcon(iconType: string): string {
  switch (iconType) {
    case "temple":
      return `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
        <polygon points="12 2 2 7 22 7 12 2"></polygon>
        <line x1="5" y1="7" x2="5" y2="17"></line>
        <line x1="10" y1="7" x2="10" y2="17"></line>
        <line x1="14" y1="7" x2="14" y2="17"></line>
        <line x1="19" y1="7" x2="19" y2="17"></line>
        <rect x="2" y="17" width="20" height="4" rx="1"></rect>
      </svg>`;
    case "scroll":
      return `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
        <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"></path>
        <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"></path>
      </svg>`;
    case "compass":
      return `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
        <circle cx="12" cy="12" r="10"></circle>
        <polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76"></polygon>
      </svg>`;
    case "shield":
      return `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path>
      </svg>`;
    default:
      return `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
        <circle cx="12" cy="12" r="10"></circle>
        <line x1="2" y1="12" x2="22" y2="12"></line>
        <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"></path>
      </svg>`;
  }
}

function renderMiniGlobeIcon(canvas: HTMLCanvasElement): void {
  const ctx = canvas.getContext("2d");
  if (!ctx) return;
  const w = canvas.width;
  const h = canvas.height;
  ctx.clearRect(0, 0, w, h);

  const grad = ctx.createRadialGradient(w * 0.35, h * 0.3, 2, w * 0.5, h * 0.5, w * 0.48);
  grad.addColorStop(0, getTokenColor("--globe-ocean-shallow"));
  grad.addColorStop(0.7, getTokenColor("--globe-ocean-mid"));
  grad.addColorStop(1, getTokenColor("--globe-ocean-deep"));

  ctx.fillStyle = grad;
  ctx.beginPath();
  ctx.arc(w / 2, h / 2, w * 0.44, 0, Math.PI * 2);
  ctx.fill();

  // Continents silhouette
  ctx.fillStyle = getTokenColor("--globe-land-tropical");
  ctx.beginPath();
  ctx.ellipse(w * 0.44, h * 0.42, 8, 5, -0.3, 0, Math.PI * 2);
  ctx.ellipse(w * 0.62, h * 0.58, 6, 4, 0.4, 0, Math.PI * 2);
  ctx.fill();

  // Rim highlight
  ctx.strokeStyle = getTokenColor("--color-primary");
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.arc(w / 2, h / 2, w * 0.44, 0, Math.PI * 2);
  ctx.stroke();
}

function renderArtifactPreview(
  canvas: HTMLCanvasElement,
  style: HistoricalEventItem["artifactStyle"],
  accentColorToken: string
): void {
  const ctx = canvas.getContext("2d");
  if (!ctx) return;
  const w = canvas.width;
  const h = canvas.height;
  ctx.clearRect(0, 0, w, h);

  // Dark museum pedestal backdrop
  const bgGrad = ctx.createRadialGradient(w / 2, h / 2, 6, w / 2, h / 2, w * 0.65);
  bgGrad.addColorStop(0, getTokenColor("--globe-ocean-mid"));
  bgGrad.addColorStop(1, getTokenColor("--color-background"));
  ctx.fillStyle = bgGrad;
  ctx.fillRect(0, 0, w, h);

  const accent = getTokenColor(accentColorToken);

  if (style === "inscription") {
    // River boulder stone (Prasasti Kedukan Bukit / Epigraphic stele)
    ctx.save();
    ctx.translate(w / 2, h / 2);
    const stoneGrad = ctx.createRadialGradient(-10, -12, 4, 0, 0, 34);
    stoneGrad.addColorStop(0, getTokenColor("--globe-land-steppe"));
    stoneGrad.addColorStop(0.65, getTokenColor("--globe-land-highland"));
    stoneGrad.addColorStop(1, getTokenColor("--globe-space-bg"));

    ctx.fillStyle = stoneGrad;
    ctx.beginPath();
    ctx.moveTo(-22, -26);
    ctx.quadraticCurveTo(4, -34, 24, -20);
    ctx.quadraticCurveTo(32, 4, 22, 26);
    ctx.quadraticCurveTo(0, 32, -24, 24);
    ctx.quadraticCurveTo(-32, 0, -22, -26);
    ctx.closePath();
    ctx.fill();

    ctx.strokeStyle = accent;
    ctx.lineWidth = 1.4;
    ctx.globalAlpha = 0.85;
    // Carved Pallawa script rows on the stone
    for (let row = -14; row <= 14; row += 7) {
      ctx.beginPath();
      for (let col = -15; col <= 15; col += 5) {
        ctx.moveTo(col, row);
        ctx.arc(col + 1.5, row, 1.8, 0, Math.PI * 1.4);
      }
      ctx.stroke();
    }
    ctx.restore();
  } else if (style === "map") {
    // Ancient nautical / cartographic chart
    ctx.save();
    ctx.fillStyle = getTokenColor("--globe-land-steppe");
    ctx.fillRect(14, 14, w - 28, h - 28);
    ctx.strokeStyle = accent;
    ctx.lineWidth = 1.5;
    ctx.strokeRect(14, 14, w - 28, h - 28);

    // Compass rose rhumb lines
    ctx.beginPath();
    for (let a = 0; a < 8; a++) {
      const ang = (a * Math.PI) / 4;
      ctx.moveTo(w / 2, h / 2);
      ctx.lineTo(w / 2 + Math.cos(ang) * 24, h / 2 + Math.sin(ang) * 24);
    }
    ctx.stroke();
    ctx.restore();
  } else {
    // Imperial seal / historical chronicle tablet
    ctx.save();
    ctx.strokeStyle = accent;
    ctx.lineWidth = 2.2;
    ctx.beginPath();
    ctx.arc(w / 2, h / 2, 26, 0, Math.PI * 2);
    ctx.stroke();

    ctx.beginPath();
    ctx.arc(w / 2, h / 2, 18, 0, Math.PI * 2);
    ctx.stroke();

    ctx.fillStyle = accent;
    ctx.beginPath();
    ctx.arc(w / 2, h / 2, 6, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }
}

function initAtlasApp(): void {
  const viewportEl = document.getElementById("globe-viewport")!;
  const territoryLabelsLayer = document.getElementById("territory-labels-layer")!;
  const eventMarkersLayer = document.getElementById("event-markers-layer")!;

  const yearNumberEl = document.getElementById("year-number")!;
  const yearSuffixEl = document.getElementById("year-suffix")!;
  const activeEraPillEl = document.getElementById("active-era-pill")!;

  const eraToastEl = document.getElementById("era-toast")!;
  const eraToastTitleEl = document.getElementById("era-toast-title")!;
  const eraToastRangeEl = document.getElementById("era-toast-range")!;

  const btnKisah = document.getElementById("btn-kisah")!;
  const btnToggleEvents = document.getElementById("btn-toggle-events")!;
  const btnToggleLeaderboard = document.getElementById("btn-toggle-leaderboard")!;

  const cardEventDetail = document.getElementById("card-event-detail")!;
  const eventCardCategory = document.getElementById("event-card-category")!;
  const eventCardTitle = document.getElementById("event-card-title")!;
  const eventCardDesc = document.getElementById("event-card-desc")!;
  const artifactCanvas = document.getElementById("artifact-canvas") as HTMLCanvasElement;
  const artifactLabel = document.getElementById("artifact-label")!;
  const artifactTitle = document.getElementById("artifact-title")!;
  const artifactQuote = document.getElementById("artifact-quote")!;
  const btnJumpEventYear = document.getElementById("btn-jump-event-year")!;
  const btnFocusEventGlobe = document.getElementById("btn-focus-event-globe")!;
  const btnCloseEvent = document.getElementById("btn-close-event")!;

  const panelKisah = document.getElementById("panel-kisah")!;
  const kisahListEl = document.getElementById("kisah-list")!;
  const btnCloseKisah = document.getElementById("btn-close-kisah")!;

  const panelLeaderboard = document.getElementById("panel-leaderboard")!;
  const leaderboardHeading = document.getElementById("leaderboard-heading")!;
  const leaderboardList = document.getElementById("leaderboard-list")!;
  const btnCloseLeaderboard = document.getElementById("btn-close-leaderboard")!;

  const panelChallenge = document.getElementById("panel-challenge")!;
  const challengeModeBadge = document.getElementById("challenge-mode-badge")!;
  const challengeHeading = document.getElementById("challenge-heading")!;
  const challengePrompt = document.getElementById("challenge-prompt")!;
  const challengeOptions = document.getElementById("challenge-options")!;
  const challengeFeedback = document.getElementById("challenge-feedback")!;
  const challengeScore = document.getElementById("challenge-score")!;
  const btnNextChallenge = document.getElementById("btn-next-challenge")!;
  const btnCloseChallenge = document.getElementById("btn-close-challenge")!;

  const btnPlayTimeline = document.getElementById("btn-play-timeline")!;
  const iconPlay = document.getElementById("icon-play")!;
  const iconPause = document.getElementById("icon-pause")!;
  const timelineRangeInput = document.getElementById("timeline-range-input") as HTMLInputElement;
  const timelineThumb = document.getElementById("timeline-thumb")!;
  const timelineThumbTooltip = document.getElementById("timeline-thumb-tooltip")!;
  const timelineEventDots = document.getElementById("timeline-event-dots")!;
  const btnSpeed = document.getElementById("btn-speed")!;

  const miniGlobeCanvas = document.getElementById("mini-globe-canvas") as HTMLCanvasElement;
  renderMiniGlobeIcon(miniGlobeCanvas);

  const sriwijayaEvent = HISTORICAL_EVENTS.find((e) => e.id === "sriwijaya-682")!;

  const state: AtlasState = {
    currentYear: 682,
    currentEraId: "medieval",
    showEvents: true,
    showLeaderboard: true,
    showKisah: false,
    selectedEvent: sriwijayaEvent,
    selectedPolity: null,
    activeMode: "jelajahi",
    isPlaying: false,
    playbackSpeedIndex: 0,
    quizScore: 0,
    quizTotal: 0,
  };

  const globe = new HistoricalGlobe(viewportEl);

  // Cache DOM nodes for floating 3D labels & pins to avoid recreating DOM every frame
  const territoryLabelElements = new Map<string, HTMLElement>();
  const eventPinElements = new Map<string, HTMLElement>();
  let toastTimeout: number | undefined;

  function showEraToast(eraId: EraId): void {
    const era = ERAS.find((e) => e.id === eraId);
    if (!era) return;
    eraToastTitleEl.textContent = era.toastTitle;
    eraToastRangeEl.textContent = era.rangeLabel;
    eraToastEl.classList.add("is-visible");
    if (toastTimeout !== undefined) {
      window.clearTimeout(toastTimeout);
    }
    toastTimeout = window.setTimeout(() => {
      eraToastEl.classList.remove("is-visible");
    }, 2200);
  }

  function renderTimelineEventDots(): void {
    timelineEventDots.innerHTML = "";
    for (const ev of HISTORICAL_EVENTS) {
      const sliderVal = yearToSliderValue(ev.year);
      const pct = (sliderVal / 1000) * 100;
      const dot = document.createElement("span");
      dot.className = "timeline-event-dot";
      dot.style.left = `${pct}%`;
      timelineEventDots.appendChild(dot);
    }
  }

  function updateEventDetailCard(): void {
    if (state.selectedEvent) {
      const ev = state.selectedEvent;
      const yr = formatYearLabel(ev.year).full;
      eventCardCategory.textContent = `${ev.category} \u2022 ${yr}`;
      eventCardTitle.textContent = ev.title;
      eventCardDesc.textContent = ev.description;
      artifactLabel.textContent = ev.artifactLabel;
      artifactTitle.textContent = ev.artifactTitle;
      artifactQuote.textContent = `\u201C${ev.artifactQuote}\u201D`;
      btnJumpEventYear.textContent = `Ke tahun ${yr}`;
      renderArtifactPreview(artifactCanvas, ev.artifactStyle, "--pin-badge-amber");
      cardEventDetail.classList.remove("is-hidden");
    } else if (state.selectedPolity) {
      const pol = state.selectedPolity;
      const startLbl = formatYearLabel(pol.startYear).full;
      const endLbl = formatYearLabel(pol.endYear).full;
      eventCardCategory.textContent = `KEKAISARAN & WILAYAH \u2022 ${startLbl} – ${endLbl}`;
      eventCardTitle.textContent = pol.name;
      eventCardDesc.textContent = pol.summary;
      artifactLabel.textContent = `IBU KOTA: ${pol.capital.toUpperCase()}`;
      artifactTitle.textContent = `Luas Puncak: ${formatAreaKm2(pol.peakAreaKm2)} (Tahun ${
        formatYearLabel(pol.peakYear).full
      })`;
      artifactQuote.textContent = `Wilayah kedaulatan ${pol.name} dipetakan berdasarkan basis data geospasial Cliopatria (Seshat).`;
      btnJumpEventYear.textContent = `Ke puncak (${formatYearLabel(pol.peakYear).full})`;
      renderArtifactPreview(artifactCanvas, "seal", pol.colorToken);
      cardEventDetail.classList.remove("is-hidden");
    } else {
      cardEventDetail.classList.add("is-hidden");
    }
  }

  function rebuildOverlayElementsForYear(year: number): void {
    // 1. Territory Labels
    const activePolities = getActivePolitiesForYear(year);
    const activePolityIds = new Set(activePolities.map((item) => item.polity.id));

    for (const [id, el] of territoryLabelElements.entries()) {
      if (!activePolityIds.has(id)) {
        el.remove();
        territoryLabelElements.delete(id);
      }
    }

    for (const { polity } of activePolities) {
      if (!territoryLabelElements.has(polity.id)) {
        const labelEl = document.createElement("button");
        labelEl.type = "button";
        labelEl.className = "globe-territory-label";
        labelEl.textContent = polity.name;
        labelEl.addEventListener("click", (e) => {
          e.stopPropagation();
          state.selectedPolity = polity;
          state.selectedEvent = null;
          globe.renderYearTerritories(state.currentYear, polity.id);
          globe.flyTo(polity.labelLat, polity.labelLng, 2.35);
          updateEventDetailCard();
        });
        territoryLabelsLayer.appendChild(labelEl);
        territoryLabelElements.set(polity.id, labelEl);
      }
    }

    // 2. Event Pins
    const activeEvents = state.showEvents ? getActiveEventsForYear(year) : [];
    const activeEventIds = new Set(activeEvents.map((ev) => ev.id));

    for (const [id, el] of eventPinElements.entries()) {
      if (!activeEventIds.has(id)) {
        el.remove();
        eventPinElements.delete(id);
      }
    }

    for (const ev of activeEvents) {
      let pinEl = eventPinElements.get(ev.id);
      if (!pinEl) {
        const btnEl = document.createElement("button");
        btnEl.type = "button";
        btnEl.className = "globe-event-pin";
        btnEl.innerHTML = `
          <span class="globe-event-pin-badge">${getEventSvgIcon(ev.iconType)}</span>
          <span class="globe-event-pin-label">${ev.title}</span>
        `;
        btnEl.addEventListener("click", (e) => {
          e.stopPropagation();
          state.selectedEvent = ev;
          state.selectedPolity = null;
          updateEventDetailCard();
          globe.flyTo(ev.lat, ev.lng, 2.15);
          updateOverlayPinSelection();
        });
        eventMarkersLayer.appendChild(btnEl);
        eventPinElements.set(ev.id, btnEl);
        pinEl = btnEl;
      }
    }
    updateOverlayPinSelection();
  }

  function updateOverlayPinSelection(): void {
    for (const [id, el] of eventPinElements.entries()) {
      el.classList.toggle("is-selected", state.selectedEvent?.id === id);
    }
  }

  function updateLeaderboardForYear(year: number): void {
    const yrFormatted = formatYearLabel(year).full;
    leaderboardHeading.textContent = `Negara terbesar pada ${yrFormatted}`;
    const activePolities = getActivePolitiesForYear(year);
    leaderboardList.innerHTML = "";

    for (const { polity, currentAreaKm2 } of activePolities) {
      const li = document.createElement("li");
      li.className = "leaderboard-row";
      const dotColor = getTokenColor(polity.colorToken);
      li.innerHTML = `
        <div class="leaderboard-name-group">
          <span class="leaderboard-color-dot" style="background-color: ${dotColor};"></span>
          <span class="leaderboard-name" title="${polity.name}">${polity.name}</span>
        </div>
        <span class="leaderboard-area">${formatAreaKm2(currentAreaKm2)}</span>
      `;
      li.addEventListener("click", () => {
        state.selectedPolity = polity;
        state.selectedEvent = null;
        globe.renderYearTerritories(state.currentYear, polity.id);
        globe.flyTo(polity.labelLat, polity.labelLng, 2.35);
        updateEventDetailCard();
      });
      leaderboardList.appendChild(li);
    }
  }

  function renderKisahList(): void {
    kisahListEl.innerHTML = "";
    for (const story of KISAH_STORIES) {
      const item = document.createElement("button");
      item.type = "button";
      item.className = "kisah-item";
      const accentColor = getTokenColor(story.accentToken);

      item.innerHTML = `
        <div class="kisah-icon-box" style="background-color: ${accentColor}28; color: ${accentColor};">
          ${getKisahSvgIcon(story.iconType)}
        </div>
        <div class="kisah-content">
          <div class="kisah-years">${story.yearRangeLabel}</div>
          <div class="kisah-title">${story.title}</div>
          <div class="kisah-desc">${story.description}</div>
        </div>
        <svg class="kisah-chevron" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
          <polyline points="9 18 15 12 9 6"></polyline>
        </svg>
      `;

      item.addEventListener("click", () => {
        setYear(story.targetYear, true);
        globe.flyTo(story.targetLat, story.targetLng, 2.25);
        if (story.eventId) {
          const ev = HISTORICAL_EVENTS.find((e) => e.id === story.eventId) || null;
          state.selectedEvent = ev;
          state.selectedPolity = null;
          updateEventDetailCard();
          updateOverlayPinSelection();
        }
      });

      kisahListEl.appendChild(item);
    }
  }

  function setYear(newYear: number, triggerToastOnEraChange = true): void {
    const clamped = Math.max(MIN_YEAR, Math.min(MAX_YEAR, Math.round(newYear)));
    const safeYear = clamped === 0 ? 1 : clamped;
    state.currentYear = safeYear;

    const formatted = formatYearLabel(safeYear);
    yearNumberEl.textContent = formatted.num;
    yearSuffixEl.textContent = formatted.suffix;

    const era = getEraForYear(safeYear);
    if (era.id !== state.currentEraId) {
      state.currentEraId = era.id;
      activeEraPillEl.textContent = era.nameUpper;
      activeEraPillEl.setAttribute("data-era", era.id);
      if (triggerToastOnEraChange) {
        showEraToast(era.id);
      }
    }

    // Highlight active era label on timeline
    document.querySelectorAll(".era-label").forEach((el) => {
      el.classList.toggle("is-active", el.getAttribute("data-era") === era.id);
    });

    // Update quick-year chips
    document.querySelectorAll(".quick-year-chip").forEach((el) => {
      const chipYear = Number(el.getAttribute("data-year"));
      el.classList.toggle("is-selected", chipYear === safeYear);
    });

    // Update slider thumb position
    const sliderVal = yearToSliderValue(safeYear);
    timelineRangeInput.value = String(sliderVal);
    const pct = (sliderVal / 1000) * 100;
    timelineThumb.style.left = `${pct}%`;
    timelineThumbTooltip.textContent = formatted.full;

    globe.renderYearTerritories(safeYear, state.selectedPolity?.id ?? null);
    rebuildOverlayElementsForYear(safeYear);
    updateLeaderboardForYear(safeYear);
  }

  // Update 2D screen positions of 3D labels & pins every frame
  globe.setOnFrame(() => {
    const activePolities = getActivePolitiesForYear(state.currentYear);
    for (const { polity } of activePolities) {
      const el = territoryLabelElements.get(polity.id);
      if (!el) continue;
      const proj = globe.projectLatLngToScreen(polity.labelLat, polity.labelLng);
      if (!proj.visible) {
        el.style.opacity = "0";
        el.style.pointerEvents = "none";
      } else {
        const opacity = Math.min(1, (proj.facingRatio - 0.18) * 2.4);
        el.style.opacity = String(opacity.toFixed(2));
        el.style.pointerEvents = opacity > 0.35 ? "auto" : "none";
        el.style.transform = `translate3d(${proj.x.toFixed(1)}px, ${proj.y.toFixed(1)}px, 0) translate(-50%, -50%)`;
      }
    }

    if (state.showEvents) {
      const activeEvents = getActiveEventsForYear(state.currentYear);
      for (const ev of activeEvents) {
        const el = eventPinElements.get(ev.id);
        if (!el) continue;
        const proj = globe.projectLatLngToScreen(ev.lat, ev.lng);
        if (!proj.visible) {
          el.style.opacity = "0";
          el.style.pointerEvents = "none";
        } else {
          const opacity = Math.min(1, (proj.facingRatio - 0.16) * 2.8);
          el.style.opacity = String(opacity.toFixed(2));
          el.style.pointerEvents = opacity > 0.35 ? "auto" : "none";
          el.style.transform = `translate3d(${proj.x.toFixed(1)}px, ${proj.y.toFixed(1)}px, 0) translate(-14px, -50%)`;
        }
      }
    }
  });

  // Wire up Timeline Scrubber
  timelineRangeInput.addEventListener("input", () => {
    const val = Number(timelineRangeInput.value);
    const targetYr = sliderValueToYear(val);
    setYear(targetYr, true);
  });

  // Wire up Play / Pause Simulation
  let lastPlayTick = performance.now();
  function togglePlay(forceState?: boolean): void {
    state.isPlaying = forceState !== undefined ? forceState : !state.isPlaying;
    btnPlayTimeline.setAttribute("aria-pressed", String(state.isPlaying));
    iconPlay.classList.toggle("is-hidden", state.isPlaying);
    iconPause.classList.toggle("is-hidden", !state.isPlaying);
    lastPlayTick = performance.now();
  }

  btnPlayTimeline.addEventListener("click", () => togglePlay());

  btnSpeed.addEventListener("click", () => {
    state.playbackSpeedIndex = (state.playbackSpeedIndex + 1) % PLAYBACK_SPEEDS.length;
    const mult = PLAYBACK_SPEEDS[state.playbackSpeedIndex];
    btnSpeed.innerHTML = `&times;${mult}`;
  });

  function stepPlaybackLoop(now: number): void {
    if (state.isPlaying) {
      const dt = (now - lastPlayTick) / 1000;
      const mult = PLAYBACK_SPEEDS[state.playbackSpeedIndex];
      const sliderDelta = dt * 14 * mult;
      if (sliderDelta >= 1) {
        lastPlayTick = now;
        const nextSliderVal = Number(timelineRangeInput.value) + sliderDelta;
        if (nextSliderVal >= 1000) {
          setYear(MAX_YEAR, true);
          togglePlay(false);
        } else {
          setYear(sliderValueToYear(nextSliderVal), true);
        }
      }
    }
    requestAnimationFrame(stepPlaybackLoop);
  }
  requestAnimationFrame(stepPlaybackLoop);

  // Wire up Top-Left Action Buttons
  btnKisah.addEventListener("click", () => {
    state.showKisah = !state.showKisah;
    btnKisah.classList.toggle("is-active", state.showKisah);
    btnKisah.setAttribute("aria-expanded", String(state.showKisah));
    panelKisah.classList.toggle("is-hidden", !state.showKisah);
  });

  btnCloseKisah.addEventListener("click", () => {
    state.showKisah = false;
    btnKisah.classList.remove("is-active");
    btnKisah.setAttribute("aria-expanded", "false");
    panelKisah.classList.add("is-hidden");
  });

  btnToggleEvents.addEventListener("click", () => {
    state.showEvents = !state.showEvents;
    btnToggleEvents.classList.toggle("is-active", state.showEvents);
    btnToggleEvents.setAttribute("aria-pressed", String(state.showEvents));
    rebuildOverlayElementsForYear(state.currentYear);
  });

  btnToggleLeaderboard.addEventListener("click", () => {
    state.showLeaderboard = !state.showLeaderboard;
    btnToggleLeaderboard.classList.toggle("is-active", state.showLeaderboard);
    btnToggleLeaderboard.setAttribute("aria-pressed", String(state.showLeaderboard));
    panelLeaderboard.classList.toggle("is-hidden", !state.showLeaderboard);
  });

  btnCloseLeaderboard.addEventListener("click", () => {
    state.showLeaderboard = false;
    btnToggleLeaderboard.classList.remove("is-active");
    btnToggleLeaderboard.setAttribute("aria-pressed", "false");
    panelLeaderboard.classList.add("is-hidden");
  });

  btnCloseEvent.addEventListener("click", () => {
    state.selectedEvent = null;
    state.selectedPolity = null;
    globe.renderYearTerritories(state.currentYear, null);
    updateEventDetailCard();
    updateOverlayPinSelection();
  });

  btnJumpEventYear.addEventListener("click", () => {
    if (state.selectedEvent) {
      setYear(state.selectedEvent.year, true);
      globe.flyTo(state.selectedEvent.lat, state.selectedEvent.lng, 2.1);
    } else if (state.selectedPolity) {
      setYear(state.selectedPolity.peakYear, true);
      globe.flyTo(state.selectedPolity.labelLat, state.selectedPolity.labelLng, 2.25);
    }
  });

  btnFocusEventGlobe.addEventListener("click", () => {
    if (state.selectedEvent) {
      globe.flyTo(state.selectedEvent.lat, state.selectedEvent.lng, 2.05);
    } else if (state.selectedPolity) {
      globe.flyTo(state.selectedPolity.labelLat, state.selectedPolity.labelLng, 2.2);
    }
  });

  // Step Navigation Buttons (<<, <, >, >>)
  const sortedEventYears = Array.from(new Set(HISTORICAL_EVENTS.map((e) => e.year))).sort(
    (a, b) => a - b
  );

  document.getElementById("btn-step-back-major")!.addEventListener("click", () => {
    setYear(state.currentYear - 100, true);
  });
  document.getElementById("btn-step-forward-major")!.addEventListener("click", () => {
    setYear(state.currentYear + 100, true);
  });
  document.getElementById("btn-step-back")!.addEventListener("click", () => {
    const prevEventYear = [...sortedEventYears].reverse().find((y) => y < state.currentYear);
    setYear(prevEventYear !== undefined ? prevEventYear : state.currentYear - 10, true);
  });
  document.getElementById("btn-step-forward")!.addEventListener("click", () => {
    const nextEventYear = sortedEventYears.find((y) => y > state.currentYear);
    setYear(nextEventYear !== undefined ? nextEventYear : state.currentYear + 10, true);
  });

  // Quick Year Chips
  document.querySelectorAll(".quick-year-chip").forEach((chip) => {
    chip.addEventListener("click", () => {
      const targetYear = Number(chip.getAttribute("data-year"));
      setYear(targetYear, true);
      if (targetYear === 682) {
        state.selectedEvent = sriwijayaEvent;
        state.selectedPolity = null;
        updateEventDetailCard();
        globe.flyTo(sriwijayaEvent.lat, sriwijayaEvent.lng, 2.15);
      } else if (targetYear === 1350) {
        const majapahit = POLITIES.find((p) => p.id === "majapahit") || null;
        state.selectedPolity = majapahit;
        state.selectedEvent = null;
        updateEventDetailCard();
        if (majapahit) globe.flyTo(majapahit.labelLat, majapahit.labelLng, 2.25);
      } else if (targetYear === 622) {
        globe.flyTo(26.0, 58.0, 2.65);
      } else if (targetYear === 1600) {
        globe.flyTo(30.0, 42.0, 2.65);
      }
    });
  });

  // Interactive Quiz / Challenge Modes (SIAPA BERKUASA?, TAHUN BERAPA?, HARIAN)
  function generateChallengeQuestion(mode: AtlasState["activeMode"]): void {
    challengeFeedback.classList.add("is-hidden");
    challengeOptions.innerHTML = "";

    const targetPolity = POLITIES[Math.floor(Math.random() * POLITIES.length)];
    const testYear = targetPolity.peakYear;
    setYear(testYear, false);
    globe.renderYearTerritories(testYear, targetPolity.id);
    globe.flyTo(targetPolity.labelLat, targetPolity.labelLng, 2.35);

    if (mode === "siapa-berkuasa" || mode === "harian") {
      challengeModeBadge.textContent =
        mode === "harian" ? "TANTANGAN HARIAN ATLAS" : "KUIS GEOGRAFI SEJARAH";
      challengeHeading.textContent = "Siapa Berkuasa di Wilayah Ini?";
      challengePrompt.textContent = `Pada tahun ${
        formatYearLabel(testYear).full
      }, kekaisaran atau kerajaan manakah yang berpusat di ${targetPolity.capital} dan menguasai wilayah yang disorot pada bola dunia?`;

      const distractors = POLITIES.filter((p) => p.id !== targetPolity.id)
        .sort(() => Math.random() - 0.5)
        .slice(0, 3);
      const choices = [targetPolity, ...distractors].sort(() => Math.random() - 0.5);

      for (const choice of choices) {
        const btn = document.createElement("button");
        btn.type = "button";
        btn.className = "challenge-option-btn";
        btn.textContent = choice.name;
        btn.addEventListener("click", () => {
          state.quizTotal += 1;
          const isCorrect = choice.id === targetPolity.id;
          if (isCorrect) state.quizScore += 1;
          btn.classList.add(isCorrect ? "is-correct" : "is-wrong");
          challengeFeedback.textContent = isCorrect
            ? `Benar! ${targetPolity.name} mencapai puncak kejayaan sekitar ${
                formatYearLabel(targetPolity.peakYear).full
              } dengan luas ${formatAreaKm2(targetPolity.peakAreaKm2)}.`
            : `Jawaban yang tepat adalah ${targetPolity.name} (${
                formatYearLabel(targetPolity.startYear).full
              } – ${formatYearLabel(targetPolity.endYear).full}).`;
          challengeFeedback.classList.remove("is-hidden");
          challengeScore.textContent = `Skor: ${state.quizScore} / ${state.quizTotal}`;
        });
        challengeOptions.appendChild(btn);
      }
    } else if (mode === "tahun-berapa") {
      challengeModeBadge.textContent = "KUIS KRONOLOGI SEJARAH";
      challengeHeading.textContent = "Tahun Berapa Peta Ini?";
      challengePrompt.textContent = `${targetPolity.name} sedang berada pada masa keemasannya (beribu kota di ${targetPolity.capital}). Pada tahun berapakah konfigurasi peta dunia ini berlangsung?`;

      const offsets = [-450, -180, 0, 260];
      const yearChoices = offsets
        .map((off) => Math.max(MIN_YEAR, Math.min(MAX_YEAR, testYear + off)))
        .sort(() => Math.random() - 0.5);

      for (const yrChoice of yearChoices) {
        const btn = document.createElement("button");
        btn.type = "button";
        btn.className = "challenge-option-btn";
        btn.textContent = formatYearLabel(yrChoice).full;
        btn.addEventListener("click", () => {
          state.quizTotal += 1;
          const isCorrect = yrChoice === testYear;
          if (isCorrect) state.quizScore += 1;
          btn.classList.add(isCorrect ? "is-correct" : "is-wrong");
          challengeFeedback.textContent = isCorrect
            ? `Tepat sekali! Tahun ${formatYearLabel(testYear).full} adalah masa puncak ${
                targetPolity.name
              }.`
            : `Tahun yang tepat adalah ${formatYearLabel(testYear).full} (${targetPolity.name}).`;
          challengeFeedback.classList.remove("is-hidden");
          challengeScore.textContent = `Skor: ${state.quizScore} / ${state.quizTotal}`;
        });
        challengeOptions.appendChild(btn);
      }
    }
  }

  document.querySelectorAll(".mode-tab").forEach((tab) => {
    tab.addEventListener("click", () => {
      const mode = tab.getAttribute("data-mode") as AtlasState["activeMode"];
      state.activeMode = mode;
      document.querySelectorAll(".mode-tab").forEach((t) => {
        const active = t === tab;
        t.classList.toggle("is-active", active);
        t.setAttribute("aria-selected", String(active));
      });

      if (mode === "jelajahi") {
        panelChallenge.classList.add("is-hidden");
        updateEventDetailCard();
      } else {
        cardEventDetail.classList.add("is-hidden");
        panelKisah.classList.add("is-hidden");
        panelChallenge.classList.remove("is-hidden");
        generateChallengeQuestion(mode);
      }
    });
  });

  btnNextChallenge.addEventListener("click", () => {
    generateChallengeQuestion(state.activeMode);
  });

  btnCloseChallenge.addEventListener("click", () => {
    const jelajahiTab = document.querySelector('.mode-tab[data-mode="jelajahi"]') as HTMLElement;
    if (jelajahiTab) jelajahiTab.click();
  });

  // Initial setup: focus on Southeast Asia / Bangkitnya Sriwijaya (682 M) just like the highlight of the video!
  renderTimelineEventDots();
  renderKisahList();
  setYear(682, false);
  updateEventDetailCard();
  globe.flyTo(4.0, 96.0, 2.45);
}

initAtlasApp();
