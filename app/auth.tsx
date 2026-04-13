import { Redirect } from "expo-router";
import { useState } from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";

import {
  Card,
  FadeInView,
  Field,
  PrimaryButton,
  Screen,
  SecondaryButton,
  SectionTitle,
} from "@/components/ui";
import { colors, spacing } from "@/constants/theme";
import { useAppState } from "@/providers/app-provider";

export default function AuthScreen() {
  const { session, repositoryMode, requestMagicLink, startLocalPreview } = useAppState();
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState<string | null>(null);

  if (session) {
    return <Redirect href="/" />;
  }

  const handleMagicLink = async () => {
    const result = await requestMagicLink(email.trim());

    if (result.sent) {
      setMessage("Magic link sent. Open the email on this device to finish sign-in.");
      return;
    }

    setMessage("Supabase is not connected yet. Use local preview mode for now.");
  };

  const handleLocalPreview = async () => {
    await startLocalPreview(email.trim() || "preview@enduralab.app");
  };

  return (
    <Screen>
      <ScrollView contentContainerStyle={styles.content}>
        <FadeInView delay={40}>
          <View style={styles.hero}>
            <Text style={styles.brand}>Endura Lab</Text>
            <SectionTitle
              eyebrow="Sign in"
              title="Train with synced identity"
              subtitle="Magic link auth is scaffolded now. Until Supabase credentials are connected, local preview mode keeps the app usable."
            />
          </View>
        </FadeInView>

        <FadeInView delay={110}>
          <Card style={styles.card}>
            <Field
              label="Email"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              placeholder="you@enduralab.app"
            />
            <PrimaryButton label="Send magic link" onPress={() => void handleMagicLink()} />
            <SecondaryButton label="Use local preview mode" onPress={() => void handleLocalPreview()} />
            <View style={styles.metaWrap}>
              <Text style={styles.metaLabel}>Repository mode</Text>
              <Text style={styles.metaValue}>{repositoryMode}</Text>
            </View>
            {message ? <Text style={styles.message}>{message}</Text> : null}
          </Card>
        </FadeInView>
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: {
    padding: spacing.md,
    gap: spacing.lg,
  },
  hero: {
    gap: 8,
    paddingTop: spacing.lg,
  },
  brand: {
    color: colors.primary,
    fontSize: 14,
    fontWeight: "800",
    textTransform: "uppercase",
    letterSpacing: 1.2,
  },
  card: {
    gap: spacing.md,
  },
  metaWrap: {
    gap: 4,
    paddingTop: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: colors.line,
  },
  metaLabel: {
    color: colors.textSoft,
    fontSize: 11,
    textTransform: "uppercase",
    letterSpacing: 1,
    fontWeight: "700",
  },
  metaValue: {
    color: colors.text,
    fontSize: 15,
    fontWeight: "700",
  },
  message: {
    color: colors.textMuted,
    lineHeight: 21,
  },
});
