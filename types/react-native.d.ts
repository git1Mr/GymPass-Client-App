// types/react-native.d.ts
//
// React Native 0.81 declares each native component as:
//   declare const ViewBase: Constructor<NativeMethods> & typeof ViewComponent;
//   class View extends ViewBase {}
//
// That `Constructor<T> & typeof X` intersection breaks TypeScript's view of
// the prototype chain — `View`'s instance type loses the `React.Component`
// members (`setState`, `forceUpdate`, `render`, `context`, `props`, `state`),
// and React 19's stricter `JSXElementConstructor<P>` then rejects `typeof View`
// with TS2786.
//
// We use interface merging (classes have both a type & value side) to add the
// missing `React.Component` instance shape back onto each affected class.
// This is type-only; runtime is unchanged.

import type * as React from "react";
import type {
  ViewProps,
  TextProps,
  ScrollViewProps,
  TextInputProps,
  TouchableOpacityProps,
  TouchableHighlightProps,
  TouchableWithoutFeedbackProps,
  ImageProps,
  ActivityIndicatorProps,
  KeyboardAvoidingViewProps,
  RefreshControlProps,
  ModalProps,
  PressableProps,
  StatusBarProps,
  SwitchProps,
  FlatListProps,
  SectionListProps,
  SafeAreaViewProps,
} from "react-native";

declare module "react-native" {
  // `Animated.View`, `Animated.Text`, etc. are typed as
  //   AnimatedComponent<typeof View> = React.FC<AnimatedProps<ComponentPropsWithRef<typeof View>>>
  // and the same RN-constructor-intersection bug above makes
  // `ComponentPropsWithRef<typeof View>` collapse to just `RefAttributes<View>`
  // — losing every real prop, including `children`. We widen the
  // `AnimatedComponent` interface to accept any props at all so JSX usage
  // of `Animated.View` / `Animated.Text` / etc. type-checks.
  namespace Animated {
    interface AnimatedComponent<T extends React.ComponentType<any>>
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      extends React.FC<any> {}
  }

  // eslint-disable-next-line @typescript-eslint/no-empty-interface
  interface View extends React.Component<ViewProps> {}
  // eslint-disable-next-line @typescript-eslint/no-empty-interface
  interface Text extends React.Component<TextProps> {}
  // eslint-disable-next-line @typescript-eslint/no-empty-interface
  interface ScrollView extends React.Component<ScrollViewProps> {}
  // eslint-disable-next-line @typescript-eslint/no-empty-interface
  interface TextInput extends React.Component<TextInputProps> {}
  // eslint-disable-next-line @typescript-eslint/no-empty-interface
  interface TouchableOpacity extends React.Component<TouchableOpacityProps> {}
  // eslint-disable-next-line @typescript-eslint/no-empty-interface
  interface TouchableHighlight extends React.Component<TouchableHighlightProps> {}
  // eslint-disable-next-line @typescript-eslint/no-empty-interface
  interface TouchableWithoutFeedback extends React.Component<TouchableWithoutFeedbackProps> {}
  // eslint-disable-next-line @typescript-eslint/no-empty-interface
  interface Image extends React.Component<ImageProps> {}
  // eslint-disable-next-line @typescript-eslint/no-empty-interface
  interface ActivityIndicator extends React.Component<ActivityIndicatorProps> {}
  // eslint-disable-next-line @typescript-eslint/no-empty-interface
  interface KeyboardAvoidingView extends React.Component<KeyboardAvoidingViewProps> {}
  // eslint-disable-next-line @typescript-eslint/no-empty-interface
  interface RefreshControl extends React.Component<RefreshControlProps> {}
  // eslint-disable-next-line @typescript-eslint/no-empty-interface
  interface Modal extends React.Component<ModalProps> {}
  // eslint-disable-next-line @typescript-eslint/no-empty-interface
  interface Pressable extends React.Component<PressableProps> {}
  // eslint-disable-next-line @typescript-eslint/no-empty-interface
  interface StatusBar extends React.Component<StatusBarProps> {}
  // eslint-disable-next-line @typescript-eslint/no-empty-interface
  interface Switch extends React.Component<SwitchProps> {}
  // eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/no-empty-interface
  interface FlatList<ItemT = any> extends React.Component<FlatListProps<ItemT>> {}
  // eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/no-empty-interface
  interface SectionList<ItemT = any, SectionT = any> extends React.Component<SectionListProps<ItemT, SectionT>> {}
  // eslint-disable-next-line @typescript-eslint/no-empty-interface
  interface SafeAreaView extends React.Component<SafeAreaViewProps> {}
}
