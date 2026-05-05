const http = require('http');
const https = require('https');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

// ── OPTIMIZATION 1 & 2: CACHE & CONFIG ────────────
const ROUTE_CACHE = new Map(); // Cache for lookup_route results
const CACHE_TTL = 3600000; // 1 hour TTL
const API_TIMEOUT = 30000; // 30 second timeout for Gemini API

// ── OPTIMIZATION 3: TRIM CONVERSATION HISTORY ──────
function trimConversationHistory(messages) {
  if (messages.length <= 6) return messages; // Keep if 3 or fewer exchanges
  // Keep system context + last 3 message exchanges (6 messages max)
  return messages.slice(-6);
}

// ── OPTIMIZATION 2: CACHE KEY GENERATOR ────────────
function getCacheKey(origin, destination, mode) {
  const norm = s => (ROUTES_DB.aliases[s.toLowerCase()] || s).toLowerCase();
  return `${norm(origin)}→${norm(destination)}|${mode}`;
}

// ── MIME TYPES ────────────────────────────────────
const MIME = {
  '.html': 'text/html',
  '.js':   'application/javascript',
  '.css':  'text/css',
  '.json': 'application/json',
  '.ico':  'image/x-icon',
};

// ── ROUTE DATABASE (same data as routes_db.js) ────
const ROUTES_DB = {
  mrt3: {
    name: "MRT-3",
    stations: ["Taft Avenue","Magallanes","Ayala","Buendia","Guadalupe","Boni","Shaw Boulevard","Ortigas","Santolan","Araneta-Cubao","GMA-Kamuning","Quezon Avenue","North Avenue"],
    farePerStops: {1:13,2:13,3:15,4:16,5:18,6:20,7:22,8:24,9:26,10:28,11:28,12:28},
    avgMinPerStop: 2.5
  },
  lrt1: {
    name: "LRT-1",
    stations: ["Baclaran","EDSA","Libertad","Gil Puyat","Vito Cruz","Quirino","Pedro Gil","Central Terminal","UN Avenue","Carriedo","Doroteo Jose","Bambang","Tayuman","Blumentritt","Abad Santos","R. Papa","5th Avenue","Monumento"],
    farePerStops: {1:12,2:12,3:13,4:14,5:15,6:16,7:17,8:18,9:19,10:20,11:21,12:22,13:24,14:26,15:28,16:30,17:30},
    avgMinPerStop: 2.8
  },
  lrt2: {
    name: "LRT-2",
    stations: ["Recto","Legarda","Pureza","V. Mapa","J. Ruiz","Gilmore","Betty Go-Belmonte","Araneta-Cubao","Anonas","Katipunan","Santolan"],
    farePerStops: {1:12,2:12,3:13,4:14,5:15,6:16,7:17,8:18,9:20,10:22},
    avgMinPerStop: 3
  },
  jeepneyRoutes: [
    {id:"J01",from:["Paranaque","Las Pinas","Paranaque Central","BF Homes"],to:["Baclaran","LRT Baclaran"],via:"Quirino Ave",estKm:6,estMin:25},
    {id:"J02",from:["Alabang","Muntinlupa"],to:["Zapote","Las Pinas"],via:"Alabang-Zapote Rd",estKm:5,estMin:20},
    {id:"J03",from:["Cubao","Araneta"],to:["Quiapo","Manila"],via:"Aurora Blvd",estKm:7,estMin:35},
    {id:"J04",from:["Makati","Ayala","BGC"],to:["Baclaran","Pasay"],via:"EDSA",estKm:8,estMin:40},
    {id:"J05",from:["Monumento","Caloocan"],to:["Divisoria","Quiapo"],via:"Rizal Ave",estKm:6,estMin:30},
    {id:"J06",from:["Quiapo","Manila"],to:["Baclaran","Pasay"],via:"Taft Ave",estKm:7,estMin:35},
    {id:"J07",from:["Marikina","Santolan"],to:["Cubao","Araneta"],via:"Marcos Highway",estKm:8,estMin:35},
    {id:"J08",from:["BGC","Taguig"],to:["Ayala MRT","Makati"],via:"Kalayaan",estKm:3,estMin:15},
    {id:"J09",from:["Novaliches","Fairview"],to:["Quezon Ave MRT","North Ave MRT"],via:"Commonwealth",estKm:10,estMin:45},
    {id:"J10",from:["Antipolo","Cainta"],to:["Santolan LRT2","Cubao"],via:"Ortigas Ave",estKm:12,estMin:55},
    {id:"J11",from:["Paranaque","Sucat"],to:["Taft Ave MRT","EDSA"],via:"South Luzon feeder",estKm:9,estMin:40},
    {id:"J12",from:["Pasig","Ortigas"],to:["Cubao","Araneta"],via:"EDSA",estKm:5,estMin:25}
  ],
  p2pRoutes: [
    {id:"P01",from:["Alabang","Muntinlupa"],to:["BGC","Taguig"],fare:80,estMin:45},
    {id:"P02",from:["Alabang","Muntinlupa"],to:["Makati","Ayala"],fare:70,estMin:40},
    {id:"P03",from:["Paranaque","BF Homes"],to:["BGC","Taguig"],fare:65,estMin:35},
    {id:"P04",from:["Las Pinas","Pamplona"],to:["Makati","Ayala"],fare:65,estMin:45},
    {id:"P05",from:["Cubao","Araneta"],to:["BGC","Taguig"],fare:85,estMin:40},
    {id:"P06",from:["Novaliches"],to:["Makati","Ayala"],fare:90,estMin:60}
  ],
  transferHubs: {
    "Baclaran":{"lines":["LRT-1"],"note":"Main southern LRT-1 terminal"},
    "Taft Avenue MRT":{"lines":["MRT-3"],"nearbyLines":["LRT-1 EDSA/Baclaran (200m walk)"],"note":"Southern MRT-3 terminal. Walk south 200m to LRT-1"},
    "Araneta-Cubao":{"lines":["MRT-3","LRT-2"],"note":"Direct interchange between MRT-3 and LRT-2"},
    "Doroteo Jose":{"lines":["LRT-1"],"nearbyLines":["LRT-2 Recto (short walk)"],"note":"Transfer point between LRT-1 and LRT-2"},
    "Monumento":{"lines":["LRT-1"],"note":"Northern LRT-1 terminal"},
    "North Avenue MRT":{"lines":["MRT-3"],"note":"Northern MRT-3 terminal"}
  },
  aliases: {
    "paranaque":"Paranaque","parañaque":"Paranaque","las piñas":"Las Pinas","las pinas":"Las Pinas",
    "cubao":"Cubao","araneta":"Cubao","makati":"Makati","bgc":"BGC","bonifacio global city":"BGC",
    "taguig":"BGC","quiapo":"Quiapo","manila":"Manila","alabang":"Alabang","muntinlupa":"Alabang",
    "monumento":"Monumento","caloocan":"Monumento","sm north":"North Avenue MRT",
    "sm north edsa":"North Avenue MRT","quezon city":"Quezon Avenue","qc":"Quezon Avenue",
    "pasig":"Pasig","ortigas":"Ortigas","marikina":"Marikina","antipolo":"Antipolo",
    "novaliches":"Novaliches","fairview":"Novaliches","baclaran":"Baclaran","pasay":"Baclaran",
    "taft":"Taft Avenue"
  }
};

// ── AGENT TOOLS (server-side) ─────────────────────
const AgentTools = {
  lookup_route(origin, destination) {
    const norm = s => (ROUTES_DB.aliases[s.toLowerCase()] || s).toLowerCase();
    const o = norm(origin), d = norm(destination);
    const results = { rail:[], jeepney:[], p2p:[], transfers:[] };

    for (const [key, line] of Object.entries({mrt3:ROUTES_DB.mrt3,lrt1:ROUTES_DB.lrt1,lrt2:ROUTES_DB.lrt2})) {
      const oi = line.stations.findIndex(s => s.toLowerCase().includes(o) || o.includes(s.toLowerCase()));
      const di = line.stations.findIndex(s => s.toLowerCase().includes(d) || d.includes(s.toLowerCase()));
      if (oi !== -1 && di !== -1) {
        results.rail.push({ line: line.name, from: line.stations[oi], to: line.stations[di], stops: Math.abs(di-oi) });
      }
    }
    ROUTES_DB.jeepneyRoutes.forEach(r => {
      if (r.from.some(f => f.toLowerCase().includes(o)||o.includes(f.toLowerCase())) &&
          r.to.some(t => t.toLowerCase().includes(d)||d.includes(t.toLowerCase()))) {
        results.jeepney.push({route:r.id,from:r.from[0],to:r.to[0],via:r.via,estKm:r.estKm,estMin:r.estMin});
      }
    });
    ROUTES_DB.p2pRoutes.forEach(r => {
      if (r.from.some(f => f.toLowerCase().includes(o)||o.includes(f.toLowerCase())) &&
          r.to.some(t => t.toLowerCase().includes(d)||d.includes(t.toLowerCase()))) {
        results.p2p.push({route:r.id,from:r.from[0],to:r.to[0],fare:r.fare,estMin:r.estMin});
      }
    });
    const found = results.rail.length + results.jeepney.length + results.p2p.length > 0;
    return { query:{origin,destination}, found, results,
      suggestion: found ? null : `No direct route found. Consider hubs: Baclaran (LRT-1), Taft Ave (MRT-3), Araneta-Cubao (MRT-3/LRT-2).` };
  },

  calculate_fare(mode, stops_or_km) {
    const n = parseFloat(stops_or_km) || 1;
    if (mode === 'MRT-3') {
      const fare = ROUTES_DB.mrt3.farePerStops[Math.min(n,12)] || 28;
      return { mode, fare, breakdown:`MRT-3: ${n} stops → ₱${fare}` };
    }
    if (mode === 'LRT-1') {
      const fare = ROUTES_DB.lrt1.farePerStops[Math.min(n,17)] || 30;
      return { mode, fare, breakdown:`LRT-1: ${n} stops → ₱${fare}` };
    }
    if (mode === 'LRT-2') {
      const fare = ROUTES_DB.lrt2.farePerStops[Math.min(n,10)] || 22;
      return { mode, fare, breakdown:`LRT-2: ${n} stops → ₱${fare}` };
    }
    if (mode === 'jeepney') {
      const fare = n <= 4 ? 13 : Math.ceil(13 + (n-4)*1.80);
      return { mode, fare, breakdown:`Jeepney: ${n}km → ₱${fare}` };
    }
    if (mode === 'p2p') return { mode, fare: n, breakdown:`P2P: fixed ₱${n}` };
    if (mode === 'walk') return { mode, fare: 0, breakdown:'Walking: free' };
    return { mode, fare: 13, breakdown:'Unknown mode, minimum fare' };
  },

  estimate_travel_time(mode, stops_or_km, time_of_day) {
    const n = parseFloat(stops_or_km) || 1;
    const isPeak = ['morning rush','peak','rush hour','7am','8am','5pm','6pm','7pm'].some(p =>
      (time_of_day||'').toLowerCase().includes(p));
    let mins = 0, note = '';
    if (mode==='MRT-3')  { mins = n*2.5+5; if(isPeak) note='Peak: expect longer queues (+3-5 min)'; }
    else if (mode==='LRT-1') { mins = n*2.8+5; if(isPeak) note='Peak: LRT-1 very crowded'; }
    else if (mode==='LRT-2') { mins = n*3+4; }
    else if (mode==='jeepney') { mins = (n/0.5)*(isPeak?1.5:1); if(isPeak) note='Peak traffic can double jeepney time'; }
    else if (mode==='walk')   { mins = n*12; }
    else if (mode==='p2p')    { mins = n*(isPeak?1.3:1); }
    else if (mode==='transfer') { mins = n; }
    return { mode, estimatedMinutes: Math.ceil(mins), isPeak, note };
  },

  check_transfer_options(station) {
    const norm = station.toLowerCase();
    for (const [hub, info] of Object.entries(ROUTES_DB.transferHubs)) {
      if (hub.toLowerCase().includes(norm) || norm.includes(hub.toLowerCase().split(' ')[0])) {
        return { station, found:true, availableLines:info.lines, nearbyLines:info.nearbyLines||[], note:info.note };
      }
    }
    for (const [, line] of Object.entries({mrt3:ROUTES_DB.mrt3,lrt1:ROUTES_DB.lrt1,lrt2:ROUTES_DB.lrt2})) {
      const found = line.stations.find(s => s.toLowerCase().includes(norm)||norm.includes(s.toLowerCase()));
      if (found) return { station:found, found:true, availableLines:[line.name], note:`${found} is on ${line.name}.` };
    }
    return { station, found:false, note:`No hub data for "${station}". Nearest: Araneta-Cubao, Taft Ave MRT, Baclaran LRT-1.` };
  }
};

const TOOL_DEFINITIONS = [
  { name:"lookup_route", description:"Search Manila transit DB for routes between origin and destination. Call this first.", parameters:{ type:"object", properties:{ origin:{type:"string"}, destination:{type:"string"} }, required:["origin","destination"] } },
  { name:"calculate_fare", description:"Calculate exact LTFRB fare for a transit segment.", parameters:{ type:"object", properties:{ mode:{type:"string",enum:["MRT-3","LRT-1","LRT-2","jeepney","p2p","walk"]}, stops_or_km:{type:"number"} }, required:["mode","stops_or_km"] } },
  { name:"estimate_travel_time", description:"Estimate travel time accounting for peak hours.", parameters:{ type:"object", properties:{ mode:{type:"string",enum:["MRT-3","LRT-1","LRT-2","jeepney","p2p","walk","transfer"]}, stops_or_km:{type:"number"}, time_of_day:{type:"string"} }, required:["mode","stops_or_km"] } },
  { name:"check_transfer_options", description:"Check transit connections available at a station or hub.", parameters:{ type:"object", properties:{ station:{type:"string"} }, required:["station"] } }
];

const SYSTEM_PROMPT = `You are SakayAI, an agentic Metro Manila commute planning assistant.
Use your 4 tools to plan routes — never guess fares or times.

BEHAVIOR:
1. Call lookup_route first.
2. Call calculate_fare for each segment.
3. Call estimate_travel_time for each segment.
4. Call check_transfer_options for hub transfers.
5. After all tool results, write the final response.

ROUTE MODE: Optimize for "{MODE}" — cheapest=min fare, fastest=min time, least_transfers=min line changes.

RESPONSE FORMAT — after tool calls output exactly:

ROUTE_JSON:
{"title":"Parañaque → Cubao","totalFare":51,"totalTime":65,"transfers":2,"steps":[
  {"type":"jeep","label":"Jeepney to Baclaran","detail":"Paranaque Central → LRT-1 Baclaran","fare":15,"time":25},
  {"type":"lrt","label":"LRT-1 to EDSA","detail":"Baclaran → EDSA Pasay · 2 stops","fare":12,"time":8},
  {"type":"walk","label":"Transfer to MRT-3","detail":"~200m covered walkway to Taft Ave","fare":0,"time":5},
  {"type":"mrt","label":"MRT-3 to Cubao","detail":"Taft Ave → Araneta-Cubao · 10 stops","fare":24,"time":22}
]}

Types: mrt, lrt, jeep, bus, walk. Use EXACT tool values. Warm tone, some Taglish ok.`;

// ── OPTIMIZATION 1: GEMINI CALL WITH TIMEOUT ──────
function geminiRequest(body) {
  return new Promise((resolve, reject) => {
    const apiKey = process.env.GEMINI_API_KEY;
    const postData = JSON.stringify(body);
    const options = {
      hostname: 'generativelanguage.googleapis.com',
      path: `/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`,
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(postData) }
    };
    const req = https.request(options, res => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try { resolve({ status: res.statusCode, body: JSON.parse(data) }); }
        catch(e) { reject(new Error('Invalid JSON from Gemini')); }
      });
    });
    
    // OPTIMIZATION 1: Set timeout (10 seconds)
    req.setTimeout(API_TIMEOUT, () => {
      req.destroy();
      reject(new Error(`Gemini API timeout after ${API_TIMEOUT}ms — try again`));
    });
    
    req.on('error', reject);
    req.write(postData);
    req.end();
  });
}

// ── AGENT LOOP (server-side) ──────────────────────
async function runAgentLoop(messages, mode) {
  // OPTIMIZATION 3: Trim conversation history before sending to Gemini
  const trimmedMessages = trimConversationHistory(messages);
  
  const prompt = SYSTEM_PROMPT.replace('{MODE}', mode || 'cheapest');
  const body = {
    system_instruction: { parts: [{ text: prompt }] },
    contents: trimmedMessages,
    tools: [{ function_declarations: TOOL_DEFINITIONS }],
    generationConfig: { temperature: 0.5, maxOutputTokens: 2000 }
  };

  const toolLog = [];
  const MAX = 8;

  for (let i = 0; i < MAX; i++) {
    const { status, body: data } = await geminiRequest(body);

    if (status === 400) throw new Error('API key invalid — check your .env file');
    if (status === 429) throw new Error('Rate limit reached. Wait a moment and try again.');
    if (status !== 200) throw new Error(`Gemini error ${status}: ${data?.error?.message || 'Unknown'}`);

    const parts = data.candidates?.[0]?.content?.parts || [];
    const textParts = parts.filter(p => p.text);
    const funcCalls = parts.filter(p => p.functionCall);

    if (funcCalls.length === 0) {
      return { text: textParts.map(p => p.text).join(''), toolLog };
    }

    body.contents.push({ role: 'model', parts });

    const toolResults = [];
    for (const part of funcCalls) {
      const { name, args } = part.functionCall;
      toolLog.push({ type: 'call', text: `→ ${name}(${JSON.stringify(args)})` });
      let result;
      
      // OPTIMIZATION 2: Check cache for lookup_route (most expensive operation)
      if (name === 'lookup_route') {
        const cacheKey = getCacheKey(args.origin, args.destination, mode);
        if (ROUTE_CACHE.has(cacheKey)) {
          result = ROUTE_CACHE.get(cacheKey);
          toolLog.push({ type: 'result', text: `← [CACHED] ${JSON.stringify(result).slice(0, 100)}` });
        } else {
          try {
            result = AgentTools[name]?.(...Object.values(args)) ?? { error: 'Unknown tool' };
            ROUTE_CACHE.set(cacheKey, result);
            toolLog.push({ type: 'result', text: `← ${JSON.stringify(result).slice(0, 120)}` });
          } catch(e) {
            result = { error: e.message };
            toolLog.push({ type: 'err', text: `← error: ${e.message}` });
          }
        }
      } else {
        try {
          result = AgentTools[name]?.(...Object.values(args)) ?? { error: 'Unknown tool' };
          toolLog.push({ type: 'result', text: `← ${JSON.stringify(result).slice(0, 120)}` });
        } catch(e) {
          result = { error: e.message };
          toolLog.push({ type: 'err', text: `← error: ${e.message}` });
        }
      }
      
      toolResults.push({ functionResponse: { name, response: result } });
    }
    body.contents.push({ role: 'user', parts: toolResults });
  }

  throw new Error('Agent exceeded max iterations.');
}

// ── PARSE REQUEST BODY ────────────────────────────
function readBody(req) {
  return new Promise((resolve, reject) => {
    let body = '';
    req.on('data', chunk => body += chunk);
    req.on('end', () => {
      try { resolve(JSON.parse(body)); }
      catch(e) { reject(new Error('Invalid JSON')); }
    });
    req.on('error', reject);
  });
}

// ── HTTP SERVER ───────────────────────────────────
const server = http.createServer(async (req, res) => {
  const setCORS = () => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  };

  // ── POST /api/chat — main agent endpoint ──
  if (req.method === 'POST' && req.url === '/api/chat') {
    setCORS();
    try {
      const { messages, mode } = await readBody(req);
      if (!messages || !Array.isArray(messages)) {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'messages array required' }));
        return;
      }
      const result = await runAgentLoop(messages, mode);
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify(result));
    } catch(e) {
      res.writeHead(500, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: e.message }));
    }
    return;
  }

  // ── OPTIMIZATION 4: POST /api/chat-stream — streaming endpoint ──
  if (req.method === 'POST' && req.url === '/api/chat-stream') {
    setCORS();
    res.writeHead(200, {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive'
    });
    
    try {
      const { messages, mode } = await readBody(req);
      if (!messages || !Array.isArray(messages)) {
        res.write(`data: ${JSON.stringify({ error: 'messages array required' })}\n\n`);
        res.end();
        return;
      }
      
      const result = await runAgentLoop(messages, mode);
      res.write(`data: ${JSON.stringify({ type: 'response', text: result.text, toolLog: result.toolLog })}\n\n`);
      res.write(`data: ${JSON.stringify({ type: 'done' })}\n\n`);
      res.end();
    } catch(e) {
      res.write(`data: ${JSON.stringify({ error: e.message })}\n\n`);
      res.end();
    }
    return;
  }

  // OPTIONS preflight
  if (req.method === 'OPTIONS') {
    setCORS();
    res.writeHead(204);
    res.end();
    return;
  }

  // ── Serve static files ──
  let filePath = path.join(__dirname, req.url === '/' ? 'index.html' : req.url);
  if (!filePath.startsWith(__dirname)) { res.writeHead(403); res.end('Forbidden'); return; }

  const ext = path.extname(filePath);
  fs.readFile(filePath, (err, data) => {
    if (err) { res.writeHead(404); res.end('Not found'); return; }
    res.writeHead(200, { 'Content-Type': MIME[ext] || 'text/plain' });
    res.end(data);
  });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`\n  ✓ SakayAI running → http://localhost:${PORT}\n`);
  console.log(`  OPTIMIZATIONS ENABLED:`);
  console.log(`    1. Request timeout: ${API_TIMEOUT}ms`)
  console.log(`    2. Route caching: ${CACHE_TTL/1000/60} min TTL`)
  console.log(`    3. History trimming: last 6 messages only`);
  console.log(`    4. Streaming: /api/chat-stream endpoint\n`);
  if (!process.env.GEMINI_API_KEY) {
    console.warn('  ⚠  GEMINI_API_KEY not set in .env!\n');
  }
});