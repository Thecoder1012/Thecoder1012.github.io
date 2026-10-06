# ProgressNet website — completion checks

Checked against the supplied repository, `2610.03512v1.pdf`, and `progressivegeneration.mp4` on 6 October 2026.

## Browser interactions — 91 checks passed

Tested in Chromium 144 using real local HTTP image, script and video resources. Because top-level navigation is restricted in the build environment, the HTML was mounted with a base URL pointing to a local static server. Video seek tests used actual byte-range responses, not mocked media. No website code requires this testing arrangement.

The checks covered all 23 comparison scenes; every scene's final synchronized stage; method switching; all-method mode; discrete stage buttons, slider, play, pause and reset; the image inspector and its keyboard controls; all ten published story states; the three method tabs and keyboard operation; PCM illustrative operation controls; the six selected layer indices; all 15 dataset/metric chart combinations; all six method curves and numeric tables; all nine user-study criteria; citation-copy success or accessible fallback; actual video chapter seeking; and preservation of recording time across the clean/original-interface toggle.

No JavaScript exceptions or failed local asset responses occurred in those tests. Document overflow was checked at widths 1440, 1024, 768, 700, 430, 390, 375 and 320 pixels. The mobile navigation was checked for opening and closing. Reduced-motion behavior and static poster fallbacks were inspected.

## Data — 480 numbers matched the PDF

- 426 chart and PFC numbers were compared mechanically with the supplied PDF's Tables 1, 2 and 6.
- 54 normalized user-study numbers were compared mechanically with Table 3.
- Zero differences remained after correction.

Textual implementation details, selected layers, benchmark configuration and erasure trade-offs were cross-checked with the corresponding paper sections. Website wording distinguishes quality-adjusted PFC from pure temporal similarity and normalized study scores from participant percentages.

## Asset and package checks

The final asset pass validated 78 local links/anchors, decoded 1,036 images, checked all 966 scene/method/stage panels, verified both JSON/JavaScript data mirrors, checked JavaScript syntax, and inspected all three MP4s. The delivered archive is also checked for extraction integrity. The included paper and original profile photograph are checked byte-for-byte against the uploaded sources. The largest asset is the original paper PDF; every individual file is below GitHub's 100 MiB per-file Git limit. No `.git` directory, secrets, model weights, font files, test logs, extraction scripts or build-environment server is included.

The only intentionally empty file is `.nojekyll`.

## What has not been claimed

This is not a live deployment verification, a physical mobile-device test, or a Safari/Firefox certification. No generated research output or experimental measurement was recreated. Video compression does not imply a new model-speed benchmark. Source comparison imagery remains at the native resolution embedded in the PDF. The current GitHub account settings and any repository edits made after the supplied ZIP are outside this package's inspection scope.

Keep a backup of your current checkout, copy the archive contents into the repository root, preserve `.git` and any newer unrelated files, then commit and push. The deployment instructions are in `README.md`.
