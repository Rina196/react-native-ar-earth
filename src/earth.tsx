import {
  ViroImage,
  ViroMaterials,
  ViroNode,
  ViroSphere,
} from '@reactvision/react-viro';

import { useCallback, useMemo, useRef, useState } from 'react';

import {
  findStateAtCoordinate,
  surfacePointToLatLng,
  type GeoFeature,
  type Vec3,
} from './utils/ar-utils';
import StateHighlight from './stateHighlight';
import StateHighlightPolyline from './stateHighlightWithPolyline';
import NetworkArc from './networkArc';
import indiaGeoJson from '../assets/IND.json';
import type { EarthProps, EarthRoutePoint, Vec3Tuple } from './earth.types';
import {
  DEFAULT_MIN_SCALE,
  DEFAULT_MAX_SCALE,
  DEFAULT_SPHERE_RADIUS,
  DEFAULT_SPHERE_ROTATION,
  MARKER_SURFACE_OFFSET,
} from './earth.constants';

// Re-export types for backward compatibility
export type {
  EarthProps,
  EarthRoutePoint,
  Vec3Tuple,
  EarthMarker,
  EarthLocation,
} from './earth.types';

function EarthSceneRenderer(props: EarthProps) {
  return <EarthScene {...props} />;
}

function EarthScene(props: EarthProps) {
  const {
    earthTexture,
    markerImage,

    geoJson = indiaGeoJson,

    initialScale = 1,
    minScale = DEFAULT_MIN_SCALE,
    maxScale = DEFAULT_MAX_SCALE,

    sphereRadius = DEFAULT_SPHERE_RADIUS,

    sphereRotation = DEFAULT_SPHERE_ROTATION,

    showMarkers = false,
    showRoute = false,

    showStateHighlight = true,
    showStateBorder = false,

    enablePinch = true,
    enableRotate = true,

    stateHighlightColor = '#00FFFF',
    stateBorderColor = '#FF0000',

    arcHeight = 0.12,
    arcSegments = 80,
    routeThickness = 0.003,

    onLocationSelected,
    onStateSelected,
    arcModelSource,
    earthPosition,
    locations = [],
  } = props;

  const [earthScale, setEarthScale] = useState(initialScale);

  const [selectedState, setSelectedState] = useState<GeoFeature | null>(null);

  const [routePoints, setRoutePoints] = useState<EarthRoutePoint[]>([]);

  // =========================================================
  // SPIN
  // =========================================================

  const [spinY, setSpinY] = useState(0);

  const spinStart = useRef(0);

  const handleRotate = (
    rotateState: number,
    rotationFactor: number,
    _source?: any
  ) => {
    // 1 = start
    // 2 = rotating
    // 3 = end

    if (rotateState === 1) {
      spinStart.current = spinY;
      return;
    }

    if (rotateState === 2) {
      setSpinY(spinStart.current + rotationFactor);
    }
  };

  // =========================================================
  // SPHERE CENTER
  // =========================================================

  const sphereLocalCenter = useMemo<Vec3>(
    () => ({
      x: 0,
      y: sphereRadius,
      z: 0,
    }),
    [sphereRadius]
  );

  // =========================================================
  // ROTATE VECTOR
  // =========================================================

  const rotateVector = (v: Vec3, euler: Vec3Tuple): Vec3 => {
    const radX = (euler[0] * Math.PI) / 180;

    const radY = (euler[1] * Math.PI) / 180;

    const radZ = (euler[2] * Math.PI) / 180;

    // X rotation

    const y1 = v.y * Math.cos(radX) - v.z * Math.sin(radX);

    const z1 = v.y * Math.sin(radX) + v.z * Math.cos(radX);

    const x1 = v.x;

    // Y rotation

    const x2 = x1 * Math.cos(radY) + z1 * Math.sin(radY);

    const z2 = -x1 * Math.sin(radY) + z1 * Math.cos(radY);

    const y2 = y1;

    // Z rotation

    const x3 = x2 * Math.cos(radZ) - y2 * Math.sin(radZ);

    const y3 = x2 * Math.sin(radZ) + y2 * Math.cos(radZ);

    const z3 = z2;

    return {
      x: x3,
      y: y3,
      z: z3,
    };
  };

  // =========================================================
  // NORMALIZE
  // =========================================================

  const normalize = (v: Vec3): Vec3 => {
    const length = Math.sqrt(v.x * v.x + v.y * v.y + v.z * v.z);

    if (!Number.isFinite(length) || length < 0.000001) {
      return {
        x: 0,
        y: 1,
        z: 0,
      };
    }

    return {
      x: v.x / length,
      y: v.y / length,
      z: v.z / length,
    };
  };

  // =========================================================
  // PINCH
  // =========================================================

  const pinchStartScale = useRef(initialScale);

  const handlePinch = (pinchState: number, scaleFactor: number) => {
    if (pinchState === 1) {
      pinchStartScale.current = earthScale;

      return;
    }

    if (pinchState === 2) {
      const newScale = pinchStartScale.current * scaleFactor;

      const clampedScale = Math.max(minScale, Math.min(maxScale, newScale));

      setEarthScale(clampedScale);
    }
  };

  // =========================================================
  // SPHERE CLICK
  // =========================================================

  const handleSphereClick = (
    clickState: number,
    clickPos: Vec3Tuple | null | undefined
  ) => {
    if (clickState !== 3 || !clickPos || !earthPosition) {
      return;
    }

    if (!clickPos.every(Number.isFinite)) {
      return;
    }

    // -------------------------------------------------------
    // WORLD CLICK
    // -------------------------------------------------------

    const worldClick: Vec3 = {
      x: clickPos[0],
      y: clickPos[1],
      z: clickPos[2],
    };

    // -------------------------------------------------------
    // WORLD -> EARTH LOCAL
    // -------------------------------------------------------

    const translated: Vec3 = {
      x: worldClick.x - earthPosition[0],

      y: worldClick.y - earthPosition[1],

      z: worldClick.z - earthPosition[2],
    };

    const combinedRotation: Vec3Tuple = [
      sphereRotation[0],
      sphereRotation[1] + spinY,
      sphereRotation[2],
    ];

    const inverseRotation: Vec3Tuple = [
      -combinedRotation[0],
      -combinedRotation[1],
      -combinedRotation[2],
    ];

    const unrotated = rotateVector(translated, inverseRotation);

    const earthLocal: Vec3 = {
      x: unrotated.x / earthScale,

      y: unrotated.y / earthScale,

      z: unrotated.z / earthScale,
    };

    // -------------------------------------------------------
    // RELATIVE TO SPHERE CENTER
    // -------------------------------------------------------

    const fromSphereCenter: Vec3 = {
      x: earthLocal.x - sphereLocalCenter.x,

      y: earthLocal.y - sphereLocalCenter.y,

      z: earthLocal.z - sphereLocalCenter.z,
    };

    const distance = Math.sqrt(
      fromSphereCenter.x * fromSphereCenter.x +
        fromSphereCenter.y * fromSphereCenter.y +
        fromSphereCenter.z * fromSphereCenter.z
    );

    if (!Number.isFinite(distance) || distance < 0.000001) {
      return;
    }

    // -------------------------------------------------------
    // PROJECT TO EARTH SURFACE
    // -------------------------------------------------------

    const projectionScale = sphereRadius / distance;

    const surfaceLocal: Vec3 = {
      x: fromSphereCenter.x * projectionScale,

      y: fromSphereCenter.y * projectionScale,

      z: fromSphereCenter.z * projectionScale,
    };

    // -------------------------------------------------------
    // SURFACE NORMAL
    // -------------------------------------------------------

    const surfaceNormalVec = normalize(surfaceLocal);

    const surfaceNormal: Vec3Tuple = [
      surfaceNormalVec.x,
      surfaceNormalVec.y,
      surfaceNormalVec.z,
    ];

    // -------------------------------------------------------
    // LATITUDE / LONGITUDE
    // -------------------------------------------------------

    const { latitude, longitude } = surfacePointToLatLng(
      surfaceLocal,
      sphereRadius
    );

    // -------------------------------------------------------
    // FIND STATE
    // -------------------------------------------------------

    const detectedState = geoJson
      ? findStateAtCoordinate(latitude, longitude, geoJson.features)
      : null;

    setSelectedState(detectedState);

    onStateSelected?.(detectedState);

    onLocationSelected?.({
      latitude,
      longitude,
      state: detectedState,
    });

    // -------------------------------------------------------
    // MARKER
    // -------------------------------------------------------

    const markerSurface = sphereRadius + MARKER_SURFACE_OFFSET;

    const markerPosition: Vec3Tuple = [
      sphereLocalCenter.x + surfaceNormalVec.x * markerSurface,

      sphereLocalCenter.y + surfaceNormalVec.y * markerSurface,

      sphereLocalCenter.z + surfaceNormalVec.z * markerSurface,
    ];

    // -------------------------------------------------------
    // ROUTE POINT
    // -------------------------------------------------------

    const id = `${Date.now()}-${Math.random()}`;

    const newRoutePoint: EarthRoutePoint = {
      id,
      position: markerPosition,
      normal: surfaceNormal,
      latitude,
      longitude,
      stateName: detectedState?.properties?.shapeName,
    };

    // -------------------------------------------------------
    // ROUTE POINTS
    // -------------------------------------------------------

    setRoutePoints((previousPoints) => {
      if (previousPoints.length === 0) {
        return [newRoutePoint];
      }

      if (previousPoints.length === 1) {
        const firstPoint = previousPoints[0];

        if (!firstPoint) {
          return [newRoutePoint];
        }

        return [firstPoint, newRoutePoint];
      }

      return [newRoutePoint];
    });
  };

  const latLngToSpherePosition = useCallback(
    (
      latitude: number,
      longitude: number
    ): {
      position: Vec3Tuple;
      normal: Vec3Tuple;
    } => {
      /**
       * IMPORTANT:
       *
       * This is the exact inverse of:
       *
       * latitude =
       *   -asin(normalized.y)
       *
       * longitude =
       *   atan2(normalized.x, -normalized.z) - 90
       */

      const latitudeRad = (latitude * Math.PI) / 180;

      /**
       * surfacePointToLatLng() does:
       *
       * longitude = atan2(x, -z) - 90
       *
       * Therefore when going backwards:
       *
       * originalLongitude = longitude + 90
       */
      const longitudeRad = ((longitude + 90) * Math.PI) / 180;

      const normal = normalize({
        /**
         * atan2(x, -z) = longitude + 90
         */
        x: Math.cos(latitudeRad) * Math.sin(longitudeRad),

        /**
         * Latitude is inverted in your coordinate system.
         */
        y: -Math.sin(latitudeRad),

        /**
         * IMPORTANT: -cos()
         *
         * This matches atan2(x, -z).
         */
        z: -Math.cos(latitudeRad) * Math.cos(longitudeRad),
      });

      const markerRadius = sphereRadius + MARKER_SURFACE_OFFSET;

      const position: Vec3Tuple = [
        sphereLocalCenter.x + normal.x * markerRadius,

        sphereLocalCenter.y + normal.y * markerRadius,

        sphereLocalCenter.z + normal.z * markerRadius,
      ];

      console.log('🌍 LOCATION MARKER', {
        latitude,
        longitude,
        normal,
        position,
      });

      return {
        position,
        normal: [normal.x, normal.y, normal.z],
      };
    },
    [sphereRadius, sphereLocalCenter]
  );

  const locationMarkers = useMemo(() => {
    if (!locations?.length) {
      return [];
    }

    return locations
      .filter(
        (location) =>
          Number.isFinite(location.latitude) &&
          Number.isFinite(location.longitude)
      )
      .map((location) => {
        const { position, normal } = latLngToSpherePosition(
          location.latitude,
          location.longitude
        );

        return {
          ...location,
          position,
          normal,
        };
      });
  }, [latLngToSpherePosition, locations]);

  useMemo(() => {
    ViroMaterials.createMaterials({
      earth: {
        lightingModel: 'Lambert',
        diffuseTexture: earthTexture,
      },

      markerMaterial: {
        diffuseColor: '#00FF00',
        lightingModel: 'Constant',
      },

      pointAMaterial: {
        diffuseColor: '#FFD700',
        lightingModel: 'Constant',
      },

      pointBMaterial: {
        diffuseColor: '#FF3030',
        lightingModel: 'Constant',
      },

      routeMaterial: {
        diffuseColor: '#00BFFF',
        lightingModel: 'Constant',
      },

      stateTextMaterial: {
        diffuseColor: '#FFFFFF',
        lightingModel: 'Constant',
      },
    });
  }, [earthTexture]);

  // =========================================================
  // RENDER
  // =========================================================

  return (
    <>
      {earthPosition ? (
        <ViroNode
          position={earthPosition}
          scale={[earthScale, earthScale, earthScale]}
          onPinch={enablePinch ? handlePinch : undefined}
          onRotate={enableRotate ? handleRotate : undefined}
          dragType="FixedDistance"
        >
          {/* =================================================
              LIVE SPIN
          ================================================= */}

          <ViroNode rotation={[0, spinY, 0]}>
            {/* ===============================================
                BASE ROTATION
            =============================================== */}

            <ViroNode rotation={sphereRotation}>
              {/* =============================================
                  EARTH
              ============================================= */}

              <ViroSphere
                heightSegmentCount={20}
                widthSegmentCount={20}
                radius={sphereRadius}
                position={[0, sphereRadius, 0]}
                materials={['earth']}
                facesOutward
                highAccuracyEvents
                onClickState={handleSphereClick}
              />

              {/* =============================================
                  MARKERS
              ============================================= */}

              {showMarkers &&
                markerImage &&
                locationMarkers.map((location) => {
                  const position: Vec3Tuple = [
                    location.position[0],
                    location.position[1] - 0.02,
                    location.position[2],
                  ];

                  return (
                    <ViroNode
                      key={location.id}
                      position={position}
                      transformBehaviors={['billboard']}
                      onClick={() => {
                        onLocationSelected?.({
                          latitude: location.latitude,
                          longitude: location.longitude,
                          state: location.stateName || null,
                        });
                      }}
                    >
                      <ViroImage
                        source={markerImage}
                        width={0.045}
                        height={0.045}
                      />
                    </ViroNode>
                  );
                })}

              {showMarkers &&
                markerImage &&
                routePoints.map((point) => {
                  const position: Vec3Tuple = [
                    point.position[0],
                    point.position[1] - 0.02,
                    point.position[2],
                  ];

                  return (
                    <ViroNode
                      key={point.id}
                      position={position}
                      transformBehaviors={['billboard']}
                    >
                      <ViroImage
                        source={markerImage}
                        width={0.045}
                        height={0.045}
                      />
                    </ViroNode>
                  );
                })}

              {/* =============================================
                  NETWORK ARC
              ============================================= */}

              {showRoute &&
                routePoints.length === 2 &&
                routePoints[0] &&
                routePoints[1] && (
                  <NetworkArc
                    modelSource={arcModelSource}
                    from={routePoints[0]}
                    to={routePoints[1]}
                    sphereCenter={[
                      sphereLocalCenter.x,
                      sphereLocalCenter.y,
                      sphereLocalCenter.z,
                    ]}
                    sphereRadius={sphereRadius}
                    arcHeight={arcHeight}
                    segments={arcSegments}
                    thickness={routeThickness}
                    material="routeMaterial"
                    animationDuration={1200}
                  />
                )}

              {/* =============================================
                  STATE BORDER
              ============================================= */}

              {showStateBorder && selectedState && (
                <StateHighlightPolyline
                  feature={selectedState}
                  color={stateBorderColor}
                  earthRadius={sphereRadius}
                  earthPosition={[0, sphereRadius, 0]}
                />
              )}

              {/* =============================================
                  STATE FILL
              ============================================= */}

              {showStateHighlight && selectedState && (
                <StateHighlight
                  feature={selectedState}
                  color={stateHighlightColor}
                  earthRadius={sphereRadius}
                  earthPosition={[0, sphereRadius, 0]}
                  sphereRotation={sphereRotation}
                />
              )}
            </ViroNode>
          </ViroNode>
        </ViroNode>
      ) : null}
    </>
  );
}

// ============================================================
// PUBLIC COMPONENT
// ============================================================

export default function Earth(props: EarthProps) {
  return <EarthSceneRenderer {...props} />;
}
