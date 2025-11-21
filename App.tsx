import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { ActivityIndicator, View } from 'react-native';

// Telas
import HomeScreen from './src/screens/Home';
import NewOrderScreen from './src/screens/NewOrder';
import LoginScreen from './src/screens/Auth';
import OrderDetailsScreen from './src/screens/OrderDetails';
import CompanyProfileScreen from './src/screens/CompanyProfile';

// Auth
import { AuthProvider, useAuth } from './src/context/AuthContext';
import ServiceCatalogScreen from './src/screens/ServiceCatalog';
import CustomersScreen from './src/screens/Customers';
import FinancialScreen from './src/screens/Financial';
import SubscriptionScreen from './src/screens/Subscription';

const Stack = createNativeStackNavigator();

// Componente que decide qual stack mostrar
const AppNavigator = () => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#003366" />
      </View>
    );
  }

  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: '#F8FAFC' },
      }}
    >
      {user ? (
        // Usuário Logado (Área Privada)
        <>
          <Stack.Screen name="Home" component={HomeScreen} />
          <Stack.Screen
            name="NewOrder"
            component={NewOrderScreen}
            options={{ presentation: 'modal', animation: 'slide_from_bottom' }}
          />
          <Stack.Screen name="OrderDetails" component={OrderDetailsScreen} />
          <Stack.Screen name="CompanyProfile" component={CompanyProfileScreen} />
          <Stack.Screen name="ServiceCatalog" component={ServiceCatalogScreen} />
          <Stack.Screen name="Customers" component={CustomersScreen} />
          <Stack.Screen name="Financial" component={FinancialScreen} />
          <Stack.Screen
            name="Subscription"
            component={SubscriptionScreen}
            options={{ presentation: 'modal', headerShown: false }} // Modal para parecer um "Popup"
          />
        </>
      ) : (
        // Usuário Deslogado (Área Pública)
        <Stack.Screen name="Login" component={LoginScreen} />
      )}
    </Stack.Navigator>
  );
};

export default function App() {
  return (
    <AuthProvider>
      <NavigationContainer>
        <AppNavigator />
      </NavigationContainer>
    </AuthProvider>
  );
}
