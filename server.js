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
    "paranaque":"Paranaque","parañaque":"Paranaque","para":"Paranaque",
    "sucat":"Paranaque","bf homes":"Paranaque",
    "las pinas":"Las Pinas","las piñas":"Las Pinas","laspinas":"Las Pinas",
    "alabang":"Alabang","starmall":"Alabang","muntinlupa":"Alabang","vtx":"Alabang",
    "bicutan":"Bicutan","ftf":"Bicutan","fti":"Bicutan",
    "moa":"MOA","mall of asia":"MOA","sm moa":"MOA","sm mall of asia":"MOA",
    "pasay":"Pasay","baclaran":"Baclaran","pitx":"PITX",
    "naia":"NAIA","airport":"NAIA","naia 1":"NAIA","naia 2":"NAIA","naia 3":"NAIA","naia 4":"NAIA",
    "terminal 1":"NAIA","terminal 2":"NAIA","terminal 3":"NAIA",
    "makati":"Makati","ayala":"Makati","glorietta":"Makati","greenbelt":"Makati",
    "one ayala":"Makati","buendia":"Buendia","gil puyat":"Buendia",
    "bgc":"BGC","bonifacio":"BGC","bonifacio global city":"BGC","taguig":"BGC","fort":"BGC",
    "market market":"BGC","uptown bgc":"BGC","uptown mall":"BGC",
    "guadalupe":"Guadalupe",
    "ortigas":"Ortigas","pasig":"Ortigas","sm megamall":"Ortigas","megamall":"Ortigas",
    "robinsons galleria":"Ortigas","starmall shaw":"Ortigas",
    "mandaluyong":"Mandaluyong","shaw":"Mandaluyong","boni":"Mandaluyong",
    "san juan":"San Juan","greenhills":"San Juan",
    "quiapo":"Quiapo","manila":"Manila","divisoria":"Manila","intramuros":"Manila",
    "lawton":"Manila","avenida":"Manila","recto":"Quiapo","sampaloc":"Manila",
    "espana":"Manila","españa":"Manila","luneta":"Manila","rizal park":"Manila",
    "binondo":"Manila","chinatown":"Manila",
    "monumento":"Monumento","caloocan":"Monumento","balintawak":"Monumento",
    "sm north":"SM North","sm north edsa":"SM North","north edsa":"SM North","trinoma":"SM North",
    "fairview":"Novaliches","novaliches":"Novaliches","commonwealth":"Novaliches",
    "qc":"Quezon City","quezon city":"Quezon City","quezon ave":"Quezon City",
    "cubao":"Cubao","araneta":"Cubao","araneta cubao":"Cubao","farmers":"Cubao","gateway":"Cubao",
    "marikina":"Marikina","santolan":"Marikina",
    "antipolo":"Antipolo","cainta":"Antipolo","cogeo":"Antipolo",
    "katipunan":"Katipunan","ateneo":"Katipunan","up":"Katipunan","loyola":"Katipunan",
  },

  areas: {
    "Paranaque":   { hub:"Baclaran",        hubLine:"LRT-1", hubMin:25, hubKm:6,  hubMode:"jeepney" },
    "Las Pinas":   { hub:"Baclaran",        hubLine:"LRT-1", hubMin:30, hubKm:7,  hubMode:"jeepney" },
    "Alabang":     { hub:"Alabang",         hubLine:"P2P",   hubMin:0,  hubKm:0,  hubMode:"origin"  },
    "Bicutan":     { hub:"Taft Avenue",     hubLine:"MRT-3", hubMin:20, hubKm:5,  hubMode:"jeepney" },
    "Baclaran":    { hub:"Baclaran",        hubLine:"LRT-1", hubMin:0,  hubKm:0,  hubMode:"origin"  },
    "Pasay":       { hub:"Baclaran",        hubLine:"LRT-1", hubMin:10, hubKm:2,  hubMode:"jeepney" },
    "MOA":         { hub:"MOA",             hubLine:"P2P",   hubMin:0,  hubKm:0,  hubMode:"origin"  },
    "PITX":        { hub:"PITX",            hubLine:"P2P",   hubMin:0,  hubKm:0,  hubMode:"origin"  },
    "NAIA":        { hub:"NAIA",            hubLine:"P2P",   hubMin:0,  hubKm:0,  hubMode:"origin"  },
    "Makati":      { hub:"Ayala",           hubLine:"MRT-3", hubMin:10, hubKm:2,  hubMode:"jeepney" },
    "Buendia":     { hub:"Buendia",         hubLine:"LRT-1", hubMin:0,  hubKm:0,  hubMode:"origin"  },
    "Guadalupe":   { hub:"Guadalupe",       hubLine:"MRT-3", hubMin:0,  hubKm:0,  hubMode:"origin"  },
    "BGC":         { hub:"Ayala",           hubLine:"MRT-3", hubMin:15, hubKm:3,  hubMode:"jeepney" },
    "Ortigas":     { hub:"Ortigas",         hubLine:"MRT-3", hubMin:10, hubKm:2,  hubMode:"jeepney" },
    "Mandaluyong": { hub:"Shaw Boulevard",  hubLine:"MRT-3", hubMin:8,  hubKm:2,  hubMode:"jeepney" },
    "San Juan":    { hub:"Shaw Boulevard",  hubLine:"MRT-3", hubMin:12, hubKm:3,  hubMode:"jeepney" },
    "Quiapo":      { hub:"Doroteo Jose",    hubLine:"LRT-1", hubMin:10, hubKm:2,  hubMode:"jeepney" },
    "Manila":      { hub:"Central Terminal",hubLine:"LRT-1", hubMin:12, hubKm:3,  hubMode:"jeepney" },
    "Monumento":   { hub:"Monumento",       hubLine:"LRT-1", hubMin:0,  hubKm:0,  hubMode:"origin"  },
    "SM North":    { hub:"North Avenue",    hubLine:"MRT-3", hubMin:5,  hubKm:1,  hubMode:"walk"    },
    "Quezon City": { hub:"Quezon Avenue",   hubLine:"MRT-3", hubMin:8,  hubKm:2,  hubMode:"jeepney" },
    "Novaliches":  { hub:"North Avenue",    hubLine:"MRT-3", hubMin:45, hubKm:10, hubMode:"jeepney" },
    "Cubao":       { hub:"Araneta-Cubao",   hubLine:"MRT-3", hubMin:0,  hubKm:0,  hubMode:"origin"  },
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

  p2p: [
    { from:"Alabang", to:"BGC",    bus:"HM Worthy",              fare:52, min:45, note:"Via SLEX–C5, TRIPKO card. 6AM–8PM." },
    { from:"Alabang", to:"Makati", bus:"Alabang–Ayala Bus",       fare:48, min:35, note:"Via SLEX. 4AM–10PM. Also RRCG P2P from ATC/SouthPark to Glorietta." },
    { from:"Alabang", to:"Cubao",  bus:"Alabang Metrolink / HM",  fare:75, min:60, note:"Via EDSA. Also MRT: ride to Ayala, switch to MRT Cubao." },
    { from:"Alabang", to:"MOA",    bus:"Alabang–Pasay Bus",       fare:40, min:40, note:"Via EDSA." },
    { from:"Alabang", to:"Ortigas",bus:"Starmall–Ortigas Bus",    fare:65, min:55, note:"Via EDSA." },
    { from:"Las Pinas", to:"Makati", bus:"Las Piñas–Ayala Bus",   fare:55, min:45, note:"Via Coastal Rd / SLEX." },
    { from:"Paranaque", to:"BGC",    bus:"HM Worthy / P2P",       fare:65, min:35, note:"Via C5." },
    { from:"Paranaque", to:"Makati", bus:"Paranaque–Ayala Bus",    fare:50, min:40, note:"Via SLEX." },
    { from:"Paranaque", to:"MOA",    bus:"Paranaque–Pasay Bus",    fare:30, min:25, note:"Via Coastal Rd." },
    { from:"Cubao", to:"BGC",    bus:"HM Transport",              fare:85, min:40, note:"Via C5." },
    { from:"Cubao", to:"Alabang",bus:"Alabang Metrolink",         fare:75, min:60, note:"Via EDSA–SLEX. Or MRT to Ayala, Ayala bus to Alabang." },
    { from:"Cubao", to:"MOA",    bus:"EDSA Carousel / UV",        fare:30, min:45, note:"EDSA Carousel southbound to Taft, jeep to MOA." },
    { from:"Cubao", to:"SM North",bus:"EDSA Carousel",            fare:15, min:20, note:"EDSA Carousel northbound." },
    { from:"Novaliches", to:"Makati",   bus:"Novaliches–Ayala P2P", fare:90, min:60, note:"Via EDSA." },
    { from:"Novaliches", to:"SM North", bus:"Jeep to North Ave",    fare:20, min:40, note:"Jeep to SM North / North Ave MRT." },
    { from:"MOA", to:"Makati", bus:"EDSA Carousel / Green Frog",  fare:30, min:30, note:"EDSA Carousel to Ayala or Green Frog Hybrid Bus (PITX–BGC via Buendia). Stops at MOA Globe." },
    { from:"MOA", to:"BGC",    bus:"Green Frog Hybrid Bus",       fare:35, min:25, note:"Operates daily PITX–Uptown BGC via LRT Buendia. Stops at MOA Globe." },
    { from:"MOA", to:"Cubao",  bus:"EDSA Carousel",               fare:30, min:50, note:"Northbound EDSA Carousel." },
    { from:"MOA", to:"Manila", bus:"Jeep to Lawton / Luneta",     fare:13, min:30, note:"Modern jeep to Lawton or Luneta passing Intramuros." },
    { from:"PITX", to:"BGC",     bus:"Green Frog Hybrid Bus",     fare:40, min:35, note:"Direct PITX–Uptown BGC via LRT Buendia / Gil Puyat." },
    { from:"PITX", to:"Makati",  bus:"PITX–Ayala Bus",            fare:35, min:30, note:"Via EDSA." },
    { from:"PITX", to:"MOA",     bus:"PITX–MOA Shuttle",          fare:20, min:15, note:"Short hop via Coastal Rd." },
    { from:"PITX", to:"Cubao",   bus:"EDSA Carousel",             fare:30, min:55, note:"Northbound via EDSA." },
    { from:"PITX", to:"SM North",bus:"EDSA Carousel",             fare:30, min:60, note:"Northbound terminus." },
    { from:"PITX", to:"Alabang", bus:"PITX–Alabang Bus",          fare:30, min:30, note:"Via Coastal Rd." },
    { from:"Buendia", to:"Cubao",    bus:"EDSA Carousel / Bus",   fare:25, min:35, note:"EDSA Carousel northbound or ordinary bus via EDSA." },
    { from:"Buendia", to:"SM North", bus:"EDSA Carousel / Bus",   fare:28, min:50, note:"EDSA northbound." },
    { from:"Buendia", to:"Alabang",  bus:"Buendia–Alabang Bus",   fare:52, min:45, note:"Via EDSA–SLEX." },
    { from:"Buendia", to:"MOA",      bus:"Jeep / Modern Jeep",    fare:13, min:20, note:"Jeep to EDSA/Taft then to MOA, or jeep to Buendia MRT jeep to MOA." },
    { from:"Buendia", to:"BGC",      bus:"BGC Bus / Jeep",        fare:25, min:20, note:"Jeep to Guadalupe then BGC Bus, or direct jeep signboard BGC." },
    { from:"Buendia", to:"Monumento",bus:"EDSA Bus",              fare:35, min:60, note:"Ordinary bus via EDSA northbound to Monumento." },
  ]
};

// ── OPENWEATHERMAP ────────────────────────────────
const WEATHER_CITY_MAP = {
  "Paranaque":   "Paranaque City",
  "Las Pinas":   "Las Pinas",
  "Alabang":     "Muntinlupa",
  "Bicutan":     "Paranaque City",
  "Baclaran":    "Pasay",
  "Pasay":       "Pasay",
  "MOA":         "Pasay",
  "PITX":        "Paranaque City",
  "NAIA":        "Pasay",
  "Makati":      "Makati",
  "Buendia":     "Makati",
  "Guadalupe":   "Makati",
  "BGC":         "Taguig",
  "Ortigas":     "Pasig",
  "Mandaluyong": "Mandaluyong",
  "San Juan":    "San Juan",
  "Quiapo":      "Manila",
  "Manila":      "Manila",
  "Monumento":   "Caloocan",
  "SM North":    "Quezon City",
  "Quezon City": "Quezon City",
  "Novaliches":  "Quezon City",
  "Cubao":       "Quezon City",
  "Marikina":    "Marikina",
  "Antipolo":    "Antipolo",
  "Katipunan":   "Quezon City",
};

// ── CURRENT WEATHER ───────────────────────────────
function getWeather(areaName) {
  return new Promise((resolve) => {
    const apiKey = process.env.OPENWEATHER_API_KEY;
    if (!apiKey) { resolve(null); return; }

    const city = WEATHER_CITY_MAP[areaName] || areaName;
    const urlPath = `/data/2.5/weather?q=${encodeURIComponent(city + ',PH')}&appid=${apiKey}&units=metric`;

    const req = https.request({
      hostname: 'api.openweathermap.org',
      path: urlPath,
      method: 'GET'
    }, res => {
      let data = '';
      res.on('data', c => data += c);
      res.on('end', () => {
        try {
          const json = JSON.parse(data);
          if (json.weather && json.main) {
            resolve({
              description: json.weather[0].description,
              main:        json.weather[0].main,
              temp:        Math.round(json.main.temp),
              feels_like:  Math.round(json.main.feels_like),
              humidity:    json.main.humidity,
              isRainy:     /rain|thunder|drizzle/i.test(json.weather[0].main),
              city
            });
          } else {
            resolve(null);
          }
        } catch (e) {
          resolve(null);
        }
      });
    });

    req.setTimeout(5000, () => { req.destroy(); resolve(null); });
    req.on('error', () => resolve(null));
    req.end();
  });
}

// ── FORECAST WEATHER ──────────────────────────────
// targetHour: 0-23 (local PH time). If null, returns the next available slot.
function getWeatherForecast(areaName, targetHour) {
  return new Promise((resolve) => {
    const apiKey = process.env.OPENWEATHER_API_KEY;
    if (!apiKey) { resolve(null); return; }

    const city = WEATHER_CITY_MAP[areaName] || areaName;
    const urlPath = `/data/2.5/forecast?q=${encodeURIComponent(city + ',PH')}&appid=${apiKey}&units=metric&cnt=16`;

    const req = https.request({
      hostname: 'api.openweathermap.org',
      path: urlPath,
      method: 'GET'
    }, res => {
      let data = '';
      res.on('data', c => data += c);
      res.on('end', () => {
        try {
          const json = JSON.parse(data);
          if (!json.list || json.list.length === 0) { resolve(null); return; }

          // Each slot is a 3-hour window. Find the best match for targetHour (PH = UTC+8).
          let bestSlot = null;
          if (targetHour !== null && targetHour !== undefined) {
            let minDiff = Infinity;
            for (const slot of json.list) {
              const slotDate = new Date((slot.dt + 8 * 3600) * 1000); // shift to PH time
              const slotHour = slotDate.getUTCHours();
              const diff = Math.abs(slotHour - targetHour);
              if (diff < minDiff) {
                minDiff = diff;
                bestSlot = slot;
              }
            }
          } else {
            bestSlot = json.list[0]; // next available slot
          }

          if (!bestSlot) { resolve(null); return; }

          // Format the PH local time for display
          const slotDate = new Date((bestSlot.dt + 8 * 3600) * 1000);
          const displayHour = slotDate.getUTCHours();
          const ampm = displayHour >= 12 ? 'PM' : 'AM';
          const h12 = displayHour % 12 || 12;
          const displayTime = `${h12}:00 ${ampm}`;

          resolve({
            description: bestSlot.weather[0].description,
            main:        bestSlot.weather[0].main,
            temp:        Math.round(bestSlot.main.temp),
            feels_like:  Math.round(bestSlot.main.feels_like),
            humidity:    bestSlot.main.humidity,
            isRainy:     /rain|thunder|drizzle/i.test(bestSlot.weather[0].main),
            displayTime,
            city
          });
        } catch (e) {
          resolve(null);
        }
      });
    });

    req.setTimeout(5000, () => { req.destroy(); resolve(null); });
    req.on('error', () => resolve(null));
    req.end();
  });
}

// ── PARSE TARGET HOUR FROM USER MESSAGE ───────────
// Returns 0-23 or null if no time found.
function parseTargetHour(text) {
  const lower = text.toLowerCase();
  // Match patterns like "6pm", "6:00pm", "6 pm", "18:00", "6am", "3:30pm"
  const match = lower.match(/\b(\d{1,2})(?::(\d{2}))?\s*(am|pm)\b/) ||
                lower.match(/\b([01]?\d|2[0-3]):([0-5]\d)\b/);
  if (!match) return null;

  if (match[3]) {
    // 12-hour format
    let hour = parseInt(match[1]);
    const isPm = match[3] === 'pm';
    if (isPm && hour !== 12) hour += 12;
    if (!isPm && hour === 12) hour = 0;
    return hour;
  } else if (match[2]) {
    // 24-hour format (HH:MM)
    return parseInt(match[1]);
  }
  return null;
}

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

  // Skip rail logic if either end is a P2P-only hub (MOA, PITX, NAIA, Alabang)
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

  // ── LRT-1 → MRT-3 ──
  if (originArea.hubLine==='LRT-1' && destArea.hubLine==='MRT-3') {
    const oi=stationIdx(DB.lrt1,originArea.hub), edsa=stationIdx(DB.lrt1,'EDSA');
    const taft=stationIdx(DB.mrt3,'Taft Avenue'), di=stationIdx(DB.mrt3,destArea.hub);
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

  // ── MRT-3 → LRT-2 ──
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
      const dir = s.from && s.to ? (DB.mrt3.stations.indexOf(s.to) > DB.mrt3.stations.indexOf(s.from) ? 'Northbound' : 'Southbound') : '';
      label=`MRT-3 ${dir}: ${s.from} → ${s.to}`;
      detail=`Board at ${s.from} station · ${n} stop${n>1?'s':''} · Alight at ${s.to}${isPeak?' · Expect queues at turnstiles':''}`;
    } else if (s.mode==='LRT-1') {
      const n=s.stops||1;
      fare=DB.lrt1.fare[Math.min(n,17)]||30;
      min=Math.ceil(n*DB.lrt1.minPerStop+5);
      const dir = DB.lrt1.stations.indexOf(s.to) > DB.lrt1.stations.indexOf(s.from) ? 'Northbound' : 'Southbound';
      label=`LRT-1 ${dir}: ${s.from} → ${s.to}`;
      detail=`Board at ${s.from} station · ${n} stop${n>1?'s':''} · Alight at ${s.to}${isPeak?' · Very crowded during rush hour':''}`;
    } else if (s.mode==='LRT-2') {
      const n=s.stops||1;
      fare=DB.lrt2.fare[Math.min(n,10)]||22;
      min=Math.ceil(n*DB.lrt2.minPerStop+4);
      const dir = DB.lrt2.stations.indexOf(s.to) > DB.lrt2.stations.indexOf(s.from) ? 'Eastbound' : 'Westbound';
      label=`LRT-2 ${dir}: ${s.from} → ${s.to}`;
      detail=`Board at ${s.from} station · ${n} stop${n>1?'s':''} · Alight at ${s.to}`;
    } else if (s.mode==='jeepney') {
      const km=s.km||4;
      fare=km<=4?13:Math.ceil(13+(km-4)*1.80);
      min=Math.ceil((s.min||20)*pm);
      label=`Jeepney: ${s.from} → ${s.to}`;
      detail=`Ride jeepney from ${s.from} going to ${s.to} · ~${km}km · Flag down along the route${isPeak?' · Heavy traffic expected':''}`;
    } else if (s.mode==='walk') {
      fare=0; min=s.min||5;
      label=`Walk: ${s.from} → ${s.to}`;
      detail=s.note||`Walk from ${s.from} to ${s.to}`;
    } else if (s.mode==='p2p') {
      fare=s.fare||0;
      min=Math.ceil((s.min||40)*(isPeak?1.3:1));
      label=`${s.bus||'P2P Bus'}: ${s.from} → ${s.to}`;
      detail=`${s.note||'Air-conditioned · Fixed fare · No stops'}${isPeak?' · May be delayed due to traffic':''}`;
    }
    return {...s, fare, min, label, detail};
  });

  const filteredSegs = segs.filter(s => !s.from || !s.to || s.from !== s.to);

  return {...p, segments:filteredSegs,
    totalFare: filteredSegs.reduce((a,s)=>a+s.fare,0),
    totalMin:  filteredSegs.reduce((a,s)=>a+s.min,0),
    isPeak};
}

// ── STAGE 4: get_context ──────────────────────────
function getContext(readPaths) {
  const ranked = [...readPaths];
  return {
    allPaths: readPaths,
    recommended: ranked[0]||null,
    alternatives: ranked.slice(1,3)
  };
}

// ── PARSE USER INPUT ──────────────────────────────
function parseUserInput(message) {
  const text = message.toLowerCase();
  const isPeak = /\b(7am|8am|5pm|6pm|7pm|rush|peak|morning rush|umaga)\b/.test(text);

  let origin=null, destination=null;

  const hasRouteIntent = /\b(to|papunta|goin|going|from|paano|how.*go|how.*get|how.*reach|directions?|route|commute|sakay)\b/i.test(message);
  if (!hasRouteIntent) return { origin: null, destination: null, isPeak };

  const m = message.match(/(?:from\s+)?(.+?)\s+to\s+(.+?)(?:\s*[,.]|$|\s+[₱p]\d|\s+need|\s+by\s+\d)/i);
  if (m) {
    const rawOrigin = m[1].replace(/^(from|sa|paano|how.*go|how.*get)\s+/i,'').trim();
    const rawDest   = m[2].trim();
    const questionPhrases = /^(how|what|where|when|why|can|is|are|do|does|i|we|you)/i;
    if (!questionPhrases.test(rawOrigin)) {
      origin      = rawOrigin;
      destination = rawDest;
    }
  }

  return { origin, destination, isPeak };
}

// ── BUILD ROUTE JSON ──────────────────────────────
function buildRouteJson(context, origin, destination) {
  const rec = context.recommended;
  if (!rec) return null;
  return {
    title: `${origin} → ${destination}`,
    transfers: rec.transfers,
    totalFare: rec.totalFare,
    totalMin: rec.totalMin,
    steps: rec.segments.map(s => ({
      type: s.mode==='MRT-3'   ? 'mrt'  :
            s.mode==='LRT-1' || s.mode==='LRT-2' ? 'lrt' :
            s.mode==='p2p'   ? 'bus'  :
            s.mode==='jeepney' ? 'jeep' :
            s.mode==='walk'  ? 'walk' : 'walk',
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

function callGemini(systemPrompt, userMessage, history) {
  return callGeminiRaw(systemPrompt, userMessage, history);
}

// ── SYSTEM PROMPTS ────────────────────────────────
const NARRATION_PROMPT = `You are SakayAI, a friendly Metro Manila commute assistant.
The route has already been computed. Write ONLY a warm introduction for it.
Write ONE sentence in English, then repeat the same idea in ONE sentence in Filipino/Tagalog.
If weather data is provided and it mentions rain, thunder, or drizzle, naturally mention bringing an umbrella.
Do NOT output JSON, numbers, or any route data. Just the two sentences — nothing else.
Example:
"Found a good route for you - this combo should be easy to follow!
May nakita akong magandang ruta para sa iyo - madali itong sundan!"`;

const TRIAGE_PROMPT = `You are SaanPH, a Metro Manila commute assistant.
Read the FULL conversation history carefully.

STEP 1 — Check if the user is asking a follow-up about an already-shown route.
Follow-up phrases include: "more options", "other options", "alternative", "another way",
"ibang route", "may iba pa", "alternatives".
If yes, output ONLY: SHOW_ALTERNATIVES

STEP 2 — Check if the user is asking about weather for a specific location and time.
Weather question examples: "will it rain in MOA at 6pm?", "papatak ba ulan sa BGC mamaya?",
"what's the weather like in Makati tonight?", "is it going to rain?".
If yes, output ONLY: WEATHER_QUERY: location="X" time="6pm"
Use "now" for time if no specific time is mentioned.

STEP 3 — Check if the user wants a brand-new route (different origin/destination).
If yes, extract origin and destination and output ONLY:
ROUTE_READY: origin="X" destination="Y"

STEP 4 — If you cannot determine origin or destination, ask ONE short question. No bullets. Max 1 sentence.

Known Manila landmarks:
- "One Ayala", "Ayala Center", "Glorietta", "Greenbelt" = Makati
- "MOA", "Mall of Asia", "SM MOA" = MOA
- "BGC", "Bonifacio", "Fort" = BGC
- "DLSU", "Taft Ave", "Vito Cruz" = Taft area`;

const WEATHER_ANSWER_PROMPT = `You are SakayAI, a friendly Metro Manila commute assistant.
You have been given a weather forecast result. Write a short, friendly answer about the weather.
Write ONE sentence in English, then ONE sentence in Filipino/Tagalog.
If it is rainy, naturally suggest bringing an umbrella or raincoat.
Do NOT output JSON or route data. Just the two friendly sentences.`;

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

// ── BUILD WEATHER NOTE (shared helper) ────────────
function buildWeatherNote(weather) {
  if (!weather) return '';
  return `Weather at destination: ${weather.description}, ${weather.temp}°C, humidity ${weather.humidity}%.${weather.isRainy ? ' IT IS CURRENTLY RAINING.' : ''}`;
}

// ── SERVER ────────────────────────────────────────
const server = http.createServer(async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin','*');
  res.setHeader('Access-Control-Allow-Headers','Content-Type');
  if (req.method==='OPTIONS') { res.writeHead(204); res.end(); return; }

  if (req.method==='POST' && req.url.startsWith('/api/chat')) {
    try {
      const { message, history=[] } = await readBody(req);

      // Fast path only fires on the FIRST message (no history).
      const quickParse = history.length === 0 ? parseUserInput(message) : { origin: null, destination: null };

      if (quickParse.origin && quickParse.destination) {
        const resolved = resolveLocations(quickParse.origin, quickParse.destination);
        const paths = listPaths(resolved);
        if (paths.length > 0) {
          const isPeak = /\b(7am|8am|5pm|6pm|7pm|rush|peak|morning rush|umaga)\b/.test(message.toLowerCase());
          const readPaths = paths.map(p => readPath(p, isPeak));
          const context = getContext(readPaths);
          const routeJson = buildRouteJson(context, resolved.origin, resolved.destination);

          const weather = await getWeather(resolved.destination);

          const weatherNote = buildWeatherNote(weather);
          const introContext = `Route: ${resolved.origin} to ${resolved.destination}. Transfers: ${context.recommended.transfers}. ${weatherNote}`.trim();

          const intro = await callGemini(NARRATION_PROMPT, introContext, [])
            .catch(() => `Here's your route from ${resolved.origin} to ${resolved.destination}!`);

          sendJson(res, 200, { type:'route', text:`${intro.trim()}\n\nROUTE_JSON:\n${JSON.stringify(routeJson)}` });
          return;
        }
      }

      // ── Triage via Gemini ──
      const rawHistory = history
        .filter(m => m.role && (m.text || m.parts?.[0]?.text))
        .map(m => ({
          role: m.role === 'model' ? 'model' : 'user',
          parts: [{ text: (m.text || m.parts?.[0]?.text || '').replace(/ROUTE_JSON:[\s\S]*/,'').trim() }]
        }));

      // Enforce strict user/model alternation required by Gemini API
      const triageHistory = [];
      let lastRole = null;
      for (const msg of rawHistory) {
        if (msg.role !== lastRole) {
          triageHistory.push(msg);
          lastRole = msg.role;
        }
      }
      if (triageHistory.length > 0 && triageHistory[0].role !== 'user') {
        triageHistory.shift();
      }

      // Pre-check: detect follow-up intent WITHOUT calling Gemini
      const isFollowUpIntent = /more options?|other options?|alternative|another (way|route|option)|ibang route|may iba pa|iba pa|ibang (paraan|sakay)|any other/i.test(message);

      let triageReply = null;
      let triageError = null;

      if (isFollowUpIntent) {
        triageReply = 'SHOW_ALTERNATIVES';
      } else {
        try {
          triageReply = await callGeminiRaw(TRIAGE_PROMPT, message, triageHistory);
        } catch(e) {
          triageError = e.message;
        }

        if (!triageReply) {
          const parsed = parseUserInput(message);
          if (parsed.origin && parsed.destination) {
            triageReply = `ROUTE_READY: origin="${parsed.origin}" destination="${parsed.destination}"`;
          } else {
            sendJson(res, 200, { type:'chat', text: `Saan ka galing at saan ka pupunta? (Error: ${triageError||'no response'})` });
            return;
          }
        }
      }

      // ── Handle WEATHER_QUERY ──
      const weatherQueryMatch = triageReply.match(/WEATHER_QUERY:\s*location="([^"]+)"\s*time="([^"]+)"/i);
      if (weatherQueryMatch) {
        const weatherLocation = weatherQueryMatch[1].trim();
        const weatherTimeStr  = weatherQueryMatch[2].trim();

        // Resolve the location using the existing alias system
        const resolvedLocation = resolveLocations(weatherLocation, weatherLocation).origin;

        let forecastResult = null;
        if (weatherTimeStr.toLowerCase() === 'now') {
          forecastResult = await getWeather(resolvedLocation);
          if (forecastResult) forecastResult.displayTime = 'now';
        } else {
          const targetHour = parseTargetHour(weatherTimeStr);
          forecastResult = await getWeatherForecast(resolvedLocation, targetHour);
        }

        if (!forecastResult) {
          sendJson(res, 200, { type:'chat', text: `Sorry, hindi ko makuha ang weather data para sa ${resolvedLocation} ngayon. Try again later!` });
          return;
        }

        const forecastContext = `Location: ${resolvedLocation}. Time: ${forecastResult.displayTime}. Weather: ${forecastResult.description}, ${forecastResult.temp}°C, humidity ${forecastResult.humidity}%.${forecastResult.isRainy ? ' IT IS RAINY.' : ''}`;

        const weatherAnswer = await callGemini(WEATHER_ANSWER_PROMPT, forecastContext, triageHistory)
          .catch(() => `At ${forecastResult.displayTime} in ${resolvedLocation}: ${forecastResult.description}, ${forecastResult.temp}°C.${forecastResult.isRainy ? ' Magdala ng payong!' : ''}`);

        sendJson(res, 200, { type:'chat', text: weatherAnswer.trim() });
        return;
      }

      // ── Handle SHOW_ALTERNATIVES ──
      if (/SHOW_ALTERNATIVES/i.test(triageReply)) {
        const historyText = [...history].map(m => m.text||m.parts?.[0]?.text||'').join('\n');
        const prevRoute = historyText.match(/([\w\s]+?)\s*→\s*([\w\s]+?)(?:\n|\\n|$)/m);

        if (prevRoute) {
          const altResolved = resolveLocations(prevRoute[1].trim(), prevRoute[2].trim());
          const altPaths = listPaths(altResolved);
          if (altPaths.length > 1) {
            const fullContext = [...history.map(m => m.text||''), message].join(' ');
            const isPeak = /\b(7am|8am|5pm|6pm|7pm|rush|peak|morning rush|umaga)\b/.test(fullContext.toLowerCase());
            const readPaths = altPaths.map(p => readPath(p, isPeak));
            const alts = readPaths.slice(1);
            if (alts.length > 0) {
              const altContext = getContext(alts);
              const altJson = buildRouteJson(altContext, altResolved.origin, altResolved.destination);

              const weather = await getWeather(altResolved.destination);

              const weatherNote = buildWeatherNote(weather);
              const introContextAlt = `Alternative route: ${altResolved.origin} to ${altResolved.destination}. ${weatherNote}`.trim();

              const intro = await callGemini(NARRATION_PROMPT, introContextAlt, triageHistory)
                .catch(() => `Here's another option for you!`);
              sendJson(res, 200, { type:'route', text:`${intro.trim()}\n\nROUTE_JSON:\n${JSON.stringify(altJson)}` });
              return;
            }
          }
        }
        sendJson(res, 200, { type:'chat', text: `Sorry, wala na akong ibang route options para sa route na yon. Subukan mo mag-specify ng ibang area!` });
        return;
      }

      // ── Handle ROUTE_READY ──
      const routeReadyMatch = triageReply.match(/ROUTE_READY:\s*origin="([^"]+)"\s*destination="([^"]+)"/i);

      if (!routeReadyMatch) {
        sendJson(res, 200, { type:'chat', text: triageReply });
        return;
      }

      const extractedOrigin = routeReadyMatch[1].trim();
      const extractedDest   = routeReadyMatch[2].trim();

      const fullContext = [...history.map(m => m.text||''), message].join(' ');
      const isPeak  = /\b(7am|8am|5pm|6pm|7pm|rush|peak|morning rush|umaga)\b/.test(fullContext.toLowerCase());

      const resolved = resolveLocations(extractedOrigin, extractedDest);

      const paths = listPaths(resolved);
      log('paths', paths.map(p => p.description));

      if (paths.length === 0) {
        const reply = await callGemini(
          `You are SakayAI. No route found between "${resolved.origin}" and "${resolved.destination}". 
           Tell the user briefly and suggest they rephrase using simpler area names. Be short and friendly.`,
          `No route: ${resolved.origin} → ${resolved.destination}`, triageHistory
        ).catch(() => `Hindi ko mahanap ang route between ${resolved.origin} and ${resolved.destination}. Try mo ulit with a nearby landmark!`);
        sendJson(res, 200, { type:'chat', text: reply });
        return;
      }

      const readPaths = paths.map(p => readPath(p, isPeak));
      log('fares', readPaths.map(p => ({ id: p.id, fare: p.totalFare, min: p.totalMin })));

      const context = getContext(readPaths);

      const routeJson = buildRouteJson(context, resolved.origin, resolved.destination);

      const weather = await getWeather(resolved.destination);

      const weatherNote = buildWeatherNote(weather);
      const introContext = `Route: ${resolved.origin} to ${resolved.destination}. Transfers: ${context.recommended.transfers}. ${weatherNote}`.trim();

      const intro = await callGemini(NARRATION_PROMPT, introContext, triageHistory)
        .catch(() => `Here's your route from ${resolved.origin} to ${resolved.destination}!`);

      sendJson(res, 200, {
        type: 'route',
        text: `${intro.trim()}\n\nROUTE_JSON:\n${JSON.stringify(routeJson)}` });

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
  if (!process.env.GEMINI_API_KEY)      console.warn('  ⚠  GEMINI_API_KEY not set in .env!\n');
  if (!process.env.OPENWEATHER_API_KEY) console.warn('  ⚠  OPENWEATHER_API_KEY not set in .env (weather disabled)\n');
});
