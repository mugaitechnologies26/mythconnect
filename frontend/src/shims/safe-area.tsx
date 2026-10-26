import React, { createContext, useContext } from 'react';
import { View } from 'react-native';

const initialInsets = { top: 0, bottom: 0, left: 0, right: 0 };
export const SafeAreaInsetsContext = createContext(initialInsets);

export const initialWindowMetrics = {
  insets: initialInsets,
  frame: { x: 0, y: 0, width: typeof window !== 'undefined' ? window.innerWidth : 1024, height: typeof window !== 'undefined' ? window.innerHeight : 768 },
};

export const SafeAreaProvider = ({ children }: any) => {
  return <SafeAreaInsetsContext.Provider value={initialInsets}>{children}</SafeAreaInsetsContext.Provider>;
};

export const SafeAreaConsumer = SafeAreaInsetsContext.Consumer;

export const useSafeAreaInsets = () => {
  return useContext(SafeAreaInsetsContext) || initialInsets;
};

export const useSafeAreaFrame = () => {
  return initialWindowMetrics.frame;
};

export const SafeAreaView = ({ style, ...props }: any) => {
  return <View style={style} {...props} />;
};

export default {
  SafeAreaProvider,
  SafeAreaConsumer,
  SafeAreaInsetsContext,
  initialWindowMetrics,
  useSafeAreaInsets,
  useSafeAreaFrame,
  SafeAreaView,
};
