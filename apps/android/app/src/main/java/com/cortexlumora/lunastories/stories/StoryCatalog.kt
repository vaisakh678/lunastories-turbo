package com.cortexlumora.lunastories.stories

import androidx.compose.ui.graphics.Color
import com.cortexlumora.lunastories.R
import com.cortexlumora.lunastories.ui.components.ColorPalette

/** A pickable option in a mode form (a type, profession, place, story character, or moral). */
data class PickOption(
    val title: String,
    val drawableRes: Int? = null,
    val tintName: String? = null,
) {
    val tint: Color get() = ColorPalette.color(tintName)
}

/** One of the 9 story modes shown in the mode picker. */
data class StoryMode(
    val modeKey: String,
    val title: String,
    val description: String,
    val heroRes: Int,
    val tintName: String,
) {
    val tint: Color get() = ColorPalette.color(tintName)
}

val StoryModes: List<StoryMode> = listOf(
    StoryMode("creative", "Creative", "Build a story your way", R.drawable.story_modes_creative, "pink"),
    StoryMode("inventors", "Inventors", "Meet a curious scientist", R.drawable.story_modes_inventors, "yellow"),
    StoryMode("construction_site", "Construction Site", "Builders and big machines", R.drawable.story_modes_construction_site, "orange"),
    StoryMode("vegetable", "Vegetable", "Garden-grown adventures", R.drawable.story_modes_vegetables, "green"),
    StoryMode("environment", "Environment", "Caring for our planet", R.drawable.story_modes_environment, "blue"),
    StoryMode("jungle_book", "Jungle Book", "Wild tales of the jungle", R.drawable.story_modes_jungle_book, "brown"),
    StoryMode("alice_in_wonderland", "Alice in Wonderland", "A curious looking-glass world", R.drawable.story_modes_alice_in_wonderland, "purple"),
    StoryMode("grimms_tales", "Grimm's Tales", "Classic fairy-tale magic", R.drawable.story_modes_grimms_tales, "indigo"),
    StoryMode("wizard_of_oz", "Wizard of Oz", "Down the yellow brick road", R.drawable.story_modes_wizard_of_oz, "teal"),
)

object CreativeOptions {
    val types: List<PickOption> = listOf(
        PickOption("Fox", R.drawable.story_type_fox, "orange"),
        PickOption("Dragon", R.drawable.story_type_dragon, "red"),
        PickOption("Elf", R.drawable.story_type_elf, "green"),
        PickOption("Dinosaur", R.drawable.story_type_dinosaur, "green"),
        PickOption("Robot", R.drawable.story_type_robot, "gray"),
        PickOption("Unicorn", R.drawable.story_type_unicorn, "pink"),
        PickOption("Dog", R.drawable.story_type_dog, "brown"),
        PickOption("Bear", R.drawable.story_type_bear, "brown"),
        PickOption("Cat", R.drawable.story_type_cat, "orange"),
        PickOption("Rabbit", R.drawable.story_type_rabbit, "gray"),
        PickOption("Dolphin", R.drawable.story_type_dolphin, "blue"),
        PickOption("Fairy", R.drawable.story_type_fairy, "pink"),
    )

    val professions: List<PickOption> = listOf(
        PickOption("Astronaut", R.drawable.story_profession_astronaut, "blue"),
        PickOption("Detective", R.drawable.story_profession_detective, "brown"),
        PickOption("Police Officer", R.drawable.story_profession_police_officer, "indigo"),
        PickOption("Prince", R.drawable.story_profession_prince, "purple"),
        PickOption("Superhero", R.drawable.story_profession_superhero, "red"),
        PickOption("Wizard", R.drawable.story_profession_wizard, "purple"),
        PickOption("Athlete", R.drawable.story_profession_athlete, "green"),
        PickOption("Teacher", R.drawable.story_profession_teacher, "orange"),
        PickOption("Cowboy", R.drawable.story_profession_cowboy, "brown"),
        PickOption("Doctor", R.drawable.story_profession_doctor, "red"),
        PickOption("Explorer", R.drawable.story_profession_explorer, "green"),
        PickOption("Mechanic", R.drawable.story_profession_mechanic, "gray"),
        PickOption("Ninja", R.drawable.story_profession_ninja, "gray"),
        PickOption("Pilot", R.drawable.story_profession_pilot, "blue"),
        PickOption("Scientist", R.drawable.story_profession_scientist, "teal"),
        PickOption("Spy", R.drawable.story_profession_spy, "gray"),
    )

    val morals: List<PickOption> = listOf(
        PickOption("Kindness", tintName = "pink"),
        PickOption("Bravery", tintName = "red"),
        PickOption("Honesty", tintName = "blue"),
        PickOption("Friendship", tintName = "green"),
        PickOption("Sharing", tintName = "orange"),
        PickOption("Curiosity", tintName = "purple"),
        PickOption("Patience", tintName = "teal"),
    )
}

/** Static catalog of pickable characters + places per non-creative mode. */
object IconicModes {
    data class ModeData(
        val characters: List<PickOption>,
        val places: List<PickOption>,
    )

    val byModeKey: Map<String, ModeData> = mapOf(
        "inventors" to ModeData(
            characters = listOf(
                PickOption("Ada Lovelace", R.drawable.story_inventors_ada_lovelace),
                PickOption("Albert Einstein", R.drawable.story_inventors_albert_einstein),
                PickOption("Charles Darwin", R.drawable.story_inventors_charles_darwin),
                PickOption("Florence Nightingale", R.drawable.story_inventors_florence_nightingale),
                PickOption("Galileo Galilei", R.drawable.story_inventors_galileo_galilei),
                PickOption("Isaac Newton", R.drawable.story_inventors_isaac_newton),
                PickOption("Leonardo da Vinci", R.drawable.story_inventors_leonardo_da_vinci),
                PickOption("Marie Curie", R.drawable.story_inventors_marie_curie),
                PickOption("Nikola Tesla", R.drawable.story_inventors_nikola_tesla),
                PickOption("Rosalind Franklin", R.drawable.story_inventors_rosalind_franklin),
            ),
            places = listOf(
                PickOption("Laboratory", R.drawable.story_places_inventors_laboratory),
                PickOption("Observatory", R.drawable.story_places_inventors_observatory),
                PickOption("Workshop", R.drawable.story_places_inventors_workshop),
                PickOption("Library", R.drawable.story_places_inventors_library),
                PickOption("Garden", R.drawable.story_places_inventors_garden),
                PickOption("Classroom", R.drawable.story_places_inventors_classroom),
            ),
        ),
        "construction_site" to ModeData(
            characters = listOf(
                PickOption("Benny the Bulldozer", R.drawable.story_construction_site_benny_the_bulldozer),
                PickOption("Charlie the Construction Worker", R.drawable.story_construction_site_charlie_the_construction_worker),
                PickOption("Kara the Crane", R.drawable.story_construction_site_kara_the_crane),
                PickOption("Molly the Mixer", R.drawable.story_construction_site_molly_the_mixer),
                PickOption("Patty the Paver", R.drawable.story_construction_site_patty_the_paver),
                PickOption("Sammy the Safety Cone", R.drawable.story_construction_site_sammy_the_safety_cone),
            ),
            places = listOf(
                PickOption("New Building Site", R.drawable.story_places_construction_site_new_building_site),
                PickOption("Road Project", R.drawable.story_places_construction_site_road_project),
                PickOption("Bridge", R.drawable.story_places_construction_site_bridge),
                PickOption("Tall Tower", R.drawable.story_places_construction_site_tall_tower),
                PickOption("Park Renovation", R.drawable.story_places_construction_site_park_renovation),
                PickOption("Tunnel", R.drawable.story_places_construction_site_tunnel),
            ),
        ),
        "vegetable" to ModeData(
            characters = listOf(
                PickOption("Bella the Broccoli", R.drawable.story_vegetables_bella_the_broccoli),
                PickOption("Carla the Carrot", R.drawable.story_vegetables_carla_the_carrot),
                PickOption("Olivia the Onion", R.drawable.story_vegetables_olivia_the_onion),
                PickOption("Peppy the Pepper", R.drawable.story_vegetables_peppy_the_pepper),
                PickOption("Peter the Potato", R.drawable.story_vegetables_peter_the_potato),
                PickOption("Tommy the Tomato", R.drawable.story_vegetables_tommy_the_tomato),
            ),
            places = listOf(
                PickOption("The Garden", R.drawable.story_places_vegetables_the_garden),
                PickOption("Greenhouse", R.drawable.story_places_vegetables_greenhouse),
                PickOption("Veggie Patch", R.drawable.story_places_vegetables_veggie_patch),
                PickOption("Farmer's Market", R.drawable.story_places_vegetables_farmers_market),
                PickOption("Kitchen", R.drawable.story_places_vegetables_kitchen),
                PickOption("Soup Pot", R.drawable.story_places_vegetables_soup_pot),
            ),
        ),
        "environment" to ModeData(
            characters = listOf(
                PickOption("Greeny the Tree", R.drawable.story_environment_greeny_the_tree),
                PickOption("Polly the Pollinator", R.drawable.story_environment_polly_the_pollinator),
                PickOption("Recyclo the Bin", R.drawable.story_environment_recyclo_the_bin),
                PickOption("Sunny the Solar Panel", R.drawable.story_environment_sunny_the_solar_panel),
                PickOption("Wally the Water Drop", R.drawable.story_environment_wally_the_water_drop),
                PickOption("Windy the Wind Turbine", R.drawable.story_environment_windy_the_wind_turbine),
            ),
            places = listOf(
                PickOption("Forest", R.drawable.story_places_environment_forest),
                PickOption("Beach", R.drawable.story_places_environment_beach),
                PickOption("City Park", R.drawable.story_places_environment_city_park),
                PickOption("Recycling Center", R.drawable.story_places_environment_recycling_center),
                PickOption("Schoolyard", R.drawable.story_places_environment_schoolyard),
                PickOption("Solar Farm", R.drawable.story_places_environment_solar_farm),
            ),
        ),
        "jungle_book" to ModeData(
            characters = listOf(
                PickOption("Mowgli", R.drawable.story_jungle_book_mowgli),
                PickOption("Baloo", R.drawable.story_jungle_book_baloo),
                PickOption("Bagheera", R.drawable.story_jungle_book_bagheera),
                PickOption("Kaa", R.drawable.story_jungle_book_kaa),
                PickOption("King Bandar", R.drawable.story_jungle_book_king_bandar),
                PickOption("Shere Khan", R.drawable.story_jungle_book_shere_khan),
            ),
            places = listOf(
                PickOption("Rainforest", R.drawable.story_places_jungle_book_rainforest),
                PickOption("Bamboo Grove", R.drawable.story_places_jungle_book_bamboo_grove),
                PickOption("Wolf Cave", R.drawable.story_places_jungle_book_wolf_cave),
                PickOption("Ancient Ruins", R.drawable.story_places_jungle_book_ancient_ruins),
                PickOption("Crocodile River", R.drawable.story_places_jungle_book_crocodile_river),
                PickOption("King's Throne", R.drawable.story_places_jungle_book_kings_throne),
            ),
        ),
        "alice_in_wonderland" to ModeData(
            characters = listOf(
                PickOption("Alice", R.drawable.story_alice_in_wonderland_alice),
                PickOption("The White Rabbit", R.drawable.story_alice_in_wonderland_the_white_rabbit),
                PickOption("Cheshire Cat", R.drawable.story_alice_in_wonderland_cheshire_cat),
                PickOption("Mad Hatter", R.drawable.story_alice_in_wonderland_mad_hatter),
                PickOption("Queen of Hearts", R.drawable.story_alice_in_wonderland_queen_of_hearts),
                PickOption("Caterpillar", R.drawable.story_alice_in_wonderland_caterpillar),
            ),
            places = listOf(
                PickOption("Down the Rabbit Hole", R.drawable.story_places_alice_in_wonderland_down_the_rabbit_hole),
                PickOption("Tea Party Garden", R.drawable.story_places_alice_in_wonderland_tea_party_garden),
                PickOption("Croquet Field", R.drawable.story_places_alice_in_wonderland_croquet_field),
                PickOption("Mad Hatter's House", R.drawable.story_places_alice_in_wonderland_mad_hatters_house),
                PickOption("Caterpillar's Mushroom", R.drawable.story_places_alice_in_wonderland_caterpillars_mushroom),
                PickOption("Cheshire's Tree", R.drawable.story_places_alice_in_wonderland_cheshires_tree),
            ),
        ),
        "grimms_tales" to ModeData(
            characters = listOf(
                PickOption("Cinderella", R.drawable.story_grimms_tales_cinderella),
                PickOption("Snow White", R.drawable.story_grimms_tales_snow_white),
                PickOption("Rapunzel", R.drawable.story_grimms_tales_rapunzel),
                PickOption("Sleeping Beauty", R.drawable.story_grimms_tales_sleeping_beauty),
                PickOption("Red Riding Hood", R.drawable.story_grimms_tales_red_riding_hood),
                PickOption("Hansel and Gretel", R.drawable.story_grimms_tales_hansel_and_gretel),
                PickOption("Rumpelstiltskin", R.drawable.story_grimms_tales_rumpelstiltskin),
                PickOption("The Frog Prince", R.drawable.story_grimms_tales_the_frog_prince),
            ),
            places = listOf(
                PickOption("Enchanted Forest", R.drawable.story_places_grimms_tales_enchanted_forest),
                PickOption("Castle Tower", R.drawable.story_places_grimms_tales_castle_tower),
                PickOption("Witch's Cottage", R.drawable.story_places_grimms_tales_witchs_cottage),
                PickOption("Royal Garden", R.drawable.story_places_grimms_tales_royal_garden),
                PickOption("Magic Lake", R.drawable.story_places_grimms_tales_magic_lake),
                PickOption("Faraway Kingdom", R.drawable.story_places_grimms_tales_faraway_kingdom),
            ),
        ),
        "wizard_of_oz" to ModeData(
            characters = listOf(
                PickOption("Dorothy", R.drawable.story_wizard_of_oz_dorothy),
                PickOption("Scarecrow", R.drawable.story_wizard_of_oz_scarecrow),
                PickOption("Tin Man", R.drawable.story_wizard_of_oz_tin_man),
                PickOption("Cowardly Lion", R.drawable.story_wizard_of_oz_cowardly_lion),
                PickOption("Glinda", R.drawable.story_wizard_of_oz_glinda),
                PickOption("Toto", R.drawable.story_wizard_of_oz_toto),
            ),
            places = listOf(
                PickOption("Yellow Brick Road", R.drawable.story_places_wizard_of_oz_yellow_brick_road),
                PickOption("Emerald City", R.drawable.story_places_wizard_of_oz_emerald_city),
                PickOption("Munchkin Land", R.drawable.story_places_wizard_of_oz_munchkin_land),
                PickOption("Poppy Field", R.drawable.story_places_wizard_of_oz_poppy_field),
                PickOption("Wicked Witch's Castle", R.drawable.story_places_wizard_of_oz_wicked_witchs_castle),
                PickOption("Glinda's Bubble", R.drawable.story_places_wizard_of_oz_glindas_bubble),
            ),
        ),
    )
}
