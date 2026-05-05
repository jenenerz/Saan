// ── REAL AGENT TOOLS ─────────────────────────────────────────────────────
// These are the actual JS functions the agent calls.
// Gemini decides WHEN and WHICH to call — that's what makes it agentic.

const AgentTools = {

  // ── TOOL 1: lookup_route ───────────────────────────────────────────────
  lookup_route: function(origin, destination) {
    const norm = (s) => (ROUTES_DB.aliases[s.toLowerCase()] || s).toLowerCase();
    const o = norm(origin);
    const d = norm(destination);

    const results = { rail: [], jeepney: [], p2p: [], transfers: [] };

    // Check MRT-3
    const mrt = ROUTES_DB.mrt3;
    const oMrt = mrt.stations.findIndex(s => s.toLowerCase().includes(o) || o.includes(s.toLowerCase()));
    const dMrt = mrt.stations.findIndex(s => s.toLowerCase().includes(d) || d.includes(s.toLowerCase()));
    if (oMrt !== -1 && dMrt !== -1) {
      const stops = Math.abs(dMrt - oMrt);
      results.rail.push({ line: "MRT-3", from: mrt.stations[oMrt], to: mrt.stations[dMrt], stops, direction: dMrt > oMrt ? "northbound" : "southbound" });
    }

    // Check LRT-1
    const lrt1 = ROUTES_DB.lrt1;
    const oL1 = lrt1.stations.findIndex(s => s.toLowerCase().includes(o) || o.includes(s.toLowerCase()));
    const dL1 = lrt1.stations.findIndex(s => s.toLowerCase().includes(d) || d.includes(s.toLowerCase()));
    if (oL1 !== -1 && dL1 !== -1) {
      const stops = Math.abs(dL1 - oL1);
      results.rail.push({ line: "LRT-1", from: lrt1.stations[oL1], to: lrt1.stations[dL1], stops, direction: dL1 > oL1 ? "northbound" : "southbound" });
    }

    // Check LRT-2
    const lrt2 = ROUTES_DB.lrt2;
    const oL2 = lrt2.stations.findIndex(s => s.toLowerCase().includes(o) || o.includes(s.toLowerCase()));
    const dL2 = lrt2.stations.findIndex(s => s.toLowerCase().includes(d) || d.includes(s.toLowerCase()));
    if (oL2 !== -1 && dL2 !== -1) {
      const stops = Math.abs(dL2 - oL2);
      results.rail.push({ line: "LRT-2", from: lrt2.stations[oL2], to: lrt2.stations[dL2], stops, direction: dL2 > oL2 ? "eastbound" : "westbound" });
    }

    // Check jeepney routes
    ROUTES_DB.jeepneyRoutes.forEach(r => {
      const fromMatch = r.from.some(f => f.toLowerCase().includes(o) || o.includes(f.toLowerCase()));
      const toMatch   = r.to.some(t => t.toLowerCase().includes(d) || d.includes(t.toLowerCase()));
      if (fromMatch && toMatch) {
        results.jeepney.push({ route: r.id, from: r.from[0], to: r.to[0], via: r.via, estKm: r.estKm, estMin: r.estMin });
      }
    });

    // Check P2P buses
    ROUTES_DB.p2pRoutes.forEach(r => {
      const fromMatch = r.from.some(f => f.toLowerCase().includes(o) || o.includes(f.toLowerCase()));
      const toMatch   = r.to.some(t => t.toLowerCase().includes(d) || d.includes(t.toLowerCase()));
      if (fromMatch && toMatch) {
        results.p2p.push({ route: r.id, from: r.from[0], to: r.to[0], fare: r.fare, estMin: r.estMin });
      }
    });

    // Suggest known transfer hubs relevant to origin/destination
    Object.entries(ROUTES_DB.transferHubs).forEach(([hub, info]) => {
      if (hub.toLowerCase().includes(o) || hub.toLowerCase().includes(d) ||
          o.includes(hub.toLowerCase().split(' ')[0]) || d.includes(hub.toLowerCase().split(' ')[0])) {
        results.transfers.push({ hub, lines: info.lines, note: info.note });
      }
    });

    const found = results.rail.length + results.jeepney.length + results.p2p.length > 0;
    return {
      query: { origin, destination },
      found,
      results,
      suggestion: found ? null : `No direct route found from ${origin} to ${destination}. Consider nearby hubs: Baclaran (LRT-1), Taft Ave (MRT-3), or Araneta-Cubao (MRT-3/LRT-2).`
    };
  },

  // ── TOOL 2: calculate_fare ─────────────────────────────────────────────
  calculate_fare: function(mode, stops_or_km) {
    const n = parseFloat(stops_or_km) || 1;
    let fare = 0;
    let breakdown = '';

    if (mode === 'MRT-3') {
      const matrix = ROUTES_DB.mrt3.farePerStops;
      const key = Math.min(n, 12);
      fare = matrix[key] || 28;
      breakdown = `MRT-3: ${n} stops → ₱${fare} (LTFRB fixed matrix)`;
    } else if (mode === 'LRT-1') {
      const matrix = ROUTES_DB.lrt1.farePerStops;
      const key = Math.min(n, 17);
      fare = matrix[key] || 30;
      breakdown = `LRT-1: ${n} stops → ₱${fare} (LTFRB fixed matrix)`;
    } else if (mode === 'LRT-2') {
      const matrix = ROUTES_DB.lrt2.farePerStops;
      const key = Math.min(n, 10);
      fare = matrix[key] || 22;
      breakdown = `LRT-2: ${n} stops → ₱${fare} (LTFRB fixed matrix)`;
    } else if (mode === 'jeepney') {
      const baseFare = 13;
      const baseKm = 4;
      const ratePerKm = 1.80;
      if (n <= baseKm) {
        fare = baseFare;
        breakdown = `Jeepney: ${n}km (within base 4km) → ₱${fare}`;
      } else {
        fare = Math.ceil(baseFare + (n - baseKm) * ratePerKm);
        breakdown = `Jeepney: ₱13 base + (${n-baseKm}km × ₱1.80) → ₱${fare}`;
      }
    } else if (mode === 'p2p') {
      // stops_or_km is the direct fare for P2P
      fare = n;
      breakdown = `P2P Bus: fixed fare → ₱${fare}`;
    } else if (mode === 'walk') {
      fare = 0;
      breakdown = 'Walking: free';
    } else {
      fare = 13;
      breakdown = `Unknown mode, using minimum fare → ₱${fare}`;
    }

    return { mode, input: stops_or_km, fare, breakdown };
  },

  // ── TOOL 3: estimate_travel_time ───────────────────────────────────────
  estimate_travel_time: function(mode, stops_or_km, time_of_day) {
    const n = parseFloat(stops_or_km) || 1;
    const isPeak = ['morning rush', 'peak', 'rush hour', '7am', '8am', '5pm', '6pm', '7pm'].some(p =>
      (time_of_day || '').toLowerCase().includes(p)
    );
    const peakMultiplier = isPeak ? 1.5 : 1;

    let baseMin = 0;
    let note = '';

    if (mode === 'MRT-3') {
      baseMin = n * ROUTES_DB.mrt3.avgMinPerStop;
      baseMin += 5; // boarding/alighting buffer
      if (isPeak) note = 'Peak hour: expect longer queues at turnstiles (+3–5 min)';
    } else if (mode === 'LRT-1') {
      baseMin = n * ROUTES_DB.lrt1.avgMinPerStop;
      baseMin += 5;
      if (isPeak) note = 'Peak hour: LRT-1 gets very crowded, especially Baclaran–Vito Cruz';
    } else if (mode === 'LRT-2') {
      baseMin = n * ROUTES_DB.lrt2.avgMinPerStop;
      baseMin += 4;
    } else if (mode === 'jeepney') {
      const baseKmPerMin = 0.5; // ~30 km/h off-peak
      baseMin = n / baseKmPerMin;
      if (isPeak) {
        baseMin *= peakMultiplier;
        note = 'Peak hour traffic on EDSA/major roads can double jeepney travel time';
      }
    } else if (mode === 'walk') {
      baseMin = n * 12; // 12 min per km walking
      note = 'Walking estimate at average pace';
    } else if (mode === 'p2p') {
      baseMin = n; // for P2P, pass estimated minutes directly
      if (isPeak) {
        baseMin *= 1.3;
        note = 'P2P buses use EDSA — expect traffic delays during peak hours';
      }
    } else if (mode === 'transfer') {
      baseMin = n; // transfer walk time
      note = 'Transfer/walking time between stations';
    }

    return {
      mode,
      input: stops_or_km,
      time_of_day: time_of_day || 'off-peak',
      estimatedMinutes: Math.ceil(baseMin),
      isPeak,
      note
    };
  },

  // ── TOOL 4: check_transfer_options ────────────────────────────────────
  check_transfer_options: function(station) {
    const norm = station.toLowerCase();
    let match = null;

    // Try direct match
    for (const [hub, info] of Object.entries(ROUTES_DB.transferHubs)) {
      if (hub.toLowerCase().includes(norm) || norm.includes(hub.toLowerCase().split(' ')[0])) {
        match = { hub, ...info };
        break;
      }
    }

    if (match) {
      return {
        station,
        found: true,
        availableLines: match.lines,
        nearbyJeepney: match.nearbyJeepney || [],
        nearbyLines: match.nearbyLines || [],
        note: match.note
      };
    }

    // Fuzzy: check if it's a rail station
    for (const [lineKey, lineData] of Object.entries({ mrt3: ROUTES_DB.mrt3, lrt1: ROUTES_DB.lrt1, lrt2: ROUTES_DB.lrt2 })) {
      const found = lineData.stations.find(s => s.toLowerCase().includes(norm) || norm.includes(s.toLowerCase()));
      if (found) {
        return {
          station: found,
          found: true,
          availableLines: [lineData.name],
          note: `${found} is on ${lineData.name}. No direct interchange at this station.`,
          nearbyJeepney: ["Various jeepney routes available outside station"]
        };
      }
    }

    return {
      station,
      found: false,
      note: `No transfer hub data for "${station}". Nearest major hubs: Araneta-Cubao (MRT-3/LRT-2), Taft Ave MRT / Baclaran LRT-1 (MRT↔LRT transfer), Doroteo Jose (LRT-1/LRT-2 area).`
    };
  }
};

// ── TOOL DEFINITIONS for Gemini Function Calling API ─────────────────────
const TOOL_DEFINITIONS = [
  {
    name: "lookup_route",
    description: "Search the Manila transit database for available routes between an origin and destination. Returns matching rail lines, jeepney routes, and P2P bus options. Always call this first when planning a commute.",
    parameters: {
      type: "object",
      properties: {
        origin: { type: "string", description: "The starting location (e.g. 'Paranaque', 'Baclaran', 'BGC')" },
        destination: { type: "string", description: "The destination (e.g. 'Cubao', 'Makati', 'Quiapo')" }
      },
      required: ["origin", "destination"]
    }
  },
  {
    name: "calculate_fare",
    description: "Calculate the exact fare for a specific transit mode using official LTFRB fare matrices. Call this for each segment of the route to get accurate costs.",
    parameters: {
      type: "object",
      properties: {
        mode: {
          type: "string",
          enum: ["MRT-3", "LRT-1", "LRT-2", "jeepney", "p2p", "walk"],
          description: "Transit mode"
        },
        stops_or_km: {
          type: "number",
          description: "Number of stops for rail lines, kilometers for jeepney, or fixed fare amount for P2P bus"
        }
      },
      required: ["mode", "stops_or_km"]
    }
  },
  {
    name: "estimate_travel_time",
    description: "Estimate travel time for a route segment, accounting for peak hour traffic and transit type. Call this for each segment to give the user an accurate total time estimate.",
    parameters: {
      type: "object",
      properties: {
        mode: {
          type: "string",
          enum: ["MRT-3", "LRT-1", "LRT-2", "jeepney", "p2p", "walk", "transfer"],
          description: "Transit mode"
        },
        stops_or_km: {
          type: "number",
          description: "Number of stops (rail), kilometers (jeepney/walk), or minutes (p2p/transfer)"
        },
        time_of_day: {
          type: "string",
          description: "Time context e.g. 'morning rush', '8am', 'off-peak', 'evening'. Affects traffic estimates."
        }
      },
      required: ["mode", "stops_or_km"]
    }
  },
  {
    name: "check_transfer_options",
    description: "Check what transit lines and connections are available at a specific station or hub. Use this when a route requires a transfer to find the best interchange point.",
    parameters: {
      type: "object",
      properties: {
        station: { type: "string", description: "Station or hub name to check (e.g. 'Taft Avenue', 'Araneta-Cubao', 'Baclaran')" }
      },
      required: ["station"]
    }
  }
];