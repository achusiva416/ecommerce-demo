/** Static demo data for the Analytics page */

export const STATS = {
  // Revenue & Orders
  totalRevenue: 1245800,
  totalOrders: 1540,
  avgOrderValue: 809,

  // Shipment Intelligence
  totalShipmentCost: 92400,
  avgCostPerShipment: 60,
  itemsToShip: 38,
  bestShipmentPartner: "Speed & Safe",
  bestPartnerAvgCost: 42,

  // Inventory Snapshot
  totalProducts: 124,
  returnRate: 3.2,
};

export const SALES_TREND = {
  daily: [
    { name: "Mon", revenue: 45000, orders: 55 },
    { name: "Tue", revenue: 52000, orders: 62 },
    { name: "Wed", revenue: 48000, orders: 58 },
    { name: "Thu", revenue: 61000, orders: 75 },
    { name: "Fri", revenue: 55000, orders: 68 },
    { name: "Sat", revenue: 72000, orders: 90 },
    { name: "Sun", revenue: 68000, orders: 85 },
  ],
  weekly: [
    { name: "Week 1", revenue: 280000, orders: 350 },
    { name: "Week 2", revenue: 310000, orders: 380 },
    { name: "Week 3", revenue: 295000, orders: 365 },
    { name: "Week 4", revenue: 350000, orders: 420 },
  ],
  monthly: [
    { name: "Jan", revenue: 1100000, orders: 1350 },
    { name: "Feb", revenue: 1245800, orders: 1540 },
    { name: "Mar", revenue: 1180000, orders: 1420 },
    { name: "Apr", revenue: 1350000, orders: 1680 },
    { name: "May", revenue: 1420000, orders: 1750 },
    { name: "Jun", revenue: 1380000, orders: 1690 },
  ],
  yearly: [
    { name: "2023", revenue: 12500000, orders: 15400 },
    { name: "2024", revenue: 14800000, orders: 18200 },
    { name: "2025", revenue: 15600000, orders: 19100 },
  ],
};

export const TOP_PRODUCTS = [
  { name: "Karungali Mala 8mm", shortName: "Krg Mala 8mm", revenue: 245000 },
  { name: "Spatika Mala Premium", shortName: "Spatika Prem", revenue: 198000 },
  { name: "Rudraksha Bracelet", shortName: "Rud Brc", revenue: 167000 },
  { name: "Lotus Seed Mala", shortName: "Lotus Mala", revenue: 145000 },
  { name: "Copper Bracelet", shortName: "Copper Brc", revenue: 128000 },
  { name: "Sandalwood Mala", shortName: "Sandal Mala", revenue: 112000 },
  { name: "Tulsi Bead Bracelet", shortName: "Tulsi Brc", revenue: 95000 },
  { name: "Ammonite Stone", shortName: "Ammonite", revenue: 84000 },
  { name: "Sphatik Pyramid", shortName: "Sphatik Pyr", revenue: 76000 },
  { name: "Vastu Copper Plate", shortName: "Vastu Plt", revenue: 65000 },
];

export const PRODUCTS = [
  { id: 1, name: "Karungali Bead 10mm", code: "KR-10", stock: 0, recommendedQty: 50, price: 450, status: "out" },
  { id: 2, name: "Rudraksha 5 Mukhi", code: "RD-05", stock: 0, recommendedQty: 100, price: 120, status: "out" },
  { id: 3, name: "Lotus Mala Deluxe", code: "LT-DX", stock: 4, recommendedQty: 25, price: 850, status: "low" },
  { id: 4, name: "Sandalwood Stick", code: "SW-01", stock: 8, recommendedQty: 40, price: 300, status: "low" },
  { id: 5, name: "Crystal Pyramid Small", code: "CP-SM", stock: 45, recommendedQty: 0, price: 550, status: "healthy" },
  { id: 6, name: "Copper Vessel", code: "CV-01", stock: 32, recommendedQty: 0, price: 1250, status: "healthy" },
  { id: 7, name: "Tulsi Japa Mala", code: "TJ-01", stock: 120, recommendedQty: 0, price: 150, status: "healthy" },
];
