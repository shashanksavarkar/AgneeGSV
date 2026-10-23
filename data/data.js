// Central festival data: edit content here only. Rendered by src/ui/*.js via src/core/data-loader.js

export const site = {
  "festName": "Agnee 2026",
  "festEdition": "2026",
  "institution": "Gati Shakti Vishwavidyalaya",
  "institutionShort": "GSV",
  "location": "Vadodara, Gujarat, India",
  "venue": "Oval Ground, Gati Shakti Vishwavidyalaya Campus, Vadodara",
  "dates": "Agnee Week: 26-31 October 2026 · Pre-Agnee: 30 October · Agnee: 31 October",
  "datesConfigured": null,
  "vc": {
    "name": "Prof. Manoj Choudhary",
    "title": "Vice-Chancellor, Gati Shakti Vishwavidyalaya",
    "message": [
      "Replace this paragraph with the Vice-Chancellor's message to the participants of Agnee 2026.",
      "Add more paragraphs here, one string per paragraph."
    ],
    "photo": "",
    "videoId": ""
  },
  "tagline": "Igniting the Spirit of Expression · The Annual Cultural Fest of GSV",
  "description": "Agnee is the flagship annual cultural festival of Gati Shakti Vishwavidyalaya, Vadodara. Bringing together talents in music, dance, theater, literature, art, and creative expression from across India.",
  "announcements": [
    {
      "id": "ann-1",
      "text": "Agnee Week starts 26 October. Pre-Agnee on 30 October, Agnee on 31 October!",
      "badge": "Update",
      "link": "#about"
    },
    {
      "id": "ann-2",
      "text": "Campus Ambassador Programme registrations opening shortly.",
      "badge": "Ambassadors",
      "link": "#register"
    },
    {
      "id": "ann-3",
      "text": "Explore the 3D campus map and plan your festival journey.",
      "badge": "Interactive",
      "link": "#map"
    }
  ],
  "socials": [
    {
      "platform": "Instagram",
      "url": "https://instagram.com/studentcell.gsv",
      "icon": "instagram"
    },
    {
      "platform": "Instagram",
      "url": "https://instagram.com/agnee.gsv",
      "icon": "instagram"
    },
    {
      "platform": "LinkedIn",
      "url": "https://linkedin.com/company/student-cell-gsv",
      "icon": "linkedin"
    },
    {
      "platform": "YouTube",
      "url": "https://youtube.com/@gsv.vadodara",
      "icon": "youtube"
    }
  ],
  "contactEmail": "student.cell@gsv.ac.in",
  "analyticsEnabled": false
};

export const events = [
  {
    id: 'youth-parliament',
    name: 'Youth Parliament',
    category: 'Debate & Quiz Club GSV',
    tagline: 'Where Voices Rise and Leaders Emerge.',
    description: 'A dynamic platform where young minds engage in parliamentary debates, exchange perspectives, and experience the spirit of democracy and leadership.',
    teamSize: {
      min: 1,
      max: 1
    },
    schedule: {
      day: 'Pre-Agnee',
      venueName: 'To be announced'
    },
    posterImage: 'assets/DNQ.webp',
    tags: ['Debating', 'Pre-Agnee']
  },
  {
    id: 'muscle-mania',
    name: 'Muscle Mania',
    category: 'Sports Committee GSV',
    tagline: 'Ignite the Strength, Unleash the AGNEE!',
    description: 'A thrilling test of strength, stamina, and teamwork to ignite the competitive spirit before AGNEE',
    teamSize: {
      min: "Solo / Duo / Team",
      max: "",
    },
    schedule: {
      day: 'Pre-Agnee',
      venueName: 'Prastuti (Raja Baug)'
    },
    posterImage: 'assets/muscle-mania.webp',
    tags: ['Fitness', 'Pre-Agnee']
  },
  {
    id: 'treasure-hunt',
    name: 'Treasure Hunt',
    category: 'Media & Tech Club GSV',
    tagline: 'One Campus. Countless Clues. One Treasure.',
    description: 'Crack riddles, uncover hidden clues across campus, and race against rival teams to claim the treasure!',
    teamSize: {
      min: 4,
      max: 4
    },
    schedule: {
      day: 'Pre-Agnee',
      venueName: 'Prastuti (Darshan Front)'
    },
    posterImage: 'assets/treasure-hunt.webp',
    tags: ['Adventure', 'Pre-Agnee']
  },
  {
    id: 'battle-of-wits',
    name: 'Battle of Wits',
    category: 'Literary Club GSV',
    tagline: 'Rattle your hits, Because it\'s, Battle of Wits',
    description: 'A three-round team Pop Culture event that will test your squad\'s Ball knowledge on topics ranging from Nostalgic Shows and Brain Rot memes to current affairs \& sports and challenge your mates to solve mind-boggling puzzles and act out your fantasies, crowning the ultimate champion of the Battle of Wits!',
    teamSize: {
      min: 1,
      max: 4
    },
    schedule: {
      day: 'Agnee',
      venueName: 'Multi Purpose Hall'
    },
    posterImage: 'assets/bow.webp',
    tags: ['Quiz', 'Pre-Agnee']
  },
  {
    id: 'brandwars',
    name: 'Brandwars',
    category: 'एधार्थ (Edhartha) - B Club GSV',
    tagline: 'Build. Battle. Brand.',
    description:
      'Transform a Brand , sell a vision, outsmart the competition and prove your brand-building skills.',
    teamSize: {
      min: 2,
      max: 2
    },
    schedule: {
      day: 'Pre-Agnee',
      venueName: 'Manthan'
    },
    posterImage: 'assets/BCLUB.webp',
    tags: ['Marketing', 'Pre-Agnee']
  },
  {
    id: 'sur-sangram',
    name: 'Sur Sangram',
    category: 'Malhaar Music Club GSV',
    tagline: 'You know your music? ',
    description: 'Sur Sangraam is a high-energy musical trivia showdown where teams battle through song-guessing challenges, music quizzes, and a mystery round to claim victory.',
    teamSize: {
      min: 4,
      max: 4
    },
    schedule: {
      day: 'Pre-Agnee',
      venueName: 'To be announced'
    },
    posterImage: 'assets/sur-sangram.webp',
    tags: ['Singing', 'Pre-Agnee']
  },
    {
    id: 'ramp-walk',
    name: 'Traditional & Modern Ramp Walk',
    category: 'Event Management Club GSV',
    tagline: 'Celebrate Culture. Unleash Creativity. Own the Ramp!',
    description: 'Showcase your cultural heritage or bring your favourite fictional characters to life as you own the ramp and compete for exciting prizes!',
    teamSize: {
      min: 1,
      max: 1
    },
    schedule: {
      day: 'Agnee',
      venueName: 'Agnee Stage'
    },
    posterImage: 'assets/sur-sangram.webp',
    tags: ['Ramp Walk', 'Pre-Agnee']
  },
];

// Timeline section: the Performances card.
export const schedule = {
  // Performances program, in running order; each inner list is one block of the show; mins is the slot length in minutes
  "program": [
    [
      { "time": "17:30", "mins": "5", "name": "WELCOME ADDRESS" },
      { "time": "17:35", "mins": "5", "name": "LAMP LIGHTING" },
      { "time": "17:40", "mins": "15", "name": "VICE CHANCELLOR’S ADDRESS" },
      { "time": "17:55", "mins": "10", "name": "WELCOMING OF GUESTS" }
    ],
    [
      { "time": "18:05", "mins": "15", "name": "MALHAAR - CLASSICAL" },
      { "time": "18:20", "mins": "30", "name": "DRAMA + NRITYA - CLASSICAL" },
      { "time": "18:50", "mins": "20-25", "name": "FASHION SHOW - CLASSICAL" }
    ],
    [
      { "time": "19:15", "mins": "15", "name": "MALHAAR - BOLLYWOOD" },
      { "time": "19:30", "mins": "20", "name": "NRITYA - FOLK" },
      { "time": "19:35", "mins": "5", "name": "STUDENT FELICITATION" },
      { "time": "19:40", "mins": "20", "name": "DRAMA - COURT ROOM" }
    ],
    [
      { "time": "20:00", "mins": "10", "name": "NRITYA - REELS" },
      { "time": "20:10", "mins": "20", "name": "MALHAAR - ROCK" }
    ],
    [
      { "time": "20:30", "mins": "5", "name": "INDEPENDENT PERFORMANCE - HARDIK" },
      { "time": "20:35", "mins": "20-25", "name": "FASHION SHOW - WESTERN" }
    ],
    [
      { "time": "21:10", "mins": "", "name": "DJ NIGHT" }
    ]
  ]
};

// buyUrl: link to the order form / payment page. Leave it empty until sales open.
export const merch = [
  { id: 'tshirt', name: 'Inferno Red', price: '₹499/- + Extra Delivery Charges', image: 'assets/red.webp', buyUrl: 'https://forms.gle/fzC46cAi2thMU7Er7', state: 'Available' },
  { id: 'hoodie', name: 'Eclipse Black', price: '₹499/- + Extra Delivery Charges', image: 'assets/black.webp', buyUrl: 'https://forms.gle/fzC46cAi2thMU7Er7', state: 'Available' },
  { id: 'tote', name: 'Ethereal White', price: '₹499/- + Extra Delivery Charges', image: 'assets/white.webp', buyUrl: 'https://forms.gle/fzC46cAi2thMU7Er7', state: 'Available' }
];

export const guests = [
  {
    "id": "guest-proshow-day1",
    "name": "",
    "category": "",
    "bio": ""
  },
  {
    "id": "TOP",
    "name": "Mr. Guest Name",
    "category": "",
    "bio": "Designation, Organisation"
  },
  {
    "id": "SBI",
    "name": "Mr. Saleem Ahmad",
    "category": "",
    "bio": "Deputy General Manager (B&O), SBI, Vadodara Administrative Office"
  },
  {
    "id": "SBI",
    "name": "Mr. Neeraj Kumar Sinha",
    "category": "",
    "bio": "AGM, SBI, Regional Business Office-1, Vadodara "
  },
  {
    "id": "SBI",
    "name": "Ms. Meenakshi Sinha",
    "category": "",
    "bio": "AGM, Deposit & VAS, Vadodara Administrative Office"
  },
  {
    "id": "SBI",
    "name": "Mr. Vikash Kumar",
    "category": "",
    "bio": "Chief Manager, Lalbaug, Vadodara"
  },  {
    "id": "UBI",
    "name": "Mr.Aashish Suwalka ",
    "category": "",
    "bio": "Regional Head, Union Bank of India"
  },
  {
    "id": "UBI",
    "name": "Mr. Samir Ranjan Mishra",
    "category": "",
    "bio": "Dy. Regional Head, Union Bank of India"
  },
  {
    "id": "UBI",
    "name": "Mr. Manish Kumar",
    "category": "",
    "bio": "Dy. Regional Head, Union Bank of India"
  }
];

export const sponsors = {
  "deckDownloadUrl": "#sponsors",
  "contactEmail": "sponsorship@gsv.ac.in",
  "brochureNote": "Download our comprehensive sponsorship deck to discover brand integration avenues, stage presence, and student outreach opportunities at Gati Shakti Vishwavidyalaya.",
  "tiers": [
    {
      "tierName": "Sponsored By",
      "tierKey": "title",
      "description": "",
      "sponsors": [
        {
          "name": "State Bank of India",
          "logo": "assets/State_Bank_of_India-removebg-preview.webp",
          "website": "https://sbi.co.in"
        }
      ]
    },
    {
      "tierName": "Sponsored By",
      "tierKey": "powered-by",
      "description": "",
      "sponsors": [
        {
          "name": "Union Bank of India",
          "logo": "assets/Union_Bank_of_India_Logo-removebg-preview.webp",
          "website": "https://www.unionbankofindia.co.in"
        }
      ]
    }
  ]
};

export const team = {
  facultyAdvisors: [
    {
      name: 'Dr. R. Edwin Raj',
      role: "Dean (Students' Welfare)",
      // "department": "Gati Shakti Vishwavidyalaya",
      email: 'dean.sw@gsv.ac.in',
      linkedin: 'https://www.linkedin.com/in/dr-r-edwin-raj-21b00628/',
      avatar: 'assets/edwin_sir.webp'
    },
    {
      name: 'Dr. Ram Upadhyay',
      role: 'Faculty In-Charge',
      // "department": "Gati Shakti Vishwavidyalaya",
      email: 'ram.upadhyay@gsv.ac.in',
      linkedin: 'https://www.linkedin.com/in/ram-krishna-upadhyay-13767b2b8/',
      avatar: 'assets/ram_sir.webp'
    },
    {
      name: 'Dr. Prasiddh K Trivedi',
      role: 'Faculty In-Charge',
      // "department": "Gati Shakti Vishwavidyalaya",
      email: 'prasiddh.trivedi@gsv.ac.in',
      linkedin: 'https://www.linkedin.com/in/prasiddh-trivedi-2b212a3b/',
      avatar: 'assets/prasiddh_sir.webp'
    }
  ],
  creativeTeam: [
    { name: 'Ravi Panchal', role: '', team: 'Creative Team', email: '', linkedin: 'https://www.linkedin.com/in/ravixpanchal/', github: 'https://github.com/ravixpanchal', avatar: 'assets/ravi.webp' },
    { name: 'Rishav Kumar', role: '', team: 'Creative Team', email: '', linkedin: 'https://www.linkedin.com/in/rkgsv/', github: 'https://github.com/rishavgsv', avatar: 'assets/rishav.webp' },
    { name: 'Shashank Savarkar', role: '', team: 'Creative Team', email: '', linkedin: 'https://www.linkedin.com/in/shashanksavarkar/', github: 'https://github.com/shashanksavarkar', avatar: 'assets/shashank.webp' },
    { name: 'Abhinav Kesarwani', role: '', team: 'Creative Team', email: '', linkedin: 'https://www.linkedin.com/in/abhinav-kesarwani/', github: 'https://github.com/AbhiKesarwani', avatar: 'assets/abhinav.webp' }
  ],
  coreTeam: [
    {
      name: 'Himanshu Kumar',
      role: 'Overall Coordinator',
      team: 'President - Student Cell GSV',
      email: 'himanshu.yadav_btech23@gsv.ac.in',
      linkedin: 'https://www.linkedin.com/in/himanshu-kumar-yadav-0b792a2ba/',
      avatar: 'assets/himanshu.webp'
    },
    {
      name: 'Rishav Kumar',
      role: 'Overall Coordinator',
      team: 'Vice-President',
      email: 'rishav.kumar_btech23@gsv.ac.in',
      linkedin: 'https://www.linkedin.com/in/rkgsv/',
      avatar: 'assets/rishav.webp'
    },
    {
      name: 'Atulya Bharat',
      role: 'Tech Lead',
      team: 'Overall Coordinator',
      email: 'atulya.bharat_btech24@gsv.ac.in',
      linkedin: 'https://www.linkedin.com/in/atulyabharat/',
      avatar: 'assets/atulya.webp'
    },
    {
      name: 'Harshit Verma',
      role: 'Overall Coordinator',
      team: 'Cultural Secretary',
      email: 'harshit.verma_btech24@gsv.ac.in',
      linkedin: 'https://www.linkedin.com/in/harshit-verma-1a6558418/',
      avatar: 'assets/harshit.webp'
    },
    ,
    {
      name: 'Soumya Banerjee',
      role: 'Media \& Publicity',
      team: 'External Secretary',
      email: 'soumya.banerjee_btech23@gsv.ac.in',
      linkedin: 'https://www.linkedin.com/in/soumya04banerjee/',
      avatar: 'assets/soumya.webp'
    },
    {
      name: 'Ananya Kasaudhan',
      role: 'Media \& Publicity',
      team: 'External Secretary',
      email: 'ananya.kasaudhan_btech24@gsv.ac.in',
      linkedin: 'https://www.linkedin.com/in/ananya-kasaudhan-617531328/',
      avatar: 'assets/ananya.webp'
    },
    {
      name: 'Rupesh Kumar',
      role: 'Operations Lead',
      team: 'Sports Secretary',
      email: 'rupesh.kumar_btech24@gsv.ac.in',
      linkedin: 'https://www.linkedin.com/in/rupesh-kumar-2627772a4/',
      avatar: 'assets/rupesh.webp'
    }
  ]
};

export const faqs = [
  {
    "category": "General",
    "question": "What is Agnee 2026?",
    "answer": "Agnee is the annual cultural festival of Gati Shakti Vishwavidyalaya (GSV), Vadodara. It brings together college students from across the country for three days of music, dance, theatre, arts, fashion, and literary competitions."
  },
  {
    "category": "General",
    "question": "When and where will Agnee 2026 take place?",
    "answer": "Agnee 2026 will be held at the Gati Shakti Vishwavidyalaya campus in Vadodara, Gujarat. Agnee Week runs from 26 to 31 October 2026, with Pre-Agnee on 30 October and the main Agnee day on 31 October."
  },
  {
    "category": "Competitions",
    "question": "What are the eligibility criteria for participating in competitions?",
    "answer": "Participants must be enrolled college/university students with a valid college identity card. Specific rules, team size limits, and submission guidelines are listed on each event card in the Events section."
  },
  {
    "category": "Stay & Travel",
    "question": "How do I reach Gati Shakti Vishwavidyalaya, Vadodara?",
    "answer": "The GSV campus is conveniently accessible from Vadodara Junction Railway Station (approx. 5 km) and Vadodara Airport (BDQ, approx. 10 km). Auto-rickshaws, city buses, and app-based cabs (Ola/Uber) are readily available."
  },
  {
    "category": "Campus Rules",
    "question": "What are the campus entry and security protocols?",
    "answer": "All visitors and participants must present their original government photo ID and college identity card at the Main Gate. Possession or consumption of alcohol, tobacco, narcotics, or any hazardous materials is strictly prohibited on university premises."
  }
];

// Gallery marquee. top scrolls right-to-left, bottom scrolls left-to-right.
// Put the photo path in src (e.g. "assets/gallery/stage.webp"); while src is "" a coloured placeholder tile is shown.
export const gallery = {
  trailerId: 'Vlz_zyzHYcw', // YouTube video ID of the Agnee'26 trailer (the part after youtu.be/)
  top: [
    { title: "Oval Ground Stage at Dusk", tag: "Stage", color: "#5b1a8f", src: "/assets/1.webp" },
    { title: "Street Theatre (Nukkad Natak)", tag: "Culture", color: "#d6246e", src: "/assets/2.webp" },
    { title: "Classical Dance Abhinaya", tag: "Dance", color: "#7bc62d", src: "/assets/3.webp" },
    { title: "Classical Dance Abhinaya", tag: "Dance", color: "#7bc62d", src: "/assets/4.webp" },
    { title: "Classical Dance Abhinaya", tag: "Dance", color: "#7bc62d", src: "/assets/9.webp" }
  ],
  bottom: [
    { title: "Pratap Vilas Palace Facade", tag: "Campus", color: "#1f6fd6", src: "/assets/5.webp" },
    { title: "Crowd Energy at Battle of the Bands", tag: "Energy", color: "#ff9a2e", src: "/assets/6.webp" },
    { title: "Campus Night Illuminations", tag: "Atmosphere", color: "#2b2f3a", src: "/assets/7.webp" },
    { title: "Campus Night Illuminations", tag: "Atmosphere", color: "#2b2f3a", src: "/assets/8.webp" },
    { title: "Pratap Vilas Palace Facade", tag: "Campus", color: "#1f6fd6", src: "/assets/5.webp" },
    { title: "Campus Night Illuminations", tag: "Atmosphere", color: "#2b2f3a", src: "/assets/7.webp" },
  ]
};

