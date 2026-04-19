import React from 'react';
import { StyleSheet, View } from 'react-native';
import { SafeAreaView, Edge } from 'react-native-safe-area-context';
import { colors, layout } from '../theme/colors';

interface ScreenContainerProps {
  children: React.ReactNode;
  edges?: readonly Edge[];
  maxWidth?: 'reading' | 'content';
}

// Envolve telas internas com um wrapper que limita a largura do conteudo
// em telas largas (web, tablet). Evita que botoes e listas estiquem de
// borda a borda quando o app e renderizado em um navegador desktop.
export function ScreenContainer({
  children,
  edges = ['top'],
  maxWidth = 'reading',
}: ScreenContainerProps) {
  const max = maxWidth === 'reading' ? layout.maxReading : layout.maxContent;
  return (
    <SafeAreaView style={styles.safe} edges={edges}>
      <View style={[styles.wrapper, { maxWidth: max }]}>{children}</View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  wrapper: {
    flex: 1,
    width: '100%',
    alignSelf: 'center',
  },
});
