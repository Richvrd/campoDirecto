import React from 'react';
import { ActivityIndicator, View, StyleSheet } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../context/AuthContext';
import LoginScreen from '../screens/auth/LoginScreen';
import RegisterScreen from '../screens/auth/RegisterScreen';
import HomeScreen from '../screens/buyer/HomeScreen';
import ProductDetailScreen from '../screens/buyer/ProductDetailScreen';
import MyReservationsScreen from '../screens/buyer/MyReservationsScreen';
import MyProductsScreen from '../screens/farmer/MyProductsScreen';
import AddProductScreen from '../screens/farmer/AddProductScreen';
import IncomingReservationsScreen from '../screens/farmer/IncomingReservationsScreen';
import ProfileScreen from '../screens/ProfileScreen';
import type {
  RootStackParamList,
  AuthStackParamList,
  BuyerTabParamList,
  BuyerStackParamList,
  FarmerTabParamList,
  FarmerStackParamList,
} from '../types';

const RootStack = createNativeStackNavigator<RootStackParamList>();
const AuthStack = createNativeStackNavigator<AuthStackParamList>();
const BuyerTab = createBottomTabNavigator<BuyerTabParamList>();
const BuyerStack = createNativeStackNavigator<BuyerStackParamList>();
const FarmerTab = createBottomTabNavigator<FarmerTabParamList>();
const FarmerStack = createNativeStackNavigator<FarmerStackParamList>();

const headerStyles = {
  headerStyle: { backgroundColor: '#2D6A4F' },
  headerTintColor: '#fff',
} as const;

const tabScreenOptions = {
  tabBarActiveTintColor: '#2D6A4F',
  tabBarInactiveTintColor: '#999',
  tabBarStyle: { backgroundColor: '#fff', borderTopColor: '#E0E0E0' },
  headerStyle: { backgroundColor: '#2D6A4F' },
  headerTintColor: '#fff',
} as const;

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

function BuyerTabNavigator() {
  return (
    <BuyerTab.Navigator screenOptions={tabScreenOptions}>
      <BuyerTab.Screen
        name="Home"
        component={HomeScreen}
        options={{
          title: 'Inicio',
          tabBarLabel: 'Inicio',
          tabBarIcon: ({ focused, color, size }) => (
            <Ionicons name={focused ? 'home' : 'home-outline'} size={size} color={color} />
          ),
        }}
      />
      <BuyerTab.Screen
        name="MyReservations"
        component={MyReservationsScreen}
        options={{
          title: 'Mis reservas',
          tabBarLabel: 'Reservas',
          tabBarIcon: ({ focused, color, size }) => (
            <Ionicons name={focused ? 'receipt' : 'receipt-outline'} size={size} color={color} />
          ),
        }}
      />
      <BuyerTab.Screen
        name="Profile"
        component={ProfileScreen}
        options={{
          title: 'Perfil',
          tabBarLabel: 'Perfil',
          tabBarIcon: ({ focused, color, size }) => (
            <Ionicons name={focused ? 'person' : 'person-outline'} size={size} color={color} />
          ),
        }}
      />
    </BuyerTab.Navigator>
  );
}

function BuyerNavigator() {
  return (
    <BuyerStack.Navigator screenOptions={{ headerShown: false }}>
      <BuyerStack.Screen name="BuyerTabs" component={BuyerTabNavigator} />
      <BuyerStack.Screen
        name="ProductDetail"
        component={ProductDetailScreen}
        options={{ headerShown: true, title: 'Detalle del producto', ...headerStyles }}
      />
    </BuyerStack.Navigator>
  );
}

function FarmerTabNavigator() {
  return (
    <FarmerTab.Navigator screenOptions={tabScreenOptions}>
      <FarmerTab.Screen
        name="MyProducts"
        component={MyProductsScreen}
        options={{
          title: 'Mis productos',
          tabBarLabel: 'Productos',
          tabBarIcon: ({ focused, color, size }) => (
            <Ionicons name={focused ? 'leaf' : 'leaf-outline'} size={size} color={color} />
          ),
        }}
      />
      <FarmerTab.Screen
        name="IncomingReservations"
        component={IncomingReservationsScreen}
        options={{
          title: 'Reservas entrantes',
          tabBarLabel: 'Reservas',
          tabBarIcon: ({ focused, color, size }) => (
            <Ionicons name={focused ? 'list' : 'list-outline'} size={size} color={color} />
          ),
        }}
      />
      <FarmerTab.Screen
        name="Profile"
        component={ProfileScreen}
        options={{
          title: 'Perfil',
          tabBarLabel: 'Perfil',
          tabBarIcon: ({ focused, color, size }) => (
            <Ionicons name={focused ? 'person' : 'person-outline'} size={size} color={color} />
          ),
        }}
      />
    </FarmerTab.Navigator>
  );
}

function FarmerNavigator() {
  return (
    <FarmerStack.Navigator screenOptions={{ headerShown: false }}>
      <FarmerStack.Screen name="FarmerTabs" component={FarmerTabNavigator} />
      <FarmerStack.Screen
        name="AddProduct"
        component={AddProductScreen}
        options={{ headerShown: true, title: 'Nuevo producto', ...headerStyles }}
      />
    </FarmerStack.Navigator>
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
          <RootStack.Screen name="FarmerApp" component={FarmerNavigator} />
        ) : (
          <RootStack.Screen name="BuyerApp" component={BuyerNavigator} />
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
