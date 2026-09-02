import { StyleSheet } from 'react-native';
import { Earth } from '@mindinventory/react-native-ar-earth';
import pakistanGeoJson from '../assets/IRN.json';
import {
  ViroARScene,
  ViroAmbientLight,
  ViroARPlaneSelector,
  ViroARSceneNavigator,
} from '@reactvision/react-viro';
import type { Vec3Tuple } from '../../src/earth.types';
import { useRef, useState } from 'react';

export default function App() {
  return (
    <ViroARSceneNavigator
      worldMeshEnabled
      initialScene={{
        scene: () => EarthSceneRenderer(),
      }}
      style={styles.container}
    />
  );
}

function EarthSceneRenderer() {
  const locations = [
    // =========================
    // INDIA
    // =========================

    {
      id: '1',
      stateName: 'ahmedabad',
      latitude: 23.0258,
      longitude: 72.5873,
    },
    {
      id: '2',
      stateName: 'mumbai',
      latitude: 19.076,
      longitude: 72.8777,
    },
    {
      id: '3',
      stateName: 'delhi',
      latitude: 28.6139,
      longitude: 77.209,
    },
    {
      id: '4',
      stateName: 'bengaluru',
      latitude: 12.9716,
      longitude: 77.5946,
    },
    {
      id: '5',
      stateName: 'kolkata',
      latitude: 22.5726,
      longitude: 88.3639,
    },
    {
      id: '6',
      stateName: 'chennai',
      latitude: 13.0827,
      longitude: 80.2707,
    },

    // =========================
    // PAKISTAN
    // =========================

    {
      id: '7',
      stateName: 'lahore',
      latitude: 31.5204,
      longitude: 74.3587,
    },
    {
      id: '8',
      stateName: 'islamabad',
      latitude: 33.6844,
      longitude: 73.0479,
    },
    {
      id: '9',
      stateName: 'karachi',
      latitude: 24.8607,
      longitude: 67.0011,
    },

    // =========================
    // AFGHANISTAN
    // =========================

    {
      id: '10',
      stateName: 'kabul',
      latitude: 34.5553,
      longitude: 69.2075,
    },
    {
      id: '11',
      stateName: 'kandahar',
      latitude: 31.6289,
      longitude: 65.7372,
    },

    // =========================
    // CHINA
    // =========================

    {
      id: '12',
      stateName: 'beijing',
      latitude: 39.9042,
      longitude: 116.4074,
    },
    {
      id: '13',
      stateName: 'lhasa',
      latitude: 29.65,
      longitude: 91.1,
    },
    {
      id: '14',
      stateName: 'kunming',
      latitude: 25.0389,
      longitude: 102.7183,
    },

    // =========================
    // NEPAL
    // =========================

    {
      id: '15',
      stateName: 'kathmandu',
      latitude: 27.7172,
      longitude: 85.324,
    },
    {
      id: '16',
      stateName: 'pokhara',
      latitude: 28.2096,
      longitude: 83.9856,
    },

    // =========================
    // BHUTAN
    // =========================

    {
      id: '17',
      stateName: 'thimphu',
      latitude: 27.4728,
      longitude: 89.639,
    },
    {
      id: '18',
      stateName: 'paro',
      latitude: 27.4286,
      longitude: 89.4162,
    },

    // =========================
    // BANGLADESH
    // =========================

    {
      id: '19',
      stateName: 'dhaka',
      latitude: 23.8103,
      longitude: 90.4125,
    },
    {
      id: '20',
      stateName: 'chittagong',
      latitude: 22.3569,
      longitude: 91.7832,
    },

    // =========================
    // MYANMAR
    // =========================

    {
      id: '21',
      stateName: 'naypyidaw',
      latitude: 19.7633,
      longitude: 96.0785,
    },
    {
      id: '22',
      stateName: 'yangon',
      latitude: 16.8409,
      longitude: 96.1735,
    },

    // =========================
    // SRI LANKA
    // =========================

    {
      id: '23',
      stateName: 'colombo',
      latitude: 6.9271,
      longitude: 79.8612,
    },
    {
      id: '24',
      stateName: 'kandy',
      latitude: 7.2906,
      longitude: 80.6337,
    },

    // =========================
    // MALDIVES
    // =========================

    {
      id: '25',
      stateName: 'male',
      latitude: 4.1755,
      longitude: 73.5093,
    },

    // =========================
    // IRAN
    // =========================

    {
      id: '26',
      stateName: 'tehran',
      latitude: 35.6892,
      longitude: 51.389,
    },

    // =========================
    // TAJIKISTAN
    // =========================

    {
      id: '27',
      stateName: 'dushanbe',
      latitude: 38.5598,
      longitude: 68.787,
    },

    // =========================
    // UZBEKISTAN
    // =========================

    {
      id: '28',
      stateName: 'tashkent',
      latitude: 41.2995,
      longitude: 69.2401,
    },

    // =========================
    // TURKMENISTAN
    // =========================

    {
      id: '29',
      stateName: 'ashgabat',
      latitude: 37.9601,
      longitude: 58.3261,
    },

    // =========================
    // KYRGYZSTAN
    // =========================

    {
      id: '30',
      stateName: 'bishkek',
      latitude: 42.8746,
      longitude: 74.5698,
    },

    // =========================
    // THAILAND
    // =========================

    {
      id: '31',
      stateName: 'bangkok',
      latitude: 13.7563,
      longitude: 100.5018,
    },

    // =========================
    // VIETNAM
    // =========================

    {
      id: '32',
      stateName: 'hanoi',
      latitude: 21.0278,
      longitude: 105.8342,
    },

    // =========================
    // CAMBODIA
    // =========================

    {
      id: '33',
      stateName: 'phnom_penh',
      latitude: 11.5564,
      longitude: 104.9282,
    },

    // =========================
    // MALAYSIA
    // =========================

    {
      id: '34',
      stateName: 'kuala_lumpur',
      latitude: 3.139,
      longitude: 101.6869,
    },

    // =========================
    // INDONESIA
    // =========================

    {
      id: '35',
      stateName: 'jakarta',
      latitude: -6.2088,
      longitude: 106.8456,
    },

    // =========================
    // OMAN
    // =========================

    {
      id: '36',
      stateName: 'muscat',
      latitude: 23.588,
      longitude: 58.3829,
    },

    // =========================
    // UNITED ARAB EMIRATES
    // =========================

    {
      id: '37',
      stateName: 'dubai',
      latitude: 25.2048,
      longitude: 55.2708,
    },

    // =========================
    // SAUDI ARABIA
    // =========================

    {
      id: '38',
      stateName: 'riyadh',
      latitude: 24.7136,
      longitude: 46.6753,
    },
  ];
  const selectorRef = useRef<any>(null);

  const [earthPosition, setEarthPosition] = useState<Vec3Tuple | null>(null);
  return (
    <ViroARScene
      anchorDetectionTypes={['PlanesHorizontal']}
      onAnchorFound={(anchor) => {
        selectorRef.current?.handleAnchorFound(anchor);
      }}
      onAnchorUpdated={(anchor) => {
        selectorRef.current?.handleAnchorUpdated(anchor);
      }}
      onAnchorRemoved={(anchor) => {
        anchor && selectorRef.current?.handleAnchorRemoved(anchor);
      }}
    >
      {/* =====================================================
                LIGHT
            ===================================================== */}

      <ViroAmbientLight color="#ffffff" influenceBitMask={3} />

      {/* =====================================================
                PLANE SELECTOR
            ===================================================== */}

      <ViroARPlaneSelector
        ref={selectorRef}
        alignment="Horizontal"
        minWidth={0.1}
        minHeight={0.1}
        hideOverlayOnSelection
        useActualShape
        onPlaneSelected={(_anchor, tapPosition) => {
          if (!tapPosition) {
            return;
          }

          const position: Vec3Tuple = [
            tapPosition[0],
            tapPosition[1],
            tapPosition[2],
          ];

          setEarthPosition(position);
        }}
      />

      <Earth
        earthPosition={earthPosition}
        arcModelSource={require('./../assets/models/Airplane.glb')}
        earthTexture={require('../assets/images/earthImage.jpg')}
        markerImage={require('../assets/images/locationMarker.png')}
        onLocationSelected={(location) => {
          console.log('Earth location selected:', location);
        }}
        enablePinch
        enableRotate
        showMarkers
        showRoute={false}
        showStateBorder={false}
        showStateHighlight={false}
        locations={locations}
        geoJson={pakistanGeoJson}
      />
    </ViroARScene>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
