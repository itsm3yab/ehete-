import React from 'react';
import { FlatList, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useApp } from '../store/AppContext';
import ConfessionCard from '../components/ConfessionCard';
import { colors, typography, fontWeight } from '../store/theme';

export default function SavedScreen({ navigation }: any) {
  const { state } = useApp();
  const saved = state.confessions.filter((c) => state.savedIds.has(c.id));

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        >
          <Ionicons name="arrow-back" size={22} color={colors.textPrimary} />
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          <Text style={styles.title}>Saved</Text>
          {saved.length > 0 && (
            <Text style={styles.count}>{saved.length}</Text>
          )}
        </View>
        <View style={{ width: 22 }} />
      </View>

      {saved.length === 0 ? (
        <View style={styles.empty}>
          <View style={styles.emptyIcon}>
            <Ionicons name="bookmark-outline" size={32} color={colors.textSecondary} />
          </View>
          <Text style={styles.emptyTitle}>Nothing saved yet</Text>
          <Text style={styles.emptySub}>
            Tap the bookmark icon on any confession to save it here.
          </Text>
        </View>
      ) : (
        <FlatList
          data={saved}
          keyExtractor={(c) => c.id}
          renderItem={({ item }) => (
            <ConfessionCard
              confession={item}
              onPress={() => navigation.navigate('Detail', { confession: item })}
            />
          )}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 16 }}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
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
  headerCenter: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  title: { color: colors.textPrimary, fontWeight: fontWeight.bold, fontSize: typography.base },
  count: {
    backgroundColor: colors.bgElevated,
    color: colors.textSecondary,
    fontSize: typography.xs,
    fontWeight: fontWeight.semibold,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 99,
    overflow: 'hidden',
  },
  empty: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    paddingHorizontal: 40,
  },
  emptyIcon: {
    width: 68,
    height: 68,
    borderRadius: 34,
    backgroundColor: colors.bgElevated,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
  emptyTitle: { color: colors.textPrimary, fontWeight: fontWeight.bold, fontSize: typography.lg },
  emptySub: { color: colors.textSecondary, fontSize: typography.sm, textAlign: 'center', lineHeight: 22 },
});
