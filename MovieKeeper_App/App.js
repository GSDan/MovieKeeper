import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
//import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';

import navigationTheme from './app/navigation/navigationTheme';
import LibraryScreen from './app/screens/LibraryScreen'
import EditItemScreen from './app/screens/EditItemScreen'
import ProfileScreen from './app/screens/ProfileScreen'

// const Stack = createNativeStackNavigator();
// const StackNavigator = () => (
//   <Stack.Navigator>
//     <Stack.Screen name="Library" component={LibraryScreen} />
//     <Stack.Screen name="EditItem" component={EditItemScreen} />
//   </Stack.Navigator>
// );

const Tabs = createBottomTabNavigator();
const TabNavigator = () => (
  <Tabs.Navigator screenOptions={() => ({
    tabBarLabelStyle: {
      paddingBottom: 3
    }
  })}>
    <Tabs.Screen
      name="Library"
      component={LibraryScreen}
      options={{
        tabBarIcon: ({ color, size }) =>
          <MaterialCommunityIcons name='filmstrip-box-multiple' color={color} size={size} />
      }} />
    <Tabs.Screen
      name="Add"
      component={EditItemScreen}
      options={{
        headerShown: false,
        tabBarIcon: ({ color, size }) =>
          <MaterialCommunityIcons name='plus-circle' color={color} size={size} />
      }} />
    <Tabs.Screen
      name="Profile"
      component={ProfileScreen}
      options={{
        headerShown: false,
        tabBarIcon: ({ color, size }) =>
          <MaterialCommunityIcons name='account' color={color} size={size} />
      }} />
  </Tabs.Navigator>
);

export default function App()
{
  return (
    <NavigationContainer theme={navigationTheme}>
      <TabNavigator />
    </NavigationContainer>
  )
}