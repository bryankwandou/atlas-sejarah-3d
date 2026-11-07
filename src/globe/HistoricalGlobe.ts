import * as THREE from "three";
import { feature } from "topojson-client";
import landTopology from "world-atlas/land-110m.json";
import {
  getActiveEventsForYear,
  getActivePolitiesForYear,
  type HistoricalEventItem,
  type PolityTerritory,
} from "../data/historyData";
import { getTokenColor } from "../theme/designTokens";

interface GeoPolygonGeometry {
  type: "Polygon" | "MultiPolygon";
  coordinates: number[][][] | number[][][][];
}

export interface ScreenProjection {
  x: number;
  y: number;
  visible: boolean;
  facingRatio: number;
}

export class HistoricalGlobe {
  private container: HTMLElement;
  private scene: THREE.Scene;
  private camera: THREE.PerspectiveCamera;
  private renderer: THREE.WebGLRenderer;
  private globeGroup: THREE.Group;
  private earthMesh!: THREE.Mesh;
  private territoryMesh!: THREE.Mesh;
  private atmosphereMesh!: THREE.Mesh;
  private eventRingsGroup: THREE.Group;

  // Offscreen canvases for high-res Earth & dynamic historical territories
  private baseCanvas: HTMLCanvasElement;
  private landMaskCanvas: HTMLCanvasElement;
  private territoryCanvas: HTMLCanvasElement;
  private territoryTexture: THREE.CanvasTexture;

  // Camera spherical orbit state
  private targetLat = 8.0;
  private targetLng = 82.0;
  private currentLat = 8.0;
  private currentLng = 82.0;
  private targetDistance = 2.85;
  private currentDistance = 2.85;

  // Pointer drag state
  private isDragging = false;
  private pointerDownX = 0;
  private pointerDownY = 0;
  private lastPointerX = 0;
  private lastPointerY = 0;
  private velocityLat = 0;
  private velocityLng = 0;

  private renderedYear: number | null = null;
  private highlightedPolityId: string | null = null;
  private autoRotate = false;
  private onFrameCallback?: () => void;
  private onGlobeClickCallback?: (lat: number, lng: number) => void;

  private readonly GLOBE_RADIUS = 1.0;

  constructor(container: HTMLElement) {
    this.container = container;
    this.scene = new THREE.Scene();

    const width = container.clientWidth || window.innerWidth;
    const height = container.clientHeight || window.innerHeight;

    this.camera = new THREE.PerspectiveCamera(40, width / height, 0.1, 100);
    this.renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: false,
      powerPreference: "high-performance",
    });
    this.renderer.setSize(width, height);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.12;
    this.container.appendChild(this.renderer.domElement);

    this.globeGroup = new THREE.Group();
    this.scene.add(this.globeGroup);

    this.eventRingsGroup = new THREE.Group();
    this.globeGroup.add(this.eventRingsGroup);

    this.baseCanvas = document.createElement("canvas");
    this.baseCanvas.width = 2048;
    this.baseCanvas.height = 1024;

    this.landMaskCanvas = document.createElement("canvas");
    this.landMaskCanvas.width = 2048;
    this.landMaskCanvas.height = 1024;

    this.territoryCanvas = document.createElement("canvas");
    this.territoryCanvas.width = 2048;
    this.territoryCanvas.height = 1024;

    this.territoryTexture = new THREE.CanvasTexture(this.territoryCanvas);
    this.territoryTexture.colorSpace = THREE.SRGBColorSpace;
    this.territoryTexture.anisotropy = 8;

    this.setupLighting();
    this.setupStarfield();
    this.buildEarthBaseTextures();
    this.setupGlobeMeshes();
    this.setupInteractionListeners();

    this.animate();
  }

  public setOnFrame(cb: () => void): void {
    this.onFrameCallback = cb;
  }

  public setOnGlobeClick(cb: (lat: number, lng: number) => void): void {
    this.onGlobeClickCallback = cb;
  }

  public setAutoRotate(enabled: boolean): void {
    this.autoRotate = enabled;
  }

  public setAtmosphereVisible(visible: boolean): void {
    if (this.atmosphereMesh) {
      this.atmosphereMesh.visible = visible;
    }
  }

  private setupLighting(): void {
    const lightPrimary = new THREE.Color(getTokenColor("--color-on-primary"));
    const lightAccent = new THREE.Color(getTokenColor("--color-primary"));

    const ambientLight = new THREE.AmbientLight(lightPrimary, 1.55);
    this.scene.add(ambientLight);

    const sunLight = new THREE.DirectionalLight(lightPrimary, 1.35);
    sunLight.position.set(4, 2.5, 4);
    this.scene.add(sunLight);

    const rimLight = new THREE.DirectionalLight(lightAccent, 0.85);
    rimLight.position.set(-4, -2, -3);
    this.scene.add(rimLight);
  }

  private setupStarfield(): void {
    const starCount = 1800;
    const positions = new Float32Array(starCount * 3);
    const colors = new Float32Array(starCount * 3);

    const primaryColor = new THREE.Color(getTokenColor("--globe-star-primary"));
    const accentColor = new THREE.Color(getTokenColor("--globe-star-accent"));

    for (let i = 0; i < starCount; i++) {
      const r = 18 + Math.random() * 28;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);

      positions[i * 3] = r * Math.sin(phi) * Math.cos(theta);
      positions[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
      positions[i * 3 + 2] = r * Math.cos(phi);

      const mix = Math.random() > 0.75 ? accentColor : primaryColor;
      const brightness = 0.45 + Math.random() * 0.55;
      colors[i * 3] = mix.r * brightness;
      colors[i * 3 + 1] = mix.g * brightness;
      colors[i * 3 + 2] = mix.b * brightness;
    }

    const starGeo = new THREE.BufferGeometry();
    starGeo.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    starGeo.setAttribute("color", new THREE.BufferAttribute(colors, 3));

    const starMat = new THREE.PointsMaterial({
      size: 0.08,
      vertexColors: true,
      transparent: true,
      opacity: 0.85,
      sizeAttenuation: true,
    });

    const stars = new THREE.Points(starGeo, starMat);
    this.scene.add(stars);
  }

  /**
   * Renders the Natural Earth coastline & physical biome relief texture + land mask.
   */
  private buildEarthBaseTextures(): void {
    const w = this.baseCanvas.width;
    const h = this.baseCanvas.height;
    const baseCtx = this.baseCanvas.getContext("2d")!;
    const maskCtx = this.landMaskCanvas.getContext("2d")!;

    // 1. Decode Natural Earth land polygons from world-atlas
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const landGeo = feature(landTopology as any, (landTopology as any).objects.land) as any;
    const geometries: GeoPolygonGeometry[] =
      landGeo.type === "FeatureCollection"
        ? // eslint-disable-next-line @typescript-eslint/no-explicit-any
          landGeo.features.map((f: any) => f.geometry)
        : [landGeo.geometry || landGeo];

    const traceLandPaths = (ctx: CanvasRenderingContext2D) => {
      ctx.beginPath();
      for (const geom of geometries) {
        if (!geom) continue;
        const polys =
          geom.type === "Polygon"
            ? [geom.coordinates as number[][][]]
            : (geom.coordinates as number[][][][]);
        for (const poly of polys) {
          for (const ring of poly) {
            for (let i = 0; i < ring.length; i++) {
              const [lng, lat] = ring[i];
              const x = ((lng + 180) / 360) * w;
              const y = ((90 - lat) / 180) * h;
              if (i === 0) ctx.moveTo(x, y);
              else ctx.lineTo(x, y);
            }
            ctx.closePath();
          }
        }
      }
    };

    // 2. Render pure Land Mask for clipping historical territories to exact coastlines
    maskCtx.clearRect(0, 0, w, h);
    maskCtx.fillStyle = getTokenColor("--color-on-primary");
    traceLandPaths(maskCtx);
    maskCtx.fill();

    // 3. Render Deep Bathymetric Ocean on Base Canvas
    const oceanGrad = baseCtx.createLinearGradient(0, 0, 0, h);
    oceanGrad.addColorStop(0, getTokenColor("--globe-ocean-deep"));
    oceanGrad.addColorStop(0.25, getTokenColor("--globe-ocean-mid"));
    oceanGrad.addColorStop(0.5, getTokenColor("--globe-ocean-shallow"));
    oceanGrad.addColorStop(0.75, getTokenColor("--globe-ocean-mid"));
    oceanGrad.addColorStop(1, getTokenColor("--globe-ocean-deep"));
    baseCtx.fillStyle = oceanGrad;
    baseCtx.fillRect(0, 0, w, h);

    // 4. Render Glowing Continental Shelf Shallow Water Halo (matching 00:20 - 00:27 in video)
    baseCtx.save();
    baseCtx.shadowColor = getTokenColor("--globe-coast-glow");
    baseCtx.shadowBlur = 26;
    baseCtx.fillStyle = getTokenColor("--globe-ocean-shallow");
    traceLandPaths(baseCtx);
    baseCtx.fill();
    baseCtx.restore();

    // 5. Render Biome-Shaded Physical Continents clipped to Land Mask
    const biomeCanvas = document.createElement("canvas");
    biomeCanvas.width = w;
    biomeCanvas.height = h;
    const bCtx = biomeCanvas.getContext("2d")!;

    // Base lush forest/plains green
    bCtx.fillStyle = getTokenColor("--globe-land-forest");
    bCtx.fillRect(0, 0, w, h);

    // Equatorial tropical belt (Nusantara, Amazon, Central Africa)
    const tropGrad = bCtx.createLinearGradient(0, h * 0.38, 0, h * 0.64);
    tropGrad.addColorStop(0, "transparent");
    tropGrad.addColorStop(0.5, getTokenColor("--globe-land-tropical"));
    tropGrad.addColorStop(1, "transparent");
    bCtx.fillStyle = tropGrad;
    bCtx.fillRect(0, h * 0.38, w, h * 0.26);

    // Subtropical & Saharan / Arabian / Persian / Central Asian / Australian warm ochre deserts
    const drawBiomeRegion = (
      lngCenter: number,
      latCenter: number,
      lngRadius: number,
      latRadius: number,
      colorToken: string,
      alpha: number
    ) => {
      const cx = ((lngCenter + 180) / 360) * w;
      const cy = ((90 - latCenter) / 180) * h;
      const rx = (lngRadius / 360) * w;
      const ry = (latRadius / 180) * h;

      bCtx.save();
      bCtx.translate(cx, cy);
      bCtx.scale(1, ry / rx);
      const grad = bCtx.createRadialGradient(0, 0, rx * 0.15, 0, 0, rx);
      grad.addColorStop(0, getTokenColor(colorToken));
      grad.addColorStop(1, "transparent");
      bCtx.globalAlpha = alpha;
      bCtx.fillStyle = grad;
      bCtx.beginPath();
      bCtx.arc(0, 0, rx, 0, Math.PI * 2);
      bCtx.fill();
      bCtx.restore();
    };

    // Sahara, Arabia, Persia, Thar, Gobi, Taklamakan, Outback, SW North America
    drawBiomeRegion(14, 24, 34, 14, "--globe-land-desert", 0.95);
    drawBiomeRegion(45, 25, 22, 14, "--globe-land-desert", 0.95);
    drawBiomeRegion(58, 32, 20, 12, "--globe-land-steppe", 0.88);
    drawBiomeRegion(72, 42, 26, 12, "--globe-land-steppe", 0.85);
    drawBiomeRegion(102, 42, 24, 11, "--globe-land-desert", 0.85);
    drawBiomeRegion(88, 33, 16, 9, "--globe-land-highland", 0.9);
    drawBiomeRegion(134, -24, 18, 11, "--globe-land-desert", 0.9);
    drawBiomeRegion(-108, 34, 18, 12, "--globe-land-steppe", 0.8);
    drawBiomeRegion(25, -24, 14, 10, "--globe-land-steppe", 0.78);

    // Clip biome canvas to exact Natural Earth land mask
    bCtx.globalCompositeOperation = "destination-in";
    bCtx.drawImage(this.landMaskCanvas, 0, 0);

    // Composite onto base Earth canvas
    baseCtx.drawImage(biomeCanvas, 0, 0);

    // Subtle crisp coastline stroke
    baseCtx.strokeStyle = getTokenColor("--globe-coast-glow");
    baseCtx.lineWidth = 1.1;
    baseCtx.globalAlpha = 0.55;
    traceLandPaths(baseCtx);
    baseCtx.stroke();
    baseCtx.globalAlpha = 1.0;
  }

  private setupGlobeMeshes(): void {
    const sphereGeo = new THREE.SphereGeometry(this.GLOBE_RADIUS, 96, 96);
    const baseTexture = new THREE.CanvasTexture(this.baseCanvas);
    baseTexture.colorSpace = THREE.SRGBColorSpace;
    baseTexture.anisotropy = 8;

    const earthMat = new THREE.MeshStandardMaterial({
      map: baseTexture,
      roughness: 0.68,
      metalness: 0.08,
    });

    this.earthMesh = new THREE.Mesh(sphereGeo, earthMat);
    this.globeGroup.add(this.earthMesh);

    // Historical Territory Overlay Sphere (slightly above Earth surface)
    const territoryGeo = new THREE.SphereGeometry(this.GLOBE_RADIUS * 1.0025, 96, 96);
    const territoryMat = new THREE.MeshBasicMaterial({
      map: this.territoryTexture,
      transparent: true,
      opacity: 0.92,
      depthWrite: false,
    });
    this.territoryMesh = new THREE.Mesh(territoryGeo, territoryMat);
    this.globeGroup.add(this.territoryMesh);

    // Volumetric Rayleigh Atmosphere Limb Glow Shader (matching video's sapphire/violet halo)
    const atmosGeo = new THREE.SphereGeometry(this.GLOBE_RADIUS * 1.12, 64, 64);
    const atmosColor = new THREE.Color(getTokenColor("--globe-atmosphere"));
    const rimColor = new THREE.Color(getTokenColor("--globe-atmosphere-rim"));

    const atmosMat = new THREE.ShaderMaterial({
      uniforms: {
        uColorInner: { value: atmosColor },
        uColorOuter: { value: rimColor },
      },
      vertexShader: `
        varying vec3 vNormal;
        varying vec3 vViewPosition;
        void main() {
          vNormal = normalize(normalMatrix * normal);
          vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
          vViewPosition = -mvPosition.xyz;
          gl_Position = projectionMatrix * mvPosition;
        }
      `,
      fragmentShader: `
        uniform vec3 uColorInner;
        uniform vec3 uColorOuter;
        varying vec3 vNormal;
        varying vec3 vViewPosition;
        void main() {
          vec3 viewDir = normalize(vViewPosition);
          float fresnel = pow(0.68 - dot(vNormal, viewDir), 2.6);
          fresnel = clamp(fresnel, 0.0, 1.0);
          vec3 glow = mix(uColorInner, uColorOuter, fresnel);
          gl_FragColor = vec4(glow, fresnel * 0.85);
        }
      `,
      blending: THREE.AdditiveBlending,
      side: THREE.BackSide,
      transparent: true,
      depthWrite: false,
    });

    this.atmosphereMesh = new THREE.Mesh(atmosGeo, atmosMat);
    this.scene.add(this.atmosphereMesh);
  }

  /**
   * Redraws the historical empire territories on the 3D globe for the given year,
   * clipped cleanly against the Natural Earth coastlines!
   */
  public renderYearTerritories(year: number, highlightedPolityId: string | null = null): void {
    if (this.renderedYear === year && this.highlightedPolityId === highlightedPolityId) {
      return;
    }
    this.renderedYear = year;
    this.highlightedPolityId = highlightedPolityId;

    const w = this.territoryCanvas.width;
    const h = this.territoryCanvas.height;
    const ctx = this.territoryCanvas.getContext("2d")!;
    ctx.clearRect(0, 0, w, h);

    const activePolities = getActivePolitiesForYear(year);

    // Draw each active polity polygon with smooth rounded joins
    ctx.save();
    ctx.lineJoin = "round";
    ctx.lineCap = "round";

    for (const { polity } of activePolities) {
      const color = getTokenColor(polity.colorToken);
      const isHighlighted = highlightedPolityId === polity.id;

      ctx.beginPath();
      for (const ring of polity.rings) {
        for (let i = 0; i < ring.length; i++) {
          const [lng, lat] = ring[i];
          const x = ((lng + 180) / 360) * w;
          const y = ((90 - lat) / 180) * h;
          if (i === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
        ctx.closePath();
      }

      ctx.fillStyle = color;
      ctx.globalAlpha = isHighlighted ? 0.92 : 0.72;
      ctx.shadowColor = color;
      ctx.shadowBlur = isHighlighted ? 28 : 14;
      ctx.fill();

      ctx.lineWidth = isHighlighted ? 5 : 2.5;
      ctx.strokeStyle = isHighlighted ? getTokenColor("--color-on-primary") : color;
      ctx.globalAlpha = 0.95;
      ctx.stroke();
    }
    ctx.restore();

    // Clip all territory fills against the real Natural Earth land mask so coastlines are razor-sharp!
    ctx.save();
    ctx.globalCompositeOperation = "destination-in";
    ctx.drawImage(this.landMaskCanvas, 0, 0);
    ctx.restore();

    this.territoryTexture.needsUpdate = true;
    this.rebuildEventSurfaceMarkers(year);
  }

  private rebuildEventSurfaceMarkers(year: number): void {
    while (this.eventRingsGroup.children.length > 0) {
      const child = this.eventRingsGroup.children[0];
      this.eventRingsGroup.remove(child);
    }

    const activeEvents = getActiveEventsForYear(year);
    const ringGeo = new THREE.RingGeometry(0.008, 0.015, 24);
    const dotGeo = new THREE.CircleGeometry(0.006, 20);
    const amberColor = new THREE.Color(getTokenColor("--pin-badge-amber"));

    for (const ev of activeEvents) {
      const pos = this.latLngToVector3(ev.lat, ev.lng, this.GLOBE_RADIUS * 1.006);
      const markerGroup = new THREE.Group();
      markerGroup.position.copy(pos);
      markerGroup.lookAt(pos.clone().multiplyScalar(2));

      const ringMat = new THREE.MeshBasicMaterial({
        color: amberColor,
        side: THREE.DoubleSide,
        transparent: true,
        opacity: 0.9,
      });
      const dotMat = new THREE.MeshBasicMaterial({
        color: new THREE.Color(getTokenColor("--color-on-primary")),
        side: THREE.DoubleSide,
      });

      markerGroup.add(new THREE.Mesh(ringGeo, ringMat));
      markerGroup.add(new THREE.Mesh(dotGeo, dotMat));
      this.eventRingsGroup.add(markerGroup);
    }
  }

  public latLngToVector3(lat: number, lng: number, radius = this.GLOBE_RADIUS): THREE.Vector3 {
    const phi = (90 - lat) * (Math.PI / 180);
    const theta = (lng + 180) * (Math.PI / 180);
    const x = -(radius * Math.sin(phi) * Math.cos(theta));
    const z = radius * Math.sin(phi) * Math.sin(theta);
    const y = radius * Math.cos(phi);
    return new THREE.Vector3(x, y, z);
  }

  public projectLatLngToScreen(lat: number, lng: number): ScreenProjection {
    const worldPos = this.latLngToVector3(lat, lng, this.GLOBE_RADIUS * 1.01);
    const camPos = this.camera.position.clone();
    const toCamera = camPos.clone().normalize();
    const normal = worldPos.clone().normalize();
    const facingRatio = normal.dot(toCamera);

    const projected = worldPos.clone().project(this.camera);
    const width = this.container.clientWidth;
    const height = this.container.clientHeight;

    const x = (projected.x * 0.5 + 0.5) * width;
    const y = (-(projected.y * 0.5) + 0.5) * height;

    return {
      x,
      y,
      visible: facingRatio > 0.18,
      facingRatio,
    };
  }

  public flyTo(lat: number, lng: number, distance?: number): void {
    this.targetLat = Math.max(-72, Math.min(72, lat));
    this.targetLng = lng;
    this.velocityLat = 0;
    this.velocityLng = 0;
    if (distance !== undefined) {
      this.targetDistance = Math.max(1.65, Math.min(4.2, distance));
    }
  }

  public getCameraDistance(): number {
    return this.currentDistance;
  }

  private setupInteractionListeners(): void {
    const dom = this.renderer.domElement;

    dom.addEventListener("pointerdown", (e: PointerEvent) => {
      this.isDragging = true;
      this.pointerDownX = e.clientX;
      this.pointerDownY = e.clientY;
      this.lastPointerX = e.clientX;
      this.lastPointerY = e.clientY;
      this.velocityLat = 0;
      this.velocityLng = 0;
      dom.setPointerCapture(e.pointerId);
    });

    dom.addEventListener("pointermove", (e: PointerEvent) => {
      if (!this.isDragging) return;
      const dx = e.clientX - this.lastPointerX;
      const dy = e.clientY - this.lastPointerY;
      this.lastPointerX = e.clientX;
      this.lastPointerY = e.clientY;

      const sensitivity = 0.18 * (this.currentDistance / 2.8);
      this.targetLng -= dx * sensitivity;
      this.targetLat = Math.max(-75, Math.min(75, this.targetLat + dy * sensitivity));

      this.velocityLng = -dx * sensitivity * 0.35;
      this.velocityLat = dy * sensitivity * 0.35;
    });

    const endDrag = (e: PointerEvent) => {
      if (!this.isDragging) return;
      this.isDragging = false;
      const movedDist = Math.hypot(e.clientX - this.pointerDownX, e.clientY - this.pointerDownY);
      if (movedDist < 5 && this.onGlobeClickCallback) {
        this.handleGlobeRayClick(e.clientX, e.clientY);
      }
    };

    dom.addEventListener("pointerup", endDrag);
    dom.addEventListener("pointercancel", endDrag);

    dom.addEventListener(
      "wheel",
      (e: WheelEvent) => {
        e.preventDefault();
        const zoomStep = e.deltaY * 0.0014;
        this.targetDistance = Math.max(1.62, Math.min(4.2, this.targetDistance + zoomStep));
      },
      { passive: false }
    );

    window.addEventListener("resize", () => {
      const w = this.container.clientWidth || window.innerWidth;
      const h = this.container.clientHeight || window.innerHeight;
      this.camera.aspect = w / h;
      this.camera.updateProjectionMatrix();
      this.renderer.setSize(w, h);
    });
  }

  private handleGlobeRayClick(clientX: number, clientY: number): void {
    const rect = this.renderer.domElement.getBoundingClientRect();
    const ndc = new THREE.Vector2(
      ((clientX - rect.left) / rect.width) * 2 - 1,
      -((clientY - rect.top) / rect.height) * 2 + 1
    );
    const raycaster = new THREE.Raycaster();
    raycaster.setFromCamera(ndc, this.camera);
    const hits = raycaster.intersectObject(this.earthMesh);
    if (hits.length > 0) {
      const pt = hits[0].point.clone().normalize();
      const lat = 90 - (Math.acos(pt.y) * 180) / Math.PI;
      const lng = ((Math.atan2(pt.z, -pt.x) * 180) / Math.PI) - 180;
      const normalizedLng = ((lng + 540) % 360) - 180;
      if (this.onGlobeClickCallback) {
        this.onGlobeClickCallback(lat, normalizedLng);
      }
    }
  }

  private updateCameraPosition(): void {
    if (!this.isDragging) {
      if (this.autoRotate) {
        this.targetLng += 0.08;
      }
      this.targetLng += this.velocityLng;
      this.targetLat = Math.max(-75, Math.min(75, this.targetLat + this.velocityLat));
      this.velocityLng *= 0.92;
      this.velocityLat *= 0.92;
    }

    this.currentLat += (this.targetLat - this.currentLat) * 0.12;
    this.currentLng += (this.targetLng - this.currentLng) * 0.12;
    this.currentDistance += (this.targetDistance - this.currentDistance) * 0.14;

    const camPos = this.latLngToVector3(this.currentLat, this.currentLng, this.currentDistance);
    this.camera.position.copy(camPos);
    this.camera.lookAt(0, 0, 0);
  }

  private animate = (): void => {
    requestAnimationFrame(this.animate);
    this.updateCameraPosition();
    this.renderer.render(this.scene, this.camera);
    if (this.onFrameCallback) {
      this.onFrameCallback();
    }
  };
}
