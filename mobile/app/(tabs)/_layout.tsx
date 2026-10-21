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
        tabBarStyle: { display: 'none' },
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
