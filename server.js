const http = require('http');
const https = require('https');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

const MIME = {
  '.html': 'text/html', '.js': 'application/javascript',
  '.css': 'text/css', '.json': 'application/json', '.ico': 'image/x-icon',
  '.png': 'image/png', '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.webp': 'image/webp'
};

function loadReferenceKnowledge() {
  const knowledgePath = path.join(__dirname, 'data', 'commute-knowledge.json');
  try {
    return JSON.parse(fs.readFileSync(knowledgePath, 'utf8'));
  } catch (error) {
    console.warn(`Reference knowledge unavailable: ${error.message}`);
    return [];
  }
}

const REFERENCE_KNOWLEDGE = loadReferenceKnowledge();

const DB = {
  aliases: {
    "paranaque":"Paranaque","parañaque":"Paranaque","para":"Paranaque",
    "sucat":"Paranaque","bf homes":"Paranaque","sm bf":"Paranaque","sm bf homes":"Paranaque","bf paranaque":"Paranaque","betterliving":"Paranaque",
    "las pinas":"Las Pinas","las piñas":"Las Pinas","laspinas":"Las Pinas",
    "alabang":"Alabang","alabang town center":"Alabang","atc":"Alabang","starmall":"Alabang","muntinlupa":"Alabang","vtx":"Alabang",
    "bicutan":"Bicutan","sm bicutan":"Bicutan","sm bicutan terminal":"Bicutan","ftf":"Bicutan",
    "arca south":"Arca South","arca south taguig":"Arca South","arca":"Arca South","fti":"FTI","fti terminal":"FTI",
    "kayamanan c":"Kayamanan C","maharlika":"Maharlika","signal":"Signal","signal village":"Signal","triumph":"Triumph","tenement":"Tenement",
    "arca south shuttle loop":"Arca South Shuttle Loop","shuttle loop":"Arca South Shuttle Loop",
    "moa":"MOA","mall of asia":"MOA","sm moa":"MOA","sm mall of asia":"MOA",
    "pasay":"Pasay","pasay rotonda":"Pasay","rotonda":"Pasay","taft avenue station":"Pasay","mrt 3 taft avenue station":"Pasay","baclaran":"Baclaran","pitx":"PITX",
    "cavite":"Cavite","bacoor":"Bacoor","bacoor cavite":"Bacoor","sm bacoor":"Bacoor","somo vista mall":"Bacoor","somo":"Bacoor","vista mall bacoor":"Bacoor",
    "dasma":"Dasmarinas","dasmarinas":"Dasmarinas","dasmariñas":"Dasmarinas","dasmarias":"Dasmarinas","dasmarinas cavite":"Dasmarinas","robinsons dasmarinas":"Dasmarinas","robinsons dasma":"Dasmarinas",
    "imus":"Imus","imus cavite":"Imus","lancaster new city":"Imus","lancaster":"Imus","lnc":"Imus","molino":"Molino","sm molino":"Molino","molino cavite":"Molino",
    "tagaytay":"Tagaytay","tagaytay cavite":"Tagaytay","trece":"Trece Martires","trece martires":"Trece Martires","trece marites":"Trece Martires",
    "naia":"NAIA","airport":"NAIA","naia 1":"NAIA","naia 2":"NAIA","naia 3":"NAIA","naia 4":"NAIA",
    "terminal 1":"NAIA","terminal 2":"NAIA","terminal 3":"NAIA",
    "makati":"Makati","ayala":"Makati","ayala center":"Makati","sm makati":"Makati","comembo":"Makati","pembo":"Makati","glorietta":"Makati","greenbelt":"Makati",
    "one ayala":"Makati","one ayala terminal":"Makati","buendia":"Buendia","gil puyat":"Buendia",
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
    "fairview":"Novaliches","sm fairview":"Novaliches","lagro":"Novaliches","novaliches":"Novaliches","commonwealth":"Novaliches",
    "qc":"Quezon City","quezon city":"Quezon City","quezon ave":"Quezon City",
    "cubao":"Cubao","araneta":"Cubao","araneta cubao":"Cubao","farmers":"Cubao","gateway":"Cubao",
    "marikina":"Marikina","sto nino marikina":"Marikina","marikina heights":"Marikina","santolan":"Marikina",
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
    "Cavite":      { hub:"Cavite",          hubLine:"P2P",   hubMin:0,  hubKm:0,  hubMode:"origin"  },
    "Bacoor":      { hub:"Bacoor",          hubLine:"P2P",   hubMin:0,  hubKm:0,  hubMode:"origin"  },
    "Dasmarinas":  { hub:"Dasmarinas",      hubLine:"P2P",   hubMin:0,  hubKm:0,  hubMode:"origin"  },
    "Imus":        { hub:"Imus",            hubLine:"P2P",   hubMin:0,  hubKm:0,  hubMode:"origin"  },
    "Molino":      { hub:"Molino",          hubLine:"P2P",   hubMin:0,  hubKm:0,  hubMode:"origin"  },
    "Tagaytay":    { hub:"Tagaytay",        hubLine:"P2P",   hubMin:0,  hubKm:0,  hubMode:"origin"  },
    "Trece Martires": { hub:"Trece Martires", hubLine:"P2P", hubMin:0, hubKm:0, hubMode:"origin" },
    "NAIA":        { hub:"NAIA",            hubLine:"P2P",   hubMin:0,  hubKm:0,  hubMode:"origin"  },
    "Arca South":  { hub:"Arca South",      hubLine:"P2P",   hubMin:0,  hubKm:0,  hubMode:"origin"  },
    "FTI":         { hub:"FTI",             hubLine:"P2P",   hubMin:0,  hubKm:0,  hubMode:"origin"  },
    "Kayamanan C": { hub:"Kayamanan C",     hubLine:"P2P",   hubMin:0,  hubKm:0,  hubMode:"origin"  },
    "Maharlika":   { hub:"Maharlika",       hubLine:"P2P",   hubMin:0,  hubKm:0,  hubMode:"origin"  },
    "Signal":      { hub:"Signal",          hubLine:"P2P",   hubMin:0,  hubKm:0,  hubMode:"origin"  },
    "Triumph":     { hub:"Triumph",         hubLine:"P2P",   hubMin:0,  hubKm:0,  hubMode:"origin"  },
    "Tenement":    { hub:"Tenement",        hubLine:"P2P",   hubMin:0,  hubKm:0,  hubMode:"origin"  },
    "Arca South Shuttle Loop": { hub:"Arca South Shuttle Loop", hubLine:"P2P", hubMin:0, hubKm:0, hubMode:"origin" },
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
  carousel: {
    southbound: {
      direction:"Southbound",
      stops:[
        { name:"Monumento", city:"Caloocan", aliases:["monumento"], connection:"LRT-1 Monumento" },
        { name:"Bagong Barrio", city:"Caloocan", aliases:["bagong barrio"] },
        { name:"Balintawak", city:"Quezon City", aliases:["balintawak"], connection:"LRT-1 Balintawak" },
        { name:"Kaingin", city:"Quezon City", aliases:["kaingin"] },
        { name:"Roosevelt / FPJ Station", city:"Quezon City", aliases:["roosevelt","fpj","fpj station","roosevelt station"], connection:"LRT-1 FPJ Station" },
        { name:"SM North EDSA", city:"Quezon City", aliases:["sm north","sm north edsa","north edsa"] },
        { name:"North Avenue", city:"Quezon City", aliases:["north ave","north avenue"], connection:"MRT-3 North Avenue" },
        { name:"Philam Q.C.", city:"Quezon City", aliases:["philam","philam qc","philam q c"] },
        { name:"Quezon Avenue", city:"Quezon City", aliases:["quezon ave","quezon avenue"], connection:"MRT-3 Quezon Avenue" },
        { name:"Kamuning", city:"Quezon City", aliases:["kamuning","gma kamuning"], connection:"MRT-3 GMA-Kamuning" },
        { name:"Nepa Q. Mart", city:"Quezon City", aliases:["nepa q mart","nepa qmart","nepa"], connection:"MRT-3 Araneta-Cubao" },
        { name:"Main Avenue", city:"Quezon City", aliases:["main ave","main avenue"] },
        { name:"Santolan", city:"Mandaluyong", aliases:["santolan","santolan annapolis"], connection:"MRT-3 Santolan-Annapolis" },
        { name:"Ortigas", city:"Mandaluyong", aliases:["ortigas"], connection:"MRT-3 Ortigas" },
        { name:"Guadalupe", city:"Makati", aliases:["guadalupe"], connection:"MRT-3 Guadalupe" },
        { name:"Buendia", city:"Makati", aliases:["buendia"], connection:"MRT-3 Buendia" },
        { name:"Ayala", city:"Makati", aliases:["ayala"], connection:"MRT-3 Ayala / One Ayala" },
        { name:"Tramo", city:"Pasay", aliases:["tramo"] },
        { name:"Taft Avenue", city:"Pasay", aliases:["taft","taft avenue","edsa taft"], connection:"MRT-3 Taft Avenue and LRT-1 EDSA" },
        { name:"Roxas Boulevard", city:"Pasay", aliases:["roxas boulevard","roxas blvd"] },
        { name:"SM Mall of Asia / MOA", city:"Pasay", aliases:["moa","sm moa","mall of asia","sm mall of asia"] },
        { name:"BVA", city:"Pasay", aliases:["bva"] },
        { name:"Macapagal / Aseana", city:"Paranaque", aliases:["macapagal","aseana","macapagal aseana"] },
        { name:"PITX", city:"Paranaque", aliases:["pitx"] }
      ]
    },
    northbound: {
      direction:"Northbound",
      stops:[
        { name:"PITX", city:"Paranaque", aliases:["pitx"] },
        { name:"City of Dreams", city:"Paranaque", aliases:["city of dreams","cod"] },
        { name:"DFA", city:"Paranaque", aliases:["dfa"] },
        { name:"SM Mall of Asia / MOA", city:"Pasay", aliases:["moa","sm moa","mall of asia","sm mall of asia"] },
        { name:"Roxas Boulevard", city:"Pasay", aliases:["roxas boulevard","roxas blvd"] },
        { name:"Taft Avenue", city:"Pasay", aliases:["taft","taft avenue","edsa taft"], connection:"MRT-3 Taft Avenue and LRT-1 EDSA" },
        { name:"Ayala", city:"Makati", aliases:["ayala"], connection:"MRT-3 Ayala" },
        { name:"Buendia", city:"Makati", aliases:["buendia"], connection:"MRT-3 Buendia" },
        { name:"Guadalupe", city:"Makati", aliases:["guadalupe"], connection:"MRT-3 Guadalupe" },
        { name:"Ortigas", city:"Mandaluyong", aliases:["ortigas"], connection:"MRT-3 Ortigas" },
        { name:"Santolan", city:"Mandaluyong", aliases:["santolan","santolan annapolis"], connection:"MRT-3 Santolan-Annapolis" },
        { name:"Main Avenue", city:"Quezon City", aliases:["main ave","main avenue"] },
        { name:"Nepa Q. Mart", city:"Quezon City", aliases:["nepa q mart","nepa qmart","nepa"], connection:"MRT-3 Araneta-Cubao" },
        { name:"Kamuning", city:"Quezon City", aliases:["kamuning","gma kamuning"], connection:"MRT-3 GMA-Kamuning" },
        { name:"Quezon Avenue", city:"Quezon City", aliases:["quezon ave","quezon avenue"], connection:"MRT-3 Quezon Avenue" },
        { name:"Philam Q.C.", city:"Quezon City", aliases:["philam","philam qc","philam q c"] },
        { name:"North Avenue", city:"Quezon City", aliases:["north ave","north avenue"], connection:"MRT-3 North Avenue" },
        { name:"SM North EDSA", city:"Quezon City", aliases:["sm north","sm north edsa","north edsa"] },
        { name:"Roosevelt / FPJ Station", city:"Quezon City", aliases:["roosevelt","fpj","fpj station","roosevelt station"], connection:"LRT-1 FPJ Station" },
        { name:"Kaingin", city:"Quezon City", aliases:["kaingin"] },
        { name:"Balintawak", city:"Quezon City", aliases:["balintawak"], connection:"LRT-1 Balintawak" },
        { name:"Bagong Barrio", city:"Caloocan", aliases:["bagong barrio"] },
        { name:"Monumento", city:"Caloocan", aliases:["monumento"], connection:"LRT-1 Monumento" }
      ]
    }
  },

  // UV Express terminal pairs retained from the route references supplied for
  // this project. Fare values are intentionally not stored because the
  // available published values are outdated and should not guide current trips.
  uvExpress: [
    { from:"Paranaque",   to:"Makati",     service:"BF Paranaque - Ayala Center" },
    { from:"Paranaque",   to:"Manila",     service:"Sucat (Paranaque) - Lawton (Park N Ride)" },
    { from:"Las Pinas",   to:"Quiapo",     service:"SM South Mall - Quiapo" },
    { from:"Makati",      to:"Ortigas",    service:"Comembo - SM Megamall" },
    { from:"Marikina",    to:"Cubao",      service:"Brgy. Fortune (Marikina City) - Cubao" },
    { from:"Marikina",    to:"Makati",     service:"Sto. Nino (Marikina) - Ayala" },
    { from:"Marikina",    to:"Ortigas",    service:"Sto. Nino (Marikina) - Ortigas Center" },
    { from:"Novaliches",  to:"Quiapo",     service:"Lagro - Quiapo via Sauyo" },
    { from:"Novaliches",  to:"Cubao",      service:"Novaliches - Cubao Farmers Market" },
    { from:"Novaliches",  to:"Monumento",  service:"Novaliches - Monumento" },
    { from:"Novaliches",  to:"Buendia",    service:"Robinson's Place Novaliches - Buendia" },
    { from:"BGC",         to:"Ortigas",    service:"Market Market - Pasig via San Joaquin" },
    { from:"SM North",    to:"Novaliches", service:"SM North EDSA - SM Fairview" },
    { from:"SM North",    to:"Manila",     service:"SM North C.I.T. - T.M. Kalaw" },
    { from:"Cubao",       to:"Buendia",    service:"Cubao - Buendia" },
    { from:"Bicutan",     to:"Makati",     service:"SM Bicutan Terminal - SM Makati" },
    { from:"Antipolo",    to:"Cubao",      service:"Cogeo - Cubao via Marcos Highway" },
    { from:"Antipolo",    to:"Ortigas",    service:"Antipolo - SM Megamall" },
    { from:"Antipolo",    to:"Makati",     service:"Antipolo - Ayala" }
  ],

  // Cavite route guidance supplied for the project and supported by:
  // https://ph.commutetour.com/ph/terminal/edsa-taft-pasay-rotonda/
  // No fares, schedules, or durations are stored; riders should confirm onsite.
  caviteRoutes: [
    ...["Cavite", "Bacoor", "Imus", "Dasmarinas", "Molino", "Tagaytay", "Trece Martires"].flatMap(destination => [
      {
        from:"Bicutan", to:destination, id:`SM_BICUTAN_PITX_${destination.toUpperCase().replace(/\s+/g, '_')}`,
        segments:[
          {
            mode:"guided_jeep",
            label:"Jeepney: SM Bicutan Terminal to Pasay Rotonda",
            detail:"Go to the terminal at SM Bicutan and ride a jeepney bound for Pasay. Alight at Pasay Rotonda. / Pumunta sa terminal ng SM Bicutan at sumakay ng jeepney na papuntang Pasay. Bumaba sa Pasay Rotonda."
          },
          {
            mode:"guided_bus",
            label:"EDSA Carousel: Pasay Rotonda to PITX",
            detail:"From Pasay Rotonda, proceed to the EDSA Carousel bus stop and ride southbound to PITX. / Mula Pasay Rotonda, pumunta sa sakayan ng EDSA Carousel at sumakay ng southbound bus papuntang PITX."
          },
          {
            mode:"guided_bus",
            label:`Bus: PITX to ${destination === "Cavite" ? "your Cavite destination" : `${destination}, Cavite`}`,
            detail:`At PITX, find a bus serving ${destination === "Cavite" ? "your destination in Cavite" : `${destination}, Cavite`}. Confirm the bay, signboard, and current fare before boarding. / Sa PITX, hanapin ang bus na bumibiyahe papuntang ${destination === "Cavite" ? "iyong destinasyon sa Cavite" : `${destination}, Cavite`}. Kumpirmahin ang bay, karatula, at kasalukuyang pamasahe bago sumakay.`
          }
        ]
      },
      {
        from:"Bicutan", to:destination, id:`SM_BICUTAN_PASAY_TERMINAL_${destination.toUpperCase().replace(/\s+/g, '_')}`,
        segments:[
          {
            mode:"guided_jeep",
            label:"Jeepney: SM Bicutan Terminal to Pasay Rotonda",
            detail:"Go to the terminal at SM Bicutan and ride a jeepney bound for Pasay. Alight at Pasay Rotonda. / Pumunta sa terminal ng SM Bicutan at sumakay ng jeepney na papuntang Pasay. Bumaba sa Pasay Rotonda."
          },
          {
            mode: destination === "Molino" || destination === "Cavite" ? "guided_terminal" : "guided_bus",
            label: destination === "Molino"
              ? "Pasay terminal: Van to SM Molino / Paliparan, Cavite"
              : `Pasay terminal: ${destination === "Cavite" ? "Service" : "Bus"} to ${destination === "Cavite" ? "Cavite" : `${destination}, Cavite`}`,
            detail: destination === "Molino"
              ? "At Pasay Rotonda, find the van route serving SM Molino / Paliparan. Confirm the loading point and current fare before boarding. / Sa Pasay Rotonda, hanapin ang van route na bumibiyahe papuntang SM Molino / Paliparan. Kumpirmahin ang sakayan at kasalukuyang pamasahe bago sumakay."
              : `At Pasay Rotonda, find the terminal service serving ${destination === "Cavite" ? "your Cavite destination, such as Bacoor, Imus, Dasmarinas, Molino, Tagaytay, or Trece Martires" : `${destination}, Cavite`}. Confirm the route and current fare before boarding. / Sa Pasay Rotonda, hanapin ang terminal service na bumibiyahe papuntang ${destination === "Cavite" ? "iyong destinasyon sa Cavite, gaya ng Bacoor, Imus, Dasmarinas, Molino, Tagaytay, o Trece Martires" : `${destination}, Cavite`}. Kumpirmahin ang ruta at kasalukuyang pamasahe bago sumakay.`
          }
        ]
      }
    ]),
    {
      from:"Pasay", to:"Cavite", id:"PASAY_ROTONDA_CAVITE_TERMINAL",
      segments:[{
        mode:"guided_terminal",
        label:"Pasay terminal: Cavite destinations",
        detail:"At the terminal near MRT-3 Taft Avenue Station in Pasay Rotonda, find the service for your Cavite destination, including SM Bacoor, Imus, Dasmarinas, SM Molino / Paliparan, Tagaytay, or Trece Martires. Confirm the vehicle type, loading point, and current fare before boarding. / Sa terminal malapit sa MRT-3 Taft Avenue Station sa Pasay Rotonda, hanapin ang biyaheng papunta sa iyong destinasyon sa Cavite, kabilang ang SM Bacoor, Imus, Dasmarinas, SM Molino / Paliparan, Tagaytay, o Trece Martires. Kumpirmahin ang uri ng sasakyan, sakayan, at kasalukuyang pamasahe bago sumakay."
      }]
    },
    {
      from:"Pasay", to:"Bacoor", id:"PASAY_ROTONDA_BACOOR_BUS",
      segments:[{
        mode:"guided_bus",
        label:"Bus: Pasay Rotonda / Taft Avenue Station to Bacoor, Cavite",
        detail:"Board at the bus terminal near MRT-3 Taft Avenue Station in Pasay Rotonda and find a bus serving SM Bacoor. Confirm the signboard and current fare before boarding. / Pumunta sa terminal malapit sa MRT-3 Taft Avenue Station sa Pasay Rotonda at hanapin ang bus na bumibiyahe papuntang SM Bacoor. Kumpirmahin ang karatula at kasalukuyang pamasahe bago sumakay."
      }]
    },
    {
      from:"Pasay", to:"Bacoor", id:"PASAY_MOA_BACOOR_UV",
      segments:[
        {
          mode:"guided_jeep",
          label:"Jeepney: Pasay Rotonda / Taft Avenue Station to MOA",
          detail:"From Pasay Rotonda or Taft Avenue Station, ride a jeepney bound for MOA. / Mula Pasay Rotonda o Taft Avenue Station, sumakay ng jeepney na papuntang MOA."
        },
        {
          mode:"guided_uv",
          label:"UV Express: MOA to Bacoor, Cavite",
          detail:"At MOA, look for a UV Express with signboards such as Molino Blvd, SM Bacoor, or Soldiers. Fare not stored; verify current fare before riding. / Sa MOA, hanapin ang UV Express na may karatulang Molino Blvd, SM Bacoor, o Soldiers. Hindi naka-save ang pamasahe; kumpirmahin muna ang kasalukuyang pamasahe bago sumakay."
        }
      ]
    },
    {
      from:"Pasay", to:"Bacoor", id:"PASAY_MOA_PITX_BACOOR_BUS",
      segments:[
        {
          mode:"guided_jeep",
          label:"Jeepney: Pasay Rotonda / Taft Avenue Station to MOA",
          detail:"From Pasay Rotonda or Taft Avenue Station, ride a jeepney bound for MOA. / Mula Pasay Rotonda o Taft Avenue Station, sumakay ng jeepney na papuntang MOA."
        },
        {
          mode:"guided_bus",
          label:"EDSA Carousel: MOA to PITX",
          detail:"From MOA, ride the EDSA Carousel southbound to PITX. / Mula MOA, sumakay ng southbound EDSA Carousel papuntang PITX."
        },
        {
          mode:"guided_bus",
          label:"Bus: PITX to Bacoor, Cavite",
          detail:"At PITX, transfer to a bus going to Bacoor. Confirm the bay and destination signboard before boarding. / Sa PITX, lumipat sa bus na papuntang Bacoor. Kumpirmahin ang bay at karatula ng destinasyon bago sumakay."
        }
      ]
    },
    {
      from:"MOA", to:"Bacoor", id:"MOA_BACOOR_UV",
      segments:[{
        mode:"guided_uv",
        label:"UV Express: MOA to Bacoor, Cavite",
        detail:"At MOA, look for a UV Express with signboards such as Molino Blvd, SM Bacoor, or Soldiers. Fare not stored; verify current fare before riding. / Sa MOA, hanapin ang UV Express na may karatulang Molino Blvd, SM Bacoor, o Soldiers. Hindi naka-save ang pamasahe; kumpirmahin muna ang kasalukuyang pamasahe bago sumakay."
      }]
    },
    {
      from:"MOA", to:"Bacoor", id:"MOA_PITX_BACOOR_BUS",
      segments:[
        {
          mode:"guided_bus",
          label:"EDSA Carousel: MOA to PITX",
          detail:"From MOA, ride the EDSA Carousel southbound to PITX. / Mula MOA, sumakay ng southbound EDSA Carousel papuntang PITX."
        },
        {
          mode:"guided_bus",
          label:"Bus: PITX to Bacoor, Cavite",
          detail:"At PITX, transfer to a bus going to Bacoor. Confirm the bay and destination signboard before boarding. / Sa PITX, lumipat sa bus na papuntang Bacoor. Kumpirmahin ang bay at karatula ng destinasyon bago sumakay."
        }
      ]
    },
    {
      from:"Pasay", to:"Dasmarinas", id:"PASAY_ROTONDA_DASMARINAS_BUS",
      segments:[{
        mode:"guided_bus",
        label:"Bus: Pasay Rotonda / Taft Avenue Station to Dasmarinas, Cavite",
        detail:"Board at the bus terminal near MRT-3 Taft Avenue Station in Pasay Rotonda and find a bus serving Dasmarinas. Confirm the signboard and current fare before boarding. / Pumunta sa terminal malapit sa MRT-3 Taft Avenue Station sa Pasay Rotonda at hanapin ang bus na bumibiyahe papuntang Dasmarinas. Kumpirmahin ang karatula at kasalukuyang pamasahe bago sumakay."
      }]
    },
    ...[
      { to:"Imus", label:"Imus, Cavite", vehicle:"Bus" },
      { to:"Molino", label:"SM Molino / Paliparan, Cavite", vehicle:"Van" },
      { to:"Tagaytay", label:"Tagaytay, Cavite", vehicle:"Bus" },
      { to:"Trece Martires", label:"Trece Martires, Cavite", vehicle:"Bus" }
    ].map(route => ({
      from:"Pasay", to:route.to, id:`PASAY_ROTONDA_${route.to.toUpperCase().replace(/\s+/g, '_')}_TERMINAL`,
      segments:[{
        mode: route.vehicle === "Van" ? "guided_terminal" : "guided_bus",
        label:`${route.vehicle}: Pasay Rotonda / Taft Avenue Station to ${route.label}`,
        detail:`Board at the terminal near MRT-3 Taft Avenue Station in Pasay Rotonda and find the ${route.vehicle.toLowerCase()} service for ${route.label}. Confirm the loading point, signboard, and current fare before boarding. / Pumunta sa terminal malapit sa MRT-3 Taft Avenue Station sa Pasay Rotonda at hanapin ang ${route.vehicle.toLowerCase()} na bumibiyahe papuntang ${route.label}. Kumpirmahin ang sakayan, karatula, at kasalukuyang pamasahe bago sumakay.`
      }]
    }))
  ],

  // Arca South and FTI terminal guidance supplied for this project update.
  // Vehicle type is kept generic when the supplied terminal list does not say
  // which of the jeep, shuttle, or tricycle services operates that line.
  terminalRoutes: [
    { from:"Arca South", to:"Alabang", mode:"guided_terminal", service:"Arca South - Alabang" },
    { from:"Arca South", to:"Pasay", mode:"guided_terminal", service:"Arca South - Pasay Rotonda / MOA" },
    { from:"Arca South", to:"MOA", mode:"guided_terminal", service:"Arca South - Pasay Rotonda / MOA" },
    { from:"Arca South", to:"Guadalupe", mode:"guided_terminal", service:"Arca South - Guadalupe via C5" },
    { from:"Arca South", to:"Kayamanan C", mode:"guided_terminal", service:"Arca South - Kayamanan C via Pasong Tamo" },
    { from:"Arca South", to:"Quiapo", mode:"guided_terminal", service:"Arca South - Quiapo" },
    { from:"Arca South", to:"Makati", mode:"guided_terminal", service:"Arca South - Ayala Makati" },
    { from:"Arca South", to:"BGC", mode:"guided_terminal", service:"Arca South - BGC" },
    { from:"Arca South", to:"Novaliches", mode:"guided_terminal", service:"Arca South - Fairview" },
    {
      from:"Arca South", to:"Arca South Shuttle Loop", mode:"guided_shuttle",
      service:"Arca South Shuttle Loop",
      detail:"Use the Arca South Shuttle Loop service and confirm the current loop stops before boarding. / Gamitin ang Arca South Shuttle Loop at kumpirmahin ang kasalukuyang mga hintuan bago sumakay."
    },
    {
      from:"Arca South", to:"Maharlika", mode:"guided_tricycle",
      service:"Arca South Tricycle - Maharlika"
    },
    {
      from:"Arca South", to:"Signal", mode:"guided_tricycle",
      service:"Arca South Tricycle - Signal"
    },
    {
      from:"Arca South", to:"Triumph", mode:"guided_tricycle",
      service:"Arca South Tricycle - Triumph"
    },
    {
      from:"Arca South", to:"Tenement", mode:"guided_tricycle",
      service:"Arca South Tricycle - Tenement"
    },
    {
      from:"Manila", to:"FTI", id:"MANILA_GIL_PUYAT_FTI",
      segments:[
        {
          mode:"guided_lrt",
          label:"LRT-1: Manila area to Gil Puyat Station",
          detail:"Take LRT-1 and alight at Gil Puyat Station. / Sumakay ng LRT-1 at bumaba sa Gil Puyat Station."
        },
        {
          mode:"guided_bus",
          label:"Bus: Gil Puyat Station to FTI",
          detail:"From Gil Puyat Station, look for a bus going to FTI and confirm the signboard before boarding. / Mula Gil Puyat Station, hanapin ang bus na papuntang FTI at kumpirmahin ang karatula bago sumakay."
        }
      ]
    },
    {
      from:"Guadalupe", to:"FTI", mode:"guided_terminal",
      service:"Guadalupe Terminal - FTI",
      detail:"Alight at MRT-3 Guadalupe Station, proceed to the nearby terminal, then look for an e-jeep or jeep going to FTI. Confirm the signboard before boarding. / Bumaba sa MRT-3 Guadalupe Station, pumunta sa kalapit na terminal, at hanapin ang e-jeep o jeep na papuntang FTI. Kumpirmahin ang karatula bago sumakay."
    }
  ],

  // One Ayala Terminal routes transcribed from the Sakay.ph terminal guide
  // supplied with this project update. Fare and trip duration are not listed
  // in the supplied tables, so this data stores schedule and stops only.
  oneAyala: [
    { to:"PITX",       mode:"ayala_bus", service:"EDSA Carousel (Southbound)", schedule:"24 hours",                  stops:"Pasay Rotonda, Pasay Taft, Baclaran, Heritage, MOA, PITX" },
    { to:"Alabang",    mode:"ayala_bus", service:"Alabang City Bus",           schedule:"5:00 AM to 12:00 MN",     stops:"SM Bicutan, Loyola Memorial Park, Starmall Alabang" },
    { to:"Paranaque",  mode:"ayala_bus", service:"Sucat City Bus",             schedule:"5:00 AM to 12:00 MN",     stops:"SM Bicutan, Loyola Memorial Park, Starmall Alabang" },
    { to:"Bicutan",    mode:"ayala_bus", service:"Bicutan City Bus",           schedule:"5:00 AM to 12:00 MN",     stops:"SM Bicutan, Loyola Memorial Park, Starmall Alabang", landmarks:["SM Bicutan"] },
    { to:"Antipolo",   mode:"ayala_p2p", service:"Antipolo P2P",              schedule:"Monday to Friday, 7:00 AM to 7:30 PM", stops:"Town & Country, Robinson Antipolo, Tropical, Santolan, Filinvest, Masinag, Feliz" },
    { to:"Las Pinas",  mode:"ayala_p2p", service:"Las Pinas P2P",             schedule:"Monday to Friday, 6:50 AM to 10:00 PM", stops:"Pilar, Robinson" },
    { to:"Antipolo",   mode:"ayala_uv",  service:"Antipolo UV Express - Gate 6", schedule:"Monday to Saturday, 3:00 PM to 10:00 PM; Sunday, 5:00 PM to 7:00 PM", stops:"Kalayaan, Buting, IPI, Rosario, Tikling, Antipolo Terminal" },
    { to:"Paranaque",  mode:"ayala_uv",  service:"Sucat Evacom-Paranaque UV Express - Gate 7", schedule:"Monday to Saturday, 3:00 PM to 10:00 PM", stops:"Valley 1 & 2, Evacom, Lopez, Green Heights, SM BF", landmarks:["SM BF Homes"] },
    { to:"Paranaque",  mode:"ayala_uv",  service:"BF El Grande-Paranaque UV Express - Gate 7", schedule:"Monday to Saturday, 3:00 PM to 10:00 PM", stops:"SM BF, Baliwan, Green Heights, Lopez, BF Subdivision", landmarks:["SM BF Homes"] },
    { to:"Las Pinas",  mode:"ayala_uv",  service:"BF Resort-Las Pinas UV Express", schedule:"Monday to Saturday, 4:00 PM to 9:00 PM; one to two trips every Saturday", stops:"Zapote, RFC, SM Center, Casimiro, Moonwalk" },
    { to:"Bicutan",    mode:"ayala_uv",  service:"Bicutan UV Express - Gate 9", schedule:"Monday to Saturday, 3:00 PM to 10:00 PM; Sunday, 5:00 PM to 7:00 PM", stops:"SM Bicutan, Russia Moonwalk, Russia Village Gate 1 & Gate 2, McDonald's Moonwalk", landmarks:["SM Bicutan"] }
  ],

  // Premium P2P routes supplied for this project update. These remain
  // separate from city bus entries so express terminal service is not inferred
  // where it has not been stored. No fares or schedules were supplied.
  premiumP2P: [
    {
      from:{ name:"Greenbelt 5", city:"Makati", aliases:["greenbelt 5","greenbelt","gb5","makati"] },
      to:{ name:"Alabang Town Center", city:"Muntinlupa", aliases:["alabang town center","atc","alabang","muntinlupa"] },
      operator:"RRCG Transport", bidirectional:true
    },
    {
      from:{ name:"One Ayala", city:"Makati", aliases:["one ayala","one ayala terminal","ayala terminal","makati"] },
      to:{ name:"Robinsons Dasmarinas", city:"Cavite", aliases:["robinsons dasmarinas","robinsons dasma","dasmarinas","dasma"] },
      operator:"MetroExpress Connect", bidirectional:true
    },
    {
      from:{ name:"One Ayala", city:"Makati", aliases:["one ayala","one ayala terminal","ayala terminal","makati"] },
      to:{ name:"Lancaster New City", city:"Imus, Cavite", aliases:["lancaster new city","lancaster","lnc","imus"] },
      operator:"LNC Link", bidirectional:true
    },
    {
      from:{ name:"One Ayala", city:"Makati", aliases:["one ayala","one ayala terminal","ayala terminal","makati"] },
      to:{ name:"Sierra Valley", city:"Cainta", aliases:["sierra valley","sierra","cainta"] },
      operator:"RRCG Transport", bidirectional:true
    },
    {
      from:{ name:"One Ayala", city:"Makati", aliases:["one ayala","one ayala terminal","ayala terminal","makati"] },
      to:{ name:"Calamba Crossing", city:"Laguna", aliases:["calamba crossing","calamba"] },
      operator:"Saint Rose Transit", bidirectional:true
    },
    {
      from:{ name:"Market! Market!", city:"BGC, Taguig", aliases:["market market","market! market!","bgc","taguig"] },
      to:{ name:"Alabang Town Center", city:"Muntinlupa", aliases:["alabang town center","atc","alabang","muntinlupa"] },
      operator:"HM Transport", bidirectional:true
    },
    {
      from:{ name:"PITX", city:"Paranaque", aliases:["pitx","paranaque"] },
      to:{ name:"SM City Baguio", city:"Baguio", aliases:["sm city baguio","sm baguio","baguio"] },
      operator:"Pangasinan Solid North", bidirectional:true
    },
    {
      from:{ name:"PITX", city:"Paranaque", aliases:["pitx","paranaque"] },
      to:{ name:"Batangas City Grand Terminal", city:"Batangas", aliases:["batangas city grand terminal","batangas grand terminal","batangas city","batangas"] },
      operator:"ALPS", bidirectional:true
    },
    {
      from:{ name:"PITX", city:"Paranaque", aliases:["pitx","paranaque"] },
      to:{ name:"SM City Lipa", city:"Batangas", aliases:["sm city lipa","sm lipa","lipa"] },
      operator:"ALPS", bidirectional:true
    },
    {
      from:{ name:"PITX", city:"Paranaque", aliases:["pitx","paranaque"] },
      to:{ name:"San Juan, Batangas", city:"Batangas", aliases:["san juan batangas","san juan, batangas"] },
      operator:"ALPS", bidirectional:true
    },
    {
      from:{ name:"Greenbelt 5", city:"Makati", aliases:["greenbelt 5","greenbelt","gb5","makati"] },
      to:{ name:"Batangas City Grand Terminal", city:"Batangas", aliases:["batangas city grand terminal","batangas grand terminal","batangas city","batangas"] },
      operator:"RRCG Transport", bidirectional:false,
      stops:["South Park Center Alabang","Vista Terminal Exchange"]
    },
    {
      from:{ name:"Greenbelt 5", city:"Makati", aliases:["greenbelt 5","greenbelt","gb5","makati"] },
      to:{ name:"SM City Lipa", city:"Batangas", aliases:["sm city lipa","sm lipa","lipa"] },
      operator:"RRCG Transport", bidirectional:false,
      stops:["South Park Center Alabang","Vista Terminal Exchange"]
    },
    {
      from:{ name:"SOMO Vista Mall", city:"Bacoor", aliases:["somo vista mall","somo","vista mall bacoor","bacoor"] },
      to:{ name:"One Ayala", city:"Makati", aliases:["one ayala","one ayala terminal","ayala terminal","makati"] },
      operator:"MetroExpress Connect", bidirectional:true,
      stops:["Evia Lifestyle Center","Robinsons Summit Center","Circuit Makati"]
    },
    {
      from:{ name:"Alabang", city:"Muntinlupa", aliases:["alabang","muntinlupa"] },
      to:{ name:"Lawton", city:"Manila", aliases:["lawton","manila"] },
      operator:"TAS Trans", bidirectional:true,
      notes:["Via Alabang-Zapote Road"]
    },
    {
      from:{ name:"Nuvali", city:"Sta. Rosa, Laguna", aliases:["nuvali","sta rosa","santa rosa"] },
      to:{ name:"Makati", city:"Makati", aliases:["makati"] },
      operator:"TAS Trans", bidirectional:true
    },
    {
      from:{ name:"Alabang", city:"Muntinlupa", aliases:["alabang","muntinlupa"] },
      to:{ name:"PITX", city:"Paranaque", aliases:["pitx","paranaque"] },
      operator:"TAS Trans", bidirectional:true
    }
  ],

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
  "Bacoor":      "Bacoor",
  "Dasmarinas":  "Dasmarinas",
  "Imus":        "Imus",
  "Molino":      "Bacoor",
  "Tagaytay":    "Tagaytay",
  "Trece Martires": "Trece Martires",
  "NAIA":        "Pasay",
  "Arca South":  "Taguig",
  "FTI":         "Taguig",
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
function phDateParts(date = new Date()) {
  const shifted = new Date(date.getTime() + 8 * 60 * 60 * 1000);
  return {
    year: shifted.getUTCFullYear(),
    month: shifted.getUTCMonth() + 1,
    day: shifted.getUTCDate(),
    hour: shifted.getUTCHours()
  };
}

function phDateKeyFromParts(parts) {
  return `${parts.year}-${String(parts.month).padStart(2, '0')}-${String(parts.day).padStart(2, '0')}`;
}

function getPhDateKey(offsetDays = 0) {
  const now = phDateParts();
  const target = new Date(Date.UTC(now.year, now.month - 1, now.day + offsetDays));
  return phDateKeyFromParts({
    year: target.getUTCFullYear(),
    month: target.getUTCMonth() + 1,
    day: target.getUTCDate()
  });
}

function formatPhForecastDate(dateKey, relativeLabel = '') {
  const [year, month, day] = dateKey.split('-').map(Number);
  const dateText = new Intl.DateTimeFormat('en-PH', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    timeZone: 'Asia/Manila'
  }).format(new Date(Date.UTC(year, month - 1, day, 4)));
  return relativeLabel ? `${relativeLabel}, ${dateText}` : dateText;
}

function formatHour(hour) {
  const ampm = hour >= 12 ? 'PM' : 'AM';
  const h12 = hour % 12 || 12;
  return `${h12}:00 ${ampm}`;
}

function parseTargetDate(text) {
  const lower = String(text || '').toLowerCase();
  if (/\b(tomorrow|bukas)\b/.test(lower)) {
    const dateKey = getPhDateKey(1);
    return { dateKey, displayDate: formatPhForecastDate(dateKey, 'tomorrow') };
  }
  if (/\b(today|ngayon|mamaya)\b/.test(lower)) {
    const dateKey = getPhDateKey(0);
    return { dateKey, displayDate: formatPhForecastDate(dateKey, 'today') };
  }
  const explicit = lower.match(/\b(20\d{2})-(\d{2})-(\d{2})\b/);
  if (explicit) {
    const dateKey = `${explicit[1]}-${explicit[2]}-${explicit[3]}`;
    return { dateKey, displayDate: formatPhForecastDate(dateKey) };
  }
  return null;
}

// targetHour: 0-23 (local PH time). targetDateKey: YYYY-MM-DD in PH time.
// If no target hour is supplied, returns the first forecast slot on the target date.
function getWeatherForecast(areaName, targetHour, targetDateKey = null, requestedDisplayDate = '') {
  return new Promise((resolve) => {
    const apiKey = process.env.OPENWEATHER_API_KEY;
    if (!apiKey) { resolve(null); return; }

    const city = WEATHER_CITY_MAP[areaName] || areaName;
    const urlPath = `/data/2.5/forecast?q=${encodeURIComponent(city + ',PH')}&appid=${apiKey}&units=metric&cnt=40`;

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

          const matchingDateSlots = targetDateKey
            ? json.list.filter(slot => {
                const parts = phDateParts(new Date(slot.dt * 1000));
                return phDateKeyFromParts(parts) === targetDateKey;
              })
            : json.list;
          if (matchingDateSlots.length === 0) { resolve(null); return; }

          // Each slot is a 3-hour window. Find the best time match in the requested PH date.
          let bestSlot = null;
          if (targetHour !== null && targetHour !== undefined) {
            let minDiff = Infinity;
            for (const slot of matchingDateSlots) {
              const slotHour = phDateParts(new Date(slot.dt * 1000)).hour;
              const diff = Math.abs(slotHour - targetHour);
              if (diff < minDiff) {
                minDiff = diff;
                bestSlot = slot;
              }
            }
          } else {
            bestSlot = matchingDateSlots[0];
          }

          if (!bestSlot) { resolve(null); return; }

          // Format the PH local time for display
          const slotParts = phDateParts(new Date(bestSlot.dt * 1000));
          const slotDateKey = phDateKeyFromParts(slotParts);
          const displayTime = formatHour(slotParts.hour);

          resolve({
            description: bestSlot.weather[0].description,
            main:        bestSlot.weather[0].main,
            temp:        Math.round(bestSlot.main.temp),
            feels_like:  Math.round(bestSlot.main.feels_like),
            humidity:    bestSlot.main.humidity,
            isRainy:     /rain|thunder|drizzle/i.test(bestSlot.weather[0].main),
            displayTime,
            requestedTime: targetHour === null || targetHour === undefined ? null : formatHour(targetHour),
            displayDate: requestedDisplayDate || formatPhForecastDate(slotDateKey),
            dateKey: slotDateKey,
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
function normalizeCarouselTerm(value) {
  return String(value || '').toLowerCase().replace(/[^a-z0-9\s]/g, ' ').replace(/\s+/g, ' ').trim();
}

function findCarouselStop(input) {
  const clean = normalizeCarouselTerm(input);
  if (!clean) return null;
  const stops = [...DB.carousel.southbound.stops, ...DB.carousel.northbound.stops];
  for (const stop of stops) {
    const aliases = [stop.name, ...(stop.aliases || [])].map(normalizeCarouselTerm);
    if (aliases.includes(clean)) return stop;
  }
  return null;
}

function findCarouselPath(originRaw, destinationRaw) {
  const originStop = findCarouselStop(originRaw);
  const destinationStop = findCarouselStop(destinationRaw);
  if (!originStop || !destinationStop || originStop.name === destinationStop.name) return null;
  for (const route of [DB.carousel.southbound, DB.carousel.northbound]) {
    const originIndex = route.stops.findIndex(stop => stop.name === originStop.name);
    const destinationIndex = route.stops.findIndex(stop => stop.name === destinationStop.name);
    if (originIndex !== -1 && destinationIndex > originIndex) {
      return {
        direction: route.direction,
        origin: route.stops[originIndex],
        destination: route.stops[destinationIndex],
        stops: route.stops.slice(originIndex, destinationIndex + 1)
      };
    }
  }
  return null;
}

function formatCarouselStops(route) {
  return route.stops
    .map((stop, index) => `${index + 1}. ${stop.name} (${stop.city})${stop.connection ? ` - near ${stop.connection}` : ''}`)
    .join('\n');
}

function buildCarouselRouteListReply(message) {
  const clean = message.toLowerCase();
  if (!/edsa\s*carousel/.test(clean) || !/\b(full|complete|all|list|stops?|route)\b/.test(clean) || /\s+to\s+/i.test(message)) {
    return null;
  }
  const wantsSouthbound = /\bsouthbound\b|\bpatimog\b/.test(clean);
  const wantsNorthbound = /\bnorthbound\b|\bpahilaga\b/.test(clean);
  const routes = wantsSouthbound && !wantsNorthbound
    ? [DB.carousel.southbound]
    : wantsNorthbound && !wantsSouthbound
      ? [DB.carousel.northbound]
      : [DB.carousel.southbound, DB.carousel.northbound];
  const routeSections = routes.map(route =>
    `EDSA Carousel ${route.direction} / ${route.direction === 'Southbound' ? 'Patimog' : 'Pahilaga'}:\n${formatCarouselStops(route)}`
  ).join('\n\n');
  return `${routeSections}\n\nFare guide: PHP 15-75. Confirm the current fare before riding.\nGabay sa pamasahe: PHP 15-75. Kumpirmahin ang kasalukuyang pamasahe bago sumakay.`;
}

function premiumP2PMatchScore(endpoint, input) {
  const clean = normalizeCarouselTerm(input);
  if (!clean) return 0;
  const exactTerms = [endpoint.name, ...(endpoint.aliases || [])].map(normalizeCarouselTerm);
  if (exactTerms.includes(clean)) return 3;
  if (normalizeCarouselTerm(endpoint.city) === clean) return 2;
  if (clean.length >= 3 && exactTerms.some(term => term.includes(clean) || clean.includes(term))) return 1;
  return 0;
}

function findPremiumP2PPaths(originRaw, destinationRaw) {
  return DB.premiumP2P
    .flatMap((route, index) => {
      const forwardScore = premiumP2PMatchScore(route.from, originRaw) + premiumP2PMatchScore(route.to, destinationRaw);
      const reverseScore = route.bidirectional
        ? premiumP2PMatchScore(route.to, originRaw) + premiumP2PMatchScore(route.from, destinationRaw)
        : 0;
      const matches = [];
      if (forwardScore > 0 && premiumP2PMatchScore(route.from, originRaw) > 0 && premiumP2PMatchScore(route.to, destinationRaw) > 0) {
        matches.push({ route, from:route.from, to:route.to, score:forwardScore, id:`PREMIUM_P2P_${index}_OUTBOUND` });
      }
      if (reverseScore > 0 && premiumP2PMatchScore(route.to, originRaw) > 0 && premiumP2PMatchScore(route.from, destinationRaw) > 0) {
        matches.push({ route, from:route.to, to:route.from, score:reverseScore, id:`PREMIUM_P2P_${index}_RETURN` });
      }
      return matches;
    })
    .sort((a, b) => b.score - a.score)
    .map(match => ({
      id:match.id,
      type:'premium_p2p',
      description:`P2P Bus - ${match.route.operator}: ${match.from.name} -> ${match.to.name}`,
      displayOrigin:match.from.name,
      displayDestination:match.to.name,
      segments:[{
        mode:'premium_p2p',
        from:match.from.name,
        to:match.to.name,
        operator:match.route.operator,
        fare:match.route.fare ?? null,
        schedule:match.route.schedule || '',
        stops:match.route.stops || [],
        notes:match.route.notes || []
      }],
      transfers:0
    }));
}

function buildPremiumP2PListReply(message) {
  const clean = normalizeCarouselTerm(message);
  if (!/^p2p(?: bus)?(?: routes?)? to makati$/.test(clean) && !/^show (?:available )?p2p(?: bus)?(?: routes?)? to makati$/.test(clean)) {
    return null;
  }
  const entries = DB.premiumP2P.flatMap(route => {
    const directions = [];
    if (premiumP2PMatchScore(route.to, 'makati') > 0) {
      directions.push(`${route.from.name} -> ${route.to.name} (${route.operator})`);
    }
    if (route.bidirectional && premiumP2PMatchScore(route.from, 'makati') > 0) {
      directions.push(`${route.to.name} -> ${route.from.name} (${route.operator})`);
    }
    return directions;
  });
  return `Available P2P Bus routes to Makati:\n${entries.map((entry, index) => `${index + 1}. ${entry}`).join('\n')}\n\nFare and schedule information are not stored; verify with the terminal or operator before riding.\n\nMga available na P2P Bus route papuntang Makati:\n${entries.map((entry, index) => `${index + 1}. ${entry}`).join('\n')}\n\nHindi naka-save ang pamasahe at iskedyul; kumpirmahin sa terminal o operator bago sumakay.`;
}

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
  const displayName = (input, resolved) => {
    const clean = input.toLowerCase().trim().replace(/[^a-z0-9\s]/g, '');
    if (['one ayala', 'one ayala terminal'].includes(clean)) return 'One Ayala Terminal';
    if (['sm bicutan', 'sm bicutan terminal'].includes(clean)) return 'SM Bicutan';
    if (['bf homes', 'sm bf', 'sm bf homes'].includes(clean)) return 'SM BF Homes';
    if (['fairview', 'sm fairview'].includes(clean)) return 'Fairview';
    if (['pasay rotonda', 'rotonda', 'taft avenue station', 'mrt 3 taft avenue station'].includes(clean)) return 'Pasay Rotonda';
    if (clean === 'ayala makati') return 'Ayala Makati';
    return resolved;
  };
  const origin      = normalize(originRaw);
  const destination = normalize(destinationRaw);
  let originDisplay = findCarouselStop(originRaw)?.name || displayName(originRaw, origin);
  let destinationDisplay = findCarouselStop(destinationRaw)?.name || displayName(destinationRaw, destination);
  if (origin === 'Pasay' && ['Cavite', 'Bacoor', 'Imus', 'Dasmarinas', 'Molino', 'Tagaytay', 'Trece Martires'].includes(destination)) {
    originDisplay = 'Pasay Rotonda';
  }
  if (origin === 'Arca South' && destination === 'Pasay') {
    destinationDisplay = 'Pasay Rotonda / MOA';
  }
  if (destination === 'Bacoor') destinationDisplay = 'Bacoor, Cavite';
  if (destination === 'Dasmarinas') destinationDisplay = 'Dasmarinas, Cavite';
  if (destination === 'Imus') destinationDisplay = 'Imus, Cavite';
  if (destination === 'Molino') destinationDisplay = 'Molino, Cavite';
  if (destination === 'Tagaytay') destinationDisplay = 'Tagaytay, Cavite';
  if (destination === 'Trece Martires') destinationDisplay = 'Trece Martires, Cavite';
  return {
    originRaw, destinationRaw, origin, destination,
    originDisplay,
    destinationDisplay,
    originKnown: !!DB.areas[origin],
    destKnown:   !!DB.areas[destination],
    originArea:  DB.areas[origin]      || null,
    destArea:    DB.areas[destination] || null
  };
}

// ── STAGE 2: list_paths ───────────────────────────
// STAGE 1.5: retrieve route evidence from the curated commute knowledge base.
function normalizeForRetrieval(value) {
  return String(value || '')
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function tokenizeForRetrieval(value) {
  const stopWords = new Set(['the', 'and', 'for', 'from', 'with', 'route', 'routes', 'commute', 'terminal']);
  return normalizeForRetrieval(value)
    .split(' ')
    .filter(token => token.length > 2 && !stopWords.has(token));
}

function getPlaceQueryTerms(...values) {
  const terms = new Set();
  values.filter(Boolean).forEach(value => {
    terms.add(normalizeForRetrieval(value));
    const aliasTerms = Object.entries(DB.aliases)
      .filter(([, resolved]) => resolved === value)
      .map(([alias]) => alias);
    aliasTerms.forEach(alias => terms.add(normalizeForRetrieval(alias)));
  });
  return [...terms].filter(Boolean);
}

function retrieveRouteEvidence(resolved, paths = [], message = '') {
  if (!REFERENCE_KNOWLEDGE.length) {
    return { query: '', matches: [] };
  }

  const placeTerms = getPlaceQueryTerms(
    resolved.origin,
    resolved.destination,
    resolved.originDisplay,
    resolved.destinationDisplay,
    resolved.originRaw,
    resolved.destinationRaw
  );
  const pathTerms = paths.flatMap(route => [
    route.type,
    route.description,
    ...(route.segments || []).flatMap(segment => [segment.mode, segment.service, segment.bus, segment.operator])
  ]);
  const queryText = [message, ...placeTerms, ...pathTerms].filter(Boolean).join(' ');
  const queryTokens = new Set(tokenizeForRetrieval(queryText));

  const scored = REFERENCE_KNOWLEDGE.map(entry => {
    const haystack = [
      entry.title,
      entry.source,
      entry.summary,
      entry.caution,
      ...(entry.coverage || []),
      ...(entry.modes || [])
    ].join(' ');
    const entryTokens = new Set(tokenizeForRetrieval(haystack));
    let score = 0;

    queryTokens.forEach(token => {
      if (entryTokens.has(token)) score += 2;
      if ((entry.coverage || []).some(place => normalizeForRetrieval(place).includes(token))) score += 2;
      if ((entry.modes || []).some(mode => normalizeForRetrieval(mode).includes(token))) score += 1;
    });

    placeTerms.forEach(term => {
      if ((entry.coverage || []).map(normalizeForRetrieval).includes(term)) score += 4;
      if (normalizeForRetrieval(entry.summary).includes(term)) score += 2;
    });

    if (paths.some(route => /uv/i.test(route.type) || route.segments?.some(segment => /uv/i.test(segment.mode || ''))) && (entry.modes || []).includes('uv')) score += 5;
    if (paths.some(route => /p2p|one_ayala/i.test(route.type)) && (entry.modes || []).includes('p2p')) score += 4;
    if (paths.some(route => /cavite/i.test(route.type)) && (entry.coverage || []).includes('Cavite')) score += 5;
    if (paths.some(route => /edsa_carousel/i.test(route.type)) && (entry.modes || []).includes('edsa carousel')) score += 4;
    if (/why|unreliable|traffic|struggle|inequality|context/i.test(message) && entry.reliability === 'context') score += 6;

    return { ...entry, score };
  })
    .filter(entry => entry.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, 3);

  return {
    query: queryText,
    matches: scored.map(({ score, ...entry }) => entry)
  };
}

function buildEvidenceNote(evidence) {
  if (!evidence?.matches?.length) return '';
  const cautions = [...new Set(evidence.matches.map(entry => entry.caution).filter(Boolean))].slice(0, 2);
  const citations = {
    sources: evidence.matches.map(entry => ({
      source: entry.source,
      title: entry.title,
      url: entry.url
    })),
    cautions
  };
  return `\n\nCITATIONS_JSON:\n${JSON.stringify(citations)}`;
}

function getAutonomousCandidatePaths(resolved) {
  const directPaths = listPaths(resolved);
  if (directPaths.length > 0) {
    return directPaths;
  }
  return buildFallbackTerminalPaths(resolved);
}

function buildFallbackTerminalPaths(resolved) {
  const fallbackHubs = ['PITX', 'MOA', 'Pasay', 'Makati', 'Buendia', 'Guadalupe'];
  const paths = [];

  for (const hub of fallbackHubs) {
    if (hub === resolved.origin || hub === resolved.destination) continue;

    const toHubResolved = resolveLocations(resolved.originDisplay || resolved.origin, hub);
    const fromHubResolved = resolveLocations(hub, resolved.destinationDisplay || resolved.destination);
    const toHubPaths = listPaths(toHubResolved);
    const fromHubPaths = listPaths(fromHubResolved);

    if (!toHubPaths.length || !fromHubPaths.length) continue;

    const firstLeg = toHubPaths[0];
    const secondLeg = fromHubPaths[0];
    const hubDisplay = toHubResolved.destinationDisplay || fromHubResolved.originDisplay || hub;

    paths.push({
      id: `FALLBACK_VIA_${hub.toUpperCase().replace(/\s+/g, '_')}`,
      type: 'fallback_terminal',
      description: `${firstLeg.description} + transfer via ${hubDisplay} + ${secondLeg.description}`,
      displayOrigin: resolved.originDisplay,
      displayDestination: resolved.destinationDisplay,
      segments: [
        ...firstLeg.segments,
        {
          mode: 'guided_terminal',
          label: `Transfer at ${hubDisplay}`,
          detail: `Use ${hubDisplay} as a fallback transfer point, then confirm the next bay, signboard, current fare, and operating status before boarding. / Gamitin ang ${hubDisplay} bilang lipatang terminal, pagkatapos ay kumpirmahin ang susunod na bay, karatula, kasalukuyang pamasahe, at biyahe bago sumakay.`
        },
        ...secondLeg.segments
      ],
      transfers: firstLeg.transfers + secondLeg.transfers + 1,
      fallbackHub: hubDisplay
    });
  }

  return paths.slice(0, 3);
}

function buildReferenceKnowledgeReply(message) {
  const clean = normalizeForRetrieval(message);
  const asksForSources = /\b(source|sources|reference|references|links|knowledge base|retrieval|rag)\b/i.test(message);
  const asksForContext = /\b(unreliable|inequality|struggle|why.*commute|traffic problem)\b/i.test(message);
  const looksLikeRoute = /\s+to\s+|\bpapunta\b|\bdirections?\b|\bsakay\b/i.test(message);
  if ((!asksForSources && !asksForContext) || looksLikeRoute) return null;

  const queryTokens = new Set(tokenizeForRetrieval(message));
  const matches = REFERENCE_KNOWLEDGE.map(entry => {
    const text = [entry.title, entry.source, entry.summary, entry.caution, ...(entry.coverage || []), ...(entry.modes || [])].join(' ');
    const tokens = new Set(tokenizeForRetrieval(text));
    let score = 0;
    queryTokens.forEach(token => {
      if (tokens.has(token)) score += 2;
      if (normalizeForRetrieval(text).includes(token)) score += 1;
    });
    if (asksForSources && entry.reliability !== 'context') score += 2;
    if (asksForContext && entry.reliability === 'context') score += 5;
    return { ...entry, score };
  })
    .filter(entry => entry.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, asksForSources ? 6 : 3);

  if (!matches.length) return null;
  const lines = matches.map((entry, index) => `${index + 1}. ${entry.source}: ${entry.title} - ${entry.summary} (${entry.url})`).join('\n');
  return `I use these retrieved references for route evidence and context:\n${lines}\n\nFor live trips, please still verify fares, gates, and schedules at the terminal.\n\nGinagamit ko ang mga reference na ito para sa ebidensya ng ruta at konteksto:\n${lines}\n\nPara sa aktwal na biyahe, kumpirmahin pa rin ang pamasahe, gate, at iskedyul sa terminal.`;
}

function listPaths(resolved) {
  const { origin, destination, originArea, destArea, originDisplay = origin, destinationDisplay = destination } = resolved;
  const paths = [];

  const premiumP2PPaths = findPremiumP2PPaths(resolved.originRaw, resolved.destinationRaw);
  if (premiumP2PPaths.length > 0) {
    return premiumP2PPaths;
  }

  const carouselPath = findCarouselPath(resolved.originRaw, resolved.destinationRaw);
  if (carouselPath) {
    return [{
      id:`EDSA_CAROUSEL_${carouselPath.direction.toUpperCase()}`,
      type:'edsa_carousel',
      description:`EDSA Carousel ${carouselPath.direction}: ${carouselPath.origin.name} -> ${carouselPath.destination.name}`,
      segments:[{
        mode:'carousel',
        direction:carouselPath.direction,
        from:carouselPath.origin.name,
        to:carouselPath.destination.name,
        orderedStops:carouselPath.stops,
        stops:carouselPath.stops.length - 1
      }],
      transfers:0
    }];
  }

  const stationIdx = (line, hub) =>
    line.stations.findIndex(s =>
      s.toLowerCase().includes(hub.toLowerCase()) ||
      hub.toLowerCase().includes(s.toLowerCase().split(' ')[0])
    );

  const terminalServices = DB.terminalRoutes.filter(route =>
    route.from === origin && route.to === destination
  );
  if (terminalServices.length > 0) {
    return terminalServices.map((route, index) => {
      const segments = route.segments || [{
        mode: route.mode,
        label: `${route.mode === 'guided_tricycle' ? 'Tricycle' : route.mode === 'guided_shuttle' ? 'Shuttle' : 'Terminal service'}: ${route.service}`,
        detail: route.detail || (
          route.mode === 'guided_tricycle'
            ? `At Arca South, use the tricycle terminal for ${destinationDisplay}. Confirm the loading point before riding. / Sa Arca South, gamitin ang terminal ng tricycle papuntang ${destinationDisplay}. Kumpirmahin ang sakayan bago bumiyahe.`
            : `At Arca South, find the terminal service for ${destinationDisplay}. Confirm the available vehicle type and loading point before boarding. / Sa Arca South, hanapin ang terminal service papuntang ${destinationDisplay}. Kumpirmahin ang sasakyan at sakayan bago sumakay.`
        )
      }];
      return {
        id: route.id || `TERMINAL_${index}`,
        type: 'terminal_guidance',
        description: segments.map(segment => segment.label).join(' + '),
        segments,
        transfers: Math.max(0, segments.length - 1)
      };
    });
  }

  const caviteServices = DB.caviteRoutes.filter(route =>
    route.from === origin && route.to === destination
  );
  if (caviteServices.length > 0) {
    return caviteServices.map(route => ({
      id: route.id,
      type: 'cavite_guidance',
      description: route.segments.map(segment => segment.label).join(' + '),
      segments: route.segments,
      transfers: Math.max(0, route.segments.length - 1)
    }));
  }

  // ── P2P bus routes (bidirectional, single best match) ──
  if (originDisplay === 'One Ayala Terminal') {
    const services = DB.oneAyala.filter(service => service.to === destination);
    const landmarkServices = destinationDisplay !== destination
      ? services.filter(service => (service.landmarks || []).includes(destinationDisplay))
      : services;
    const matchingServices = landmarkServices.length ? landmarkServices : services;

    matchingServices.forEach((service, index) => {
      paths.push({
        id:`ONE_AYALA_${index}`, type:'one_ayala_terminal',
        description:`${service.service}: One Ayala Terminal -> ${destinationDisplay}`,
        segments:[{
          mode: service.mode,
          from:'One Ayala Terminal',
          to: destinationDisplay,
          service: service.service,
          schedule: service.schedule,
          stops: service.stops
        }],
        transfers:0
      });
    });
  }

  if (originDisplay === 'One Ayala Terminal' && paths.length > 0) {
    return paths;
  }

  // Direct UV Express routes provide terminal-to-terminal service only; fares
  // must be verified at the terminal because current values are not stored.
  // No duration is assigned because the supplied sources do not publish one here.
  const uvMatch = DB.uvExpress.find(r =>
    (r.from === origin && r.to === destination) ||
    (r.from === destination && r.to === origin)
  );

  if (uvMatch) {
    paths.push({
      id:'UV_EXPRESS', type:'direct_uv',
      description:`UV Express (${uvMatch.service}): ${origin} -> ${destination}`,
      segments:[{
        mode:'uv',
        from: originDisplay,
        to: destinationDisplay,
        fare: null,
        service: uvMatch.service
      }],
      transfers:0
    });
  }

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
        from: originDisplay,
        to:   destinationDisplay,
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

  const originAccess = () => originArea.hubMode !== 'origin'
    ? [{ mode:originArea.hubMode, from:originDisplay, to:originArea.hub, km:originArea.hubKm, min:originArea.hubMin }]
    : [];
  const destinationAccess = () => destArea.hubMode !== 'origin'
    ? [{ mode:destArea.hubMode, from:destArea.hub, to:destinationDisplay, km:destArea.hubKm, min:destArea.hubMin, signboard:destinationDisplay }]
    : [];

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
            ...originAccess(),
            {mode:line.name,from:line.stations[oi],to:line.stations[di],stops:Math.abs(di-oi),line:line.name},
            ...destinationAccess()
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
          ...originAccess(),
          {mode:'LRT-1',from:DB.lrt1.stations[oi],to:'EDSA',stops:Math.abs(edsa-oi),line:'LRT-1'},
          {mode:'walk',from:'EDSA LRT-1',to:'Taft Avenue MRT-3',min:5,note:'~200m covered walkway'},
          {mode:'MRT-3',from:'Taft Avenue',to:DB.mrt3.stations[di],stops:Math.abs(di-taft),line:'MRT-3'},
          ...destinationAccess()
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
          ...originAccess(),
          {mode:'MRT-3',from:DB.mrt3.stations[oi],to:'Taft Avenue',stops:Math.abs(taft-oi),line:'MRT-3'},
          {mode:'walk',from:'Taft Avenue MRT',to:'Baclaran LRT-1',min:5,note:'~200m covered walkway'},
          {mode:'LRT-1',from:'Baclaran',to:DB.lrt1.stations[di],stops:Math.abs(di-bac),line:'LRT-1'},
          ...destinationAccess()
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
          ...originAccess(),
          {mode:'MRT-3',from:DB.mrt3.stations[oi],to:'Araneta-Cubao',stops:Math.abs(c3-oi),line:'MRT-3'},
          {mode:'walk',from:'Araneta-Cubao MRT',to:'Araneta-Cubao LRT-2',min:3,note:'Direct interchange'},
          {mode:'LRT-2',from:'Araneta-Cubao',to:DB.lrt2.stations[di],stops:Math.abs(di-c2),line:'LRT-2'},
          ...destinationAccess()
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
          ...originAccess(),
          {mode:'LRT-2',from:DB.lrt2.stations[oi],to:'Araneta-Cubao',stops:Math.abs(c2-oi),line:'LRT-2'},
          {mode:'walk',from:'Araneta-Cubao LRT-2',to:'Araneta-Cubao MRT-3',min:3,note:'Direct interchange'},
          {mode:'MRT-3',from:'Araneta-Cubao',to:DB.mrt3.stations[di],stops:Math.abs(di-c3),line:'MRT-3'},
          ...destinationAccess()
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
      detail=`Board at ${s.from} station · ${n} stop${n>1?'s':''} · Alight at ${s.to}${isPeak?' · Expect queues at turnstiles':''} / Sumakay sa ${s.from} station · ${n} hintuan · Bumaba sa ${s.to}${isPeak?' · Asahan ang pila sa turnstiles':''}`;
    } else if (s.mode==='LRT-1') {
      const n=s.stops||1;
      fare=DB.lrt1.fare[Math.min(n,17)]||30;
      min=Math.ceil(n*DB.lrt1.minPerStop+5);
      const dir = DB.lrt1.stations.indexOf(s.to) > DB.lrt1.stations.indexOf(s.from) ? 'Northbound' : 'Southbound';
      label=`LRT-1 ${dir}: ${s.from} → ${s.to}`;
      detail=`Board at ${s.from} station · ${n} stop${n>1?'s':''} · Alight at ${s.to}${isPeak?' · Very crowded during rush hour':''} / Sumakay sa ${s.from} station · ${n} hintuan · Bumaba sa ${s.to}${isPeak?' · Asahang siksikan sa rush hour':''}`;
    } else if (s.mode==='LRT-2') {
      const n=s.stops||1;
      fare=DB.lrt2.fare[Math.min(n,10)]||22;
      min=Math.ceil(n*DB.lrt2.minPerStop+4);
      const dir = DB.lrt2.stations.indexOf(s.to) > DB.lrt2.stations.indexOf(s.from) ? 'Eastbound' : 'Westbound';
      label=`LRT-2 ${dir}: ${s.from} → ${s.to}`;
      detail=`Board at ${s.from} station · ${n} stop${n>1?'s':''} · Alight at ${s.to} / Sumakay sa ${s.from} station · ${n} hintuan · Bumaba sa ${s.to}`;
    } else if (s.mode==='jeepney') {
      const km=s.km||4;
      fare=km<=4?13:Math.ceil(13+(km-4)*1.80);
      min=Math.ceil((s.min||20)*pm);
      label=`Jeepney: ${s.from} → ${s.to}`;
      detail=`Ride jeepney from ${s.from} going to ${s.to} · ~${km}km · Flag down along the route${isPeak?' · Heavy traffic expected':''} / Sumakay ng jeepney mula ${s.from} papuntang ${s.to} · ~${km}km · Maaaring pumara sa ruta${isPeak?' · Asahan ang matinding trapiko':''}`;
      if (s.signboard) {
        detail=`From ${s.from}, look for a jeepney with the "${s.signboard}" signboard and alight at ${s.signboard} (~${km} km)${isPeak?' - Heavy traffic expected':''} / Mula ${s.from}, hanapin ang jeepney na may karatulang "${s.signboard}" at bumaba sa ${s.signboard} (~${km} km)${isPeak?' - Asahan ang matinding trapiko':''}`;
      }
    } else if (s.mode==='walk') {
      fare=0; min=s.min||5;
      label=`Walk: ${s.from} → ${s.to}`;
      detail=`${s.note||`Walk from ${s.from} to ${s.to}`} / Maglakad mula ${s.from} papuntang ${s.to}.`;
    } else if (s.mode==='uv') {
      fare=null;
      min=null;
      label=`UV Express: ${s.service}`;
      detail=`Terminal route for ${s.from} to ${s.to} | Fare not stored; verify current fare at the terminal | No travel-time estimate stored / Rutang terminal mula ${s.from} papuntang ${s.to} | Hindi naka-save ang pamasahe; kumpirmahin sa terminal | Walang naka-save na tantiya ng oras ng biyahe`;
    } else if (s.mode==='carousel') {
      fare=null;
      min=null;
      const stopCount = Math.max(1, s.orderedStops.length - 1);
      const endpointConnections = [s.orderedStops[0], s.orderedStops[s.orderedStops.length - 1]]
        .filter(stop => stop.connection)
        .map(stop => `${stop.name}: ${stop.connection}`)
        .join('; ');
      label=`EDSA Carousel ${s.direction}: ${s.from} -> ${s.to}`;
      detail=`Board the ${s.direction.toLowerCase()} EDSA Carousel at ${s.from}; alight at ${s.to} after ${stopCount} stop${stopCount === 1 ? '' : 's'}.${endpointConnections ? ` Rail connection: ${endpointConnections}.` : ''} Fare guide: PHP 15-75; verify before boarding. / Sumakay ng ${s.direction.toLowerCase()} EDSA Carousel sa ${s.from}; bumaba sa ${s.to} makalipas ang ${stopCount} hintuan.${endpointConnections ? ` Koneksyon sa tren: ${endpointConnections}.` : ''} Gabay sa pamasahe: PHP 15-75; kumpirmahin bago sumakay.`;
    } else if (s.mode==='premium_p2p') {
      fare=s.fare ?? null;
      min=null;
      const possibleStops = s.stops.length ? ` Possible stopovers: ${s.stops.join(', ')}.` : '';
      const serviceNotes = s.notes.length ? ` ${s.notes.join('. ')}.` : '';
      const fareInfo = s.fare !== null ? ` Fare: PHP ${s.fare}.` : ' Fare not stored; verify before boarding.';
      const scheduleInfo = s.schedule ? ` Schedule: ${s.schedule}.` : ' Schedule not stored; verify before boarding.';
      label=`P2P Bus - ${s.operator}: ${s.from} -> ${s.to}`;
      detail=`Express terminal-to-terminal P2P Bus service with limited stops.${possibleStops}${serviceNotes}${fareInfo}${scheduleInfo} Confirm with ${s.operator} before riding. / Express na P2P Bus mula terminal patungong terminal na may limitadong hintuan.${s.stops.length ? ` Posibleng hintuan: ${s.stops.join(', ')}.` : ''}${s.notes.length ? ` ${s.notes.join('. ')}.` : ''}${s.fare !== null ? ` Pamasahe: PHP ${s.fare}.` : ' Hindi naka-save ang pamasahe; kumpirmahin bago sumakay.'}${s.schedule ? ` Iskedyul: ${s.schedule}.` : ' Hindi naka-save ang iskedyul; kumpirmahin bago sumakay.'} Kumpirmahin sa ${s.operator} bago bumiyahe.`;
    } else if (s.mode==='guided_bus' || s.mode==='guided_uv' || s.mode==='guided_jeep' ||
      s.mode==='guided_terminal' || s.mode==='guided_shuttle' || s.mode==='guided_tricycle' ||
      s.mode==='guided_lrt') {
      fare=null;
      min=null;
      label=s.label;
      detail=s.detail;
    } else if (s.mode==='ayala_bus' || s.mode==='ayala_p2p' || s.mode==='ayala_uv') {
      fare=null;
      min=null;
      label=`${s.service}: ${s.from} -> ${s.to}`;
      detail=`Schedule: ${s.schedule} | Stops: ${s.stops} | Fare and travel time not stored; verify at One Ayala Terminal / Iskedyul: ${s.schedule} | Mga hintuan: ${s.stops} | Hindi naka-save ang pamasahe at oras ng biyahe; kumpirmahin sa One Ayala Terminal`;
    } else if (s.mode==='p2p') {
      fare=s.fare||0;
      min=Math.ceil((s.min||40)*(isPeak?1.3:1));
      label=`${s.bus||'P2P Bus'}: ${s.from} → ${s.to}`;
      detail=`${s.note||'Air-conditioned · Fixed fare · No stops'}${isPeak?' · May be delayed due to traffic':''} / Kumpirmahin ang karatula at pamasahe bago sumakay${isPeak?' · Maaaring maantala dahil sa trapiko':''}.`;
    }
    return {...s, fare, min, label, detail};
  });

  const filteredSegs = segs.filter(s => !s.from || !s.to || s.from !== s.to);

  return {...p, segments:filteredSegs,
    totalFare: filteredSegs.some(s => s.fare === null) ? null : filteredSegs.reduce((a,s)=>a+s.fare,0),
    totalMin:  filteredSegs.some(s => s.min === null) ? null : filteredSegs.reduce((a,s)=>a+s.min,0),
    isPeak};
}

// ── STAGE 4: get_context ──────────────────────────
function getContext(readPaths) {
  const modePenalty = (segment) => {
    if (segment.mode === 'walk') return 0;
    if (['MRT-3', 'LRT-1', 'LRT-2'].includes(segment.mode)) return 1;
    if (segment.mode === 'carousel') return 2;
    if (['premium_p2p', 'p2p', 'ayala_p2p', 'ayala_bus'].includes(segment.mode)) return 3;
    if (['uv', 'guided_uv', 'ayala_uv'].includes(segment.mode)) return 4;
    if (['jeepney', 'guided_jeep'].includes(segment.mode)) return 5;
    return 4;
  };
  const scorePath = (path) => {
    const unknownFarePenalty = path.totalFare === null ? 18 : 0;
    const unknownTimePenalty = path.totalMin === null ? 22 : 0;
    const fallbackPenalty = path.type === 'fallback_terminal' ? 12 : 0;
    const transferPenalty = (path.transfers || 0) * 14;
    const timeScore = path.totalMin === null ? 0 : path.totalMin * 0.35;
    const fareScore = path.totalFare === null ? 0 : path.totalFare * 0.05;
    const modeScore = (path.segments || []).reduce((sum, segment) => sum + modePenalty(segment), 0);
    return transferPenalty + unknownFarePenalty + unknownTimePenalty + fallbackPenalty + timeScore + fareScore + modeScore;
  };
  const ranked = [...readPaths].sort((a, b) => scorePath(a) - scorePath(b));
  return {
    allPaths: ranked,
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

  const m = message.match(/(?:from\s+)?(.+?)\s+to\s+(.+?)(?:$|\s+[₱p]\d|\s+need|\s+by\s+\d)/i);
  if (m) {
    const rawOrigin = m[1].replace(/^(from|sa|paano|how.*go|how.*get)\s+/i,'').trim();
    const rawDest   = m[2].trim().replace(/[,.?!]+$/,'');
    const questionPhrases = /^(how|what|where|when|why|can|is|are|do|does|i|we|you)\b/i;
    if (!questionPhrases.test(rawOrigin)) {
      origin      = rawOrigin;
      destination = rawDest;
    }
  }

  return { origin, destination, isPeak };
}

function findKnownPlaceMention(message) {
  const clean = normalizeForRetrieval(message);
  const matches = [];
  for (const [alias, name] of Object.entries(DB.aliases)) {
    const normalizedAlias = normalizeForRetrieval(alias);
    if (normalizedAlias.length >= 3 && new RegExp(`\\b${normalizedAlias.replace(/\s+/g, '\\s+')}\\b`).test(clean)) {
      matches.push({ alias, name, length: normalizedAlias.length });
    }
  }
  for (const area of Object.keys(DB.areas)) {
    const normalizedArea = normalizeForRetrieval(area);
    if (new RegExp(`\\b${normalizedArea.replace(/\s+/g, '\\s+')}\\b`).test(clean)) {
      matches.push({ alias: area, name: area, length: normalizedArea.length });
    }
  }
  return matches.sort((a, b) => b.length - a.length)[0] || null;
}

function parsePartialRouteInput(message) {
  const fullRoute = parseUserInput(message);
  if (fullRoute.origin && fullRoute.destination) return null;

  const hasRouteIntent = /\b(to|papunta|punta|goin|going|from|paano|how.*go|how.*get|how.*reach|directions?|route|commute|sakay)\b/i.test(message);
  const isWeatherIntent = /\b(weather|rain|ulan|uulan|forecast|temperature|init|mainit)\b/i.test(message);
  if (!hasRouteIntent || isWeatherIntent) return null;

  const destinationMatch = message.match(/\b(?:to|papunta(?:ng)?|punta(?:ng)? sa|going to|go to)\s+(.+?)(?:[,.?!]|$)/i);
  if (destinationMatch && !/\bfrom\b/i.test(message)) {
    const place = findKnownPlaceMention(destinationMatch[1]);
    if (place) return { missing: 'origin', destination: place.name };
  }

  const originMatch = message.match(/\bfrom\s+(.+?)(?:[,.?!]|$)/i);
  if (originMatch && !/\bto\b/i.test(message)) {
    const place = findKnownPlaceMention(originMatch[1]);
    if (place) return { missing: 'destination', origin: place.name };
  }

  const place = findKnownPlaceMention(message);
  if (place && /\b(how|paano|directions?|route|commute|sakay|punta)\b/i.test(message)) {
    return { missing: 'origin', destination: place.name };
  }

  return null;
}

function buildMissingDetailReply(partial) {
  if (!partial) return null;
  if (partial.missing === 'origin') {
    return `I can plan that trip. Where will you be coming from?\nKaya kong i-plano ang biyaheng iyan. Saan ka manggagaling?`;
  }
  if (partial.missing === 'destination') {
    return `I can help with that. Where do you want to go from ${partial.origin}?\nMatutulungan kita diyan. Saan mo gustong pumunta mula ${partial.origin}?`;
  }
  return null;
}

// ── BUILD ROUTE JSON ──────────────────────────────
function completeRouteFromConversation(message, history = []) {
  const fullRoute = parseUserInput(message);
  if (fullRoute.origin && fullRoute.destination) return fullRoute;

  const currentPartial = parsePartialRouteInput(message);
  const currentPlace = findKnownPlaceMention(message);
  if (!currentPartial && !currentPlace) return null;

  const currentOrigin = currentPartial?.origin ||
    (/\b(from|coming from|galing|manggagaling)\b/i.test(message) ? currentPlace?.name : null);
  const currentDestination = currentPartial?.destination ||
    (/\b(to|going to|go to|papunta|punta)\b/i.test(message) ? currentPlace?.name : null);

  const userMessages = history
    .filter(item => item.role === 'user')
    .map(item => item.text || item.parts?.[0]?.text || '')
    .map(text => text.replace(/ROUTE_JSON:[\s\S]*/,'').replace(/CITATIONS_JSON:[\s\S]*/,'').trim())
    .filter(Boolean);

  for (let index = userMessages.length - 1; index >= 0; index -= 1) {
    const previousPartial = parsePartialRouteInput(userMessages[index]);
    if (!previousPartial) continue;

    if (previousPartial.missing === 'origin' && currentOrigin) {
      return { origin: currentOrigin, destination: previousPartial.destination, isPeak: fullRoute.isPeak };
    }

    if (previousPartial.missing === 'destination' && currentDestination) {
      return { origin: previousPartial.origin, destination: currentDestination, isPeak: fullRoute.isPeak };
    }
  }

  return null;
}

const ALTERNATIVE_INTENT_RE = /more options?|other options?|alternative|another (way|route|option)|second (way|route|option)|different (way|route|option)|ibang route|may iba pa|iba pa|ibang (paraan|sakay)|any other/i;

function parseAlternativeTarget(message) {
  if (!ALTERNATIVE_INTENT_RE.test(message)) return null;
  const target = message.match(/\b(?:for|from)\s+(.+?)\s+to\s+(.+?)(?:\s*[,.?!]|$)/i);
  if (!target) return null;
  return {
    origin: target[1].trim(),
    destination: target[2].trim().replace(/\s+(please|pls)$/i, '')
  };
}

function buildRouteJson(context, origin, destination) {
  const rec = context.recommended;
  if (!rec) return null;
  return {
    title: `${rec.displayOrigin || origin} → ${rec.displayDestination || destination}`,
    transfers: rec.transfers,
    totalFare: rec.totalFare,
    totalMin: rec.totalMin,
    steps: rec.segments.map(s => ({
      type: s.mode==='MRT-3'   ? 'mrt'  :
            s.mode==='LRT-1' || s.mode==='LRT-2' ? 'lrt' :
            s.mode==='carousel' ? 'bus' :
            s.mode==='premium_p2p' ? 'p2p' :
            s.mode==='uv' || s.mode==='ayala_uv' || s.mode==='guided_uv' ? 'uv' :
            s.mode==='ayala_bus' || s.mode==='ayala_p2p' || s.mode==='guided_bus' ? 'bus' :
            s.mode==='p2p'   ? 'bus'  :
            s.mode==='jeepney' || s.mode==='guided_jeep' ? 'jeep' :
            s.mode==='guided_lrt' ? 'lrt' :
            s.mode==='guided_terminal' ? 'terminal' :
            s.mode==='guided_shuttle' ? 'shuttle' :
            s.mode==='guided_tricycle' ? 'tricycle' :
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
"second option", "ibang route", "may iba pa", "alternatives".
If yes, output ONLY: SHOW_ALTERNATIVES

STEP 2 — Check if the user is asking about weather for a specific location and time.
Weather question examples: "will it rain in MOA at 6pm?", "papatak ba ulan sa BGC mamaya?",
"what's the weather like in Makati tonight?", "uulan ba bukas 4pm sa makati?".
If yes, output ONLY: WEATHER_QUERY: location="X" date="today|tomorrow|YYYY-MM-DD|unspecified" time="6pm|unspecified"
Use date="tomorrow" for "tomorrow" or "bukas", and date="today" for "today", "ngayon", or "mamaya".
Use time="now" for a current-conditions question using "now" or "ngayon" without a stated hour.
Use time="unspecified" for a future-date question with no specific time. Do not change a request for tomorrow into today.

STEP 3 — Check if the user wants a brand-new route (different origin/destination).
If yes, extract origin and destination and output ONLY:
ROUTE_READY: origin="X" destination="Y"

STEP 4 — For any normal message shown to the user, reply in TWO short sentences:
one sentence in English followed by the matching sentence in Filipino/Tagalog.
If the request is outside Metro Manila commuting, state that you can only help with Metro Manila commutes and ask if the user needs directions somewhere.
If the user wants directions but you cannot determine the origin or destination, ask for the missing locations.
Do not apply this bilingual format to the control outputs SHOW_ALTERNATIVES, WEATHER_QUERY, or ROUTE_READY.

Known Manila landmarks:
- "One Ayala", "Ayala Center", "Glorietta", "Greenbelt" = Makati
- "MOA", "Mall of Asia", "SM MOA" = MOA
- "BGC", "Bonifacio", "Fort" = BGC
- "Pasay", "Pasay Rotonda", "Taft Avenue Station" = Pasay Rotonda for Cavite-bound routes
- "Bacoor", "SM Bacoor" = Bacoor, Cavite
- "Dasma", "Dasmarinas" = Dasmarinas, Cavite
- "Imus", "Molino", "SM Molino", "Tagaytay", "Trece Martires" = Cavite destinations
- "Arca South", "Arca South Taguig" = Arca South
- "FTI", "FTI Terminal" = FTI
- "DLSU", "Taft Ave", "Vito Cruz" = Taft area`;

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

function buildForecastAnswer(location, forecast) {
  const englishDate = /^(today|tomorrow),/.test(forecast.displayDate)
    ? forecast.displayDate
    : `on ${forecast.displayDate}`;
  let tagalogDate = `sa ${forecast.displayDate}`;
  if (forecast.displayDate.startsWith('tomorrow,')) {
    tagalogDate = `bukas, ${forecast.displayDate.replace(/^tomorrow,\s*/, '')}`;
  } else if (forecast.displayDate.startsWith('today,')) {
    tagalogDate = `ngayong araw, ${forecast.displayDate.replace(/^today,\s*/, '')}`;
  }
  const englishRain = forecast.isRainy
    ? ' Rain is expected; please bring an umbrella.'
    : ' Rain is not expected around this time.';
  const tagalogRain = forecast.isRainy
    ? ' May inaasahang ulan; magdala ng payong.'
    : ' Walang inaasahang ulan sa mga oras na ito.';
  if (forecast.requestedTime && forecast.requestedTime !== forecast.displayTime) {
    return `Forecast for ${location} ${englishDate}:\nThe closest available forecast to your requested time of ${forecast.requestedTime} is for ${forecast.displayTime}: ${forecast.description}, about ${forecast.temp}°C.${englishRain}\n\nTaya ng panahon sa ${location} ${tagalogDate}:\nAng pinakamalapit na available na forecast sa hiniling mong oras na ${forecast.requestedTime} ay para sa ${forecast.displayTime}: ${forecast.description}, humigit-kumulang ${forecast.temp}°C.${tagalogRain}`;
  }
  const englishWhen = forecast.displayTime === 'now'
    ? `${englishDate} right now`
    : `${englishDate} at ${forecast.displayTime}`;
  const tagalogWhen = forecast.displayTime === 'now'
    ? `${tagalogDate} sa ngayon`
    : `${tagalogDate} nang ${forecast.displayTime}`;
  return `Forecast for ${location} ${englishWhen}: ${forecast.description}, about ${forecast.temp}°C.${englishRain}\nTaya ng panahon sa ${location} ${tagalogWhen}: ${forecast.description}, humigit-kumulang ${forecast.temp}°C.${tagalogRain}`;
}

// ── SERVER ────────────────────────────────────────
const server = http.createServer(async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin','*');
  res.setHeader('Access-Control-Allow-Headers','Content-Type');
  if (req.method==='OPTIONS') { res.writeHead(204); res.end(); return; }

  if (req.method==='POST' && req.url.startsWith('/api/chat')) {
    try {
      const { message, history=[] } = await readBody(req);

      const premiumP2PList = buildPremiumP2PListReply(message);
      if (premiumP2PList) {
        sendJson(res, 200, { type:'chat', text: premiumP2PList });
        return;
      }

      const carouselRouteList = buildCarouselRouteListReply(message);
      if (carouselRouteList) {
        sendJson(res, 200, { type:'chat', text: carouselRouteList });
        return;
      }

      const referenceReply = buildReferenceKnowledgeReply(message);
      if (referenceReply) {
        sendJson(res, 200, { type:'chat', text: referenceReply });
        return;
      }

      // Direct route requests should use stored routes before AI triage, including in ongoing chats.
      // Alternative requests are handled from history below so named trips can select their second path.
      const isFollowUpIntent = ALTERNATIVE_INTENT_RE.test(message);
      const completedFromMemory = isFollowUpIntent ? null : completeRouteFromConversation(message, history);
      const quickParse = isFollowUpIntent
        ? { origin: null, destination: null }
        : completedFromMemory || parseUserInput(message);

      if (quickParse.origin && quickParse.destination) {
        const resolved = resolveLocations(quickParse.origin, quickParse.destination);
        const paths = getAutonomousCandidatePaths(resolved);
        if (paths.length > 0) {
          const isPeak = /\b(7am|8am|5pm|6pm|7pm|rush|peak|morning rush|umaga)\b/.test(message.toLowerCase());
          const readPaths = paths.map(p => readPath(p, isPeak));
          const context = getContext(readPaths);
          const evidence = retrieveRouteEvidence(resolved, readPaths, message);
          const routeJson = buildRouteJson(context, resolved.originDisplay, resolved.destinationDisplay);

          const weather = await getWeather(resolved.destination);

          const weatherNote = buildWeatherNote(weather);
          const evidenceContext = evidence.matches.map(entry => `${entry.source}: ${entry.summary}`).join(' ');
          const introContext = `Route: ${resolved.originDisplay} to ${resolved.destinationDisplay}. Transfers: ${context.recommended.transfers}. ${weatherNote} Retrieved evidence: ${evidenceContext}`.trim();

          const intro = await callGemini(NARRATION_PROMPT, introContext, [])
            .catch(() => `Here's your route from ${resolved.originDisplay} to ${resolved.destinationDisplay}!\nNarito ang ruta mo mula ${resolved.originDisplay} papuntang ${resolved.destinationDisplay}!`);

          sendJson(res, 200, { type:'route', text:`${intro.trim()}\n\nROUTE_JSON:\n${JSON.stringify(routeJson)}${buildEvidenceNote(evidence)}` });
          return;
        }
      }

      // ── Triage via Gemini ──
      const partialRoute = parsePartialRouteInput(message);
      const missingDetailReply = buildMissingDetailReply(partialRoute);
      if (missingDetailReply) {
        sendJson(res, 200, { type:'chat', text: missingDetailReply });
        return;
      }

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
            console.warn('TRIAGE UNAVAILABLE:', triageError || 'no response');
            sendJson(res, 200, { type:'chat', text: `We're having trouble processing your request right now. Please try again.\nNahihirapan kaming iproseso ang request mo ngayon. Pakisubukan muli.` });
            return;
          }
        }
      }

      // ── Handle WEATHER_QUERY ──
      const weatherQueryMatch = triageReply.match(/WEATHER_QUERY:\s*location="([^"]+)"(?:\s+date="([^"]+)")?\s+time="([^"]+)"/i);
      if (weatherQueryMatch) {
        const weatherLocation = weatherQueryMatch[1].trim();
        const weatherDateStr  = (weatherQueryMatch[2] || '').trim();
        const weatherTimeStr  = weatherQueryMatch[3].trim();

        // Resolve the location using the existing alias system
        const resolvedLocation = resolveLocations(weatherLocation, weatherLocation).origin;
        const requestedDate = parseTargetDate(`${message} ${weatherDateStr}`);
        const requestedHour = parseTargetHour(message) ?? parseTargetHour(weatherTimeStr);
        const todayKey = getPhDateKey(0);
        const requestsCurrentConditions =
          weatherTimeStr.toLowerCase() === 'now' &&
          (!requestedDate || requestedDate.dateKey === todayKey);

        let forecastResult = null;
        if (requestsCurrentConditions) {
          forecastResult = await getWeather(resolvedLocation);
          if (forecastResult) {
            forecastResult.displayTime = 'now';
            forecastResult.displayDate = formatPhForecastDate(todayKey, 'today');
          }
        } else {
          forecastResult = await getWeatherForecast(
            resolvedLocation,
            requestedHour,
            requestedDate?.dateKey || null,
            requestedDate?.displayDate || ''
          );
        }

        if (!forecastResult) {
          sendJson(res, 200, { type:'chat', text: `Sorry, I cannot retrieve weather data for ${resolvedLocation} right now. Please try again later.\nPaumanhin, hindi ko makuha ang datos ng panahon para sa ${resolvedLocation} ngayon. Pakisubukan muli mamaya.` });
          return;
        }

        sendJson(res, 200, { type:'chat', text: buildForecastAnswer(resolvedLocation, forecastResult) });
        return;
      }

      // ── Handle SHOW_ALTERNATIVES ──
      if (/SHOW_ALTERNATIVES/i.test(triageReply)) {
        const historyMessages = history.map(m => m.text||m.parts?.[0]?.text||'');
        const userHistoryMessages = history
          .filter(m => m.role === 'user')
          .map(m => m.text||m.parts?.[0]?.text||'');
        const requestedTrip = parseAlternativeTarget(message);
        let previousRequest = requestedTrip;
        let previousRequestIndex = -1;
        if (!previousRequest) {
          for (let index = userHistoryMessages.length - 1; index >= 0; index -= 1) {
            const parsed = parseUserInput(userHistoryMessages[index]);
            if (parsed.origin && parsed.destination) {
              previousRequest = parsed;
              previousRequestIndex = index;
              break;
            }
          }
        }
        const historyText = historyMessages.join('\n');
        const prevRoute = historyText.match(/([^\n]+?)\s*→\s*([^\n]+?)(?:\n|\\n|$)/m);
        const altResolved = previousRequest
          ? resolveLocations(previousRequest.origin, previousRequest.destination)
          : prevRoute
            ? resolveLocations(prevRoute[1].trim(), prevRoute[2].trim())
            : null;

        if (altResolved) {
          const altPaths = getAutonomousCandidatePaths(altResolved);
          if (altPaths.length > 1) {
            const fullContext = [...history.map(m => m.text||''), message].join(' ');
            const isPeak = /\b(7am|8am|5pm|6pm|7pm|rush|peak|morning rush|umaga)\b/.test(fullContext.toLowerCase());
            const readPaths = altPaths.map(p => readPath(p, isPeak));
            const rankedReadPaths = getContext(readPaths).allPaths;
            const priorAlternativeRequests = requestedTrip
              ? 0
              : userHistoryMessages
                  .slice(previousRequestIndex + 1)
                  .filter(text => ALTERNATIVE_INTENT_RE.test(text))
                  .length;
            const alts = rankedReadPaths.slice(priorAlternativeRequests + 1);
            if (alts.length > 0) {
              const altContext = getContext(alts);
              const evidence = retrieveRouteEvidence(altResolved, alts, message);
              const altJson = buildRouteJson(altContext, altResolved.originDisplay, altResolved.destinationDisplay);

              const weather = await getWeather(altResolved.destination);

              const weatherNote = buildWeatherNote(weather);
              const evidenceContext = evidence.matches.map(entry => `${entry.source}: ${entry.summary}`).join(' ');
              const introContextAlt = `Alternative route: ${altResolved.originDisplay} to ${altResolved.destinationDisplay}. ${weatherNote} Retrieved evidence: ${evidenceContext}`.trim();

              const intro = await callGemini(NARRATION_PROMPT, introContextAlt, triageHistory)
                .catch(() => `Here's another option for you!\nNarito ang isa pang maaari mong daanan!`);
              sendJson(res, 200, { type:'route', text:`${intro.trim()}\n\nROUTE_JSON:\n${JSON.stringify(altJson)}${buildEvidenceNote(evidence)}` });
              return;
            }
          }
        }
        sendJson(res, 200, { type:'chat', text: `Sorry, I do not have another route option for that trip yet.\nPaumanhin, wala pa akong ibang opsyon ng ruta para sa biyaheng iyon.` });
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

      const paths = getAutonomousCandidatePaths(resolved);
      console.log('ROUTE PATHS:', paths.map(p => p.description));

      if (paths.length === 0) {
        const knownPlaceNames = {
          MOA: 'Mall of Asia (MOA)',
          PITX: 'PITX',
          BGC: 'BGC',
          Bacoor: 'Bacoor',
          Dasmarinas: 'Dasmarinas'
        };
        const originSuggestion = knownPlaceNames[resolved.origin] || resolved.origin;
        const destinationSuggestion = knownPlaceNames[resolved.destination] || resolved.destination;
        const reply = await callGemini(
          `You are SakayAI. A requested route is not implemented in the current system.
           Reply using exactly these two sentence patterns, replacing only the place values:
           Sorry, I couldn't find a route between ORIGIN and DESTINATION. Are you trying to say 'ORIGIN_SUGGESTION' or 'DESTINATION_SUGGESTION'? I might not support that exact route yet.
           Paumanhin, hindi ako makahanap ng ruta sa pagitan ng ORIGIN at DESTINATION. Ang ibig mo bang sabihin ay 'ORIGIN_SUGGESTION' o 'DESTINATION_SUGGESTION'? Maaaring hindi ko pa suportado ang eksaktong rutang iyon.
           Do not suggest simpler area names and do not add any other sentence.`,
          `ORIGIN=${resolved.origin}; DESTINATION=${resolved.destination}; ORIGIN_SUGGESTION=${originSuggestion}; DESTINATION_SUGGESTION=${destinationSuggestion}`, triageHistory
        ).catch(() => `No route found between "${resolved.origin}" and "${resolved.destination}". I might not support that exact route yet.\nWalang nahanap na ruta sa pagitan ng "${resolved.origin}" at "${resolved.destination}". Maaaring hindi ko pa suportado ang eksaktong rutang iyon.`);
        sendJson(res, 200, { type:'chat', text: reply });
        return;
      }

      const readPaths = paths.map(p => readPath(p, isPeak));
      console.log('ROUTE DETAILS:', readPaths.map(p => ({ id: p.id, fare: p.totalFare, min: p.totalMin })));

      const context = getContext(readPaths);
      const evidence = retrieveRouteEvidence(resolved, readPaths, message);

      const routeJson = buildRouteJson(context, resolved.originDisplay, resolved.destinationDisplay);

      const weather = await getWeather(resolved.destination);

      const weatherNote = buildWeatherNote(weather);
      const evidenceContext = evidence.matches.map(entry => `${entry.source}: ${entry.summary}`).join(' ');
      const introContext = `Route: ${resolved.originDisplay} to ${resolved.destinationDisplay}. Transfers: ${context.recommended.transfers}. ${weatherNote} Retrieved evidence: ${evidenceContext}`.trim();

      const intro = await callGemini(NARRATION_PROMPT, introContext, triageHistory)
        .catch(() => `Here's your route from ${resolved.originDisplay} to ${resolved.destinationDisplay}!\nNarito ang ruta mo mula ${resolved.originDisplay} papuntang ${resolved.destinationDisplay}!`);

      sendJson(res, 200, {
        type: 'route',
        text: `${intro.trim()}\n\nROUTE_JSON:\n${JSON.stringify(routeJson)}${buildEvidenceNote(evidence)}` });

    } catch(e) {
      console.error('REQUEST ERROR:', e.message || e);
      sendJson(res, 500, { error: `We're having trouble processing your request right now. Please try again.\nNahihirapan kaming iproseso ang request mo ngayon. Pakisubukan muli.` });
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
server.on('error', (error) => {
  if (error.code === 'EADDRINUSE') {
    console.error(`Port ${PORT} is already in use. Stop the existing server or set a different PORT in .env.`);
    process.exitCode = 1;
    return;
  }
  throw error;
});

server.listen(PORT, () => {
  console.log(`\n  SakayAI running → http://localhost:${PORT}\n`);
  if (!process.env.GEMINI_API_KEY)      console.warn('  ⚠  GEMINI_API_KEY not set in .env!\n');
  if (!process.env.OPENWEATHER_API_KEY) console.warn('  ⚠  OPENWEATHER_API_KEY not set in .env (weather disabled)\n');
});
