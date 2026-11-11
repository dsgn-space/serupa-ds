---
'serupa-ds': patch
---

Inter Fallback: each bold and italic face's `local()` list now also names the font by its PostScript name (Arial-BoldMT, Helvetica-Oblique, LiberationSans-BoldItalic and so on), which Safari matches on macOS, and then by its bare family name, which WebKit on Linux matches through fontconfig. Until Inter loaded, WebKit drew bold and italic text in another font, 7 to 10% wider, so the text moved when Inter arrived.
