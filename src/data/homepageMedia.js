// Viso homepage imagery.
// Each service image is chosen to visually reinforce the service itself:
// diagnostics = diagnostic equipment, oil = oil service, brakes = brake hardware,
// battery = battery work, A/C = cabin A/C controls, wash = an actual wash scene.

const img = (id, width = 1200) =>
  `https://images.unsplash.com/${id}?auto=format&fit=crop&q=80&w=${width}`

export const homepageMedia = {
  hero:
    'https://images.unsplash.com/photo-1700183235397-f80afdc308a7?fm=jpg&ixid=M3wxMjA3fDB8MHxwaG90by1yZWxhdGVkfDE3fHx8ZW58MHx8fHx8&ixlib=rb-4.1.0&q=70&w=3000',

  // General process imagery remains separate from the service-specific cards.
  howItWorks: [
    img('photo-1625047509168-a7026f36de04'),
    img('photo-1487754180451-c456f719a1fc'),
    img('photo-1542362567-b07e54358753'),
  ],

  services: {
    // Technician + diagnostic computer/OBD equipment.
    diagnostics:
      'https://d3vl3jxeh4ou3u.cloudfront.net/10%20Best%20Automotive%20Scanners%20-%20main%20image.jpg',

    // Actual oil-change work under a vehicle.
    oil:
      'https://cdn.prod.website-files.com/66acf110ec05e14b730388f8/6952900b9e4fc1a3e9098ebb_obraz_2025-12-29_152827103.png',

    // Brake rotor/caliper service.
    brakes:
      'https://cdn.prod.website-files.com/6968f2b80191f180763b9f14/696fcb82f43f2b6ecd5e179e_iStock-1364951743.jpg',

    // Technician replacing a vehicle battery.
    battery:
      'https://bizweb.dktcdn.net/100/489/912/files/huong-dan-thay-binh-ac-quy-o-to-don-gian-3.png?v=1708506124252',

    // Automotive A/C: close-up of the actual cabin A/C vent/control system.
    ac:
      'https://images.unsplash.com/photo-1587121892719-1711ec9cc798?auto=format&fit=crop&fm=jpg&ixid=M3wxMjA3fDB8MHxzZWFyY2h8NHx8Y2FyJTIwYWlyJTIwY29uZGl0aW9uaW5nfGVufDB8fDB8fHww&ixlib=rb-4.1.0&q=70&w=1600',

    // Actual pressure washing, not another generic parked-car photo.
    wash:
      'https://media.cylex.se/companies/1189/2770/images/-388255113-img6_174207_large.jpg',
  },

  // Technician working at a customer's home/on-site.
  mobileCare:
    'https://storage.googleapis.com/content-assistant-images-persistent/mobile-mechanic-repairing-a-car-in-a-driveway-emphasizing-automotive-service-and-warranty-4f981737-f17b-4986-a39b-4a1cf9e06e8d.webp',

  diagnostics:
    'https://d3vl3jxeh4ou3u.cloudfront.net/10%20Best%20Automotive%20Scanners%20-%20main%20image.jpg',

  // Actual interior/exterior detailing activity.
  detailing:
    'https://www.autozonevitan.ro/wp-content/uploads/2023/07/car-wash-vitan-auchan-scaled-683x1024.jpg',

  // Hands-on mechanic imagery for the trust/why section.
  whyViso:
    'https://www.publicdomainpictures.net/pictures/550000/velka/automechaniker.jpg',

  // Multiple vehicles together, appropriate for fleet management.
  fleet:
    'https://autosphere.ca/wp-content/uploads/2023/10/WP_cars-parked.jpg',

  cta:
    img('photo-1503376780353-7e6692767b70'),
}

export const testimonialAvatars = [
  'https://i.pravatar.cc/160?img=12',
  'https://i.pravatar.cc/160?img=47',
  'https://i.pravatar.cc/160?img=33',
  'https://i.pravatar.cc/160?img=56',
]
