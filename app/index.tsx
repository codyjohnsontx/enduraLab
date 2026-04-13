import { Redirect } from "expo-router";
import { ActivityIndicator, View } from "react-native";

import { colors } from "@/constants/theme";
import { useAppState } from "@/providers/app-provider";

export default function IndexScreen() {
  const { hydrated, authReady, session, onboardingCompleted } = useAppState();

  if (!hydrated || !authReady) {
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

  if (!session) {
    return <Redirect href="/auth" />;
  }

  return <Redirect href={onboardingCompleted ? "/(tabs)" : "/onboarding"} />;
}
