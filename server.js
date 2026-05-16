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
    "las pinas":"Las Pinas","las piñas":"Las Pinas","laspinas":"Las Pinas",
    "cubao":"Cubao","araneta":"Cubao","araneta cubao":"Cubao",
    "makati":"Makati","ayala":"Makati",
    "bgc":"BGC","bonifacio":"BGC","bonifacio global city":"BGC","taguig":"BGC","fort":"BGC",
    "quiapo":"Quiapo","manila":"Manila","divisoria":"Manila",
    "alabang":"Alabang","muntinlupa":"Alabang",
    "monumento":"Monumento","caloocan":"Monumento",
    "sm north":"SM North","sm north edsa":"SM North","north edsa":"SM North",
    "ortigas":"Ortigas","pasig":"Ortigas",
    "marikina":"Marikina","santolan":"Marikina",
    "antipolo":"Antipolo","cainta":"Antipolo",
    "novaliches":"Novaliches","fairview":"Novaliches","commonwealth":"Novaliches",
    "baclaran":"Baclaran","pasay":"Baclaran",
    "recto":"Quiapo",
    "qc":"Quezon City","quezon city":"Quezon City",
    "katipunan":"Katipunan","ateneo":"Katipunan","up":"Katipunan",
    "mandaluyong":"Mandaluyong","shaw":"Mandaluyong",
    "san juan":"San Juan","greenhills":"San Juan"
  },
  areas: {
    "Paranaque":   { hub:"Baclaran",        hubLine:"LRT-1", hubMin:25, hubKm:6,  hubMode:"jeepney" },
    "Las Pinas":   { hub:"Baclaran",        hubLine:"LRT-1", hubMin:30, hubKm:7,  hubMode:"jeepney" },
    "Alabang":     { hub:"Alabang",         hubLine:"P2P",   hubMin:0,  hubKm:0,  hubMode:"origin"  },
    "Makati":      { hub:"Ayala",           hubLine:"MRT-3", hubMin:10, hubKm:2,  hubMode:"jeepney" },
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
    "Baclaran":    { hub:"Baclaran",        hubLine:"LRT-1", hubMin:0,  hubKm:0,  hubMode:"origin"  }
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
    { from:"Alabang",   to:"BGC",    fare:80, min:45 },
    { from:"Alabang",   to:"Makati", fare:70, min:40 },
    { from:"Paranaque", to:"BGC",    fare:65, min:35 },
    { from:"Las Pinas", to:"Makati", fare:65, min:45 },
    { from:"Cubao",     to:"BGC",    fare:85, min:40 },
    { from:"Novaliches",to:"Makati", fare:90, min:60 }
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

  // P2P direct
  const p2pDirect = DB.p2p.find(r =>
    (r.from === origin || r.from === originArea?.hub) &&
    (r.to === destination || r.to === destArea?.hub)
  );
  if (p2pDirect) {
    paths.push({ id:'P2P', type:'direct_p2p',
      description:`P2P Bus ${origin} → ${destination}`,
      segments:[{ mode:'p2p', from:origin, to:destination, fare:p2pDirect.fare, min:p2pDirect.min }],
      transfers:0 });
  }

  if (!originArea || !destArea) return paths;

  const lines = [{ data:DB.mrt3 },{ data:DB.lrt1 },{ data:DB.lrt2 }];

  // Same line direct
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

  // LRT-1 → MRT-3
  if (originArea.hubLine==='LRT-1' && destArea.hubLine==='MRT-3') {
    const oi=stationIdx(DB.lrt1,originArea.hub), edsa=stationIdx(DB.lrt1,'EDSA');
    const taft=stationIdx(DB.mrt3,'Taft Avenue'), di=stationIdx(DB.mrt3,destArea.hub);
    if (oi!==-1&&edsa!==-1&&taft!==-1&&di!==-1) {
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

  // MRT-3 → LRT-1
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

  // MRT-3 → LRT-2
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

  // LRT-2 → MRT-3
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
      label=`P2P Bus: ${s.from} → ${s.to}`;
      detail=`Air-conditioned · fixed fare${isPeak?' · traffic':''}`;
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
  const m = message.match(/(?:from\s+)?(.+?)\s+to\s+(.+?)(?:\s*[,.]|$|\s+budget|\s+[₱p]\d|\s+need|\s+by\s+\d)/i);
  if (m) {
    origin      = m[1].replace(/^(from|sa)\s+/i,'').trim();
    destination = m[2].trim();
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
    steps: rec.segments.map(s => ({
      type: s.mode==='MRT-3'?'mrt':s.mode==='LRT-1'||s.mode==='LRT-2'?'lrt':s.mode==='p2p'?'bus':s.mode,
      label: s.label,
      detail: s.detail
    }))
  };
}

// ── GEMINI CALL ───────────────────────────────────
function callGemini(systemPrompt, userMessage, history) {
  return new Promise((resolve, reject) => {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) { reject(new Error('GEMINI_API_KEY not set in .env')); return; }

    const contents = [
      ...history.slice(-6),
      { role:'user', parts:[{ text:userMessage }] }
    ];
    const body = JSON.stringify({
      system_instruction: { parts:[{ text:systemPrompt }] },
      contents,
      generationConfig: { temperature:0.3, maxOutputTokens:300 }
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
          if (!data) { reject(new Error('Empty response from Gemini')); return; }
          const parsed = JSON.parse(data);
          if (res.statusCode===429) { reject(new Error('Rate limit reached. Wait a moment.')); return; }
          if (res.statusCode===400) { reject(new Error('API key invalid — check .env file.')); return; }
          if (res.statusCode!==200) { reject(new Error(`Gemini error ${res.statusCode}: ${parsed.error?.message||''}`)); return; }
          const text = parsed.candidates?.[0]?.content?.parts?.[0]?.text||'';
          if (!text) { reject(new Error('No text in Gemini response')); return; }
          resolve(text);
        } catch(e) { reject(new Error('Failed to parse Gemini response: '+e.message)); }
      });
    });
    req.setTimeout(25000, () => { req.destroy(); reject(new Error('Request timed out after 25s')); });
    req.on('error', e => reject(new Error('Network error: '+e.message)));
    req.write(body); req.end();
  });
}

// ── SYSTEM PROMPT ─────────────────────────────────
// Gemini's ONLY job: write a 1-2 sentence intro.
// The route card JSON is built server-side — not by Gemini.
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

      // STAGE 1
      const parsed = parseUserInput(message);
      log('parse', parsed);

      // No route detected — pure conversation
      if (!parsed.origin || !parsed.destination) {
        const reply = await callGemini(
          `You are SakayAI, a friendly Metro Manila commute assistant. Answer conversationally. If the user seems to want a route, ask them for their origin and destination.`,
          message, history
        ).catch(e => `Hi! Sabihin mo lang kung saan ka pupunta at saan ka galing — I'll plan your route!`);
        sendJson(res, 200, { type:'chat', text:reply, pipelineLog });
        return;
      }

      // STAGE 1 continued
      const resolved = resolveLocations(parsed.origin, parsed.destination);
      log('resolve', { origin:resolved.origin, destination:resolved.destination });

      // STAGE 2
      const paths = listPaths(resolved);
      log('paths', paths.map(p=>p.description));

      if (paths.length===0) {
        const reply = await callGemini(
          `You are SakayAI. Tell the user you couldn't find a route between the two places in your database. Be apologetic and suggest they try specifying nearby hubs like Baclaran, Cubao, Makati, or SM North.`,
          `No route found: ${resolved.origin} → ${resolved.destination}`, history
        ).catch(() => `Sorry, wala pa akong route data between ${resolved.origin} and ${resolved.destination}. Try specifying a nearby hub like Baclaran, Cubao, or Makati!`);
        sendJson(res, 200, { type:'chat', text:reply, pipelineLog });
        return;
      }

      // STAGE 3
      const readPaths = paths.map(p => readPath(p, parsed.isPeak));
      log('fares', readPaths.map(p=>({ id:p.id, fare:p.totalFare, min:p.totalMin })));

      // STAGE 4
      const context = getContext(readPaths, parsed.budget, mode);
      log('ranked', { recommended:context.recommended?.id, budgetWarning:context.budgetWarning });

      // Build route JSON server-side — no Gemini involved
      const routeJson = buildRouteJson(context, resolved.origin, resolved.destination);
      log('route_json', routeJson);

      // Gemini writes ONLY the intro sentence
      const introContext = `Route: ${resolved.origin} to ${resolved.destination}. Transfers: ${context.recommended.transfers}. ${context.budgetWarning||''}`;

      const intro = await callGemini(NARRATION_PROMPT, introContext, history)
        .catch(() => `Here's your route from ${resolved.origin} to ${resolved.destination}!`);

      // Combine: intro text + server-built JSON
      const responseText = `${intro.trim()}\n\nROUTE_JSON:\n${JSON.stringify(routeJson)}`;

      sendJson(res, 200, { type:'route', text:responseText, pipelineLog });

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