import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { colors } from '../theme/colors';
import { fonts } from '../theme/typography';

interface BrandMarkProps {
  size?: number;
}

// Monograma "Ƒ" (f serif com traco horizontal) dentro de um disco com
// gradiente azul profundo e um anel ambar delicado por fora - evoca uma
// biblioteca universitaria moderna sem cair em clichés de apps medicos.
export function BrandMark({ size = 76 }: BrandMarkProps) {
  const ringSize = size + 8;
  return (
    <View style={[styles.ringWrap, { width: ringSize, height: ringSize }]}>
      <View
        style={[
          styles.ring,
          { width: ringSize, height: ringSize, borderRadius: ringSize / 2 },
        ]}
      />
      <LinearGradient
        colors={[colors.primaryDeep, colors.primary]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={[styles.disc, { width: size, height: size, borderRadius: size / 2 }]}
      >
        <Text
          style={{
            fontFamily: fonts.displayItalic,
            fontSize: size * 0.55,
            color: '#FFFFFF',
            lineHeight: size * 0.9,
          }}
        >
          Ƒ
        </Text>
      </LinearGradient>
    </View>
  );
}

const styles = StyleSheet.create({
  ringWrap: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  ring: {
    position: 'absolute',
    borderWidth: 1,
    borderColor: colors.amber,
    opacity: 0.55,
  },
  disc: {
    alignItems: 'center',
    justifyContent: 'center',
  },
});
