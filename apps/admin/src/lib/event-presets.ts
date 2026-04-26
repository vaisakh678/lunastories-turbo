export interface EventPreset {
  key: string; // machine id, also used as default name
  label: string;
  setting: string;
  action: string;
  tags: string[];
}

export const EVENT_PRESETS: EventPreset[] = [
  // Universal baseline — every avatar should have these
  {
    key: "portrait",
    label: "Portrait — standing",
    setting: "portrait",
    action: "standing",
    tags: ["portrait", "default"],
  },
  {
    key: "bedroom_sleeping",
    label: "Bedroom — sleeping",
    setting: "bedroom",
    action: "sleeping",
    tags: ["indoor", "night", "calm"],
  },
  {
    key: "meadow_playing",
    label: "Meadow — playing",
    setting: "meadow",
    action: "playing",
    tags: ["outdoor", "day", "exciting"],
  },
  {
    key: "forest_walking",
    label: "Forest — walking",
    setting: "forest",
    action: "walking",
    tags: ["outdoor", "day", "trees"],
  },
  {
    key: "forest_night",
    label: "Forest — night",
    setting: "forest",
    action: "exploring",
    tags: ["outdoor", "night", "trees", "mysterious"],
  },
  {
    key: "kitchen_eating",
    label: "Kitchen — eating",
    setting: "kitchen",
    action: "eating",
    tags: ["indoor", "day", "cozy"],
  },
  {
    key: "garden_discovering",
    label: "Garden — discovering",
    setting: "garden",
    action: "discovering",
    tags: ["outdoor", "day", "flowers"],
  },
  {
    key: "beach_splashing",
    label: "Beach — splashing",
    setting: "beach",
    action: "splashing",
    tags: ["outdoor", "day", "water", "exciting"],
  },
  {
    key: "mountain_climbing",
    label: "Mountain — climbing",
    setting: "mountain",
    action: "climbing",
    tags: ["outdoor", "day", "adventure"],
  },
  {
    key: "castle_arriving",
    label: "Castle — arriving",
    setting: "castle",
    action: "arriving",
    tags: ["fantasy", "day", "adventure"],
  },
  {
    key: "city_walking",
    label: "City — walking",
    setting: "city",
    action: "walking",
    tags: ["outdoor", "day", "urban"],
  },
  {
    key: "cave_exploring",
    label: "Cave — exploring",
    setting: "cave",
    action: "exploring",
    tags: ["outdoor", "dark", "mysterious"],
  },
  {
    key: "night_sky_gazing",
    label: "Night sky — gazing",
    setting: "night-sky",
    action: "gazing",
    tags: ["outdoor", "night", "calm"],
  },
  {
    key: "cozy_room_reading",
    label: "Cozy room — reading",
    setting: "cozy-room",
    action: "reading",
    tags: ["indoor", "calm", "cozy"],
  },

  // Mode-specific extras
  {
    key: "construction_site_digging",
    label: "Construction site — digging",
    setting: "construction-site",
    action: "digging",
    tags: ["outdoor", "day", "work"],
  },
  {
    key: "yellow_brick_road_skipping",
    label: "Yellow Brick Road — skipping",
    setting: "yellow-brick-road",
    action: "skipping",
    tags: ["fantasy", "day", "adventure"],
  },
  {
    key: "tea_party_sitting",
    label: "Tea party — sitting",
    setting: "tea-party",
    action: "sitting",
    tags: ["fantasy", "day", "whimsical"],
  },
  {
    key: "workshop_experimenting",
    label: "Workshop — experimenting",
    setting: "workshop",
    action: "experimenting",
    tags: ["indoor", "day", "creative"],
  },
  {
    key: "lab_discovering",
    label: "Lab — discovering",
    setting: "lab",
    action: "discovering",
    tags: ["indoor", "day", "creative"],
  },
  {
    key: "jungle_swinging",
    label: "Jungle — swinging",
    setting: "jungle",
    action: "swinging",
    tags: ["outdoor", "day", "adventure"],
  },
  {
    key: "river_wading",
    label: "River — wading",
    setting: "river",
    action: "wading",
    tags: ["outdoor", "day", "water"],
  },
  {
    key: "enchanted_forest_lost",
    label: "Enchanted forest — lost",
    setting: "enchanted-forest",
    action: "lost",
    tags: ["fantasy", "outdoor", "mysterious"],
  },
  {
    key: "tower_waving",
    label: "Tower — waving",
    setting: "tower",
    action: "waving",
    tags: ["fantasy", "day", "calm"],
  },
];

export function presetByKey(key: string): EventPreset | undefined {
  return EVENT_PRESETS.find((p) => p.key === key);
}
