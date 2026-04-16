import { PropsWithChildren } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  type ScrollViewProps,
  type StyleProp,
  type ViewStyle,
} from "react-native";

import { spacing } from "@/constants/theme";

type KeyboardAwareScrollViewProps = PropsWithChildren<{
  contentContainerStyle?: StyleProp<ViewStyle>;
  keyboardShouldPersistTaps?: ScrollViewProps["keyboardShouldPersistTaps"];
}>;

export function KeyboardAwareScrollView({
  children,
  contentContainerStyle,
  keyboardShouldPersistTaps = "handled",
}: KeyboardAwareScrollViewProps) {
  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      keyboardVerticalOffset={Platform.OS === "ios" ? 0 : spacing.md}
      style={styles.container}
    >
      <ScrollView
        contentContainerStyle={[contentContainerStyle, styles.content]}
        contentInsetAdjustmentBehavior="automatic"
        keyboardShouldPersistTaps={keyboardShouldPersistTaps}
      >
        {children}
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    paddingBottom: spacing.xl * 3,
  },
});
