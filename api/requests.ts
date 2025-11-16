import apiClient from './client';

// Mock data structure to match what the UI expects
// This preserves the exact interface the UI components use
const mockRequests = [
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

// Function to get status styling (same as original)
const getStatusStyle = (status: string) => {
  switch (status.toLowerCase()) {
    case 'approved':
      return {
        statusColor: "#2DBE57",
        icon: "check-circle",
        iconBg: "#DFF7E9",
        iconColor: "#2DBE57",
      };
    case 'rejected':
      return {
        statusColor: "#E03B3B",
        icon: "times-circle",
        iconBg: "#FFECEC",
        iconColor: "#E03B3B",
      };
    case 'pending':
    default:
      return {
        statusColor: "#E89500",
        icon: "hourglass",
        iconBg: "#FFF4D9",
        iconColor: "#E89500",
      };
  }
};

// Transform API response to UI format
const transformRequestToUI = (apiRequest: any) => {
  const statusStyle = getStatusStyle(apiRequest.status);
  return {
    id: apiRequest._id,
    name: apiRequest.student?.name || 'Unknown Student',
    roll: apiRequest.student?.roll || 'N/A',
    status: apiRequest.status.charAt(0).toUpperCase() + apiRequest.status.slice(1),
    statusColor: statusStyle.statusColor,
    date: new Date(apiRequest.createdAt).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    }),
    icon: statusStyle.icon,
    iconBg: statusStyle.iconBg,
    iconColor: statusStyle.iconColor,
    reason: apiRequest.reason,
    parentNumber: "+91 9876543210", // Placeholder - would come from user profile
    studentNumber: "+91 9876543211", // Placeholder - would come from user profile
  };
};

// API wrapper that maintains the same interface as the original hardcoded data
export const getRequests = async () => {
  try {
    // Try to fetch from API
    const apiRequests = await apiClient.getRequests();
    return apiRequests.map(transformRequestToUI);
  } catch (error) {
    console.warn('API not available, using mock data:', error);
    // Fallback to mock data if API is not available
    return mockRequests;
  }
};

// Function to collect additional info (same as original)
export const getAdditionalInfo = (id: string) => {
  // First try to get from API
  // For now, return mock data structure
  const mockItem = mockRequests.find(d => d.id === id);
  return mockItem ? {
    reason: mockItem.reason,
    parentNumber: mockItem.parentNumber,
    studentNumber: mockItem.studentNumber
  } : null;
};

// Export the mock data as fallback
export { mockRequests as DATA };