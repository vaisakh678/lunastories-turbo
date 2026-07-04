import { BlurView } from 'expo-blur';
import { Image } from 'expo-image';
import { SymbolView } from 'expo-symbols';
import React, { useState } from 'react';
import {
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import Svg, { Rect } from 'react-native-svg';

import type { Character } from '@/api/models';
import { CharacterIcon } from '@/components/character-icon';
import { accentAlpha, colors, creamAlpha } from '@/theme/colors';
import { storyImages } from './story-images';

// Shared pieces of the mode flows, ported from ModeSheet/SharedComponents.swift.

export interface PickOption {
  title: string;
  symbolName: string;
  tint: string; // concrete color, not a palette name
  imageName?: string;
}

// GenerationCue from GeneratingStoryView.swift — one frame in the
// personalized loading carousel.
export interface GenerationCue {
  id: string;
  label: string;
  imageName?: string;
  symbolName: string;
  tint: string;
}

export function cueFromOption(option: PickOption, id?: string): GenerationCue {
  return {
    id: id ?? `pick-${option.title}`,
    label: option.title,
    imageName: option.imageName,
    symbolName: option.symbolName,
    tint: option.tint,
  };
}

// StepBadge — tiny "Step X of Y" pill.
export function StepBadge({ text }: { text: string }) {
  return (
    <View style={badgeStyles.badge}>
      <Text style={badgeStyles.text}>{text}</Text>
    </View>
  );
}

const badgeStyles = StyleSheet.create({
  badge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
    backgroundColor: accentAlpha(0.12),
    alignSelf: 'center',
  },
  text: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.accent,
  },
});

// PlainStepHeader — bold title + optional subtitle/step pill.
export function PlainStepHeader({
  title,
  subtitle,
  stepLabel,
}: {
  title: string;
  subtitle?: string;
  stepLabel?: string;
}) {
  return (
    <View style={plainHeaderStyles.container}>
      {stepLabel ? (
        <View style={{ paddingBottom: 6 }}>
          <StepBadge text={stepLabel} />
        </View>
      ) : null}
      <Text style={plainHeaderStyles.title}>{title}</Text>
      {subtitle ? <Text style={plainHeaderStyles.subtitle}>{subtitle}</Text> : null}
    </View>
  );
}

const plainHeaderStyles = StyleSheet.create({
  container: {
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 20,
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    color: colors.cream,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 15,
    color: creamAlpha(0.65),
    textAlign: 'center',
  },
});

// CharacterStepHeader — step pill + character avatar + name + prompt.
export function CharacterStepHeader({
  character,
  title,
  stepLabel,
}: {
  character: Character;
  title: string;
  stepLabel?: string;
}) {
  return (
    <View style={charHeaderStyles.container}>
      {stepLabel ? <StepBadge text={stepLabel} /> : null}
      <View style={charHeaderStyles.icon}>
        <CharacterIcon
          symbolName={character.symbolName}
          tintName={character.tintName}
          cornerRadius={32}
          glyphSize={28}
        />
      </View>
      <Text style={charHeaderStyles.name}>{character.name}</Text>
      <Text style={charHeaderStyles.title}>{title}</Text>
    </View>
  );
}

const charHeaderStyles = StyleSheet.create({
  container: {
    alignItems: 'center',
    gap: 10,
  },
  icon: {
    width: 64,
    height: 64,
  },
  name: {
    fontSize: 20,
    fontWeight: '600',
    color: colors.cream,
  },
  title: {
    fontSize: 15,
    color: creamAlpha(0.65),
  },
});

// OptionGrid — 2-column grid: Surprise tile, options, optional "Other…".
export function OptionGrid({
  options,
  allowSurprise = true,
  onOther,
  onSelect,
}: {
  options: PickOption[];
  allowSurprise?: boolean;
  onOther?: () => void;
  onSelect: (option: PickOption) => void;
}) {
  type Cell =
    | { kind: 'surprise' }
    | { kind: 'option'; option: PickOption }
    | { kind: 'other' }
    | { kind: 'spacer' };

  const cells: Cell[] = [];
  if (allowSurprise && options.length > 0) cells.push({ kind: 'surprise' });
  options.forEach((option) => cells.push({ kind: 'option', option }));
  if (onOther) cells.push({ kind: 'other' });
  if (cells.length % 2 === 1) cells.push({ kind: 'spacer' });

  const rows: Cell[][] = [];
  for (let i = 0; i < cells.length; i += 2) rows.push(cells.slice(i, i + 2));

  const pickRandom = () => {
    const pick = options[Math.floor(Math.random() * options.length)];
    if (pick) onSelect(pick);
  };

  return (
    <View style={gridStyles.grid}>
      {rows.map((row, rowIndex) => (
        <View key={rowIndex} style={gridStyles.row}>
          {row.map((cell, cellIndex) => {
            switch (cell.kind) {
              case 'surprise':
                return <SurpriseTile key="surprise" onPress={pickRandom} />;
              case 'option':
                return (
                  <OptionTile
                    key={cell.option.title}
                    option={cell.option}
                    onPress={() => onSelect(cell.option)}
                  />
                );
              case 'other':
                return <OtherTile key="other" onPress={onOther!} />;
              case 'spacer':
                return <View key={`spacer-${cellIndex}`} style={gridStyles.spacer} />;
            }
          })}
        </View>
      ))}
    </View>
  );
}

const gridStyles = StyleSheet.create({
  grid: {
    gap: 20,
  },
  row: {
    flexDirection: 'row',
    gap: 20,
  },
  spacer: {
    flex: 1,
  },
});

function tileLabel(text: string) {
  return (
    <Text numberOfLines={2} style={tileStyles.label}>
      {text}
    </Text>
  );
}

export function OptionTile({ option, onPress }: { option: PickOption; onPress: () => void }) {
  const image = option.imageName ? storyImages[option.imageName] : undefined;
  return (
    <Pressable onPress={onPress} style={tileStyles.container}>
      {image ? (
        <Image source={image} style={tileStyles.image} contentFit="cover" />
      ) : (
        <View style={[tileStyles.symbolTile, { backgroundColor: `${option.tint}52` }]}>
          <SymbolView
            name={option.symbolName as never}
            size={28}
            weight="semibold"
            tintColor={colors.cream}
          />
        </View>
      )}
      {tileLabel(option.title)}
    </Pressable>
  );
}

function SurpriseTile({ onPress }: { onPress: () => void }) {
  return (
    <Pressable onPress={onPress} style={tileStyles.container}>
      <View style={tileStyles.surpriseTile}>
        <SymbolView name="dice.fill" size={36} weight="semibold" tintColor="white" />
      </View>
      {tileLabel('Surprise me')}
    </Pressable>
  );
}

function OtherTile({ onPress }: { onPress: () => void }) {
  return (
    <Pressable onPress={onPress} style={tileStyles.container}>
      <View style={tileStyles.otherTile}>
        <Svg style={StyleSheet.absoluteFill} width="100%" height="100%">
          <Rect
            x={1}
            y={1}
            width="99%"
            height="99%"
            rx={22}
            ry={22}
            fill="none"
            stroke={creamAlpha(0.35)}
            strokeWidth={2}
            strokeDasharray="6 6"
          />
        </Svg>
        <SymbolView name="pencil" size={32} weight="semibold" tintColor={creamAlpha(0.7)} />
      </View>
      {tileLabel('Other…')}
    </Pressable>
  );
}

const tileStyles = StyleSheet.create({
  container: {
    flex: 1,
    gap: 6,
  },
  image: {
    aspectRatio: 1,
    borderRadius: 22,
    borderCurve: 'continuous',
    width: '100%',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
  },
  symbolTile: {
    aspectRatio: 1,
    borderRadius: 22,
    borderCurve: 'continuous',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
  },
  surpriseTile: {
    aspectRatio: 1,
    borderRadius: 22,
    borderCurve: 'continuous',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.accent,
  },
  otherTile: {
    aspectRatio: 1,
    borderRadius: 22,
    borderCurve: 'continuous',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  label: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.cream,
    textAlign: 'center',
  },
});

// OptionList — row list variant (used by the moral step).
export function OptionList({
  options,
  allowSurprise = true,
  onOther,
  onSelect,
}: {
  options: PickOption[];
  allowSurprise?: boolean;
  onOther?: () => void;
  onSelect: (option: PickOption) => void;
}) {
  const pickRandom = () => {
    const pick = options[Math.floor(Math.random() * options.length)];
    if (pick) onSelect(pick);
  };
  return (
    <View style={listStyles.list}>
      {allowSurprise && options.length > 0 ? (
        <Pressable onPress={pickRandom} style={[listStyles.row, listStyles.surpriseRow]}>
          <View style={[listStyles.iconBox, listStyles.surpriseIcon]}>
            <SymbolView name="dice.fill" size={20} weight="semibold" tintColor="white" />
          </View>
          <Text style={listStyles.rowTitleSemibold}>Surprise me</Text>
          <View style={listStyles.flexSpacer} />
          <SymbolView name="chevron.right" size={13} tintColor={creamAlpha(0.4)} />
        </Pressable>
      ) : null}
      {options.map((option) => (
        <Pressable key={option.title} onPress={() => onSelect(option)} style={listStyles.row}>
          <View style={[listStyles.iconBox, { backgroundColor: `${option.tint}2E` }]}>
            <SymbolView
              name={option.symbolName as never}
              size={20}
              weight="semibold"
              tintColor={option.tint}
            />
          </View>
          <Text style={listStyles.rowTitle}>{option.title}</Text>
          <View style={listStyles.flexSpacer} />
          <SymbolView name="chevron.right" size={13} tintColor={creamAlpha(0.4)} />
        </Pressable>
      ))}
      {onOther ? (
        <Pressable onPress={onOther} style={listStyles.row}>
          <View style={listStyles.otherIconBox}>
            <SymbolView name="pencil" size={20} weight="semibold" tintColor={creamAlpha(0.6)} />
          </View>
          <Text style={listStyles.rowTitleSemibold}>Other…</Text>
          <View style={listStyles.flexSpacer} />
          <SymbolView name="chevron.right" size={13} tintColor={creamAlpha(0.4)} />
        </Pressable>
      ) : null}
    </View>
  );
}

const listStyles = StyleSheet.create({
  list: {
    gap: 8,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderRadius: 14,
    borderCurve: 'continuous',
    backgroundColor: creamAlpha(0.06),
  },
  surpriseRow: {
    backgroundColor: accentAlpha(0.1),
  },
  iconBox: {
    width: 44,
    height: 44,
    borderRadius: 14,
    borderCurve: 'continuous',
    alignItems: 'center',
    justifyContent: 'center',
  },
  surpriseIcon: {
    backgroundColor: colors.accent,
  },
  otherIconBox: {
    width: 44,
    height: 44,
    borderRadius: 14,
    borderCurve: 'continuous',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderStyle: 'dashed',
    borderColor: creamAlpha(0.35),
  },
  rowTitle: {
    fontSize: 15,
    fontWeight: '500',
    color: colors.cream,
    flexShrink: 1,
  },
  rowTitleSemibold: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.cream,
    flexShrink: 1,
  },
  flexSpacer: {
    flex: 1,
  },
});

// CustomTextSheet — free-text entry modal (custom place / custom moral).
export function CustomTextSheet({
  visible,
  title,
  prompt,
  placeholder,
  continueLabel,
  onCancel,
  onContinue,
}: {
  visible: boolean;
  title: string;
  prompt: string;
  placeholder: string;
  continueLabel: string;
  onCancel: () => void;
  onContinue: (text: string) => void;
}) {
  const [text, setText] = useState('');
  const trimmed = text.trim();
  const canSubmit = trimmed.length > 0;

  const submit = () => {
    if (!canSubmit) return;
    onContinue(trimmed);
    setText('');
  };

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onCancel}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={sheetStyles.backdrop}
      >
        <Pressable style={sheetStyles.backdropTouch} onPress={onCancel} />
        <BlurView intensity={60} tint="dark" style={sheetStyles.sheet}>
          <View style={sheetStyles.header}>
            <Pressable onPress={onCancel} hitSlop={8}>
              <Text style={sheetStyles.cancel}>Cancel</Text>
            </Pressable>
          </View>
          <Text style={sheetStyles.title}>{title}</Text>
          <Text style={sheetStyles.prompt}>{prompt}</Text>
          <TextInput
            value={text}
            onChangeText={setText}
            placeholder={placeholder}
            placeholderTextColor={creamAlpha(0.4)}
            style={sheetStyles.input}
            autoFocus
            multiline
            returnKeyType="go"
            blurOnSubmit
            onSubmitEditing={submit}
          />
          <Pressable
            onPress={submit}
            disabled={!canSubmit}
            style={[sheetStyles.cta, { backgroundColor: canSubmit ? colors.accent : 'rgba(128,128,128,0.4)' }]}
          >
            <Text style={sheetStyles.ctaLabel}>{continueLabel}</Text>
          </Pressable>
        </BlurView>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const sheetStyles = StyleSheet.create({
  backdrop: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  backdropTouch: {
    flex: 1,
  },
  sheet: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    borderCurve: 'continuous',
    overflow: 'hidden',
    paddingHorizontal: 20,
    paddingBottom: 40,
    backgroundColor: 'rgba(20, 14, 40, 0.85)',
  },
  header: {
    flexDirection: 'row',
    paddingVertical: 12,
  },
  cancel: {
    fontSize: 17,
    color: colors.accent,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.cream,
    textAlign: 'center',
  },
  prompt: {
    fontSize: 15,
    color: creamAlpha(0.65),
    textAlign: 'center',
    marginTop: 8,
    marginBottom: 20,
  },
  input: {
    minHeight: 52,
    maxHeight: 110,
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderRadius: 14,
    borderCurve: 'continuous',
    backgroundColor: creamAlpha(0.08),
    color: colors.cream,
    fontSize: 17,
  },
  cta: {
    marginTop: 20,
    borderRadius: 999,
    paddingVertical: 14,
    alignItems: 'center',
  },
  ctaLabel: {
    fontSize: 17,
    fontWeight: '600',
    color: 'white',
  },
});

// Step chrome — the nav row from modeStepChrome: back chevron (or ✕ at the
// root) on the left, ✕ on the right for non-root steps, inline title.
export function StepChrome({
  isRoot,
  title,
  onBack,
  onClose,
}: {
  isRoot: boolean;
  title?: string;
  onBack: () => void;
  onClose: () => void;
}) {
  return (
    <View style={chromeStyles.bar}>
      <Pressable onPress={isRoot ? onClose : onBack} hitSlop={10} style={chromeStyles.button}>
        <SymbolView
          name={isRoot ? 'xmark' : 'chevron.left'}
          size={17}
          weight="semibold"
          tintColor={colors.cream}
        />
      </Pressable>
      <Text numberOfLines={1} style={chromeStyles.title}>
        {title ?? ''}
      </Text>
      {!isRoot ? (
        <Pressable onPress={onClose} hitSlop={10} style={chromeStyles.button}>
          <SymbolView name="xmark" size={17} weight="semibold" tintColor={colors.cream} />
        </Pressable>
      ) : (
        <View style={chromeStyles.button} />
      )}
    </View>
  );
}

const chromeStyles = StyleSheet.create({
  bar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    gap: 12,
  },
  button: {
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    flex: 1,
    textAlign: 'center',
    fontSize: 17,
    fontWeight: '600',
    color: colors.cream,
  },
});
