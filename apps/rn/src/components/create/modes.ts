import { palette } from '@/api/models';
import type { PickOption } from './shared';

// All mode definitions ported verbatim from the ModeSheet Swift files —
// titles, SF symbols, tints, and artwork names must match the originals.

const t = palette; // named tints → concrete colors

export interface StoryMode {
  title: string;
  symbolName: string;
  imageName: string;
  tint: string;
}

// ChooseModeView.swift
export const storyModes: StoryMode[] = [
  { title: 'Creative', symbolName: 'paintpalette.fill', imageName: 'creative', tint: t.pink },
  { title: 'Inventors', symbolName: 'lightbulb.fill', imageName: 'inventors', tint: t.yellow },
  { title: 'Construction Site', symbolName: 'hammer.fill', imageName: 'construction_site', tint: t.orange },
  { title: 'Vegetable', symbolName: 'leaf.fill', imageName: 'vegetables', tint: t.green },
  { title: 'Environment', symbolName: 'globe.americas.fill', imageName: 'environment', tint: t.blue },
  { title: 'Jungle Book', symbolName: 'pawprint.fill', imageName: 'jungle_book', tint: t.brown },
  { title: 'Alice in Wonderland', symbolName: 'cup.and.saucer.fill', imageName: 'alice_in_wonderland', tint: t.purple },
  { title: "Grimm's Tales", symbolName: 'book.closed.fill', imageName: 'grimms_tales', tint: t.indigo },
  { title: 'Wizard of Oz', symbolName: 'tornado', imageName: 'wizard_of_oz', tint: t.teal },
];

// Config for the shared two-step (pick character → choose place) engine
// used by every mode except Creative.
export interface TwoStepModeConfig {
  modeKey: string;
  coverLabel: string;
  coverImage: string;
  pickTitle: string;
  characterOptions: PickOption[];
  placeOptions: PickOption[];
}

export const twoStepModes: Record<string, TwoStepModeConfig> = {
  Inventors: {
    modeKey: 'inventors',
    coverLabel: 'Inventors',
    coverImage: 'inventors',
    pickTitle: 'Pick an inventor',
    characterOptions: [
      { title: 'Ada Lovelace', symbolName: 'laptopcomputer', tint: t.pink, imageName: 'ada_lovelace' },
      { title: 'Albert Einstein', symbolName: 'function', tint: t.gray, imageName: 'albert_einstein' },
      { title: 'Charles Darwin', symbolName: 'leaf.fill', tint: t.green, imageName: 'charles_darwin' },
      { title: 'Florence Nightingale', symbolName: 'cross.case.fill', tint: t.red, imageName: 'florence_nightingale' },
      { title: 'Galileo Galilei', symbolName: 'moon.stars.fill', tint: t.indigo, imageName: 'galileo_galilei' },
      { title: 'Isaac Newton', symbolName: 'atom', tint: t.orange, imageName: 'isaac_newton' },
      { title: 'Leonardo da Vinci', symbolName: 'paintpalette.fill', tint: t.yellow, imageName: 'leonardo_da_vinci' },
      { title: 'Marie Curie', symbolName: 'atom', tint: t.mint, imageName: 'marie_curie' },
      { title: 'Nikola Tesla', symbolName: 'bolt.fill', tint: t.blue, imageName: 'nikola_tesla' },
      { title: 'Rosalind Franklin', symbolName: 'waveform.path', tint: t.purple, imageName: 'rosalind_franklin' },
    ],
    placeOptions: [
      { title: 'Laboratory', symbolName: 'atom', tint: t.mint, imageName: 'laboratory' },
      { title: 'Observatory', symbolName: 'moon.stars.fill', tint: t.indigo, imageName: 'observatory' },
      { title: 'Workshop', symbolName: 'wrench.adjustable.fill', tint: t.gray, imageName: 'workshop' },
      { title: 'Library', symbolName: 'books.vertical.fill', tint: t.brown, imageName: 'library' },
      { title: 'Garden', symbolName: 'leaf.fill', tint: t.green, imageName: 'garden' },
      { title: 'Classroom', symbolName: 'book.fill', tint: t.orange, imageName: 'classroom' },
    ],
  },
  'Construction Site': {
    modeKey: 'construction_site',
    coverLabel: 'Construction Site',
    coverImage: 'construction_site',
    pickTitle: 'Pick a character',
    characterOptions: [
      { title: 'Benny the Bulldozer', symbolName: 'car.fill', tint: t.yellow, imageName: 'benny_the_bulldozer' },
      { title: 'Charlie the Construction Worker', symbolName: 'person.fill', tint: t.orange, imageName: 'charlie_the_construction_worker' },
      { title: 'Kara the Crane', symbolName: 'arrow.up.right', tint: t.blue, imageName: 'kara_the_crane' },
      { title: 'Molly the Mixer', symbolName: 'drop.fill', tint: t.gray, imageName: 'molly_the_mixer' },
      { title: 'Patty the Paver', symbolName: 'rectangle.fill', tint: t.brown, imageName: 'patty_the_paver' },
      { title: 'Sammy the Safety Cone', symbolName: 'triangle.fill', tint: t.orange, imageName: 'sammy_the_safety_cone' },
    ],
    placeOptions: [
      { title: 'New Building Site', symbolName: 'hammer.fill', tint: t.orange, imageName: 'new_building_site' },
      { title: 'Road Project', symbolName: 'road.lanes', tint: t.gray, imageName: 'road_project' },
      { title: 'Bridge', symbolName: 'rectangle.split.3x1.fill', tint: t.brown, imageName: 'bridge' },
      { title: 'Tall Tower', symbolName: 'building.2.fill', tint: t.blue, imageName: 'tall_tower' },
      { title: 'Park Renovation', symbolName: 'tree.fill', tint: t.green, imageName: 'park_renovation' },
      { title: 'Tunnel', symbolName: 'arrow.left.and.right.circle.fill', tint: t.indigo, imageName: 'tunnel' },
    ],
  },
  Vegetable: {
    modeKey: 'vegetable',
    coverLabel: 'Vegetable Patch',
    coverImage: 'vegetables',
    pickTitle: 'Pick a character',
    characterOptions: [
      { title: 'Bella the Broccoli', symbolName: 'leaf.fill', tint: t.green, imageName: 'bella_the_broccoli' },
      { title: 'Carla the Carrot', symbolName: 'carrot.fill', tint: t.orange, imageName: 'carla_the_carrot' },
      { title: 'Olivia the Onion', symbolName: 'circle.fill', tint: t.purple, imageName: 'olivia_the_onion' },
      { title: 'Peppy the Pepper', symbolName: 'flame.fill', tint: t.red, imageName: 'peppy_the_pepper' },
      { title: 'Peter the Potato', symbolName: 'circle.fill', tint: t.brown, imageName: 'peter_the_potato' },
      { title: 'Tommy the Tomato', symbolName: 'circle.fill', tint: t.red, imageName: 'tommy_the_tomato' },
    ],
    placeOptions: [
      { title: 'The Garden', symbolName: 'leaf.fill', tint: t.green, imageName: 'the_garden' },
      { title: "Farmer's Market", symbolName: 'basket.fill', tint: t.orange, imageName: 'farmers_market' },
      { title: 'Soup Pot', symbolName: 'frying.pan.fill', tint: t.red, imageName: 'soup_pot' },
      { title: 'Greenhouse', symbolName: 'sun.max.fill', tint: t.mint, imageName: 'greenhouse' },
      { title: 'Veggie Patch', symbolName: 'carrot.fill', tint: t.brown, imageName: 'veggie_patch' },
      { title: 'Kitchen', symbolName: 'fork.knife', tint: t.yellow, imageName: 'kitchen' },
    ],
  },
  Environment: {
    modeKey: 'environment',
    coverLabel: 'Save the Planet',
    coverImage: 'environment',
    pickTitle: 'Pick a character',
    characterOptions: [
      { title: 'Greeny the Tree', symbolName: 'tree.fill', tint: t.green, imageName: 'greeny_the_tree' },
      { title: 'Polly the Pollinator', symbolName: 'ant.fill', tint: t.yellow, imageName: 'polly_the_pollinator' },
      { title: 'Recyclo the Bin', symbolName: 'arrow.3.trianglepath', tint: t.mint, imageName: 'recyclo_the_bin' },
      { title: 'Sunny the Solar Panel', symbolName: 'sun.max.fill', tint: t.orange, imageName: 'sunny_the_solar_panel' },
      { title: 'Wally the Water Drop', symbolName: 'drop.fill', tint: t.blue, imageName: 'wally_the_water_drop' },
      { title: 'Windy the Wind Turbine', symbolName: 'wind', tint: t.teal, imageName: 'windy_the_wind_turbine' },
    ],
    placeOptions: [
      { title: 'City Park', symbolName: 'tree.fill', tint: t.green, imageName: 'city_park' },
      { title: 'Schoolyard', symbolName: 'graduationcap.fill', tint: t.blue, imageName: 'schoolyard' },
      { title: 'Beach', symbolName: 'water.waves', tint: t.cyan, imageName: 'beach' },
      { title: 'Forest', symbolName: 'tree.fill', tint: t.brown, imageName: 'forest' },
      { title: 'Solar Farm', symbolName: 'sun.max.fill', tint: t.orange, imageName: 'solar_farm' },
      { title: 'Recycling Center', symbolName: 'arrow.3.trianglepath', tint: t.mint, imageName: 'recycling_center' },
    ],
  },
  'Jungle Book': {
    modeKey: 'jungle_book',
    coverLabel: 'Jungle Book',
    coverImage: 'jungle_book',
    pickTitle: 'Pick a character',
    characterOptions: [
      { title: 'Mowgli', symbolName: 'figure.child', tint: t.orange, imageName: 'mowgli' },
      { title: 'Baloo', symbolName: 'teddybear.fill', tint: t.brown, imageName: 'baloo' },
      { title: 'Bagheera', symbolName: 'cat.fill', tint: t.indigo, imageName: 'bagheera' },
      { title: 'Shere Khan', symbolName: 'cat.fill', tint: t.orange, imageName: 'shere_khan' },
      { title: 'Kaa', symbolName: 'lizard.fill', tint: t.green, imageName: 'kaa' },
      { title: 'King Bandar', symbolName: 'pawprint.fill', tint: t.yellow, imageName: 'king_bandar' },
    ],
    placeOptions: [
      { title: 'Bamboo Grove', symbolName: 'leaf.fill', tint: t.green, imageName: 'bamboo_grove' },
      { title: 'Rainforest', symbolName: 'tree.fill', tint: t.mint, imageName: 'rainforest' },
      { title: 'Crocodile River', symbolName: 'water.waves', tint: t.blue, imageName: 'crocodile_river' },
      { title: 'Wolf Cave', symbolName: 'mountain.2.fill', tint: t.gray, imageName: 'wolf_cave' },
      { title: 'Ancient Ruins', symbolName: 'building.columns.fill', tint: t.brown, imageName: 'ancient_ruins' },
      { title: "King's Throne", symbolName: 'crown.fill', tint: t.yellow, imageName: 'kings_throne' },
    ],
  },
  'Alice in Wonderland': {
    modeKey: 'alice_in_wonderland',
    coverLabel: 'Alice in Wonderland',
    coverImage: 'alice_in_wonderland',
    pickTitle: 'Pick a character',
    characterOptions: [
      { title: 'Alice', symbolName: 'figure.child', tint: t.blue, imageName: 'alice' },
      { title: 'Mad Hatter', symbolName: 'cup.and.saucer.fill', tint: t.green, imageName: 'mad_hatter' },
      { title: 'Queen of Hearts', symbolName: 'heart.fill', tint: t.red, imageName: 'queen_of_hearts' },
      { title: 'Cheshire Cat', symbolName: 'cat.fill', tint: t.purple, imageName: 'cheshire_cat' },
      { title: 'The White Rabbit', symbolName: 'hare.fill', tint: t.gray, imageName: 'the_white_rabbit' },
      { title: 'Caterpillar', symbolName: 'ant.fill', tint: t.green, imageName: 'caterpillar' },
    ],
    placeOptions: [
      { title: 'Tea Party Garden', symbolName: 'cup.and.saucer.fill', tint: t.pink, imageName: 'tea_party_garden' },
      { title: 'Croquet Field', symbolName: 'heart.fill', tint: t.red, imageName: 'croquet_field' },
      { title: "Caterpillar's Mushroom", symbolName: 'leaf.fill', tint: t.green, imageName: 'caterpillars_mushroom' },
      { title: 'Down the Rabbit Hole', symbolName: 'arrow.down.circle.fill', tint: t.gray, imageName: 'down_the_rabbit_hole' },
      { title: "Cheshire's Tree", symbolName: 'tree.fill', tint: t.purple, imageName: 'cheshires_tree' },
      { title: "Mad Hatter's House", symbolName: 'house.fill', tint: t.indigo, imageName: 'mad_hatters_house' },
    ],
  },
  "Grimm's Tales": {
    modeKey: 'grimms_tales',
    coverLabel: "Grimm's Tales",
    coverImage: 'grimms_tales',
    pickTitle: 'Pick a character',
    characterOptions: [
      { title: 'Cinderella', symbolName: 'sparkles', tint: t.yellow, imageName: 'cinderella' },
      { title: 'Red Riding Hood', symbolName: 'figure.child', tint: t.red, imageName: 'red_riding_hood' },
      { title: 'Hansel and Gretel', symbolName: 'house.fill', tint: t.brown, imageName: 'hansel_and_gretel' },
      { title: 'Snow White', symbolName: 'heart.fill', tint: t.pink, imageName: 'snow_white' },
      { title: 'Rapunzel', symbolName: 'scissors', tint: t.yellow, imageName: 'rapunzel' },
      { title: 'Rumpelstiltskin', symbolName: 'wand.and.rays', tint: t.orange, imageName: 'rumpelstiltskin' },
      { title: 'Sleeping Beauty', symbolName: 'moon.zzz.fill', tint: t.indigo, imageName: 'sleeping_beauty' },
      { title: 'The Frog Prince', symbolName: 'crown.fill', tint: t.green, imageName: 'the_frog_prince' },
    ],
    placeOptions: [
      { title: 'Enchanted Forest', symbolName: 'tree.fill', tint: t.green, imageName: 'enchanted_forest' },
      { title: 'Castle Tower', symbolName: 'building.columns.fill', tint: t.gray, imageName: 'castle_tower' },
      { title: "Witch's Cottage", symbolName: 'house.fill', tint: t.brown, imageName: 'witchs_cottage' },
      { title: 'Royal Garden', symbolName: 'leaf.fill', tint: t.pink, imageName: 'royal_garden' },
      { title: 'Magic Lake', symbolName: 'water.waves', tint: t.blue, imageName: 'magic_lake' },
      { title: 'Faraway Kingdom', symbolName: 'crown.fill', tint: t.yellow, imageName: 'faraway_kingdom' },
    ],
  },
  'Wizard of Oz': {
    modeKey: 'wizard_of_oz',
    coverLabel: 'Wizard of Oz',
    coverImage: 'wizard_of_oz',
    pickTitle: 'Pick a character',
    characterOptions: [
      { title: 'Dorothy', symbolName: 'figure.child', tint: t.blue, imageName: 'dorothy' },
      { title: 'Toto', symbolName: 'dog.fill', tint: t.gray, imageName: 'toto' },
      { title: 'Scarecrow', symbolName: 'leaf.fill', tint: t.yellow, imageName: 'scarecrow' },
      { title: 'Tin Man', symbolName: 'gearshape.fill', tint: t.gray, imageName: 'tin_man' },
      { title: 'Cowardly Lion', symbolName: 'pawprint.fill', tint: t.yellow, imageName: 'cowardly_lion' },
      { title: 'Glinda', symbolName: 'wand.and.stars', tint: t.pink, imageName: 'glinda' },
    ],
    placeOptions: [
      { title: 'Yellow Brick Road', symbolName: 'road.lanes', tint: t.yellow, imageName: 'yellow_brick_road' },
      { title: 'Emerald City', symbolName: 'building.2.fill', tint: t.green, imageName: 'emerald_city' },
      { title: 'Munchkin Land', symbolName: 'figure.child', tint: t.pink, imageName: 'munchkin_land' },
      { title: 'Poppy Field', symbolName: 'flame.fill', tint: t.red, imageName: 'poppy_field' },
      { title: "Wicked Witch's Castle", symbolName: 'moon.fill', tint: t.purple, imageName: 'wicked_witchs_castle' },
      { title: "Glinda's Bubble", symbolName: 'circle.fill', tint: t.cyan, imageName: 'glindas_bubble' },
    ],
  },
};

// CreativeModeView.swift data
export const creativeTypeOptions: PickOption[] = [
  { title: 'Fox', symbolName: 'pawprint.fill', tint: t.orange, imageName: 'fox' },
  { title: 'Dragon', symbolName: 'flame.fill', tint: t.red, imageName: 'dragon' },
  { title: 'Elf', symbolName: 'leaf.fill', tint: t.green, imageName: 'elf' },
  { title: 'Dinosaur', symbolName: 'lizard.fill', tint: t.mint, imageName: 'dinosaur' },
  { title: 'Robot', symbolName: 'gearshape.fill', tint: t.gray, imageName: 'robot' },
  { title: 'Unicorn', symbolName: 'sparkles', tint: t.pink, imageName: 'unicorn' },
  { title: 'Dog', symbolName: 'dog.fill', tint: t.brown, imageName: 'dog' },
  { title: 'Bear', symbolName: 'teddybear.fill', tint: t.yellow, imageName: 'bear' },
  { title: 'Cat', symbolName: 'cat.fill', tint: t.orange, imageName: 'cat' },
  { title: 'Rabbit', symbolName: 'hare.fill', tint: t.gray, imageName: 'rabbit' },
  { title: 'Dolphin', symbolName: 'fish.fill', tint: t.blue, imageName: 'dolphin' },
  { title: 'Fairy', symbolName: 'wand.and.stars', tint: t.purple, imageName: 'fairy' },
];

export const creativeProfessionOptions: PickOption[] = [
  { title: 'Astronaut', symbolName: 'globe.americas.fill', tint: t.blue, imageName: 'astronaut' },
  { title: 'Detective', symbolName: 'magnifyingglass', tint: t.gray, imageName: 'detective' },
  { title: 'Police Officer', symbolName: 'shield.fill', tint: t.blue, imageName: 'police_officer' },
  { title: 'Prince', symbolName: 'crown.fill', tint: t.yellow, imageName: 'prince' },
  { title: 'Superhero', symbolName: 'bolt.fill', tint: t.red, imageName: 'superhero' },
  { title: 'Wizard', symbolName: 'wand.and.stars', tint: t.purple, imageName: 'wizard' },
  { title: 'Athlete', symbolName: 'figure.run', tint: t.green, imageName: 'athlete' },
  { title: 'Teacher', symbolName: 'book.fill', tint: t.orange, imageName: 'teacher' },
  { title: 'Cowboy', symbolName: 'lasso', tint: t.brown, imageName: 'cowboy' },
  { title: 'Doctor', symbolName: 'stethoscope', tint: t.red, imageName: 'doctor' },
  { title: 'Explorer', symbolName: 'binoculars.fill', tint: t.indigo, imageName: 'explorer' },
  { title: 'Mechanic', symbolName: 'wrench.adjustable.fill', tint: t.gray, imageName: 'mechanic' },
  { title: 'Ninja', symbolName: 'figure.martial.arts', tint: t.black, imageName: 'ninja' },
  { title: 'Pilot', symbolName: 'airplane', tint: t.blue, imageName: 'pilot' },
  { title: 'Scientist', symbolName: 'atom', tint: t.mint, imageName: 'scientist' },
  { title: 'Spy', symbolName: 'eye.fill', tint: t.indigo, imageName: 'spy' },
];

export const creativeMoralOptions: PickOption[] = [
  { title: 'No specific moral', symbolName: 'minus.circle', tint: t.gray },
  { title: 'Always be kind', symbolName: 'heart.fill', tint: t.pink },
  { title: 'Be honest', symbolName: 'checkmark.seal.fill', tint: t.blue },
  { title: 'Never give up', symbolName: 'flame.fill', tint: t.red },
  { title: 'Be a good friend', symbolName: 'person.2.fill', tint: t.teal },
  { title: 'Treat others the way you want to be treated', symbolName: 'arrow.left.arrow.right', tint: t.purple },
  { title: 'Think before you act', symbolName: 'brain', tint: t.indigo },
];
