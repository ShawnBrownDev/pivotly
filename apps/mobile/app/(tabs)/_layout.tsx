import { Tabs, useRouter } from 'expo-router';
import { Pressable } from 'react-native';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { NAV_THEME } from '@/constants/theme';

const tabBarActiveTintColor = NAV_THEME.dark.primary;
const tabBarInactiveTintColor = NAV_THEME.dark.text;
const tabBarBackground = NAV_THEME.dark.card;
const tabBarBorder = NAV_THEME.dark.border;

export default function TabsLayout() {
  const router = useRouter();

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor,
        tabBarInactiveTintColor,
        tabBarStyle: {
          backgroundColor: tabBarBackground,
          borderTopColor: tabBarBorder,
          borderTopWidth: 1,
        },
        tabBarLabelStyle: { fontSize: 12, fontWeight: '600' },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ color, size }) => (
            <MaterialIcons name="home" size={size ?? 26} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="notifications"
        options={{
          title: 'Notifications',
          tabBarIcon: ({ color, size }) => (
            <MaterialIcons name="notifications" size={size ?? 26} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="compose"
        options={{
          title: 'Post',
          tabBarButton: (props) => {
            const { onPress, ref, ...rest } = props;
            return (
              <Pressable
                {...rest}
                onPress={() => router.navigate('/(tabs)/compose' as import('expo-router').Href)}
              />
            );
          },
          tabBarIcon: ({ color, size }) => (
            <MaterialIcons name="add-circle-outline" size={size ?? 26} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          tabBarIcon: ({ color, size }) => (
            <MaterialIcons name="person" size={size ?? 26} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="explore"
        options={{
          href: null,
        }}
      />
    </Tabs>
  );
}
