# Mascot cutouts

The homepage uses the eight expressions supplied in `adamant_mascot_transparent_pack`, rather than mapping them to two studio images. The supplied PNG alpha masks removed white trainers and logo details. The replacement cutouts restore those areas and retain each expression and pose.

## Delivered assets

All files are in `public/images/adamant-mascot/`, at 1122 × 1402 pixels, exported as WebP with quality 95 and alpha quality 100. `SectionCharacter` requests Next.js image quality 90 and separate responsive sizes for section headings and the larger contact mascot.

| File | Placement |
| --- | --- |
| `champion-cutout.webp` | Partner proof |
| `thumbs-up-cutout.webp` | Company credentials |
| `looking-back-cutout.webp` | Value propositions |
| `idea-cutout.webp` | Services |
| `walking-tablet-cutout.webp` | Process |
| `thinking-cutout.webp` | FAQ |
| `phone-wave-cutout.webp` | Contact form |
| `waving-cutout.webp` | Footer |

The system section retains the separate creative studio guide. The game uses the existing full-resolution `adamant-avatar/walking.png`, articulated into independently animated legs with SVG clips. Its stride runs while movement is active and pauses when stopped or offscreen; reduced motion disables it. The completed journey uses the champion expression. Original supplied and previous website assets are preserved.

## Image generation

Mode: built-in `image_gen` editing, using each supplied PNG as the edit target. The final cutouts were visually inspected and checked for real alpha transparency before format conversion. Intermediate images with backgrounds were rejected.

The repair prompt was applied individually to `thinking`, `walking tablet`, `champion`, `phone wave`, `thumbs up`, `waving`, `looking back`, and `idea`:

> Repair this existing supplied Adamant mascot [expression] image for use as a high-quality website cutout. Preserve this exact character identity, facial expression, pose, composition, body proportions, teal cap and hoodie, dark trousers, complete white trainers, logo markings, and any held objects or floating idea marks. Do not redesign the character. The input transparency mask is defective and removes white trainers and white logo details: restore the COMPLETE opaque character including both entire white shoes and every white logo. Deliver one single full-body mascot, entirely visible with modest padding, high detail crisp smooth edges. Make only the background genuinely transparent (RGBA alpha), with no gray backdrop, no checkerboard printed into pixels, no floor, no shadow outside the silhouette, no rectangular patch, no missing shoe areas. Preserve clean natural 3D illustrated shading and original colors. Portrait canvas approximately 4:5. This is one individual repaired asset, never a contact sheet.

The final transparency pass for thinking, walking tablet, waving, and looking back used:

> Remove the background from this image. Transparent background. Keep the mascot unchanged, including both complete white shoes. Export RGBA PNG.
