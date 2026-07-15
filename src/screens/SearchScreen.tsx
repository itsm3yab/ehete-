import React, { useMemo, useRef, useState } from 'react';
import {
  FlatList,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useApp } from '../store/AppContext';
import ConfessionCard from '../components/ConfessionCard';
import { colors, typography, fontWeight, radius } from '../store/theme';
import { getCategoryTheme } from '../components/utils';
import { CATEGORIES } from '../types';

export default function SearchScreen({ navigation }: any) {
  const { state, dispatch } = useApp();
  const [query, setQuery] = useState('');
  const inputRef = useRef<TextInput>(null);

  const results = useMemo(() => {
    if (!query.trim()) return [];
    const q = query.toLowerCase();
    return state.confessions
      .filter(
        (c) =>
          c.title.toLowerCase().includes(q) ||
          c.text.toLowerCase().includes(q) ||
          c.category.toLowerCase().includes(q)
      )
      .sort((a, b) => b.timestamp - a.timestamp);
  }, [query, state.confessions]);

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Search bar */}
      <View style={styles.searchRow}>
        <View style={styles.searchBar}>
          <Ionicons name="search" size={16} color={colors.textSecondary} />
          <TextInput
            ref={inputRef}
            style={styles.searchInput}
            placeholder="Search confessions..."
            placeholderTextColor={colors.textMeta}
            value={query}
            onChangeText={setQuery}
            autoFocus
            returnKeyType="search"
            autoCapitalize="none"
            autoCorrect={false}
          />
          {query.length > 0 && (
            <TouchableOpacity
              onPress={() => { setQuery(''); inputRef.current?.focus(); }}
              hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}
            >
              <Ionicons name="close-circle" size={16} color={colors.textMeta} />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {query.trim().length === 0 ? (
        <View style={styles.browseContainer}>
          {/* Recent hint */}
          <Text style={styles.sectionLabel}>Browse by Category</Text>
          <View style={styles.catGrid}>
            {CATEGORIES.map((cat) => {
              const t = getCategoryTheme(cat);
              return (
                <TouchableOpacity
                  key={cat}
                  style={[styles.catCard, { backgroundColor: t.bg, borderColor: t.dot + '40' }]}
                  onPress={() => {
                    dispatch({ type: 'SET_CATEGORY', payload: cat });
                    navigation.navigate('Feed');
                  }}
                >
                  <View style={[styles.catDot, { backgroundColor: t.dot }]} />
                  <Text style={[styles.catText, { color: t.text }]}>{cat}</Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>
      ) : results.length === 0 ? (
        <View style={styles.empty}>
          <Ionicons name="search-outline" size={48} color={colors.textMeta} />
          <Text style={styles.emptyTitle}>No results</Text>
          <Text style={styles.emptyText}>Try different keywords or browse by category.</Text>
        </View>
      ) : (
        <>
          <View style={styles.resultsHeader}>
            <Text style={styles.resultsCount}>
              {results.length} result{results.length !== 1 ? 's' : ''} for "{query}"
            </Text>
          </View>
          <FlatList
            data={results}
            keyExtractor={(c) => c.id}
            renderItem={({ item }) => (
              <ConfessionCard
                confession={item}
                onPress={() => navigation.navigate('Detail', { confession: item })}
              />
            )}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
            contentContainerStyle={{ paddingBottom: 16 }}
          />
        </>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  searchRow: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderBottomWidth: 0.5,
    borderBottomColor: colors.border,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.bgInput,
    borderRadius: radius.full,
    paddingHorizontal: 13,
    paddingVertical: 10,
    gap: 8,
    borderWidth: 1,
    borderColor: colors.border,
  },
  searchInput: {
    flex: 1,
    color: colors.textPrimary,
    fontSize: typography.base,
    padding: 0,
  },
  browseContainer: { flex: 1, padding: 16 },
  sectionLabel: {
    color: colors.textSecondary,
    fontSize: typography.xs,
    fontWeight: fontWeight.semibold,
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 12,
  },
  catGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  catCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
    paddingHorizontal: 14,
    paddingVertical: 9,
    borderRadius: radius.full,
    borderWidth: 1,
  },
  catDot: { width: 7, height: 7, borderRadius: 4 },
  catText: { fontSize: typography.sm, fontWeight: fontWeight.medium },
  resultsHeader: {
    paddingHorizontal: 16,
    paddingVertical: 9,
    borderBottomWidth: 0.5,
    borderBottomColor: colors.borderSubtle,
  },
  resultsCount: { color: colors.textSecondary, fontSize: typography.xs },
  empty: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    paddingHorizontal: 40,
  },
  emptyTitle: { color: colors.textPrimary, fontWeight: fontWeight.semibold, fontSize: typography.lg },
  emptyText: { color: colors.textSecondary, fontSize: typography.sm, textAlign: 'center', lineHeight: 20 },
});
