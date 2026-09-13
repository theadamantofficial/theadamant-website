# Studio monitor playback

The monitor repeats `public/videos/adamant-logo-reveal.mp4` (10 seconds), followed by the supplied `adamant-mascot-reactions.mp4` (8 seconds). Both originals are retained at 1280 × 720, 24 fps. Direct sRGB video textures preserve their native resolution instead of redrawing them into a 960 × 540 canvas. The display plane and its backing have the same dimensions at exactly 16:9, eliminating uncovered black strips and video overhang. The final camera distance covers landscape desktop viewports, cropping excess image edges rather than leaving bands showing the desk. Portrait screens retain the complete monitor frame.

The last decoded frame of the mascot clip is saved losslessly as `adamant-mascot-reactions-final.png`. Playback holds that smiling thumbs-up reaction while the visitor zooms, and resumes the repeating video sequence when they return to the overview. Videos are muted, pause while hidden, and release their media and textures with the WebGL scene. Poster frames cover loading and playback failure.

## Background music

The persistent public-site audio player uses the user-supplied MP3, copied unchanged to `public/audio/here-comes-the-sun.mp3`. It is enabled by default without additional environment configuration. To override the recording or title, set:

```
NEXT_PUBLIC_BACKGROUND_MUSIC_URL=/audio/here-comes-the-sun.mp3
NEXT_PUBLIC_BACKGROUND_MUSIC_TITLE=The Beatles · Here Comes the Sun (2019 Mix)
```

The player starts at 70% volume on the first user interaction, loops, persists through public page navigation, pauses in hidden tabs, and respects the saved mute preference. Browsers block audible autoplay before a user interaction. Admin screens and the isolated tear preview are excluded.
