# Version History

## V2.0

- Status: `Current`
- Date: `2026-05-30`
- Label: `Delivery Stabilization And Commerce Card Refinement`

- Fixed GitHub Pages asset delivery so the online build resolves media correctly under the repository base path instead of falling back to the domain root
- Added stronger homepage video playback fallback behavior for GitHub Pages and mobile browsers by retrying autoplay when the page becomes visible, focused, or first receives touch input
- Added a separate local delivery build path and supporting files so the demo can still be handed off locally without changing the default online deployment flow
- Improved mobile safe-area and keyboard behavior in chat, removed the extra in-page red send button, and kept the business-chat input aligned with the system keyboard send flow
- Restyled the shared hotel and dining location cards toward a more message-native three-image layout, and replaced the duplicated dining preview image with the new `public/media/dining.jpg`
- Fixed the hotel and restaurant detail-page top action buttons so they stay pinned while the hero image and page content scroll underneath

### Notes

- This version is the current documented release for online delivery, local handoff, mobile adaptation, and the latest shared-card/detail-page fidelity pass
- The homepage video issue on GitHub Pages is now recorded as part of the release scope together with the media base-path fix and autoplay fallback improvements
- The older hotel-and-restaurant detail milestone is intentionally preserved below as `V1.6` for future reuse

### Next Phase Candidates

- Re-encode the homepage feed video if a specific browser or device still blocks playback after the current autoplay fallback behavior
- Continue tightening the new message-card composition against the latest target reference if more restaurant imagery or exact UI references are provided
- Add a formal tag or release snapshot if you want one-click rollback between `V1.6` and `V2.0`

## V1.6

- Status: `Superseded`
- Date: `2026-05-29`
- Label: `TT Hotel And Restaurant Detail Completion`

- Completed the TT-native hotel detail experience, including the final UI polish pass and the required `Share`, `Favorite`, and `Book` interaction behavior
- Reworked the in-chat hotel card cover to use `public/media/room.jpg` and aligned the card metadata with the latest hotel-detail content direction
- Added a static hotel booking screen for the `Book` CTA with top-level back navigation to the hotel detail page
- Rebuilt the restaurant detail experience to follow the provided TT-native product-detail structure instead of the earlier simplified Expedia-style layout
- Mapped Expedia restaurant information into TT-style sections, using `public/media/food.jpg` as the restaurant detail hero image
- Updated the restaurant detail price band, CTA treatment, and map badge styling to better match the provided TT reference

### Notes

- This version is preserved as the reusable milestone before the later delivery, Pages, mobile, and message-card refinements
- The hotel detail page now includes its intended TT-style UI plus the required sharing, favorite, and booking navigation behavior
- The restaurant detail page now uses the TT-native product-detail structure with Expedia-sourced content and assets
- The hotel booking destination remains a static visual page with no further interaction, per the current requirement

### Next Phase Candidates

- Add the remaining restaurant-detail interactions if the page needs to match the hotel-detail interaction completeness
- Tighten any remaining restaurant-detail spacing or visual fidelity against the target TT screenshots
- Decide whether the static booking page should later evolve into a fuller OTA booking funnel

## V1.5

- Status: `Superseded`
- Date: `2026-05-29`
- Label: `TT Hotel Detail Completion`

### Notes

- This version captured the hotel-detail milestone before the restaurant-detail TT rebuild

## V1.3

- Status: `Superseded`
- Date: `2026-05-29`
- Label: `Commerce Card Fidelity Pass`

### Scope

- Continued the TikTok Go-style commerce message iteration inside the existing Expedia business chat without changing the chat shell
- Reworked the in-chat hotel and restaurant cards to follow the provided Instagram-style reference more closely
- Replaced earlier placeholder-style card art with real hotel and restaurant photography aligned to the latest provided content direction
- Updated the commerce metadata to match the latest supplied references, including hotel location / amenity details and restaurant review / cancellation copy
- Improved vertical alignment across both cards so image area, rating block, and CTA baseline now stay visually consistent
- Kept the existing clickable flow into hotel detail, restaurant shelf, and restaurant deal detail screens

### Notes

- This version becomes the new documented baseline for the commerce-message fidelity pass
- A dedicated iteration record for this version is stored in `docs/v1.3-iteration-notes.md`
- The current focus of `V1.3` is card quality, asset quality, spacing, hierarchy, and alignment rather than new interaction branches

### Next Phase Candidates

- Continue 1:1 visual tightening against the target reference for card spacing, typography, and button treatment
- Replace the current selected local photos with final source images if exact production assets are provided
- Apply the same fidelity pass to the hotel detail, restaurant shelf, and restaurant detail screens

## V1.2

- Status: `Superseded`
- Date: `2026-05-29`
- Label: `TikTok Go Commerce Message Expansion`

### Scope

- Started a new TikTok Go-inspired commerce flow inside the existing `Expedia` business chat without changing the current chat shell
- Added a new `commerce-group` message model so Expedia can send one hotel card and one restaurant card in the same business message after the fixed itinerary copy
- Wired the fixed Expedia feed-share script to append the new commerce message after the travel brief and itinerary sequence
- Added first-pass Oahu / Waikiki themed local card assets for the hotel and restaurant recommendations
- Added first-pass click-through screens for hotel detail, restaurant shelf, and restaurant deal detail flows with back navigation to the conversation experience

### Notes

- This entry records the current development baseline for the TikTok Go-style commerce expansion
- The current implementation covers the in-chat cards plus the first clickable destination and offer pages
- The next round should focus on visual fidelity polish against the provided references rather than new routing primitives

### Next Phase Candidates

- Refine visual fidelity, spacing, and motion details against the provided TikTok Go screenshots
- Replace the first-pass local illustration assets with final destination imagery if better source material is provided
- Expand the commerce flow with more realistic metadata, shelf modules, and CTA treatments once the target UI is locked

## V1.1

- Status: `Current`
- Date: `2026-05-28`
- Label: `AI Context And Jurassic Script Refresh`

### Scope

- Added frontend DeepSeek integration through `VITE_DEEPSEEK_*` environment variables without hardcoding secrets
- Kept Expedia welcome messaging fixed while moving later freeform replies onto AI with recent message history as context
- Added AI persona prompts for friend chats so `timhuang0630` and `Mia Park` stay conversational and human
- Updated Expedia logic so the welcome message appears only once per conversation
- Refined repeated share behavior so the first share of the current video uses the fixed script and later shares of the same video switch to AI while staying on the same destination
- Replaced the fixed Expedia destination copy with the new `Jurassic Adventure` travel brief and itinerary for `Kualoa Ranch / Oahu`
- Added `.env.example` and updated deployment documentation for Tencent Cloud static hosting

### Notes

- This version is the current handoff baseline after AI-assisted chat behavior and scripted destination copy were aligned
- The Expedia scripted flow still takes priority on the first qualifying feed-share event before AI takes over later conversation turns
- Environment variables are required in deployment if AI replies should be enabled online

### Next Phase Candidates

- Improve auto-scroll and typing rhythm to feel closer to native chat behavior
- Expand destination handling so different feed videos can map to different fixed script packages
- Consider a server-side proxy if AI key handling needs to move beyond demo-grade frontend access

## V1.0

- Status: `Baseline`
- Date: `2026-05-28`
- Label: `TT Expedia Demo Baseline`

### Scope

- Replaced the feed poster flow with an autoplay looping travel video
- Updated feed content, share flow, inbox, friends, profile, and chat screens toward the latest TT-style demo baseline
- Added half-screen conversation preview with direct message input
- Refined Expedia business chat behavior, including welcome messaging, travel brief sequencing, and guided freeform replies
- Improved long-form Expedia message readability with larger type, spacing, and paragraph grouping
- Unified shared-video cards across chats to use the real first frame of `feed-video.mp4`
- Updated Expedia identity to use the `Expedia` display name and support a local avatar asset at `public/media/expedia-avatar.png`
- Fixed inbox title color consistency and removed extra inbox shortcuts that were no longer part of the target baseline

### Notes

- This version is the current documentation baseline for future iterations
- Version recording is documented in this file only and does not create a git snapshot
- If we need true one-click rollback later, we should create a dedicated git tag or commit after the repository scope is clarified

### Next Phase Candidates

- Continue refining TT-native spacing, iconography, and motion details
- Improve Expedia scripted flows and typing rhythm for more realistic business chat behavior
- Add a formal project snapshot strategy after repository boundaries are confirmed

## V0.1

- Status: `Draft`
- Date: `2026-05-27`
- Label: `Initial iOS Web Demo`

### Scope

- Built the first TT-style iOS web demo shell
- Implemented an English-only feed home screen with a static travel poster
- Implemented like interaction on the feed screen
- Implemented `Send to` share sheet with recipient picker and quick message input
- Implemented `Inbox` page and conversation list
- Implemented chat thread with user messages and automated replies
- Added differentiated reply logic for `Expedia` and friend accounts
- Added structured Expedia travel plan content inside chat
- Added page-level spec documentation for components, state changes, and exact copy

### Notes

- This version is the baseline draft for future content and interaction refinement
- The feed currently uses a static image instead of a looping video
- Visuals are high-fidelity TT-style references for demo purposes, not a final production build

### Next Phase Candidates

- Replace the static poster with a 10-20 second looping travel video
- Refine the Expedia response cards to better match the target reference
- Add half-screen preview transitions
- Expand motion details and content richness
