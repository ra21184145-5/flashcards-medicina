import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { colors } from '../theme/colors';
import { Privacy } from '../types';

interface ChipProps {
  privacidade?: Privacy;
  texto?: string;
  tom?: 'info' | 'ok' | 'aviso' | 'neutro';
}

const tons = {
  info: { bg: '#E6F0FD', fg: '#1856C2' },
  ok: { bg: '#DFF7EC', fg: '#0E8B5E' },
  aviso: { bg: '#FFF1CF', fg: '#8A5C00' },
  neutro: { bg: '#F0F2F5', fg: '#4B5562' },
};

function rotulo(p?: Privacy): string {
  switch (p) {
    case 'privado':
      return 'Privado';
    case 'publico':
      return 'Publico';
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
    fontSize: 11,
    fontWeight: '600',
    letterSpacing: 0.2,
  },
});
