import { Tabs } from 'expo-router';
//import { StyleSheet } from 'react-native';
import React from 'react';

export default function TabLayout() {

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: '#ffd33d',
        headerStyle: {
          backgroundColor: '#25292e',
        },
        headerShadowVisible: false,
        headerTintColor: '#ffa200',
        tabBarStyle: {
          backgroundColor: '#25292e',
        }
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
        }}
      />
      <Tabs.Screen
        name="deep"
        options={{
          title: 'deep',
        }}
      />
    </Tabs>
  );
}

