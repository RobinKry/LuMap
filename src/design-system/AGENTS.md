# LuMap design system

When building or changing any LuMap interface:

1. Read `DESIGN_GUIDE.md` in this folder first — it covers voice, colour rules,
   type, motion, iconography and the WORK/PARTY duality.
2. Compose from `components/`. Read the `.prompt.md` beside a component before
   using or modifying it. Do not re-implement a component that already exists.
3. Never hard-code a colour, radius, duration or font family. Every value lives as
   a CSS custom property in `tokens/`. If you need a value that isn't there, add a
   token rather than an inline literal.
4. Never write white text on `--accent`. Labels on accent are always
   `--accent-ink`. The pastels are too light for white type.
5. WORK is the default mode. The unscoped `:root` tokens resolve to WORK; PARTY is
   opt-in via `data-mode="party"` on an ancestor.
6. Do not add icons as hand-drawn SVG. LuMap's glyph set is emoji (💼 🔥 🎉 🎫)
   plus geometric map pins. For missing UI glyphs use Lucide, 2px stroke, round caps.
7. Do not add photography, illustration or gradients. The map is the only imagery.
8. Keep the product's bilingual copy as-is (German instructions, English product
   nouns) and never delete a privacy caveat to tidy a layout.
