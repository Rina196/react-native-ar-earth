# React Native AR Earth

A React Native AR library for placing and interacting with an Earth globe in augmented reality, with geographic state detection, markers, route arcs, and custom Earth textures.

This package is built on top of [@reactvision/react-viro](https://www.npmjs.com/package/@reactvision/react-viro) and is designed for immersive AR experiences where users can place an Earth model in the real world and tap to detect latitude/longitude or matching GeoJSON regions.

## Features

- AR Earth placement on a detected plane
- Custom Earth texture support
- Marker rendering for geographic points
- Route arc rendering between two selected points
- State / country detection using GeoJSON data
- State border and fill highlighting
- Pinch and rotate controls
- Real-world coordinate callbacks for taps and selections

## Requirements

- React Native 0.83+
- New Architecture enabled
- [@reactvision/react-viro](https://www.npmjs.com/package/@reactvision/react-viro) installed

## Installation

```bash
npm install @mindinventory/react-native-ar-earth @reactvision/react-viro
```

or

```bash
yarn add @mindinventory/react-native-ar-earth @reactvision/react-viro
```

## Usage

```tsx
import React from 'react';
import { View } from 'react-native';
import { Earth } from '@mindinventory/react-native-ar-earth';
import indiaGeoJson from './assets/IND.json';

const locations = [
  {
    id: '1',
    latitude: 28.6139,
    longitude: 77.209,
    stateName: 'Delhi',
  },
  {
    id: '2',
    latitude: 19.076,
    longitude: 72.8777,
    stateName: 'Mumbai',
  },
];

export default function App() {
  return (
    <View style={{ flex: 1 }}>
      <Earth
        earthTexture={require('./assets/images/earthImage.jpg')}
        markerImage={require('./assets/images/locationMarker.png')}
        geoJson={indiaGeoJson}
        locations={locations}
        showMarkers
        showRoute={false}
        showStateHighlight
        showStateBorder
        onLocationSelected={(location) => {
          console.log('Selected location:', location);
        }}
        onStateSelected={(state) => {
          console.log('Selected state:', state);
        }}
      />
    </View>
  );
}
```

## GeoJSON support

The component can identify the selected region from a GeoJSON `FeatureCollection`.

```ts
geoJson?: {
  type: string;
  features: GeoFeature[];
};
```

The JSON should contain features with polygon or multipolygon geometry, for example:

```ts
{
  type: 'FeatureCollection',
  features: [
    {
      type: 'Feature',
      properties: {
        shapeName: 'Punjab',
        shapeID: '123',
        shapeGroup: 'IND',
        shapeType: 'ADM1',
      },
      geometry: {
        type: 'Polygon',
        coordinates: [[[...]]],
      },
    },
  ],
};
```

If `geoJson` is not supplied, the Earth will still return latitude/longitude on tap, but state detection will be unavailable.

## Props

```ts
type EarthProps = {
  earthTexture: any;
  markerImage?: any;
  geoJson?: GeoFeatureCollection;
  initialScale?: number;
  minScale?: number;
  maxScale?: number;
  sphereRadius?: number;
  sphereRotation?: [number, number, number];
  showMarkers?: boolean;
  showRoute?: boolean;
  showStateHighlight?: boolean;
  showStateBorder?: boolean;
  stateHighlightColor?: string;
  stateBorderColor?: string;
  arcHeight?: number;
  arcSegments?: number;
  routeThickness?: number;
  onLocationSelected?: (location: EarthLocation) => void;
  onStateSelected?: (state: GeoFeature | null) => void;
  onEarthPlaced?: (position: [number, number, number]) => void;
  locations?: EarthLocationPoint[];
  arcModelSource?: any;
};
```

### Prop details

| Prop                  | Type                                           | Description                                              |
| --------------------- | ---------------------------------------------- | -------------------------------------------------------- |
| `earthTexture`        | `any`                                          | Globe texture image.                                     |
| `markerImage`         | `any`                                          | Image used for location markers.                         |
| `geoJson`             | `GeoFeatureCollection`                         | GeoJSON feature collection for state/country detection.  |
| `initialScale`        | `number`                                       | Starting Earth scale.                                    |
| `minScale`            | `number`                                       | Minimum Earth zoom limit.                                |
| `maxScale`            | `number`                                       | Maximum Earth zoom limit.                                |
| `sphereRadius`        | `number`                                       | Earth radius.                                            |
| `sphereRotation`      | `[number, number, number]`                     | Initial rotation in Euler angles.                        |
| `showMarkers`         | `boolean`                                      | Shows markers for `locations` and selected route points. |
| `showRoute`           | `boolean`                                      | Renders the arc between route points.                    |
| `showStateHighlight`  | `boolean`                                      | Highlights the selected region.                          |
| `showStateBorder`     | `boolean`                                      | Draws the border of the selected region.                 |
| `stateHighlightColor` | `string`                                       | Fill color for the selected region.                      |
| `stateBorderColor`    | `string`                                       | Border color for the selected region.                    |
| `arcHeight`           | `number`                                       | Height of the route arc.                                 |
| `arcSegments`         | `number`                                       | Number of segments used for the route arc.               |
| `routeThickness`      | `number`                                       | Thickness of the route line.                             |
| `onLocationSelected`  | `(location: EarthLocation) => void`            | Triggered when a point on Earth is tapped.               |
| `onStateSelected`     | `(state: GeoFeature \| null) => void`          | Triggered when a GeoJSON region is matched.              |
| `onEarthPlaced`       | `(position: [number, number, number]) => void` | Triggered when the AR plane placement is accepted.       |
| `locations`           | `EarthLocationPoint[]`                         | Predefined points rendered as markers.                   |
| `arcModelSource`      | `any`                                          | Optional 3D model used for the route animation.          |

## Example app

The included example app demonstrates loading a country GeoJSON dataset and rendering markers across multiple cities.

You can run it from the workspace:

```bash
yarn example
```

## Notes

- The library uses AR plane detection and works best in a real-world AR environment.
- For best results, provide valid GeoJSON polygon data matching the region you want to detect.
- `onLocationSelected` always receives the tapped latitude and longitude.

## License

MIT

## Contributing

- [Development workflow](CONTRIBUTING.md#development-workflow)
- [Sending a pull request](CONTRIBUTING.md#sending-a-pull-request)
- [Code of conduct](CODE_OF_CONDUCT.md)
