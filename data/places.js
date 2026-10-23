// Map places data (kept separate from data.js; the map reads this)

export const places = [
  {
    "id": "main-gate",
    "name": "Main Gate",
    "category": "Entrance",
    "mapCoords": {
      "x": 357,
      "y": 90
    },
    "walkTimeMinutes": 0,
    "description": "Main campus entrance and primary security checkpoint. All participants and visitors arrive here. Registration verification and guest reception desks are located at this point.",
    "directionsFromGate": "Starting point. Proceed south along the central avenue towards Academic Block and the Palace.",
    "pose": {
      "distance": 85,
      "tilt": 0.16,
      "heading": 0
    },
    "featured": true
  },
  {
    "id": "academic-block",
    "name": "Academic Block",
    "category": "Academic",
    "mapCoords": {
      "x": 357,
      "y": 66
    },
    "walkTimeMinutes": 2,
    "description": "The primary academic building of Gati Shakti Vishwavidyalaya featuring domed architecture, seminar halls, lecture theatres, and computing laboratories.",
    "directionsFromGate": "Straight ahead from Main Gate, approximately 120 metres south along the tree-lined avenue.",
    "pose": {
      "distance": 105,
      "tilt": 0.2,
      "heading": 0
    },
    "featured": true
  },
  {
    "id": "current-hostel",
    "name": "Current Hostel (NHSRCL)",
    "category": "Hostel",
    "mapCoords": {
      "x": 639,
      "y": 148
    },
    "walkTimeMinutes": 5,
    "description": "Student residential courtyard block equipped with amenities, dining mess, and recreation common rooms.",
    "directionsFromGate": "Take the eastern perimeter road branching left past Atithi hostel; approx. 350 metres walk.",
    "pose": {
      "distance": 92,
      "tilt": 0.18,
      "heading": 1.57
    },
    "featured": true
  },
  {
    "id": "proposed-hostel",
    "name": "Proposed Hostel Block",
    "category": "Hostel",
    "mapCoords": {
      "x": 654,
      "y": 121
    },
    "walkTimeMinutes": 6,
    "description": "Planned multi-wing residential complex as part of the expanding GSV master plan.",
    "directionsFromGate": "Situated in the eastern residential sector beyond the current hostel block.",
    "pose": {
      "distance": 110,
      "tilt": 0.2,
      "heading": 3.14
    },
    "featured": false
  },
  {
    "id": "atithi-hostel",
    "name": "Atithi Hostel",
    "category": "Hostel",
    "mapCoords": {
      "x": 530.5,
      "y": 80.5
    },
    "walkTimeMinutes": 3,
    "description": "Guest and delegate residence near the campus arterial road, providing hospitality for judges, VIPs, and external faculty.",
    "directionsFromGate": "Head east along the inner loop road from the academic sector.",
    "pose": {
      "distance": 82,
      "tilt": 0.18,
      "heading": 0
    },
    "featured": true
  },
  {
    "id": "proposed-lab",
    "name": "Proposed Laboratory Block",
    "category": "Academic",
    "mapCoords": {
      "x": 511.5,
      "y": 158
    },
    "walkTimeMinutes": 4,
    "description": "Future multi-disciplinary testing and research facility with planned rooftop solar canopy.",
    "directionsFromGate": "South-east quadrant near the academic expansion corridor.",
    "pose": {
      "distance": 100,
      "tilt": 0.2,
      "heading": 3.14
    },
    "featured": false
  },
  {
    "id": "proposed-academic",
    "name": "Proposed Academic Block",
    "category": "Academic",
    "mapCoords": {
      "x": 496,
      "y": 277
    },
    "walkTimeMinutes": 5,
    "description": "Future academic expansion wing outlined in the master plan for transport and logistics disciplines.",
    "directionsFromGate": "South corridor past Manthan building.",
    "pose": {
      "distance": 108,
      "tilt": 0.2,
      "heading": 3.14
    },
    "featured": false
  },
  {
    "id": "palace",
    "name": "Pratap Vilas Palace",
    "category": "Landmark",
    "mapCoords": {
      "x": 341,
      "y": 189
    },
    "walkTimeMinutes": 3,
    "description": "Historic heritage palace of Vadodara, featuring neoclassical architecture, manicured lawns, and stately columns. Hosts outdoor drama, photography, and ceremonial gatherings.",
    "directionsFromGate": "Follow the main central avenue south for 220 metres; the palace overlooks the grand central lawn.",
    "pose": {
      "distance": 105,
      "tilt": 0.18,
      "heading": -1.57
    },
    "featured": true
  },
  {
    "id": "rajabaug",
    "name": "Rajabaug (Pre-Agnee Stalls)",
    "category": "Festival",
    "mapCoords": {
      "x": 256,
      "y": 189
    },
    "walkTimeMinutes": 3,
    "description": "Historic royal palace gardens hosting the Pre-Agnee Fun Carnival with 10 interactive fun stalls (carnival games, VR, merch, food), central open-air performance arena, and western fountain plaza.",
    "directionsFromGate": "Follow the central avenue south to Pratap Vilas Palace; the Rajabaug carnival gateway is directly across the road on the west (~230 metres).",
    "pose": {
      "distance": 85,
      "tilt": 0.22,
      "heading": 1.57
    },
    "featured": true
  },
  {
    "id": "manthan",
    "name": "Manthan Building",
    "category": "Landmark",
    "mapCoords": {
      "x": 435,
      "y": 201
    },
    "walkTimeMinutes": 4,
    "description": "Sandstone heritage building with an iconic dome and portico, housing executive seminar halls and festival debating/literary competitions.",
    "directionsFromGate": "Take the fork south-east from the palace lawn; approx. 280 metres.",
    "pose": {
      "distance": 78,
      "tilt": 0.18,
      "heading": 3.14
    },
    "featured": true
  },
  {
    "id": "oval-ground",
    "name": "Oval Ground (Festival Arena)",
    "category": "Festival",
    "mapCoords": {
      "x": 240,
      "y": 270
    },
    "walkTimeMinutes": 4,
    "description": "The beating heart of Agnee 2026. The expansive Oval Ground hosts the main concert stage, student crowd zones, festival stalls, and open-air battle cyphers.",
    "directionsFromGate": "Walk south past the palace, then veer south-west along the path directly entering the festival arena gate; approx. 320 metres (4 minutes walking).",
    "pose": {
      "distance": 125,
      "tilt": 0.24,
      "heading": 0.785
    },
    "featured": true
  },
  {
    "id": "stage",
    "name": "Main Stage (Oval Ground)",
    "category": "Festival",
    "mapCoords": {
      "x": 210,
      "y": 270
    },
    "walkTimeMinutes": 5,
    "description": "The massive Agnee concert stage at the west rim of the Oval Ground, featuring high-output line arrays, dynamic LED screens, and moving head lighting rigs.",
    "directionsFromGate": "Follow the perimeter path around the Oval Ground to the west end; approx. 360 metres.",
    "pose": {
      "distance": 48,
      "tilt": 0.12,
      "heading": 1.57
    },
    "featured": true
  },
  {
    "id": "stalls",
    "name": "Festival Stalls & Flea",
    "category": "Festival",
    "mapCoords": {
      "x": 265,
      "y": 270
    },
    "walkTimeMinutes": 4,
    "description": "Food court, creative artisan stalls, merchandise counters, interactive games, and student entrepreneur kiosks bordering the Oval Ground.",
    "directionsFromGate": "East promenade of the Oval Ground; approx. 300 metres.",
    "pose": {
      "distance": 58,
      "tilt": 0.14,
      "heading": -1.57
    },
    "featured": false
  },
  {
    "id": "sponsor-wall",
    "name": "Sponsor Showcase Wall",
    "category": "Festival",
    "mapCoords": {
      "x": 242,
      "y": 248.5
    },
    "walkTimeMinutes": 4,
    "description": "Interactive brand experience zone and sponsor installation wall overlooking the north entrance to the Oval Ground.",
    "directionsFromGate": "North rim of the Oval Ground; approx. 290 metres.",
    "pose": {
      "distance": 62,
      "tilt": 0.12,
      "heading": 0
    },
    "featured": false
  }
];
