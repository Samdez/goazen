# Client-side image compression for the event submission form

Vercel serverless functions enforce a **4.5MB hard cap on request bodies** that overrides Next.js's `serverActions.bodySizeLimit`. The event submission form sends image uploads through a server action, so any image larger than ~4MB is rejected by Vercel's edge proxy with `FUNCTION_PAYLOAD_TOO_LARGE` before our code runs. The collection's schema comment claimed "20mb max" but nothing enforced it.

We resize and recompress images **in the browser** before submission, using `browser-image-compression` (~12KB gzipped) with lazy-loaded `heic2any` (~600KB, dynamically imported only when a HEIC file is detected) for iPhone-exported files on Chrome/Firefox. Target: max 2000px on the long edge, output WebP. This keeps every upload comfortably under the 4.5MB platform cap and gives us enough headroom for retina-grade Payload variants.

In the same change, the [Medias collection](../../src/collections/Medias.ts) is updated to match: the unused `thumbnail` variant is removed, `eventCard` is bumped to 1280×800 (16:10, matching the new `EventCard`'s `aspect-[16/10]` container), a new `hero` variant at 1920×1200 is added for `TonightHeroCard`, and `resizeOptions: { width: 1920 }` caps the stored original.

## Considered options

- **Presigned-S3 direct upload.** Rejected: significantly more complexity (extra route handler, two-phase submit, abandoned-upload handling) for no quality gain — the largest variant we ever render is 1920×1200.
- **Reject heavy uploads with a friendly error.** Rejected: the user base is heavily iPhone-on-mobile and has no easy path to manual resize. Friction-free submission was prioritized over implementation simplicity.

## Consequences

- The original-resolution file is never stored. The "original" in S3 is the client-resized WebP, further capped server-side at 1920px wide by `resizeOptions`.
- HEIC support depends on a dynamically-loaded WASM polyfill; the first HEIC upload in a session pays a one-time ~600KB download cost.
- Changing `imageSizes` affects new uploads only. Existing media keeps its old 640×360 `eventCard` variant and has no `hero` variant — the homepage hero gracefully falls back to the original `url` via the existing chain in [TonightHeroCard](../../src/app/(app)/components/TonightHeroCard.tsx). Quality on old media is unchanged; new uploads progressively improve the homepage as curators replace images.
- The event detail page ([slug]/page.tsx) still references the original `url` at a hardcoded 640×640. Out of scope here but flagged — that page would benefit from its own variant or a separate fix.
