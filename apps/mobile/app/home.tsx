import { Redirect } from 'expo-router';

/**
 * Legacy route: redirect to tab-based home so bookmarks and deep links still work.
 */
export default function HomeRoute() {
  return <Redirect href="/(tabs)" />;
}
