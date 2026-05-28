# TT Expedia Demo Page Spec

## Scope

- Platform: `Web`
- Form factor: `iOS-style mobile frame`
- Language: `English only`
- Phase: `Static image feed + messaging flow`

## Screen 1: Feed

### Components

- `StatusBar`
- `TopCategoryTabs`
- `HeroPosterImage`
- `FeedTitle`
- `RightActionRail`
- `CreatorMeta`
- `SearchPill`
- `BottomTabBar`

### States

- Default state
  - Poster image is visible
  - `Recommended` tab is active
  - Like button is idle
- Like selected
  - Heart turns accent red
- Share sheet open
  - Bottom sheet slides up above the feed

### Exact Copy

- Tabs
  - `LIVE`
  - `STEM`
  - `Explore`
  - `Local`
  - `Following`
  - `Shop`
  - `Recommended`
- Feed title
  - `Neon nights above the river in Chongqing`
- Creator
  - `Travel Atlas`
  - `Verified`
- Caption
  - `A city that feels like science fiction after dark. #chongqing #travelinspo #citylights`
- Search pill
  - `Search: best view in Chongqing`
- Bottom navigation
  - `Home`
  - `Friends`
  - `Inbox`
  - `Profile`

## Screen 2: Share Sheet

### Components

- `SheetHandle`
- `SheetHeader`
- `RecipientPicker`
- `MessageTextarea`
- `QuickMessageChips`
- `PrimarySendButton`

### States

- Closed
- Open with Expedia selected
- Open with friend selected
- Quick chip selected
- Ready to send

### Exact Copy

- Sheet title
  - `Send to`
- Message placeholder
  - `Add a message...`
- Quick chips
  - `How do I get here?`
  - `Plan this trip for me`
  - `Show me flights and hotels`
- Button
  - `Send`
- Default Expedia draft
  - `Can you help me plan a trip here?`
- Default friend draft
  - `Would you go here?`

## Screen 3: Inbox

### Components

- `InboxHeader`
- `DiscoveryCard`
- `ConversationList`
- `ConversationRow`
- `BottomTabBar`

### States

- Default inbox
- Conversation in `Sending...`
- Conversation in `Preparing your travel plan...`
- Conversation ready with updated subtitle

### Exact Copy

- Page title
  - `Inbox`
- Discovery card
  - `Start a chat`
  - `Find friends or message a brand`
  - `Find`
- Expedia subtitle variants
  - `Travel planning and booking`
  - `Sending...`
  - `Preparing your travel plan...`
  - `Travel plan ready`
- Alex subtitle variants
  - `Always up for a trip`
  - `Sending...`
  - `Typing...`
- Mia subtitle variants
  - `Weekend planner`
  - `Sending...`
  - `Typing...`

## Screen 4: Chat Thread

### Components

- `ChatHeader`
- `SharedDestinationCard`
- `TextBubble`
- `TypingIndicator`
- `TravelPlanCard`
- `Composer`

### States

- Empty chat
- Shared video only
- Shared video + user text
- Recipient typing
- Expedia plan returned
- Friend reply returned

### Exact Copy

- Empty state
  - `Share the video from the feed to start this conversation.`
- Composer placeholder
  - `Message...`
- Shared card label
  - `Shared destination`
- Shared card title
  - `Chongqing, China`
- Shared card description
  - `A city that feels like science fiction after dark.`
- Expedia header labels
  - `Expedia`
  - `Business chat`
- Friend header labels
  - `Alex Chen`
  - `Mia Park`
  - `Active today`
  - `Online now`

## Expedia Reply Script

### Intro

- `Great pick. Here's a quick plan for visiting Chongqing.`

### Section Titles

- `How to get there`
- `Suggested itinerary`
- `Recommended stays`
- `Flight options`

### Transport Copy

- `Fly into Chongqing Jiangbei International Airport.`
- `Take the airport express or a rideshare to Jiefangbei in about 35 minutes.`
- `Use the metro to reach Hongyadong, Liziba, and the cableway.`

### Itinerary Copy

- `Day 1: Arrive, check in, and explore Hongyadong at sunset.`
- `Day 2: Ride the Yangtze River Cableway, visit Liziba Station, and enjoy hot pot in the evening.`
- `Day 3: Walk the mountain lanes, shop in Jiefangbei, and head back after dinner.`

### Hotel Cards

- `The Westin Chongqing Liberation Square`
  - `Central location, skyline views, and easy access to major landmarks.`
  - `See hotel`
- `Niccolo Chongqing`
  - `Premium stay above the city with a polished business-travel feel.`
  - `See hotel`

### Flight Cards

- `Singapore to Chongqing`
  - `Round trip from $286 with one short stop.`
  - `View flight`
- `Bangkok to Chongqing`
  - `Round trip from $241 with morning arrival.`
  - `View flight`

## Friend Reply Script

### Alex

- `This looks unreal. I would absolutely go.`
- `If you book this, I am in.`
- `The skyline alone sold me.`

### Mia

- `That place looks amazing. Add it to our list.`
- `I would go just for the night views.`
- `Send me the details when you get them.`

## Toast Copy

- `Sent to Expedia`
- `Sent to Alex Chen`
- `Sent to Mia Park`
