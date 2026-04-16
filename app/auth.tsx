import { Redirect } from "expo-router";
import { useState } from "react";
import { Text, View } from "react-native";

import { KeyboardAwareScrollView } from "@/components/keyboard-aware-scroll-view";
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

type AuthAction = "sign-in" | "sign-up" | "magic-link" | null;

function getAuthErrorMessage(error: unknown) {
  const errorMessage = error instanceof Error ? error.message : "Authentication failed.";

  if (/invalid login credentials/i.test(errorMessage)) {
    return "Email or password is incorrect.";
  }

  if (/already registered|already exists|user already/i.test(errorMessage)) {
    return "An account already exists for this email. Try signing in instead.";
  }

  if (/password/i.test(errorMessage) && /six|6|weak|short/i.test(errorMessage)) {
    return "Password must be at least 6 characters.";
  }

  if (/email rate limit exceeded/i.test(errorMessage)) {
    return "Too many login emails were requested. Wait a bit, then try again.";
  }

  if (/security purposes|after \d+ seconds/i.test(errorMessage)) {
    return "Magic link already requested. Wait about a minute, then try once more.";
  }

  return "Authentication failed. Check your details and try again.";
}

export default function AuthScreen() {
  const {
    session,
    repositoryMode,
    requestMagicLink,
    signInWithPassword,
    signUpWithPassword,
    startLocalPreview,
  } = useAppState();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [activeAction, setActiveAction] = useState<AuthAction>(null);

  if (session) {
    return <Redirect href="/" />;
  }

  const getCredentials = () => {
    const trimmedEmail = email.trim();

    if (!trimmedEmail) {
      setMessage("Enter your email address.");
      return null;
    }

    if (password.length < 6) {
      setMessage("Enter a password with at least 6 characters.");
      return null;
    }

    return { email: trimmedEmail, password };
  };

  const handlePasswordSignIn = async () => {
    const credentials = getCredentials();

    if (!credentials) {
      return;
    }

    setActiveAction("sign-in");
    setMessage("Signing in...");

    try {
      await signInWithPassword(credentials.email, credentials.password);
      setMessage("Signed in. Loading your training state...");
    } catch (error) {
      console.error("Password sign-in failed", error);
      setMessage(getAuthErrorMessage(error));
    } finally {
      setActiveAction(null);
    }
  };

  const handlePasswordSignUp = async () => {
    const credentials = getCredentials();

    if (!credentials) {
      return;
    }

    setActiveAction("sign-up");
    setMessage("Creating account...");

    try {
      const result = await signUpWithPassword(credentials.email, credentials.password);

      if (result.emailConfirmationRequired) {
        setMessage("Account created. Check your email to confirm it, then sign in with your password.");
        return;
      }

      setMessage("Account created. Loading your training setup...");
    } catch (error) {
      console.error("Password sign-up failed", error);
      setMessage(getAuthErrorMessage(error));
    } finally {
      setActiveAction(null);
    }
  };

  const handleMagicLink = async () => {
    const trimmedEmail = email.trim();

    if (!trimmedEmail) {
      setMessage("Enter your email address to receive a magic link.");
      return;
    }

    setActiveAction("magic-link");
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
      setMessage(getAuthErrorMessage(error));
    } finally {
      setActiveAction(null);
    }
  };

  const handleLocalPreview = async () => {
    await startLocalPreview(email.trim() || "preview@enduralab.app");
  };

  return (
    <Screen>
      <KeyboardAwareScrollView contentContainerStyle={{ padding: 16, gap: 24 }}>
        <FadeInView delay={40}>
          <View className="gap-2 pt-6">
            <Text className="text-[14px] font-extrabold uppercase tracking-[1.2px] text-primary">
              Endura Lab
            </Text>
            <SectionTitle
              eyebrow="Sign in"
              title="Train with synced identity"
              subtitle="Use email and password for repeat smoke tests, or keep magic link as a passwordless fallback."
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
              autoCapitalize="none"
              autoCorrect={false}
              textContentType="emailAddress"
              className="gap-2"
              labelClassName="uppercase tracking-[0.9px] text-text-soft"
            />
            <Field
              label="Password"
              value={password}
              onChangeText={setPassword}
              placeholder="At least 6 characters"
              autoCapitalize="none"
              autoCorrect={false}
              secureTextEntry
              textContentType="password"
              className="gap-2"
              labelClassName="uppercase tracking-[0.9px] text-text-soft"
            />
            <PrimaryButton
              label={activeAction === "sign-in" ? "Signing in..." : "Sign in"}
              onPress={() => void handlePasswordSignIn()}
              disabled={Boolean(activeAction)}
            />
            <SecondaryButton
              label={activeAction === "sign-up" ? "Creating account..." : "Create account"}
              onPress={() => void handlePasswordSignUp()}
              disabled={Boolean(activeAction)}
            />
            <SecondaryButton
              label={activeAction === "magic-link" ? "Sending magic link..." : "Send magic link instead"}
              onPress={() => void handleMagicLink()}
              disabled={Boolean(activeAction)}
            />
            <SecondaryButton
              label="Use local preview mode"
              onPress={() => void handleLocalPreview()}
              disabled={Boolean(activeAction)}
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
      </KeyboardAwareScrollView>
    </Screen>
  );
}
