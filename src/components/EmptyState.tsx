import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { colors, spacing } from '../theme/colors';
import { fonts } from '../theme/typography';

interface EmptyStateProps {
  titulo: string;
  descricao?: string;
  acao?: React.ReactNode;
  icone?: string;
}

export function EmptyState({ titulo, descricao, acao, icone = '📚' }: EmptyStateProps) {
  return (
    <View style={styles.wrapper}>
      <View style={styles.iconeCirculo}>
        <Text style={styles.icone}>{icone}</Text>
      </View>
      <Text style={styles.titulo}>{titulo}</Text>
      {descricao ? <Text style={styles.descricao}>{descricao}</Text> : null}
      {acao ? <View style={styles.acao}>{acao}</View> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 48,
    paddingHorizontal: spacing.lg,
  },
  iconeCirculo: {
    width: 68,
    height: 68,
    borderRadius: 34,
    backgroundColor: colors.surfaceMuted,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  icone: {
    fontSize: 30,
  },
  titulo: {
    fontFamily: fonts.display,
    fontSize: 20,
    color: colors.text,
    marginBottom: 6,
    textAlign: 'center',
    letterSpacing: -0.3,
  },
  descricao: {
    fontFamily: fonts.body,
    fontSize: 14,
    color: colors.textMuted,
    textAlign: 'center',
    marginBottom: spacing.md,
    lineHeight: 21,
    maxWidth: 340,
  },
  acao: {
    width: '100%',
    maxWidth: 320,
  },
});
