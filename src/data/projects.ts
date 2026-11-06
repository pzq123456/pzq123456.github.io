// Website-only gallery data, extracted verbatim from src/data/portfolio.ts (M2 website adapter).
// Not sourced from resume/data/base.json — resume projects stay in the PDF/CV pipeline.

import evImage from "../../imgs/Population&EVChargeStation.png";
import busImage from "../../imgs/HKbus.png";
import campusImage from "../../imgs/3D Campus for PolyU.png";

/**
 * 项目集 (Gallery)
 */
export const GALLERY_PROJECTS = [
  {
    title: { en: "Global EV Charge Stations", zh: "全球充电站可视化" },
    image: evImage,
    desc: {
      en: "Visualizing 100,000+ points using advanced spatial clustering.",
      zh: "利用空间聚类算法展示全球 10w+ 充电桩分布。",
    },
    resources: {
      github: "https://github.com/pzq123456/EVChargerSite",
      website: "https://pzq123456.github.io/EVChargerSite/",
    },
  },
  {
    title: { en: "HK Bus Trajectory", zh: "香港巴士轨迹大数据" },
    link: "https://pzq123456.github.io/HKebus/map/B.html",
    image: busImage,
    desc: {
      en: "Real-time parsing of 1GB+ trajectory data using WebWorkers.",
      zh: "通过 WebWorker 异步解析 1GB+ 的巴士轨迹时空数据。",
    },
    resources: {
      github: "https://github.com/pzq123456/HKebus",
      website: "https://pzq123456.github.io/HKebus/",
    },
  },
  {
    title: { en: "3D Campus for PolyU", zh: "理大 3D 校园" },
    image: campusImage,
    desc: {
      en: "Hybrid 3D map using DeckGL and OpenStreetMap building data.",
      zh: "结合 DeckGL 与 OSM 构建的 3D 混合虚拟校园地图。",
    },
    resources: {
      website: "https://pzq123456.github.io/LSGI548/dev/",
    },
  },
];
