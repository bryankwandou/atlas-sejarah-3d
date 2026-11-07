/// <reference types="vite/client" />

declare module "world-atlas/land-110m.json" {
  const topology: {
    type: "Topology";
    objects: {
      land: Record<string, unknown>;
    };
    arcs: number[][][];
    transform?: {
      scale: [number, number];
      translate: [number, number];
    };
  };
  export default topology;
}
