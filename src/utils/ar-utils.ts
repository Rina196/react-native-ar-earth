export type Vec3 = {
  x: number;
  y: number;
  z: number;
};

export type LocationInfo = {
  country?: string;
  state?: string;
  city?: string;
  name?: string;
};

export type EarthLocationPoint = {
  id: string;
  latitude: number;
  longitude: number;
  stateName?: string;
};

export type MarkerLine = {
  start: [number, number, number];
  end: [number, number, number];
};

export type Position = [number, number];

export type LinearRing = Position[];

export type PolygonCoordinates = LinearRing[];

export type MultiPolygonCoordinates = PolygonCoordinates[];

export type GeoFeatureGeometry =
  | {
      type: 'Polygon';
      coordinates: PolygonCoordinates;
    }
  | {
      type: 'MultiPolygon';
      coordinates: MultiPolygonCoordinates;
    }
  | {
      type: string;
      coordinates: unknown;
    };

export type GeoFeature = {
  type: string;

  properties: {
    shapeName?: string;
    shapeID?: string;
    shapeGroup?: string;
    shapeType?: string;
    [key: string]: unknown;
  };

  geometry: GeoFeatureGeometry;
};

export type GeoFeatureCollection = {
  type: string;
  features: GeoFeature[];
};

export async function getLocationName(
  latitude: number,
  longitude: number
): Promise<LocationInfo | undefined> {
  try {
    const response = await fetch(
      `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${latitude}&lon=${longitude}`
    );

    const data = await response.json();

    return {
      country: data.address?.country,
      state: data.address?.state,
      city: data.address?.city || data.address?.town || data.address?.village,
      name: data.display_name,
    };
  } catch (error) {
    console.log('getLocationName error:', error);
    return undefined;
  }
}

export function normalizeVector(vector: Vec3): Vec3 {
  const length = Math.sqrt(
    vector.x * vector.x + vector.y * vector.y + vector.z * vector.z
  );

  if (length === 0) {
    return { x: 0, y: 0, z: 0 };
  }

  return {
    x: vector.x / length,
    y: vector.y / length,
    z: vector.z / length,
  };
}

export function rayDirection(rayOrigin: Vec3, target: Vec3): Vec3 {
  return normalizeVector({
    x: target.x - rayOrigin.x,
    y: target.y - rayOrigin.y,
    z: target.z - rayOrigin.z,
  });
}

export function intersectRaySphere(
  rayOrigin: Vec3,
  rayDir: Vec3,
  sphereCenter: Vec3,
  sphereRadius: number
): Vec3 | null {
  const oc = {
    x: rayOrigin.x - sphereCenter.x,
    y: rayOrigin.y - sphereCenter.y,
    z: rayOrigin.z - sphereCenter.z,
  };

  const b = 2.0 * (oc.x * rayDir.x + oc.y * rayDir.y + oc.z * rayDir.z);
  const c =
    oc.x * oc.x + oc.y * oc.y + oc.z * oc.z - sphereRadius * sphereRadius;

  const discriminant = b * b - 4 * c;

  if (discriminant < 0) {
    return null;
  }

  const t = (-b - Math.sqrt(discriminant)) / 2.0;

  return {
    x: rayOrigin.x + t * rayDir.x,
    y: rayOrigin.y + t * rayDir.y,
    z: rayOrigin.z + t * rayDir.z,
  };
}

export function surfacePointToLatLng(
  localPoint: Vec3,
  sphereRadius: number
): { latitude: number; longitude: number } {
  const normalized = normalizeVector({
    x: localPoint.x / sphereRadius,
    y: localPoint.y / sphereRadius,
    z: localPoint.z / sphereRadius,
  });

  // IMPORTANT:
  // Your ViroSphere / Earth coordinate system has
  // geographic North opposite to the local +Y direction.
  //
  // Therefore latitude must be inverted.
  const latitude = (-Math.asin(normalized.y) * 180) / Math.PI;

  // Keep your currently-working longitude calculation.
  let longitude = (Math.atan2(normalized.x, -normalized.z) * 180) / Math.PI;

  // Your existing 90° texture/UV alignment correction.
  longitude -= 90;

  if (longitude < -180) {
    longitude += 360;
  }

  if (longitude > 180) {
    longitude -= 360;
  }

  return {
    latitude,
    longitude,
  };
}

// export function surfacePointToLatLng(
//   surfacePoint: Vec3,
//   sphereCenter: Vec3,
//   sphereRadius: number,
// ): { latitude: number; longitude: number } {
//   const localVector = {
//     x: surfacePoint.x - sphereCenter.x,
//     y: surfacePoint.y - sphereCenter.y,
//     z: surfacePoint.z - sphereCenter.z,
//   };

//   const normalized = normalizeVector({
//     x: localVector.x / sphereRadius,
//     y: localVector.y / sphereRadius,
//     z: localVector.z / sphereRadius,
//   });

//   return {
//     latitude: Math.asin(normalized.y) * (180 / Math.PI),
//     longitude: Math.atan2(normalized.x, normalized.z) * (180 / Math.PI),
//   };
// }

function isPointInRing(
  longitude: number,
  latitude: number,
  ring: LinearRing
): boolean {
  let inside = false;

  for (let i = 0, j = ring.length - 1; i < ring.length; j = i++) {
    const current = ring[i];
    const previous = ring[j];

    if (!current || !previous) {
      continue;
    }

    const [xi, yi] = current;
    const [xj, yj] = previous;

    const intersects =
      yi > latitude !== yj > latitude &&
      longitude < ((xj - xi) * (latitude - yi)) / (yj - yi) + xi;

    if (intersects) {
      inside = !inside;
    }
  }

  return inside;
}

function isPointInPolygon(
  longitude: number,
  latitude: number,
  polygon: PolygonCoordinates
): boolean {
  const outerRing = polygon[0];

  if (!outerRing) {
    return false;
  }

  if (!isPointInRing(longitude, latitude, outerRing)) {
    return false;
  }

  // If the point falls inside a hole,
  // it's not inside the actual polygon.
  for (let i = 1; i < polygon.length; i++) {
    const ring = polygon[i];

    if (!ring) {
      continue;
    }

    if (isPointInRing(longitude, latitude, ring)) {
      return false;
    }
  }

  return true;
}

function isPolygonGeometry(
  geometry: GeoFeature['geometry']
): geometry is { type: 'Polygon'; coordinates: PolygonCoordinates } {
  return geometry.type === 'Polygon' && Array.isArray(geometry.coordinates);
}

function isMultiPolygonGeometry(
  geometry: GeoFeature['geometry']
): geometry is { type: 'MultiPolygon'; coordinates: MultiPolygonCoordinates } {
  return (
    geometry.type === 'MultiPolygon' && Array.isArray(geometry.coordinates)
  );
}

export function findStateAtCoordinate(
  latitude: number,
  longitude: number,
  features: GeoFeature[]
): GeoFeature | null {
  for (const feature of features) {
    const { geometry } = feature;

    if (isPolygonGeometry(geometry)) {
      if (isPointInPolygon(longitude, latitude, geometry.coordinates)) {
        return feature;
      }
    }

    if (isMultiPolygonGeometry(geometry)) {
      for (const polygon of geometry.coordinates) {
        if (isPointInPolygon(longitude, latitude, polygon)) {
          return feature;
        }
      }
    }
  }

  return null;
}

export function normalizeGeometry(
  geometry: GeoFeature['geometry']
): PolygonCoordinates[] {
  if (isPolygonGeometry(geometry)) {
    return [geometry.coordinates as PolygonCoordinates];
  }

  if (isMultiPolygonGeometry(geometry)) {
    return geometry.coordinates as MultiPolygonCoordinates;
  }

  return [];
}

// =========================================================
// STATE CENTROID (lat/lon of the largest ring, area-weighted)
// =========================================================

function shoelaceArea(ring: number[][]): number {
  let sum = 0;

  for (let i = 0; i < ring.length - 1; i++) {
    const pointA = ring[i];
    const pointB = ring[i + 1];

    if (!pointA || !pointB) {
      continue;
    }

    const x1 = Number(pointA[0]);
    const y1 = Number(pointA[1]);
    const x2 = Number(pointB[0]);
    const y2 = Number(pointB[1]);

    if (
      !Number.isFinite(x1) ||
      !Number.isFinite(y1) ||
      !Number.isFinite(x2) ||
      !Number.isFinite(y2)
    ) {
      continue;
    }

    sum += x1 * y2 - x2 * y1;
  }

  return sum / 2;
}

function ringCentroid(ring: number[][]): {
  latitude: number;
  longitude: number;
} {
  let area = 0;
  let cx = 0;
  let cy = 0;

  for (let i = 0; i < ring.length - 1; i++) {
    const pointA = ring[i];
    const pointB = ring[i + 1];

    if (!pointA || !pointB) {
      continue;
    }

    const x1 = Number(pointA[0]);
    const y1 = Number(pointA[1]);
    const x2 = Number(pointB[0]);
    const y2 = Number(pointB[1]);

    if (
      !Number.isFinite(x1) ||
      !Number.isFinite(y1) ||
      !Number.isFinite(x2) ||
      !Number.isFinite(y2)
    ) {
      continue;
    }

    const cross = x1 * y2 - x2 * y1;
    area += cross;
    cx += (x1 + x2) * cross;
    cy += (y1 + y2) * cross;
  }

  area *= 0.5;

  if (Math.abs(area) < 1e-10) {
    let sumLon = 0;
    let sumLat = 0;
    let validPoints = 0;

    for (const point of ring) {
      if (!point) {
        continue;
      }

      const lon = Number(point[0]);
      const lat = Number(point[1]);

      if (!Number.isFinite(lon) || !Number.isFinite(lat)) {
        continue;
      }

      sumLon += lon;
      sumLat += lat;
      validPoints++;
    }

    if (validPoints === 0) {
      return { longitude: 0, latitude: 0 };
    }

    return { longitude: sumLon / validPoints, latitude: sumLat / validPoints };
  }

  cx /= 6 * area;
  cy /= 6 * area;

  return { longitude: cx, latitude: cy };
}

export function computeStateCentroid(
  feature: GeoFeature
): { latitude: number; longitude: number } | null {
  const { geometry } = feature;

  const polygons: PolygonCoordinates[] = isPolygonGeometry(geometry)
    ? [geometry.coordinates as PolygonCoordinates]
    : isMultiPolygonGeometry(geometry)
      ? (geometry.coordinates as MultiPolygonCoordinates)
      : [];

  let bestRing: number[][] | null = null;
  let bestArea = 0;

  for (const polygon of polygons) {
    const outerRing = polygon[0];
    if (!outerRing || outerRing.length < 3) continue;

    const area = Math.abs(shoelaceArea(outerRing));
    if (area > bestArea) {
      bestArea = area;
      bestRing = outerRing;
    }
  }

  return bestRing ? ringCentroid(bestRing) : null;
}

// Same inverse mapping StateHighlight.tsx uses — keeps label
// consistent with where the highlight geometry actually sits.
export function latLonToSphereVector(
  latitude: number,
  longitude: number,
  radius: number
): Vec3 {
  const lat = (latitude * Math.PI) / 180;
  const lon = (longitude * Math.PI) / 180;
  const cosLat = Math.cos(lat);

  return {
    x: radius * cosLat * Math.cos(lon),
    y: -radius * Math.sin(lat),
    z: radius * cosLat * Math.sin(lon),
  };
}
