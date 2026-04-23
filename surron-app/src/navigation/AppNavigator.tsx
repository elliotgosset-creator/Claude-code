import React, { useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Colors } from '../theme';
import { RideMode } from '../services/TorpProtocol';
import ConnectScreen from '../screens/ConnectScreen';
import DashboardScreen from '../screens/DashboardScreen';
import RideModesScreen from '../screens/RideModesScreen';
import PowerMapScreen from '../screens/PowerMapScreen';
import SettingsScreen from '../screens/SettingsScreen';

const Tab = createBottomTabNavigator();

const MODE_COLORS: Record<RideMode, string> = {
  [RideMode.ECO]:    Colors.modeEco,
  [RideMode.TRAIL]:  Colors.modeTrail,
  [RideMode.ENDURO]: Colors.modeEnduro,
  [RideMode.RACE]:   Colors.modeRace,
  [RideMode.CUSTOM]: Colors.modeCustom,
};

export default function AppNavigator() {
  const [connected, setConnected] = useState(false);
  const [currentMode, setCurrentMode] = useState<RideMode>(RideMode.TRAIL);

  if (!connected) {
    return <ConnectScreen onConnected={() => setConnected(true)} />;
  }

  const accentColor = MODE_COLORS[currentMode];

  return (
    <NavigationContainer>
      <Tab.Navigator
        screenOptions={{
          headerShown: false,
          tabBarStyle: {
            backgroundColor: Colors.surface,
            borderTopColor: Colors.border,
            borderTopWidth: 1,
            height: 64,
            paddingBottom: 8,
            paddingTop: 4,
          },
          tabBarActiveTintColor: accentColor,
          tabBarInactiveTintColor: Colors.textMuted,
          tabBarLabelStyle: {
            fontSize: 10,
            fontWeight: '600',
            letterSpacing: 0.5,
          },
        }}
      >
        <Tab.Screen
          name="Dashboard"
          options={{
            tabBarLabel: 'DASHBOARD',
            tabBarIcon: ({ color, size }) => (
              <MaterialCommunityIcons name="gauge-full" size={size} color={color} />
            ),
          }}
        >
          {() => (
            <DashboardScreen
              onDisconnect={() => setConnected(false)}
              currentMode={currentMode}
            />
          )}
        </Tab.Screen>

        <Tab.Screen
          name="Modes"
          options={{
            tabBarLabel: 'MODES',
            tabBarIcon: ({ color, size }) => (
              <MaterialCommunityIcons name="tune-variant" size={size} color={color} />
            ),
          }}
        >
          {() => (
            <RideModesScreen
              currentMode={currentMode}
              onModeChange={setCurrentMode}
            />
          )}
        </Tab.Screen>

        <Tab.Screen
          name="PowerMap"
          options={{
            tabBarLabel: 'CARTE',
            tabBarIcon: ({ color, size }) => (
              <MaterialCommunityIcons name="chart-bell-curve-cumulative" size={size} color={color} />
            ),
          }}
        >
          {() => <PowerMapScreen currentMode={currentMode} />}
        </Tab.Screen>

        <Tab.Screen
          name="Settings"
          options={{
            tabBarLabel: 'CONFIG',
            tabBarIcon: ({ color, size }) => (
              <MaterialCommunityIcons name="cog-outline" size={size} color={color} />
            ),
          }}
          component={SettingsScreen}
        />
      </Tab.Navigator>
    </NavigationContainer>
  );
}
