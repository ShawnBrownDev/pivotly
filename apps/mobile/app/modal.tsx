import { View, Text, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { NeonButton } from '@/components/NeonButton';
import { useAppTheme } from '@/hooks/use-app-theme';

export default function ModalScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const t = useAppTheme();

  return (
    <View style={[styles.container, { backgroundColor: t.background, paddingTop: insets.top }]}>
      <Text style={[styles.title, { color: t.text }]}>Modal</Text>
      <NeonButton
        title="Close"
        variant="primary"
        onPress={() => router.back()}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 24,
  },
});
