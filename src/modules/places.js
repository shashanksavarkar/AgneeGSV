// Campus places use the same map-pixel origin as campus-scene.js:
// world x = map x - W / 2 and world z = map y - H / 2.
const PLACES = [
  {
    id: 'main-gate',
    name: 'Main Gate',
    category: 'entrance',
    position: { x: 577 - W / 2, y: 5.5, z: 46 - H / 2 },
    description:
      'Main campus entrance and primary security checkpoint. Features the iconic bilingual university archway, guard cabins, and reception gate.',
    pose: { distance: 48, tilt: 0.12, heading: Math.PI },
    featured: true
  },
  {
    id: 'academic-block',
    name: 'Academic Block',
    category: 'academic',
    position: { x: 357 - W / 2, y: 7.0, z: 90.5 - H / 2 },
    description:
      'The primary academic building of Gati Shakti Vishwavidyalaya with its grand triple-arched entrance portico and dome.',
    pose: { distance: 54, tilt: 0.15, heading: 0 },
    featured: true
  },
  {
    id: 'current-hostel',
    name: 'Current Hostel (NHSRCL)',
    category: 'hostel',
    position: { x: 605 - W / 2, y: 4.8, z: 148 - H / 2 },
    description:
      'High Speed Rail Training Institute (NHSRCL) featuring the iconic entrance portico canopy, bilingual signage, and landscaped forecourt.',
    pose: { distance: 44, tilt: 0.08, heading: -Math.PI / 2 },
    featured: true
  },
  {
    id: 'proposed-hostel',
    name: 'Proposed Hostel',
    category: 'hostel',
    position: { x: 606.5 - W / 2, y: 6.0, z: 100 - H / 2 },
    description:
      'Proposed hostel development with west entrance canopy portico.',
    pose: { distance: 52, tilt: 0.14, heading: -Math.PI / 2 },
    featured: true
  },
  {
    id: 'sabhagrah',
    name: 'Sardar Patel Sabhagrah',
    category: 'auditorium',
    position: { x: 425 - W / 2, y: 5.5, z: 86.5 - H / 2 },
    description: 'Sardar Patel Sabhagriha, the university auditorium and conference hall.',
    pose: { distance: 48, tilt: 0.15, heading: 0 },
    featured: true
  },
  {
    id: 'pahune-hostel',
    name: 'Pahune Hostel',
    category: 'hostel',
    position: { x: 476 - W / 2, y: 4.0, z: 90.0 - H / 2 },
    description: 'Pahune Hostel and Recreation Hall, residential accommodation situated between Sabhagrah and Atithi Hostel.',
    pose: { distance: 48, tilt: 0.15, heading: 0 },
    featured: true
  },
  {
    id: 'gsv-mess',
    name: 'GSV-MESS',
    category: 'dining',
    position: { x: 453 - W / 2, y: 4.8, z: 118.5 - H / 2 },
    description: 'GSV-MESS central dining building situated in front of Pahune Hostel and Manthan, featuring the iconic front entrance portico with illuminated bilingual GSV-MESS signage, columns, ornamental lantern gateposts, and cascading entrance steps.',
    pose: { distance: 34, tilt: 0.12, heading: Math.PI },
    featured: true
  },
  {
    id: 'atithi-hostel',
    name: 'Atithi Hostel',
    category: 'hostel',
    position: { x: 516 - W / 2, y: 5.5, z: 105.8 - H / 2 },
    description:
      'Atithi Hostel featuring the iconic 2-story entrance portico with classical pillars, triangular pediment, bilingual signage, and forecourt.',
    pose: { distance: 29, tilt: 0.11, heading: 0 },
    featured: true
  },
  {
    id: 'mehman-hostel',
    name: "Mehman Boy's Hostel",
    category: 'hostel',
    position: { x: 293.8 - W / 2, y: 3.6, z: 51.5 - H / 2 },
    description:
      "Mehman Boy's Hostel, 3-story student residence situated before GSV Academic Block, featuring private room balconies, entrance canopy portico, enquiry office, and shaded forecourt.",
    pose: { distance: 26, tilt: 0.07, heading: 0.60 },
    featured: true
  },
  {
    id: 'proposed-lab',
    name: 'Proposed Lab',
    category: 'academic',
    position: { x: 511.5 - W / 2, y: 5.5, z: 131.5 - H / 2 },
    description:
      'Proposed laboratory block with grand north entrance archway and rooftop solar panels.',
    pose: { distance: 48, tilt: 0.14, heading: Math.PI },
    featured: true
  },
  {
    id: 'proposed-academic',
    name: 'Proposed Academic',
    category: 'academic',
    position: { x: 481 - W / 2, y: 5.5, z: 274.5 - H / 2 },
    description:
      'Proposed academic block with south grand entrance arch and courtyard amphitheatre.',
    pose: { distance: 50, tilt: 0.14, heading: 0 },
    featured: true
  },
  {
    id: 'palace',
    name: 'Palace',
    category: 'landmark',
    position: { x: 320 - W / 2, y: 6.0, z: 189 - H / 2 },
    description: 'Pratap Vilas Palace, historic campus landmark with west neoclassical entrance overlooking the lawn.',
    pose: { distance: 52, tilt: 0.15, heading: -Math.PI / 2 },
    featured: true
  },
  {
    id: 'rajabaug',
    name: 'Rajabaug (Pre-Agnee Stalls)',
    category: 'festival',
    position: { x: 285 - W / 2, y: 0, z: 189 - H / 2 },
    description: 'Historic royal palace gardens hosting the Pre-Agnee Fun Carnival entered through the ceremonial gateway with 10 interactive stalls, central performance arena, and western fountain plaza.',
    pose: { distance: 58, tilt: 0.16, heading: Math.PI / 2 },
    featured: true
  },
  {
    id: 'darshan',
    name: 'Darshan',
    category: 'academic',
    position: { x: 394 - W / 2, y: 5.5, z: 180.0 - H / 2 },
    description: 'Darshan building, landmark academic and seminar facility situated between Pratap Vilas Palace and Manthan, featuring the Prastuti north entrance forecourt, classical colonnade portico, and dual-language signage.',
    pose: { distance: 46, tilt: 0.15, heading: Math.PI },
    featured: true
  },
  {
    id: 'giriraj',
    name: 'Giriraj',
    category: 'residence',
    position: { x: 388 - W / 2, y: 4.5, z: 157.0 - H / 2 },
    description: 'Giriraj Grih, distinguished VIP guest house and executive residence situated directly in front of Darshan building and adjacent to GSV-MESS, featuring octagonal architecture, front entrance portico with blue slate stone mosaic entrance, polished black granite steps, flower pots, double glass doors, and bronze bilingual plaque.',
    pose: { distance: 38, tilt: 0.13, heading: 0 },
    featured: true
  },
  {
    id: 'manthan',
    name: 'Manthan',
    category: 'landmark',
    position: { x: 435 - W / 2, y: 5.0, z: 183.6 - H / 2 },
    description: 'Manthan building, sandstone landmark with north pediment entrance porch, maroon columns, and dome.',
    pose: { distance: 48, tilt: 0.15, heading: Math.PI },
    featured: true
  },
  {
    id: 'sports-complex',
    name: 'Sports Complex',
    category: 'venue',
    position: { x: 285.4 - W / 2, y: 6.5, z: 314.4 - H / 2 },
    description:
      'Gati Shakti Vishwavidyalaya Sports Complex featuring dual indoor halls (Sports Complex - 1 and Main Sports Complex), grand entrance porticos, bilingual signage, badminton & athletics facilities, and landscaped forecourt.',
    pose: { distance: 46, tilt: 0.14, heading: 0.15 },
    featured: true
  },
  {
    id: 'oval-ground',
    name: 'Oval Ground',
    category: 'venue',
    position: { x: 271.5 - W / 2, y: 5.0, z: 238.5 - H / 2 },
    description: 'Oval Ground, the Agnee cultural fest venue entered through the welcome gate.',
    pose: { distance: 54, tilt: 0.16, heading: Math.PI / 4 },
    featured: true
  },
  {
    id: 'stage',
    name: 'Stage',
    category: 'festival',
    position: { x: 218.8 - W / 2, y: 5.0, z: 291.2 - H / 2 },
    description: 'Agnee festival stage at the west end of Oval Ground, facing the field.',
    pose: { distance: 48, tilt: 0.12, heading: 2.35 },
    featured: true
  },
  {
    id: 'stalls',
    name: 'Stalls',
    category: 'festival',
    position: { x: 259.1 - W / 2, y: 3.5, z: 250.9 - H / 2 },
    description: 'Food, games, art, music, and activity stalls along the east promenade.',
    pose: { distance: 42, tilt: 0.14, heading: -Math.PI / 4 },
    featured: true
  },
  {
    id: 'sponsor-wall',
    name: 'Sponsor Wall',
    category: 'festival',
    position: { x: 242 - W / 2, y: 3.5, z: 248.5 - H / 2 },
    description:
      'Agnee sponsor wall on the north edge of Oval Ground.',
    pose: { distance: 44, tilt: 0.12, heading: 0 },
    featured: true
  }
];
