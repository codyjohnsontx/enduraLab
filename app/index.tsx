import { Redirect } from "expo-router";
import { ActivityIndicator, View } from "react-native";

import { colors } from "@/constants/theme";
import { useAppState } from "@/providers/app-provider";

export default function IndexScreen() {
  const { hydrated, onboardingCompleted } = useAppState();

  if (!hydrated) {
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

  return <Redirect href={onboardingCompleted ? "/(tabs)" : "/onboarding"} />;
}
