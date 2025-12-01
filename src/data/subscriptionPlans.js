export const SUBSCRIPTION_FEATURES = {
  Free: [
    "View 1 full post detail",
    "Create 1 post",
    "Basic search access",
    "Community access",
  ],
  Beginner: [
    "Unlock 5 posts per month",
    "Create 3 posts per month",
    "Advanced search filters",
    "Ad-free experience",
    "Profile customization",
  ],
  Intermediate: [
    "Unlock 12 posts per month",
    "Create 7 posts per month",
    "Analytics dashboard",
    "Direct messaging",
    "Profile verification badge",
  ],
  Advanced: [
    "Unlock 25 posts per month",
    "Create 15 posts per month",
    "Premium analytics",
    "24/7 VIP support",
    "Featured listing",
    "Custom branding",
  ],
};

// Plan colors are now handled in the component with a minimalist approach

export const PLAN_LIMITS = {
  Free: {
    unlockCredits: 1,
    createCredits: 1,
  },
  Beginner: {
    unlockCredits: 5,
    createCredits: 3,
  },
  Intermediate: {
    unlockCredits: 12,
    createCredits: 7,
  },
  Advanced: {
    unlockCredits: 25,
    createCredits: 15,
  },
};
