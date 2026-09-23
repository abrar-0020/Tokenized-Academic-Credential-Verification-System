---
name: Academic Tech Precision
colors:
  surface: '#f9f9f8'
  surface-dim: '#dadad9'
  surface-bright: '#f9f9f8'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f3f4f3'
  surface-container: '#eeeeed'
  surface-container-high: '#e8e8e7'
  surface-container-highest: '#e2e2e2'
  on-surface: '#1a1c1c'
  on-surface-variant: '#404944'
  inverse-surface: '#2f3130'
  inverse-on-surface: '#f1f1f0'
  outline: '#707974'
  outline-variant: '#bfc9c3'
  surface-tint: '#2b6954'
  primary: '#003527'
  on-primary: '#ffffff'
  primary-container: '#064e3b'
  on-primary-container: '#80bea6'
  inverse-primary: '#95d3ba'
  secondary: '#416656'
  on-secondary: '#ffffff'
  secondary-container: '#c3ecd7'
  on-secondary-container: '#476c5b'
  tertiary: '#502000'
  on-tertiary: '#ffffff'
  tertiary-container: '#733100'
  on-tertiary-container: '#ff985a'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#b0f0d6'
  primary-fixed-dim: '#95d3ba'
  on-primary-fixed: '#002117'
  on-primary-fixed-variant: '#0b513d'
  secondary-fixed: '#c3ecd7'
  secondary-fixed-dim: '#a8cfbc'
  on-secondary-fixed: '#002115'
  on-secondary-fixed-variant: '#294e3f'
  tertiary-fixed: '#ffdbca'
  tertiary-fixed-dim: '#ffb68e'
  on-tertiary-fixed: '#331200'
  on-tertiary-fixed-variant: '#763300'
  background: '#f9f9f8'
  on-background: '#1a1c1c'
  surface-variant: '#e2e2e2'
typography:
  display-lg:
    fontFamily: Inter
    fontSize: 57px
    fontWeight: '600'
    lineHeight: 64px
    letterSpacing: -0.02em
  headline-lg:
    fontFamily: Inter
    fontSize: 32px
    fontWeight: '600'
    lineHeight: 40px
    letterSpacing: -0.01em
  headline-lg-mobile:
    fontFamily: Inter
    fontSize: 28px
    fontWeight: '600'
    lineHeight: 36px
  title-lg:
    fontFamily: Inter
    fontSize: 22px
    fontWeight: '500'
    lineHeight: 28px
  body-lg:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
    letterSpacing: 0.5px
  body-md:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '400'
    lineHeight: 20px
  label-lg:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '500'
    lineHeight: 20px
    letterSpacing: 0.1px
  label-md:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: '500'
    lineHeight: 16px
    letterSpacing: 0.5px
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  base: 4px
  xs: 4px
  sm: 8px
  md: 16px
  lg: 24px
  xl: 40px
  gutter: 24px
  margin-mobile: 16px
  margin-desktop: 64px
  max-width: 1280px
---

## Brand & Style

This design system is built upon the concept of "Academic Tech Precision." It merges the structural reliability of Material 3 with the refined, tactile feel of premium institutional design. The goal is to evoke the feeling of a digital parchment—intelligent, verified, and permanent.

The aesthetic direction is **Corporate / Modern** with a lean toward **Minimalism**. It avoids unnecessary ornamentation in favor of high-quality typography, generous whitespace, and a sophisticated color palette that suggests heritage without feeling antiquated. The interface should respond with high-end fluidity, utilizing tonal shifts rather than aggressive shadows to define hierarchy.

**Target Audience:** University registrars, high-stakes employers, and professional graduates who require a secure, authoritative environment for sensitive credentials.

## Colors

The palette is rooted in a Deep Emerald Green, symbolizing growth and institutional stability. 

- **Primary (#064E3B):** Used for key actions, brand representation, and high-emphasis states.
- **Secondary (#D1FAE5):** Employed for subtle container fills, chip backgrounds, and soft highlights.
- **Tertiary (#B45309):** A "Brass/Gold" accent reserved specifically for verification badges, seal indicators, and premium credential highlights.
- **Neutral/Surface (#FAFAF9):** A warm ivory that reduces eye strain compared to pure white, providing a "paper" quality to the UI.
- **On-Surface (#1C1917):** Deep charcoal ensures high legibility and professional contrast.

In **Dark Mode**, the surface shifts to a deep charcoal-green (#121412). Tonal elevation is achieved by layering translucent primary-color overlays (1-5% opacity) on top of the dark surface rather than lightening the base hex color.

## Typography

The design system utilizes **Inter** exclusively to maintain a systematic, utilitarian, and modern aesthetic. 

- **Weight Usage:** Use `600` (Semi-bold) for headlines to establish clear authority. Body text uses `400` for maximum legibility in long-form verification logs. `500` (Medium) is reserved for interactive labels and button text.
- **Tracking:** Headlines use slightly negative letter spacing to feel "tighter" and more editorial. Labels use increased tracking for clarity at small sizes.
- **Hierarchy:** Maintain a clear vertical rhythm. Information-dense views (like credential lists) should prioritize `label-md` for metadata and `title-lg` for primary identifiers.

## Layout & Spacing

The layout follows a **Fixed Grid** model for desktop to maintain the "document" feel of an academic platform, transitioning to a **Fluid Grid** for mobile devices.

- **Desktop:** 12-column grid, 24px gutters, with a maximum content width of 1280px. Centers the layout to create a "portal" effect.
- **Tablet:** 8-column grid, 16px gutters, 32px side margins.
- **Mobile:** 4-column grid, 16px gutters, 16px side margins.
- **Spacing Rhythm:** All spacing is based on a 4px baseline. Components use 16px (`md`) or 24px (`lg`) internal padding to feel spacious and premium.

## Elevation & Depth

This design system prioritizes **Tonal Layers** over heavy shadows. Depth is communicated through color luminance and subtle shifts in surface color.

- **Level 0 (Base):** Warm Ivory (#FAFAF9).
- **Level 1 (Cards/Nav):** Base surface + 5% Primary color tint. A very soft, 4px blur shadow with 2% opacity is used to provide a "lift" from the background.
- **Level 2 (Modals):** Base surface + 8% Primary color tint. Used for dialogs and popovers.
- **Interaction:** Hover states should utilize a subtle darken or lighten (depending on the mode) rather than an increased shadow, maintaining the "flat-yet-premium" look.

## Shapes

The shape language is purposefully varied to distinguish between control types while maintaining a cohesive, rounded identity.

- **Small Controls (12px):** Applied to input fields, buttons, and chips. This provides a precise, modern feel.
- **Standard Cards (20px):** Applied to credential summaries, data modules, and list items.
- **Hero Surfaces (28px):** Applied to the main dashboard containers, bottom sheets, and large featured credentials. This generous rounding communicates a softer, high-end "vault" or "folder" metaphor.

## Components

- **Buttons:** Primary buttons use the Deep Emerald (#064E3B) with white text. Tertiary buttons (Brass/Gold) are used only for "Verify" or "Premium" actions. All buttons have a 12px corner radius.
- **Cards:** Cards should have no border, using tonal elevation (Level 1) for separation. Credential cards include a 4px left-accent bar in Primary or Tertiary color to indicate status.
- **Input Fields:** Outlined style with a 1px border. On focus, the border increases to 2px in Primary Deep Emerald. Background is slightly more neutral than the surface to define the "well."
- **Chips:** Used for status indicators (e.g., "Verified," "Pending"). Verified chips use the Muted Sage (#D1FAE5) background with Deep Emerald text.
- **Credential Seal:** A custom component using the Tertiary Gold color, featuring a circular motif and high-weight `label-md` text, used to certify authenticity.
- **Lists:** High-density lists use subtle 1px dividers in a very light neutral gray, with 16px vertical padding for each item to ensure an "uncluttered" institutional feel.