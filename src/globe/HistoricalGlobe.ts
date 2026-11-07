import * as THREE from "three";
import { feature } from "topojson-client";
import landTopology from "world-atlas/land-110m.json";
import {
  getActiveEventsForYear,
  getActivePolitiesForYear,
  type HistoricalEventItem,
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
  private cloudsMesh!: THREE.Mesh;
  private eventRingsGroup: THREE.Group;

  private baseCanvas: HTMLCanvasElement;
  private landMaskCanvas: HTMLCanvasElement;
  private territoryCanvas: HTMLCanvasElement;
  private territoryTexture: THREE.CanvasTexture;

  private targetLat = 18.0;
  private targetLng = 55.0;
  private currentLat = 18.0;
  private currentLng = 55.0;
  private targetDistance = 2.65;
  private currentDistance = 2.65;

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

    this.camera = new THREE.PerspectiveCamera(38, width / height, 0.1, 100);
    this.renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: false,
      powerPreference: "high-performance",
    });
    this.renderer.setSize(width, height);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.08;
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
    this.buildRealisticEarthBaseTexture();
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
    const ambientLight = new THREE.AmbientLight(0xffffff, 1.25);
    this.scene.add(ambientLight);

    const sunLight = new THREE.DirectionalLight(0xfff8ee, 1.6);
    sunLight.position.set(4.5, 3.0, 4.0);
    this.scene.add(sunLight);

    const softFill = new THREE.DirectionalLight(0x4a6fa5, 0.55);
    softFill.position.set(-4.0, -1.5, -2.5);
    this.scene.add(softFill);
  }

  private setupStarfield(): void {
    const starCount = 1400;
    const positions = new Float32Array(starCount * 3);
    const colors = new Float32Array(starCount * 3);

    const white = new THREE.Color(0xf1f5f9);
    const softBlue = new THREE.Color(0x93c5fd);

    for (let i = 0; i < starCount; i++) {
      const r = 20 + Math.random() * 30;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);

      positions[i * 3] = r * Math.sin(phi) * Math.cos(theta);
      positions[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
      positions[i * 3 + 2] = r * Math.cos(phi);

      const color = Math.random() > 0.8 ? softBlue : white;
      const bright = 0.35 + Math.random() * 0.65;
      colors[i * 3] = color.r * bright;
      colors[i * 3 + 1] = color.g * bright;
      colors[i * 3 + 2] = color.b * bright;
    }

    const starGeo = new THREE.BufferGeometry();
    starGeo.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    starGeo.setAttribute("color", new THREE.BufferAttribute(colors, 3));

    const starMat = new THREE.PointsMaterial({
      size: 0.07,
      vertexColors: true,
      transparent: true,
      opacity: 0.8,
      sizeAttenuation: true,
    });

    const stars = new THREE.Points(starGeo, starMat);
    this.scene.add(stars);
  }

  /**
   * Generates a photorealistic NASA Blue Marble-style Earth texture with:
   * - Deep oceanic bathymetry
   * - Continental shelf turquoise shallow water fringe
   * - Realistic biome landcover (lush tropical rainforests, Sahara/Arabian/Gobi warm desert sand, temperate plains, mountain shading)
   * - Polar ice caps
   */
  private buildRealisticEarthBaseTexture(): void {
    const w = this.baseCanvas.width;
    const h = this.baseCanvas.height;
    const baseCtx = this.baseCanvas.getContext("2d")!;
    const maskCtx = this.landMaskCanvas.getContext("2d")!;

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

    // 1. Render Pure Land Mask
    maskCtx.clearRect(0, 0, w, h);
    maskCtx.fillStyle = "#ffffff";
    traceLandPaths(maskCtx);
    maskCtx.fill();

    // 2. Deep Realistic Bathymetric Oceans
    const oceanGrad = baseCtx.createLinearGradient(0, 0, 0, h);
    oceanGrad.addColorStop(0, "#08142c");
    oceanGrad.addColorStop(0.25, "#0b1c3e");
    oceanGrad.addColorStop(0.5, "#0d244f");
    oceanGrad.addColorStop(0.75, "#0b1c3e");
    oceanGrad.addColorStop(1, "#08142c");
    baseCtx.fillStyle = oceanGrad;
    baseCtx.fillRect(0, 0, w, h);

    // 3. Glowing Continental Shelf Shallow Water (Sunda Shelf, North Sea, Caribbean)
    baseCtx.save();
    baseCtx.shadowColor = "#1d4ed8";
    baseCtx.shadowBlur = 18;
    baseCtx.fillStyle = "#163c78";
    traceLandPaths(baseCtx);
    baseCtx.fill();
    baseCtx.restore();

    // 4. Photorealistic Biome Terrain on Land
    const biomeCanvas = document.createElement("canvas");
    biomeCanvas.width = w;
    biomeCanvas.height = h;
    const bCtx = biomeCanvas.getContext("2d")!;

    // Base temperate vegetation (rich muted forest olive)
    bCtx.fillStyle = "#2d4f34";
    bCtx.fillRect(0, 0, w, h);

    // Equatorial Tropical Rainforest Belt (Nusantara, Central Africa, Amazon)
    const tropGrad = bCtx.createLinearGradient(0, h * 0.40, 0, h * 0.62);
    tropGrad.addColorStop(0, "transparent");
    tropGrad.addColorStop(0.5, "#1e5b2c");
    tropGrad.addColorStop(1, "transparent");
    bCtx.fillStyle = tropGrad;
    bCtx.fillRect(0, h * 0.40, w, h * 0.22);

    const drawDesertBiome = (
      lngCenter: number,
      latCenter: number,
      lngRadius: number,
      latRadius: number,
      color: string,
      alpha: number
    ) => {
      const cx = ((lngCenter + 180) / 360) * w;
      const cy = ((90 - latCenter) / 180) * h;
      const rx = (lngRadius / 360) * w;
      const ry = (latRadius / 180) * h;

      bCtx.save();
      bCtx.translate(cx, cy);
      bCtx.scale(1, ry / rx);
      const grad = bCtx.createRadialGradient(0, 0, rx * 0.1, 0, 0, rx);
      grad.addColorStop(0, color);
      grad.addColorStop(1, "transparent");
      bCtx.globalAlpha = alpha;
      bCtx.fillStyle = grad;
      bCtx.beginPath();
      bCtx.arc(0, 0, rx, 0, Math.PI * 2);
      bCtx.fill();
      bCtx.restore();
    };

    // Realistic desert & arid regions (Sahara, Arabia, Iran, Thar, Gobi, Outback, SW USA)
    drawDesertBiome(16, 23, 34, 13, "#c99a5e", 0.96); // Sahara
    drawDesertBiome(47, 24, 20, 13, "#d4a468", 0.96); // Arabia
    drawDesertBiome(56, 32, 16, 10, "#ab8452", 0.88); // Iran / Mesopotamia
    drawDesertBiome(72, 43, 24, 11, "#9e8253", 0.85); // Central Asian Steppes
    drawDesertBiome(104, 42, 22, 10, "#c49f6b", 0.88); // Gobi / Taklamakan
    drawDesertBiome(88, 33, 16, 8, "#7a6a58", 0.90); // Tibetan Plateau
    drawDesertBiome(133, -24, 18, 10, "#bd7b4c", 0.90); // Australian Outback
    drawDesertBiome(-107, 34, 16, 11, "#9e825a", 0.80); // American Southwest
    drawDesertBiome(22, -26, 14, 9, "#b39462", 0.78); // Kalahari

    // Polar snow/ice caps (Arctic & Antarctic)
    const polarGradNorth = bCtx.createLinearGradient(0, 0, 0, h * 0.14);
    polarGradNorth.addColorStop(0, "#e2e8f0");
    polarGradNorth.addColorStop(0.8, "#cbd5e1");
    polarGradNorth.addColorStop(1, "transparent");
    bCtx.fillStyle = polarGradNorth;
    bCtx.fillRect(0, 0, w, h * 0.14);

    const polarGradSouth = bCtx.createLinearGradient(0, h * 0.86, 0, h);
    polarGradSouth.addColorStop(0, "transparent");
    polarGradSouth.addColorStop(0.2, "#cbd5e1");
    polarGradSouth.addColorStop(1, "#f1f5f9");
    bCtx.fillStyle = polarGradSouth;
    bCtx.fillRect(0, h * 0.86, w, h * 0.14);

    // Clip biome colors to exact Natural Earth continents
    bCtx.globalCompositeOperation = "destination-in";
    bCtx.drawImage(this.landMaskCanvas, 0, 0);

    // Composite onto base ocean canvas
    baseCtx.drawImage(biomeCanvas, 0, 0);

    // Subtle natural coastline border
    baseCtx.strokeStyle = "#38bdf8";
    baseCtx.lineWidth = 0.8;
    baseCtx.globalAlpha = 0.45;
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
      roughness: 0.65,
      metalness: 0.12,
    });

    this.earthMesh = new THREE.Mesh(sphereGeo, earthMat);
    this.globeGroup.add(this.earthMesh);

    // Historical Territory Overlay Mesh
    const territoryGeo = new THREE.SphereGeometry(this.GLOBE_RADIUS * 1.002, 96, 96);
    const territoryMat = new THREE.MeshBasicMaterial({
      map: this.territoryTexture,
      transparent: true,
      opacity: 0.88,
      depthWrite: false,
    });
    this.territoryMesh = new THREE.Mesh(territoryGeo, territoryMat);
    this.globeGroup.add(this.territoryMesh);

    // Realistic Delicate Atmospheric Rim Shader (NOT an opaque giant disc!)
    const atmosGeo = new THREE.SphereGeometry(this.GLOBE_RADIUS * 1.025, 64, 64);
    const atmosMat = new THREE.ShaderMaterial({
      vertexShader: `
        varying vec3 vNormal;
        void main() {
          vNormal = normalize(normalMatrix * normal);
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
      fragmentShader: `
        varying vec3 vNormal;
        void main() {
          float intensity = pow(0.72 - dot(vNormal, vec3(0.0, 0.0, 1.0)), 2.8);
          intensity = clamp(intensity, 0.0, 1.0);
          vec3 atmosphereColor = vec3(0.24, 0.55, 0.98);
          gl_FragColor = vec4(atmosphereColor, intensity * 0.75);
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
   * Redraws historical empires on the 3D globe with authentic semi-transparent
   * pastel/rich tints clipped to the real Natural Earth landmass.
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
      ctx.globalAlpha = isHighlighted ? 0.85 : 0.62;
      ctx.fill();

      ctx.lineWidth = isHighlighted ? 4.5 : 2.0;
      ctx.strokeStyle = isHighlighted ? "#ffffff" : color;
      ctx.globalAlpha = 0.9;
      ctx.stroke();
    }
    ctx.restore();

    // Clip territory polygons cleanly against Natural Earth land mask
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
    const ringGeo = new THREE.RingGeometry(0.007, 0.014, 20);
    const dotGeo = new THREE.CircleGeometry(0.005, 16);
    const amberColor = new THREE.Color(getTokenColor("--pin-badge-amber"));
    const whiteColor = new THREE.Color(0xffffff);

    for (const ev of activeEvents) {
      const pos = this.latLngToVector3(ev.lat, ev.lng, this.GLOBE_RADIUS * 1.005);
      const markerGroup = new THREE.Group();
      markerGroup.position.copy(pos);
      markerGroup.lookAt(pos.clone().multiplyScalar(2));

      const ringMat = new THREE.MeshBasicMaterial({
        color: amberColor,
        side: THREE.DoubleSide,
        transparent: true,
        opacity: 0.85,
      });
      const dotMat = new THREE.MeshBasicMaterial({
        color: whiteColor,
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
    const worldPos = this.latLngToVector3(lat, lng, this.GLOBE_RADIUS * 1.008);
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
      visible: facingRatio > 0.38,
      facingRatio,
    };
  }

  public flyTo(lat: number, lng: number, distance?: number): void {
    this.targetLat = Math.max(-72, Math.min(72, lat));
    this.targetLng = lng;
    this.velocityLat = 0;
    this.velocityLng = 0;
    if (distance !== undefined) {
      this.targetDistance = Math.max(1.7, Math.min(3.8, distance));
    }
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

      const sensitivity = 0.16 * (this.currentDistance / 2.6);
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
        const zoomStep = e.deltaY * 0.0012;
        this.targetDistance = Math.max(1.7, Math.min(3.8, this.targetDistance + zoomStep));
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
        this.targetLng += 0.06;
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
