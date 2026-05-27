# SaanPH

SaanPH is a small Metro Manila commute planner web app. It lets a user type a route like `Paranaque to Cubao`, then returns a suggested commute route using the route data and logic inside `server.js`.

The app has a single-page frontend in `index.html` and a Node.js backend in `server.js`. The backend serves the page, handles chat requests, computes routes from local route data, and can call Gemini for short natural-language replies.

## Features

- Simple chat-style commute planner
- Name-entry welcome screen before opening the planner
- Example route buttons on the home screen
- Local route matching for known Metro Manila areas and landmarks
- Route cards with step-by-step commute instructions
- Support for MRT-3, LRT-1, LRT-2, jeepney, UV Express, bus/P2P, and walking steps where available in the local data
- Follow-up support for alternative routes
- Weather answers for supported areas when `OPENWEATHER_API_KEY` is set
- Philippine-inspired frontend styling in one HTML file
- Mobile sidebar drawer for smaller screens

## Tech Stack

- HTML, CSS, and plain JavaScript for the frontend
- Node.js built-in `http`, `https`, `fs`, and `path` modules for the backend
- `dotenv` for loading environment variables from `.env`
- Gemini API for chat, triage, and route narration
- OpenWeatherMap API for current weather and forecast lookups

There is no frontend framework, database, or build tool in this project.

## Installation / Setup

1. Install Node.js if it is not installed yet.
2. Install the project dependency:

```bash
npm install
```

3. Create a `.env` file in the project root.

The app expects these values:

```env
GEMINI_API_KEY=your_gemini_api_key
OPENWEATHER_API_KEY=your_openweather_api_key
PORT=3000
```

`PORT` is optional. If it is not set, the server uses port `3000`.

## How To Run

Start the server:

```bash
npm start
```

Then open:

```text
http://localhost:3000/
```

The backend serves `index.html` directly, so there is no separate frontend dev server.

## Folder Structure

```text
.
|-- index.html          # Frontend UI, styles, and browser-side JavaScript
|-- assets/             # Landing-page illustration asset
|-- server.js           # Node.js server, route data, routing logic, API handler
|-- package.json        # Project metadata and npm scripts
|-- package-lock.json   # Locked npm dependency versions
|-- .env                # Local API keys, not committed
`-- node_modules/       # Installed dependencies
```

## Environment Variables

### `GEMINI_API_KEY`

Required for the main chat flow. The backend calls Gemini using:

```text
gemini-2.5-flash-lite
```

If this is missing, route requests that need Gemini narration or triage can return an error.

### `OPENWEATHER_API_KEY`

Optional. Used for weather-related answers and destination weather notes.

If this is missing, the server still runs, but weather is disabled.

### `PORT`

Optional. Controls the local server port.

Default:

```text
3000
```

## Backend Overview

The backend is in `server.js`.

It does two main things:

1. Serves static files like `index.html`.
2. Handles `POST /api/chat`.

### `POST /api/chat`

The frontend sends the latest user message and conversation history to this endpoint.

The server then:

- Parses route requests when possible
- Resolves aliases like `moa`, `bgc`, `cubao`, `makati`, and similar names
- Builds possible paths from local route data
- Reads fare/time details for each path
- Picks a route from the available paths
- Builds route JSON for the frontend route card
- Calls Gemini to write a short friendly intro when needed
- Handles weather questions if OpenWeatherMap is configured

The route data is stored directly in `server.js`, not in a database.

UV Express routes in the current data set use terminal pairs and listed fares reported by The Poor Traveler from an LTFRB list dated November 23, 2020. The app marks these as reference fares because they are not live fare data. Moovit lists UV Express services in Manila, but live schedules and fare updates are not integrated into this project.

## Known Limitations

- Route coverage is limited to the areas and routes manually listed in `server.js`.
- Fare and travel time data are hardcoded, so they can become outdated.
- UV Express fare references are based on a November 2020 route list and should be checked before travel.
- The app needs `GEMINI_API_KEY` for the full chat experience.
- Weather depends on OpenWeatherMap and may fail if the API key is missing or the request times out.
- There is no user login, saved history, or database.
- The frontend is all in one `index.html`, so the file is fairly large.
- The routing logic is useful for demos and simple planning, but it should not be treated as an official transit source.

## Future Improvements

- Move route data into separate JSON files
- Add more Metro Manila routes and landmarks
- Add tests for route parsing and path generation
- Show fare and estimated time summaries more clearly in the UI
- Add loading/error states for weather separately from routing
- Split frontend CSS and JavaScript into separate files
- Add a way to update route data without editing `server.js`
