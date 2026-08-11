# Palette: "Porcelain & Sage"

Replaces the cool blue-grey ledger + proof-red. Calmer: warm near-white ground instead of
cold grey; a muted sage-green accent instead of alarm red. Elegant, low-tension, still
serious. Type pairing (Spectral / Archivo / Martian Mono) unchanged — it suits warm neutrals
even better than the cool set.

All ratios computed (WCAG):

```css
@theme {
  --color-paper:        #FAF9F7;  /* warm porcelain ground                    */
  --color-paper-raised: #F1EFEB;  /* plates, zebra                            */
  --color-ink:          #1C1B1A;  /* 16.34:1 AAA                              */
  --color-ink-muted:    #5C5955;  /*  6.62:1 AA+                              */
  --color-rule:         #8A867F;  /*  3.44:1 structural rules (non-text)      */
  --color-hairline:     #DDD9D3;  /* decorative only                          */
  --color-accent:       #4A6B5D;  /*  5.62:1 AA — muted sage                  */
  --color-accent-quiet: #E4EAE6;  /* wash, backgrounds only                   */
}

@media (prefers-color-scheme: dark) {
  @theme {
    --color-paper:        #141413;
    --color-paper-raised: #1D1D1B;
    --color-ink:          #EDEBE8;  /* 15.49:1 */
    --color-ink-muted:    #A8A49E;  /*  7.43:1 */
    --color-rule:         #57544F;
    --color-hairline:     #2A2927;
    --color-accent:       #7FA893;  /*  6.96:1 */
    --color-accent-quiet: #20261F;
  }
}
```

Accent roles unchanged (errata marker, production glyph, focus/basis markers) — sage reads
as "verified/live" rather than red's "error", which fits those roles better anyway.
