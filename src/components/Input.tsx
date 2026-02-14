import React from 'react';
import { StyleSheet, Text, TextInput, TextInputProps, View } from 'react-native';
import { colors, spacing } from '../theme/colors';

interface InputProps extends TextInputProps {
  label?: string;
  erro?: string;
}

export function Input({ label, erro, style, ...rest }: InputProps) {
  return (
    <View style={styles.wrapper}>
      {label ? <Text style={styles.label}>{label}</Text> : null}
      <TextInput
        placeholderTextColor={colors.textSoft}
        style={[styles.input, erro ? styles.inputErro : null, style]}
        {...rest}
      />
      {erro ? <Text style={styles.erro}>{erro}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    marginBottom: spacing.md,
  },
  label: {
    fontSize: 13,
    color: colors.textMuted,
    marginBottom: 6,
    fontWeight: '500',
  },
  input: {
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 10,
    paddingHorizontal: spacing.md,
    paddingVertical: 12,
    fontSize: 15,
    color: colors.text,
  },
  inputErro: {
    borderColor: colors.danger,
  },
  erro: {
    color: colors.danger,
    fontSize: 12,
    marginTop: 4,
  },
});
