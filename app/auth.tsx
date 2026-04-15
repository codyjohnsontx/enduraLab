import { Redirect } from "expo-router";
import { useState } from "react";
import { ScrollView, Text, View } from "react-native";

import {
  Card,
  FadeInView,
  Field,
  PrimaryButton,
  Screen,
  SecondaryButton,
  SectionTitle,
} from "@/components/ui";
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
      <ScrollView contentContainerStyle={{ padding: 16, gap: 24 }}>
        <FadeInView delay={40}>
          <View className="gap-2 pt-6">
            <Text className="text-[14px] font-extrabold uppercase tracking-[1.2px] text-primary">
              Endura Lab
            </Text>
            <SectionTitle
              eyebrow="Sign in"
              title="Train with synced identity"
              subtitle="Magic link auth now runs on the new NativeWind-based UI foundation. Supabase remains the default path, with local preview still available as a fallback."
            />
          </View>
        </FadeInView>

        <FadeInView delay={110}>
          <Card className="gap-md">
            <Field
              label="Email"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              placeholder="you@enduralab.app"
              className="gap-2"
              labelClassName="uppercase tracking-[0.9px] text-text-soft"
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
            <View className="gap-1 border-t border-line pt-sm">
              <Text className="text-[11px] font-bold uppercase tracking-[1px] text-text-soft">
                Repository mode
              </Text>
              <Text className="text-[15px] font-bold text-text">{repositoryMode}</Text>
            </View>
            {message ? <Text className="leading-[21px] text-text-muted">{message}</Text> : null}
          </Card>
        </FadeInView>
      </ScrollView>
    </Screen>
  );
}
