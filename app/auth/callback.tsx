import { Redirect } from "expo-router";
import { ActivityIndicator, StyleSheet, Text, View } from "react-native";

import { Screen, SectionTitle } from "@/components/ui";
import { colors, spacing } from "@/constants/theme";
import { useAppState } from "@/providers/app-provider";

export default function AuthCallbackScreen() {
  const { session, authReady, syncError } = useAppState();

  if (authReady && session) {
    return <Redirect href="/" />;
  }

  return (
    <Screen>
      <View style={styles.container}>
        <ActivityIndicator color={colors.primaryDark} size="large" />
        <SectionTitle
          eyebrow="Auth"
          title="Finishing sign-in"
          subtitle={
            syncError
              ? "The callback reached the app, but session creation failed. Try requesting a new magic link."
              : "Endura Lab is completing your Supabase session and restoring your account."
          }
        />
        {syncError ? <Text style={styles.errorText}>{syncError}</Text> : null}
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    padding: spacing.lg,
    gap: spacing.lg,
  },
  errorText: {
    color: colors.danger,
    lineHeight: 22,
  },
});
