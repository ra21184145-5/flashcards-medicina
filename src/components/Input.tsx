import React, { useState } from 'react';
import { StyleSheet, Text, TextInput, TextInputProps, View } from 'react-native';
import { colors, radii, spacing } from '../theme/colors';
import { fonts } from '../theme/typography';

interface InputProps extends TextInputProps {
  label?: string;
  erro?: string;
  hint?: string;
}

export function Input({ label, erro, hint, style, onFocus, onBlur, ...rest }: InputProps) {
  const [focado, setFocado] = useState(false);

  return (
    <View style={styles.wrapper}>
      {label ? <Text style={styles.label}>{label}</Text> : null}
      <TextInput
        placeholderTextColor={colors.textSoft}
        style={[
          styles.input,
          focado ? styles.inputFocado : null,
          erro ? styles.inputErro : null,
          style,
        ]}
        onFocus={(e) => {
          setFocado(true);
          onFocus?.(e);
        }}
        onBlur={(e) => {
          setFocado(false);
          onBlur?.(e);
        }}
        {...rest}
      />
      {erro ? (
        <Text style={styles.erro}>{erro}</Text>
      ) : hint ? (
        <Text style={styles.hint}>{hint}</Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    marginBottom: spacing.md,
  },
  label: {
    fontFamily: fonts.bodyMedium,
    fontSize: 11,
    color: colors.textMuted,
    marginBottom: 8,
    letterSpacing: 1.2,
    textTransform: 'uppercase',
  },
  input: {
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radii.md,
    paddingHorizontal: spacing.md,
    paddingVertical: 14,
    fontSize: 15,
    fontFamily: fonts.body,
    color: colors.text,
  },
  inputFocado: {
    borderColor: colors.primary,
    backgroundColor: colors.backgroundElevated,
  },
  inputErro: {
    borderColor: colors.danger,
  },
  erro: {
    fontFamily: fonts.body,
    color: colors.danger,
    fontSize: 12,
    marginTop: 6,
  },
  hint: {
    fontFamily: fonts.body,
    color: colors.textMuted,
    fontSize: 12,
    marginTop: 6,
  },
});
