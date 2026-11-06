/**
 * 获取当前年份
 */
export const getCurrentYear = () => new Date().getFullYear();

/**
 * 获取标准化的日期字符串 (YYYY-MM-DD)
 */
export const getSystemTimestamp = () => new Date().toISOString().substring(0, 10);

/**
 * 地理信息常量
 */
export const GEO_METADATA = {
  lat: "22.3027° N",
  lng: "114.1772° E",
  location: "Kowloon, Hong Kong",
  idAuth: "POLYU_RA_2025"
};