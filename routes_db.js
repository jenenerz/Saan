// ── LOCAL ROUTE DATABASE ──────────────────────────────────────────────────
// This is the agent's "knowledge base" — real static data it queries via tools

const ROUTES_DB = {

  // ── MRT-3 STATIONS (index = station number, south=0) ──
  mrt3: {
    name: "MRT-3",
    stations: [
      "Taft Avenue", "Magallanes", "Ayala", "Buendia", "Guadalupe",
      "Boni", "Shaw Boulevard", "Ortigas", "Santolan", "Araneta-Cubao",
      "GMA-Kamuning", "Quezon Avenue", "North Avenue"
    ],
    // Fare matrix: based on number of stops
    farePerStops: { 1:13, 2:13, 3:15, 4:16, 5:18, 6:20, 7:22, 8:24, 9:26, 10:28, 11:28, 12:28 },
    avgMinPerStop: 2.5
  },

  // ── LRT-1 STATIONS (index = station number, south=0) ──
  lrt1: {
    name: "LRT-1",
    stations: [
      "Baclaran", "EDSA", "Libertad", "Gil Puyat", "Vito Cruz",
      "Quirino", "Pedro Gil", "Central Terminal", "UN Avenue",
      "Carriedo", "Doroteo Jose", "Bambang", "Tayuman",
      "Blumentritt", "Abad Santos", "R. Papa", "5th Avenue", "Monumento"
    ],
    farePerStops: { 1:12, 2:12, 3:13, 4:14, 5:15, 6:16, 7:17, 8:18, 9:19, 10:20, 11:21, 12:22, 13:24, 14:26, 15:28, 16:30, 17:30 },
    avgMinPerStop: 2.8
  },

  // ── LRT-2 STATIONS (west=0) ──
  lrt2: {
    name: "LRT-2",
    stations: [
      "Recto", "Legarda", "Pureza", "V. Mapa", "J. Ruiz",
      "Gilmore", "Betty Go-Belmonte", "Araneta-Cubao",
      "Anonas", "Katipunan", "Santolan"
    ],
    farePerStops: { 1:12, 2:12, 3:13, 4:14, 5:15, 6:16, 7:17, 8:18, 9:20, 10:22 },
    avgMinPerStop: 3
  },

  // ── MAJOR JEEPNEY ROUTES ──
  jeepneyRoutes: [
    { id: "J01", from: ["Paranaque", "Las Pinas", "Paranaque Central", "BF Homes"], to: ["Baclaran", "LRT Baclaran"], via: "Quirino Ave", estKm: 6, estMin: 25 },
    { id: "J02", from: ["Alabang", "Muntinlupa"], to: ["Zapote", "Las Pinas"], via: "Alabang-Zapote Rd", estKm: 5, estMin: 20 },
    { id: "J03", from: ["Cubao", "Araneta"], to: ["Quiapo", "Manila"], via: "Aurora Blvd", estKm: 7, estMin: 35 },
    { id: "J04", from: ["Makati", "Ayala", "BGC"], to: ["Baclaran", "Pasay"], via: "EDSA", estKm: 8, estMin: 40 },
    { id: "J05", from: ["Monumento", "Caloocan"], to: ["Divisoria", "Quiapo"], via: "Rizal Ave", estKm: 6, estMin: 30 },
    { id: "J06", from: ["Quiapo", "Manila"], to: ["Baclaran", "Pasay"], via: "Taft Ave", estKm: 7, estMin: 35 },
    { id: "J07", from: ["Marikina", "Santolan"], to: ["Cubao", "Araneta"], via: "Marcos Highway", estKm: 8, estMin: 35 },
    { id: "J08", from: ["BGC", "Taguig"], to: ["Ayala MRT", "Makati"], via: "Kalayaan", estKm: 3, estMin: 15 },
    { id: "J09", from: ["Novaliches", "Fairview"], to: ["Quezon Ave MRT", "North Ave MRT"], via: "Commonwealth", estKm: 10, estMin: 45 },
    { id: "J10", from: ["Antipolo", "Cainta"], to: ["Santolan LRT2", "Cubao"], via: "Ortigas Ave", estKm: 12, estMin: 55 },
    { id: "J11", from: ["Paranaque", "Sucat"], to: ["Taft Ave MRT", "EDSA"], via: "South Luzon Expressway feeder", estKm: 9, estMin: 40 },
    { id: "J12", from: ["Pasig", "Ortigas"], to: ["Cubao", "Araneta"], via: "EDSA", estKm: 5, estMin: 25 }
  ],

  // ── P2P BUS ROUTES ──
  p2pRoutes: [
    { id: "P01", from: ["Alabang", "Muntinlupa"], to: ["BGC", "Taguig"], fare: 80, estMin: 45 },
    { id: "P02", from: ["Alabang", "Muntinlupa"], to: ["Makati", "Ayala"], fare: 70, estMin: 40 },
    { id: "P03", from: ["Paranaque", "BF Homes"], to: ["BGC", "Taguig"], fare: 65, estMin: 35 },
    { id: "P04", from: ["Las Pinas", "Pamplona"], to: ["Makati", "Ayala"], fare: 65, estMin: 45 },
    { id: "P05", from: ["Cubao", "Araneta"], to: ["BGC", "Taguig"], fare: 85, estMin: 40 },
    { id: "P06", from: ["Novaliches"], to: ["Makati", "Ayala"], fare: 90, estMin: 60 }
  ],

  // ── TRANSFER HUBS ──
  transferHubs: {
    "Baclaran": {
      lines: ["LRT-1"],
      nearbyJeepney: ["to Paranaque", "to Pasay", "to Taft Ave"],
      note: "Main southern LRT-1 terminal"
    },
    "EDSA Pasay": {
      lines: ["LRT-1"],
      nearbyJeepney: ["to MRT Taft Ave (200m walk)"],
      note: "Walk 200m north to MRT-3 Taft Ave for transfer"
    },
    "Taft Avenue MRT": {
      lines: ["MRT-3"],
      nearbyLines: ["LRT-1 EDSA/Baclaran (200m walk)"],
      note: "Southern MRT-3 terminal. Walk south 200m to LRT-1"
    },
    "Araneta-Cubao": {
      lines: ["MRT-3", "LRT-2"],
      note: "Direct interchange between MRT-3 and LRT-2"
    },
    "Doroteo Jose": {
      lines: ["LRT-1", "LRT-2"],
      nearbyLines: ["LRT-2 Recto (short walk)"],
      note: "Transfer point between LRT-1 and LRT-2 via short walk"
    },
    "Monumento": {
      lines: ["LRT-1"],
      note: "Northern LRT-1 terminal. Jeepneys to Caloocan, Malabon, Novaliches"
    },
    "North Avenue MRT": {
      lines: ["MRT-3"],
      note: "Northern MRT-3 terminal. Jeepneys to Fairview, Commonwealth, Novaliches"
    }
  },

  // ── AREA ALIASES (common names → normalized) ──
  aliases: {
    "paranaque": "Paranaque",
    "parañaque": "Paranaque",
    "las piñas": "Las Pinas",
    "las pinas": "Las Pinas",
    "cubao": "Cubao",
    "araneta": "Cubao",
    "makati": "Makati",
    "bgc": "BGC",
    "bonifacio global city": "BGC",
    "taguig": "BGC",
    "quiapo": "Quiapo",
    "manila": "Manila",
    "alabang": "Alabang",
    "muntinlupa": "Alabang",
    "monumento": "Monumento",
    "caloocan": "Monumento",
    "sm north": "North Avenue MRT",
    "sm north edsa": "North Avenue MRT",
    "quezon city": "Quezon Avenue MRT",
    "qc": "Quezon Avenue MRT",
    "pasig": "Pasig",
    "ortigas": "Ortigas",
    "marikina": "Marikina",
    "antipolo": "Antipolo",
    "novaliches": "Novaliches",
    "fairview": "Novaliches",
    "baclaran": "Baclaran",
    "pasay": "Baclaran",
    "taft": "Taft Avenue MRT"
  }
};