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
  const [isSendingMagicLink, setIsSendingMagicLink] = useState(false);

  if (session) {
    return <Redirect href="/" />;
  }

  const handleMagicLink = async () => {
    const trimmedEmail = email.trim();

    if (!trimmedEmail) {
      setMessage("Enter your email address to receive a magic link.");
      return;
    }

    setIsSendingMagicLink(true);
    setMessage("Sending magic link...");

    try {
      const result = await requestMagicLink(trimmedEmail);

      if (result.sent) {
        setMessage("Magic link sent. Open the email on this device to finish sign-in.");
        return;
      }

      setMessage("Supabase is not connected yet. Use local preview mode for now.");
    } catch (error) {
      console.error("Magic link request failed", error);
      const errorMessage = error instanceof Error ? error.message : "Magic link request failed.";

      if (/email rate limit exceeded/i.test(errorMessage)) {
        setMessage("Too many login emails were requested. Wait a bit, then try again.");
      } else if (/security purposes|after \d+ seconds/i.test(errorMessage)) {
        setMessage("Magic link already requested. Wait about a minute, then try once more.");
      } else {
        setMessage("Magic link could not be sent. Check your Supabase setup and try again.");
      }
    } finally {
      setIsSendingMagicLink(false);
    }
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
            <PrimaryButton
              label={isSendingMagicLink ? "Sending magic link..." : "Send magic link"}
              onPress={() => void handleMagicLink()}
              disabled={isSendingMagicLink}
            />
            <SecondaryButton
              label="Use local preview mode"
              onPress={() => void handleLocalPreview()}
              disabled={isSendingMagicLink}
            />
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
