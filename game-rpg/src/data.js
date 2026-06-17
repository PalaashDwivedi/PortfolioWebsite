import ancestryImg   from '@portfolio/Images/Projects/AncestryOfTimeLogo.png'
import binItRightImg from '@portfolio/Images/Projects/BinItRight.png'
import unfairImg     from '@portfolio/Images/Projects/UnfairPlatformer.png'
import traversalImg  from '@portfolio/Images/Projects/TraversalMechanicsDemo.png'
import mobControlImg from '@portfolio/Images/Projects/MobControl.png'
import pokemonImg    from '@portfolio/Images/Projects/PokemonAR.png'
import passportImg   from '@portfolio/Images/Passport photo.jpg'
import certPixelClash from '@portfolio/Images/Certificates/PixelClashCertificate.jpeg'
import certUE5BP     from '@portfolio/Images/Certificates/UE5BluePrints1.jpg'
import certUE5AA     from '@portfolio/Images/Certificates/UE5ActionAdventure.jpg'
import certCpp       from '@portfolio/Images/Certificates/CppBeginner.jpg'
import certUE5Cpp    from '@portfolio/Images/Certificates/UE5Cpp.jpg'
import certUnreal2D  from '@portfolio/Images/Certificates/Unreal2DGames.jpg'

export const PROJECTS = [
  {
    id: 'ancestry', number: '01', title: 'Ancestry of Time',
    shortDesc: 'FPS where time moves only when you move — inspired by Superhot.',
    description: 'A first-person shooter built in Unreal Engine where time moves only when you do. Play as a kidnapped heir with time-bending powers, progressing through 3 levels to unlock abilities and escape a secret organisation.',
    tags: ['Unreal Engine 5', 'C++', 'Blueprints', 'FPS Mechanics'],
    links: [
      { label: 'Download Game', url: 'https://palaash-dwivedi.itch.io/ancestry-of-time' },
      { label: 'Watch Trailer', url: 'https://youtu.be/FKvfHX1ShG4' },
    ],
    image: ancestryImg, accent: 0x7c4dff, accentHex: '#7c4dff',
  },
  {
    id: 'binit', number: '02', title: 'Bin It Right',
    shortDesc: 'Award-winning 2D eco-game — Best Game at Pixel Clash 2025.',
    description: 'A 2D recycling-themed game built in Unreal Engine using C++. Won Best Game at Pixel Clash Game Jam 2025. Side-scrolling mechanics with educational eco-consciousness intent.',
    tags: ['Unreal Engine', 'C++', '2D Gameplay', 'Team Collaboration'],
    links: [{ label: 'Watch Video', url: 'https://youtu.be/OkKHqavAERE' }],
    image: binItRightImg, accent: 0x4caf50, accentHex: '#4caf50',
  },
  {
    id: 'unfair', number: '03', title: 'Unfair Platformer',
    shortDesc: 'Fiendishly difficult platformer full of deceptive traps.',
    description: 'A challenging platformer in Unity with C#, featuring deceptive mechanics and booby traps. Highlights level design skills — memorable challenges through clever construction.',
    tags: ['Unity', 'C#', 'Level Design', 'Platformer'],
    links: [{ label: 'Download Game', url: 'https://palaash-dwivedi.itch.io/unfair-platformer' }],
    image: unfairImg, accent: 0xff5722, accentHex: '#ff5722',
  },
  {
    id: 'traversal', number: '04', title: 'Traversal Mechanic Demo',
    shortDesc: 'Physics launcher prototype with custom hand animations.',
    description: 'A gameplay prototype in Unreal Engine 5.5.4 exploring physics-based traversal. Holding LMB charges a launcher — force and direction depend on position and charge time. Includes custom in-engine hand animations.',
    tags: ['Unreal Engine 5.5.4', 'Blueprints', 'Physics', 'Custom Animations'],
    links: [{ label: 'Watch Demo', url: 'https://youtu.be/79n36LSAytY' }],
    image: traversalImg, accent: 0x00bcd4, accentHex: '#00bcd4',
  },
  {
    id: 'mob', number: '05', title: 'Mob Control',
    shortDesc: 'Hyper-casual mobile crowd-control with AI enemy waves.',
    description: 'A hyper-casual crowd-control game in Unreal Engine using C++. Defend your village from waves of enemies with tactile shooting, challenging AI, and strategic spawns. Designed for mobile with joystick-based UI.',
    tags: ['Unreal Engine', 'C++', 'Mobile Game', 'AI Programming'],
    links: [{ label: 'Unpublished', url: null }],
    image: mobControlImg, accent: 0xe91e8c, accentHex: '#e91e8c',
  },
  {
    id: 'pokemon', number: '06', title: 'Pokémon AR Experience',
    shortDesc: 'AR app — scan images to spawn 12 Pokémon in real space.',
    description: 'An augmented reality Pokémon app in Unity using Vuforia. Scan image targets to spawn and interact with 12 different Pokémon. Each features custom scaling, positioning, and particle effects.',
    tags: ['Unity', 'Vuforia', 'Augmented Reality', 'C#'],
    links: [{ label: 'View Demo', url: 'https://youtu.be/pFSlwzKSno8' }],
    image: pokemonImg, accent: 0xffc107, accentHex: '#ffc107',
  },
]

export const SKILLS_DATA = [
  {
    id: 'gamedev', category: 'Game Development', icon: '⚔️',
    color: 0x7c4dff, colorHex: '#7c4dff',
    items: ['Unreal Engine 5 — Blueprints & C++', 'Unity — C# & MonoBehaviours', 'AI — Behavior Trees & Blackboards', 'Custom Animation Systems', 'Physics-Based Interactions', 'Level Design & World Building', 'Mobile Game Development'],
  },
  {
    id: 'programming', category: 'Programming', icon: '💻',
    color: 0x00bcd4, colorHex: '#00bcd4',
    items: ['C++ (Primary Language)', 'C# (Intermediate)', 'Python', 'JavaScript, HTML & CSS', 'Object-Oriented Programming', 'Debugging & Performance Optimisation'],
  },
  {
    id: 'tools', category: 'Tools & Software', icon: '🔧',
    color: 0x4caf50, colorHex: '#4caf50',
    items: ['Unreal Engine 5, Unity', 'Visual Studio, VS Code', 'Git & Version Control', 'Debugging & Profiling Tools', 'Mobile Development SDKs'],
  },
  {
    id: 'design', category: 'Design & Soft Skills', icon: '✨',
    color: 0xff9800, colorHex: '#ff9800',
    items: ['Gameplay System Design', 'Creative Problem Solving', 'Rapid Prototyping', 'Team Collaboration', 'Fast Learning & Adaptability', 'Project Management'],
  },
]

export const CERTIFICATES = [
  {
    id: 'pixelclash', title: 'Pixel Clash Game Jam 2025', subtitle: 'Best Game Award',
    org: 'Jain University', year: '2025', isAward: true,
    image: certPixelClash, colorHex: '#ffd700',
    description: 'Recognised for outstanding creativity and gameplay mechanics for the game Bin It Right.',
  },
  {
    id: 'ue5bp', title: 'UE5: Blueprints for Beginners',
    org: 'Udemy — Pixel Helmet', year: '2024', isAward: false,
    image: certUE5BP, colorHex: '#7c4dff',
    description: 'Covered foundations of Unreal Engine visual scripting with Blueprints.',
  },
  {
    id: 'ue5aa', title: 'UE5: Action Adventure Game Dev',
    org: 'Udemy — GameDev.tv', year: '2024', isAward: false,
    image: certUE5AA, colorHex: '#00bcd4',
    description: 'Built a full action-adventure game in UE5 covering animation, combat, and level design.',
  },
  {
    id: 'cpp', title: 'Beginning C++ — Beginner to Beyond',
    org: 'Udemy — Tim Buchalka', year: '2025', isAward: false,
    image: certCpp, colorHex: '#4caf50',
    description: 'Comprehensive C++ covering OOP, memory management, STL, and modern C++ patterns.',
  },
  {
    id: 'ue5cpp', title: 'UE5 C++ Developer: Learn C++ & Make Games',
    org: 'Udemy — GameDev.tv', year: '2025', isAward: false,
    image: certUE5Cpp, colorHex: '#ff5722',
    description: 'Advanced UE5 development using C++ for gameplay systems, AI, and mechanics.',
  },
  {
    id: 'unreal2d', title: 'Unreal Engine 2D',
    org: 'Udemy — GameDev.tv', year: '2026', isAward: false,
    image: certUnreal2D, colorHex: '#e91e8c',
    description: 'Built 2D games in Unreal Engine covering Paper2D, sprites, and side-scrolling mechanics.',
  },
]

export const ABOUT = {
  name: 'Palaash Dwivedi',
  role: 'Game Developer',
  photo: passportImg,
  bio: "I'm a passionate game developer currently in my third year of college, with a strong focus on creating original and mechanically rich gaming experiences. My core strength lies in building gameplay systems that emphasise tight controls, innovative mechanics, and player engagement. I work extensively with Unreal Engine — scripting, level design, custom animations — and love learning through making things.",
  education: {
    degree: 'B.Sc — Gaming',
    institution: 'Jain University',
    period: '2023 – Present · Third Year',
    gpa: [
      { sem: 'Semester 5', score: '9.4 / 10' },
      { sem: 'Semester 4', score: '9.46 / 10' },
      { sem: 'Semester 3', score: '8.76 / 10' },
      { sem: 'Semester 2', score: '7.92 / 10' },
    ],
    focus: 'Game Development · Programming · Software Engineering',
  },
  experience: {
    title: 'Game Development Intern',
    company: 'Enable India',
    companyUrl: 'https://www.enableindia.org/',
    period: 'October 2025 – January 2026',
    description: 'Designed and implemented accessibility-focused gameplay systems for players with blindness and visual impairments in a 3D game project using Unreal Engine.',
    highlights: [
      'Implemented audio-driven gameplay cues to convey game state without visuals',
      'Designed mechanics prioritising sound, timing, and spatial awareness',
      'Integrated accessibility considerations into core gameplay logic',
      'Iterated on systems based on playtesting from an accessibility perspective',
    ],
  },
  contact: {
    email: 'palaashd@gmail.com',
    linkedin: 'https://www.linkedin.com/in/palaashdwivedi/',
    itch: 'https://palaash-dwivedi.itch.io/',
    youtube: 'https://www.youtube.com/@PalaashDwivedi-i8b',
  },
}
