# Arkaprabha Basu — personal site + ProgressNet

This is the complete updated contents of the supplied `Thecoder1012.github.io` repository, with an independent, fully static ProgressNet project page at `/progressnet/`. The archive is rooted at `index.html`; do not add another enclosing folder inside your repository.

**Ready to publish:** HTML, CSS, JavaScript, the paper, edited videos, and comparison images are all included. No npm install, build process, inference server, Google Drive account, API key, or external media host is required for the ProgressNet page.

## Publish

1. Back up your current repository or commit any pending work. Extract this ZIP outside the repository.
2. Copy the extracted **contents** into the root of your existing `Thecoder1012.github.io` checkout. Replace matching files. Keep the existing `.git` directory, and keep any `CNAME`, workflows, or newer files that were not included in the uploaded source ZIP.
3. Commit and push using GitHub Desktop or Git. The supplied paper is about 42 MB, which is above GitHub's 25 MiB browser-upload limit but below its 100 MiB per-file Git limit. Do not upload the ZIP itself as the site.
4. Keep the current Pages publishing configuration if it already publishes the repository root. Otherwise, in **Settings → Pages → Build and deployment**, select **Deploy from a branch**, the branch you pushed to, and **/(root)**. No custom build workflow is needed.
5. After the Pages deployment succeeds, check your homepage and `/progressnet/`. The homepage's new Project Page button already links to the project.

GitHub documentation: [publishing source](https://docs.github.com/en/pages/getting-started-with-github-pages/configuring-a-publishing-source-for-your-github-pages-site) · [file size limits](https://docs.github.com/en/repositories/working-with-files/managing-large-files/about-large-files-on-github).

This package has not been pushed to, or deployed on, your GitHub account. It updates the version of the homepage you supplied; it cannot include later changes that were not in that ZIP.

## What's included

- **Existing homepage:** its design, biography, existing publications, navigation, and profile photograph are retained. ProgressNet is added at the start of Publications with a thumbnail and project/paper/arXiv links.
- **Project page:** a custom sketchbook-inspired layout, responsive navigation, recorded hero, authors/affiliations, paper links, and citation copying.
- **Published interaction stories:** five cat states and five landscape states from Figure 1, with synchronized sketch, prompt, operation, and output views.
- **Comparison explorer:** 23 scenes, seven discrete completion stages per scene, three selectable baselines, an all-method view, play/pause, timeline scrubbing, and enlarged inspection. Each example links to its source figure/page.
- **Method explanation:** original HTML/SVG diagrams and interactive PCM, LS-KVI, and BAC explanations. BAC acts on memory conditioning; LS-KVI operates in FLUX attention. Illustrative masks are labelled as illustrative, not measured.
- **Edited video:** a 12.5-second continuous highlight; a clean sketch/output view; and the full original-interface session, with synchronized chapter navigation.
- **Evidence:** interactive charts for five metrics across three datasets, all-six-method controls, exact-value tables, quality-adjusted PFC results, normalized user-study scores, and an erasure-specific ablation.
- **Research materials:** the supplied 47-page PDF, abstract, BibTeX, acknowledgements, limitations, source provenance, and a 1200 × 630 social-sharing image.

The page is a research showcase, not an online model demo. All showcased outputs are precomputed/published or recorded. There is no fake drawing-to-image generation, no released-model-code link, and no training or inference backend.

## Files to edit later

| File | Purpose |
| --- | --- |
| `index.html` | Personal homepage and the ProgressNet publication entry. |
| `progressnet/index.html` | Project copy, headings, method diagram, video chapters, bibliography and links. |
| `progressnet/assets/css/progressnet.css` | Project design, component styles, motion, and responsive layouts. |
| `progressnet/assets/js/progressnet.js` | Interactive stories, comparison viewer, method controls, video synchronization and charts. |
| `progressnet/assets/js/content.js` | Scene names, prompts, notes, source pages and figures, loaded by the browser. |
| `progressnet/assets/js/results-data.js` | Numerical results loaded by the browser. |
| `progressnet/assets/data/*.json` | Readable mirrors of scene/results data and the asset provenance manifest. |
| `progressnet/assets/videos/` | Locally hosted MP4s and chapter tracks. |
| `progressnet/assets/paper/progressnet.pdf` | The unchanged uploaded arXiv v1 PDF. |
| `progressnet/assets/images/social-preview.jpg` | Social-sharing card. |

The two JavaScript data files are the runtime sources. If numbers or scene metadata change, update their corresponding JSON mirrors too. The project deliberately does not fetch JSON at startup so the basic site can also be opened from local files. A local static server gives a more representative video preview; video seeking requires a server that supports byte-range requests.

To add a real Code link later, replace the `Code not released` text in `progressnet/index.html` with your repository URL only after the code is public. No site redesign is needed.

## Media and scientific integrity

The comparison images were extracted from the PDF's embedded image assets, then separated into individual native-resolution panels and saved as lossless WebP. No whole paper grid or page is used as the comparison interface. Native comparison panels are 252 × 252 pixels. Enlarging them does not add source detail; the inspector says so explicitly. There are no invented intermediate stages and no AI-regenerated benchmark outputs.

The Figure 1 examples likewise use the actual published states. The method visualization is newly drawn for the web; its explanatory masks are illustrative. It is not a screenshot of the paper's methodology figure.

The source video is 71.833 seconds at 1920 × 1080 / 30 fps. `full-session.mp4` retains the full interface, timeline, and audio, encoded at 1600 × 900. `clean-session.mp4` omits the first 4.5 seconds, crops the sketch and result into equal synchronized panels, and preserves recording speed and audio. `hero.mp4` is the continuous original-time interval 59.0–71.5 seconds, similarly reframed and muted. No temporal interpolation, synthetic transition, or extra speed-up was applied. The supplied recording's playback speed is not presented as a new latency measurement.

PFC is described as a quality-adjusted composite, not a pure temporal metric. User-study values are labelled as normalized criterion-wise scores, not percentages of participants. The latency context is included; no “fastest method” claim is made. The erasure card includes the outside-region-change trade-off. Source data and processing notes are recorded in `progressnet/assets/data/provenance.json`.

## Homepage correction

The original homepage linked to `assets/CV_Arkaprabha_Basu.pdf`, but that file was absent from the supplied repository. That broken download link is now an email link to request the CV. No CV was fabricated. Restore a PDF link in the CV section after adding your actual CV file.

## Validation and scope

See `QUALITY-CHECK.md` for the browser, data, media and file-integrity checks. Browser testing was local with Chromium and desktop/mobile viewport emulation; it was not a live GitHub deployment or physical-device Safari test.

## Credits and rights

Research content, results and demonstrations: ProgressNet, Arkaprabha Basu, Chaitat Utintu and Yi-Zhe Song, arXiv:2610.03512v1 (2026), using the materials supplied by the author. Original personal-site content is retained from the supplied repository.

[FlipSketch](https://hmrishavbandy.github.io/flipsketch-web/) was the user's reference for research-page organization. The ProgressNet layout, components, CSS, SVG/HTML method visualization and interactions were built separately; the reference site's source code and result imagery were not copied.

No new license is imposed on the supplied research assets or existing website. No font files, model weights, private credentials, or inference code are bundled. The new project page has no added analytics or third-party script dependency. The personal homepage retains its pre-existing external fonts and icon stylesheet.
