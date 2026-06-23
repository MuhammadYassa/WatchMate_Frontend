---
name: Nocturne Cinema
colors:
  surface: '#121317'
  surface-dim: '#121317'
  surface-bright: '#38393d'
  surface-container-lowest: '#0d0e11'
  surface-container-low: '#1a1b1f'
  surface-container: '#1e1f23'
  surface-container-high: '#292a2d'
  surface-container-highest: '#343538'
  on-surface: '#e3e2e7'
  on-surface-variant: '#c4c6d0'
  inverse-surface: '#e3e2e7'
  inverse-on-surface: '#2f3034'
  outline: '#8e909a'
  outline-variant: '#44474f'
  surface-tint: '#adc6ff'
  primary: '#d8e2ff'
  on-primary: '#122f5f'
  primary-container: '#adc6ff'
  on-primary-container: '#385283'
  inverse-primary: '#455e90'
  secondary: '#c2c6d6'
  on-secondary: '#2b303d'
  secondary-container: '#424754'
  on-secondary-container: '#b0b5c4'
  tertiary: '#ffdea4'
  on-tertiary: '#412d00'
  tertiary-container: '#ebc06e'
  on-tertiary-container: '#6c4d01'
  error: '#ffb4ab'
  on-error: '#690005'
  error-container: '#93000a'
  on-error-container: '#ffdad6'
  primary-fixed: '#d8e2ff'
  primary-fixed-dim: '#adc6ff'
  on-primary-fixed: '#001a42'
  on-primary-fixed-variant: '#2c4677'
  secondary-fixed: '#dee2f2'
  secondary-fixed-dim: '#c2c6d6'
  on-secondary-fixed: '#171b27'
  on-secondary-fixed-variant: '#424754'
  tertiary-fixed: '#ffdea5'
  tertiary-fixed-dim: '#ebc06e'
  on-tertiary-fixed: '#261900'
  on-tertiary-fixed-variant: '#5d4200'
  background: '#121317'
  on-background: '#e3e2e7'
  surface-variant: '#343538'
typography:
  display-lg:
    fontFamily: Playfair Display
    fontSize: 48px
    fontWeight: '700'
    lineHeight: '1.1'
    letterSpacing: -0.02em
  display-lg-mobile:
    fontFamily: Playfair Display
    fontSize: 32px
    fontWeight: '700'
    lineHeight: '1.2'
  headline-md:
    fontFamily: Playfair Display
    fontSize: 24px
    fontWeight: '600'
    lineHeight: '1.3'
  body-lg:
    fontFamily: Inter
    fontSize: 18px
    fontWeight: '400'
    lineHeight: '1.6'
  body-md:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '400'
    lineHeight: '1.6'
  label-sm:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: '600'
    lineHeight: '1'
    letterSpacing: 0.05em
rounded:
  sm: 0.125rem
  DEFAULT: 0.25rem
  md: 0.375rem
  lg: 0.5rem
  xl: 0.75rem
  full: 9999px
spacing:
  unit: 8px
  container-margin: 24px
  gutter: 16px
  section-gap: 48px
---

## Brand & Style

This design system is engineered for a premium, cinematic experience, targeting film enthusiasts and cinephiles who value a theater-like immersion in their digital tools. The brand personality is sophisticated, atmospheric, and focused, acting as a quiet stage for high-quality movie imagery to shine.

The visual style is **Cinematic Glassmorphism**. It utilizes deep, layered surfaces that feel like polished obsidian. The interface recedes to prioritize content, using frosted transparency, vibrant background blurs, and razor-sharp micro-borders to define space. The emotional response is one of "midnight focus"—calm, high-end, and deeply immersive.

## Colors

The palette is strictly dark to maintain a "lights-out" theater aesthetic. 
- **Surfaces:** The foundation uses `background_deep` for the primary canvas and `surface_rich` for elevated panels and cards.
- **Accents:** Electric Blue (`primary_color_hex`) is used sparingly for active states, progress indicators, and primary CTAs. Soft Slate serves as the secondary neutral for metadata and de-emphasized text.
- **Atmospherics:** Subtle radial gradients using the `accent_glow_hex` should be placed behind key posters or hero sections to create a sense of depth and "screen glow."

## Typography

This design system uses a high-contrast typographic pairing to evoke an editorial, luxury feel.
- **Headlines:** `Playfair Display` is used for movie titles, section headers, and big display moments. Its serif elegance provides a literary quality to the film database.
- **Interface:** `Inter` is the workhorse for all functional elements. Its neutrality ensures legibility against complex movie backdrops.
- **Styling:** Use `label-sm` for technical metadata (e.g., RUNTIME, GENRE, RATING) with increased letter spacing for a refined, technical look.

## Layout & Spacing

The layout follows a **Fixed-Width Fluidity** model. On desktop, the content is centered within a 12-column grid to prevent eye-strain across wide monitors, while on mobile, it transitions to a single-column scroll with tight 16px gutters.

- **Hero Sections:** Always bleed to the edges of the viewport with a vertical gradient fade from transparent to `background_deep` at the bottom 30%.
- **Grids:** Movie posters should maintain a 2:3 aspect ratio. Spacing between posters should be consistent at `gutter`.
- **Safe Areas:** Ensure a 24px horizontal margin on mobile devices to prevent content from hitting the screen edges.

## Elevation & Depth

Depth is conveyed through transparency and blur rather than traditional drop shadows.
- **Level 1 (Base):** Solid `#0e0e10`.
- **Level 2 (Panels):** `surface_rich` with 80% opacity and a 20px backdrop-blur.
- **Level 3 (Modals/Overlays):** `surface_rich` with 60% opacity, 40px backdrop-blur, and a 1px solid border at 15% white opacity.
- **Glows:** Use soft, primary-colored radial gradients (200px - 400px radius) behind active elements to simulate the light emission of a projector screen.

## Shapes

The shape language is "Soft-Modern." 
- Elements use a `0.25rem` (4px) base radius to maintain a crisp, professional edge.
- Large cards and posters use `0.5rem` (8px) to feel more tangible and premium.
- Avoid pill-shapes for buttons; instead, use slightly rounded rectangles to stay consistent with the architectural, cinematic feel.

## Components

### Poster Cards
The core component of this design system. Posters should feature a 1px inner border. Metadata overlays (title, year) appear on hover using a glassmorphic bottom-shelf with a heavy backdrop blur.

### Cinematic Heroes
Large-scale background images with a "vignette" effect. Text (titles) should be set in `display-lg` Playfair Display, positioned in the bottom-left quadrant with a subtle text-shadow for legibility against busy backgrounds.

### Tactile Status Selectors
Instead of standard checkboxes, use "Toggle Chips." When active, they glow with the `primary_color_hex` and feature a subtle inner shadow to look "pressed."

### Input Fields
Minimalist bottom-line inputs or fully transparent glass containers with a 1px border. Focus state is indicated by the border brightening to `primary_color_hex` and a faint outer glow.

### Action Buttons
Primary buttons use a solid `primary_color_hex` with black text. Secondary buttons are "ghost" style with a 1px white/10 border and white text. All buttons should have a high-gloss hover state.