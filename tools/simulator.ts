/* eslint-disable @typescript-eslint/no-unused-vars */
import axios from 'axios';

// ⚙️ Configuration
const DRIVER_COUNT = 50;
const TICK_RATE_MS = 2000; // Update every 2 seconds
const INGESTION_URL = 'http://localhost:3001/ingestion/location';

// 📍 Center of New York City (Starting Point)
const CENTER_LAT = 40.73061;
const CENTER_LNG = -73.935242;

// 🚙 Interface
interface Driver {
  id: string;
  lat: number;
  lng: number;
}

// 1. Initialize Drivers with random starting positions
const drivers: Driver[] = [];

console.log(`🚀 Initializing ${DRIVER_COUNT} drivers around NYC...`);

for (let i = 1; i <= DRIVER_COUNT; i++) {
  drivers.push({
    id: `driver-${i.toString().padStart(3, '0')}`, // e.g., driver-001, driver-005
    // Random offset: (Math.random() - 0.5) * 0.05 gives a ~5km spread
    lat: CENTER_LAT + (Math.random() - 0.5) * 0.05,
    lng: CENTER_LNG + (Math.random() - 0.5) * 0.05,
  });
}

// 2. The Movement Logic (Brownian Motion)
const moveDriver = (driver: Driver) => {
  // Move by a tiny random amount (approx 10-50 meters)
  // eslint-disable-next-line prettier/prettier
  driver.lat += (Math.random() - 0.5) * 0.001; 
  driver.lng += (Math.random() - 0.5) * 0.001;
};

// 3. The Game Loop
const tick = async () => {
  const promises = drivers.map(async (driver) => {
    moveDriver(driver);

    try {
      await axios.post(INGESTION_URL, {
        driverId: driver.id,
        lat: driver.lat,
        lng: driver.lng,
      });
    } catch (error) {
      console.error(
        `❌ Failed to update ${driver.id}: is Ingestion Service running?`,
      );
    }
  });

  await Promise.all(promises);
  console.log(
    `📡 [${new Date().toLocaleTimeString()}] Updated ${DRIVER_COUNT} drivers.`,
  );
};

// Start the Loop
// eslint-disable-next-line @typescript-eslint/no-misused-promises
setInterval(tick, TICK_RATE_MS);
console.log('🤖 Simulation started! Press Ctrl+C to stop.');
