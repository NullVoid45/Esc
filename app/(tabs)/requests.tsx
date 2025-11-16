import { StyleSheet, TouchableOpacity, FlatList, SafeAreaView, StatusBar, Platform, View, Text } from 'react-native';
<<<<<<< Updated upstream
<<<<<<< Updated upstream
import { useMemo, useState } from 'react';
=======
import { useMemo, useState, useEffect } from 'react';
>>>>>>> Stashed changes
=======
import { useMemo, useState, useEffect } from 'react';
>>>>>>> Stashed changes
import { router } from 'expo-router';
import { PanGestureHandler, TapGestureHandler, State } from 'react-native-gesture-handler';
import { FontAwesome5 } from '@expo/vector-icons';
import { IconSymbol } from '@/components/ui/icon-symbol';

import { Colors, Fonts } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
<<<<<<< Updated upstream
<<<<<<< Updated upstream

const DATA = [
  {
    id: "1",
    name: "Naveen Sharma",
    roll: "20BCS1024",
    status: "Approved",
    statusColor: "#2DBE57",
    date: "Oct 24, 2023",
    icon: "check-circle",
    iconBg: "#DFF7E9",
    iconColor: "#2DBE57",
    reason: "Medical appointment",
    parentNumber: "+91 9876543210",
    studentNumber: "+91 9876543211",
  },
  {
    id: "2",
    name: "Priya Singh",
    roll: "21BME1109",
    status: "Pending",
    statusColor: "#E89500",
    date: "Oct 24, 2023",
    icon: "hourglass",
    iconBg: "#FFF4D9",
    iconColor: "#E89500",
    reason: "Family emergency",
    parentNumber: "+91 9876543212",
    studentNumber: "+91 9876543213",
  },
  {
    id: "3",
    name: "Rohan Mehta",
    roll: "19BCE1055",
    status: "Rejected",
    statusColor: "#E03B3B",
    date: "Oct 23, 2023",
    icon: "times-circle",
    iconBg: "#FFECEC",
    iconColor: "#E03B3B",
    reason: "Insufficient documentation",
    parentNumber: "+91 9876543214",
    studentNumber: "+91 9876543215",
  },
  {
    id: "4",
    name: "Anjali Gupta",
    roll: "22BEE1120",
    status: "Pending",
    statusColor: "#E89500",
    date: "Oct 23, 2023",
    icon: "hourglass",
    iconBg: "#FFF4D9",
    iconColor: "#E89500",
    reason: "Personal leave",
    parentNumber: "+91 9876543216",
    studentNumber: "+91 9876543217",
  },
  {
    id: "5",
    name: "Vikram Rathore",
    roll: "20BCS1088",
    status: "Approved",
    statusColor: "#2DBE57",
    date: "Oct 22, 2023",
    icon: "check-circle",
    iconBg: "#DFF7E9",
    iconColor: "#2DBE57",
    reason: "Sports event",
    parentNumber: "+91 9876543218",
    studentNumber: "+91 9876543219",
  },
];

// Function to collect additional info
const getAdditionalInfo = (id: string) => {
  const item = DATA.find(d => d.id === id);
  return item ? { reason: item.reason, parentNumber: item.parentNumber, studentNumber: item.studentNumber } : null;
};
=======
import { getRequests, getAdditionalInfo } from '@/api/requests';
>>>>>>> Stashed changes
=======
import { getRequests, getAdditionalInfo } from '@/api/requests';
>>>>>>> Stashed changes

export default function RequestsScreen() {
  const colorScheme = useColorScheme() ?? 'light';
  const [expandedId, setExpandedId] = useState<string | null>(null);
<<<<<<< Updated upstream
<<<<<<< Updated upstream
  const [data, setData] = useState(DATA);
=======
=======
>>>>>>> Stashed changes
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadRequests = async () => {
      try {
        const requests = await getRequests();
        setData(requests);
      } catch (error) {
        console.error('Failed to load requests:', error);
        // Keep empty array if API fails
      } finally {
        setLoading(false);
      }
    };

    loadRequests();
  }, []);
<<<<<<< Updated upstream
>>>>>>> Stashed changes
=======
>>>>>>> Stashed changes

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

  const RequestItem = ({ item }: { item: any }) => {
    const additionalInfo = getAdditionalInfo(item.id);
    const isExpanded = expandedId === item.id;

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
      <View style={styles.card}>
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
      </View>
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
        renderItem={({ item }) => <RequestItem item={item} />}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
      />
    </SafeAreaView>
  );
}

