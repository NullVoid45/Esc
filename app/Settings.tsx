// SettingsScreen.js
import React, { useState, useMemo } from "react";
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  TouchableOpacity,
  AccessibilityInfo,
  Appearance,
} from "react-native";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useColorScheme } from "@/hooks/use-color-scheme";
import { Colors, Fonts } from "@/constants/theme";

export default function SettingsScreen({ navigation }: { navigation?: any }) {
  const colorScheme = useColorScheme() ?? 'light';
  const [appearanceOn, setAppearanceOn] = useState(colorScheme === 'light');

  const toggleAppearance = async () => {
    // for accessibility announce
    const next = !appearanceOn;
    setAppearanceOn(next);
    const theme = next ? 'light' : 'dark';
    Appearance.setColorScheme(theme);
    try {
      await AsyncStorage.setItem('theme', theme);
    } catch (error) {
      console.error('Failed to save theme:', error);
    }
    AccessibilityInfo.announceForAccessibility(
      `Appearance ${next ? "light" : "dark"} mode enabled`
    );
  };

  const styles = useMemo(() => StyleSheet.create({
    safe: {
      flex: 1,
      backgroundColor: Colors[colorScheme].background,
    },

    /* Header */
    header: {
      height: 50,
      paddingHorizontal: 18,
      flexDirection: "row",
      alignItems: "center",
      // header looks tall and centered title like screenshot
    },
    headerLeft: {
      width: 40,
      justifyContent: "center",
      alignItems: "flex-start",
    },
    headerRight: {
      width: 40,
    },
    headerTitle: {
      flex: 1,
      textAlign: "center",
      fontSize: 32,
      fontWeight: "bold",
      fontFamily: Fonts.rounded,
      color: Colors[colorScheme].text,
    },

    /* Content */
    content: {
      paddingHorizontal: 18,
      paddingTop: 0,
      paddingBottom: 120, // give room for footer
    },

    /* Card */
    card: {
      backgroundColor: colorScheme === 'dark' ? "#202020FF" : "#F5F5F5", // dark grey for dark mode
      borderRadius: 16,
      paddingVertical: 14,
      paddingHorizontal: 14,
      elevation: 2,
    },

    row: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
    },

    rowBetween: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
    },

    left: {
      flexDirection: "row",
      alignItems: "center",
    },

    iconContainer: {
      width: 44,
      height: 44,
      borderRadius: 10,
      backgroundColor: colorScheme === 'dark' ? "#23272A" : "#E0E0E0",
      justifyContent: "center",
      alignItems: "center",
      marginRight: 12,
    },

    infoIcon: {
      width: 44,
      height: 44,
      borderRadius: 10,
      backgroundColor: colorScheme === 'dark' ? "#23272A" : "#E0E0E0",
      justifyContent: "center",
      alignItems: "center",
      marginRight: 12,
    },

    label: {
      color: Colors[colorScheme].text,
      fontSize: 17,
      fontWeight: "500",
    },

    mutedText: {
      color: Colors[colorScheme].icon,
      fontSize: 15,
    },

    divider: {
      height: 1,
      backgroundColor: colorScheme === 'dark' ? "#212529" : "#E0E0E0",
      marginVertical: 10,
      borderRadius: 1,
    },

    /* Toggle */
    toggleTouchArea: {
      padding: 6,
      justifyContent: "center",
    },
    fakeToggleBackground: {
      width: 62,
      height: 34,
      borderRadius: 20,
      backgroundColor: colorScheme === 'dark' ? "#2D3134" : "#D0D0D0",
      justifyContent: "center",
      padding: 5,
    },
    fakeToggleBackgroundOn: {
      backgroundColor: '#555555',
    },
    fakeToggleKnob: {
      width: 24,
      height: 24,
      borderRadius: 14,
      backgroundColor: colorScheme === 'dark' ? "#222629" : "#FFFFFF",
      alignSelf: "flex-start",
      justifyContent: "center",
      alignItems: "center",
    },
    fakeToggleKnobOn: {
      alignSelf: "flex-end",
      backgroundColor: "#FFFFFF",
    },

    /* Footer */
    footer: {
      alignItems: "center",
      paddingVertical: 26,
      position: "absolute",
      left: 0,
      right: 0,
      bottom: 8,
    },
    footerApp: {
      color: Colors[colorScheme].icon,
      fontSize: 16,
      marginBottom: 6,
    },
    footerYear: {
      color: Colors[colorScheme].icon,
      fontSize: 13,
    },
  }), [colorScheme]);

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle={colorScheme === 'dark' ? 'light-content' : 'dark-content'} />
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft} />

        <View style={styles.headerRight} />
      </View>

      {/* Content */}
      <View style={styles.content}>
        {/* Appearance Card */}
        <View style={styles.card}>
          <View style={styles.row}>
            <View style={styles.left}>
              <View style={styles.iconContainer}>
                <MaterialCommunityIcons
                  name="palette"
                  size={20}
                  color={Colors[colorScheme].icon}
                />
              </View>
              <Text style={styles.label}>Appearance</Text>
            </View>

            <TouchableOpacity
              activeOpacity={0.85}
              onPress={toggleAppearance}
              style={styles.toggleTouchArea}
              accessibilityRole="switch"
              accessibilityState={{ checked: appearanceOn }}
              accessibilityLabel="Toggle appearance"
            >
              <View
                style={[
                  styles.fakeToggleBackground,
                  appearanceOn && styles.fakeToggleBackgroundOn,
                ]}
              >
                <View
                  style={[
                    styles.fakeToggleKnob,
                    appearanceOn && styles.fakeToggleKnobOn,
                  ]}
                >
                  <MaterialCommunityIcons
                    name={appearanceOn ? "white-balance-sunny" : "weather-night"}
                    size={12}
                    color={appearanceOn ? "#0B1220" : "#E6EEF6"}
                  />
                </View>
              </View>
            </TouchableOpacity>
          </View>
        </View>

        {/* Version & Check for Updates Card */}
        <View style={[styles.card, { marginTop: 18 }]}>
          <View style={styles.rowBetween}>
            <View style={{ flexDirection: "row", alignItems: "center" }}>
              <View style={styles.infoIcon}>
                <Ionicons name="information-circle-outline" size={20} color={Colors[colorScheme].icon} />
              </View>
              <Text style={styles.label}>Version</Text>
            </View>

            <Text style={styles.mutedText}>1.0.0</Text>
          </View>

          <View style={styles.divider} />

          <TouchableOpacity style={styles.row} activeOpacity={0.7} accessibilityRole="button">
            <View style={{ flexDirection: "row", alignItems: "center" }}>
              <MaterialCommunityIcons name="backup-restore" size={18} color={Colors[colorScheme].icon} />
              <Text style={[styles.label, { marginLeft: 12 }]}>Check for Updates</Text>
            </View>

            <Ionicons name="chevron-forward" size={20} color={Colors[colorScheme].icon} />
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}

