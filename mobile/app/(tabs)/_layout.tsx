import { Tabs } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Colors, Typography } from '@/config/theme';
import { Text, View, StyleSheet } from 'react-native';
import { useWallet } from '@/context/WalletContext';

function TabIcon({ icon, focused }: { icon: string; focused: boolean }) {
  return (
    <View style={focused ? tabStyles.activeIconWrap : undefined}>
      <Text style={{ fontSize: 22 }}>{icon}</Text>
    </View>
  );
}

export default function TabsLayout() {
  const insets = useSafeAreaInsets();
  const { isIssuer, isAdmin } = useWallet();
  const isPrivileged = isIssuer || isAdmin;

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: Colors.surface,
          borderTopWidth: 1,
          borderTopColor: Colors.outlineVariant + '30',
          height: 64 + insets.bottom,
          paddingBottom: insets.bottom,
          elevation: 8,
          shadowColor: '#000',
          shadowOpacity: 0.04,
          shadowRadius: 8,
          shadowOffset: { width: 0, height: -2 },
        },
        tabBarActiveTintColor: Colors.primaryContainer,
        tabBarInactiveTintColor: Colors.onSurfaceVariant,
        tabBarLabelStyle: {
          ...Typography.labelMd,
          marginBottom: 4,
        },
        tabBarIconStyle: { marginTop: 4 },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: isPrivileged ? 'Dashboard' : 'Home',
          tabBarIcon: ({ focused }) => <TabIcon icon={isPrivileged ? '🏛️' : '🏠'} focused={focused} />,
        }}
      />
      <Tabs.Screen
        name="credentials"
        options={{
          title: 'Credentials',
          tabBarIcon: ({ focused }) => <TabIcon icon="📜" focused={focused} />,
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          href: isPrivileged ? null : '/(tabs)/profile',
          title: 'Profile',
          tabBarIcon: ({ focused }) => <TabIcon icon="👤" focused={focused} />,
        }}
      />
    </Tabs>
  );
}

const tabStyles = StyleSheet.create({
  activeIconWrap: {
    backgroundColor: Colors.secondaryContainer,
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 2,
  },
});
