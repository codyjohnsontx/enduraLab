import { Redirect, Tabs } from "expo-router";

import { colors } from "@/constants/theme";
import { useAppState } from "@/providers/app-provider";

export default function TabLayout() {
  const { authReady, session, onboardingCompleted } = useAppState();

  if (authReady && (!session || !onboardingCompleted)) {
    return <Redirect href={!session ? "/auth" : "/onboarding"} />;
  }

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.primaryDark,
        tabBarInactiveTintColor: colors.textMuted,
        tabBarStyle: {
          backgroundColor: colors.card,
          borderTopColor: colors.line,
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Today",
        }}
      />
      <Tabs.Screen
        name="progress"
        options={{
          title: "Progress",
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: "Profile",
        }}
      />
    </Tabs>
  );
}
