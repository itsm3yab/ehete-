import React from 'react';
import { FlatList, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useApp } from '../store/AppContext';
import ConfessionCard from '../components/ConfessionCard';
import { typography, fontWeight, useColors, ColorPalette } from '../store/theme';
import { useThemedStyles } from '../store/useThemedStyles';

export default function MyConfessionsScreen({ navigation }: any) {
  const styles = useThemedStyles(makeMyConfStyles);
  const colors = useColors();
  const { state } = useApp();
  const myConfessions = state.confessions
    .filter((c) => c.authorId === state.username)
    .sort((a, b) => b.timestamp - a.timestamp);

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
          <Text style={styles.title}>My Confessions</Text>
          {myConfessions.length > 0 && (
            <Text style={styles.count}>{myConfessions.length}</Text>
          )}
        </View>
        <View style={{ width: 22 }} />
      </View>

      {myConfessions.length === 0 ? (
        <View style={styles.empty}>
          <View style={styles.emptyIcon}>
            <Ionicons name="create-outline" size={32} color={colors.textSecondary} />
          </View>
          <Text style={styles.emptyTitle}>No confessions yet</Text>
          <Text style={styles.emptySub}>
            Anything you share will show up right here.
          </Text>
          <TouchableOpacity
            style={styles.postBtn}
            onPress={() => navigation.navigate('Post')}
          >
            <Ionicons name="add" size={16} color="#fff" />
            <Text style={styles.postBtnText}>Write your first confession</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={myConfessions}
          keyExtractor={(c) => c.id}
          renderItem={({ item }) => (
            <ConfessionCard
              confession={item}
              onPress={() => navigation.navigate('Detail', { confession: item })}
              showDelete
            />
          )}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 16 }}
        />
      )}
    </SafeAreaView>
  );
}



function makeMyConfStyles(colors: ColorPalette) {
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
    paddingHorizontal: 32,
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
  emptySub: { color: colors.textSecondary, fontSize: typography.sm, textAlign: 'center' },
  postBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: colors.accent,
    paddingHorizontal: 20,
    paddingVertical: 11,
    borderRadius: 99,
    marginTop: 6,
  },
  postBtnText: { color: '#fff', fontWeight: fontWeight.semibold, fontSize: typography.sm },
};
}
