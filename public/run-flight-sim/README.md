# Flight Sim WASM Assets

`FlightSim.data` is intentionally excluded from git because GitHub blocks files larger than 100 MB.

## Local development

Keep a local copy at:

`public/run-flight-sim/FlightSim.data`

It will load automatically when opening:

`/run-flight-sim/flight-sim.html`

## Production with external data URL

Host `FlightSim.data` on external storage/CDN and pass its URL:

`/run-flight-sim/flight-sim.html?dataUrl=https%3A%2F%2Fexample.com%2FFlightSim.data`

The page uses `Module.locateFile` to load `FlightSim.data` from that URL while keeping `FlightSim.js` and `FlightSim.wasm` local.
