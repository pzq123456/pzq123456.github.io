import { TrendingUp } from "lucide-react";

// 导入回测图
import alpha94Image from "../../imgs/alpha_US_94fd5000875c.png";
import alpha08Image from "../../imgs/alpha_US_089d8f944c00.png";

/**
 * 量化研究专用接口定义
 */
export interface QuantFactor {
  id: string;
  image: string;
  metrics: {
    sharpeThreeYear: number;
    sharpeRollingThreeMonth: number;
  };
}

export const QUANT_RESEARCH_DATA = {
  id: "quant-research",
  title: { en: "Quantitative Alpha Lab", zh: "量化因子实验室" },
  period: "2025.12 — 2026.02",
  icon: TrendingUp,
  summary: {
    en: "Automated alpha discovery pipeline using Reinforcement Learning and Symbolic Regression. Factors are mined from full-scale US market data and cross-validated in the A-share market.",
    zh: "基于强化学习与符号回归的自动化因子挖掘管线。因子在美股全量数据集中挖掘，并经过 A 股市场全量数据的滚动交叉验证。"
  },
  technicalStack: ["Python", "PyTorch", "DuckDB", "VectorBT", "Matplotlib"],
  highlights: {
    en: [
      "End-to-end pipeline from raw data cleaning to backtesting.",
      "High-performance data storage and querying powered by DuckDB.",
      "Custom CLI tool for stock selection and manual trade tracking."
    ],
    zh: [
      "构建了从原始数据清洗入库到因子回测的完整端到端管线。",
      "基于 DuckDB 实现高性能时空数据存储与查询。",
      "开发个人量化 CLI 工具，支持自动化选股与手动操作追踪。"
    ]
  },
  factors: [
    {
      id: "alpha_US_94fd5000875c",
      image: alpha94Image,
      metrics: {
        sharpeThreeYear: 1.602,
        sharpeRollingThreeMonth: 2.161
      }
    },
    {
      id: "alpha_US_089d8f944c00",
      image: alpha08Image,
      metrics: {
        sharpeThreeYear: 1.221,
        sharpeRollingThreeMonth: 0.749
      }
    }
  ]
};