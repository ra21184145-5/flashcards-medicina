import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { colors } from '../theme/colors';
import { fonts } from '../theme/typography';
import { Privacy } from '../types';

interface ChipProps {
  privacidade?: Privacy;
  texto?: string;
  tom?: 'info' | 'ok' | 'aviso' | 'neutro' | 'primario';
}

const tons = {
  info: { bg: colors.primarySoft, fg: colors.primaryDeep },
  ok: { bg: colors.accentSoft, fg: '#0A8055' },
  aviso: { bg: colors.amberSoft, fg: colors.amber },
  neutro: { bg: colors.surfaceMuted, fg: colors.textMuted },
  primario: { bg: colors.primaryDeep, fg: '#FFFFFF' },
};

function rotulo(p?: Privacy): string {
  switch (p) {
    case 'privado':
      return 'Privado';
    case 'publico':
      return 'Público';
    case 'grupo':
      return 'Grupo';
    default:
      return '';
  }
}

function tomDaPrivacidade(p?: Privacy): keyof typeof tons {
  switch (p) {
    case 'privado':
      return 'neutro';
    case 'publico':
      return 'ok';
    case 'grupo':
      return 'info';
    default:
      return 'neutro';
  }
}

export function Chip({ privacidade, texto, tom }: ChipProps) {
  const tomFinal = tom ?? (privacidade ? tomDaPrivacidade(privacidade) : 'neutro');
  const { bg, fg } = tons[tomFinal];
  const label = texto ?? rotulo(privacidade);
  if (!label) return null;
  return (
    <View style={[styles.chip, { backgroundColor: bg }]}>
      <Text style={[styles.texto, { color: fg }]}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  chip: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
    alignSelf: 'flex-start',
  },
  texto: {
    fontFamily: fonts.bodySemiBold,
    fontSize: 10,
    letterSpacing: 1.2,
    textTransform: 'uppercase',
  },
});
