export const SIGNUP_STEPS = {
  USER_DETAILS: 1,
  ADDRESS_DETAILS: 2,
  DIGITAL_LINKS: 3,
  TERMS: 4,
  OTP_VERIFICATION: 5,
  COMPLETE: 6,
};

export const STEP_LABELS = {
  1: "User Details",
  2: "Address Details",
  3: "Digital Links",
  4: "Terms & Conditions",
  5: "OTP Verification",
  6: "Complete",
};

export const NAVIGATION_ITEMS = [
  { path: "/feed", label: "Home", icon: "home" },
  { path: "/explore", label: "Explore", icon: "explore" },
  { path: "/products", label: "Popular Products", icon: "products" },
  { path: "/authors", label: "Top Authors", icon: "authors" },
  { path: "/feed", label: "Feed", icon: "feed" },
  { path: "/contact", label: "Contact", icon: "contact" },
];
