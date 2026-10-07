# Publish-package validation — 7 October 2026

## Checks performed on this package

- All 132 project-local file references resolve, with matching filename case.
- All 63 project images decode and all declared intrinsic image sizes match.
- All 23 full supplementary comparison sequences are present.
- All three MP4s match the final approved SketchX sound-update package byte-for-byte.
- FFmpeg decoded all three MP4s completely without reporting an error.
- Both methodology videos are 157.5 seconds long; the demo is 71.333333 seconds.
- Each MP4 contains an audio track. The demo is not forced to start muted;
  neither player autoplays. Website labels now show the branded durations.
- CSS, JavaScript, comparison images, posters, paper, and the page layout are
  preserved from the approved v3 project package.
- The homepage was checked against the live repository's Git blob
  `96b3b327c6dfb9ea6dc83d0095c684f1c38e7297`. The uploaded original homepage
  matches it byte-for-byte. Exactly one ProgressNet publication entry was
  inserted; all original homepage content and styling is otherwise preserved.
- The existing profile photo matches its repository Git blob exactly.

## Scope and limitations

No commit or push was performed by ChatGPT. The repository was read through the
connected GitHub integration, but available actions did not include repository
writes. The separate terminal could not resolve/connect to GitHub.

This is an offline publish-ready package, not proof of a new live deployment.
This turn reran filesystem, checksum, image, and full media-decoding checks;
it did not rerun browser interaction tests or cross-browser device tests.
Previously approved v3 browser test records apply to the preserved layout and
scripts. Existing unrelated homepage links were not rewritten.
