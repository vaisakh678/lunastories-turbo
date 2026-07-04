import { BlurView } from 'expo-blur';
import { SymbolView } from 'expo-symbols';
import React, { createContext, useCallback, useContext, useMemo, useRef, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, {
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { colors, creamAlpha } from '@/theme/colors';

// Ported from ToastCenter.swift: app-scoped toasts, one visible at a time,
// auto-dismiss after 3s, slide-from-top spring, swipe-up to dismiss.

export type ToastStyle = 'error' | 'warning' | 'info' | 'success';

interface Toast {
  id: number;
  title?: string;
  message: string;
  style: ToastStyle;
}

const styleIcon: Record<ToastStyle, string> = {
  error: 'exclamationmark.triangle.fill',
  warning: 'exclamationmark.circle.fill',
  info: 'info.circle.fill',
  success: 'checkmark.circle.fill',
};

const styleTint: Record<ToastStyle, string> = {
  error: colors.toastError,
  warning: colors.toastWarning,
  info: colors.accent,
  success: colors.toastSuccess,
};

interface ToastContextValue {
  show: (message: string, opts?: { title?: string; style?: ToastStyle; duration?: number }) => void;
  dismiss: () => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

export function useToast(): ToastContextValue {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be used within ToastProvider');
  return ctx;
}

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toast, setToast] = useState<Toast | null>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const counter = useRef(0);

  const dismiss = useCallback(() => {
    if (timer.current) clearTimeout(timer.current);
    timer.current = null;
    setToast(null);
  }, []);

  const show = useCallback<ToastContextValue['show']>(
    (message, opts) => {
      if (timer.current) clearTimeout(timer.current);
      counter.current += 1;
      setToast({
        id: counter.current,
        title: opts?.title,
        message,
        style: opts?.style ?? 'error',
      });
      timer.current = setTimeout(dismiss, (opts?.duration ?? 3) * 1000);
    },
    [dismiss],
  );

  const value = useMemo(() => ({ show, dismiss }), [show, dismiss]);

  return (
    <ToastContext.Provider value={value}>
      {children}
      <ToastOverlay toast={toast} onDismiss={dismiss} />
    </ToastContext.Provider>
  );
}

function ToastOverlay({ toast, onDismiss }: { toast: Toast | null; onDismiss: () => void }) {
  const insets = useSafeAreaInsets();
  if (!toast) return null;
  return (
    <View
      pointerEvents="box-none"
      style={[styles.overlay, { top: insets.top + 8 }]}
    >
      {/* key remounts the card per toast so the entrance replays */}
      <ToastCard key={toast.id} toast={toast} onDismiss={onDismiss} />
    </View>
  );
}

function ToastCard({ toast, onDismiss }: { toast: Toast; onDismiss: () => void }) {
  const tint = styleTint[toast.style];
  // Slide down into place from above the top edge (spring ≈ iOS
  // response 0.45 / damping 0.8), drag up to dismiss past 40pt.
  const translateY = useSharedValue(-140);
  translateY.value = withSpring(0, { damping: 18, stiffness: 180 });

  const pan = Gesture.Pan()
    .onChange((e) => {
      translateY.value = Math.min(0, e.translationY);
    })
    .onEnd((e) => {
      if (e.translationY < -40) {
        translateY.value = withSpring(-160, { damping: 20, stiffness: 260 });
        runOnJS(onDismiss)();
      } else {
        translateY.value = withSpring(0, { damping: 16, stiffness: 220 });
      }
    });

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
    opacity: 1 + translateY.value / 200,
  }));

  return (
    <GestureDetector gesture={pan}>
      <Animated.View style={[styles.cardShadow, animatedStyle]}>
        <BlurView intensity={40} tint="dark" style={[styles.card, { borderColor: `${tint}73` }]}>
          <SymbolView
            name={styleIcon[toast.style] as never}
            size={18}
            weight="semibold"
            tintColor={tint}
            style={styles.icon}
          />
          <View style={styles.textColumn}>
            {toast.title ? <Text style={styles.title}>{toast.title}</Text> : null}
            <Text style={[styles.message, { opacity: toast.title ? 0.75 : 1 }]}>
              {toast.message}
            </Text>
          </View>
          <Pressable onPress={onDismiss} hitSlop={8} accessibilityLabel="Dismiss">
            <SymbolView
              name="xmark"
              size={13}
              weight="bold"
              tintColor={creamAlpha(0.6)}
              style={styles.close}
            />
          </Pressable>
        </BlurView>
      </Animated.View>
    </GestureDetector>
  );
}

const styles = StyleSheet.create({
  overlay: {
    position: 'absolute',
    left: 16,
    right: 16,
    zIndex: 100,
  },
  cardShadow: {
    shadowColor: '#000',
    shadowOpacity: 0.35,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 8 },
  },
  card: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderRadius: 16,
    borderWidth: 1,
    overflow: 'hidden',
  },
  icon: {
    marginTop: 1,
  },
  textColumn: {
    flex: 1,
    gap: 6,
  },
  title: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.cream,
  },
  message: {
    fontSize: 15,
    fontWeight: '400',
    color: colors.cream,
  },
  close: {
    padding: 6,
  },
});
