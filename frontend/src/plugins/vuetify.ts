import { createVuetify, type ThemeDefinition } from 'vuetify'
import { md3 } from 'vuetify/blueprints'
import * as components from 'vuetify/components'
import * as directives from 'vuetify/directives'

const customLightTheme: ThemeDefinition = {
  dark: false,
  colors: {
    background: '#FAFAFA',
    surface: '#FFFFFF',
    primary: '#3F51B5',      // Indigo 500
    secondary: '#7986CB',    // Indigo 300
    accent: '#FF7043',       // Deep Orange 400
    error: '#F44336',
    info: '#2196F3',
    success: '#4CAF50',
    warning: '#FFC107',
    'on-background': '#212121',
    'on-surface': '#212121',
    'on-primary': '#FFFFFF',
    'on-secondary': '#FFFFFF',
    'on-accent': '#FFFFFF',
  }
}

const customDarkTheme: ThemeDefinition = {
  dark: true,
  colors: {
    background: '#121212',
    surface: '#000000',
    primary: '#3F51B5',      // Indigo 500
    secondary: '#7986CB',    // Indigo 300
    accent: '#FF7043',       // Deep Orange 400
    error: '#F44336',
    info: '#2196F3',
    success: '#4CAF50',
    warning: '#FFC107',
    'on-background': '#E0E0E0',
    'on-surface': '#E0E0E0',
    'on-primary': '#FFFFFF',
    'on-secondary': '#FFFFFF',
    'on-accent': '#FFFFFF',
  }
}

export default createVuetify({
  blueprint: md3,
  components,
  directives,
  theme: {
    defaultTheme: 'customLight',
    themes: {
      customLight: customLightTheme,
      customDark: customDarkTheme
    },
  },
})
