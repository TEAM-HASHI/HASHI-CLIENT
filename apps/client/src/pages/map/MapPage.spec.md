# MapPage

Jira: HASHI-215. Status: Google Maps JavaScript SDK integrated; restaurant data/coordinates remain explicitly labelled samples. Restaurant API integration is deferred.

## Purpose / Route

- `/map` (`ROUTES.map`), public, lazy page under BottomNavigationLayout. No new guard, redirect or query parameter.
- Inspect Tokyo sample restaurants using area markers, category/search filters, a draggable list and selected restaurant details.
- Figma: https://www.figma.com/design/UHaom01PvoRx2wRCYa1kS1/Hashi.kr?node-id=8317-32364.
- Marker components: `8317:38190`; shared map shadow: `8317:40821`; map CTA states: `8317:40775` in the same file. Collection covers, collection pins and collection selection controls are outside this page's scope.

## Data Dependencies

- Google Maps via @vis.gl/react-google-maps, using VITE_GOOGLE_MAPS_API_KEY and VITE_GOOGLE_MAPS_MAP_ID. No keys in source. Missing configuration, SDK/network timeout and authentication failure show a retry action (page reload, because SDK initialization is singleton).
- Local, explicitly labelled sample restaurants. No geolocation, Places search, backend bounding-box query, save or reservation mutation.
- Area labels in Figma include neighborhoods (우에노, 아사쿠사, 긴자), not only administrative wards. Sample areaCode is a local identifier, NOT a Japanese ward code.
- Markers use latitude/longitude on the real map, but these sample coordinates are NOT verified restaurant locations. Counts derive from sample data. Regional summaries are not an automatic clustering algorithm.
- Saved-list/save/reservation actions show the existing ComingSoonDialog. They do not navigate using fake restaurant ids or show successful saving.

## Requirements / State

- First view: search, 전체/음식점/주점/카페, area markers, floating saved action, ranked recommendations.
- Overview and exploration are explicit states, independent of panel height. After choosing an area/category/search or restaurant, only individual category pins remain until an explicit reset. No automatic marker clustering.
- Direct user zoom to level 14 or above also enters exploration after camera movement settles. Zooming back out keeps individual pins and existing search conditions/results; only explicit reset restores area markers. Initial fitting and automatic camera moves do not trigger this transition. This display change does not query or filter restaurants.
- The fitted initial camera zoom is the minimum zoom. Region labels reserve non-overlapping screen space without changing geographic anchors; displaced labels have a connector to the original anchor.
- A restaurant/region selected before SDK readiness waits for the initial fit to finish, so its detail zoom cannot become the minimum. Zoom-out remains available to the initial overview level after selection.
- `현 지도에서 검색` keeps the existing provisional button design. It appears after user map movement, not initial fitting, region selection or selected-restaurant centering.
- Area click centers/zooms the real map and filters sample restaurants. A reset action fits all sample regions. Category and submitted keyword apply together. Sort: recommended, rating, reviews, deterministic recommendation tie-break.
- Search draft is separate from submitted keyword; empty results provide reset. Filter changes clear selected restaurant. Same selected category toggles to all.
- Local state: draft, applied keyword/category/area/sort, selected restaurant id, panel stage, photo index, coming-soon dialog. No URL or server state is introduced.
- List collapse/expand preserves scroll. Changes to keyword/category/area/sort reset list scroll. Selecting a restaurant keeps the list mounted; closing details restores the previous list and conditions.
- An expanded list exposes `지도로 보기` in the panel footer. It collapses the list to the handle without resetting conditions or scroll; focus returns to the handle. It is not shown in normal/collapsed or restaurant-detail states.
- `지도로 보기` only collapses the list. Moving/zooming the map exposes `현 지도에서 검색`; only clicking it applies the latest idle bounds to the sample list. It clears the prior area filter/selection but preserves keyword/category/sort. No map reload or backend request is needed for this local filter. Empty results retain the map and offer reset.
- Selecting a marker/card opens restaurant summary. Expanding shows information/menu/photo/review tabs, sticky title and tabs, and bottom reserve action. Unavailable menu/review data is described as preview/unconnected, not as a real server result.
- Photo selection opens a modal carousel; Escape/close restores focus to the source thumbnail. Background is inert while photo modal is open.
- Long titles truncate to one line with the full accessible name. Thumbnail failure uses HDS fallback.

## Layout Contract

- Frame: 393×852. OS status bar is not drawn. Top content uses safe-area + 12px.
- Figma first list: 396px including 84px navigation → DragPanel normalHeight=312.
- Category list: 388−84=304px; selected summary: 378−84=294px.
- General expanded list: 794−84=710px at the design viewport; adapt to viewport excluding safe-area/status region, leaving 12px top spacing.
- Filtered expanded list leaves search and chips visible: Figma top=170 (45px OS bar + 125px content).
- Collapsed: DragPanel's 30px handle. App owns normal/max heights and the container excluding bottom nav (84px + safe-area).
- On short screens, the normal list shrinks to reserve 400px for the map where possible. Overview can shrink to the 30px handle; exploration retains at least 156px for the result heading/card where space permits. Users can expand the list. This avoids fitting all regions into the tiny space left between search and sheet.
- Markers share the original restaurant/cafe/bar SVG glyphs: 20px normal / 31px selected circles with per-category optical offsets. Selected labels use Caption 1 title and Caption 2 rating with a 12px star. Normal shadows are rendered in CSS, not baked into images. Both states retain at least 44px hit areas.
- Search, category chips, selected marker and floating actions use `0 0 4px rgba(0,0,0,.2)` per the shared shadow note; the region silhouette retains equivalent CSS drop-shadow (2px standard deviation). The CTA retains its separate 4px Y-offset shadow, 44px height, 24px icon and Body 6 text.
- Expanded restaurant detail fills the mobile frame above the bottom action and covers the underlying navigation. The background/list is inert while this full-screen detail is visible; close restores it. DragPanel footer owns reserve action; no nested vertical scroller.
- Title sticky top=0, tab row sticky below title in DragPanel scroll body. No internal DOM query, HDS scroll override or page-window scroll handler.
- Small viewport heights clamp normal/max stages. Touch drag only starts on the handle; ordinary content gestures scroll the body.

## Component Mapping / Public API

- HDS DragPanel (HASHI-214), Dialog, SearchBar, Chip, IconButton, Button, Thumbnail, Tabs, Carousel.
- Normal panels stay nonmodal. Expanded details and photos use HDS Dialog for focus containment and background isolation.
- Reuse HDS icons and app ComingSoonDialog. RestaurantDetailTemplate is not used because it owns window scrolling and photo API queries.
- Page-local toolbar, map preview, cards, list, detail and photo viewer; no new package public API.
- Sample photos live under shared/assets/images/map/preview. Static map backgrounds are no longer rendered. Restaurant images are props on preview records. Marker glyphs, the CTA icon and area tail are imported from @hashi/hds-icons.

## File Responsibilities

- `MapPage.tsx`: composes toolbar, viewport, list/detail panels and dialogs.
- `hooks/useMapPreviewState.ts`: owns preview input/selection state and supplies restaurant and area data.
- `data/mapPreviewRestaurants.ts`: explicitly temporary sample restaurants/areas; UI components do not import it directly.
- `utils/filterMapRestaurants.ts`, `utils/getMapAreaMarkers.ts`: pure filtering/sorting and area counts. Counts represent all supplied sample restaurants, independently of the active filters.
- `utils/layoutMapAreaLabels.ts`: screen-space region label offsets using map zoom; never changes geographic anchors.
- `components/MapViewport.tsx`: SDK provider, loading/failure state, geographic markers and explicit viewport search. Google attribution stays above the sheet because map height excludes the panel.
- `hooks/useGoogleMapCamera.ts`: initial/reset overview, area selection and selected restaurant camera movement without recreating the map on filter/panel changes.
- `components/MapAreaMarker.tsx`, `components/MapRestaurantMarker.tsx`: area and restaurant selection UI.
- `components/MapRestaurantMeta.tsx`, `components/MapRestaurantImages.tsx`, `components/MapSaveAction.tsx`: page-local parts shared by cards and details. Details do not import parts through the card module.
- `@hashi/hds-icons` exports RestaurantMarkerIcon, CafeMarkerIcon, BarMarkerIcon, MapViewIcon and MapPinTailIcon: original reusable vector artwork only. The app supplies size/color/disabled styling; routing, selection and sample data remain page-local.

## Verification

- Test filter intersection, sorting/ties, immutable data, empty/reset, selection/close, keyboard panel stages, photo modal, unavailable action feedback and direct public route.
- Client lint/typecheck/full tests/build; DragPanel regression tests; diff check.
- Browser QA: 320/393/768px, 11 Figma states, long title, thumbnail fallback, background and handle interaction, list scroll preservation/reset, sticky title/tabs, focus and reduced viewport.
- Unit tests isolate the external SDK and verify bounds filtering, state transitions and failure states. Live browser validation depends on API enablement/billing/referrer restrictions. Backend correctness and on-device keyboard behavior are not covered.
