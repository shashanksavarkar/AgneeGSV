// Map places data (kept separate from data.js; the map reads this)

export const places = [
  {
    "id": "main-gate",
    "name": "Main Gate",
    "category": "Entrance",
    "mapCoords": {
      "x": 577,
      "y": 46
    },
    "walkTimeMinutes": 0,
    "description": "Main campus entrance and primary security checkpoint. Features the iconic bilingual university archway, guard cabins, and reception gate.",
    "directionsFromGate": "Starting point. Proceed through the main archway along the campus road towards the Academic Block and Palaces.",
    "pose": {
      "distance": 52,
      "tilt": 0.14,
      "heading": 3.0
    },
    "featured": true
  },
  {
    "id": "academic-block",
    "name": "Academic Block",
    "category": "Academic",
    "mapCoords": {
      "x": 357,
      "y": 90.5
    },
    "walkTimeMinutes": 2,
    "description": "The primary academic building of Gati Shakti Vishwavidyalaya featuring its grand triple-arched entrance portico, university crest, and landmark dome.",
    "directionsFromGate": "Straight ahead from Main Gate, approximately 120 metres south along the tree-lined avenue.",
    "pose": {
      "distance": 54,
      "tilt": 0.15,
      "heading": 0
    },
    "featured": true
  },
  {
    "id": "current-hostel",
    "name": "Current Hostel (NHSRCL)",
    "category": "Hostel",
    "mapCoords": {
      "x": 605,
      "y": 148
    },
    "walkTimeMinutes": 5,
    "description": "High Speed Rail Training Institute (NHSRCL) hostel and facility featuring the iconic entrance portico canopy with bilingual signage, cascading steps, and landscaped forecourt.",
    "directionsFromGate": "Take the eastern perimeter road branching left past Atithi hostel; approx. 350 metres walk.",
    "pose": {
      "distance": 44,
      "tilt": 0.08,
      "heading": -1.5708
    },
    "featured": true
  },
  {
    "id": "proposed-hostel",
    "name": "Proposed Hostel Block",
    "category": "Hostel",
    "mapCoords": {
      "x": 606.5,
      "y": 100
    },
    "walkTimeMinutes": 6,
    "description": "Planned multi-wing residential complex as part of the expanding GSV master plan, with an entrance portico canopy on the west corridor.",
    "directionsFromGate": "Situated in the eastern residential sector along the inner campus road.",
    "pose": {
      "distance": 54,
      "tilt": 0.16,
      "heading": -1.57
    },
    "featured": false
  },
  {
    "id": "sabhagrah",
    "name": "Sardar Patel Sabhagrah",
    "category": "Auditorium",
    "mapCoords": {
      "x": 425,
      "y": 86.5
    },
    "walkTimeMinutes": 3,
    "description": "Sardar Patel Sabhagriha, the university auditorium and conference hall equipped for keynotes, cultural programs, and academic ceremonies.",
    "directionsFromGate": "Follow the avenue south past Academic Block, then turn east along the campus arterial road.",
    "pose": {
      "distance": 48,
      "tilt": 0.15,
      "heading": 0
    },
    "featured": true
  },
  {
    "id": "pahune-hostel",
    "name": "Pahune Hostel",
    "category": "Hostel",
    "mapCoords": {
      "x": 476,
      "y": 90
    },
    "walkTimeMinutes": 4,
    "description": "Pahune Hostel and Recreation Hall, featuring student residential quarters and a prominent central recreation pavilion.",
    "directionsFromGate": "Continue east along the main arterial road past Sabhagrah, located immediately before Atithi Hostel.",
    "pose": {
      "distance": 48,
      "tilt": 0.15,
      "heading": 0
    },
    "featured": true
  },
  {
    "id": "gsv-mess",
    "name": "GSV-MESS",
    "category": "Dining",
    "mapCoords": {
      "x": 434,
      "y": 145
    },
    "walkTimeMinutes": 2,
    "description": "GSV-MESS central dining building situated in front of Pahune Hostel and Manthan, featuring the GSV-MESS south gate opening toward Manthan and the Officer Mess north gate opening toward Pahune Hostel, complete with extensive rooftop solar power generation.",
    "directionsFromGate": "Follow the south corridor past Sabhagrah or head north from Manthan building.",
    "pose": {
      "distance": 54,
      "tilt": 0.16,
      "heading": 0
    },
    "featured": true
  },
  {
    "id": "atithi-hostel",
    "name": "Atithi Hostel",
    "category": "Hostel",
    "mapCoords": {
      "x": 516,
      "y": 105.8
    },
    "walkTimeMinutes": 3,
    "description": "Atithi Hostel featuring the iconic 2-story entrance portico with classical pillars, triangular pediment, bilingual signage, and forecourt.",
    "directionsFromGate": "Head east along the inner loop road from the academic sector.",
    "pose": {
      "distance": 29,
      "tilt": 0.11,
      "heading": 0
    },
    "featured": true
  },
  {
    "id": "mehman-hostel",
    "name": "Mehman Boy's Hostel",
    "category": "Hostel",
    "mapCoords": {
      "x": 293.8,
      "y": 51.5
    },
    "walkTimeMinutes": 2,
    "description": "Mehman Boy's Hostel, 3-story student residence situated before GSV Academic Block, featuring private room balconies, entrance canopy portico, enquiry office, and shaded forecourt.",
    "directionsFromGate": "Follow the western perimeter road towards the hostel sector situated immediately before the GSV Academic Block.",
    "pose": {
      "distance": 26,
      "tilt": 0.07,
      "heading": 0.60
    },
    "featured": true
  },
  {
    "id": "proposed-lab",
    "name": "Proposed Laboratory Block",
    "category": "Academic",
    "mapCoords": {
      "x": 511.5,
      "y": 131.5
    },
    "walkTimeMinutes": 4,
    "description": "Future multi-disciplinary testing and research facility featuring grand north entrance archway and rooftop solar canopy.",
    "directionsFromGate": "South-east quadrant near the academic expansion corridor.",
    "pose": {
      "distance": 50,
      "tilt": 0.15,
      "heading": 3.14
    },
    "featured": false
  },
  {
    "id": "proposed-academic",
    "name": "Proposed Academic Block",
    "category": "Academic",
    "mapCoords": {
      "x": 481,
      "y": 274.5
    },
    "walkTimeMinutes": 5,
    "description": "Future academic expansion wing outlined in the master plan with a grand entrance arch and stepped courtyard plaza.",
    "directionsFromGate": "South corridor past Manthan building.",
    "pose": {
      "distance": 52,
      "tilt": 0.15,
      "heading": 0
    },
    "featured": false
  },
  {
    "id": "palace",
    "name": "Prastuti",
    "category": "Landmark",
    "mapCoords": {
      "x": 320,
      "y": 189
    },
    "walkTimeMinutes": 3,
    "description": "Historic heritage palace of Vadodara, featuring neoclassical architecture, stately columns, and grand steps overlooking the central lawn.",
    "directionsFromGate": "Follow the main central avenue south for 220 metres; the palace overlooks the grand central lawn.",
    "pose": {
      "distance": 52,
      "tilt": 0.15,
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
    "id": "darshan",
    "name": "Darshan Building",
    "category": "Academic",
    "mapCoords": {
      "x": 394,
      "y": 180
    },
    "walkTimeMinutes": 3,
    "description": "Darshan building, landmark academic and seminar facility situated between Pratap Vilas Palace and Manthan, featuring the Prastuti north entrance forecourt, classical colonnade portico, and dual-language signage.",
    "directionsFromGate": "Proceed past the Central Academic Block and turn south towards the Pratap Vilas Palace East Loop.",
    "pose": {
      "distance": 46,
      "tilt": 0.15,
      "heading": 3.14159
    },
    "featured": true
  },
  {
    "id": "giriraj",
    "name": "Giriraj Grih",
    "category": "Residence",
    "mapCoords": {
      "x": 388,
      "y": 147
    },
    "walkTimeMinutes": 2,
    "description": "Giriraj Grih, distinguished VIP guest house and executive residence situated directly in front of Darshan building and adjacent to GSV-MESS, featuring octagonal architecture, a pillared portico with blue slate stone mosaic entrance, and suites named after Indian mountain ranges.",
    "directionsFromGate": "Follow the North Central Cross Avenue west from GSV-MESS or head north directly from the Darshan Prastuti forecourt.",
    "pose": {
      "distance": 42,
      "tilt": 0.16,
      "heading": 0
    },
    "featured": true
  },
  {
    "id": "manthan",
    "name": "Manthan Building",
    "category": "Landmark",
    "mapCoords": {
      "x": 435,
      "y": 183.6
    },
    "walkTimeMinutes": 4,
    "description": "Sandstone heritage building with an iconic dome, pediment porch, and maroon columns housing executive seminar halls.",
    "directionsFromGate": "Take the fork south-east from the palace lawn; approx. 280 metres.",
    "pose": {
      "distance": 48,
      "tilt": 0.15,
      "heading": 3.14
    },
    "featured": true
  },
  {
    "id": "oval-ground",
    "name": "Oval Ground (Festival Arena)",
    "category": "Festival",
    "mapCoords": {
      "x": 271.5,
      "y": 238.5
    },
    "walkTimeMinutes": 4,
    "description": "The beating heart of Agnee 2026. The expansive Oval Ground hosts the main concert stage, crowd zones, and festival stalls, entered through the Agnee welcome gate.",
    "directionsFromGate": "Walk south past the palace, then veer south-west along the path directly entering the festival arena gate; approx. 320 metres (4 minutes walking).",
    "pose": {
      "distance": 54,
      "tilt": 0.16,
      "heading": 0.785
    },
    "featured": true
  },
  {
    "id": "stage",
    "name": "Main Stage (Oval Ground)",
    "category": "Festival",
    "mapCoords": {
      "x": 218.8,
      "y": 291.2
    },
    "walkTimeMinutes": 5,
    "description": "The massive Agnee concert stage at the west rim of the Oval Ground, featuring high-output line arrays, dynamic LED screens, and moving head lighting rigs.",
    "directionsFromGate": "Follow the perimeter path around the Oval Ground to the west end; approx. 360 metres.",
    "pose": {
      "distance": 48,
      "tilt": 0.12,
      "heading": 2.35
    },
    "featured": true
  },
  {
    "id": "stalls",
    "name": "Festival Stalls & Flea",
    "category": "Festival",
    "mapCoords": {
      "x": 259.1,
      "y": 250.9
    },
    "walkTimeMinutes": 4,
    "description": "Food court, creative artisan stalls, merchandise counters, interactive games, and student entrepreneur kiosks bordering the Oval Ground.",
    "directionsFromGate": "East promenade of the Oval Ground; approx. 300 metres.",
    "pose": {
      "distance": 42,
      "tilt": 0.14,
      "heading": -0.785
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
      "distance": 44,
      "tilt": 0.12,
      "heading": 0
    },
    "featured": false
  }
];
