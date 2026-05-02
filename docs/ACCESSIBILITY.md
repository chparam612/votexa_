# Accessibility Compliance Guide

## WCAG 2.1 Level AA Standards
Votexa is designed to be inclusive and accessible to all voters, following WCAG 2.1 AA guidelines.

## Implementation Details

### Interactive Elements
- All buttons use `Pressable` with `android_ripple` for tactile feedback.
- Every interactive element has an `accessibilityRole` (e.g., `button`, `header`, `alert`).
- `hitSlop` is applied to small targets to increase tap surface area.

### Screen Readers
- Use of `accessibilityLabel` for descriptive text on icons and complex components.
- `accessibilityHint` provides additional context for navigation actions.
- `maxFontSizeMultiplier` is set to `1.3` to support large text settings without breaking layouts.

### Visual Contrast
- Minimum contrast ratio of 4.5:1 for normal text.
- High-contrast colors for priority badges (CRITICAL: Red, HIGH: Orange, LOW: Green).

### Navigation
- Semantic heading structure using `accessibilityRole="header"`.
- Logical focus order for keyboard and assistive switch users.

## Testing Checklist
- [ ] Verify all icons have `accessibilityLabel`.
- [ ] Test screen reader (TalkBack/VoiceOver) flow on Dashboard.
- [ ] Check color contrast on custom gauge components.
- [ ] Ensure all forms have associated error messages with `accessibilityRole="alert"`.
