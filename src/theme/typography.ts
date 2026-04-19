import { Platform, TextStyle } from 'react-native';

// Famílias de fontes carregadas via @expo-google-fonts em App.tsx.
// Fraunces e uma serif variavel (optical size + soft) que confere um
// tom editorial academico aos titulos. Plus Jakarta Sans e uma sans
// geometrica refinada, distinta das opcoes genericas (Inter/Roboto).
export const fonts = {
  display: 'Fraunces_600SemiBold',
  displayItalic: 'Fraunces_400Regular_Italic',
  displayLight: 'Fraunces_400Regular',
  body: 'PlusJakartaSans_400Regular',
  bodyMedium: 'PlusJakartaSans_500Medium',
  bodySemiBold: 'PlusJakartaSans_600SemiBold',
  bodyBold: 'PlusJakartaSans_700Bold',
};

// Fallback durante o carregamento das fontes custom. Usamos o stack
// nativo do sistema para nao quebrar a renderizacao inicial.
export const systemFont =
  Platform.OS === 'ios' ? 'System' : Platform.OS === 'android' ? 'Roboto' : 'system-ui';

export const type = {
  display: (fontSize: number, extra: Partial<TextStyle> = {}): TextStyle => ({
    fontFamily: fonts.display,
    fontSize,
    letterSpacing: -0.5,
    ...extra,
  }),
  body: (fontSize: number = 15, extra: Partial<TextStyle> = {}): TextStyle => ({
    fontFamily: fonts.body,
    fontSize,
    ...extra,
  }),
  label: (extra: Partial<TextStyle> = {}): TextStyle => ({
    fontFamily: fonts.bodyMedium,
    fontSize: 12,
    letterSpacing: 0.5,
    textTransform: 'uppercase',
    ...extra,
  }),
};
