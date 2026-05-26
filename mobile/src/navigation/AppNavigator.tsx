import React from 'react';
import { ActivityIndicator, View, StyleSheet } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { useAuth } from '../context/AuthContext';
import LoginScreen from '../screens/auth/LoginScreen';
import RegisterScreen from '../screens/auth/RegisterScreen';
import HomeScreen from '../screens/buyer/HomeScreen';
import MyReservationsScreen from '../screens/buyer/MyReservationsScreen';
import MyProductsScreen from '../screens/farmer/MyProductsScreen';
import IncomingReservationsScreen from '../screens/farmer/IncomingReservationsScreen';
import ProfileScreen from '../screens/ProfileScreen';
import type {
  RootStackParamList,
  AuthStackParamList,
  BuyerTabParamList,
  FarmerTabParamList,
} from '../types';

const RootStack = createNativeStackNavigator<RootStackParamList>();
const AuthStack = createNativeStackNavigator<AuthStackParamList>();
const BuyerTab = createBottomTabNavigator<BuyerTabParamList>();
const FarmerTab = createBottomTabNavigator<FarmerTabParamList>();

function AuthNavigator() {
  return (
    <AuthStack.Navigator screenOptions={{ headerShown: false }}>
      <AuthStack.Screen name="Login" component={LoginScreen} />
      <AuthStack.Screen
        name="Register"
        component={RegisterScreen}
        options={{ headerShown: true, headerTitle: '', headerBackTitle: 'Volver' }}
      />
    </AuthStack.Navigator>
  );
}

function BuyerNavigator() {
  return (
    <BuyerTab.Navigator
      screenOptions={{
        tabBarActiveTintColor: '#2D6A4F',
        tabBarInactiveTintColor: '#999',
        tabBarStyle: { backgroundColor: '#fff', borderTopColor: '#E0E0E0' },
        headerStyle: { backgroundColor: '#2D6A4F' },
        headerTintColor: '#fff',
      }}
    >
      <BuyerTab.Screen
        name="Home"
        component={HomeScreen}
        options={{ title: 'Inicio', tabBarLabel: 'Inicio' }}
      />
      <BuyerTab.Screen
        name="MyReservations"
        component={MyReservationsScreen}
        options={{ title: 'Mis reservas', tabBarLabel: 'Reservas' }}
      />
      <BuyerTab.Screen
        name="Profile"
        component={ProfileScreen}
        options={{ title: 'Perfil', tabBarLabel: 'Perfil' }}
      />
    </BuyerTab.Navigator>
  );
}

function FarmerNavigator() {
  return (
    <FarmerTab.Navigator
      screenOptions={{
        tabBarActiveTintColor: '#2D6A4F',
        tabBarInactiveTintColor: '#999',
        tabBarStyle: { backgroundColor: '#fff', borderTopColor: '#E0E0E0' },
        headerStyle: { backgroundColor: '#2D6A4F' },
        headerTintColor: '#fff',
      }}
    >
      <FarmerTab.Screen
        name="MyProducts"
        component={MyProductsScreen}
        options={{ title: 'Mis productos', tabBarLabel: 'Productos' }}
      />
      <FarmerTab.Screen
        name="IncomingReservations"
        component={IncomingReservationsScreen}
        options={{ title: 'Reservas entrantes', tabBarLabel: 'Reservas' }}
      />
      <FarmerTab.Screen
        name="Profile"
        component={ProfileScreen}
        options={{ title: 'Perfil', tabBarLabel: 'Perfil' }}
      />
    </FarmerTab.Navigator>
  );
}

export default function AppNavigator() {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator size="large" color="#2D6A4F" />
      </View>
    );
  }

  return (
    <NavigationContainer>
      <RootStack.Navigator screenOptions={{ headerShown: false }}>
        {!user ? (
          <RootStack.Screen name="Auth" component={AuthNavigator} />
        ) : user.role === 'agricultor' ? (
          <RootStack.Screen name="FarmerTabs" component={FarmerNavigator} />
        ) : (
          <RootStack.Screen name="BuyerTabs" component={BuyerNavigator} />
        )}
      </RootStack.Navigator>
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  loading: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F8FAF9',
  },
});
