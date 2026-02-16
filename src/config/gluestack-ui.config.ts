import { config as defaultConfig } from '@gluestack-ui/config';

/**
 * Custom Gluestack UI Configuration
 * Extends the default configuration with custom theme
 */
export const config = {
  ...defaultConfig,
  tokens: {
    ...defaultConfig.tokens,
    colors: {
      ...defaultConfig.tokens.colors,
      // Primary colors for the app
      primary50: '#e3f2fd',
      primary100: '#bbdefb',
      primary200: '#90caf9',
      primary300: '#64b5f6',
      primary400: '#42a5f5',
      primary500: '#2196f3',
      primary600: '#1e88e5',
      primary700: '#1976d2',
      primary800: '#1565c0',
      primary900: '#0d47a1',
      
      // Secondary colors
      secondary50: '#f3e5f5',
      secondary100: '#e1bee7',
      secondary200: '#ce93d8',
      secondary300: '#ba68c8',
      secondary400: '#ab47bc',
      secondary500: '#9c27b0',
      secondary600: '#8e24aa',
      secondary700: '#7b1fa2',
      secondary800: '#6a1b9a',
      secondary900: '#4a148c',
    },
  },
};

export type Config = typeof config;
