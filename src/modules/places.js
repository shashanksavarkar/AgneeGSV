// Campus places use the same map-pixel origin as campus-scene.js:
// world x = map x - W / 2 and world z = map y - H / 2.
const PLACES = [
  {
    id: 'main-gate',
    name: 'Main Gate',
    category: 'entrance',
    position: { x: 357 - W / 2, y: 0, z: 90 - H / 2 },
    description:
      'Main campus entrance and arrival point. Additional gate details are to be confirmed.',
    pose: { distance: 85, tilt: 0.16, heading: 0 },
    featured: true
  },
  {
    id: 'academic-block',
    name: 'Academic Block',
    category: 'academic',
    position: { x: 357 - W / 2, y: 0, z: 66 - H / 2 },
    description:
      'The existing Gati Shakti Vishwavidyalaya academic building with its domed entrance.',
    pose: { distance: 105, tilt: 0.2, heading: 0 },
    featured: true
  },
  {
    id: 'current-hostel',
    name: 'Current Hostel',
    category: 'hostel',
    position: { x: 639 - W / 2, y: 0, z: 148 - H / 2 },
    description: 'Existing hostel block shown as the red courtyard building on the campus plan.',
    pose: { distance: 92, tilt: 0.18, heading: Math.PI / 2 },
    featured: true
  },
  {
    id: 'proposed-hostel',
    name: 'Proposed Hostel',
    category: 'hostel',
    position: { x: 654 - W / 2, y: 0, z: 121 - H / 2 },
    description:
      'Proposed hostel development shown as the green multi-wing footprint. Final details are to be confirmed.',
    pose: { distance: 110, tilt: 0.2, heading: Math.PI },
    featured: true
  },
  {
    id: 'atithi-hostel',
    name: 'Atithi Hostel',
    category: 'hostel',
    position: { x: 530.5 - W / 2, y: 0, z: 80.5 - H / 2 },
    description: 'Atithi Hostel, an existing courtyard residence near the main campus road.',
    pose: { distance: 82, tilt: 0.18, heading: 0 },
    featured: true
  },
  {
    id: 'proposed-lab',
    name: 'Proposed Lab',
    category: 'academic',
    position: { x: 511.5 - W / 2, y: 0, z: 158 - H / 2 },
    description:
      'Proposed laboratory block with rooftop solar panels. Program and opening information are to be confirmed.',
    pose: { distance: 100, tilt: 0.2, heading: Math.PI },
    featured: false
  },
  {
    id: 'proposed-academic',
    name: 'Proposed Academic',
    category: 'academic',
    position: { x: 496 - W / 2, y: 0, z: 277 - H / 2 },
    description:
      'Proposed academic block shown in the master plan. Building use and completion details are to be confirmed.',
    pose: { distance: 108, tilt: 0.2, heading: Math.PI },
    featured: false
  },
  {
    id: 'palace',
    name: 'Palace',
    category: 'landmark',
    position: { x: 341 - W / 2, y: 0, z: 189 - H / 2 },
    description: 'Pratap Vilas Palace, a historic campus landmark facing the lawn.',
    pose: { distance: 105, tilt: 0.18, heading: -Math.PI / 2 },
    featured: true
  },
  {
    id: 'rajabaug',
    name: 'Rajabaug (Pre-Agnee Stalls)',
    category: 'festival',
    position: { x: 256 - W / 2, y: 0, z: 189 - H / 2 },
    description: 'Historic royal palace gardens hosting the Pre-Agnee Fun Carnival with 10 interactive fun stalls, central performance arena, and western fountain plaza.',
    pose: { distance: 85, tilt: 0.22, heading: Math.PI / 2 },
    featured: true
  },
  {
    id: 'manthan',
    name: 'Manthan',
    category: 'landmark',
    position: { x: 435 - W / 2, y: 0, z: 201 - H / 2 },
    description: 'Manthan building, a sandstone landmark with a domed roof and front portico.',
    pose: { distance: 78, tilt: 0.18, heading: Math.PI },
    featured: true
  },
  {
    id: 'oval-ground',
    name: 'Oval Ground',
    category: 'venue',
    position: { x: 240 - W / 2, y: 0, z: 270 - H / 2 },
    description: 'Oval Ground, the Agnee cultural fest venue and central event field.',
    pose: { distance: 125, tilt: 0.24, heading: Math.PI / 4 },
    featured: true
  },
  {
    id: 'stage',
    name: 'Stage',
    category: 'festival',
    position: { x: 210 - W / 2, y: 0, z: 270 - H / 2 },
    description: 'Agnee festival stage at the west end of Oval Ground, facing the field.',
    pose: { distance: 48, tilt: 0.12, heading: Math.PI / 2 },
    featured: true
  },
  {
    id: 'stalls',
    name: 'Stalls',
    category: 'festival',
    position: { x: 265 - W / 2, y: 0, z: 270 - H / 2 },
    description: 'Food, games, art, music, and activity stalls along the east edge of Oval Ground.',
    pose: { distance: 58, tilt: 0.14, heading: -Math.PI / 2 },
    featured: false
  },
  {
    id: 'sponsor-wall',
    name: 'Sponsor Wall',
    category: 'festival',
    position: { x: 242 - W / 2, y: 0, z: 248.5 - H / 2 },
    description:
      'Agnee sponsor wall on the north edge of Oval Ground. Sponsor names are placeholders until confirmed.',
    pose: { distance: 62, tilt: 0.12, heading: 0 },
    featured: false
  }
];
