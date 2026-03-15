// Paleta editorial acadêmica. Mantém o azul #1F6FEB + verde #11B981
// aprovados no TCC I, mas adiciona uma fundação de "pergaminho" e um
// âmbar discreto para destaques, evitando a estética "AI slop".
export const colors = {
  // Identidade
  primary: '#1F6FEB',
  primaryDark: '#1856C2',
  primaryDeep: '#0F3D7E',
  primarySoft: '#EAF2FE',
  accent: '#11B981',
  accentSoft: '#DDF5EB',
  amber: '#C68A16',
  amberSoft: '#F7EED6',
  danger: '#D24141',
  warning: '#C68A16',

  // Superfícies
  background: '#FAF7F1', // off-white quente (papel)
  backgroundElevated: '#FFFFFF',
  card: '#FFFFFF',
  surfaceMuted: '#F3EEE4',

  // Bordas / separadores
  border: '#E6E0D3',
  borderStrong: '#D9D1BF',

  // Texto
  text: '#0F1B2E',
  textMuted: '#5C6576',
  textSoft: '#8A8275',

  // Sombra (usada com elevation)
  shadow: '#0F1B2E',
};

export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
};

export const radii = {
  sm: 8,
  md: 12,
  lg: 18,
  xl: 28,
  pill: 999,
};

// Largura máxima do container em telas largas (web / tablet landscape).
// Mantém o layout "mobile-first" bonito em desktop sem estirar inputs.
export const layout = {
  maxContent: 480,
  maxReading: 720,
};
