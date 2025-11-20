import { StyleSheet, TouchableOpacity, FlatList, SafeAreaView, StatusBar, Platform, View, Text, Animated } from 'react-native';
import { useMemo, useState, useEffect, useRef, useCallback } from 'react';
import { router } from 'expo-router';
import { PanGestureHandler, TapGestureHandler, State } from 'react-native-gesture-handler';
import { FontAwesome5 } from '@expo/vector-icons';
import { IconSymbol } from '@/components/ui/icon-symbol';

import { Colors, Fonts } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { getRequests, getAdditionalInfo } from '@/api/requests';
import socketClient from '@/api/socket';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function RequestsScreen() {
  const colorScheme = useColorScheme() ?? 'light';
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [data, setData] = useState<any[]>([]);

  const removeRequest = (id: string) => {
    setData(prev => prev.filter(item => item.id !== id));
  };

  useEffect(() => {
    const loadRequests = async () => {
      try {
        const requests = await getRequests();
        setData(requests);
      } catch (error) {
        console.error('Failed to load requests:', error);
        // Keep empty array if API fails
      }
    };

    loadRequests();
  }, []);

  const styles = useMemo(() => StyleSheet.create({
    safe: {
      flex: 1,
      backgroundColor: Colors[colorScheme].background,
    },
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
      color: Colors[colorScheme].text,
      fontFamily: Fonts.rounded,
      textShadowColor: colorScheme === 'dark' ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)',
      textShadowOffset: { width: 0, height: 1 },
      textShadowRadius: 2,
    },
    listContent: {
      paddingHorizontal: 18,
      paddingBottom: 160, // keep space for tab bar
    },
    card: {
      backgroundColor: colorScheme === 'dark' ? '#1F2937' : '#FFFFFF',
      borderRadius: 6,
      ...Platform.select({
        ios: {
          shadowColor: "#000",
          shadowOpacity: 0.06,
          shadowRadius: 8,
          shadowOffset: { width: 0, height: 4 },
        },
        android: {
          elevation: 2,
        },
      }),
      paddingVertical: 18,
      paddingHorizontal: 18,
      marginBottom: 16,
    },
    cardRow: {
      flexDirection: "row",
      alignItems: "center",
    },
    iconCircle: {
      width: 58,
      height: 58,
      borderRadius: 58 / 2,
      justifyContent: "center",
      alignItems: "center",
      marginRight: 18,
    },
    middle: {
      flex: 1,
      justifyContent: "center",
    },
    nameText: {
      fontSize: 18,
      fontWeight: "800",
      color: Colors[colorScheme].text,
      marginBottom: 6,
    },
    rollText: {
      color: colorScheme === 'dark' ? '#9BA1A6' : '#8C97A0',
      fontSize: 14,
      fontWeight: "600",
    },
    right: {
      width: 110,
      alignItems: "flex-end",
      justifyContent: "center",
    },
    statusText: {
      fontSize: 16,
      fontWeight: "700",
      marginBottom: 6,
    },
    dateText: {
      fontSize: 13,
      color: colorScheme === 'dark' ? '#9BA1A6' : '#9AA6AE',
      fontWeight: "600",
    },
    expandedContent: {
      marginTop: 16,
      padding: 16,
      backgroundColor: colorScheme === 'dark' ? '#374151' : '#F7FAFC',
      borderRadius: 8,
      borderTopWidth: 1,
      borderTopColor: colorScheme === 'dark' ? '#4A5568' : '#E2E8F0',
    },
    expandedText: {
      fontSize: 14,
      color: Colors[colorScheme].text,
      marginBottom: 8,
      fontWeight: "500",
    },
  }), [colorScheme]);

  const RequestItem = ({ item, onRemove }: { item: any; onRemove: (id: string) => void }) => {
    const additionalInfo = getAdditionalInfo(item.id);
    const isExpanded = expandedId === item.id;
    const slideAnim = useRef(new Animated.Value(0)).current;

    const animateOut = useCallback((direction: 'right' | 'left') => {
      const toValue = direction === 'right' ? 1 : -1;
      Animated.timing(slideAnim, {
        toValue,
        duration: 360,
        useNativeDriver: false,
      }).start(() => {
        onRemove(item.id);
      });
    }, [slideAnim, onRemove, item.id]);

    useEffect(() => {
      const setupSocket = async () => {
        try {
          const token = await AsyncStorage.getItem('authToken');
          if (token) {
            // Get current user to get role, branch, section
            const userResponse = await apiClient.getCurrentUser();
            const user = userResponse.user;
            await socketClient.connect(token, user.role, user.branch, user.section);
            socketClient.on('request:finalized', (payload: { id: string; status: string }) => {
              if (payload.id === item.id) {
                animateOut(payload.status === 'approved' ? 'right' : 'left');
              }
            });
            socketClient.on('request:deleted', (payload: { id: string }) => {
              if (payload.id === item.id) {
                onRemove(item.id);
              }
            });
          }
        } catch (error) {
          console.error('Socket setup failed:', error);
        }
      };

      setupSocket();

      return () => {
        socketClient.off('request:finalized');
        socketClient.off('request:deleted');
      };
    }, [item.id, onRemove, animateOut]);

    const onTapHandlerStateChange = (event: any) => {
      if (event.nativeEvent.state === State.END) {
        setExpandedId(isExpanded ? null : item.id);
      }
    };

    const onPanHandlerStateChange = (event: any) => {
      if (event.nativeEvent.state === State.END) {
        const { translationX } = event.nativeEvent;
        if (translationX > 50) {
          // Swipe right: Approve
          setData(prev => prev.map(d => d.id === item.id ? { ...d, status: 'Approved', statusColor: '#2DBE57', icon: 'check-circle', iconBg: '#DFF7E9', iconColor: '#2DBE57' } : d));
        } else if (translationX < -50) {
          // Swipe left: Reject
          setData(prev => prev.map(d => d.id === item.id ? { ...d, status: 'Rejected', statusColor: '#E03B3B', icon: 'times-circle', iconBg: '#FFECEC', iconColor: '#E03B3B' } : d));
        }
      }
    };

    return (
      <Animated.View style={[styles.card, {
        transform: [{
          translateX: slideAnim.interpolate({
            inputRange: [-1, 0, 1],
            outputRange: [-1000, 0, 1000],
          }),
        }],
        opacity: slideAnim.interpolate({
          inputRange: [-1, 0, 1],
          outputRange: [0, 1, 0],
        }),
      }]}>
        <PanGestureHandler onHandlerStateChange={onPanHandlerStateChange}>
          <TapGestureHandler onHandlerStateChange={onTapHandlerStateChange}>
            <View style={styles.cardRow}>
              {/* Left icon circle */}
              <View style={[styles.iconCircle, { backgroundColor: item.iconBg }]}>
                <FontAwesome5 name={item.icon} size={20} color={item.iconColor} />
              </View>

              {/* Middle text */}
              <View style={styles.middle}>
                <Text style={styles.nameText}>{item.name}</Text>
                <Text style={styles.rollText}>Roll No: {item.roll}</Text>
              </View>

              {/* Right status */}
              <View style={styles.right}>
                <Text style={[styles.statusText, { color: item.statusColor }]}>
                  {item.status}
                </Text>
                <Text style={styles.dateText}>{item.date}</Text>
              </View>
            </View>
          </TapGestureHandler>
        </PanGestureHandler>

        {isExpanded && additionalInfo && (
          <View style={styles.expandedContent}>
            <Text style={styles.expandedText}>Reason: {additionalInfo.reason}</Text>
            <Text style={styles.expandedText}>Parent&apos;s Number: {additionalInfo.parentNumber}</Text>
            <Text style={styles.expandedText}>Student&apos;s Number: {additionalInfo.studentNumber}</Text>
          </View>
        )}
      </Animated.View>
    );
  };

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle={colorScheme === 'dark' ? 'light-content' : 'dark-content'} />

      {/* Header with settings icon and title */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.cogButton} activeOpacity={0.7} onPress={() => router.push('/Settings')}>
          <IconSymbol name="gear" size={28} color={Colors[colorScheme].icon} />
        </TouchableOpacity>

        <Text style={styles.title}>Requests</Text>

        <View style={styles.cogButton} />
      </View>

      {/* List container */}
      <FlatList
        data={data}
        keyExtractor={(i) => i.id}
        renderItem={({ item }) => <RequestItem item={item} onRemove={removeRequest} />}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
      />
    </SafeAreaView>
  );
}

