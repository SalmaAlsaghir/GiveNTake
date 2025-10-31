# ♿ Accessibility & UX

This document summarizes the accessibility and UX practices used in GiveNTake.

## Principles
- Use semantic HTML for structure and meaning
- Ensure keyboard navigation works for all interactive elements
- Provide visible focus styles
- Maintain sufficient color contrast (WCAG 2.1 AA)
- Respect user preferences (reduced motion)
- Provide helpful empty states and error messages
- Ensure touch target sizes are at least 44×44 px on mobile

## Implementation

### Components
- Built with Radix UI primitives, which provide accessible ARIA attributes by default
- Custom components in `src/components/ui/*` maintain label/description associations
- Dialogs, menus, toasts use focus trapping and ARIA roles

### Pages
- Landmarks (header, main, nav) used in `src/components/app-layout.tsx`
- Page titles and headings provide clear hierarchy
- Forms include labels and error messages via `react-hook-form` + Zod

### Colors & Motion
- Primary palette: `#8b5cf6` (Purple), `#67e8f9` (Aqua), `#fbbf24` (Yellow)
- Checked for contrast on key surfaces (buttons, text on backgrounds)
- Animations kept subtle; `prefers-reduced-motion` respected for transitions

### Mobile
- Mobile-first responsive grid across all pages
- Buttons and inputs sized for touch
- Carousels and interactive charts tested on mobile

## Testing
- Keyboard-only navigation on main flows (signup, create listing, browse)
- Screen-reader spot checks on key pages
- Cross-browser validation (Chrome, Safari, Firefox, Edge)
- Device testing on iOS Safari and Android Chrome

## Known Areas to Improve
- Add end-to-end automated accessibility tests (e.g., axe-core)
- Expand aria-live regions for asynchronous updates
- Provide text alternatives for all non-decorative images

---

For more on the design system, see `README.md#🎨-Design-System`.
