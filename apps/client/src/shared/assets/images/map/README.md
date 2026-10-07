# Map assets and icon sources

- Source: [HASHI 지도 디자인](https://www.figma.com/design/UHaom01PvoRx2wRCYa1kS1/Hashi.kr?node-id=8317-32364).
- Overview: 8317:33067. Street background / selected restaurant images: 8317:32935. List food images: 8317:33362.
- `preview/`: temporary map backgrounds and sample restaurant photos, converted to WebP (quality 90, original dimensions). No full-screen design screenshot is embedded as UI.
- All map glyphs, including the area marker tail, are imported from `@hashi/hds-icons`: RestaurantMarkerIcon, CafeMarkerIcon, BarMarkerIcon, MapViewIcon and MapPinTailIcon. No page-local icon folder or marker asset copies remain.
- HDS stores original SVG inputs in `packages/hds-icons/src/rawIcons/` and generated React components in `src/icons/`. Normal/selected states share one glyph per category; the app's `MapRestaurantMarker` owns the circle, shadow, label and rating.
- Original marker nodes: 7672:45501 (bar), 7672:45502 (cafe), 7672:45503 (restaurant). Selected nodes: 8317:38213 (restaurant), 8317:38231 (cafe), 8317:38247 (bar).
- Glyph source groups: 8317:38215 / Frame 2131329717 (restaurant), 8317:38233 / Frame 2131329735 (cafe), 8317:38249 / Frame 2131329676 (bar). Export SVG through Figma, extract the named inner group (exports also include ancestor artwork), preserve its paths/transforms, remove unused IDs, and convert with `pnpm --filter @hashi/hds-icons gen:icons`. The accent uses currentColor; the app supplies primary-400 and keeps white paths.
- The glyph viewBox is 22×22. Circle diameters are 20px normal / 31px selected. Per-category optical offsets and normal scaling follow the Figma nodes, rather than uniformly centering/scaling all glyphs. SVG max-width is unrestricted so the 20px parent does not squeeze the 22px viewBox before scaling.
- Map CTA source: 8317:40775, 24×24. MapViewIcon shares the original paths; the app supplies enabled fill/stroke secondary-200/primary-100 and disabled warm-gray-300. There are no separate state asset copies or disabled business logic in HDS.
- MapPinTailIcon preserves the original 8×5 silhouette; the app supplies its size and white color.
- Collection assets are not imported. HDS contains reusable artwork only, without restaurant records, selection behavior, routes or map SDK dependencies.
- These backgrounds are static publishing previews, not a map SDK or an authoritative representation of restaurant coordinates. Replace with the actual map integration in a follow-up ticket.
