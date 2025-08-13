// Centralized Street-Style Design System for StreetTalk
// Modern urban aesthetic with purple branding and clean white backgrounds

export const StreetStyles = {
  // Container styles
  screen: "flex-1 bg-light-50", // White background
  container: "flex-1 px-6 py-4",
  card: "bg-light-50 rounded-2xl p-6 mb-4 border border-light-300 shadow-sm",
  cardElevated: "bg-light-50 rounded-2xl p-6 mb-4 border border-light-300 shadow-lg",

  // Header styles
  header: "bg-light-50 pt-12 pb-4 px-6 border-b border-light-300",
  headerTitle: "text-street-2xl font-street font-bold text-light-900",
  subheader: "text-street-base font-street text-light-600",

  // Typography styles
  title: "text-street-2xl font-street font-bold text-light-900",
  subtitle: "text-street-lg font-street font-semibold text-light-700",
  body: "text-street-base font-street text-light-800",
  caption: "text-street-sm font-street text-light-500",
  label: "text-street-sm font-street font-medium text-light-600",

  // Input styles
  input: "bg-light-100 border border-light-300 rounded-xl px-4 py-4 text-street-base font-street text-light-900 focus:border-street-600 focus:bg-light-50",
  inputLabel: "text-street-sm font-street font-medium text-light-600 mb-2 ml-1",
  inputError: "border-red-400 bg-red-50",
  inputFocused: "border-street-600 bg-light-50 shadow-sm",

  // Button styles (optimized for performance)
  buttonPrimary: "bg-street-900 rounded-xl py-4 px-6 shadow-lg",
  buttonPrimaryText: "text-light-50 text-street-base font-street font-semibold text-center",
  buttonPrimaryPressed: "bg-street-800 rounded-xl py-4 px-6 shadow-md",
  
  buttonSecondary: "bg-light-200 border border-light-300 rounded-xl py-3 px-5",
  buttonSecondaryText: "text-light-700 text-street-base font-street font-medium text-center",
  buttonSecondaryPressed: "bg-light-300 border border-light-400 rounded-xl py-3 px-5",
  
  buttonGhost: "py-3 px-4",
  buttonGhostText: "text-street-600 text-street-base font-street font-medium",
  buttonGhostPressed: "py-3 px-4 bg-light-200 rounded-lg",

  // Action buttons (optimized)
  editButton: "bg-street-100 border border-street-300 px-3 py-1.5 rounded-lg",
  editButtonText: "text-street-700 text-street-sm font-street font-medium",
  editButtonPressed: "bg-street-200 border border-street-400 px-3 py-1.5 rounded-lg",
  
  deleteButton: "bg-red-100 border border-red-300 px-3 py-1.5 rounded-lg",
  deleteButtonText: "text-red-600 text-street-sm font-street font-medium",
  deleteButtonPressed: "bg-red-200 border border-red-400 px-3 py-1.5 rounded-lg",

  // Post/Content styles (removed laggy scale animation)
  postCard: "bg-light-50 rounded-2xl p-5 mb-4 border border-light-300 shadow-sm",
  postCardPressed: "bg-light-100 rounded-2xl p-5 mb-4 border border-light-400 shadow-md",
  postHeader: "flex-row justify-between items-start mb-3",
  postUsername: "text-street-600 font-street font-semibold text-street-base",
  postTimestamp: "text-light-500 text-street-sm font-street mt-1",
  postContent: "text-light-800 text-street-base font-street leading-6 mb-4",
  postFooter: "flex-row justify-between items-center pt-3 border-t border-light-300",
  postStats: "flex-row items-center space-x-4",
  postStat: "text-light-500 text-street-sm font-street",

  // Media styles
  mediaContainer: "rounded-xl overflow-hidden mb-4 bg-light-200 border border-light-300",
  mediaImage: "w-full h-64",

  // Form styles
  form: "space-y-6",
  formSection: "space-y-4",
  formGroup: "space-y-2",

  // Navigation styles
  tabBar: "bg-light-50 border-t border-light-300",
  tabButton: "py-3 px-4",
  tabButtonActive: "py-3 px-4 border-t-2 border-street-600",
  tabText: "text-light-500 text-street-sm font-street",
  tabTextActive: "text-street-600 text-street-sm font-street font-medium",

  // Utility styles
  divider: "border-t border-light-300 my-4",
  shadow: "shadow-sm",
  shadowMd: "shadow-md",
  shadowLg: "shadow-lg",

  // Status styles
  success: "bg-green-100 border border-green-300 text-green-700",
  warning: "bg-yellow-100 border border-yellow-300 text-yellow-700",
  error: "bg-red-100 border border-red-300 text-red-700",
  info: "bg-street-100 border border-street-300 text-street-700",

  // Spacing helpers
  spacing: {
    xs: "space-y-1",
    sm: "space-y-2", 
    md: "space-y-4",
    lg: "space-y-6",
    xl: "space-y-8",
  }
};

// Color palette for easy reference
export const StreetColors = {
  brand: {
    primary: "#4b0082",      // street-900
    secondary: "#9b5cff",    // street-500
    light: "#f3ecff",        // street-100
  },
  background: {
    primary: "#ffffff",      // light-50
    secondary: "#fafafa",    // light-100
    tertiary: "#f5f5f5",     // light-200
  },
  text: {
    primary: "#171717",      // light-900
    secondary: "#525252",    // light-600
    muted: "#a1a1a1",        // light-400
  },
  border: {
    light: "#e5e5e5",        // light-300
    medium: "#a1a1a1",       // light-400
  }
};
