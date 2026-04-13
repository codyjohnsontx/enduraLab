import { Redirect, Tabs } from "expo-router";
import { ActivityIndicator, View } from "react-native";

import { colors } from "@/constants/theme";
import { useAppState } from "@/providers/app-provider";

export default function TabLayout() {
  const { authReady, session, onboardingCompleted } = useAppState();

  if (!authReady) {
    return (
      <View
        style={{
          flex: 1,
          justifyContent: "center",
          alignItems: "center",
          backgroundColor: colors.background,
        }}
      >
        <ActivityIndicator color={colors.primaryDark} size="large" />
      </View>
    );
  }

  if (!session || !onboardingCompleted) {
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
