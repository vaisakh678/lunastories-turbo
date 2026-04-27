# Milo Tales

## Story modes

Spec for the in-app story creation flow. Each mode appears as a tile in the "Choose a mode" sheet and walks the user through `steps`. `null` `steps` means the mode is shown but not yet implemented.

Step `kind` values:
- `gridPick` — a grid of icon tiles. `perCharacter: true` repeats the step once per selected character.
- `listPick` — a vertical list of long-text rows.
- `textInput` — a free-form text field.

```json
{
  "modes": [
    {
      "title": "Creative",
      "icon": "paintpalette.fill",
      "tint": "pink",
      "steps": [
        {
          "title": "Choose a type",
          "kind": "gridPick",
          "perCharacter": true,
          "options": [
            { "title": "Fox",      "icon": "pawprint.fill",  "tint": "orange" },
            { "title": "Dragon",   "icon": "flame.fill",     "tint": "red" },
            { "title": "Elf",      "icon": "leaf.fill",      "tint": "green" },
            { "title": "Dinosaur", "icon": "lizard.fill",    "tint": "mint" },
            { "title": "Robot",    "icon": "gearshape.fill", "tint": "gray" },
            { "title": "Unicorn",  "icon": "sparkles",       "tint": "pink" },
            { "title": "Dog",      "icon": "dog.fill",       "tint": "brown" },
            { "title": "Bear",     "icon": "teddybear.fill", "tint": "yellow" },
            { "title": "Cat",      "icon": "cat.fill",       "tint": "orange" },
            { "title": "Rabbit",   "icon": "hare.fill",      "tint": "gray" },
            { "title": "Dolphin",  "icon": "fish.fill",      "tint": "blue" },
            { "title": "Fairy",    "icon": "wand.and.stars", "tint": "purple" }
          ]
        },
        {
          "title": "Choose a profession",
          "kind": "gridPick",
          "perCharacter": true,
          "options": [
            { "title": "Astronaut",      "icon": "globe.americas.fill",     "tint": "blue" },
            { "title": "Detective",      "icon": "magnifyingglass",         "tint": "gray" },
            { "title": "Police Officer", "icon": "shield.fill",             "tint": "blue" },
            { "title": "Prince",         "icon": "crown.fill",              "tint": "yellow" },
            { "title": "Superhero",      "icon": "bolt.fill",               "tint": "red" },
            { "title": "Wizard",         "icon": "wand.and.stars",          "tint": "purple" },
            { "title": "Athlete",        "icon": "figure.run",              "tint": "green" },
            { "title": "Teacher",        "icon": "book.fill",               "tint": "orange" },
            { "title": "Cowboy",         "icon": "lasso",                   "tint": "brown" },
            { "title": "Doctor",         "icon": "stethoscope",             "tint": "red" },
            { "title": "Explorer",       "icon": "binoculars.fill",         "tint": "indigo" },
            { "title": "Mechanic",       "icon": "wrench.adjustable.fill",  "tint": "gray" },
            { "title": "Ninja",          "icon": "figure.martial.arts",     "tint": "black" },
            { "title": "Pilot",          "icon": "airplane",                "tint": "blue" },
            { "title": "Scientist",      "icon": "atom",                    "tint": "mint" },
            { "title": "Spy",            "icon": "eye.fill",                "tint": "indigo" }
          ]
        },
        {
          "title": "Choose a moral",
          "subtitle": "Pick a lesson for your story.",
          "kind": "listPick",
          "options": [
            { "title": "No specific moral", "icon": "minus.circle", "tint": "gray" },
            { "title": "Always be kind", "icon": "heart.fill", "tint": "pink" },
            { "title": "Be honest", "icon": "checkmark.seal.fill", "tint": "blue" },
            { "title": "Be the change you want to see in the world", "icon": "globe", "tint": "green" },
            { "title": "Always tell the truth because a liar won't be trusted", "icon": "checkmark.shield.fill", "tint": "indigo" },
            { "title": "Think before you act", "icon": "brain", "tint": "purple" },
            { "title": "Never give up", "icon": "flame.fill", "tint": "red" },
            { "title": "Respect others", "icon": "hand.raised.fill", "tint": "orange" },
            { "title": "The importance of being a good friend", "icon": "person.2.fill", "tint": "teal" },
            { "title": "Learning to forgive", "icon": "arrow.uturn.backward.circle.fill", "tint": "pink" },
            { "title": "You can't always get what you want", "icon": "hourglass", "tint": "gray" },
            { "title": "Good things come to those who wait", "icon": "clock.fill", "tint": "yellow" },
            { "title": "Keeping promises and respecting boundaries", "icon": "lock.fill", "tint": "blue" },
            { "title": "Actions speak louder than words", "icon": "bolt.fill", "tint": "green" },
            { "title": "Don't be greedy, be content with what you have", "icon": "leaf.fill", "tint": "mint" },
            { "title": "Treat others the way you want to be treated", "icon": "arrow.left.arrow.right", "tint": "purple" },
            { "title": "Always be fair to others", "icon": "scalemass", "tint": "indigo" },
            { "title": "Learning to respect others", "icon": "person.fill.checkmark", "tint": "orange" }
          ]
        }
      ]
    },
    {
      "title": "Inventors",
      "icon": "lightbulb.fill",
      "tint": "yellow",
      "steps": [
        {
          "title": "Pick an inventor",
          "subtitle": "Who joins the story?",
          "kind": "gridPick",
          "perCharacter": false,
          "options": [
            { "title": "Ada Lovelace",         "icon": "laptopcomputer",     "tint": "pink" },
            { "title": "Albert Einstein",      "icon": "function",           "tint": "gray" },
            { "title": "Charles Darwin",       "icon": "leaf.fill",          "tint": "green" },
            { "title": "Florence Nightingale", "icon": "cross.case.fill",    "tint": "red" },
            { "title": "Galileo Galilei",      "icon": "moon.stars.fill",    "tint": "indigo" },
            { "title": "Isaac Newton",         "icon": "atom",               "tint": "orange" },
            { "title": "Leonardo da Vinci",    "icon": "paintpalette.fill",  "tint": "yellow" },
            { "title": "Marie Curie",          "icon": "atom",               "tint": "mint" },
            { "title": "Nikola Tesla",         "icon": "bolt.fill",          "tint": "blue" },
            { "title": "Rosalind Franklin",    "icon": "waveform.path",      "tint": "purple" }
          ]
        },
        {
          "title": "Choose a place",
          "subtitle": "Where does the story happen?",
          "kind": "textInput",
          "placeholder": "e.g. a moonlit observatory"
        }
      ]
    },
    {
      "title": "Construction Site",
      "icon": "hammer.fill",
      "tint": "orange",
      "steps": [
        {
          "title": "Pick a character",
          "subtitle": "Who joins the story?",
          "kind": "gridPick",
          "perCharacter": false,
          "options": [
            { "title": "Benny the Bulldozer",             "icon": "car.fill",       "tint": "yellow" },
            { "title": "Charlie the Construction Worker", "icon": "person.fill",    "tint": "orange" },
            { "title": "Kara the Crane",                  "icon": "arrow.up.right", "tint": "blue" },
            { "title": "Molly the Mixer",                 "icon": "drop.fill",      "tint": "gray" },
            { "title": "Patty the Paver",                 "icon": "rectangle.fill", "tint": "brown" },
            { "title": "Sammy the Safety Cone",           "icon": "triangle.fill",  "tint": "orange" }
          ]
        },
        {
          "title": "Choose a place",
          "subtitle": "Where does the story happen?",
          "kind": "textInput",
          "placeholder": "e.g. a busy downtown site"
        }
      ]
    },
    {
      "title": "Vegetable",
      "icon": "leaf.fill",
      "tint": "green",
      "steps": [
        {
          "title": "Pick a character",
          "subtitle": "Who joins the story?",
          "kind": "gridPick",
          "perCharacter": false,
          "options": [
            { "title": "Bella the Broccoli", "icon": "leaf.fill",   "tint": "green" },
            { "title": "Carla the Carrot",   "icon": "carrot.fill", "tint": "orange" },
            { "title": "Olivia the Onion",   "icon": "circle.fill", "tint": "purple" },
            { "title": "Peppy the Pepper",   "icon": "flame.fill",  "tint": "red" },
            { "title": "Peter the Potato",   "icon": "circle.fill", "tint": "brown" },
            { "title": "Tommy the Tomato",   "icon": "circle.fill", "tint": "red" }
          ]
        },
        {
          "title": "Choose a place",
          "subtitle": "Where does the story happen?",
          "kind": "textInput",
          "placeholder": "e.g. a sunny garden patch"
        }
      ]
    },
    {
      "title": "Environment",
      "icon": "globe.americas.fill",
      "tint": "blue",
      "steps": [
        {
          "title": "Pick a character",
          "subtitle": "Who joins the story?",
          "kind": "gridPick",
          "perCharacter": false,
          "options": [
            { "title": "Greeny the Tree",        "icon": "tree.fill",             "tint": "green" },
            { "title": "Polly the Pollinator",   "icon": "ant.fill",              "tint": "yellow" },
            { "title": "Recycle the Bin",        "icon": "arrow.3.trianglepath",  "tint": "mint" },
            { "title": "Sunny the Solar Panel",  "icon": "sun.max.fill",          "tint": "orange" },
            { "title": "Wally the Water Drop",   "icon": "drop.fill",             "tint": "blue" },
            { "title": "Windy the Wind Turbine", "icon": "wind",                  "tint": "teal" }
          ]
        },
        {
          "title": "Choose a place",
          "subtitle": "Where does the story happen?",
          "kind": "textInput",
          "placeholder": "e.g. a meadow at sunrise"
        }
      ]
    },
    {
      "title": "Jungle Book",
      "icon": "pawprint.fill",
      "tint": "brown",
      "steps": [
        {
          "title": "Pick a character",
          "subtitle": "Who joins the story?",
          "kind": "gridPick",
          "perCharacter": false,
          "options": [
            { "title": "Mowgli",     "icon": "figure.child",   "tint": "orange" },
            { "title": "Baloo",      "icon": "teddybear.fill", "tint": "brown" },
            { "title": "Bagheera",   "icon": "cat.fill",       "tint": "indigo" },
            { "title": "Shere Khan", "icon": "cat.fill",       "tint": "orange" },
            { "title": "Kaa",        "icon": "lizard.fill",    "tint": "green" },
            { "title": "King Bandar", "icon": "pawprint.fill",  "tint": "yellow" }
          ]
        },
        {
          "title": "Choose a place",
          "subtitle": "Where does the story happen?",
          "kind": "textInput",
          "placeholder": "e.g. deep in the rainforest"
        }
      ]
    },
    {
      "title": "Alice in Wonderland",
      "icon": "cup.and.saucer.fill",
      "tint": "purple",
      "steps": [
        {
          "title": "Pick a character",
          "subtitle": "Who joins the story?",
          "kind": "gridPick",
          "perCharacter": false,
          "options": [
            { "title": "Alice",            "icon": "figure.child",        "tint": "blue" },
            { "title": "Mad Hatter",       "icon": "cup.and.saucer.fill", "tint": "green" },
            { "title": "Queen of Hearts",  "icon": "heart.fill",          "tint": "red" },
            { "title": "Cheshire Cat",     "icon": "cat.fill",            "tint": "purple" },
            { "title": "The White Rabbit", "icon": "hare.fill",           "tint": "gray" },
            { "title": "Caterpillar",      "icon": "ant.fill",            "tint": "green" }
          ]
        },
        {
          "title": "Choose a place",
          "subtitle": "Where does the story happen?",
          "kind": "textInput",
          "placeholder": "e.g. down the rabbit hole"
        }
      ]
    },
    {
      "title": "Grimm's Tales",
      "icon": "book.closed.fill",
      "tint": "indigo",
      "steps": [
        {
          "title": "Pick a character",
          "subtitle": "Who joins the story?",
          "kind": "gridPick",
          "perCharacter": false,
          "options": [
            { "title": "Cinderella",        "icon": "sparkles",      "tint": "yellow" },
            { "title": "Red Riding Hood",   "icon": "figure.child",  "tint": "red" },
            { "title": "Hansel and Gretel", "icon": "house.fill",    "tint": "brown" },
            { "title": "Snow White",        "icon": "heart.fill",    "tint": "pink" },
            { "title": "Rapunzel",          "icon": "scissors",      "tint": "yellow" },
            { "title": "Rumpelstiltskin",   "icon": "wand.and.rays", "tint": "orange" },
            { "title": "Sleeping Beauty",   "icon": "moon.zzz.fill", "tint": "indigo" },
            { "title": "The Frog Prince",   "icon": "crown.fill",    "tint": "green" }
          ]
        },
        {
          "title": "Choose a place",
          "subtitle": "Where does the story happen?",
          "kind": "textInput",
          "placeholder": "e.g. an enchanted forest"
        }
      ]
    },
    {
      "title": "Wizard of Oz",
      "icon": "tornado",
      "tint": "teal",
      "steps": [
        {
          "title": "Pick a character",
          "subtitle": "Who joins the story?",
          "kind": "gridPick",
          "perCharacter": false,
          "options": [
            { "title": "Dorothy",       "icon": "figure.child",   "tint": "blue" },
            { "title": "Toto",          "icon": "dog.fill",       "tint": "gray" },
            { "title": "Scarecrow",     "icon": "leaf.fill",      "tint": "yellow" },
            { "title": "Tin Man",       "icon": "gearshape.fill", "tint": "gray" },
            { "title": "Cowardly Lion", "icon": "pawprint.fill",  "tint": "yellow" },
            { "title": "Glinda",        "icon": "wand.and.stars", "tint": "pink" }
          ]
        },
        {
          "title": "Choose a place",
          "subtitle": "Where does the story happen?",
          "kind": "textInput",
          "placeholder": "e.g. the Yellow Brick Road"
        }
      ]
    }
  ]
}
```
