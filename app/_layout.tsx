import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Stack } from "expo-router";
import { useState } from "react";
import { SafeAreaProvider } from "react-native-safe-area-context";

import "../global.css";

import { AppProvider } from "@/providers/app-provider";

export default function RootLayout() {
  const [queryClient] = useState(() => new QueryClient());

  return (
    <SafeAreaProvider>
      <QueryClientProvider client={queryClient}>
        <AppProvider>
          <Stack
            screenOptions={{
              headerShown: false,
            }}
          />
        </AppProvider>
      </QueryClientProvider>
    </SafeAreaProvider>
  );
}
