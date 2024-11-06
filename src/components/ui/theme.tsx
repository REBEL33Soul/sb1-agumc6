import { createTheme } from '@/lib/utils';

export const theme = createTheme({
  colors: {
    background: {
      primary: '#0A0A0F',
      secondary: '#12121A',
      tertiary: '#1A1A24'
    },
    accent: {
      blue: '#3B82F6',
      red: '#EF4444',
      green: '#10B981',
      pink: '#EC4899'
    },
    text: {
      primary: '#FFFFFF',
      secondary: '#94A3B8',
      muted: '#64748B'
    }
  },
  effects: {
    glow: {
      blue: '0 0 20px rgba(59, 130, 246, 0.5)',
      red: '0 0 20px rgba(239, 68, 68, 0.5)',
      green: '0 0 20px rgba(16, 185, 129, 0.5)',
      pink: '0 0 20px rgba(236, 72, 153, 0.5)'
    }
  }
});