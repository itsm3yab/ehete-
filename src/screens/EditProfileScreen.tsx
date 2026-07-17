import React, { useState } from 'react';
import {
  Alert,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as ImagePicker from 'expo-image-picker';
import { Ionicons } from '@expo/vector-icons';
import { useApp } from '../store/AppContext';
import { useColors, typography, fontWeight, radius, ColorPalette } from '../store/theme';
import { useThemedStyles } from '../store/useThemedStyles';
import { SettingsHeader } from '../components/SettingsUI';
import { hapticSelect } from '../utils/haptics';
import { goToSignIn } from '../navigation/navigationRef';

export default function EditProfileScreen({ navigation }: any) {
  const styles = useThemedStyles(makeEditStyles);
  const colors = useColors();
  const { state, dispatch } = useApp();
  const isGuest = !state.isLoggedIn;

  const [name, setName] = useState(state.username || '');
  const [avatarUri, setAvatarUri] = useState<string | null>(state.avatarUri);

  const initial = (name.trim() || 'U').charAt(0).toUpperCase();

  const pickPhoto = async () => {
    hapticSelect();
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.85,
    });
    if (!result.canceled && result.assets[0]?.uri) {
      setAvatarUri(result.assets[0].uri);
    }
  };

  const removePhoto = () => {
    hapticSelect();
    setAvatarUri(null);
  };

  const save = () => {
    const trimmed = name.trim();
    if (!trimmed) {
      Alert.alert('Name required', 'Please enter a display name.');
      return;
    }
    if (trimmed.length < 2) {
      Alert.alert('Too short', 'Name should be at least 2 characters.');
      return;
    }
    if (trimmed.length > 24) {
      Alert.alert('Too long', 'Name should be 24 characters or fewer.');
      return;
    }
    hapticSelect();
    dispatch({
      type: 'UPDATE_PROFILE',
      payload: { username: trimmed, avatarUri },
    });
    navigation.goBack();
  };

  if (isGuest) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <SettingsHeader title="Edit profile" onBack={() => navigation.goBack()} />
        <View style={styles.guestBox}>
          <Text style={styles.guestTitle}>Sign in to edit your profile</Text>
          <Text style={styles.guestSub}>
            Change your name and photo after you sign in.
          </Text>
          <TouchableOpacity
            style={styles.saveBtn}
            onPress={() => goToSignIn()}
            accessibilityRole="button"
          >
            <Text style={styles.saveText}>Sign In</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <SettingsHeader title="Edit profile" onBack={() => navigation.goBack()} />
      <ScrollView
        contentContainerStyle={styles.scroll}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.avatarBlock}>
          <TouchableOpacity
            onPress={pickPhoto}
            activeOpacity={0.85}
            accessibilityRole="button"
            accessibilityLabel="Change profile photo"
            style={styles.avatarTap}
          >
            {avatarUri ? (
              <Image source={{ uri: avatarUri }} style={styles.avatarImg} />
            ) : (
              <View style={styles.avatarFallback}>
                <Text style={styles.avatarLetter}>{initial}</Text>
              </View>
            )}
            <View style={styles.cameraBadge}>
              <Ionicons name="camera" size={14} color="#fff" />
            </View>
          </TouchableOpacity>
          <View style={styles.photoActions}>
            <TouchableOpacity onPress={pickPhoto} accessibilityRole="button">
              <Text style={styles.photoAction}>Change photo</Text>
            </TouchableOpacity>
            {!!avatarUri && (
              <>
                <Text style={styles.photoDot}>·</Text>
                <TouchableOpacity onPress={removePhoto} accessibilityRole="button">
                  <Text style={[styles.photoAction, { color: colors.danger }]}>Remove</Text>
                </TouchableOpacity>
              </>
            )}
          </View>
        </View>

        <Text style={styles.label}>Display name</Text>
        <TextInput
          style={styles.input}
          value={name}
          onChangeText={setName}
          placeholder="Your name"
          placeholderTextColor={colors.textMeta}
          maxLength={24}
          autoCapitalize="words"
          autoCorrect={false}
          returnKeyType="done"
        />
        <Text style={styles.hint}>This is how sisters see you across the app.</Text>

        <TouchableOpacity
          style={styles.saveBtn}
          onPress={save}
          accessibilityRole="button"
          accessibilityLabel="Save profile"
        >
          <Text style={styles.saveText}>Save</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

function makeEditStyles(colors: ColorPalette) {
  return StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.bg,
    },
    scroll: {
      paddingHorizontal: 20,
      paddingBottom: 40,
      paddingTop: 8,
    },
    guestBox: {
      paddingHorizontal: 24,
      paddingTop: 32,
      gap: 10,
    },
    guestTitle: {
      color: colors.textPrimary,
      fontSize: typography.lg,
      fontWeight: fontWeight.bold,
    },
    guestSub: {
      color: colors.textSecondary,
      fontSize: typography.sm,
      lineHeight: 20,
      marginBottom: 12,
    },
    avatarBlock: {
      alignItems: 'center',
      gap: 12,
      marginBottom: 28,
      marginTop: 8,
    },
    avatarTap: {
      position: 'relative',
    },
    avatarImg: {
      width: 96,
      height: 96,
      borderRadius: 48,
    },
    avatarFallback: {
      width: 96,
      height: 96,
      borderRadius: 48,
      backgroundColor: colors.accent,
      alignItems: 'center',
      justifyContent: 'center',
    },
    avatarLetter: {
      color: '#fff',
      fontSize: 36,
      fontWeight: fontWeight.extrabold,
    },
    cameraBadge: {
      position: 'absolute',
      right: 2,
      bottom: 2,
      width: 28,
      height: 28,
      borderRadius: 14,
      backgroundColor: colors.accent,
      alignItems: 'center',
      justifyContent: 'center',
      borderWidth: 2,
      borderColor: colors.bg,
    },
    photoActions: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
    },
    photoAction: {
      color: colors.accent,
      fontWeight: fontWeight.semibold,
      fontSize: typography.sm,
    },
    photoDot: {
      color: colors.textMeta,
    },
    label: {
      color: colors.textSecondary,
      fontSize: typography.sm,
      fontWeight: fontWeight.semibold,
      marginBottom: 8,
    },
    input: {
      backgroundColor: colors.bgElevated,
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: colors.border,
      borderRadius: radius.md,
      paddingHorizontal: 14,
      paddingVertical: 14,
      color: colors.textPrimary,
      fontSize: typography.md,
      fontWeight: fontWeight.medium,
    },
    hint: {
      color: colors.textMeta,
      fontSize: 12,
      marginTop: 8,
      marginBottom: 28,
    },
    saveBtn: {
      backgroundColor: colors.accent,
      borderRadius: radius.full,
      paddingVertical: 14,
      alignItems: 'center',
    },
    saveText: {
      color: '#fff',
      fontWeight: fontWeight.bold,
      fontSize: typography.md,
    },
  });
}
