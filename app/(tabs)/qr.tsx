import { useState } from 'react';
<<<<<<< Updated upstream
<<<<<<< Updated upstream
import { StyleSheet, View, Button, TouchableOpacity } from 'react-native';
import { CameraView, useCameraPermissions, BarcodeScanningResult } from 'expo-camera';
import { Link } from 'expo-router';
=======
import { StyleSheet, View, Button, TouchableOpacity, SafeAreaView, StatusBar, Text, Platform, Alert } from 'react-native';
import { CameraView, useCameraPermissions, BarcodeScanningResult } from 'expo-camera';
import { router } from 'expo-router';
>>>>>>> Stashed changes
=======
import { StyleSheet, View, Button, TouchableOpacity, SafeAreaView, StatusBar, Text, Platform, Alert } from 'react-native';
import { CameraView, useCameraPermissions, BarcodeScanningResult } from 'expo-camera';
import { router } from 'expo-router';
>>>>>>> Stashed changes
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Fonts, Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
<<<<<<< Updated upstream
<<<<<<< Updated upstream
=======
import apiClient from '@/api/client';
>>>>>>> Stashed changes
=======
import apiClient from '@/api/client';
>>>>>>> Stashed changes

export default function QrScreen() {
  const colorScheme = useColorScheme();
  const [permission, requestPermission] = useCameraPermissions();
  const [scanned, setScanned] = useState(false);
  const [text, setText] = useState('Not yet scanned');

  if (!permission) {
    return <View />;
  }

  if (!permission.granted) {
    return (
<<<<<<< Updated upstream
<<<<<<< Updated upstream
      <ThemedView style={styles.container}>
        <ThemedText style={{ textAlign: 'center' }}>We need your permission to show the camera</ThemedText>
        <Button onPress={requestPermission} title="grant permission" />
      </ThemedView>
    );
  }

  const handleBarCodeScanned = (event: BarcodeScanningResult) => {
    setScanned(true);
    setText(event.data);
    console.log(`Data: ${event.data}`);
  };

  return (
    <ThemedView style={styles.container}>
      <Link href="/Settings" asChild>
        <TouchableOpacity style={styles.SettingsContainer}>
          <IconSymbol name="gear" size={28} color={Colors[colorScheme ?? 'light'].text} />
        </TouchableOpacity>
      </Link>
      <ThemedView style={styles.titleContainer}>
        <ThemedText type="title" style={{ fontFamily: Fonts.rounded, fontWeight: 'bold' }}>
         QR Scanner
        </ThemedText>
      </ThemedView>
      <View style={styles.barcodebox}>
        <CameraView
          onBarcodeScanned={scanned ? undefined : handleBarCodeScanned}
          style={StyleSheet.absoluteFillObject}
        />
      </View>
      <ThemedText style={styles.maintext}>{text}</ThemedText>

      {scanned && <Button title={'Scan Again'} onPress={() => setScanned(false)} />}
    </ThemedView>
=======
=======
>>>>>>> Stashed changes
      <SafeAreaView style={[styles.safe, { backgroundColor: Colors[colorScheme ?? 'light'].background }]}>
        <StatusBar barStyle={colorScheme === 'dark' ? 'light-content' : 'dark-content'} />

        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity style={styles.cogButton} activeOpacity={0.7} onPress={() => router.push('/Settings')}>
            <IconSymbol name="gear" size={28} color={Colors[colorScheme].icon} />
          </TouchableOpacity>

        <Text style={[styles.title, { color: Colors[colorScheme ?? 'light'].text }]}>QR Scanner</Text>

          <View style={styles.cogButton} />
        </View>

        <View style={styles.permissionContainer}>
          <Text style={{ textAlign: 'center', color: Colors[colorScheme ?? 'light'].text, fontSize: 16, marginBottom: 20 }}>
            We need your permission to show the camera
          </Text>
          <Button onPress={requestPermission} title="grant permission" />
        </View>
      </SafeAreaView>
    );
  }

  const handleBarCodeScanned = async (event: BarcodeScanningResult) => {
    setScanned(true);
    setText(`Verifying: ${event.data}`);

    try {
      const result = await apiClient.verifyQrToken(event.data);

      if (result.valid) {
        setText(`✅ Valid Outpass\nStudent: ${result.request?.student || 'Unknown'}\nFrom: ${result.request?.from ? new Date(result.request.from).toLocaleDateString() : 'N/A'}\nTo: ${result.request?.to ? new Date(result.request.to).toLocaleDateString() : 'N/A'}`);
        Alert.alert('Valid Outpass', 'This QR code is valid for entry/exit.');
      } else {
        setText(`❌ Invalid: ${result.reason || 'Unknown error'}`);
        Alert.alert('Invalid QR Code', `This QR code is not valid: ${result.reason || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('QR verification error:', error);
      setText('❌ Verification failed');
      Alert.alert('Error', 'Failed to verify QR code. Please try again.');
    }
  };

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: Colors[colorScheme ?? 'light'].background }]}>
      <StatusBar barStyle={colorScheme === 'dark' ? 'light-content' : 'dark-content'} />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.cogButton} activeOpacity={0.7} onPress={() => router.push('/Settings')}>
          <IconSymbol name="gear" size={28} color={Colors[colorScheme].icon} />
        </TouchableOpacity>

        <Text style={[styles.title, { color: Colors[colorScheme ?? 'light'].text }]}>QR Scanner</Text>

        <View style={styles.cogButton} />
      </View>
      {/* Camera container */}
      <View style={styles.cameraContainer}>
        <View style={styles.barcodebox}>
          <CameraView
            onBarcodeScanned={scanned ? undefined : handleBarCodeScanned}
            style={StyleSheet.absoluteFillObject}
          />
        </View>
        <Text style={[styles.maintext, { color: Colors[colorScheme ?? 'light'].text }]}>{text}</Text>

        {scanned && <Button title={'Scan Again'} onPress={() => setScanned(false)} />}
      </View>
    </SafeAreaView>
<<<<<<< Updated upstream
>>>>>>> Stashed changes
=======
>>>>>>> Stashed changes
  );
}

const styles = StyleSheet.create({
<<<<<<< Updated upstream
<<<<<<< Updated upstream
  container: {
=======
=======
>>>>>>> Stashed changes
  safe: {
    flex: 1,
  },

  /* Header */
  header: {
    height: 120,
    paddingHorizontal: 18,
    paddingTop: 20,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  cogButton: {
    width: 36,
    height: 36,
    justifyContent: "center",
    alignItems: "center",
  },
  title: {
    flex: 1,
    textAlign: "center",
    fontSize: 32,
    fontWeight: "700",
    fontFamily: Fonts.rounded,
    textShadowColor: 'rgba(0,0,0,0.1)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },

  /* Camera container */
  cameraContainer: {
<<<<<<< Updated upstream
>>>>>>> Stashed changes
=======
>>>>>>> Stashed changes
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
<<<<<<< Updated upstream
<<<<<<< Updated upstream
  titleContainer: {
    position: 'absolute',
    top: 67,
    flexDirection: 'row',
    gap: 10,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 5,
  },
=======
>>>>>>> Stashed changes
=======
>>>>>>> Stashed changes
  barcodebox: {
    alignItems: 'center',
    justifyContent: 'center',
    height: 300,
    width: 300,
    overflow: 'hidden',
    borderRadius: 30,
  },
  maintext: {
    fontSize: 16,
    margin: 20,
  },
<<<<<<< Updated upstream
<<<<<<< Updated upstream
  SettingsContainer: {
    position: 'absolute',
    top: 70,
    left: 20,
    alignItems: 'flex-start',
    justifyContent: 'center',
    zIndex: 10,
=======
=======
>>>>>>> Stashed changes

  permissionContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
<<<<<<< Updated upstream
>>>>>>> Stashed changes
=======
>>>>>>> Stashed changes
  }
});