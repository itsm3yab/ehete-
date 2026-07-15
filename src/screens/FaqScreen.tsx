import React, { useState } from 'react';
import {
  LayoutAnimation,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  UIManager,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useColors, typography, fontWeight, radius, ColorPalette } from '../store/theme';
import { useThemedStyles } from '../store/useThemedStyles';
import { SettingsHeader } from '../components/SettingsUI';

if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

const FAQS: { q: string; a: string }[] = [
  {
    q: 'Is etete anonymous?',
    a: 'Yes. Confessions are posted under an anonymous identity. Your real name is never shown on posts or replies unless you choose to reveal it yourself.',
  },
  {
    q: 'Who can see my confessions?',
    a: 'Anyone using the app can read posts in the feed. Guests can browse, but signing in is required to open posts, vote, reply, or save.',
  },
  {
    q: 'How do I delete a confession?',
    a: 'Open the side menu → My Confessions, then use the delete control on any post you created. Deleted posts cannot be recovered.',
  },
  {
    q: 'Can I block someone?',
    a: 'Yes. Open the side menu → Privacy & Safety, then add a username to your blocked list. You can unblock them anytime from the same screen.',
  },
  {
    q: 'How do notifications work?',
    a: 'Open the side menu → Notifications and toggle replies, votes, mentions, and announcements. Your choices are saved on this device.',
  },
  {
    q: 'I’m in crisis. Where can I get help?',
    a: 'Open Help & Support for the 988 Suicide & Crisis Lifeline, Crisis Text Line, and therapist directory. If you are in immediate danger, call local emergency services.',
  },
];

export default function FaqScreen({ navigation }: any) {
  const styles = useThemedStyles(makeFaqStyles);
  const colors = useColors();
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const toggle = (i: number) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setOpenIndex((prev) => (prev === i ? null : i));
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <SettingsHeader title="FAQ" onBack={() => navigation.goBack()} />
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <Text style={styles.intro}>Common questions about using etete.</Text>
        {FAQS.map((item, i) => {
          const open = openIndex === i;
          return (
            <TouchableOpacity
              key={item.q}
              style={styles.card}
              onPress={() => toggle(i)}
              activeOpacity={0.8}
            >
              <View style={styles.row}>
                <Text style={styles.q}>{item.q}</Text>
                <Ionicons
                  name={open ? 'chevron-up' : 'chevron-down'}
                  size={18}
                  color={colors.textSecondary}
                />
              </View>
              {open && <Text style={styles.a}>{item.a}</Text>}
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </SafeAreaView>
  );
}

function makeFaqStyles(colors: ColorPalette) {
  return {
  container: { flex: 1, backgroundColor: colors.bg },
  scroll: { padding: 16, paddingBottom: 40, gap: 10 },
  intro: {
    color: colors.textSecondary,
    fontSize: typography.sm,
    marginBottom: 6,
    lineHeight: 20,
  },
  card: {
    backgroundColor: colors.bgElevated,
    borderRadius: radius.md,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.border,
    padding: 14,
    gap: 10,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  q: {
    flex: 1,
    color: colors.textPrimary,
    fontWeight: fontWeight.semibold,
    fontSize: typography.sm,
    lineHeight: 20,
  },
  a: {
    color: colors.textSecondary,
    fontSize: typography.sm,
    lineHeight: 21,
  },
  };
}
