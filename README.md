# Jeremy Pretty portfolio

Static personal portfolio hosted on GitHub Pages. The default appearance is Midnight navy with teal accents and an open editorial layout. Visitors can choose a softer slate light appearance; the preference stays in their browser.

## Edit and build

Requires Node.js 22 or newer. No dependency installation is needed.

- Page content lives in `src/pages/*.html`.
- `src/layout.html` owns the shared header, navigation, metadata, and footer.
- `site.css` and `site.js` provide shared presentation and progressive enhancement.
- Run `npm run build` after editing the source. Commit the generated root HTML along with the source changes.
- Run `npm run check` and `npm test` before publishing.
- Preview from the repository root with a local static server.

Both `index.html` and `Home.html` are generated from the same homepage source. Legacy sample blog routes redirect to `Blog.html`. Existing resume PDF filenames remain stable.

The site works without JavaScript: navigation, content, and resume links remain available. JavaScript adds the mobile menu and appearance preference. Fonts and images are hosted locally; there are no analytics or application APIs.

## Publishing and rollback

GitHub Pages publishes the checked-in files from `main` at `https://jpretty01.github.io/`. The validation workflow checks generated files, local links, accessible structure, resume availability, and palette contrast. The appearance change can be rolled back by reverting its commit and waiting for a successful Pages deployment.

Original image sources remain in `images/`. The optimized WebP portrait and PC gameplay image are derived from the existing authentic assets. The locally hosted Manrope font is distributed under the SIL Open Font License in `assets/fonts/OFL.txt`.
