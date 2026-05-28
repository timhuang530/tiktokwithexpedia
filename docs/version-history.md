# Version History

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
