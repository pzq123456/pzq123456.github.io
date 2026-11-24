// Website image adapter for gallery projects.
// All project copy now lives in resume/data/base.json and is generated into
// portfolio.generated.ts; this file only maps stable image keys to assets.

import evImage from "../../imgs/Population&EVChargeStation.webp";
import busImage from "../../imgs/HKbus.webp";
import campusImage from "../../imgs/3D Campus for PolyU.webp";
import { GALLERY_PROJECTS as GENERATED } from "./portfolio.generated";

const IMAGES: Record<string, string> = {
  ev: evImage,
  bus: busImage,
  campus: campusImage,
};

export const GALLERY_PROJECTS = GENERATED.map((project) => ({
  ...project,
  image: project.imageKey ? IMAGES[project.imageKey] : null,
}));
