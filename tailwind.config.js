/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
        inter: ['Inter', 'sans-serif'],
      },
      colors: {
        // Brand Colors
        brand: 'rgb(var(--color-brand) / <alpha-value>)',
        brandHover: 'rgb(var(--color-brand-hover) / <alpha-value>)',
        brandLight: 'rgb(var(--color-brand-light) / <alpha-value>)',
        brandLightHover: 'rgb(var(--color-brand-light-hover) / <alpha-value>)',
        
        // Accent Colors
        accent: 'rgb(var(--color-accent) / <alpha-value>)',
        accentHover: 'rgb(var(--color-accent-hover) / <alpha-value>)',
        accentLight: 'rgb(var(--color-accent-light) / <alpha-value>)',
        accentDark: 'rgb(var(--color-accent-dark) / <alpha-value>)',
        
        // Status Colors
        success: 'rgb(var(--color-success) / <alpha-value>)',
        successLight: 'rgb(var(--color-success-light) / <alpha-value>)',
        successDark: 'rgb(var(--color-success-dark) / <alpha-value>)',
        warning: 'rgb(var(--color-warning) / <alpha-value>)',
        warningLight: 'rgb(var(--color-warning-light) / <alpha-value>)',
        warningDark: 'rgb(var(--color-warning-dark) / <alpha-value>)',
        error: 'rgb(var(--color-error) / <alpha-value>)',
        errorLight: 'rgb(var(--color-error-light) / <alpha-value>)',
        errorDark: 'rgb(var(--color-error-dark) / <alpha-value>)',
        
        // Background System
        bg: 'rgb(var(--color-bg) / <alpha-value>)',
        bg2: 'rgb(var(--color-bg-secondary) / <alpha-value>)',
        bg3: 'rgb(var(--color-bg-tertiary) / <alpha-value>)',
        bgAccent: 'rgb(var(--color-bg-accent) / <alpha-value>)',
        bgGradientStart: 'rgb(var(--color-bg-gradient-start) / <alpha-value>)',
        bgGradientEnd: 'rgb(var(--color-bg-gradient-end) / <alpha-value>)',
        
        // Foreground/Text System
        fg: 'rgb(var(--color-fg) / <alpha-value>)',
        fg2: 'rgb(var(--color-fg-secondary) / <alpha-value>)',
        fg3: 'rgb(var(--color-fg-tertiary) / <alpha-value>)',
        fgInverse: 'rgb(var(--color-fg-inverse) / <alpha-value>)',
        fgMuted: 'rgb(var(--color-fg-muted) / <alpha-value>)',
        
        // Border Colors
        border: 'rgb(var(--color-border) / <alpha-value>)',
        borderLight: 'rgb(var(--color-border-light) / <alpha-value>)',
        borderDark: 'rgb(var(--color-border-dark) / <alpha-value>)',
        borderFocus: 'rgb(var(--color-border-focus) / <alpha-value>)',
        borderInput: 'rgb(var(--color-border-input) / <alpha-value>)',
        
        // Card Colors
        card: 'rgb(var(--color-card) / <alpha-value>)',
        cardHover: 'rgb(var(--color-card-hover) / <alpha-value>)',
        cardBorder: 'rgb(var(--color-card-border) / <alpha-value>)',
        
        // Input Colors
        input: 'rgb(var(--color-input) / <alpha-value>)',
        inputBorder: 'rgb(var(--color-input-border) / <alpha-value>)',
        inputBorderHover: 'rgb(var(--color-input-border-hover) / <alpha-value>)',
        inputBorderFocus: 'rgb(var(--color-input-border-focus) / <alpha-value>)',
        inputBg: 'rgb(var(--color-input-bg) / <alpha-value>)',
        inputPlaceholder: 'rgb(var(--color-input-placeholder) / <alpha-value>)',
        selectHover: 'rgb(var(--color-select-hover) / <alpha-value>)',
        
        // Overlay Colors
        overlay: 'rgb(var(--color-overlay) / <alpha-value>)',
        overlayLight: 'rgb(var(--color-overlay-light) / <alpha-value>)',
        overlayDark: 'rgb(var(--color-overlay-dark) / <alpha-value>)',
        
        // Shadow Colors
        shadow: 'rgb(var(--color-shadow) / <alpha-value>)',
        shadowLight: 'rgb(var(--color-shadow-light) / <alpha-value>)',
        shadowDark: 'rgb(var(--color-shadow-dark) / <alpha-value>)',
        
        // Custom Green Colors
        'light-green': '#E8F4E6',
        'dark-green': '#45833F',
        
        // Custom Grey Colors
        'light-grey': '#ECECEC',
        'dark-grey': '#5D5D5D',
      },
      borderRadius: {
        xs: 'var(--radius-xs)',
        sm: 'var(--radius-sm)',
        md: 'var(--radius-md)',
        lg: 'var(--radius-lg)',
        xl: 'var(--radius-xl)',
        '2xl': 'var(--radius-2xl)',
        full: 'var(--radius-full)',
      },
    },
  },
  plugins: [],
}

