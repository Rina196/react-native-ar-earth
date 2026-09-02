import type {
  GeoFeature,
  GeoFeatureCollection,
  EarthLocationPoint,
} from './utils/ar-utils';

export type Vec3Tuple = [number, number, number];

export type EarthMarker = {
  id: string;
  position: Vec3Tuple;
  latitude: number;
  longitude: number;
  stateName?: string;
};

export type EarthRoutePoint = {
  id: string;
  position: Vec3Tuple;
  normal: Vec3Tuple;
  latitude: number;
  longitude: number;
  stateName?: string;
};

export type EarthLocation = {
  latitude: number;
  longitude: number;
  state?: GeoFeature | null | string;
};

export type EarthProps = {
  /**
   * Earth texture.
   *
   * Example:
   * earthTexture={require("./assets/earth.jpg")}
   */
  earthTexture: any;

  /**
   * Marker image.
   *
   * Example:
   * markerImage={require("./assets/location.png")}
   */
  markerImage?: any;

  /**
   * GeoJSON features used for state/country detection.
   *
   * Optional. If not supplied, clicking the Earth will still
   * return latitude/longitude.
   */
  geoJson?: GeoFeatureCollection;

  /**
   * Initial Earth scale.
   */
  initialScale?: number;

  /**
   * Minimum Earth scale.
   */
  minScale?: number;

  /**
   * Maximum Earth scale.
   */
  maxScale?: number;

  /**
   * Sphere radius.
   */
  sphereRadius?: number;

  /**
   * Initial Earth rotation.
   */
  sphereRotation?: Vec3Tuple;

  /**
   * Show location markers.
   */
  showMarkers?: boolean;

  /**
   * Show route between two selected points.
   */
  showRoute?: boolean;

  /**
   * Show selected state highlight.
   */
  showStateHighlight?: boolean;

  /**
   * Show selected state border.
   */
  showStateBorder?: boolean;

  /**
   * State highlight color.
   */
  stateHighlightColor?: string;

  /**
   * State border color.
   */
  stateBorderColor?: string;

  /**
   * Route arc height.
   */
  arcHeight?: number;

  /**
   * Route arc segments.
   */
  arcSegments?: number;

  /**
   * Route thickness.
   */
  routeThickness?: number;

  /**
   * Called when user selects a point on Earth.
   */
  onLocationSelected?: (location: EarthLocation) => void;

  /**
   * Called when a state is selected.
   */
  onStateSelected?: (state: GeoFeature | null) => void;

  /**
   * Called when the Earth plane is selected.
   */
  onEarthPlaced?: (position: Vec3Tuple) => void;

  /**
   * Locations to display as markers on Earth.
   */
  locations?: EarthLocationPoint[];

  arcModelSource?: any;
};
