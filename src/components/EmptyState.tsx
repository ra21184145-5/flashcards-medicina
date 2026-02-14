import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { colors, spacing } from '../theme/colors';

interface EmptyStateProps {
  titulo: string;
  descricao?: string;
  acao?: React.ReactNode;
  icone?: string;
}

export function EmptyState({ titulo, descricao, acao, icone = '📚' }: EmptyStateProps) {
  return (
    <View style={styles.wrapper}>
      <Text style={styles.icone}>{icone}</Text>
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
  icone: {
    fontSize: 48,
    marginBottom: spacing.md,
  },
  titulo: {
    fontSize: 17,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 6,
    textAlign: 'center',
  },
  descricao: {
    fontSize: 14,
    color: colors.textMuted,
    textAlign: 'center',
    marginBottom: spacing.md,
    lineHeight: 20,
  },
  acao: {
    width: '100%',
    maxWidth: 320,
  },
});
