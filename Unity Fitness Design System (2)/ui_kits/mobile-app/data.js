// Seed data for the GymPass UI kit prototype.
window.UF_DATA = {
  user: { firstName: "Sami", lastName: "Bennani", email: "sami@example.com", points: 120, checkins: 7 },
  gyms: [
    { id: "g1", name: "Pulse Casablanca",   tier: 1, distance: 1.2, address: "Bd Anfa · Maarif", classes: ["HIIT","Yoga"] },
    { id: "g2", name: "Atlas Strength Club", tier: 2, distance: 2.4, address: "Rue Allal Ben Ahmed", classes: ["Powerlifting","Boxing"] },
    { id: "g3", name: "Marina Wellness",     tier: 3, distance: 4.0, address: "Marina · Tour Crystal", classes: ["Pilates","Sauna","Pool"] },
    { id: "g4", name: "Kinetic Anfa",        tier: 1, distance: 0.6, address: "Anfa Place", classes: ["Spin","Cardio"] },
    { id: "g5", name: "Fortitude Studio",    tier: 2, distance: 3.1, address: "Bd Zerktouni", classes: ["CrossFit","Mobility"] },
  ],
  plans: [
    { id: "starter",  name: "Starter",  desc: "Try us out for a week.",                 points: 10, price: 99,  perTier: [1],         popular: false, perks: ["10 points included","Tier 1 gyms","Basic support"] },
    { id: "mobility", name: "Mobility", desc: "Our most popular pack for city-hoppers.", points: 25, price: 199, perTier: [1,2],       popular: true,  perks: ["25 points included","Tier 1 & 2 gyms","Priority support","Class booking"] },
    { id: "elite",    name: "Elite",    desc: "Access everything, anywhere.",            points: 60, price: 449, perTier: [1,2,3],     popular: false, perks: ["60 points included","All tiers including premium","Concierge support","Spa & pool access","Guest passes"] },
  ],
};
