// Mirrors the web design tokens in packages/web/src/index.css @theme so both
// platforms read as the same product.
export const colors = {
  bg: '#07090F',
  surface: '#111522',
  card: '#191F2D',
  elevated: '#22293A',

  primary: '#7C6CFF',
  primaryAlt: '#A855F7',
  accent: '#22D3EE',
  accentAlt: '#3B82F6',
  secondary: '#FF7AD9',

  green: '#00E29A',
  warning: '#FFC857',
  error: '#FF5E78',

  text: '#F5F7FF',
  textMuted: '#A9B1C9',
  textSubtle: '#6C7690',

  border: 'rgba(255,255,255,0.08)',
}

// Per-module accents — same mapping the web sidebar uses.
export const moduleAccents = {
  dashboard: colors.primary,
  attendance: '#3B82F6',
  challenges: '#A855F7',
  hackathons: '#FF9D5C',
  tasks: '#22D3EE',
  notes: '#00E29A',
  focus: '#FF7AD9',
  goals: '#8B5CF6',
  groups: '#6366F1',
}

export const spacing = { xs: 4, sm: 8, md: 16, lg: 24, xl: 32 }
export const radius = { sm: 10, md: 16, lg: 20, pill: 999 }
