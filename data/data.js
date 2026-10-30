// Central festival data: edit content here only. Rendered by src/ui/*.js via src/core/data-loader.js

export const site = {
  "festName": "Agnee 2026",
  "festEdition": "2026",
  "institution": "Gati Shakti Vishwavidyalaya",
  "institutionShort": "GSV",
  "location": "Vadodara, Gujarat, India",
  "venue": "Oval Ground, Gati Shakti Vishwavidyalaya Campus, Vadodara",
  "dates": "31 October 2026",
  "datesConfigured": null,
  "tagline": "Igniting the Spirit of Expression · The Annual Cultural Fest of GSV",
  "description": "Agnee is the flagship annual cultural festival of Gati Shakti Vishwavidyalaya, Vadodara. Bringing together talents in music, dance, theater, literature, art, and creative expression from across India.",
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
    posterImage: 'assets/events/DNQ.webp',
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
    posterImage: 'assets/events/muscle-mania.webp',
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
    posterImage: 'assets/events/treasure-hunt.webp',
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
    posterImage: 'assets/events/bow.webp',
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
    posterImage: 'assets/events/BCLUB.webp',
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
    posterImage: 'assets/events/sur-sangram.webp',
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
    posterImage: 'assets/events/ramp-walk.webp',
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
      { "time": "18:05", "mins": "15", "name": "SWARSUDHA (स्वर - सुधा) - CLASSICAL" },
      { "time": "18:20", "mins": "30", "name": "SITA SWAYAMVAR (सीता स्वयंवर) - CLASSICAL" },
      { "time": "18:50", "mins": "20-25", "name": "FASHION SHOW - CLASSICAL" }
    ],
    [
      { "time": "19:15", "mins": "15", "name": "EUPHONIA - BOLLYWOOD" },
      { "time": "19:30", "mins": "20", "name": "INDIA UNPLUGGED - FOLK" },
      { "time": "19:35", "mins": "5", "name": "STUDENT FELICITATION" },
      { "time": "19:40", "mins": "20", "name": "DRAMA - COURT ROOM" }
    ],
    [
      { "time": "20:00", "mins": "10", "name": "SWIPE & SLAY" },
      { "time": "20:10", "mins": "20", "name": "TARANG (तरंग) - MALHAAR - ROCK" }
    ],
    [
      { "time": "20:30", "mins": "5", "name": "गांडीव-गर्जना - THE THUNDER OF KURUKSHETRA  ~by Hardik Singh" },
      { "time": "20:35", "mins": "20-25", "name": "FASHION SHOW - WESTERN" }
    ],
    [
      { "time": "21:10", "mins": "", "name": "DJ NIGHT" }
    ]
  ]
};


export const guests = [
  {
    id: 'SBI',
    name: 'Mr. Saleem Ahmad',
    role: 'Deputy General Manager (B&O)',
    bank: 'State Bank of India',
    place: 'Administrative Office, Vadodara',
    category: '',
    photo: '/assets/guests/Saleem.webp',
    bio: 'Deputy General Manager (B&O), State Bank of India, Administrative Office, Vadodara'
  },
  {
    id: 'SBI',
    name: 'Ms. Meenakshi Sinha',
    role: 'AGM, Deposit & VAS',
    bank: 'State Bank of India',
    place: 'Vadodara Administrative Office',
    category: '',
    photo: '/assets/guests/Meenakshi.webp',
    bio: 'AGM, Deposit & VAS, State Bank of India, Vadodara Administrative Office'
  },
  {
    id: 'UBI',
    name: 'Mr.Aashish Suwalka ',
    role: 'Regional Head',
    bank: 'Union Bank of India',
    place: 'Vadodara, Gujarat',
    category: '',
    photo: '/assets/guests/aashish-suwalka.webp',
    bio: 'Regional Head, Union Bank of India'
  },
  {
    id: 'UBI',
    name: 'Mr. Samir Ranjan Mishra',
    role: 'Dy. Regional Head',
    bank: 'Union Bank of India',
    place: 'Vadodara, Gujarat',
    category: '',
    photo: '/assets/guests/samir-ranjan.webp',
    bio: 'Dy. Regional Head, Union Bank of India'
  }
];

export const sponsors = {
  "contactEmail": "student.cell@gsv.ac.in",
  "tiers": [
    {
      "tierName": "Sponsored By",
      "tierKey": "title",
      "description": "",
      "sponsors": [
        {
          "name": "State Bank of India",
          "logo": "assets/sponsors/sbi.webp"
        }
      ]
    },
    {
      "tierName": "Sponsored By",
      "description": "",
      "sponsors": [
        {
          "name": "Union Bank of India",
          "logo": "assets/sponsors/ubi.webp"
        }
      ]
    }
  ]
};

export const gallery = {
  // Videos: the first one is the default and autoplays in the player; any more appear as a stack below it.
  // id = YouTube ID (the part after youtu.be/), or src = a video file in assets/ (mp4 or webm); thumb (optional) = local image for the card, so nothing loads from YouTube until a video is played.
  videos: [
    { id: 'Vlz_zyzHYcw', title: "Agnee'26 Trailer", thumb: 'assets/gallery/trailer_thumbnail.webp' },
    // YouTube:    { id: 'XXXXXXXXXXX', title: 'Agnee 2025 Aftermovie', thumb: 'assets/gallery/video-2025.webp' },
    // From assets: { src: 'assets/videos/aftermovie.mp4', title: 'Aftermovie', thumb: '' },  (thumb optional: the card shows the video's first frame)
    // { src: 'assets/videos/treasure_hunt_1.mp4', title: 'Treasure Hunt', thumb: 'assets/events/treasure-hunt.webp' },
    // { src: 'assets/videos/treasure_hunt_2.mp4', title: 'Treasure Hunt', thumb: 'assets/events/treasure-hunt.webp' },
  ],
  photos: [
    { src: 'assets/gallery/1.webp' },
    { src: 'assets/gallery/2.webp' },
    { src: 'assets/gallery/3.webp' },
    { src: 'assets/gallery/4.webp' },
    { src: 'assets/gallery/9.webp' },
    { src: 'assets/gallery/5.webp' },
    { src: 'assets/gallery/6.webp' },
    { src: 'assets/gallery/7.webp' },
    { src: 'assets/gallery/8.webp' }
  ]
};

export const merch = [
  {
    id: 'tshirt',
    name: 'Inferno Red',
    price: '',
    image: 'assets/merch/red.webp',
    // buyUrl: 'https://forms.gle/fzC46cAi2thMU7Er7',
    state: 'Coming Soon!'
  },
  {
    id: 'hoodie',
    name: 'Eclipse Black',
    price: '',
    image: 'assets/merch/black.webp',
    // buyUrl: 'https://forms.gle/fzC46cAi2thMU7Er7',
    state: 'Coming Soon!'
  },
  {
    id: 'tote',
    name: 'Ethereal White',
    price: '',
    image: 'assets/merch/white.webp',
    // buyUrl: 'https://forms.gle/fzC46cAi2thMU7Er7',
    state: 'Coming Soon!'
  }
];

export const team = {
  facultyAdvisors: [
    {
      name: 'Prof. R. Edwin Raj',
      role: "Dean (Students' Welfare)",
      // "department": "Gati Shakti Vishwavidyalaya",
      email: 'dean.sw@gsv.ac.in',
      linkedin: 'https://www.linkedin.com/in/dr-r-edwin-raj-21b00628/',
      avatar: 'assets/oc/edwin_sir.webp'
    },
    {
      name: 'Dr. Ram K. Upadhyay',
      role: 'Faculty In-Charge',
      // "department": "Gati Shakti Vishwavidyalaya",
      email: 'ram.upadhyay@gsv.ac.in',
      linkedin: 'https://www.linkedin.com/in/ram-krishna-upadhyay-13767b2b8/',
      avatar: 'assets/oc/ram_sir.webp'
    }
  ],
  creativeTeam: [
    {
      name: 'Ravi Panchal',
      role: '',
      team: 'Development Team',
      email: 'ravi.panchal_btech23@gsv.ac.in',
      linkedin: 'https://www.linkedin.com/in/ravixpanchal/',
      github: 'https://github.com/ravixpanchal',
      avatar: 'assets/oc/ravi.webp'
    },
    {
      name: 'Rishav Kumar',
      role: '',
      team: 'Development Team',
      email: 'rishav.kumar_btech23@gsv.ac.in',
      linkedin: 'https://www.linkedin.com/in/rkgsv/',
      github: 'https://github.com/rishavgsv',
      avatar: 'assets/oc/rishav.webp'
    },
    {
      name: 'Shashank Savarkar',
      role: '',
      team: 'Development Team',
      email: 'savarkar.shashank_btech24@gsv.ac.in',
      linkedin: 'https://www.linkedin.com/in/shashanksavarkar/',
      github: 'https://github.com/shashanksavarkar',
      avatar: 'assets/oc/shashank.webp'
    },
    {
      name: 'Abhinav Kesarwani',
      role: '',
      team: 'Development Team',
      email: 'abhinav.kesarwani_btech23@gsv.ac.in',
      linkedin: 'https://www.linkedin.com/in/abhinav-kesarwani/',
      github: 'https://github.com/AbhiKesarwani',
      avatar: 'assets/oc/abhinav.webp'
    },
    {
      name: 'Ajitesh Channa',
      role: '',
      team: 'Development Team',
      email: 'ajitesh.channa_btech23@gsv.ac.in',
      linkedin: 'https://www.linkedin.com/in/ajiteshchanna/',
      github: 'https://github.com/ajiteshchanna',
      avatar: 'assets/oc/ajitesh.webp'
    }
  ],
  coreTeam: [
    {
      name: 'Himanshu Kumar',
      role: 'Overall Coordinator',
      team: 'President - Student Cell GSV',
      email: 'himanshu.yadav_btech23@gsv.ac.in',
      linkedin: 'https://www.linkedin.com/in/himanshu-kumar-yadav-0b792a2ba/',
      avatar: 'assets/oc/himanshu.webp'
    },
    {
      name: 'Rishav Kumar',
      role: 'Overall Coordinator',
      team: 'Vice-President',
      email: 'rishav.kumar_btech23@gsv.ac.in',
      linkedin: 'https://www.linkedin.com/in/rkgsv/',
      avatar: 'assets/oc/rishav.webp'
    },
    {
      name: 'Atulya Bharat',
      role: 'Tech Lead',
      team: 'Overall Coordinator',
      email: 'atulya.bharat_btech24@gsv.ac.in',
      linkedin: 'https://www.linkedin.com/in/atulyabharat/',
      avatar: 'assets/oc/atulya.webp'
    },
    {
      name: 'Harshit Verma',
      role: 'Overall Coordinator',
      team: 'Cultural Secretary',
      email: 'harshit.verma_btech24@gsv.ac.in',
      linkedin: 'https://www.linkedin.com/in/harshit-verma-1a6558418/',
      avatar: 'assets/oc/harshit.webp'
    },
    {
      name: 'Rupesh Kumar',
      role: 'Operations Lead',
      team: 'Sports Secretary',
      email: 'rupesh.kumar_btech24@gsv.ac.in',
      linkedin: 'https://www.linkedin.com/in/rupesh-kumar-2627772a4/',
      avatar: 'assets/oc/rupesh.webp'
    },
    {
      name: 'Soumya Banerjee',
      role: 'Media \& Publicity',
      team: 'External Secretary',
      email: 'soumya.banerjee_btech23@gsv.ac.in',
      linkedin: 'https://www.linkedin.com/in/soumya04banerjee/',
      avatar: 'assets/oc/soumya.webp'
    },
    {
      name: 'Ananya Kasaudhan',
      role: 'Media \& Publicity',
      team: 'External Secretary',
      email: 'ananya.kasaudhan_btech24@gsv.ac.in',
      linkedin: 'https://www.linkedin.com/in/ananya-kasaudhan-617531328/',
      avatar: 'assets/oc/ananya.webp'
    }
  ]
};

export const faqs = [
  {
    "category": "General",
    "question": "What is Agnee 2026?",
    "answer": "Agnee is the annual cultural festival of Gati Shakti Vishwavidyalaya (GSV), Vadodara. It brings together college students from across the country for one day of music, dance, theatre, arts, fashion, and literary competitions."
  },
  {
    "category": "General",
    "question": "When and where will Agnee 2026 take place?",
    "answer": "Agnee 2026 will be held at the Gati Shakti Vishwavidyalaya campus in Vadodara, Gujarat. Agnee is a one-day festival on 31 October 2026."
  },
  {
    "category": "Competitions",
    "question": "What are the eligibility criteria for participating in competitions?",
    "answer": "Participants must be enrolled students of Gati Shakti Vishwavidyalaya and possess a valid college identity card. Specific rules, team size limits, and submission guidelines are provided on each event card in the Events section."
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
