# OneStop

Muhsin Gigani, Pavitra Rajpal and Hatim Sampalwala. Three lines, one stop.

| Folder | What it is |
| --- | --- |
| `onestop-site/` | The combined portfolio website (three.js + GSAP) |
| `onestop/` | The 30-second motion film, built in Remotion, with its own soundtrack |

## Website

Double-click **`Start website.bat`**, or run:

```
cd onestop-site
python build.py
python -m http.server 5173 --directory dist
```

Then open http://localhost:5173.

- Edit the sources in `onestop-site/src/` (`page.html`, `style.css`, `app.js`, `scene.js`), then run `python build.py`.
- `bits.js` / `bits.css` hold the React Bits components ported to plain JS (StaggeredMenu, SplitFlapText, ProfileCard, Counter, CircularText, StarBorder, ClickSpark), credited to reactbits.dev.
- `onestop-site/dist/` is a complete static site. Drag it into Vercel (or any static host) to put it online.
- `onestop-site/site/index.html` is the version published as the claude.ai artifact.
- Logos are in `onestop-site/assets/logos/`. Amigo Cars, Mexibay and Fulus still show text badges; drop their logo files in and swap the badges in `page.html`.

## Film

The finished film is `onestop/out/OneStop_final.mp4` (1920×1080, 60 fps, 30 s).

```
cd onestop
npm install
npm run dev                         # Remotion Studio at http://localhost:3000
python scripts/synth.py             # regenerate the soundtrack
npx remotion render OneStop out/OneStop.mp4 --crf 17 --audio-bitrate 320k
```

Copy lives in `onestop/src/data.ts`; timing in `onestop/src/timeline.ts`.
