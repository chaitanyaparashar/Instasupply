import {ORS_API_KEY} from '../config/env';

const BASE_URL = 'https://api.openrouteservice.org';

type Coordinate = [number, number]; // [longitude, latitude]

export type OptimizationResult = {
  orderedIndices: number[];
  geometry: Coordinate[];
};

export async function optimizeRoute(
  driverLocation: {latitude: number; longitude: number},
  stops: Array<{latitude: number; longitude: number}>,
): Promise<OptimizationResult> {
  if (stops.length === 0) {
    return {orderedIndices: [], geometry: []};
  }

  if (stops.length === 1) {
    const dirGeometry = await getDirections([
      [driverLocation.longitude, driverLocation.latitude],
      [stops[0].longitude, stops[0].latitude],
    ]);
    return {orderedIndices: [0], geometry: dirGeometry};
  }

  const vehicles = [
    {
      id: 1,
      profile: 'driving-car',
      start: [driverLocation.longitude, driverLocation.latitude],
    },
  ];

  const jobs = stops.map((stop, index) => ({
    id: index + 1,
    location: [stop.longitude, stop.latitude] as Coordinate,
  }));

  const response = await fetch(`${BASE_URL}/optimization`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: ORS_API_KEY,
    },
    body: JSON.stringify({vehicles, jobs}),
  });

  if (!response.ok) {
    throw new Error(`ORS optimization failed: ${response.status}`);
  }

  const data = await response.json();
  const route = data.routes[0];
  const orderedIndices: number[] = route.steps
    .filter((step: any) => step.type === 'job')
    .map((step: any) => step.job - 1);

  // Get directions polyline for the optimized order
  const orderedCoords: Coordinate[] = [
    [driverLocation.longitude, driverLocation.latitude],
    ...orderedIndices.map(
      i => [stops[i].longitude, stops[i].latitude] as Coordinate,
    ),
  ];

  const geometry = await getDirections(orderedCoords);
  return {orderedIndices, geometry};
}

async function getDirections(
  coordinates: Coordinate[],
): Promise<Coordinate[]> {
  const response = await fetch(
    `${BASE_URL}/v2/directions/driving-car/geojson`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: ORS_API_KEY,
      },
      body: JSON.stringify({coordinates}),
    },
  );

  if (!response.ok) {
    throw new Error(`ORS directions failed: ${response.status}`);
  }

  const data = await response.json();
  return data.features[0].geometry.coordinates;
}
