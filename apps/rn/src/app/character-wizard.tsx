import { SymbolView } from 'expo-symbols';
import { router, useLocalSearchParams } from 'expo-router';
import { useMemo, useState } from 'react';
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import {
  useCharacters,
  useCreateCharacter,
  useDeleteCharacter,
  useUpdateCharacter,
} from '@/api/characters';
import { relationDisplayNames, type Character, type CharacterRole } from '@/api/models';
import { MoodyTwilightBackground } from '@/components/moody-twilight-background';
import { useToast } from '@/components/toast';
import { AppearanceStep } from '@/components/wizard/appearance-step';
import { BasicInfoStep } from '@/components/wizard/basic-info-step';
import {
  addPromptTitle,
  initDraft,
  stepsFor,
  stepTitles,
  type CharacterDraft,
  type WizardStep,
} from '@/components/wizard/draft';
import { IconStep } from '@/components/wizard/icon-step';
import { InterestsStep } from '@/components/wizard/interests-step';
import { RelationStep } from '@/components/wizard/relation-step';
import { SideBasicInfoStep } from '@/components/wizard/side-basic-info-step';
import { ProgressBar } from '@/components/wizard/ui';
import { colors, creamAlpha } from '@/theme/colors';

// CharacterWizardSheet.swift ported as a route. Create mode:
// /character-wizard?role=main|side. Edit mode: /character-wizard?characterId=<id>
// (character read from the useCharacters() cache; role comes from it).
export default function CharacterWizardScreen() {
  const params = useLocalSearchParams<{ role?: string; characterId?: string }>();
  const insets = useSafeAreaInsets();
  const toast = useToast();
  const { data: characters = [] } = useCharacters();
  const createCharacter = useCreateCharacter();
  const updateCharacter = useUpdateCharacter();
  const deleteCharacter = useDeleteCharacter();

  const editing: Character | null = useMemo(
    () => characters.find((c) => c.id === params.characterId) ?? null,
    [characters, params.characterId],
  );
  const role: CharacterRole = editing?.role ?? (params.role === 'side' ? 'side' : 'main');
  const isEditing = editing !== null;
  const navTitle = isEditing ? 'Edit Character' : addPromptTitle(role);

  const steps = stepsFor(role);
  const [stepIndex, setStepIndex] = useState(0);
  const [draft, setDraft] = useState<CharacterDraft>(() => initDraft(editing));
  const step: WizardStep = steps[stepIndex];
  const isLastStep = stepIndex === steps.length - 1;

  const onChange = (patch: Partial<CharacterDraft>) => setDraft((d) => ({ ...d, ...patch }));

  // Only the name gate blocks advancing, same as canAdvanceMain/-Side.
  const canAdvance = step === 'basicInfo' ? draft.name.trim().length > 0 : true;

  const save = async () => {
    const trimmedName = draft.name.trim();
    let tagline: string;
    if (role === 'side' && draft.relation) {
      const custom = draft.customRelation.trim();
      tagline =
        draft.relation === 'other' && custom.length > 0
          ? custom
          : relationDisplayNames[draft.relation];
    } else {
      tagline = [...draft.interests].sort().slice(0, 2).join(' · ');
    }
    const payload = {
      name: trimmedName,
      role,
      symbolName: draft.iconName,
      tintName: editing?.tintName ?? (role === 'main' ? 'orange' : 'gray'),
      tagline,
      relation: draft.relation,
      age: draft.age,
      gender: draft.gender,
      hairColor: draft.hairColor,
      eyeColor: draft.eyeColor,
      hairstyle: draft.hairstyle,
      interests: [...draft.interests].sort(),
      extraInterestNote: draft.extraInterestNote.trim(),
    };
    try {
      if (isEditing && editing) {
        await updateCharacter.mutateAsync({ id: editing.id, patch: payload });
      } else {
        await createCharacter.mutateAsync(payload);
      }
      router.back();
    } catch (error) {
      toast.show((error as Error).message);
    }
  };

  const confirmDelete = () => {
    Alert.alert(
      'Delete this character?',
      `This will permanently delete ${editing?.name ?? 'the character'}. You can't undo this.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            if (!editing) return;
            try {
              await deleteCharacter.mutateAsync(editing.id);
              router.back();
            } catch (error) {
              toast.show((error as Error).message);
            }
          },
        },
      ],
    );
  };

  return (
    <View style={styles.root}>
      <MoodyTwilightBackground />
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        {/* Inline nav bar: ✕ left, centered title, trash right in edit mode. */}
        <View style={[styles.navBar, { paddingTop: insets.top + 6 }]}>
          <Pressable onPress={() => router.back()} hitSlop={10} accessibilityLabel="Close">
            <SymbolView name="xmark" size={17} weight="semibold" tintColor={colors.cream} />
          </Pressable>
          <Text style={styles.navTitle} numberOfLines={1}>
            {navTitle}
          </Text>
          {isEditing ? (
            <Pressable onPress={confirmDelete} hitSlop={10} accessibilityLabel="Delete character">
              <SymbolView name="trash" size={17} weight="semibold" tintColor="#FF453A" />
            </Pressable>
          ) : (
            <View style={styles.navSpacer} />
          )}
        </View>

        <View style={styles.progressWrap}>
          <ProgressBar currentIndex={stepIndex} total={steps.length} />
        </View>

        <ScrollView
          style={styles.flex}
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
          <Text style={styles.stepTitle}>{stepTitles[step]}</Text>
          {step === 'basicInfo' && role === 'main' ? (
            <BasicInfoStep draft={draft} onChange={onChange} />
          ) : null}
          {step === 'basicInfo' && role === 'side' ? (
            <SideBasicInfoStep draft={draft} onChange={onChange} />
          ) : null}
          {step === 'relation' ? <RelationStep draft={draft} onChange={onChange} /> : null}
          {step === 'icon' ? <IconStep draft={draft} onChange={onChange} /> : null}
          {step === 'appearance' ? <AppearanceStep draft={draft} onChange={onChange} /> : null}
          {step === 'interests' ? <InterestsStep draft={draft} onChange={onChange} /> : null}
        </ScrollView>

        <View style={[styles.bottomBar, { paddingBottom: Math.max(insets.bottom, 12) }]}>
          {stepIndex > 0 ? (
            <Pressable onPress={() => setStepIndex((i) => i - 1)} style={styles.backButton}>
              <Text style={styles.backLabel}>Back</Text>
            </Pressable>
          ) : null}
          <Pressable
            onPress={() => (isLastStep ? save() : setStepIndex((i) => i + 1))}
            disabled={!canAdvance || createCharacter.isPending || updateCharacter.isPending}
            style={[
              styles.nextButton,
              { backgroundColor: canAdvance ? colors.accent : 'rgba(142,142,147,0.4)' },
            ]}
          >
            <Text style={styles.nextLabel}>{isLastStep ? 'Save' : 'Next'}</Text>
          </Pressable>
        </View>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.twilightBottom,
  },
  flex: {
    flex: 1,
  },
  navBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingBottom: 6,
  },
  navTitle: {
    flex: 1,
    textAlign: 'center',
    fontSize: 17,
    fontWeight: '600',
    color: colors.cream,
    paddingHorizontal: 12,
  },
  navSpacer: {
    width: 17,
  },
  progressWrap: {
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 8,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 16,
    gap: 20,
  },
  stepTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: colors.cream,
    paddingTop: 8,
  },
  bottomBar: {
    flexDirection: 'row',
    gap: 12,
    paddingHorizontal: 20,
    paddingTop: 12,
  },
  backButton: {
    paddingHorizontal: 28,
    paddingVertical: 16,
    borderRadius: 999,
    backgroundColor: 'rgba(240,106,74,0.12)',
  },
  backLabel: {
    fontSize: 17,
    fontWeight: '600',
    color: colors.accent,
  },
  nextButton: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 16,
    borderRadius: 999,
  },
  nextLabel: {
    fontSize: 17,
    fontWeight: '600',
    color: 'white',
  },
});
