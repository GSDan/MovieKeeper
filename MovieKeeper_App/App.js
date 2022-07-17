import React, { useEffect, useState } from 'react';
import { Image, StyleSheet } from 'react-native'
import { NavigationContainer } from '@react-navigation/native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { RootSiblingParent } from 'react-native-root-siblings';

import navigationTheme from './app/navigation/navigationTheme';
import LibraryScreen from './app/screens/LibraryScreen'
import AddItemScreen from './app/screens/AddItemScreen'
import EditItemScreen from './app/screens/EditItemScreen'
import ProfileScreen from './app/screens/ProfileScreen'
import LoginScreen from './app/screens/LoginScreen';
import { useAuthChange, AuthContext } from './app/hooks/userAuthentication';
import Mk_Screen from './app/components/Mk_Screen';
import EditBoxsetScreen from './app/screens/EditBoxsetScreen';

const AddStack = createNativeStackNavigator();
const AddStackNavigator = () => (
  <AddStack.Navigator>
    <AddStack.Screen
      name="Search"
      options={{ headerShown: false }}
      component={AddItemScreen} />
    <AddStack.Screen
      name="Edit"
      component={EditItemScreen}
      options={{
        headerShown: false,
        presentation: 'modal',
        animation: 'slide_from_bottom'
      }}
    />
    <AddStack.Screen
      name="Boxset"
      component={EditBoxsetScreen}
      options={{
        headerShown: false,
        presentation: 'modal',
        animation: 'slide_from_bottom'
      }}
    />
  </AddStack.Navigator>
);

const ViewStack = createNativeStackNavigator();
const ViewStackNavigator = () => (
  <ViewStack.Navigator>
    <ViewStack.Screen
      name="List"
      component={LibraryScreen} />
    <ViewStack.Screen
      name="Edit"
      component={EditItemScreen}
      options={{
        headerShown: false,
        presentation: 'modal',
        animation: 'slide_from_bottom',
      }}
    />
  </ViewStack.Navigator>
);

const Tabs = createBottomTabNavigator();
const TabNavigator = () => (
  <Tabs.Navigator screenOptions={() => ({
    tabBarLabelStyle: {
      paddingBottom: 3
    }
  })}>
    <Tabs.Screen
      name="Library"
      component={ViewStackNavigator}
      options={{
        headerShown: false,
        tabBarIcon: ({ color, size }) =>
          <MaterialCommunityIcons name='filmstrip-box-multiple' color={color} size={size} />
      }} />
    <Tabs.Screen
      name="Add"
      component={AddStackNavigator}
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
  const [initializing, setInitializing] = useState(true);
  const [handleAuthChange, { currentUser }] = useAuthChange();
  const [shouldRefreshContent, setShouldRefreshContent] = useState(true);

  useEffect(() =>
  {
    handleAuthChange((user) =>
    {
      setInitializing(false)
    })
  }, []);

  if (initializing) return (
    <Mk_Screen style={styles.splash}>
      <Image style={styles.logo} source={require("./app/assets/adaptive-icon.png")} />
    </Mk_Screen>
  )

  if (currentUser == null)
  {
    return <LoginScreen />;
  }

  return (
    <AuthContext.Provider value={{
      currentUser,
      shouldRefreshContent,
      setShouldRefreshContent
    }}>
      <RootSiblingParent>
        <NavigationContainer theme={navigationTheme}>
          <TabNavigator />
        </NavigationContainer>
      </RootSiblingParent>
    </AuthContext.Provider>
  )
}

const styles = StyleSheet.create({
  splash: {
    alignContent: 'center',
    justifyContent: 'center',
  },
  logo: {
    height: '22%',
    width: '100%',
    marginBottom: 20,
    resizeMode: 'contain'
  }
});