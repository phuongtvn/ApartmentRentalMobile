import React, { useState, useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { AuthService } from '../services/auth.service';
import { Loading } from '../components/ui';

// Auth Screens
import { LoginScreen, SignUpScreen, ForgotPasswordScreen } from '../screens/auth';

// Main Screens
import { HomeScreen } from '../screens/home';
import { BuildingDetailsScreen, AddEditBuildingScreen } from '../screens/buildings';
import { RoomDetailsScreen, AddEditRoomScreen } from '../screens/rooms';
import { ContractDetailsScreen, AddEditContractScreen } from '../screens/contracts';

const Stack = createNativeStackNavigator();

const AuthStack = () => (
  <Stack.Navigator
    screenOptions={{
      headerShown: false,
    }}
  >
    <Stack.Screen name="Login" component={LoginScreen} />
    <Stack.Screen name="SignUp" component={SignUpScreen} />
    <Stack.Screen name="ForgotPassword" component={ForgotPasswordScreen} />
  </Stack.Navigator>
);

const MainStack = () => (
  <Stack.Navigator
    screenOptions={{
      headerStyle: {
        backgroundColor: '#007AFF',
      },
      headerTintColor: '#FFFFFF',
      headerTitleStyle: {
        fontWeight: 'bold',
      },
    }}
  >
    <Stack.Screen
      name="Home"
      component={HomeScreen}
      options={{ title: 'Dashboard' }}
    />
    <Stack.Screen
      name="BuildingDetails"
      component={BuildingDetailsScreen}
      options={{ title: 'Building Details' }}
    />
    <Stack.Screen
      name="AddBuilding"
      component={AddEditBuildingScreen}
      options={{ title: 'Add Building' }}
    />
    <Stack.Screen
      name="EditBuilding"
      component={AddEditBuildingScreen}
      options={{ title: 'Edit Building' }}
    />
    <Stack.Screen
      name="RoomDetails"
      component={RoomDetailsScreen}
      options={{ title: 'Room Details' }}
    />
    <Stack.Screen
      name="AddRoom"
      component={AddEditRoomScreen}
      options={{ title: 'Add Room' }}
    />
    <Stack.Screen
      name="EditRoom"
      component={AddEditRoomScreen}
      options={{ title: 'Edit Room' }}
    />
    <Stack.Screen
      name="ContractDetails"
      component={ContractDetailsScreen}
      options={{ title: 'Contract Details' }}
    />
    <Stack.Screen
      name="AddContract"
      component={AddEditContractScreen}
      options={{ title: 'Add Contract' }}
    />
    <Stack.Screen
      name="EditContract"
      component={AddEditContractScreen}
      options={{ title: 'Edit Contract' }}
    />
  </Stack.Navigator>
);

export const AppNavigator = () => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);

  useEffect(() => {
    checkAuthState();

    const { data: subscription } = AuthService.onAuthStateChange(
      (event, session) => {
        setIsAuthenticated(!!session);
      },
    );

    return () => {
      subscription?.subscription?.unsubscribe();
    };
  }, []);

  const checkAuthState = async () => {
    const session = await AuthService.getSession();
    setIsAuthenticated(!!session);
  };

  if (isAuthenticated === null) {
    return <Loading message="Initializing..." />;
  }

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {isAuthenticated ? (
          <Stack.Screen name="Main" component={MainStack} />
        ) : (
          <Stack.Screen name="Auth" component={AuthStack} />
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
};
