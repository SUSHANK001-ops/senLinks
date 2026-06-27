# SenLinks — Design.md
**Goal:** Replace the generic AI-template landing page with something that looks like it was designed for a link-in-bio tool specifically, not any SaaS.

---

## 0. Why the current page reads as "bad"

Not bad execution — bad *originality*. The structure (pill badge → bold headline → two buttons → 6-icon grid → blue CTA band → footer) is the default output of every landing page prompt. Animating that structure won't fix it. The fix is below: a different layout concept, built around what this product actually does (you have ONE link, made of many links).

---

## 1. Color system (flat fills only — your Setup.md rule stays, just applied wider)

| Token | Hex | Usage |
|---|---|---|
| `ink` | `#111827` | Body text, default |
| `paper` | `#FFFFFF` | Page background |
| `navy` | `#1E3A8A` | Primary brand, nav, main CTA |
| `navy-deep` | `#15296B` | Hover state on navy |
| `coral` | `#FF5A5F` | Accent chip 1 — energetic, used on link cards / highlights |
| `mint` | `#1FAE7A` | Accent chip 2 — link cards, success states |
| `amber` | `#F5A623` | Accent chip 3 — link cards, used sparingly |
| `danger` | `#B91C1C` | Destructive actions only (unchanged from Setup.md) |
| `border` | `#E5E7EB` | Dividers |

Rule stays: **no gradients, no glassmorphism.** Playfulness comes from using coral/mint/amber as solid chip colors on individual link cards — like the actual colored links a user would create — not from decorating the chrome of the page. This is more honest to the product anyway: the variety is content, not decoration.

---

## 2. Typography

- **Display:** Space Grotesk (or Cabinet Grotesk if licensed) — bold, slightly quirky geometric sans. Used big, at 700–800 weight, tight letter-spacing. This carries the "playful but sharp" tone, not Inter/system-default.
- **Body:** Inter — neutral, gets out of the way for paragraph text.
- **Mono/utility:** JetBrains Mono — used ONLY for the URL string (`senlinks.sushanka.com.np/yourname`), because that's literally a code-like artifact in this product. Small, in a flat chip, not decorative.

Scale: Hero headline 64–80px desktop / 36px mobile, weight 800. Section headers 32px, weight 700. Body 16–18px, weight 400–500.

---

## 3. Layout concept — reject the feature-grid default

The product's whole idea is: many links collapse into one. The page should *show* that, not tell it in a bullet grid.

### Hero — signature element
Instead of a centered text block with two buttons, the hero is a **live link-stack demo**: a phone-width mock profile card on the right, with 4–5 colored link chips (coral/mint/amber/navy) stacked on top of each other at slight rotation angles, like a messy pile of cards. On page load, they animate into a clean vertical stack (the chain "snapping into place"). On cursor move, each chip tilts slightly toward the cursor (parallax, 3–6 degrees max, not heavy) — this is the one "noticeable, cursor-reactive" moment you asked for. Headline sits left, plain and direct, no pill badge (pill badges are template furniture — cut it).

```
+----------------------------------------------------+
|  SenLinks                          Log in   Sign up |
+----------------------------------------------------+
|                                                      |
|  One link.                       [chip: Instagram]  |
|  Everything you           [chip: Portfolio] (tilted)|
|  run into.                   [chip: Shop]  (tilted) |
|                            [chip: Newsletter]        |
|  yourname.senlinks...                                |
|  [Create your page]                                  |
|                                                      |
+----------------------------------------------------+
```

### Section 2 — "How it stacks up" (not a 6-icon grid)
Three real screens shown side by side as actual mock UI (not icon+text cards): the admin add-link screen → the public profile → the analytics chart. Each one staggers into view on scroll (fade + 24px rise, 80ms stagger between the three). This shows the product instead of describing it with icons. Icons-with-adjectives ("Unlimited Links," "Mobile First") are filler copy — cut features that aren't differentiators (every competitor has "mobile friendly").

Keep only the features that are actually distinct to your build: click analytics with country/device breakdown, scheduled links (start/expiry dates), and the auth choice (Google/GitHub/email). That's 3 real things, not 6 padded ones.

### Section 3 — CTA band
Keep this, but cut the generic "Ready to simplify your online presence?" copy — that line could belong to any SaaS. Replace with something specific: *"Your links already exist. Stop pasting them everywhere."* Single CTA button, no gradient band — flat navy, same as Setup.md spec.

### Footer
Unchanged structurally, fine as is.

---

## 4. Motion spec (concrete, so it's buildable — "noticeable" tier)

| Element | Trigger | Effect | Timing |
|---|---|---|---|
| Hero link chips | Page load | Cards rotate from scattered angles into clean stack | 600ms, staggered 100ms each, ease-out |
| Hero link chips | Mouse move (desktop only) | Each chip tilts 3–6° toward cursor position | Continuous, spring-damped, no lag feel |
| Section 2 mockups | Scroll into view | Fade + rise 24px | 400ms, staggered 80ms between the 3 |
| Buttons | Hover | Background shifts to `-deep`/darker variant, scale 1.02 | 150ms |
| Nav | Scroll past hero | Background gains 1px bottom border (sticky) | 150ms |

Respect `prefers-reduced-motion`: disable cursor-tilt and load-stagger, keep simple fades only.

---

## 5. Copy fixes (the copy is as templated as the layout)

- Cut: "Free for everyone" pill — vague, and you haven't decided pricing (per Setup.md open question). Don't print a pricing claim you haven't actually decided on.
- Cut: "Ready to simplify your online presence?" — generic SaaS-speak.
- Cut feature names that aren't differentiators: "Unlimited Links," "Mobile First," "Social Icons" — table stakes, not reasons to choose this over Linktree.
- Keep and lead with: click analytics (country/device/referrer — you actually built this), scheduled links (start/expiry — most competitors don't have this), auth choice.

---

## 6. Icons — stop using emoji

The screenshot uses raw emoji (🔗 📊 ⏰ 🌐 🔒 📱) as icons. This is a dead giveaway of an unstyled AI build — emoji render differently per OS/browser, can't take a stroke color, and look like placeholder content, not design.

**Use `lucide-react`** (already in your stack if you're on Next.js/Tailwind — `npm install lucide-react`). It's tree-shakeable, consistent stroke-based style, and matches a flat-color design better than filled icon sets (Font Awesome, Heroicons solid) would.

Rules:
- Stroke width: `1.75` everywhere (Lucide default is 2 — slightly thinner reads less default-template).
- Size: `20px` inline with text, `24px` in standalone feature spots.
- Color: icons take the section's ink or accent color via `currentColor` / `stroke="currentColor"` — never default black, never multi-color emoji-style icons.
- No icon sits inside a colored circle/square badge background — that's template decoration. Icon + label, flat, done.

Mapping (replace emoji 1:1):

| Old emoji | Lucide icon | Used for |
|---|---|---|
| 🔗 | `Link2` | Links feature |
| 📊 | `BarChart3` | Click analytics |
| ⏰ | `Clock` | Scheduled links |
| 🌐 | `Globe` | Social icons |
| 🔒 | `Lock` | Secure auth |
| 📱 | `Smartphone` | Mobile / responsive |

Since Section 2 is being replaced with real mockup screenshots (see above), most of these icons only need to survive in the nav, footer, or as small inline labels next to copy — not as the centerpiece of a feature grid. Don't rebuild the icon grid just because the icons are now "proper" — the grid itself was the problem, not just the emoji.

---

## 7. Open item carried over from Setup.md

You still haven't decided what `senlinks.sushanka.com.np` (root) actually shows — your own profile, or this generic signup landing page. This design assumes the multi-user signup landing page, matching what's already on screen. If you actually intended single-admin-only, this entire page direction is wrong and needs to be a personal profile instead — confirm before building.