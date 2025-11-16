import { Image } from 'expo-image';
import { router } from 'expo-router';
import { useEffect } from 'react';
import { StyleSheet } from 'react-native';

import { ThemedView } from '@/components/themed-view';

export default function LoadingScreen() {
  useEffect(() => {
    setTimeout(() => {
      router.replace('/requests');
    }, 2000);
  }, []);

  return (
    <ThemedView style={styles.container}>
      <Image
        source={require('@/assets/images/Hitam-logo-whitebg.png')}
        style={styles.hitamLogo}
      />
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 20,
  },
  hitamLogo: {
    height: 500,
    width: 500,
    resizeMode: 'contain',
  },
});