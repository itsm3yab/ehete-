import React from 'react';
import {
  Alert,
  Linking,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { typography, fontWeight, radius, useColors, ColorPalette } from '../store/theme';
import { useThemedStyles } from '../store/useThemedStyles';

export default function HelpSupportScreen({ navigation }: any) {
  const styles = useThemedStyles(makeHelpStyles);
  const colors = useColors();
  const call988 = () => {
    Alert.alert(
      'Call 988 Lifeline?',
      'This will dial the 24/7 Suicide & Crisis Lifeline.',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Call Now', onPress: () => Linking.openURL('tel:988') },
      ]
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        >
          <Ionicons name="arrow-back" size={22} color={colors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Help & Support</Text>
        <View style={{ width: 22 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        {/* Crisis banner */}
        <View style={styles.crisisBanner}>
          <View style={styles.crisisIconWrap}>
            <Ionicons name="heart" size={22} color={colors.upvote} />
          </View>
          <View style={styles.crisisContent}>
            <Text style={styles.crisisTitle}>You're not alone, sister</Text>
            <Text style={styles.crisisText}>
              If you're struggling or feeling overwhelmed, trained counselors are available 24/7.
              Reaching out takes real strength.
            </Text>
          </View>
        </View>

        {/* Crisis Resources */}
        <SectionLabel title="Crisis Resources" />

        <ResourceCard
          iconName="call"
          iconBg="#00ba7c22"
          iconColor={colors.success}
          title="988 Suicide & Crisis Lifeline"
          description="Free, confidential support 24/7. Call or text 988."
          actionLabel="Call 988"
          actionColor={colors.success}
          onAction={call988}
        />

        <ResourceCard
          iconName="chatbubble-ellipses-outline"
          iconBg="#e11d6a22"
          iconColor={colors.accent}
          title="Crisis Text Line"
          description="Text HOME to 741741 for free crisis counseling, available 24/7."
          actionLabel="Learn More"
          onAction={() =>
            Alert.alert('Crisis Text Line', 'Text HOME to 741741 on your phone.')
          }
        />

        <ResourceCard
          iconName="search-outline"
          iconBg="#fce7f1"
          iconColor="#e11d6a"
          title="Find a Therapist"
          description="Browse licensed therapists and mental health professionals near you."
          actionLabel="Open Directory"
          onAction={() => Linking.openURL('https://www.psychologytoday.com/us/therapists')}
        />

        {/* App Support */}
        <SectionLabel title="App Support" />

        <ResourceCard
          iconName="mail-outline"
          iconBg={colors.bgElevated}
          iconColor={colors.textSecondary}
          title="Contact Us"
          description="Reach out for help with your account or to report a concern."
          actionLabel="Email"
          onAction={() =>
            Linking.openURL('mailto:support@ehete.app?subject=Support Request')
          }
        />

        <ResourceCard
          iconName="help-circle-outline"
          iconBg={colors.bgElevated}
          iconColor={colors.textSecondary}
          title="FAQ"
          description="Answers to common questions about using እህቴ."
          actionLabel="View"
          onAction={() => navigation.navigate('Faq')}
        />

        {/* Community guidelines */}
        <View style={styles.guidelinesCard}>
          <Ionicons name="shield-checkmark-outline" size={18} color={colors.accent} />
          <Text style={styles.guidelinesText}>
            እህቴ is a sisterhood built on respect. Look out for one another.
            Harmful content will be removed.
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function SectionLabel({ title }: { title: string }) {
  const styles = useThemedStyles(makeHelpStyles);
  return <Text style={styles.sectionLabel}>{title}</Text>;
}

function ResourceCard({
  iconName,
  iconBg,
  iconColor,
  title,
  description,
  actionLabel,
  actionColor,
  onAction,
}: {
  iconName: any;
  iconBg: string;
  iconColor: string;
  title: string;
  description: string;
  actionLabel: string;
  actionColor?: string;
  onAction: () => void;
}) {
  const styles = useThemedStyles(makeHelpStyles);
  const colors = useColors();
  return (
    <View style={styles.card}>
      <View style={[styles.cardIcon, { backgroundColor: iconBg }]}>
        <Ionicons name={iconName} size={22} color={iconColor} />
      </View>
      <View style={styles.cardContent}>
        <Text style={styles.cardTitle}>{title}</Text>
        <Text style={styles.cardDesc}>{description}</Text>
        <TouchableOpacity
          style={[styles.cardBtn, { borderColor: (actionColor ?? colors.border) }]}
          onPress={onAction}
        >
          <Text style={[styles.cardBtnText, { color: actionColor ?? colors.textSecondary }]}>
            {actionLabel}
          </Text>
          <Ionicons
            name="arrow-forward"
            size={13}
            color={actionColor ?? colors.textSecondary}
          />
        </TouchableOpacity>
      </View>
    </View>
  );
}



function makeHelpStyles(colors: ColorPalette) {
  return {
  container: { flex: 1, backgroundColor: colors.bg },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 0.5,
    borderBottomColor: colors.border,
  },
  headerTitle: {
    color: colors.textPrimary,
    fontWeight: fontWeight.bold,
    fontSize: typography.base,
  },
  scroll: { padding: 16, gap: 10, paddingBottom: 40 },
  crisisBanner: {
    flexDirection: 'row',
    gap: 12,
    backgroundColor: colors.upvoteDim,
    borderRadius: radius.md,
    padding: 14,
    borderWidth: 1,
    borderColor: colors.upvote + '40',
    marginBottom: 4,
  },
  crisisIconWrap: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.upvote + '25',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  crisisContent: { flex: 1, gap: 4 },
  crisisTitle: {
    color: colors.textPrimary,
    fontWeight: fontWeight.bold,
    fontSize: typography.sm,
  },
  crisisText: {
    color: colors.textSecondary,
    fontSize: typography.xs,
    lineHeight: 18,
  },
  sectionLabel: {
    color: colors.textMeta,
    fontSize: typography.xs,
    fontWeight: fontWeight.semibold,
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginTop: 4,
    marginBottom: 2,
  },
  card: {
    flexDirection: 'row',
    gap: 12,
    backgroundColor: colors.bgElevated,
    borderRadius: radius.md,
    padding: 14,
    borderWidth: 0.5,
    borderColor: colors.border,
  },
  cardIcon: {
    width: 46,
    height: 46,
    borderRadius: radius.sm,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  cardContent: { flex: 1, gap: 4 },
  cardTitle: {
    color: colors.textPrimary,
    fontWeight: fontWeight.semibold,
    fontSize: typography.sm,
  },
  cardDesc: {
    color: colors.textSecondary,
    fontSize: typography.xs,
    lineHeight: 17,
  },
  cardBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    alignSelf: 'flex-start',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: radius.full,
    borderWidth: 1,
    marginTop: 6,
  },
  cardBtnText: { fontSize: typography.xs, fontWeight: fontWeight.semibold },
  guidelinesCard: {
    flexDirection: 'row',
    gap: 10,
    alignItems: 'flex-start',
    backgroundColor: colors.accentDim,
    borderRadius: radius.md,
    padding: 13,
    borderWidth: 0.5,
    borderColor: colors.accent + '30',
    marginTop: 4,
  },
  guidelinesText: {
    color: colors.textSecondary,
    fontSize: typography.xs,
    lineHeight: 18,
    flex: 1,
  },
};
}
