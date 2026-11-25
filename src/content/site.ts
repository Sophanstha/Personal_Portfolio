// Everything you'd want to edit lives here: name, copy, projects, services, links.

export const site = {
  firstName: "Sophan",
  lastName: "Shrestha",
  // Logo lockup: "SOPHAN" + boxed letter + italic remainder
  logo: { first: "Sophan", box: "s", rest: "hrestha" },
  role: "Creative developer",
  location: "Nepal",
  // IANA zone for the header clock, e.g. "Asia/Kathmandu". undefined = visitor's local time.
  timeZone: "Asia/Kathmandu" as string | undefined,
  email: "sophanshrestha4@gmail.com",
  // Full international number, digits only (977 = Nepal). Used for wa.me links.
  whatsapp: "9779808005044",
  year: 2026,
  intro:
    "I design and build websites and apps with a lot of care, a little motion and no shortcuts.",
  socials: [
    { label: "LinkedIn", href: "https://www.linkedin.com/in/sophan-shrestha-413667282/" },
    { label: "GitHub", href: "https://github.com/Sophanstha" },
    // wa.me needs the full international number (977 = Nepal) with no + or spaces
    { label: "WhatsApp", href: "https://wa.me/9779808005044" },
  ],
  nav: [
    { label: "Projects", href: "/projects" },
    { label: "About", href: "/about" },
    { label: "Services", href: "/services" },
  ],
  menu: [
    { label: "Home", href: "/" },
    { label: "Projects", href: "/projects" },
    { label: "About", href: "/about" },
    { label: "Services", href: "/services" },
    { label: "Contact", href: "/contact" },
  ],
  cta: { label: "Start a project", href: "/contact" },
  marquee: [
    "Motion",
    "Next.js",
    "React",
    "React Native",
    "Node.js",
    "MERN Stack",
    "PHP",
    "SQL",
    "PostgreSQL",
    "WebGL",
    "Apps",
  ],
  statement: {
    label: "(Hello)",
    // *word* = italic, _word_ = accent colour
    text: "I'm Sophan. I design and build websites and apps that *move,* *respond* and feel good to use. Designed in Figma, built in code, made with _care._",
  },
  footer: { label: "Got something in mind?", big: "Let's talk" },

  // About page. Placeholder copy: rewrite it in your own words.
  about: {
    title: "About",
    // Portrait in /public (shown at 4:5, cropped to fill the frame)
    photo: "/about/sophan.webp" as string | null,
    lead: "Hi, I'm Sophan. I'm a full-stack developer who designs and builds websites, web apps and mobile apps.",
    text: [
      "I work across the whole stack: interfaces in React and Next.js, mobile apps in React Native, and the APIs and databases behind them in Node.js, PHP, SQL and PostgreSQL.",
      "I care about the details people feel but rarely notice: motion that guides the eye, pages that load fast, and code that's easy to keep building on.",
      "If you've got a product, a store or an idea that needs to exist on the web, I'd love to hear about it.",
    ],
    toolkitLabel: "Toolkit",
    toolkit: [
      "Next.js",
      "React",
      "React Native",
      "TypeScript",
      "Node.js",
      "Express",
      "MongoDB",
      "PHP",
      "SQL",
      "PostgreSQL",
      "GSAP",
      "Tailwind CSS",
    ],
  },

  // Contact page
  contact: {
    title: "Say hi",
    intro: "Tell me a bit about what you're making. I'll get back to you within a couple of days.",
    basedIn: "Nepal",
    needsLabel: "What do you need?",
    needs: ["Website", "Web app", "Mobile app", "E-commerce", "Something else"],
    budgetLabel: "Rough budget",
    // Nepali rupees
    budgets: ["NPR 2,200–4,000", "NPR 4,000 and above", "Not sure yet"],
    submit: "Send enquiry",
    success: "Thanks, {name}.",
    // {email} = the visitor's address
    successText: "Your message is in my inbox. I'll reply to {email} within a couple of days.",
  },
};

// Work history (newest first). Shown in full on About and as a short list on
// the home page. `end: null` = current job.
export const experience = {
  label: "Experience",
  more: "Full story",
  items: [
    {
      role: "Full Stack Engineer",
      company: "Abstrakt Creation",
      type: "Full-time",
      start: "May 2026",
      end: null as string | null,
      place: "On-site",
      text: "Building and shipping full-stack web apps end to end, from the interface to the APIs and databases behind it.",
      tags: [] as string[],
    },
    {
      role: "Web Developer",
      company: "Trioplus Technology",
      type: "Freelance",
      start: "Dec 2025",
      end: "Mar 2026",
      place: "Nepal",
      text: "Front-end and back-end development for client websites and web apps, working with the Trioplus team.",
      tags: ["Front-end development", "Back-end development"],
    },
    {
      role: "Full Stack Intern",
      company: "inGrails",
      type: "Internship",
      start: "Sep 2025",
      end: "Dec 2025",
      place: "Lalitpur · On-site",
      text: "Worked on real-world web applications with React.js, Node.js, Express.js and PostgreSQL, building responsive front-end components and integrating them with the back end.",
      tags: ["React.js", "Node.js", "Express.js", "PostgreSQL"],
    },
  ],
};

export type Project = {
  slug: string;
  name: string[]; // one entry per display line
  year: string;
  kind: string;
  tag?: string;
  // Your part in it, shown in the Projects list
  role: string;
  platform: string;
  // Palette for the WebGL cover + CSS art (3 colours)
  colors: [string, string, string];
  // Live site, e.g. "https://example.com". Clicking the project opens it in a
  // new tab; leave empty to show its placeholder page here instead.
  url: string;
  // Screenshot in /public (wide, like a desktop browser). Without one, the
  // project shows generated placeholder art.
  image?: string;
  // Tall screenshot in /public (a full page, or a portrait crop). Fills the
  // portrait frames edge to edge: the desktop preview in Selected projects,
  // the Projects list hover card and the phone mockups.
  fullPage?: string;
};

export const projects: Project[] = [
  {
    slug: "clothify",
    name: ["Clothify"],
    year: "2025",
    kind: "E-commerce website",
    tag: "(Live)",
    role: "Designer / Developer",
    platform: "React & Redux",
    colors: ["#ff7a00", "#2b1406", "#ffd9b0"],
    url: "https://clothify-ecommerce-website-q43b.vercel.app/",
    image: "/projects/clothify.webp",
    fullPage: "/projects/clothify-full.webp",
  },
  {
    slug: "job-preparation",
    name: ["Job Preparation"],
    year: "2026",
    kind: "Career analytics web app",
    tag: "(Live)",
    role: "Designer / Developer",
    platform: "React & Vite",
    colors: ["#34d399", "#111214", "#fb7185"],
    url: "https://job-market-trend-analysis-eight.vercel.app/",
    image: "/projects/jobmarket.webp",
    fullPage: "/projects/jobmarket-portrait.webp",
  },
  {
    slug: "atlas-studio",
    name: ["Atlas Studio"],
    year: "2025",
    kind: "Marketing site & CMS",
    role: "Lead Developer",
    platform: "Next.js",
    colors: ["#ff7bc0", "#2b0f22", "#7fa8ff"],
    url: "",
  },
  {
    slug: "chatapp",
    name: ["ChatApp"],
    year: "2025",
    kind: "AI-powered chat app",
    tag: "(Live)",
    role: "Designer / Developer",
    platform: "MERN Stack",
    colors: ["#14a38f", "#0a2622", "#8b5cf6"],
    url: "https://mern-chatapp-zeta.vercel.app/",
    image: "/projects/chatapp.webp",
    fullPage: "/projects/chatapp-portrait.webp",
  },
];

// `text` is the short line on the home page tiles; `description` and `tags`
// fill the rows on the Services page.
export const services = [
  {
    slug: "websites",
    title: "Websites",
    text: "Marketing sites and portfolios, designed and built to feel alive.",
    description:
      "Custom websites designed and developed from scratch, combining thoughtful UI and UX with fast, responsive front-end development. Usually built with Next.js, with motion that makes the site feel alive.",
    tags: ["UI / UX design", "Next.js build", "CMS setup", "Animation"],
  },
  {
    slug: "web-apps",
    title: "Web apps",
    text: "Dashboards, portals and SaaS products, built end to end.",
    description:
      "Full-stack web apps built end to end: React and Next.js on the front, Node.js or PHP APIs behind them, and SQL, PostgreSQL or MongoDB to keep the data in order. Fast, secure and easy to keep building on.",
    tags: ["MERN stack", "REST APIs", "Auth & payments", "SQL & PostgreSQL"],
  },
  {
    slug: "e-commerce",
    title: "E-commerce",
    text: "Custom storefronts built around your brand and your products.",
    description:
      "Online stores designed and developed around your brand, products and customers. From product pages and checkout to payments and admin dashboards, everything is built to be easy to shop and easy to manage.",
    tags: ["Store design", "Cart & checkout", "Payment integration", "Admin dashboards"],
  },
  {
    slug: "apps",
    title: "Apps",
    text: "Mobile apps for iOS and Android, from early flows to launch.",
    description:
      "Mobile apps designed and developed from the first user flow through to launch. I handle UX, UI and React Native development to create polished cross-platform apps for iOS and Android.",
    tags: ["UX & UI design", "React Native development", "APIs & integrations", "Testing & launch"],
  },
];

// Services page
export const servicesPage = {
  title: "Services",
  intro: "Four things I do a lot of. Most projects end up being a mix.",
  stepsLabel: "How it usually goes",
  steps: [
    { title: "Chat", text: "A call to talk through what you need, who it's for and when." },
    { title: "Plan", text: "A clear scope, timeline and fixed quote, so nothing is a surprise." },
    { title: "Design", text: "Layouts and motion in Figma, shared early and often." },
    { title: "Build & launch", text: "Built, tested on real devices, launched, and handed over." },
  ],
  plansLabel: "Ways to work together",
  plans: [
    {
      title: "Fixed project",
      text: "A defined scope with a fixed price. Best for new sites, stores and apps.",
      price: "Quote on enquiry",
    },
    {
      title: "Ongoing support",
      text: "A monthly block of time for updates, new pages and improvements.",
      price: "Monthly, on enquiry",
    },
  ],
};

export const routeLabels: Record<string, { label: string; subtitle: string }> = {
  "/": { label: "Home", subtitle: "Back to the start" },
  "/projects": { label: "Projects", subtitle: "Selected projects" },
  "/about": { label: "About", subtitle: "Who's behind this" },
  "/services": { label: "Services", subtitle: "What I can do for you" },
  ...Object.fromEntries(
    services.map((s) => [`/services/${s.slug}`, { label: s.title, subtitle: "Services" }]),
  ),
  "/contact": { label: "Contact", subtitle: "Let's make something" },
};
