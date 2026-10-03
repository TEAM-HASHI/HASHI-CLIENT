# MapPage

Jira: HASHI-215. Status: implementation in progress, sample-data publishing only.

## Purpose / Route

- `/map` (`ROUTES.map`), public, lazy page under BottomNavigationLayout. No new guard, redirect or query parameter.
- Inspect Tokyo sample restaurants using area markers, category/search filters, a draggable list and selected restaurant details.
- Figma: https://www.figma.com/design/UHaom01PvoRx2wRCYa1kS1/Hashi.kr?node-id=8317-32364.

## Data Dependencies

- Local, explicitly labelled preview data and Figma background assets. No map SDK, geolocation, network search, map bounding-box query, save or reservation mutation.
- Area labels in Figma include neighborhoods (우에노, 아사쿠사, 긴자), not only administrative wards. Sample areaCode is a local identifier, NOT a Japanese ward code.
- Marker positions are presentation coordinates, NOT real restaurant latitudes/longitudes. Counts derive from preview data.
- Saved-list/save/reservation actions show the existing ComingSoonDialog. They do not navigate using fake restaurant ids or show successful saving.

## Requirements / State

- First view: search, 전체/음식점/주점/카페, area markers, floating saved action, ranked recommendations.
- Area click switches to a static zoomed street preview and filters sample restaurants. A reset action returns to all areas. Category and submitted keyword apply together. Sort: recommended, rating, reviews, deterministic recommendation tie-break.
- Search draft is separate from submitted keyword; empty results provide reset. Filter changes clear selected restaurant. Same selected category toggles to all.
- Local state: draft, applied keyword/category/area/sort, selected restaurant id, panel stage, photo index, coming-soon dialog. No URL or server state is introduced.
- List collapse/expand preserves scroll. Changes to keyword/category/area/sort reset list scroll. Selecting a restaurant keeps the list mounted; closing details restores the previous list and conditions.
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
- Expanded restaurant detail fills the mobile frame above the bottom action and covers the underlying navigation. The background/list is inert while this full-screen detail is visible; close restores it. DragPanel footer owns reserve action; no nested vertical scroller.
- Title sticky top=0, tab row sticky below title in DragPanel scroll body. No internal DOM query, HDS scroll override or page-window scroll handler.
- Small viewport heights clamp normal/max stages. Touch drag only starts on the handle; ordinary content gestures scroll the body.

## Component Mapping / Public API

- HDS DragPanel (HASHI-214), SearchBar, Chip, IconButton, Button, Thumbnail, Tabs, Carousel.
- Reuse HDS icons and app ComingSoonDialog. RestaurantDetailTemplate is not used because it owns window scrolling and photo API queries.
- Page-local toolbar, map preview, cards, list, detail and photo viewer; no new package public API.
- Static Figma map/pin assets live under shared/assets/images/map; restaurant images are props on preview records.

## Verification

- Test filter intersection, sorting/ties, immutable data, empty/reset, selection/close, keyboard panel stages, photo modal, unavailable action feedback and direct public route.
- Client lint/typecheck/full tests/build; DragPanel regression tests; diff check.
- Browser QA: 320/393/768px, 11 Figma states, long title, thumbnail fallback, background and handle interaction, list scroll preservation/reset, sticky title/tabs, focus and reduced viewport.
- Actual map pan/zoom, API correctness and on-device keyboard behavior are not claimed by static preview tests.
