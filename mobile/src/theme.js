/**
 * RIFQ Muslim - brand system.
 * Emerald green + Islamic gold identity, shared by Android, iOS and web.
 */
export const palette = {
  emerald: '#0B6E4F',
  emeraldDeep: '#074C36',
  emeraldLight: '#12805C',
  emeraldSoft: '#E3F2EA',
  gold: '#C9A227',
  goldLight: '#E7C766',
  goldSoft: '#FBF3D9',
  cream: '#FAF8F1',
  sand: '#F2EEE2',
  ink: '#12211B',
  inkSoft: '#3E4F47',
  muted: '#7A8B83',
  line: '#E2DED0',
  white: '#FFFFFF',
  danger: '#B3261E',
  dangerSoft: '#FCE9E7',
  success: '#1B7F4B',
  info: '#1E5E8C'
};

export const darkPalette = {
  emerald: '#1E9E74',
  emeraldDeep: '#0A3B2B',
  emeraldLight: '#2BB98A',
  emeraldSoft: '#12332A',
  gold: '#E0BE4E',
  goldLight: '#F0D77F',
  goldSoft: '#2E2A16',
  cream: '#0D1512',
  sand: '#131E19',
  ink: '#EAF3EE',
  inkSoft: '#C3D3CA',
  muted: '#8FA39A',
  line: '#23342C',
  white: '#FFFFFF',
  danger: '#FF8A80',
  dangerSoft: '#3A1B18',
  success: '#4ED08C',
  info: '#7EB8DD'
};

export const spacing = { xs: 4, sm: 8, md: 12, lg: 16, xl: 24, xxl: 32 };
export const radius = { sm: 8, md: 14, lg: 20, pill: 999 };

export function makeTheme(dark) {
  const c = dark ? darkPalette : palette;
  return {
    dark,
    c,
    screen: { flex: 1, backgroundColor: c.cream },
    card: {
      backgroundColor: c.white === '#FFFFFF' && !dark ? c.white : c.sand,
      borderRadius: radius.md,
      padding: spacing.lg,
      borderWidth: 1,
      borderColor: c.line,
      marginBottom: spacing.md
    },
    h1: { fontSize: 26, fontWeight: '800', color: c.ink, letterSpacing: 0.2 },
    h2: { fontSize: 20, fontWeight: '700', color: c.ink },
    h3: { fontSize: 16, fontWeight: '700', color: c.ink },
    body: { fontSize: 14.5, color: c.inkSoft, lineHeight: 21 },
    small: { fontSize: 12.5, color: c.muted, lineHeight: 18 },
    arabic: { fontSize: 24, color: c.ink, lineHeight: 42, textAlign: 'right' }
  };
}
