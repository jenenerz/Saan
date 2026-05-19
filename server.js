const http = require('http');
const https = require('https');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

const MIME = {
  '.html': 'text/html', '.js': 'application/javascript',
  '.css': 'text/css', '.json': 'application/json', '.ico': 'image/x-icon'
};

const DB = {
  aliases: {
    // Paranaque / South
    "paranaque":"Paranaque","parañaque":"Paranaque","para":"Paranaque",
    "sucat":"Paranaque","bf homes":"Paranaque",
    "las pinas":"Las Pinas","las piñas":"Las Pinas","laspinas":"Las Pinas",
    "alabang":"Alabang","starmall":"Alabang","muntinlupa":"Alabang","vtx":"Alabang",
    "bicutan":"Bicutan","ftf":"Bicutan","fti":"Bicutan",

    // South Bay / Pasay / MOA
    "moa":"MOA","mall of asia":"MOA","sm moa":"MOA","sm mall of asia":"MOA",
    "pasay":"Pasay","baclaran":"Baclaran","pitx":"PITX",
    "naia":"NAIA","airport":"NAIA","naia 1":"NAIA","naia 2":"NAIA","naia 3":"NAIA","naia 4":"NAIA",
    "terminal 1":"NAIA","terminal 2":"NAIA","terminal 3":"NAIA",

    // Makati / BGC
    "makati":"Makati","ayala":"Makati","glorietta":"Makati","greenbelt":"Makati",
    "one ayala":"Makati","buendia":"Buendia","gil puyat":"Buendia",
    "bgc":"BGC","bonifacio":"BGC","bonifacio global city":"BGC","taguig":"BGC","fort":"BGC",
    "market market":"BGC","uptown bgc":"BGC","uptown mall":"BGC",
    "guadalupe":"Guadalupe",

    // Ortigas / East
    "ortigas":"Ortigas","pasig":"Ortigas","sm megamall":"Ortigas","megamall":"Ortigas",
    "robinsons galleria":"Ortigas","starmall shaw":"Ortigas",
    "mandaluyong":"Mandaluyong","shaw":"Mandaluyong","boni":"Mandaluyong",
    "san juan":"San Juan","greenhills":"San Juan",

    // Manila
    "quiapo":"Quiapo","manila":"Manila","divisoria":"Manila","intramuros":"Manila",
    "lawton":"Manila","avenida":"Manila","recto":"Quiapo","sampaloc":"Manila",
    "espana":"Manila","españa":"Manila","luneta":"Manila","rizal park":"Manila",
    "binondo":"Manila","chinatown":"Manila",

    // North
    "monumento":"Monumento","caloocan":"Monumento","balintawak":"Monumento",
    "sm north":"SM North","sm north edsa":"SM North","north edsa":"SM North","trinoma":"SM North",
    "fairview":"Novaliches","novaliches":"Novaliches","commonwealth":"Novaliches",
    "qc":"Quezon City","quezon city":"Quezon City","quezon ave":"Quezon City",
    "cubao":"Cubao","araneta":"Cubao","araneta cubao":"Cubao","farmers":"Cubao","gateway":"Cubao",

    // East
    "marikina":"Marikina","santolan":"Marikina",
    "antipolo":"Antipolo","cainta":"Antipolo","cogeo":"Antipolo",
    "katipunan":"Katipunan","ateneo":"Katipunan","up":"Katipunan","loyola":"Katipunan",
  },

  areas: {
    // === SOUTH ===
    "Paranaque":   { hub:"Baclaran",        hubLine:"LRT-1", hubMin:25, hubKm:6,  hubMode:"jeepney" },
    "Las Pinas":   { hub:"Baclaran",        hubLine:"LRT-1", hubMin:30, hubKm:7,  hubMode:"jeepney" },
    "Alabang":     { hub:"Alabang",         hubLine:"P2P",   hubMin:0,  hubKm:0,  hubMode:"origin"  },
    "Bicutan":     { hub:"Taft Avenue",     hubLine:"MRT-3", hubMin:20, hubKm:5,  hubMode:"jeepney" },

    // === PASAY / BACLARAN / MOA / PITX / NAIA ===
    // These are P2P-first hubs; LRT-1 Baclaran is reachable by jeepney but
    // we keep hubLine:"LRT-1" only for Baclaran itself (direct origin).
    // MOA/PITX/NAIA use hubLine:"P2P" so rail-transfer logic ignores them
    // and only the explicit p2p[] entries apply.
    "Baclaran":    { hub:"Baclaran",        hubLine:"LRT-1", hubMin:0,  hubKm:0,  hubMode:"origin"  },
    "Pasay":       { hub:"Baclaran",        hubLine:"LRT-1", hubMin:10, hubKm:2,  hubMode:"jeepney" },
    "MOA":         { hub:"MOA",             hubLine:"P2P",   hubMin:0,  hubKm:0,  hubMode:"origin"  },
    "PITX":        { hub:"PITX",            hubLine:"P2P",   hubMin:0,  hubKm:0,  hubMode:"origin"  },
    "NAIA":        { hub:"NAIA",            hubLine:"P2P",   hubMin:0,  hubKm:0,  hubMode:"origin"  },

    // === MAKATI / BGC ===
    "Makati":      { hub:"Ayala",           hubLine:"MRT-3", hubMin:10, hubKm:2,  hubMode:"jeepney" },
    "Buendia":     { hub:"Buendia",         hubLine:"LRT-1", hubMin:0,  hubKm:0,  hubMode:"origin"  },
    "Guadalupe":   { hub:"Guadalupe",       hubLine:"MRT-3", hubMin:0,  hubKm:0,  hubMode:"origin"  },
    "BGC":         { hub:"Ayala",           hubLine:"MRT-3", hubMin:15, hubKm:3,  hubMode:"jeepney" },

    // === ORTIGAS / EAST ===
    "Ortigas":     { hub:"Ortigas",         hubLine:"MRT-3", hubMin:10, hubKm:2,  hubMode:"jeepney" },
    "Mandaluyong": { hub:"Shaw Boulevard",  hubLine:"MRT-3", hubMin:8,  hubKm:2,  hubMode:"jeepney" },
    "San Juan":    { hub:"Shaw Boulevard",  hubLine:"MRT-3", hubMin:12, hubKm:3,  hubMode:"jeepney" },

    // === MANILA ===
    "Quiapo":      { hub:"Doroteo Jose",    hubLine:"LRT-1", hubMin:10, hubKm:2,  hubMode:"jeepney" },
    "Manila":      { hub:"Central Terminal",hubLine:"LRT-1", hubMin:12, hubKm:3,  hubMode:"jeepney" },

    // === NORTH ===
    "Monumento":   { hub:"Monumento",       hubLine:"LRT-1", hubMin:0,  hubKm:0,  hubMode:"origin"  },
    "SM North":    { hub:"North Avenue",    hubLine:"MRT-3", hubMin:5,  hubKm:1,  hubMode:"walk"    },
    "Quezon City": { hub:"Quezon Avenue",   hubLine:"MRT-3", hubMin:8,  hubKm:2,  hubMode:"jeepney" },
    "Novaliches":  { hub:"North Avenue",    hubLine:"MRT-3", hubMin:45, hubKm:10, hubMode:"jeepney" },
    "Cubao":       { hub:"Araneta-Cubao",   hubLine:"MRT-3", hubMin:0,  hubKm:0,  hubMode:"origin"  },

    // === EAST ===
    "Marikina":    { hub:"Santolan",        hubLine:"LRT-2", hubMin:15, hubKm:4,  hubMode:"jeepney" },
    "Antipolo":    { hub:"Santolan",        hubLine:"LRT-2", hubMin:30, hubKm:8,  hubMode:"jeepney" },
    "Katipunan":   { hub:"Katipunan",       hubLine:"LRT-2", hubMin:0,  hubKm:0,  hubMode:"origin"  },
  },

  mrt3: {
    name:"MRT-3",
    stations:["Taft Avenue","Magallanes","Ayala","Buendia","Guadalupe","Boni","Shaw Boulevard","Ortigas","Santolan","Araneta-Cubao","GMA-Kamuning","Quezon Avenue","North Avenue"],
    fare:{1:13,2:13,3:15,4:16,5:18,6:20,7:22,8:24,9:26,10:28,11:28,12:28},
    minPerStop:2.5
  },
  lrt1: {
    name:"LRT-1",
    stations:["Baclaran","EDSA","Libertad","Gil Puyat","Vito Cruz","Quirino","Pedro Gil","Central Terminal","UN Avenue","Carriedo","Doroteo Jose","Bambang","Tayuman","Blumentritt","Abad Santos","R. Papa","5th Avenue","Monumento"],
    fare:{1:12,2:12,3:13,4:14,5:15,6:16,7:17,8:18,9:19,10:20,11:21,12:22,13:24,14:26,15:28,16:30,17:30},
    minPerStop:2.8
  },
  lrt2: {
    name:"LRT-2",
    stations:["Recto","Legarda","Pureza","V. Mapa","J. Ruiz","Gilmore","Betty Go-Belmonte","Araneta-Cubao","Anonas","Katipunan","Santolan"],
    fare:{1:12,2:12,3:13,4:14,5:15,6:16,7:17,8:18,9:20,10:22},
    minPerStop:3
  },

  // ── POINT-TO-POINT BUSES ─────────────────────────────────────────────────
  // Sources: commutetour.com + LTFRB data (fares as of 2025-2026)
  p2p: [
    // === FROM ALABANG (Starmall) ===
    { from:"Alabang", to:"BGC",    bus:"HM Worthy",         fare:52,  min:45, note:"Via SLEX–C5, TRIPKO card. 6AM–8PM." },
    { from:"Alabang", to:"Makati", bus:"Alabang–Ayala Bus",  fare:48,  min:35, note:"Via SLEX. 4AM–10PM. Also RRCG P2P from ATC/SouthPark to Glorietta." },
    { from:"Alabang", to:"Cubao",  bus:"Alabang Metrolink / HM", fare:75, min:60, note:"Via EDSA. Also MRT: ride to Ayala, switch to MRT Cubao." },
    { from:"Alabang", to:"MOA",    bus:"Alabang–Pasay Bus",  fare:40,  min:40, note:"Via EDSA." },
    { from:"Alabang", to:"Ortigas",bus:"Starmall–Ortigas Bus",fare:65, min:55, note:"Via EDSA." },

    // === FROM LAS PINAS ===
    { from:"Las Pinas", to:"Makati", bus:"Las Piñas–Ayala Bus", fare:55, min:45, note:"Via Coastal Rd / SLEX." },

    // === FROM PARANAQUE ===
    { from:"Paranaque", to:"BGC",    bus:"HM Worthy / P2P",    fare:65, min:35, note:"Via C5." },
    { from:"Paranaque", to:"Makati", bus:"Paranaque–Ayala Bus", fare:50, min:40, note:"Via SLEX." },
    { from:"Paranaque", to:"MOA",    bus:"Paranaque–Pasay Bus", fare:30, min:25, note:"Via Coastal Rd." },

    // === FROM CUBAO (Farmers / Araneta) ===
    { from:"Cubao", to:"BGC",    bus:"HM Transport",            fare:85, min:40, note:"Via C5." },
    { from:"Cubao", to:"Alabang",bus:"Alabang Metrolink",       fare:75, min:60, note:"Via EDSA–SLEX. Or MRT to Ayala, Ayala bus to Alabang." },
    { from:"Cubao", to:"MOA",    bus:"EDSA Carousel / UV",      fare:30, min:45, note:"EDSA Carousel southbound to Taft, jeep to MOA." },
    { from:"Cubao", to:"SM North",bus:"EDSA Carousel",          fare:15, min:20, note:"EDSA Carousel northbound." },

    // === FROM NOVALICHES ===
    { from:"Novaliches", to:"Makati", bus:"Novaliches–Ayala P2P", fare:90, min:60, note:"Via EDSA." },
    { from:"Novaliches", to:"SM North",bus:"Jeep to North Ave",  fare:20, min:40, note:"Jeep to SM North / North Ave MRT." },

    // === FROM/TO MOA ===
    { from:"MOA", to:"Makati", bus:"EDSA Carousel / Green Frog", fare:30, min:30, note:"EDSA Carousel to Ayala or Green Frog Hybrid Bus (PITX–BGC via Buendia). Stops at MOA Globe." },
    { from:"MOA", to:"BGC",    bus:"Green Frog Hybrid Bus",       fare:35, min:25, note:"Operates daily PITX–Uptown BGC via LRT Buendia. Stops at MOA Globe." },
    { from:"MOA", to:"Cubao",  bus:"EDSA Carousel",               fare:30, min:50, note:"Northbound EDSA Carousel." },
    { from:"MOA", to:"Manila", bus:"Jeep to Lawton / Luneta",     fare:13, min:30, note:"Modern jeep to Lawton or Luneta passing Intramuros." },

    // === FROM PITX ===
    { from:"PITX", to:"BGC",    bus:"Green Frog Hybrid Bus",      fare:40, min:35, note:"Direct PITX–Uptown BGC via LRT Buendia / Gil Puyat." },
    { from:"PITX", to:"Makati", bus:"PITX–Ayala Bus",             fare:35, min:30, note:"Via EDSA." },
    { from:"PITX", to:"MOA",    bus:"PITX–MOA Shuttle",           fare:20, min:15, note:"Short hop via Coastal Rd." },
    { from:"PITX", to:"Cubao",  bus:"EDSA Carousel",              fare:30, min:55, note:"Northbound via EDSA." },
    { from:"PITX", to:"SM North",bus:"EDSA Carousel",             fare:30, min:60, note:"Northbound terminus." },
    { from:"PITX", to:"Alabang",bus:"PITX–Alabang Bus",           fare:30, min:30, note:"Via Coastal Rd." },

    // === BUENDIA TERMINAL ===
    { from:"Buendia", to:"Cubao",  bus:"EDSA Carousel / Bus",     fare:25, min:35, note:"EDSA Carousel northbound or ordinary bus via EDSA." },
    { from:"Buendia", to:"SM North",bus:"EDSA Carousel / Bus",    fare:28, min:50, note:"EDSA northbound." },
    { from:"Buendia", to:"Alabang",bus:"Buendia–Alabang Bus",     fare:52, min:45, note:"Via EDSA–SLEX." },
    { from:"Buendia", to:"MOA",   bus:"Jeep / Modern Jeep",       fare:13, min:20, note:"Jeep to EDSA/Taft then to MOA, or jeep to Buendia MRT jeep to MOA." },
    { from:"Buendia", to:"BGC",   bus:"BGC Bus / Jeep",           fare:25, min:20, note:"Jeep to Guadalupe then BGC Bus, or direct jeep signboard BGC." },
    { from:"Buendia", to:"Monumento",bus:"EDSA Bus",              fare:35, min:60, note:"Ordinary bus via EDSA northbound to Monumento." },
  ]
};

// ── STAGE 1: resolve_locations ────────────────────
function resolveLocations(originRaw, destinationRaw) {
  const normalize = (input) => {
    const clean = input.toLowerCase().trim().replace(/[^a-z0-9\s]/g, '');
    if (DB.aliases[clean]) return DB.aliases[clean];
    for (const [alias, name] of Object.entries(DB.aliases)) {
      if (clean.includes(alias) || alias.includes(clean)) return name;
    }
    for (const area of Object.keys(DB.areas)) {
      if (clean.includes(area.toLowerCase())) return area;
    }
    return input.trim().replace(/\b\w/g, c => c.toUpperCase());
  };
  const origin      = normalize(originRaw);
  const destination = normalize(destinationRaw);
  return {
    originRaw, destinationRaw, origin, destination,
    originKnown: !!DB.areas[origin],
    destKnown:   !!DB.areas[destination],
    originArea:  DB.areas[origin]      || null,
    destArea:    DB.areas[destination] || null
  };
}

// ── STAGE 2: list_paths ───────────────────────────
function listPaths(resolved) {
  const { origin, destination, originArea, destArea } = resolved;
  const paths = [];

  const stationIdx = (line, hub) =>
    line.stations.findIndex(s =>
      s.toLowerCase().includes(hub.toLowerCase()) ||
      hub.toLowerCase().includes(s.toLowerCase().split(' ')[0])
    );

  // ── P2P bus routes (bidirectional, single best match) ──
  // Try most-specific match first (area name), then fall back to hub name.
  // Only ONE P2P path is added to prevent duplicate ROUTE_JSON output.
  const findP2P = (a, b) => DB.p2p.find(r =>
    (r.from === a && r.to === b) || (r.from === b && r.to === a)
  );
  const p2pMatch =
    findP2P(origin, destination) ||
    findP2P(origin, destArea?.hub) ||
    findP2P(originArea?.hub, destination) ||
    findP2P(originArea?.hub, destArea?.hub);

  if (p2pMatch) {
    paths.push({
      id:'P2P', type:'direct_p2p',
      description:`${p2pMatch.bus}: ${origin} → ${destination}`,
      segments:[{
        mode:'p2p',
        from: origin,
        to:   destination,
        fare: p2pMatch.fare,
        min:  p2pMatch.min,
        bus:  p2pMatch.bus,
        note: p2pMatch.note
      }],
      transfers:0
    });
  }

  // Skip rail logic entirely if either end is a P2P-only hub (e.g. MOA, PITX, NAIA, Alabang)
  // Those are served exclusively by the p2p[] bus entries above.
  if (!originArea || !destArea) return paths;
  if (originArea.hubLine === 'P2P' || destArea.hubLine === 'P2P') return paths;

  const lines = [{ data:DB.mrt3 },{ data:DB.lrt1 },{ data:DB.lrt2 }];

  // ── Same rail line, direct ──
  for (const { data: line } of lines) {
    if (originArea.hubLine === line.name && destArea.hubLine === line.name) {
      const oi = stationIdx(line, originArea.hub);
      const di = stationIdx(line, destArea.hub);
      if (oi !== -1 && di !== -1 && oi !== di) {
        paths.push({
          id:`${line.name}_DIRECT`, type:'rail_direct',
          description:`${originArea.hubMode!=='origin'?originArea.hubMode+' + ':''}${line.name} direct`,
          segments:[
            ...(originArea.hubMode!=='origin'?[{mode:originArea.hubMode,from:origin,to:originArea.hub,km:originArea.hubKm,min:originArea.hubMin}]:[]),
            {mode:line.name,from:line.stations[oi],to:line.stations[di],stops:Math.abs(di-oi),line:line.name},
            ...(destArea.hubMode!=='origin'?[{mode:destArea.hubMode,from:destArea.hub,to:destination,km:destArea.hubKm,min:destArea.hubMin}]:[])
          ],
          transfers:0
        });
      }
    }
  }

  // ── LRT-1 → MRT-3 (via Taft Ave / EDSA transfer) ──
  // Guard: origin hub must not already be at EDSA (index 1 on LRT-1),
  // otherwise the LRT-1 leg is 0 stops (EDSA→EDSA), which is invalid.
  if (originArea.hubLine==='LRT-1' && destArea.hubLine==='MRT-3') {
    const oi=stationIdx(DB.lrt1,originArea.hub), edsa=stationIdx(DB.lrt1,'EDSA');
    const taft=stationIdx(DB.mrt3,'Taft Avenue'), di=stationIdx(DB.mrt3,destArea.hub);
    // oi !== edsa ensures we actually ride at least one LRT-1 stop
    if (oi!==-1&&edsa!==-1&&taft!==-1&&di!==-1&&oi!==edsa) {
      paths.push({ id:'LRT1_MRT3', type:'rail_transfer',
        description:'LRT-1 → transfer Taft Ave → MRT-3',
        segments:[
          ...(originArea.hubMode!=='origin'?[{mode:originArea.hubMode,from:origin,to:originArea.hub,km:originArea.hubKm,min:originArea.hubMin}]:[]),
          {mode:'LRT-1',from:DB.lrt1.stations[oi],to:'EDSA',stops:Math.abs(edsa-oi),line:'LRT-1'},
          {mode:'walk',from:'EDSA LRT-1',to:'Taft Avenue MRT-3',min:5,note:'~200m covered walkway'},
          {mode:'MRT-3',from:'Taft Avenue',to:DB.mrt3.stations[di],stops:Math.abs(di-taft),line:'MRT-3'},
          ...(destArea.hubMode!=='origin'?[{mode:destArea.hubMode,from:destArea.hub,to:destination,km:destArea.hubKm,min:destArea.hubMin}]:[])
        ],
        transfers:1 });
    }
  }

  // ── MRT-3 → LRT-1 ──
  if (originArea.hubLine==='MRT-3' && destArea.hubLine==='LRT-1') {
    const oi=stationIdx(DB.mrt3,originArea.hub), taft=stationIdx(DB.mrt3,'Taft Avenue');
    const bac=stationIdx(DB.lrt1,'Baclaran'), di=stationIdx(DB.lrt1,destArea.hub);
    if (oi!==-1&&taft!==-1&&bac!==-1&&di!==-1) {
      paths.push({ id:'MRT3_LRT1', type:'rail_transfer',
        description:'MRT-3 → transfer Taft Ave → LRT-1',
        segments:[
          ...(originArea.hubMode!=='origin'?[{mode:originArea.hubMode,from:origin,to:originArea.hub,km:originArea.hubKm,min:originArea.hubMin}]:[]),
          {mode:'MRT-3',from:DB.mrt3.stations[oi],to:'Taft Avenue',stops:Math.abs(taft-oi),line:'MRT-3'},
          {mode:'walk',from:'Taft Avenue MRT',to:'Baclaran LRT-1',min:5,note:'~200m covered walkway'},
          {mode:'LRT-1',from:'Baclaran',to:DB.lrt1.stations[di],stops:Math.abs(di-bac),line:'LRT-1'},
          ...(destArea.hubMode!=='origin'?[{mode:destArea.hubMode,from:destArea.hub,to:destination,km:destArea.hubKm,min:destArea.hubMin}]:[])
        ],
        transfers:1 });
    }
  }

  // ── MRT-3 → LRT-2 (via Cubao interchange) ──
  if (originArea.hubLine==='MRT-3' && destArea.hubLine==='LRT-2') {
    const oi=stationIdx(DB.mrt3,originArea.hub), c3=stationIdx(DB.mrt3,'Araneta-Cubao');
    const c2=stationIdx(DB.lrt2,'Araneta-Cubao'), di=stationIdx(DB.lrt2,destArea.hub);
    if (oi!==-1&&c3!==-1&&c2!==-1&&di!==-1) {
      paths.push({ id:'MRT3_LRT2', type:'rail_transfer',
        description:'MRT-3 → transfer Cubao → LRT-2',
        segments:[
          ...(originArea.hubMode!=='origin'?[{mode:originArea.hubMode,from:origin,to:originArea.hub,km:originArea.hubKm,min:originArea.hubMin}]:[]),
          {mode:'MRT-3',from:DB.mrt3.stations[oi],to:'Araneta-Cubao',stops:Math.abs(c3-oi),line:'MRT-3'},
          {mode:'walk',from:'Araneta-Cubao MRT',to:'Araneta-Cubao LRT-2',min:3,note:'Direct interchange'},
          {mode:'LRT-2',from:'Araneta-Cubao',to:DB.lrt2.stations[di],stops:Math.abs(di-c2),line:'LRT-2'},
          ...(destArea.hubMode!=='origin'?[{mode:destArea.hubMode,from:destArea.hub,to:destination,km:destArea.hubKm,min:destArea.hubMin}]:[])
        ],
        transfers:1 });
    }
  }

  // ── LRT-2 → MRT-3 ──
  if (originArea.hubLine==='LRT-2' && destArea.hubLine==='MRT-3') {
    const oi=stationIdx(DB.lrt2,originArea.hub), c2=stationIdx(DB.lrt2,'Araneta-Cubao');
    const c3=stationIdx(DB.mrt3,'Araneta-Cubao'), di=stationIdx(DB.mrt3,destArea.hub);
    if (oi!==-1&&c2!==-1&&c3!==-1&&di!==-1) {
      paths.push({ id:'LRT2_MRT3', type:'rail_transfer',
        description:'LRT-2 → transfer Cubao → MRT-3',
        segments:[
          ...(originArea.hubMode!=='origin'?[{mode:originArea.hubMode,from:origin,to:originArea.hub,km:originArea.hubKm,min:originArea.hubMin}]:[]),
          {mode:'LRT-2',from:DB.lrt2.stations[oi],to:'Araneta-Cubao',stops:Math.abs(c2-oi),line:'LRT-2'},
          {mode:'walk',from:'Araneta-Cubao LRT-2',to:'Araneta-Cubao MRT-3',min:3,note:'Direct interchange'},
          {mode:'MRT-3',from:'Araneta-Cubao',to:DB.mrt3.stations[di],stops:Math.abs(di-c3),line:'MRT-3'},
          ...(destArea.hubMode!=='origin'?[{mode:destArea.hubMode,from:destArea.hub,to:destination,km:destArea.hubKm,min:destArea.hubMin}]:[])
        ],
        transfers:1 });
    }
  }

  return paths;
}

// ── STAGE 3: read_path ────────────────────────────
function readPath(p, isPeak) {
  const pm = isPeak ? 1.5 : 1;
  const segs = p.segments.map(s => {
    let fare=0, min=s.min||0, label='', detail='';
    if (s.mode==='MRT-3') {
      const n=s.stops||1;
      fare=DB.mrt3.fare[Math.min(n,12)]||28;
      min=Math.ceil(n*DB.mrt3.minPerStop+5);
      label=`MRT-3: ${s.from} → ${s.to}`;
      detail=`${n} stop${n>1?'s':''}${isPeak?' · expect queues':''}`;
    } else if (s.mode==='LRT-1') {
      const n=s.stops||1;
      fare=DB.lrt1.fare[Math.min(n,17)]||30;
      min=Math.ceil(n*DB.lrt1.minPerStop+5);
      label=`LRT-1: ${s.from} → ${s.to}`;
      detail=`${n} stop${n>1?'s':''}`;
    } else if (s.mode==='LRT-2') {
      const n=s.stops||1;
      fare=DB.lrt2.fare[Math.min(n,10)]||22;
      min=Math.ceil(n*DB.lrt2.minPerStop+4);
      label=`LRT-2: ${s.from} → ${s.to}`;
      detail=`${n} stop${n>1?'s':''}`;
    } else if (s.mode==='jeepney') {
      const km=s.km||4;
      fare=km<=4?13:Math.ceil(13+(km-4)*1.80);
      min=Math.ceil((s.min||20)*pm);
      label=`Jeepney to ${s.to}`;
      detail=`${km}km${isPeak?' · heavy traffic':''}`;
    } else if (s.mode==='walk') {
      fare=0; min=s.min||5;
      label=`Walk to ${s.to}`;
      detail=s.note||'';
    } else if (s.mode==='p2p') {
      fare=s.fare||0;
      min=Math.ceil((s.min||40)*(isPeak?1.3:1));
      label=`${s.bus||'P2P Bus'}: ${s.from} → ${s.to}`;
      detail=`${s.note||'Air-conditioned · fixed fare'}${isPeak?' · may have traffic':''}`;
    }
    return {...s, fare, min, label, detail};
  });
  return {...p, segments:segs,
    totalFare: segs.reduce((a,s)=>a+s.fare,0),
    totalMin:  segs.reduce((a,s)=>a+s.min,0),
    isPeak};
}

// ── STAGE 4: get_context ──────────────────────────
function getContext(readPaths, budget, mode) {
  const pool = readPaths.filter(p=>!budget||p.totalFare<=budget);
  const ranked = [...(pool.length?pool:readPaths)].sort((a,b)=>
    mode==='fastest' ? a.totalMin-b.totalMin :
    mode==='least_transfers' ? a.transfers-b.transfers :
    a.totalFare-b.totalFare
  );
  return {
    allPaths: readPaths,
    recommended: ranked[0]||null,
    alternatives: ranked.slice(1,3),
    budgetWarning: budget && ranked[0] && ranked[0].totalFare>budget
      ? `All routes exceed ₱${budget}. Cheapest is ₱${Math.min(...readPaths.map(p=>p.totalFare))}.`
      : null
  };
}

// ── PARSE USER INPUT ──────────────────────────────
function parseUserInput(message) {
  const text = message.toLowerCase();
  const budgetMatch = text.match(/[₱p](\d+)|(\d+)\s*peso/i);
  const budget = budgetMatch ? parseInt(budgetMatch[1]||budgetMatch[2]) : null;
  const isPeak = /\b(7am|8am|5pm|6pm|7pm|rush|peak|morning rush|umaga)\b/.test(text);

  let origin=null, destination=null;

  // Must have a route-intent keyword before we attempt to parse origin/destination
  const hasRouteIntent = /\b(to|papunta|goin|going|from|paano|how.*go|how.*get|how.*reach|directions?|route|commute|sakay)\b/i.test(message);

  if (!hasRouteIntent) {
    return { origin: null, destination: null, budget, isPeak };
  }

  // Try "X to Y" pattern
  const m = message.match(/(?:from\s+)?(.+?)\s+to\s+(.+?)(?:\s*[,.]|$|\s+budget|\s+[₱p]\d|\s+need|\s+by\s+\d)/i);
  if (m) {
    const rawOrigin = m[1].replace(/^(from|sa|paano|how.*go|how.*get)\s+/i,'').trim();
    const rawDest   = m[2].trim();

    // Reject if origin looks like a question phrase rather than a place
    const questionPhrases = /^(how|what|where|when|why|can|is|are|do|does|i|we|you)/i;
    if (questionPhrases.test(rawOrigin)) {
      return { origin: null, destination: null, budget, isPeak };
    }

    origin      = rawOrigin;
    destination = rawDest;
  }

  return { origin, destination, budget, isPeak };
}

// ── BUILD ROUTE JSON (server-side, no Gemini needed) ──
function buildRouteJson(context, origin, destination) {
  const rec = context.recommended;
  if (!rec) return null;
  return {
    title: `${origin} → ${destination}`,
    transfers: rec.transfers,
    totalFare: rec.totalFare,
    totalMin: rec.totalMin,
    steps: rec.segments.map(s => ({
      type: s.mode==='MRT-3'?'mrt':s.mode==='LRT-1'||s.mode==='LRT-2'?'lrt':s.mode==='p2p'?'bus':s.mode,
      label: s.label,
      detail: s.detail,
      fare: s.fare,
      min: s.min
    })),
    alternatives: context.alternatives.map(alt => ({
      description: alt.description,
      fare: alt.totalFare,
      min: alt.totalMin,
      transfers: alt.transfers
    }))
  };
}

// ── GEMINI CALL ───────────────────────────────────
function callGeminiRaw(systemPrompt, userMessage, history) {
  return new Promise((resolve, reject) => {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) { reject(new Error('GEMINI_API_KEY not set in .env')); return; }

    const validHistory = history.filter(m => m.role && m.parts?.[0]?.text?.trim());
    const contents = [
      ...validHistory.slice(-6),
      { role:'user', parts:[{ text: userMessage }] }
    ];

    const body = JSON.stringify({
      system_instruction: { parts:[{ text: systemPrompt }] },
      contents,
      generationConfig: { temperature: 0.1, maxOutputTokens: 100 }
    });

    const options = {
      hostname:'generativelanguage.googleapis.com',
      path:`/v1beta/models/gemini-2.5-flash-lite:generateContent?key=${apiKey}`,
      method:'POST',
      headers:{ 'Content-Type':'application/json','Content-Length':Buffer.byteLength(body) }
    };

    const req = https.request(options, res => {
      let data='';
      res.on('data', c => data+=c);
      res.on('end', () => {
        try {
          const parsed = JSON.parse(data);
          if (res.statusCode===429) { reject(new Error('Rate limit reached.')); return; }
          if (res.statusCode===400) { reject(new Error('API key invalid.')); return; }
          if (res.statusCode!==200) { reject(new Error(`Gemini ${res.statusCode}`)); return; }
          const text = parsed.candidates?.[0]?.content?.parts?.[0]?.text || '';
          console.log('RAW TRIAGE RESPONSE:', JSON.stringify(text));
          resolve(text);
        } catch(e) { reject(e); }
      });
    });
    req.setTimeout(15000, () => { req.destroy(); reject(new Error('Triage timeout')); });
    req.on('error', reject);
    req.write(body); req.end();
  });
}

// ── SYSTEM PROMPT ─────────────────────────────────
const NARRATION_PROMPT = `You are SakayAI, a friendly Metro Manila commute assistant.
The route has already been computed. Write ONLY a warm 1-2 sentence introduction for it.
Do NOT output JSON, numbers, or any route data. Just a friendly sentence or two in English with light Taglish.
Example: "Sige, found a good route for you! This combo gets you there in about an hour without breaking the bank."`;

// ── HELPERS ───────────────────────────────────────
function readBody(req) {
  return new Promise((resolve, reject) => {
    let body='';
    req.on('data', c => body+=c);
    req.on('end', () => { try { resolve(JSON.parse(body||'{}')); } catch(e) { reject(new Error('Invalid JSON')); } });
    req.on('error', reject);
  });
}

function sendJson(res, status, data) {
  if (res.headersSent) return;
  res.writeHead(status, { 'Content-Type':'application/json' });
  res.end(JSON.stringify(data));
}

// ── SERVER ────────────────────────────────────────
const server = http.createServer(async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin','*');
  res.setHeader('Access-Control-Allow-Headers','Content-Type');
  if (req.method==='OPTIONS') { res.writeHead(204); res.end(); return; }

if (req.method==='POST' && req.url.startsWith('/api/chat')) {
  try {
    const { message, history=[], mode='cheapest' } = await readBody(req);
    const pipelineLog = [];
    const log = (stage, data) => pipelineLog.push({ stage, data });

    const quickParse = parseUserInput(message);
if (quickParse.origin && quickParse.destination) {
  log('fast_path', { origin: quickParse.origin, destination: quickParse.destination });
  const resolved = resolveLocations(quickParse.origin, quickParse.destination);
  const paths = listPaths(resolved);
  if (paths.length > 0) {
    const fullContext = [...history.map(m => m.text||''), message].join(' ');
    const budgetMatch = fullContext.match(/[₱p](\d+)|(\d+)\s*peso/i);
    const budget = budgetMatch ? parseInt(budgetMatch[1]||budgetMatch[2]) : null;
    const isPeak = /\b(7am|8am|5pm|6pm|7pm|rush|peak|morning rush|umaga)\b/.test(fullContext.toLowerCase());
    const readPaths = paths.map(p => readPath(p, isPeak));
    const context = getContext(readPaths, budget, mode);
    const routeJson = buildRouteJson(context, resolved.origin, resolved.destination);
    const intro = await callGemini(NARRATION_PROMPT, `Route: ${resolved.origin} to ${resolved.destination}.`, [])
      .catch(() => `Here's your route from ${resolved.origin} to ${resolved.destination}!`);
    sendJson(res, 200, { type:'route', text:`${intro.trim()}\n\nROUTE_JSON:\n${JSON.stringify(routeJson)}`, pipelineLog });
    return;
  }
}
    // ── STEP 0: Gemini triages the conversation ──
    // Reads full history + current message, decides if ready to route
const TRIAGE_PROMPT = `You are SaanPH, a Metro Manila commute assistant.
Read the FULL conversation history carefully. Your job is to extract origin and destination.

Known Manila landmarks (use these to normalize):
- "One Ayala", "Ayala Center", "Glorietta", "Greenbelt" = Makati
- "MOA", "Mall of Asia", "SM MOA" = MOA
- "BGC", "Bonifacio", "Fort" = BGC
- "DLSU", "Taft Ave", "Vito Cruz" = Taft area

If the conversation history shows the user already answered a question about origin OR destination,
combine that with the current message to extract both.

Example: if history shows "Where in Makati?" and user replied "One Ayala 3pm" and destination was "MOA",
then origin = "Makati" and destination = "MOA".

If you have BOTH origin and destination, output ONLY this exact line (nothing else):
ROUTE_READY: origin="X" destination="Y"

If you still need ONE piece of info, ask ONE short question only. No bullet points. Max 1 sentence.`;

      const rawHistory = history
        .filter(m => m.role && (m.text || m.parts?.[0]?.text))
        .map(m => ({
          role: m.role === 'model' ? 'model' : 'user',
          parts: [{ text: (m.text || m.parts?.[0]?.text || '').replace(/ROUTE_JSON:[\s\S]*/,'').trim() }]
        }));

      // Ensure strict alternation — Gemini requires user/model/user/model
      const triageHistory = [];
      let lastRole = null;
      for (const msg of rawHistory) {
        if (msg.role !== lastRole) {
          triageHistory.push(msg);
          lastRole = msg.role;
        }
      }
      // Must start with user
      if (triageHistory.length > 0 && triageHistory[0].role !== 'user') {
        triageHistory.shift();
      }

    let triageReply = null;
    let triageError = null;

    try {
      triageReply = await callGeminiRaw(TRIAGE_PROMPT, message, triageHistory);
    } catch(e) {
      triageError = e.message;
    }

    log('triage', { reply: triageReply, error: triageError });

    // If Gemini failed entirely, fall back to direct parse
    if (!triageReply) {
      const parsed = parseUserInput(message);
      if (parsed.origin && parsed.destination) {
        triageReply = `ROUTE_READY: origin="${parsed.origin}" destination="${parsed.destination}"`;
      } else {
        sendJson(res, 200, { type:'chat', text: `Saan ka galing at saan ka pupunta? (Error: ${triageError||'no response'})`, pipelineLog });
        return;
      }
    }

    const routeReadyMatch = triageReply.match(/ROUTE_READY:\s*origin="([^"]+)"\s*destination="([^"]+)"/i);

    if (!routeReadyMatch) {
      sendJson(res, 200, { type:'chat', text: triageReply, pipelineLog });
      return;
    }

    // Ready — extract origin + destination Gemini identified
    const extractedOrigin = routeReadyMatch[1].trim();
    const extractedDest   = routeReadyMatch[2].trim();
    log('extracted', { origin: extractedOrigin, destination: extractedDest });

    // Parse budget + peak hour from full conversation context
    const fullContext = [...history.map(m => m.text||''), message].join(' ');
    const budgetMatch = fullContext.match(/[₱p](\d+)|(\d+)\s*peso/i);
    const budget = budgetMatch ? parseInt(budgetMatch[1]||budgetMatch[2]) : null;
    const isPeak  = /\b(7am|8am|5pm|6pm|7pm|rush|peak|morning rush|umaga)\b/.test(fullContext.toLowerCase());

    // STAGE 1
    const resolved = resolveLocations(extractedOrigin, extractedDest);
    log('resolve', { origin: resolved.origin, destination: resolved.destination });

    // STAGE 2
    const paths = listPaths(resolved);
    log('paths', paths.map(p => p.description));

    if (paths.length === 0) {
      const reply = await callGemini(
        `You are SakayAI. No route found between "${resolved.origin}" and "${resolved.destination}". 
         Tell the user briefly and suggest they rephrase using simpler area names. Be short and friendly.`,
        `No route: ${resolved.origin} → ${resolved.destination}`, triageHistory
      ).catch(() => `Hindi ko mahanap ang route between ${resolved.origin} and ${resolved.destination}. Try mo ulit with a nearby landmark!`);
      sendJson(res, 200, { type:'chat', text: reply, pipelineLog });
      return;
    }

    // STAGE 3
    const readPaths = paths.map(p => readPath(p, isPeak));
    log('fares', readPaths.map(p => ({ id: p.id, fare: p.totalFare, min: p.totalMin })));

    // STAGE 4
    const context = getContext(readPaths, budget, mode);
    log('ranked', { recommended: context.recommended?.id, budgetWarning: context.budgetWarning });

    const routeJson = buildRouteJson(context, resolved.origin, resolved.destination);
    log('route_json', routeJson);

    const introContext = `Route: ${resolved.origin} to ${resolved.destination}. Transfers: ${context.recommended.transfers}. ${context.budgetWarning||''}`;
    const intro = await callGemini(NARRATION_PROMPT, introContext, triageHistory)
      .catch(() => `Here's your route from ${resolved.origin} to ${resolved.destination}!`);

    sendJson(res, 200, {
      type: 'route',
      text: `${intro.trim()}\n\nROUTE_JSON:\n${JSON.stringify(routeJson)}`,
      pipelineLog
    });

  } catch(e) {
    sendJson(res, 500, { error: e.message||'Server error' });
  }
  return;
}

  // Static files
  let filePath = path.join(__dirname, req.url==='/'?'index.html':req.url);
  if (!filePath.startsWith(__dirname)) { res.writeHead(403); res.end('Forbidden'); return; }
  const ext = path.extname(filePath);
  fs.readFile(filePath, (err, data) => {
    if (err) { res.writeHead(404); res.end('Not found'); return; }
    res.writeHead(200, { 'Content-Type':MIME[ext]||'text/plain' });
    res.end(data);
  });
});

const PORT = process.env.PORT||3000;
server.listen(PORT, () => {
  console.log(`\n  SakayAI running → http://localhost:${PORT}\n`);
  if (!process.env.GEMINI_API_KEY) console.warn('  ⚠  GEMINI_API_KEY not set in .env!\n');
});