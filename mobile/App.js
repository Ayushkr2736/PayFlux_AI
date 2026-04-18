// ============================================
// PayFlux AI - Mobile App Entry Point
// mobile/App.js
// ============================================
// Wraps the app in all context providers and
// renders the navigation container.

import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { NavigationContainer } from '@react-navigation/native';
import { AuthProvider } from './src/store/AuthContext';
import { PaymentProvider } from './src/store/PaymentContext';
import { QueueProvider } from './src/store/QueueContext';
import AppNavigator from './src/navigation/AppNavigator';
import { registerRootComponent } from 'expo';

const linking = {
  prefixes: ['payflux://'],
  config: {
    screens: {
      Main: {
        screens: {
          Home: 'home',
          Payment: 'payment',
          History: 'history',
          Queue: 'queue',
          Profile: 'profile',
        },
      },
      Auth: {
        screens: {
          Login: 'login',
          Register: 'register',
        },
      },
    },
  },
};

function App() {
  return (
    <AuthProvider>
      <PaymentProvider>
        <QueueProvider>
          <NavigationContainer linking={linking}>
            <StatusBar style="light" />
            <AppNavigator />
          </NavigationContainer>
        </QueueProvider>
      </PaymentProvider>
    </AuthProvider>
  );
}

registerRootComponent(App);
