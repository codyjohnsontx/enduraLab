import { cva, type VariantProps } from "class-variance-authority";
import { PropsWithChildren, useEffect, useRef } from "react";
import {
  Animated,
  Easing,
  Pressable,
  Text,
  TextInput,
  View,
  type StyleProp,
  type TextInputProps,
  type TextStyle,
  type ViewStyle,
} from "react-native";

import { sharedColors } from "@/lib/colors";
import { cn } from "@/lib/utils";
import { ReadinessLevel } from "@/types/domain";

const buttonVariants = cva("items-center justify-center rounded-md py-[15px]", {
  variants: {
    variant: {
      primary: "bg-primary",
      secondary: "border border-line bg-canvas",
    },
    disabled: {
      true: "opacity-55",
      false: "",
    },
  },
  defaultVariants: {
    variant: "primary",
    disabled: false,
  },
});

const buttonLabelVariants = cva("text-base font-bold", {
  variants: {
    variant: {
      primary: "text-white",
      secondary: "text-text",
    },
  },
  defaultVariants: {
    variant: "primary",
  },
});

const readinessVariants = cva("self-start rounded-pill px-[10px] py-[7px]", {
  variants: {
    level: {
      green: "bg-success",
      yellow: "bg-warning",
      red: "bg-danger",
    },
  },
});

export function Screen({
  children,
  className,
  style,
}: PropsWithChildren<{ className?: string; style?: StyleProp<ViewStyle> }>) {
  return (
    <View className={cn("flex-1 bg-background", className)} style={style}>
      {children}
    </View>
  );
}

export function Card({
  children,
  className,
  style,
}: PropsWithChildren<{ className?: string; style?: StyleProp<ViewStyle> }>) {
  return (
    <View
      className={cn("rounded-md border border-line bg-canvas p-md shadow-card", className)}
      style={style}
    >
      {children}
    </View>
  );
}

export function FadeInView({
  children,
  delay = 0,
  style,
}: PropsWithChildren<{ delay?: number; style?: StyleProp<ViewStyle> }>) {
  const opacity = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(16)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(opacity, {
        toValue: 1,
        duration: 420,
        delay,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
      Animated.timing(translateY, {
        toValue: 0,
        duration: 420,
        delay,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
    ]).start();
  }, [delay, opacity, translateY]);

  return (
    <Animated.View style={[style, { opacity, transform: [{ translateY }] }]}>
      {children}
    </Animated.View>
  );
}

export function SectionTitle({
  eyebrow,
  title,
  subtitle,
  className,
}: {
  eyebrow?: string;
  title: string;
  subtitle?: string;
  className?: string;
}) {
  return (
    <View className={cn("gap-[5px]", className)}>
      {eyebrow ? (
        <Text className="text-[11px] font-bold uppercase tracking-[1.25px] text-text-soft">
          {eyebrow}
        </Text>
      ) : null}
      <Text className="text-[32px] font-extrabold tracking-tightish text-text">{title}</Text>
      {subtitle ? <Text className="text-sm leading-[21px] text-text-muted">{subtitle}</Text> : null}
    </View>
  );
}

export function Pill({
  label,
  selected,
  onPress,
  className,
}: {
  label: string;
  selected?: boolean;
  onPress?: () => void;
  className?: string;
}) {
  return (
    <Pressable
      onPress={onPress}
      className={cn(
        "rounded-pill border border-line bg-canvas px-[14px] py-[9px]",
        selected && "border-primary bg-primary",
        className,
      )}
    >
      <Text className={cn("text-[13px] font-semibold text-text", selected && "text-white")}>
        {label}
      </Text>
    </Pressable>
  );
}

export function MetricStrip({
  label,
  value,
  helper,
  className,
}: {
  label: string;
  value: string;
  helper?: string;
  className?: string;
}) {
  return (
    <View className={cn("min-w-[148px] flex-1 gap-1 border-b border-line py-3", className)}>
      <Text className="text-[11px] font-medium uppercase tracking-[1px] text-text-soft">{label}</Text>
      <View className="gap-[2px]">
        <Text className="text-[20px] font-extrabold tracking-metric text-text">{value}</Text>
        {helper ? <Text className="text-xs text-text-muted">{helper}</Text> : null}
      </View>
    </View>
  );
}

export function ListRow({
  title,
  subtitle,
  trailing,
  className,
}: {
  title: string;
  subtitle?: string;
  trailing?: string;
  className?: string;
}) {
  return (
    <View className={cn("flex-row items-center justify-between gap-sm border-b border-line py-[13px]", className)}>
      <View className="flex-1 gap-[3px]">
        <Text className="text-[15px] font-bold text-text">{title}</Text>
        {subtitle ? <Text className="text-[13px] text-text-muted">{subtitle}</Text> : null}
      </View>
      {trailing ? <Text className="text-[13px] font-bold text-primary">{trailing}</Text> : null}
    </View>
  );
}

export function StatTile({
  label,
  value,
  helper,
  className,
}: {
  label: string;
  value: string;
  helper?: string;
  className?: string;
}) {
  return (
    <Card className={cn("min-w-[140px] flex-1 gap-1 py-3", className)}>
      <Text className="text-[11px] uppercase tracking-[1px] text-text-soft">{label}</Text>
      <Text className="text-[28px] font-extrabold tracking-tightish text-text">{value}</Text>
      {helper ? <Text className="text-xs text-text-muted">{helper}</Text> : null}
    </Card>
  );
}

export function LabelValue({
  label,
  value,
  className,
}: {
  label: string;
  value: string;
  className?: string;
}) {
  return (
    <View className={cn("gap-1", className)}>
      <Text className="text-xs font-semibold text-text-muted">{label}</Text>
      <Text className="text-base leading-[22px] text-text">{value}</Text>
    </View>
  );
}

export function Field({
  label,
  value,
  onChangeText,
  placeholder,
  keyboardType,
  multiline,
  className,
  inputClassName,
  labelClassName,
}: {
  label: string;
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
  keyboardType?: TextInputProps["keyboardType"];
  multiline?: boolean;
  className?: string;
  inputClassName?: string;
  labelClassName?: string;
}) {
  return (
    <View className={cn("gap-1.5", className)}>
      <Text className={cn("text-xs font-semibold text-text-muted", labelClassName)}>{label}</Text>
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={sharedColors.textMuted}
        keyboardType={keyboardType}
        multiline={multiline}
        className={cn(
          "rounded-md border border-line bg-canvas px-[14px] py-[14px] text-base text-text",
          multiline && "min-h-24 pt-[14px]",
          inputClassName,
        )}
        style={multiline ? ({ textAlignVertical: "top" } satisfies TextStyle) : undefined}
      />
    </View>
  );
}

type ButtonProps = {
  label: string;
  onPress: () => void;
  disabled?: boolean;
  className?: string;
};

function ButtonBase({
  label,
  onPress,
  disabled,
  variant,
  className,
}: ButtonProps & VariantProps<typeof buttonVariants>) {
  return (
    <Pressable
      disabled={disabled}
      onPress={onPress}
      className={cn(buttonVariants({ variant, disabled }), className)}
    >
      <Text className={buttonLabelVariants({ variant })}>{label}</Text>
    </Pressable>
  );
}

export function PrimaryButton(props: ButtonProps) {
  return <ButtonBase {...props} variant="primary" />;
}

export function SecondaryButton(props: ButtonProps) {
  return <ButtonBase {...props} variant="secondary" />;
}

export function ReadinessPill({ level }: { level: ReadinessLevel }) {
  return (
    <View className={readinessVariants({ level })}>
      <Text className="text-[11px] font-extrabold tracking-[0.8px] text-white">
        {level.toUpperCase()}
      </Text>
    </View>
  );
}
