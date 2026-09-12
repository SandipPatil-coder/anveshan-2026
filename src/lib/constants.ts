// Fest identity — change these four lines to rebrand the whole site
export const FEST_NAME = "ANVESHAN";
export const FEST_YEAR = "2026";
export const FEST_TAGLINE = "PLUG INTO THE GRID";
export const COLLEGE_DOMAIN_HINT = "pccoepune.org";

// Route paths
export const ROUTES = {
  home: "/",
  events: "/events",
  event: (slug: string) => `/events/${slug}`,
  register: (slug: string) => `/register/${slug}`,
  login: "/login",
  signup: "/signup",
  dashboard: "/dashboard",
  admin: "/admin",
  schedule: "/schedule",
  about: "/about",
  contact: "/contact",
} as const;
