// ============================================
// PayFlux AI - App Navigator
// mobile/src/navigation/AppNavigator.js
// ============================================
// Handles auth flow routing (login/register vs main app)
// and bottom tab navigation for the main app.

import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Text, View } from 'react-native';
import { useAuth } from '../hooks/useAuth';
import { useQueue } from '../hooks/useQueue';
import { COLORS } from '../theme';

// Screens
import LoginScreen from '../screens/LoginScreen';
import RegisterScreen from '../screens/RegisterScreen';
import HomeScreen from '../screens/HomeScreen';
import PaymentScreen from '../screens/PaymentScreen';
import HistoryScreen from '../screens/HistoryScreen';
import QueueScreen from '../screens/QueueScreen';
import ProfileScreen from '../screens/ProfileScreen';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

// Default screen options for dark theme
const screenOptions = {
  headerStyle: { backgroundColor: COLORS.surface },
  headerTintColor: COLORS.textPrimary,
  headerTitleStyle: { fontWeight: '600' },
  contentStyle: { backgroundColor: COLORS.background },
};

// --- Auth Stack (Login / Register) ---
function AuthStack() {
  return (
    <Stack.Navigator screenOptions={{ ...screenOptions, headerShown: false }}>
      <Stack.Screen name="Login" component={LoginScreen} />
      <Stack.Screen name="Register" component={RegisterScreen} />
    </Stack.Navigator>
  );
}

// --- Main Tab Navigator ---
function MainTabs() {
  const { pendingCount } = useQueue();

  return (
    <Tab.Navigator
      screenOptions={{
        ...screenOptions,
        tabBarStyle: {
          backgroundColor: COLORS.surface,
          borderTopColor: COLORS.surfaceLight,
          height: 60,
          paddingBottom: 8,
        },
        tabBarActiveTintColor: COLORS.primary,
        tabBarInactiveTintColor: COLORS.textMuted,
        tabBarLabelStyle: { fontSize: 11, fontWeight: '500' },
      }}
    >
      <Tab.Screen
        name="Home"
        component={HomeScreen}
        options={{
          title: 'PayFlux AI',
          tabBarLabel: 'Home',
          tabBarIcon: ({ color }) => <TabIcon label="🏠" color={color} />,
        }}
      />
      <Tab.Screen
        name="Payment"
        component={PaymentScreen}
        options={{
          title: 'New Payment',
          tabBarLabel: 'Pay',
          tabBarIcon: ({ color }) => <TabIcon label="💳" color={color} />,
        }}
      />
      <Tab.Screen
        name="History"
        component={HistoryScreen}
        options={{
          title: 'Payment History',
          tabBarLabel: 'History',
          tabBarIcon: ({ color }) => <TabIcon label="📋" color={color} />,
        }}
      />
      <Tab.Screen
        name="Queue"
        component={QueueScreen}
        options={{
          title: 'Offline Queue',
          tabBarLabel: 'Queue',
          tabBarIcon: ({ color }) => <TabIcon label="📥" color={color} />,
          tabBarBadge: pendingCount > 0 ? pendingCount : undefined,
          tabBarBadgeStyle: { backgroundColor: COLORS.warning, fontSize: 10 },
        }}
      />
      <Tab.Screen
        name="Profile"
        component={ProfileScreen}
        options={{
          title: 'Profile',
          tabBarLabel: 'Profile',
          tabBarIcon: ({ color }) => <TabIcon label="👤" color={color} />,
        }}
      />
    </Tab.Navigator>
  );
}

// Simple emoji-based tab icon (replace with vector icons in production)
function TabIcon({ label }) {
  return <Text style={{ fontSize: 20 }}>{label}</Text>;
}

// --- Root Navigator ---
export default function AppNavigator() {
  const { isAuthenticated, isLoading } = useAuth();

  // Show loading while checking stored auth
  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: COLORS.background }}>
        <Text style={{ color: COLORS.textSecondary }}>Loading...</Text>
      </View>
    );
  }

  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      {isAuthenticated ? (
        <Stack.Screen name="Main" component={MainTabs} />
      ) : (
        <Stack.Screen name="Auth" component={AuthStack} />
      )}
    </Stack.Navigator>
  );
}
