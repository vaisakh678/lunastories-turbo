import { router, Stack, useLocalSearchParams } from 'expo-router';
import React, { useEffect, useMemo, useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import Animated, { FadeIn, FadeOut, SlideInRight } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useCharacters } from '@/api/characters';
import type { Character } from '@/api/models';
import { ChooseMode } from '@/components/create/choose-mode';
import { GeneratingStory } from '@/components/create/generating-story';
import {
  creativeMoralOptions,
  creativeProfessionOptions,
  creativeTypeOptions,
  twoStepModes,
  type StoryMode,
} from '@/components/create/modes';
import {
  CharacterStepHeader,
  cueFromOption,
  CustomTextSheet,
  OptionGrid,
  OptionList,
  PlainStepHeader,
  StepChrome,
  type GenerationCue,
  type PickOption,
} from '@/components/create/shared';
import { MoodyTwilightBackground } from '@/components/moody-twilight-background';
import { generation, useInFlightGeneration } from '@/services/generation';
import { subscriptionsStore } from '@/services/subscriptions';
import { colors, creamAlpha } from '@/theme/colors';

// ModeSheetView.swift ported as a single route with an internal step
// stack (the iOS version uses a NavigationStack inside a sheet).

type Node =
  | { kind: 'choose' }
  | { kind: 'pick'; modeTitle: string }
  | { kind: 'place'; modeTitle: string; picked: PickOption }
  | { kind: 'creative-type'; charIndex: number }
  | { kind: 'creative-profession'; charIndex: number }
  | { kind: 'creative-moral' }
  | { kind: 'generating'; cues: GenerationCue[] };

interface CustomSheetState {
  visible: boolean;
  title: string;
  prompt: string;
  placeholder: string;
  onContinue: (text: string) => void;
}

export default function CreateStoryScreen() {
  const insets = useSafeAreaInsets();
  const params = useLocalSearchParams<{ characterIds?: string }>();
  const { data: allCharacters = [] } = useCharacters();
  const inFlight = useInFlightGeneration();

  const characters = useMemo(() => {
    const ids = new Set((params.characterIds ?? '').split(',').filter(Boolean));
    return allCharacters.filter((c) => ids.has(c.id));
  }, [params.characterIds, allCharacters]);

  const [stack, setStack] = useState<Node[]>([{ kind: 'choose' }]);
  const [typeByChar, setTypeByChar] = useState<Record<string, PickOption>>({});
  const [professionByChar, setProfessionByChar] = useState<Record<string, PickOption>>({});
  const [customSheet, setCustomSheet] = useState<CustomSheetState | null>(null);
  const [startedId, setStartedId] = useState<string | null>(null);

  const top = stack[stack.length - 1];
  const push = (node: Node) => setStack((s) => [...s, node]);
  const pop = () => setStack((s) => (s.length > 1 ? s.slice(0, -1) : s));
  const close = () => router.back();

  // When OUR generation lands while this modal is still up, jump straight
  // to the reader (mirrors ModeSheetView's onChange(inFlight.status)).
  useEffect(() => {
    if (
      top.kind === 'generating' &&
      inFlight?.storyId === startedId &&
      inFlight.status === 'ready' &&
      inFlight.story
    ) {
      const id = inFlight.story.id;
      generation.acknowledge();
      router.replace(`/story/${id}`);
    }
  }, [inFlight, top.kind, startedId]);

  // Home characters as leading cues — "made for you and your kid".
  const homeCues = (): GenerationCue[] =>
    characters.map((c) => ({
      id: `char-${c.id}`,
      label: c.name,
      symbolName: c.symbolName,
      tint: colors.accent,
    }));

  const startGeneration = (modeKey: string, input: unknown, cues: GenerationCue[]) => {
    // iOS ModeSheetView.handleComplete gates generation on Pro — show the
    // paywall instead of starting when the user isn't subscribed.
    if (!subscriptionsStore.get().isPro) {
      router.push('/paywall' as never);
      return;
    }
    const allCues = [...homeCues(), ...cues];
    const id = generation.start(characters, modeKey, input);
    setStartedId(id);
    push({ kind: 'generating', cues: allCues });
  };

  // MARK: two-step modes (everything except Creative)

  const handleModeSelect = (mode: StoryMode) => {
    if (mode.title === 'Creative') {
      push({ kind: 'creative-type', charIndex: 0 });
    } else if (twoStepModes[mode.title]) {
      push({ kind: 'pick', modeTitle: mode.title });
    }
  };

  const completeTwoStep = (modeTitle: string, picked: PickOption, place: PickOption) => {
    const config = twoStepModes[modeTitle];
    const cues: GenerationCue[] = [
      { id: `mode-${config.modeKey}`, label: config.coverLabel, imageName: config.coverImage, symbolName: 'sparkles', tint: colors.accent },
      cueFromOption(picked, `picked-${picked.title}`),
      cueFromOption(place, `place-${place.title}`),
    ];
    startGeneration(config.modeKey, { picked: picked.title, place: place.title }, cues);
  };

  const openCustomPlace = (modeTitle: string, picked: PickOption) => {
    setCustomSheet({
      visible: true,
      title: 'Custom place',
      prompt: 'Type any place — real or imagined.',
      placeholder: "e.g. Grandma's house",
      onContinue: (text) => {
        setCustomSheet(null);
        completeTwoStep(modeTitle, picked, { title: text, symbolName: 'pencil', tint: creamAlpha(0.6) });
      },
    });
  };

  // MARK: creative mode

  const totalCreativeSteps = characters.length * 2 + 1;
  const stepLabel = (current: number) => `Step ${current} of ${totalCreativeSteps}`;

  const handleCreativeType = (option: PickOption, charIndex: number) => {
    const character = characters[charIndex];
    if (!character) return;
    setTypeByChar((m) => ({ ...m, [character.id]: option }));
    if (charIndex < characters.length - 1) {
      push({ kind: 'creative-type', charIndex: charIndex + 1 });
    } else {
      push({ kind: 'creative-profession', charIndex: 0 });
    }
  };

  const handleCreativeProfession = (option: PickOption, charIndex: number) => {
    const character = characters[charIndex];
    if (!character) return;
    setProfessionByChar((m) => ({ ...m, [character.id]: option }));
    if (charIndex < characters.length - 1) {
      push({ kind: 'creative-profession', charIndex: charIndex + 1 });
    } else {
      push({ kind: 'creative-moral' });
    }
  };

  const handleCreativeMoral = (option: PickOption) => {
    const typeMap: Record<string, string> = {};
    const professionMap: Record<string, string> = {};
    const cues: GenerationCue[] = [
      { id: 'mode-creative', label: 'Creative Mode', imageName: 'creative', symbolName: 'sparkles', tint: colors.accent },
    ];
    for (const character of characters) {
      const type = typeByChar[character.id];
      const profession = professionByChar[character.id];
      if (type) {
        typeMap[character.id] = type.title;
        cues.push({ ...cueFromOption(type, `type-${character.id}`), label: `${character.name} the ${type.title}` });
      }
      if (profession) {
        professionMap[character.id] = profession.title;
        cues.push({ ...cueFromOption(profession, `prof-${character.id}`), label: `${character.name} the ${profession.title}` });
      }
    }
    cues.push(cueFromOption(option));
    startGeneration('creative', { typeByChar: typeMap, professionByChar: professionMap, moral: option.title }, cues);
  };

  const openCustomMoral = () => {
    setCustomSheet({
      visible: true,
      title: 'Custom moral',
      prompt: 'What lesson should the story teach?',
      placeholder: 'e.g. Sharing makes everyone happier',
      onContinue: (text) => {
        setCustomSheet(null);
        handleCreativeMoral({ title: text, symbolName: 'pencil', tint: creamAlpha(0.6) });
      },
    });
  };

  // MARK: render

  const chromeTitle = (): string | undefined => {
    switch (top.kind) {
      case 'choose': return undefined;
      case 'pick': return twoStepModes[top.modeTitle].pickTitle;
      case 'place': return 'Choose a place';
      case 'creative-type': return 'Choose a type';
      case 'creative-profession': return 'Choose a profession';
      case 'creative-moral': return 'Choose a moral';
      case 'generating': return undefined;
    }
  };

  const renderStep = () => {
    switch (top.kind) {
      case 'choose':
        return <ChooseMode onSelect={handleModeSelect} />;

      case 'pick': {
        const config = twoStepModes[top.modeTitle];
        return (
          <View style={styles.stepBody}>
            <PlainStepHeader title={config.pickTitle} subtitle="Who joins the story?" />
            <OptionGrid
              options={config.characterOptions}
              onSelect={(picked) => push({ kind: 'place', modeTitle: top.modeTitle, picked })}
            />
          </View>
        );
      }

      case 'place': {
        const config = twoStepModes[top.modeTitle];
        return (
          <View style={styles.stepBody}>
            <PlainStepHeader title="Choose a place" subtitle="Where does the story happen?" />
            <OptionGrid
              options={config.placeOptions}
              onOther={() => openCustomPlace(top.modeTitle, top.picked)}
              onSelect={(place) => completeTwoStep(top.modeTitle, top.picked, place)}
            />
          </View>
        );
      }

      case 'creative-type': {
        const character: Character | undefined = characters[top.charIndex];
        return (
          <View style={styles.stepBody}>
            {character ? (
              <CharacterStepHeader
                character={character}
                title="Choose a type"
                stepLabel={stepLabel(top.charIndex + 1)}
              />
            ) : null}
            <OptionGrid options={creativeTypeOptions} onSelect={(o) => handleCreativeType(o, top.charIndex)} />
          </View>
        );
      }

      case 'creative-profession': {
        const character: Character | undefined = characters[top.charIndex];
        return (
          <View style={styles.stepBody}>
            {character ? (
              <CharacterStepHeader
                character={character}
                title="Choose a profession"
                stepLabel={stepLabel(characters.length + top.charIndex + 1)}
              />
            ) : null}
            <OptionGrid
              options={creativeProfessionOptions}
              onSelect={(o) => handleCreativeProfession(o, top.charIndex)}
            />
          </View>
        );
      }

      case 'creative-moral':
        return (
          <View style={styles.stepBody}>
            <PlainStepHeader
              title="Choose a moral"
              subtitle="Pick a lesson for your story."
              stepLabel={stepLabel(totalCreativeSteps)}
            />
            <OptionList options={creativeMoralOptions} onOther={openCustomMoral} onSelect={handleCreativeMoral} />
          </View>
        );

      case 'generating':
        return <GeneratingStory cues={top.cues} />;
    }
  };

  const isGenerating = top.kind === 'generating';

  return (
    <View style={styles.root}>
      <Stack.Screen options={{ headerShown: false, presentation: 'modal' }} />
      <MoodyTwilightBackground />
      <View style={{ paddingTop: insets.top ? insets.top : 12 }}>
        {isGenerating ? (
          // Generating: only a close ✕ on the right (banner takes over on Home).
          <StepChrome isRoot={false} title={undefined} onBack={() => {}} onClose={close} />
        ) : (
          <StepChrome
            isRoot={stack.length === 1}
            title={chromeTitle()}
            onBack={pop}
            onClose={close}
          />
        )}
      </View>
      <Animated.View
        key={`step-${stack.length}-${top.kind}`}
        entering={stack.length === 1 ? FadeIn.duration(200) : SlideInRight.duration(260)}
        exiting={FadeOut.duration(150)}
        style={styles.stepContainer}
      >
        {isGenerating ? (
          renderStep()
        ) : (
          <ScrollView contentContainerStyle={{ paddingBottom: insets.bottom + 24 }}>
            {renderStep()}
          </ScrollView>
        )}
      </Animated.View>

      {customSheet ? (
        <CustomTextSheet
          visible={customSheet.visible}
          title={customSheet.title}
          prompt={customSheet.prompt}
          placeholder={customSheet.placeholder}
          continueLabel="Continue"
          onCancel={() => setCustomSheet(null)}
          onContinue={customSheet.onContinue}
        />
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.twilightBottom,
  },
  stepContainer: {
    flex: 1,
  },
  stepBody: {
    gap: 16,
    paddingHorizontal: 20,
    paddingBottom: 24,
  },
});
