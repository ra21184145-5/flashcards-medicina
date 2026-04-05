import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { useAuth } from '../context/AuthContext';
import { colors } from '../theme/colors';
import { LoginScreen } from '../screens/LoginScreen';
import { RegisterScreen } from '../screens/RegisterScreen';
import { HomeScreen } from '../screens/HomeScreen';
import { DeckDetailScreen } from '../screens/DeckDetailScreen';
import { CreateDeckScreen } from '../screens/CreateDeckScreen';
import { CreateFlashcardScreen } from '../screens/CreateFlashcardScreen';
import { StudyScreen } from '../screens/StudyScreen';
import { GroupsScreen } from '../screens/GroupsScreen';
import { CreateGroupScreen } from '../screens/CreateGroupScreen';
import { GroupDetailScreen } from '../screens/GroupDetailScreen';
import { DiscoverGroupsScreen } from '../screens/DiscoverGroupsScreen';
import { PublicDecksScreen } from '../screens/PublicDecksScreen';
import { ProfileScreen } from '../screens/ProfileScreen';
import { AIGenerateScreen } from '../screens/AIGenerateScreen';
import { SettingsScreen } from '../screens/SettingsScreen';
import { StatsScreen } from '../screens/StatsScreen';
import { RootStackParamList } from './types';

const Stack = createNativeStackNavigator<RootStackParamList>();
const Tab = createBottomTabNavigator();

function TabIcon({ label, ativo }: { label: string; ativo: boolean }) {
  return (
    <View style={styles.tabIcon}>
      <Text style={[styles.tabIconTexto, ativo && { color: colors.primary }]}>{label}</Text>
    </View>
  );
}

function TabsNavigator() {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textMuted,
        tabBarStyle: {
          borderTopColor: colors.border,
          height: 64,
          paddingBottom: 8,
          paddingTop: 6,
          backgroundColor: colors.card,
        },
        tabBarLabelStyle: { fontSize: 11, fontWeight: '600' },
      }}
    >
      <Tab.Screen
        name="Inicio"
        component={HomeScreen}
        options={{
          tabBarIcon: ({ focused }) => <TabIcon label="📚" ativo={focused} />,
        }}
      />
      <Tab.Screen
        name="Grupos"
        component={GroupsScreen}
        options={{
          tabBarIcon: ({ focused }) => <TabIcon label="👥" ativo={focused} />,
        }}
      />
      <Tab.Screen
        name="Explorar"
        component={PublicDecksScreen}
        options={{
          tabBarIcon: ({ focused }) => <TabIcon label="🌐" ativo={focused} />,
        }}
      />
      <Tab.Screen
        name="Perfil"
        component={ProfileScreen}
        options={{
          tabBarIcon: ({ focused }) => <TabIcon label="👤" ativo={focused} />,
        }}
      />
    </Tab.Navigator>
  );
}

export function AppNavigator() {
  const { user, carregando } = useAuth();

  if (carregando) {
    return (
      <View style={styles.loader}>
        <Text style={{ color: colors.textMuted }}>Carregando...</Text>
      </View>
    );
  }

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {user ? (
          <>
            <Stack.Screen name="Tabs" component={TabsNavigator} />
            <Stack.Screen name="DeckDetail" component={DeckDetailScreen} />
            <Stack.Screen name="CreateDeck" component={CreateDeckScreen} />
            <Stack.Screen name="CreateFlashcard" component={CreateFlashcardScreen} />
            <Stack.Screen
              name="Study"
              component={StudyScreen}
              options={{ animation: 'slide_from_bottom' }}
            />
            <Stack.Screen name="CreateGroup" component={CreateGroupScreen} />
            <Stack.Screen name="GroupDetail" component={GroupDetailScreen} />
            <Stack.Screen name="DiscoverGroups" component={DiscoverGroupsScreen} />
            <Stack.Screen name="AIGenerate" component={AIGenerateScreen} />
            <Stack.Screen name="Settings" component={SettingsScreen} />
            <Stack.Screen name="Stats" component={StatsScreen} />
          </>
        ) : (
          <>
            <Stack.Screen name="Login" component={LoginScreen} />
            <Stack.Screen name="Register" component={RegisterScreen} />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  tabIcon: { alignItems: 'center' },
  tabIconTexto: { fontSize: 18, color: colors.textMuted },
  loader: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.background,
  },
});
