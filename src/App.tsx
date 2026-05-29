import { useEffect, useMemo, useRef, useState } from 'react'
import cathyAvatar from './assets/cathy-avatar.svg'
import './App.css'

type RecipientId = 'expedia' | 'alex' | 'mia'
type Screen = 'feed' | 'friends' | 'inbox' | 'chat' | 'profile'

type Message =
  | {
      id: string
      type: 'shared-video'
      sender: 'me'
      caption: string
      location: string
    }
  | {
      id: string
      type: 'text'
      sender: 'me' | 'them'
      content: string
    }
  | {
      id: string
      type: 'plan'
      sender: 'them'
      intro: string
      transport: string[]
      itinerary: string[]
      stays: { name: string; detail: string; cta: string }[]
      flights: { route: string; detail: string; cta: string }[]
    }

type Conversation = {
  recipientId: RecipientId
  title: string
  subtitle: string
  status: 'idle' | 'sending' | 'typing'
  unreadCount: number
  avatar: string
  accent?: string
  onlineLabel: string
  businessLabel?: string
  messages: Message[]
}

type AiChatMessage = {
  role: 'system' | 'user' | 'assistant'
  content: string
}

const recipients: {
  id: RecipientId
  name: string
  handle: string
  avatar: string
  subtitle: string
  accent?: string
  onlineLabel: string
  businessLabel?: string
}[] = [
  {
    id: 'expedia',
    name: 'Expedia',
    handle: 'Business chat',
    avatar: 'E',
    subtitle: 'You can only send up to 1 message before request is accepted.',
    accent: '#FFCC00',
    onlineLabel: 'Online now',
    businessLabel: 'Business chat',
  },
  {
    id: 'alex',
    name: 'timhuang0630',
    handle: 'Friend',
    avatar: 'T',
    subtitle: 'Saturday works for me.',
    accent: '#7B61FF',
    onlineLabel: 'Active today',
  },
  {
    id: 'mia',
    name: 'Mia Park',
    handle: 'Friend',
    avatar: 'M',
    subtitle: 'Let me check flights tonight.',
    accent: '#E6E9F2',
    onlineLabel: 'Online now',
  },
]

const quickMessages = [
  'How do I get here?',
  'Plan this trip for me',
  'Show me flights and hotels',
]

const reactionEmojis = ['🥰', '👍', '😂', '😎', '🥺', '🙏']
const feedVideoAsset = '/media/feed-video-faststart.mp4'
const feedVideoPosterAsset = '/media/feed-video-frame.png'

const feedContent = {
  title: 'WELCOME TO JURASSIC PARK',
  location: 'KUALOA RANCH, OAHU',
  author: 'kthycnt',
  date: '4-24',
  badge: 'Kualoa Ranch · View | 2',
  caption:
    'The setting for 200+ film scenes on Oahu. Cliffs, ocean views, and movie magic all in one place.',
  translationHint: 'See translation',
  likeCount: '675',
  commentCount: '13',
  saveCount: '88',
  shareCount: '75',
}

const initialConversations: Record<RecipientId, Conversation> = {
  expedia: {
    recipientId: 'expedia',
    title: 'Expedia',
    subtitle: 'You can only send up to 1 message before request is accepted.',
    status: 'idle',
    unreadCount: 0,
    avatar: 'E',
    accent: '#FFCC00',
    onlineLabel: 'Online now',
    businessLabel: 'Business chat',
    messages: [],
  },
  alex: {
    recipientId: 'alex',
    title: 'timhuang0630',
    subtitle: 'Saturday works for me.',
    status: 'idle',
    unreadCount: 0,
    avatar: 'T',
    accent: '#7B61FF',
    onlineLabel: 'Active today',
    messages: [
      {
        id: 'alex-seed-1',
        type: 'text',
        sender: 'me',
        content: 'Are you still up for a weekend trip in June?',
      },
      {
        id: 'alex-seed-2',
        type: 'text',
        sender: 'them',
        content: 'Yes, definitely. I just need to avoid the first weekend.',
      },
      {
        id: 'alex-seed-3',
        type: 'text',
        sender: 'me',
        content: 'What about the 14th? We could leave Friday night.',
      },
      {
        id: 'alex-seed-4',
        type: 'text',
        sender: 'them',
        content: 'Saturday works for me.',
      },
    ],
  },
  mia: {
    recipientId: 'mia',
    title: 'Mia Park',
    subtitle: 'Let me check flights tonight.',
    status: 'idle',
    unreadCount: 0,
    avatar: 'M',
    accent: '#E6E9F2',
    onlineLabel: 'Online now',
    messages: [
      {
        id: 'mia-seed-1',
        type: 'text',
        sender: 'me',
        content: 'Do you still want to plan that beach trip for August?',
      },
      {
        id: 'mia-seed-2',
        type: 'text',
        sender: 'them',
        content: 'Yes, I was thinking Honolulu or somewhere nearby.',
      },
      {
        id: 'mia-seed-3',
        type: 'text',
        sender: 'me',
        content: 'I found a few good hotel options already.',
      },
      {
        id: 'mia-seed-4',
        type: 'text',
        sender: 'them',
        content: 'Let me check flights tonight.',
      },
    ],
  },
}

const friendReplies: Record<Exclude<RecipientId, 'expedia'>, string[]> = {
  alex: [
    'This looks unreal. I would absolutely go.',
    'If you book this, I am in.',
    'The skyline alone sold me.',
  ],
  mia: [
    'That place looks amazing. Add it to our list.',
    'I would go just for the views.',
    'Send me the details when you have a plan.',
  ],
}

const friendPersonaPrompts: Record<Exclude<RecipientId, 'expedia'>, string> = {
  alex:
    'You are timhuang0630, the user\'s real friend inside a short-video chat app. Reply in concise English only. Sound casual, warm, and human. Keep the tone like a friend chatting about travel and weekend plans, not a travel agent. It is fine to ask one light follow-up question sometimes. Keep replies to 1 to 4 short sentences and avoid markdown.',
  mia:
    'You are Mia Park, the user\'s real friend inside a short-video chat app. Reply in concise English only. Sound friendly, relaxed, and a little thoughtful. Keep the tone like a travel buddy discussing ideas, not a business or assistant. Keep replies to 1 to 4 short sentences and avoid markdown.',
}

const expediaFeedWelcomeMessage = '✈️ Welcome to Expedia Trip Matching 🏝️'

const expediaWelcomeMessage =
  '✈️ Welcome to Expedia Trip Matching 🏝️\nSend us your favorite travel Vedio. We’ll turn it into a travel plan with itinerary ideas + hotel & flight picks. Simply reply to personalize the experience or ask questions.'

const expediaTravelBriefMessage =
  '【Your Exclusive Jurassic Adventure · Travel Brief】\nDestination Overview:\nAloha, and welcome to Kualoa Ranch on Oahu, Hawaii, the real-life filming location for "Jurassic Park." This destination combines the iconic valleys and jungle backdrops seen in the film with some of the island\'s most spectacular natural scenery. For transportation, travelers can fly into Honolulu International Airport (HNL) and reach the ranch in about one hour by rental car from the airport or the Waikiki area. For accommodations, staying in Waikiki is highly recommended thanks to its wide range of hotels, restaurants, shopping, and convenient access to the rest of Oahu.'

const expediaItineraryMessage =
  'Suggested Itinerary:\nDay 1: Arrival & Acclimation\nArrive on Oahu and check into your hotel in Waikiki. Spend the afternoon unwinding on Waikiki Beach, enjoying the Hawaiian sun and sea breeze, then head out for a relaxed dinner featuring local island flavors.\nDay 2: Core Jurassic Exploration\nSet aside the full day for Kualoa Ranch. In the morning, join the Hollywood Movie Tour for a guided ride into the famous valley landscapes featured in "Jurassic Park." In the afternoon, the ATV or UTV tour is a standout experience, giving you the chance to explore the dramatic Ka\'a\'awa Valley with an adventurous, cinematic feel.\nDay 3: Farewell Journey\nOn your final morning, choose between a visit to the Pearl Harbor Historic Sites or a hike up Diamond Head for sweeping views across the Waikiki coastline. In the afternoon, return to the airport and wrap up an unforgettable Oahu getaway inspired by one of cinema\'s most iconic adventure settings.'

const isExpediaScriptMessage = (content: string) =>
  content === expediaFeedWelcomeMessage ||
  content === expediaWelcomeMessage ||
  content === expediaTravelBriefMessage ||
  content === expediaItineraryMessage

const splitBusinessParagraphs = (line: string) => {
  const sentences =
    line
      .match(/[^.!?]+(?:[.!?]+|$)/g)
      ?.map((sentence) => sentence.trim())
      .filter(Boolean) ?? [line]

  if (sentences.length <= 2) {
    return [line]
  }

  const paragraphs: string[] = []

  for (let index = 0; index < sentences.length; index += 2) {
    paragraphs.push(sentences.slice(index, index + 2).join(' '))
  }

  return paragraphs
}

const deepSeekApiKey = import.meta.env.VITE_DEEPSEEK_API_KEY?.trim() ?? ''
const deepSeekApiUrl =
  import.meta.env.VITE_DEEPSEEK_API_URL?.trim() || 'https://api.deepseek.com/chat/completions'
const deepSeekModel = import.meta.env.VITE_DEEPSEEK_MODEL?.trim() || 'deepseek-v4-flash'
const hasDeepSeekConfig = Boolean(deepSeekApiKey)

const expediaAiPrompt =
  'You are Expedia Trip Matching inside a short-video social app. Reply in concise English only. Be friendly and helpful. Always guide the conversation back to travel planning. Emphasize Expedia value across flights, hotels, and activities. The conversation history may already include fixed scripted messages such as the welcome, travel brief, and itinerary. Treat those fixed messages as already delivered context. Do not rewrite, replace, or contradict them unless the user explicitly asks for a recap. If the user shares the same destination video again, keep helping with that same destination rather than inventing a new place. Keep replies readable on mobile, usually 2 to 5 short sentences, and avoid markdown.'

const getExpediaGuidedReply = (prompt: string) => {
  const normalized = prompt.trim().toLowerCase()

  if (!normalized) {
    return 'Tell us where you want to go, when you want to travel, or what kind of trip you want. Expedia can help turn that into flight, hotel, and activity options in one place.'
  }

  if (/(hi|hello|hey|yo|sup)\b/.test(normalized)) {
    return 'Happy to help with your next trip. If you share a destination, travel month, or budget, Expedia can turn it into a simple plan with flights, stays, and things to do.'
  }

  if (/(hotel|stay|resort|room|villa|bungalow|accommodation)/.test(normalized)) {
    return 'Expedia can help compare resorts, hotels, and package options. Send me your destination, dates, and budget range, and I will guide you toward the best stay for this trip.'
  }

  if (/(flight|fly|airport|airfare|ticket)/.test(normalized)) {
    return 'Expedia can help you narrow down flight options by departure city, travel window, and budget. Send those details and I can steer this conversation into a real trip plan.'
  }

  if (/(budget|cheap|afford|price|cost|deal)/.test(normalized)) {
    return 'If budget matters most, send your departure city and rough spend target. Expedia is best when we balance flights, hotels, and package value together for the same trip.'
  }

  if (/(family|kids|child|children|parents)/.test(normalized)) {
    return 'For a family trip, I can help shape something easy and practical. Expedia can bundle family-friendly stays, flight options, and activities once you share the destination and dates.'
  }

  if (/(honeymoon|romantic|couple|anniversary)/.test(normalized)) {
    return 'That sounds like a great fit for a romantic itinerary. Expedia can help pair scenic stays, flight timing, and experience ideas once you share your destination and ideal month.'
  }

  if (/(beach|island|lagoon|ocean|snorkel|diving)/.test(normalized)) {
    return 'If you are thinking about a beach escape, send me the island or region you like most. Expedia can help compare resorts, flights, and activity ideas for a smoother plan.'
  }

  if (/(food|eat|restaurant|cafe)/.test(normalized)) {
    return 'Food can be a great way to plan a destination. If you tell me the city or region you are curious about, I can guide the trip around local highlights and Expedia booking options.'
  }

  if (/(weather|season|best time|when should|when to go)/.test(normalized)) {
    return 'Timing changes everything for a trip. Tell me the destination you have in mind, and I can help frame the best season, then connect it back to Expedia flight and stay planning.'
  }

  return 'I can help turn that into a travel conversation. Share a destination, travel dates, vibe, or budget, and Expedia can help you explore flights, stays, and bookable trip options.'
}

const makeSharedVideoMessage = (): Message => ({
  id: `video-${Date.now()}`,
  type: 'shared-video',
  sender: 'me',
  caption: 'The setting for 200+ film scenes on Oahu.',
  location: 'Kualoa Ranch',
})

const makeTextMessage = (content: string, sender: 'me' | 'them'): Message => ({
  id: `${sender}-${Date.now()}-${content.length}`,
  type: 'text',
  sender,
  content,
})

const sleep = (ms: number) =>
  new Promise<void>((resolve) => {
    window.setTimeout(resolve, ms)
  })

const serializeMessageForAi = (message: Message): AiChatMessage | null => {
  if (message.type === 'text') {
    return {
      role: message.sender === 'me' ? 'user' : 'assistant',
      content: message.content,
    }
  }

  if (message.type === 'shared-video') {
    return {
      role: 'user',
      content: `The user shared a travel video about ${message.location}. Caption: ${message.caption}`,
    }
  }

  return {
    role: 'assistant',
    content: `${message.intro}\nTransport: ${message.transport.join(' | ')}\nItinerary: ${message.itinerary.join(' | ')}`,
  }
}

const getLatestSharedVideoMessage = (messages: Message[]) => {
  const sharedMessages = messages.filter(
    (message): message is Extract<Message, { type: 'shared-video' }> => message.type === 'shared-video',
  )

  return sharedMessages.at(-1) ?? null
}

const countMatchingSharedVideoMessages = (
  messages: Message[],
  target: Extract<Message, { type: 'shared-video' }> | null,
) => {
  if (!target) return 0

  return messages.filter(
    (message) =>
      message.type === 'shared-video' &&
      message.location === target.location &&
      message.caption === target.caption,
  ).length
}

const buildAiConversation = (
  recipientId: RecipientId,
  messages: Message[],
): AiChatMessage[] => {
  const latestSharedVideo = getLatestSharedVideoMessage(messages)
  const destinationPrompt =
    recipientId === 'expedia' && latestSharedVideo
      ? ` Current trip focus: ${latestSharedVideo.location}. Shared video caption: ${latestSharedVideo.caption}. Keep the reply aligned with this same destination.`
      : ''
  const systemPrompt =
    recipientId === 'expedia'
      ? `${expediaAiPrompt}${destinationPrompt}`
      : friendPersonaPrompts[recipientId]

  const history = messages
    .slice(-10)
    .map(serializeMessageForAi)
    .filter((message): message is AiChatMessage => Boolean(message))

  return [{ role: 'system', content: systemPrompt }, ...history]
}

const getFallbackFriendReply = (
  recipientId: Exclude<RecipientId, 'expedia'>,
  messages: Message[],
) => {
  const replyPool = friendReplies[recipientId]
  const themCount = messages.filter(
    (message) => message.type === 'text' && message.sender === 'them',
  ).length

  return replyPool[Math.max(themCount - 1, 0) % replyPool.length]
}

const hasExpediaWelcome = (messages: Message[]) =>
  messages.some(
    (message) =>
      message.type === 'text' &&
      message.sender === 'them' &&
      (message.content === expediaFeedWelcomeMessage || message.content === expediaWelcomeMessage),
  )

function App() {
  const expediaAvatarAsset = '/media/expedia-avatar.png?v=1'
  const [screen, setScreen] = useState<Screen>('feed')
  const [isLiked, setIsLiked] = useState(false)
  const [hasVideoError, setHasVideoError] = useState(false)
  const [isFeedVideoReady, setIsFeedVideoReady] = useState(false)
  const [sharedVideoPreviewSrc, setSharedVideoPreviewSrc] = useState<string | null>(null)
  const [feedPosterSrc, setFeedPosterSrc] = useState<string | null>(() => {
    try {
      return window.localStorage.getItem('feedVideoFirstFrame') || feedVideoPosterAsset
    } catch {
      return feedVideoPosterAsset
    }
  })
  const [expediaAvatarSrc, setExpediaAvatarSrc] = useState<string | null>(expediaAvatarAsset)
  const [feedAvatarSrc, setFeedAvatarSrc] = useState('/media/cathy-avatar.png')
  const [isShareOpen, setIsShareOpen] = useState(false)
  const [isHalfPreviewOpen, setIsHalfPreviewOpen] = useState(false)
  const [shareBannerRecipientId, setShareBannerRecipientId] = useState<RecipientId | null>(null)
  const [selectedRecipientId, setSelectedRecipientId] = useState<RecipientId>('expedia')
  const [activeConversationId, setActiveConversationId] = useState<RecipientId>('expedia')
  const [shareDraft, setShareDraft] = useState('How can I get there?')
  const [chatDraft, setChatDraft] = useState('')
  const [conversations, setConversations] =
    useState<Record<RecipientId, Conversation>>(initialConversations)
  const feedVideoRef = useRef<HTMLVideoElement | null>(null)
  const messagesRef = useRef<HTMLElement | null>(null)
  const halfMessagesRef = useRef<HTMLElement | null>(null)

  const activeConversation = conversations[activeConversationId]

  const captureSharedVideoFrame = (video: HTMLVideoElement) => {
    if (!video.videoWidth || !video.videoHeight || sharedVideoPreviewSrc) return

    const canvas = document.createElement('canvas')
    canvas.width = video.videoWidth
    canvas.height = video.videoHeight

    const context = canvas.getContext('2d')
    if (!context) return

    context.drawImage(video, 0, 0, canvas.width, canvas.height)
    const nextFrame = canvas.toDataURL('image/jpeg', 0.92)
    setSharedVideoPreviewSrc(nextFrame)
    setFeedPosterSrc(nextFrame)

    try {
      window.localStorage.setItem('feedVideoFirstFrame', nextFrame)
    } catch {
      // Ignore storage failures and keep the in-memory frame.
    }
  }

  useEffect(() => {
    setExpediaAvatarSrc(expediaAvatarAsset)
  }, [expediaAvatarAsset])

  useEffect(() => {
    if (!feedVideoRef.current || hasVideoError) return

    feedVideoRef.current.play().catch(() => {
      // Mobile browsers may defer autoplay until enough data is buffered.
    })
  }, [hasVideoError])

  useEffect(() => {
    if (screen !== 'chat') return

    setConversations((current) => {
      const conversation = current[activeConversationId]
      if (!conversation.unreadCount) return current

      return {
        ...current,
        [activeConversationId]: {
          ...conversation,
          unreadCount: 0,
        },
      }
    })
  }, [activeConversationId, screen])

  useEffect(() => {
    const target =
      screen === 'chat' ? messagesRef.current : screen === 'feed' && isHalfPreviewOpen ? halfMessagesRef.current : null

    if (!target) return

    window.requestAnimationFrame(() => {
      target.scrollTo({
        top: target.scrollHeight,
        behavior: 'smooth',
      })
    })
  }, [
    activeConversationId,
    activeConversation.messages.length,
    activeConversation.status,
    isHalfPreviewOpen,
    screen,
  ])

  const inboxItems = useMemo(
    () =>
      Object.values(conversations).sort((left, right) => {
        if (left.recipientId === 'expedia') return -1
        if (right.recipientId === 'expedia') return 1
        return left.title.localeCompare(right.title)
      }),
    [conversations],
  )
  const totalUnreadCount = useMemo(
    () => Object.values(conversations).reduce((sum, conversation) => sum + conversation.unreadCount, 0),
    [conversations],
  )

  const setConversationStatus = (recipientId: RecipientId, status: Conversation['status'], subtitle: string) => {
    setConversations((current) => ({
      ...current,
      [recipientId]: {
        ...current[recipientId],
        status,
        subtitle,
      },
    }))
  }

  const appendConversationMessage = (
    recipientId: RecipientId,
    message: Extract<Message, { type: 'text' }>,
    subtitle: string,
  ) => {
    setConversations((current) => {
      const conversation = current[recipientId]

      return {
        ...current,
        [recipientId]: {
          ...conversation,
          status: 'idle',
          subtitle,
          unreadCount:
            conversation.unreadCount + (screen === 'chat' && activeConversationId === recipientId ? 0 : 1),
          messages: [...conversation.messages, message],
        },
      }
    })
  }

  const requestDeepSeekReply = async (messages: AiChatMessage[]) => {
    if (!hasDeepSeekConfig || messages.length <= 1) return null

    try {
      const response = await fetch(deepSeekApiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${deepSeekApiKey}`,
        },
        body: JSON.stringify({
          model: deepSeekModel,
          temperature: 0.7,
          messages,
        }),
      })

      if (!response.ok) return null

      const data = await response.json()
      const content = data?.choices?.[0]?.message?.content

      return typeof content === 'string' && content.trim() ? content.trim() : null
    } catch {
      return null
    }
  }

  const queueAiReply = async (
    recipientId: RecipientId,
    historyMessages: Message[],
    prompt: string,
  ) => {
    await sleep(500)
    setConversationStatus(recipientId, 'typing', 'Typing...')

    const startedAt = Date.now()
    const aiReply = await requestDeepSeekReply(buildAiConversation(recipientId, historyMessages))
    const fallbackReply =
      recipientId === 'expedia'
        ? getExpediaGuidedReply(prompt)
        : getFallbackFriendReply(recipientId, historyMessages)
    const nextReply = aiReply ?? fallbackReply
    const elapsed = Date.now() - startedAt

    await sleep(Math.max(1200 - elapsed, 250))

    appendConversationMessage(
      recipientId,
      makeTextMessage(nextReply, 'them') as Extract<Message, { type: 'text' }>,
      recipientId === 'expedia'
        ? aiReply
          ? 'AI trip support'
          : 'Expedia trip support'
        : nextReply,
    )
  }

  const queueReply = (
    recipientId: RecipientId,
    options?: { sharedFromFeed?: boolean; prompt?: string; historyMessages?: Message[] },
  ) => {
    if (recipientId === 'expedia') {
      const historyMessages = options?.historyMessages ?? conversations[recipientId].messages
      const shouldSendWelcome = !hasExpediaWelcome(historyMessages)
      const latestSharedVideo = getLatestSharedVideoMessage(historyMessages)
      const matchingShareCount = countMatchingSharedVideoMessages(historyMessages, latestSharedVideo)
      const shouldUseFixedShareScript = options?.sharedFromFeed && matchingShareCount === 1
      const repeatedSharePrompt =
        latestSharedVideo &&
        `The user shared the same ${latestSharedVideo.location} video again. Continue helping with this exact destination and keep the advice aligned with the existing itinerary for ${latestSharedVideo.location}.`

      if (options?.sharedFromFeed) {
        if (shouldUseFixedShareScript && shouldSendWelcome) {
          window.setTimeout(() => {
            setConversationStatus(recipientId, 'typing', 'Typing...')
          }, 500)

          window.setTimeout(() => {
            appendConversationMessage(
              recipientId,
              makeTextMessage(expediaFeedWelcomeMessage, 'them') as Extract<Message, { type: 'text' }>,
              '✈️ Welcome to Expedia Trip Matching 🏝️',
            )
          }, 1800)

          window.setTimeout(() => {
            setConversationStatus(recipientId, 'typing', 'Typing...')
          }, 3000)

          window.setTimeout(() => {
            appendConversationMessage(
              recipientId,
              makeTextMessage(expediaTravelBriefMessage, 'them') as Extract<Message, { type: 'text' }>,
              'Destination Overview',
            )
          }, 4600)

          window.setTimeout(() => {
            setConversationStatus(recipientId, 'typing', 'Typing...')
          }, 6200)

          window.setTimeout(() => {
            appendConversationMessage(
              recipientId,
              makeTextMessage(expediaItineraryMessage, 'them') as Extract<Message, { type: 'text' }>,
              'Suggested Itinerary',
            )
          }, 7800)
        } else if (shouldUseFixedShareScript) {
          window.setTimeout(() => {
            setConversationStatus(recipientId, 'typing', 'Typing...')
          }, 500)

          window.setTimeout(() => {
            appendConversationMessage(
              recipientId,
              makeTextMessage(expediaTravelBriefMessage, 'them') as Extract<Message, { type: 'text' }>,
              'Destination Overview',
            )
          }, 2100)

          window.setTimeout(() => {
            setConversationStatus(recipientId, 'typing', 'Typing...')
          }, 3400)

          window.setTimeout(() => {
            appendConversationMessage(
              recipientId,
              makeTextMessage(expediaItineraryMessage, 'them') as Extract<Message, { type: 'text' }>,
              'Suggested Itinerary',
            )
          }, 5000)
        } else if (options.historyMessages) {
          void queueAiReply(
            recipientId,
            options.historyMessages,
            options.prompt?.trim() || repeatedSharePrompt || 'Help with this shared destination.',
          )
        }

        return
      }

      if (shouldSendWelcome) {
        window.setTimeout(() => {
          setConversationStatus(recipientId, 'typing', 'Typing...')
        }, 500)

        window.setTimeout(() => {
          appendConversationMessage(
            recipientId,
            makeTextMessage(expediaWelcomeMessage, 'them') as Extract<Message, { type: 'text' }>,
            '✈️ Welcome to Expedia Trip Matching 🏝️',
          )
        }, 1800)
      } else if (options?.prompt?.trim() && options.historyMessages) {
        void queueAiReply(recipientId, options.historyMessages, options.prompt)
      }

      return
    }

    if (options?.historyMessages) {
      void queueAiReply(recipientId, options.historyMessages, options?.prompt ?? '')
    }
  }

  const handleSendFromFeed = () => {
    const nextConversation = conversations[selectedRecipientId]
    const nextMessages = [
      ...nextConversation.messages,
      makeSharedVideoMessage(),
      ...(shareDraft.trim() ? [makeTextMessage(shareDraft.trim(), 'me')] : []),
    ]

    setConversations((current) => ({
      ...current,
      [selectedRecipientId]: {
        ...current[selectedRecipientId],
        status: 'sending',
        subtitle: 'Sending...',
        messages: nextMessages,
      },
    }))
    setIsShareOpen(false)
    setIsHalfPreviewOpen(false)
    setScreen('feed')
    setActiveConversationId(selectedRecipientId)
    setShareBannerRecipientId(selectedRecipientId)
    setShareDraft(
      selectedRecipientId === 'expedia'
        ? 'How can I get there?'
        : 'Would you go here?',
    )
    queueReply(selectedRecipientId, {
      sharedFromFeed: selectedRecipientId === 'expedia',
      prompt: shareDraft.trim(),
      historyMessages: nextMessages,
    })
  }

  const handleSendFromChat = () => {
    if (!chatDraft.trim()) return

    const content = chatDraft.trim()
    const nextMessages = [...conversations[activeConversationId].messages, makeTextMessage(content, 'me')]
    setChatDraft('')
    setConversations((current) => ({
      ...current,
      [activeConversationId]: {
        ...current[activeConversationId],
        status: 'sending',
        subtitle: 'Sending...',
        messages: nextMessages,
      },
    }))
    queueReply(activeConversationId, { prompt: content, historyMessages: nextMessages })
  }

  const isDarkChrome = screen === 'feed' || screen === 'friends'
  const statusTime =
    screen === 'feed' ? '20:01' : screen === 'chat' && activeConversationId === 'expedia' ? '20:02' : '20:03'
  const isBusinessChat = activeConversationId === 'expedia'
  const batteryLevel =
    screen === 'feed' ? '68' : screen === 'chat' && activeConversationId === 'expedia' ? '69' : '70'

  const renderRecipientAvatar = (recipientId: RecipientId | 'feed') => {
    if (recipientId === 'expedia') {
      return expediaAvatarSrc ? (
        <img
          src={expediaAvatarSrc}
          alt="Expedia"
          onError={() => setExpediaAvatarSrc(null)}
        />
      ) : (
        <ExpediaMark />
      )
    }

    if (recipientId === 'alex' || recipientId === 'feed') {
      return (
        <img
          src={feedAvatarSrc}
          alt={recipientId === 'feed' ? feedContent.author : 'timhuang0630'}
          onError={() => setFeedAvatarSrc(cathyAvatar)}
        />
      )
    }

    return <TakoMark />
  }

  const renderBusinessMessageContent = (content: string) => {
    const lines = content.split('\n').filter(Boolean)
    const blocks = lines.flatMap((line, index) => {
      const isTitle = index === 0 || /^Suggested Itinerary:/.test(line)
      const isSection = /Overview:$/.test(line)
      const isDay = /^Day \d+:/.test(line)
      const className = [
        'business-message-line',
        isTitle ? 'is-title' : '',
        isSection ? 'is-section' : '',
        isDay ? 'is-day' : '',
      ]
        .filter(Boolean)
        .join(' ')

      if (isTitle || isSection || isDay) {
        return [{ content: line, className }]
      }

      return splitBusinessParagraphs(line).map((paragraph, paragraphIndex) => ({
        content: paragraph,
        className: `${className} is-body ${paragraphIndex > 0 ? 'is-subparagraph' : ''}`.trim(),
      }))
    })

    return (
      <div className="business-message-copy">
        {blocks.map((block, index) => (
          <p key={`${block.content}-${index}`} className={block.className}>
            {block.content}
          </p>
        ))}
      </div>
    )
  }

  return (
    <main className="demo-shell">
      <section className="phone-shell" aria-label="TT-style iOS demo">
        <div className="phone-frame">
          <div className="dynamic-island" />
          <div className={`screen screen-${screen}`}>
            <div className={`status-bar ${isDarkChrome ? 'status-on-dark' : 'status-on-light'}`}>
              <span className="status-time">
                {statusTime}
                <StatusPersonIcon />
              </span>
              <div className="status-icons">
                <span>5G</span>
                <span className="battery">{batteryLevel}</span>
              </div>
            </div>

            {screen === 'feed' && (
              <div className="feed-screen">
                {!hasVideoError ? (
                  <>
                    {feedPosterSrc && (
                      <img
                        className={`poster-media feed-fallback-frame ${isFeedVideoReady ? 'is-hidden' : ''}`}
                        src={feedPosterSrc}
                        alt="Kualoa Ranch video first frame"
                      />
                    )}
                    <div
                      className={`poster-media video-loading-state ${feedPosterSrc ? 'has-poster' : ''} ${
                        isFeedVideoReady ? 'is-hidden' : ''
                      }`}
                      aria-hidden="true"
                    >
                      <span className="video-loading-spinner" />
                    </div>
                    <video
                      ref={(node) => {
                        feedVideoRef.current = node

                        if (node && node.readyState >= 2) {
                          captureSharedVideoFrame(node)
                          setIsFeedVideoReady(true)
                        }
                      }}
                      className={`poster-media feed-video ${isFeedVideoReady ? 'is-ready' : ''}`}
                      autoPlay
                      muted
                      loop
                      playsInline
                      preload="auto"
                      poster={feedPosterSrc ?? feedVideoPosterAsset}
                      onError={() => setHasVideoError(true)}
                      onLoadedData={(event) => {
                        captureSharedVideoFrame(event.currentTarget)
                        setIsFeedVideoReady(true)
                      }}
                      onCanPlay={(event) => {
                        setIsFeedVideoReady(true)
                        event.currentTarget.play().catch(() => {
                          // Ignore autoplay rejections and keep the first frame visible.
                        })
                      }}
                    >
                      <source src={feedVideoAsset} type="video/mp4" />
                    </video>
                  </>
                ) : (
                  <>
                    {feedPosterSrc ? (
                      <img className="poster-media feed-fallback-frame" src={feedPosterSrc} alt="Kualoa Ranch video first frame" />
                    ) : (
                      <div className="poster-media video-loading-state is-error" aria-hidden="true" />
                    )}
                  </>
                )}
                <div className="feed-overlay" />

                <header className="feed-topbar">
                  <button type="button" className="live-tab" aria-label="Live">
                    <LiveIcon />
                  </button>
                  <div className="feed-tabs">
                    <button type="button">STEM</button>
                    <button type="button">Explore</button>
                    <button type="button">Local</button>
                    <button type="button">Following</button>
                    <button type="button">Shop</button>
                    <button type="button" className="active-tab">
                      Recommended
                    </button>
                  </div>
                  <button type="button" className="top-search-button" aria-label="Search">
                    <TopSearchIcon />
                  </button>
                </header>

                <div className="feed-title-wrap">
                  <h2>{feedContent.title}</h2>
                  <p>{feedContent.location}</p>
                </div>

                <aside className="action-rail">
                  <button type="button" className="action-button action-avatar-button">
                    <span className="avatar-stack">
                      <span className="avatar-circle">
                        <img
                          src={feedAvatarSrc}
                          alt={feedContent.author}
                          onError={() => setFeedAvatarSrc(cathyAvatar)}
                        />
                      </span>
                      <span className="avatar-follow-badge">
                        <PlusIcon />
                      </span>
                    </span>
                  </button>
                  <button
                    type="button"
                    className={`action-button ${isLiked ? 'is-active' : ''}`}
                    onClick={() => setIsLiked((current) => !current)}
                  >
                    <HeartIcon filled={isLiked} />
                    <span className="action-count">{feedContent.likeCount}</span>
                  </button>
                  <button type="button" className="action-button">
                    <CommentIcon />
                    <span className="action-count">{feedContent.commentCount}</span>
                  </button>
                  <button type="button" className="action-button">
                    <BookmarkIcon />
                    <span className="action-count">{feedContent.saveCount}</span>
                  </button>
                  <button
                    type="button"
                    className="action-button"
                    onClick={() => setIsShareOpen(true)}
                  >
                    <ShareIcon />
                    <span className="action-count">{feedContent.shareCount}</span>
                  </button>
                </aside>

                <section className="feed-meta">
                  <div className="location-badge">
                    <span className="location-badge-icon">
                      <LocationBadgeIcon />
                    </span>
                    <span>{feedContent.badge}</span>
                  </div>
                  <div className="author-row">
                    <span className="author-name">{feedContent.author}</span>
                    <VerifiedIcon />
                    <span className="author-date">{feedContent.date}</span>
                  </div>
                  <p className="caption">{feedContent.caption}</p>
                  <p className="translation-hint">{feedContent.translationHint}</p>
                </section>

                <button
                  type="button"
                  className="search-pill"
                  onClick={() => {
                    setScreen('inbox')
                    setActiveConversationId('expedia')
                  }}
                >
                  <span className="search-pill-left">
                    <SearchIcon />
                    <span>Search · Chongqing skyline</span>
                  </span>
                  <ChevronRightIcon />
                </button>

                {shareBannerRecipientId && (
                  <button
                    type="button"
                    className="share-banner"
                    onClick={() => {
                      setActiveConversationId(shareBannerRecipientId)
                      setIsHalfPreviewOpen(true)
                    }}
                  >
                    <span className="share-banner-check">
                      <CheckIcon />
                    </span>
                    <span className="share-banner-copy">
                      <strong>
                        Sent to {conversations[shareBannerRecipientId].title}
                      </strong>
                      <span>Tap to preview the conversation</span>
                    </span>
                    <ChevronRightIcon />
                  </button>
                )}
              </div>
            )}

            {screen === 'inbox' && (
              <div className="inbox-screen">
                <header className="page-header">
                  <button type="button" className="ghost-icon">
                    <PeoplePlusIcon />
                  </button>
                  <div className="page-title">
                    <h2>Inbox</h2>
                    <span className="live-dot" />
                    <ChevronDownSmallIcon />
                  </div>
                  <button type="button" className="ghost-icon">
                    <SearchIcon />
                  </button>
                </header>

                <section className="inbox-cards">
                  <div className="story-row">
                    <div className="story-card">
                      <span className="story-note">Anything new?</span>
                      <span className="story-avatar">
                        <img src={feedAvatarSrc} alt="Create story" onError={() => setFeedAvatarSrc(cathyAvatar)} />
                      </span>
                      <strong>Create</strong>
                    </div>
                  </div>

                  <button type="button" className="inbox-service-row">
                    <span className="service-avatar service-blue">
                      <NewFollowersIcon />
                    </span>
                    <span className="conversation-copy">
                      <strong>New followers</strong>
                      <span>See your new followers here.</span>
                    </span>
                  </button>

                  <button type="button" className="inbox-service-row">
                    <span className="service-avatar service-pink">
                      <HeartIcon filled />
                    </span>
                    <span className="conversation-copy">
                      <strong>Activity</strong>
                      <span>See notifications here.</span>
                    </span>
                  </button>

                  {inboxItems.map((conversation) => (
                    <button
                      key={conversation.recipientId}
                      type="button"
                      className="conversation-row inbox-conversation-row"
                      onClick={() => {
                        setActiveConversationId(conversation.recipientId)
                        setScreen('chat')
                      }}
                    >
                      <span
                        className={`conversation-avatar ${
                          conversation.recipientId === 'expedia'
                            ? 'expedia-avatar'
                            : conversation.recipientId === 'mia'
                              ? 'tako-avatar'
                              : 'photo-avatar'
                        }`}
                        style={{
                          backgroundColor:
                            conversation.recipientId === 'alex' ? '#ffffff' : conversation.accent ?? '#DFE3EA',
                        }}
                      >
                        {renderRecipientAvatar(conversation.recipientId)}
                      </span>
                      <span className="conversation-copy">
                        <strong className="conversation-title-inline">
                          <span>{conversation.title}</span>
                          {conversation.recipientId === 'expedia' && <VerifiedIcon />}
                        </strong>
                        <span>{conversation.subtitle}</span>
                      </span>
                      <span className="conversation-tail">
                        {conversation.recipientId === 'expedia' && <span className="row-meta">Just now</span>}
                        {conversation.unreadCount > 0 && (
                          <span className="conversation-unread-badge">{conversation.unreadCount}</span>
                        )}
                        <span className="row-side-icon">
                          <CameraIcon />
                        </span>
                      </span>
                    </button>
                  ))}
                </section>
              </div>
            )}

            {screen === 'friends' && (
              <div className="friends-screen">
                <header className="friends-header">
                  <button type="button" className="friends-mini-avatar">
                    <span className="friends-avatar-wrap">
                      <img src={feedAvatarSrc} alt="Friends" onError={() => setFeedAvatarSrc(cathyAvatar)} />
                      <span className="friends-mini-plus">
                        <PlusIcon />
                      </span>
                    </span>
                  </button>
                  <h2>Friends</h2>
                  <button type="button" className="ghost-icon friends-search-icon">
                    <SearchIcon />
                  </button>
                </header>

                <div className="friends-watermark">
                  <TikTokGlyphIcon />
                </div>

                <section className="friends-empty-state">
                  <h3>Connect with friends to view their posts</h3>
                  <button type="button" className="friends-primary-button">
                    Connect with Facebook friends
                  </button>
                  <button type="button" className="friends-secondary-button">
                    Invite friends
                  </button>
                </section>
              </div>
            )}

            {screen === 'profile' && (
              <div className="profile-screen">
                <header className="profile-header">
                  <button type="button" className="ghost-icon">
                    <PeoplePlusIcon />
                  </button>
                  <div className="profile-header-actions">
                    <button type="button" className="ghost-icon">
                      <FootstepsIcon />
                    </button>
                    <button type="button" className="ghost-icon">
                      <ShareIcon />
                    </button>
                    <button type="button" className="ghost-icon">
                      <MenuIcon />
                    </button>
                  </div>
                </header>

                <section className="profile-body">
                  <span className="profile-note-bubble">This moment&apos;s ideas...</span>
                  <div className="profile-avatar-large">
                    <img src={feedAvatarSrc} alt="Profile" onError={() => setFeedAvatarSrc(cathyAvatar)} />
                  </div>
                  <div className="profile-pill-row">
                    <button type="button" className="profile-pill wide">
                      <span>+ Add name</span>
                      <ChevronDownSmallIcon />
                    </button>
                    <button type="button" className="profile-pill">
                      Edit
                    </button>
                  </div>
                  <p className="profile-handle">@timhuang0630</p>

                  <div className="profile-stats">
                    <div>
                      <strong>0</strong>
                      <span>Following</span>
                    </div>
                    <div>
                      <strong>0</strong>
                      <span>Followers</span>
                    </div>
                    <div>
                      <strong>0</strong>
                      <span>Likes</span>
                    </div>
                  </div>

                  <div className="profile-pill-row small-gap">
                    <button type="button" className="profile-pill">
                      + Add bio
                    </button>
                    <button type="button" className="profile-pill">
                      + Add college
                    </button>
                  </div>
                </section>

                <div className="profile-tab-row">
                  <button type="button" className="profile-tab-button is-active">
                    <GridPostsIcon />
                  </button>
                  <button type="button" className="profile-tab-button">
                    <EffectsIcon />
                  </button>
                  <button type="button" className="profile-tab-button">
                    <LockIcon />
                  </button>
                  <button type="button" className="profile-tab-button">
                    <BookmarkIcon />
                  </button>
                  <button type="button" className="profile-tab-button">
                    <HeartIcon filled={false} />
                  </button>
                </div>

                <section className="profile-empty-state">
                  <span className="profile-empty-icon">
                    <EmptyStateIcon />
                  </span>
                </section>
              </div>
            )}

            {screen === 'chat' && (
              <div className="chat-screen">
                <header className="chat-header">
                  <button
                    type="button"
                    className="ghost-icon"
                    onClick={() => setScreen('inbox')}
                  >
                    <BackIcon />
                  </button>
                  <div className="chat-title-wrap">
                    <div
                      className={`conversation-avatar small ${
                        isBusinessChat ? 'expedia-avatar' : activeConversationId === 'mia' ? 'tako-avatar' : 'photo-avatar'
                      }`}
                      style={{
                        backgroundColor:
                          activeConversationId === 'alex' ? '#ffffff' : activeConversation.accent ?? '#DFE3EA',
                      }}
                    >
                      {renderRecipientAvatar(activeConversationId)}
                    </div>
                    <div className="chat-title-copy">
                      <strong className="conversation-title-inline">
                        <span>{activeConversation.title}</span>
                        {isBusinessChat && <VerifiedIcon />}
                      </strong>
                      <span>
                        {activeConversation.businessLabel ?? activeConversation.onlineLabel}
                      </span>
                    </div>
                  </div>
                  <button type="button" className="ghost-icon">
                    <DotsIcon />
                  </button>
                </header>

                <section className={`messages ${isBusinessChat ? 'business-messages' : ''}`} ref={messagesRef}>
                  {isBusinessChat && (
                    <p className="business-chat-notice">
                      <span>You opened this chat with Expedia. </span>
                      <span className="business-chat-link">Learn more about business chats and your privacy</span>
                    </p>
                  )}

                  {activeConversation.messages.length > 0 && (
                    <p className="message-date-label">Today 8:01 PM</p>
                  )}

                  {activeConversation.messages.map((message) => {
                    if (message.type === 'shared-video') {
                      return (
                        <article key={message.id} className="message-row mine">
                          {isBusinessChat && (
                            <span className="shared-forward-indicator">
                              <ShareIcon />
                            </span>
                          )}
                          <div className={`shared-card ${isBusinessChat ? 'business-shared-card' : ''}`}>
                            {isBusinessChat ? (
                              sharedVideoPreviewSrc ? (
                                <img src={sharedVideoPreviewSrc} alt={message.location} />
                              ) : (
                                <div className="business-shared-placeholder" aria-hidden="true" />
                              )
                            ) : (
                              sharedVideoPreviewSrc || feedPosterSrc ? (
                                <img src={sharedVideoPreviewSrc ?? feedPosterSrc ?? feedVideoPosterAsset} alt={message.location} />
                              ) : (
                                <div className="business-shared-placeholder" aria-hidden="true" />
                              )
                            )}
                            <div className="shared-card-copy">
                              {isBusinessChat ? (
                                <>
                                  <span className="shared-play-badge">
                                    <PlaySolidIcon />
                                  </span>
                                  <div className="shared-bottom-meta">
                                    <span className="shared-author-mini">
                                      <img src={feedAvatarSrc} alt={feedContent.author} onError={() => setFeedAvatarSrc(cathyAvatar)} />
                                      <span>{feedContent.author}</span>
                                    </span>
                                    <span className="shared-location-pill">
                                      <LocationBadgeIcon />
                                      <span>{message.location}</span>
                                    </span>
                                  </div>
                                </>
                              ) : (
                                <>
                                  <span className="shared-label">Shared destination</span>
                                  <strong>{message.location}</strong>
                                  <p>{message.caption}</p>
                                </>
                              )}
                            </div>
                          </div>
                        </article>
                      )
                    }

                    if (message.type === 'plan') {
                      return (
                        <article key={message.id} className="message-row theirs">
                          <div className="plan-card">
                            <p className="plan-intro">{message.intro}</p>

                            <div className="plan-section">
                              <h3>How to get there</h3>
                              <ul>
                                {message.transport.map((item) => (
                                  <li key={item}>{item}</li>
                                ))}
                              </ul>
                            </div>

                            <div className="plan-section">
                              <h3>Suggested itinerary</h3>
                              <ul>
                                {message.itinerary.map((item) => (
                                  <li key={item}>{item}</li>
                                ))}
                              </ul>
                            </div>

                            <div className="plan-section">
                              <h3>Recommended stays</h3>
                              <div className="stacked-cards">
                                {message.stays.map((stay) => (
                                  <div key={stay.name} className="mini-card">
                                    <strong>{stay.name}</strong>
                                    <span>{stay.detail}</span>
                                    <button type="button">{stay.cta}</button>
                                  </div>
                                ))}
                              </div>
                            </div>

                            <div className="plan-section">
                              <h3>Flight options</h3>
                              <div className="stacked-cards">
                                {message.flights.map((flight) => (
                                  <div key={flight.route} className="mini-card">
                                    <strong>{flight.route}</strong>
                                    <span>{flight.detail}</span>
                                    <button type="button">{flight.cta}</button>
                                  </div>
                                ))}
                              </div>
                            </div>
                          </div>
                        </article>
                      )
                    }

                    return (
                      <article
                        key={message.id}
                        className={`message-row ${message.sender === 'me' ? 'mine' : 'theirs'}`}
                      >
                        <div
                          className={`bubble ${
                            message.sender === 'me' ? 'bubble-me' : 'bubble-them'
                          } ${
                            isBusinessChat && message.sender === 'them' && isExpediaScriptMessage(message.content)
                              ? 'bubble-business'
                              : ''
                          }`}
                        >
                          {isBusinessChat && message.sender === 'them' && isExpediaScriptMessage(message.content)
                            ? renderBusinessMessageContent(message.content)
                            : message.content}
                        </div>
                      </article>
                    )
                  })}

                  {activeConversation.status === 'typing' && (
                    <article className="message-row theirs">
                      <div className="typing-pill">
                        <span />
                        <span />
                        <span />
                      </div>
                    </article>
                  )}

                </section>

                {isBusinessChat ? (
                  <div className="business-composer-wrap">
                    <div className="business-quick-actions">
                      <button type="button">❤️</button>
                      <button type="button">😂</button>
                      <button type="button">👍</button>
                      <button type="button" className="quick-pill">
                        <EffectsIcon />
                        <span>Effects</span>
                      </button>
                      <button type="button" className="quick-pill">
                        <CardsIcon />
                        <span>Cards</span>
                      </button>
                    </div>
                    <form
                      className="composer business-composer"
                      onSubmit={(event) => {
                        event.preventDefault()
                        handleSendFromChat()
                      }}
                    >
                      <button type="button" className="composer-icon">
                        <CameraIcon />
                      </button>
                      <input
                        value={chatDraft}
                        onChange={(event) => setChatDraft(event.target.value)}
                        placeholder="Message..."
                        aria-label="Message input"
                        enterKeyHint="send"
                      />
                      <button type="button" className="composer-icon">
                        <ImageIcon />
                      </button>
                      <button type="button" className="composer-avatar-button" aria-label="Profile sticker">
                        {renderRecipientAvatar('feed')}
                      </button>
                      <button type="button" className="composer-icon">
                        <MicIcon />
                      </button>
                      <button type="submit" className={`send-mini business-send ${chatDraft.trim() ? 'is-visible' : ''}`}>
                        Send
                      </button>
                    </form>
                  </div>
                ) : (
                  <form
                    className="composer"
                    onSubmit={(event) => {
                      event.preventDefault()
                      handleSendFromChat()
                    }}
                  >
                    <button type="button" className="composer-icon">
                      <CameraIcon />
                    </button>
                    <input
                      value={chatDraft}
                      onChange={(event) => setChatDraft(event.target.value)}
                      placeholder="Message..."
                      aria-label="Message input"
                      enterKeyHint="send"
                    />
                    <button type="button" className="composer-icon">
                      <ImageIcon />
                    </button>
                    <button type="submit" className="send-mini">
                      Send
                    </button>
                  </form>
                )}
              </div>
            )}

            {screen !== 'chat' && (
              <nav className="bottom-nav">
                <button
                  type="button"
                  className={screen === 'feed' ? 'nav-active' : ''}
                  onClick={() => setScreen('feed')}
                >
                  <HomeIcon />
                  <span>Home</span>
                </button>
                <button
                  type="button"
                  className={screen === 'friends' ? 'nav-active' : ''}
                  onClick={() => setScreen('friends')}
                >
                  <FriendsIcon />
                  <span>Friends</span>
                </button>
                <button type="button" className="plus-button" aria-label="Create">
                  <span className="plus-button-shell">
                    <span className="plus-button-cyan" />
                    <span className="plus-button-red" />
                    <span className="plus-button-core">
                      <PlusIcon />
                    </span>
                  </span>
                </button>
                <button
                  type="button"
                  className={screen === 'inbox' ? 'nav-active' : ''}
                  onClick={() => setScreen('inbox')}
                >
                  <span className="nav-icon-wrap">
                    <InboxIcon />
                    {totalUnreadCount > 0 && <span className="bottom-nav-unread-badge">{totalUnreadCount}</span>}
                  </span>
                  <span>Inbox</span>
                </button>
                <button
                  type="button"
                  className={screen === 'profile' ? 'nav-active' : ''}
                  onClick={() => setScreen('profile')}
                >
                  <ProfileIcon />
                  <span>Profile</span>
                </button>
              </nav>
            )}

            {screen === 'feed' && isHalfPreviewOpen && (
              <div className="sheet-backdrop" onClick={() => setIsHalfPreviewOpen(false)}>
                <section
                  className="half-chat-sheet"
                  onClick={(event) => event.stopPropagation()}
                  aria-label="Conversation preview"
                >
                  <div className="sheet-handle" />
                  <header className="half-chat-header">
                    <div className="chat-title-wrap">
                      <div
                        className={`conversation-avatar small ${
                          activeConversationId === 'expedia'
                            ? 'expedia-avatar'
                            : activeConversationId === 'mia'
                              ? 'tako-avatar'
                              : 'photo-avatar'
                        }`}
                        style={{
                          backgroundColor:
                            activeConversationId === 'alex' ? '#ffffff' : activeConversation.accent ?? '#DFE3EA',
                        }}
                      >
                        {renderRecipientAvatar(activeConversationId)}
                      </div>
                      <div className="chat-title-copy">
                        <strong>{activeConversation.title}</strong>
                        <span>
                          {activeConversation.businessLabel ?? activeConversation.onlineLabel}
                        </span>
                      </div>
                    </div>
                    <button
                      type="button"
                      className="ghost-icon half-close-button"
                      onClick={() => setIsHalfPreviewOpen(false)}
                      aria-label="Close preview"
                    >
                      <CloseIcon />
                    </button>
                  </header>

                  <section className="half-chat-messages" ref={halfMessagesRef}>
                    {activeConversation.messages.map((message) => {
                      if (message.type === 'shared-video') {
                        return (
                          <article key={message.id} className="message-row mine">
                            {activeConversationId === 'expedia' ? (
                              <>
                                <span className="shared-forward-indicator">
                                  <ShareIcon />
                                </span>
                                <div className="shared-card business-shared-card">
                                  {sharedVideoPreviewSrc ? (
                                    <img src={sharedVideoPreviewSrc} alt={message.location} />
                                  ) : (
                                    <div className="business-shared-placeholder" aria-hidden="true" />
                                  )}
                                  <div className="shared-card-copy">
                                    <span className="shared-play-badge">
                                      <PlaySolidIcon />
                                    </span>
                                    <div className="shared-bottom-meta">
                                      <span className="shared-author-mini">
                                        <img
                                          src={feedAvatarSrc}
                                          alt={feedContent.author}
                                          onError={() => setFeedAvatarSrc(cathyAvatar)}
                                        />
                                        <span>{feedContent.author}</span>
                                      </span>
                                      <span className="shared-location-pill">
                                        <LocationBadgeIcon />
                                        <span>{message.location}</span>
                                      </span>
                                    </div>
                                  </div>
                                </div>
                              </>
                            ) : (
                              <div className="shared-card compact">
                                {sharedVideoPreviewSrc || feedPosterSrc ? (
                                  <img src={sharedVideoPreviewSrc ?? feedPosterSrc ?? feedVideoPosterAsset} alt={message.location} />
                                ) : (
                                  <div className="business-shared-placeholder" aria-hidden="true" />
                                )}
                                <div className="shared-card-copy">
                                  <span className="shared-label">Shared destination</span>
                                  <strong>{message.location}</strong>
                                  <p>{message.caption}</p>
                                </div>
                              </div>
                            )}
                          </article>
                        )
                      }

                      if (message.type === 'plan') {
                        return (
                          <article key={message.id} className="message-row theirs">
                            <div className="plan-card compact">
                              <p className="plan-intro">{message.intro}</p>
                              <div className="plan-section">
                                <h3>How to get there</h3>
                                <ul>
                                  {message.transport.map((item) => (
                                    <li key={item}>{item}</li>
                                  ))}
                                </ul>
                              </div>
                            </div>
                          </article>
                        )
                      }

                      return (
                        <article
                          key={message.id}
                          className={`message-row ${message.sender === 'me' ? 'mine' : 'theirs'}`}
                        >
                          <div
                            className={`bubble ${
                              message.sender === 'me' ? 'bubble-me' : 'bubble-them'
                            } ${
                              activeConversationId === 'expedia' &&
                              message.sender === 'them' &&
                              isExpediaScriptMessage(message.content)
                                ? 'bubble-business'
                                : ''
                            }`}
                          >
                            {activeConversationId === 'expedia' &&
                            message.sender === 'them' &&
                            isExpediaScriptMessage(message.content)
                              ? renderBusinessMessageContent(message.content)
                              : message.content}
                          </div>
                        </article>
                      )
                    })}

                    {activeConversation.status === 'typing' && (
                      <article className="message-row theirs">
                        <div className="typing-pill">
                          <span />
                          <span />
                          <span />
                        </div>
                      </article>
                    )}
                  </section>

                  <form
                    className="composer half-composer"
                    onSubmit={(event) => {
                      event.preventDefault()
                      handleSendFromChat()
                    }}
                  >
                    <button type="button" className="composer-icon">
                      <CameraIcon />
                    </button>
                    <input
                      value={chatDraft}
                      onChange={(event) => setChatDraft(event.target.value)}
                      placeholder="Message..."
                      aria-label="Message input"
                      enterKeyHint="send"
                    />
                    <button type="button" className="composer-icon">
                      <ImageIcon />
                    </button>
                    <button type="submit" className="send-mini">
                      Send
                    </button>
                  </form>
                </section>
              </div>
            )}

            {isShareOpen && (
              <div className="sheet-backdrop" onClick={() => setIsShareOpen(false)}>
                <section
                  className="share-sheet"
                  onClick={(event) => event.stopPropagation()}
                  aria-label="Send to recipients"
                >
                  <div className="sheet-handle" />
                  <header className="sheet-header">
                    <button type="button" className="ghost-icon">
                      <SearchIcon />
                    </button>
                    <h3>Send to</h3>
                    <button
                      type="button"
                      className="ghost-icon"
                      onClick={() => setIsShareOpen(false)}
                    >
                      <CloseIcon />
                    </button>
                  </header>

                  <div className="recipient-row">
                    {recipients.map((recipient) => (
                      <button
                        key={recipient.id}
                        type="button"
                        className={`recipient-chip ${
                          selectedRecipientId === recipient.id ? 'recipient-selected' : ''
                        }`}
                        onClick={() => {
                          setSelectedRecipientId(recipient.id)
                          setShareDraft(
                            recipient.id === 'expedia'
                              ? 'How can I get there?'
                              : 'Would you go here?',
                          )
                        }}
                      >
                        <span className="recipient-portrait-wrap">
                          <span
                            className={`conversation-avatar recipient-portrait ${
                              recipient.id === 'expedia'
                                ? 'expedia-avatar'
                                : recipient.id === 'mia'
                                  ? 'tako-avatar'
                                  : 'photo-avatar'
                            } ${
                              selectedRecipientId === recipient.id ? 'recipient-portrait-selected' : ''
                            }`}
                            style={{
                              backgroundColor: recipient.id === 'alex' ? '#ffffff' : recipient.accent ?? '#DFE3EA',
                            }}
                          >
                            {renderRecipientAvatar(recipient.id)}
                          </span>
                          {selectedRecipientId === recipient.id && (
                            <span className="recipient-check">
                              <CheckIcon />
                            </span>
                          )}
                        </span>
                        <span className="recipient-name">{recipient.name}</span>
                      </button>
                    ))}
                  </div>

                  <textarea
                    value={shareDraft}
                    onChange={(event) => setShareDraft(event.target.value)}
                    placeholder="Add a message..."
                    rows={3}
                  />

                  <div className="emoji-row">
                    {reactionEmojis.map((emoji) => (
                      <button
                        key={emoji}
                        type="button"
                        onClick={() => {
                          setShareDraft((current) =>
                            current.trim() ? `${current} ${emoji}` : emoji,
                          )
                        }}
                      >
                        {emoji}
                      </button>
                    ))}
                  </div>

                  <div className="quick-message-row">
                    {quickMessages.map((message) => (
                      <button
                        key={message}
                        type="button"
                        onClick={() => setShareDraft(message)}
                        className={shareDraft === message ? 'quick-selected' : ''}
                      >
                        {message}
                      </button>
                    ))}
                  </div>

                  <button type="button" className="primary-button" onClick={handleSendFromFeed}>
                    Send
                  </button>
                </section>
              </div>
            )}
          </div>
        </div>
      </section>
    </main>
  )
}

export default App

function HeartIcon({ filled }: { filled: boolean }) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className={filled ? 'heart-filled' : ''}>
      <path
        d="M12 21.3c-.25 0-.49-.08-.69-.23-1.2-.92-7.21-5.59-8.19-10.21C2.37 7.37 4.62 4 8.04 4c1.75 0 3.17.78 3.96 2.02C12.79 4.78 14.21 4 15.96 4c3.42 0 5.67 3.37 4.92 6.86-.98 4.62-6.99 9.29-8.19 10.21-.2.15-.44.23-.69.23Z"
        fill="currentColor"
      />
    </svg>
  )
}

function CommentIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path
        d="M12 4.1c4.85 0 8.8 3.27 8.8 7.29 0 3.66-3.22 6.68-7.43 7.21L8 20.85l.95-2.77c-3.38-.96-5.75-3.58-5.75-6.69 0-4.02 3.95-7.29 8.8-7.29Zm-3.42 6.27a1.12 1.12 0 1 0 0 2.24 1.12 1.12 0 0 0 0-2.24Zm3.42 0a1.12 1.12 0 1 0 0 2.24 1.12 1.12 0 0 0 0-2.24Zm3.42 0a1.12 1.12 0 1 0 0 2.24 1.12 1.12 0 0 0 0-2.24Z"
        fill="currentColor"
        fillRule="evenodd"
        clipRule="evenodd"
      />
    </svg>
  )
}

function BookmarkIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path
        d="M7.35 3.7h9.3c.91 0 1.65.74 1.65 1.65v15.02c0 .33-.36.53-.64.36L12 17.42l-5.66 3.31c-.28.17-.64-.03-.64-.36V5.35c0-.91.74-1.65 1.65-1.65Z"
        fill="currentColor"
      />
    </svg>
  )
}

function ShareIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path
        d="M6.9 17.6c0-4.52 3.1-7.35 7.9-7.35h3.1"
        fill="none"
        stroke="currentColor"
        strokeWidth="3.3"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="m14.9 6.6 5.2 3.65-5.2 3.65"
        fill="none"
        stroke="currentColor"
        strokeWidth="3.3"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

function SearchIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path
        d="m21 21-4.4-4.4M10.8 18a7.2 7.2 0 1 0 0-14.4 7.2 7.2 0 0 0 0 14.4Z"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  )
}

function TopSearchIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path
        d="m21 21-4.4-4.4M10.8 18a7.2 7.2 0 1 0 0-14.4 7.2 7.2 0 0 0 0 14.4Z"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.2"
        strokeLinecap="round"
      />
    </svg>
  )
}

function LiveIcon() {
  return (
    <svg viewBox="0 0 40 34" aria-hidden="true" className="live-icon-mark">
      <path
        d="M6.4 12V9.7c0-1.28 1.05-2.33 2.33-2.33h22.54c1.28 0 2.33 1.05 2.33 2.33V12"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.8"
        strokeLinecap="round"
      />
      <path
        d="M16.2 6.45 12.55 2.8M23.8 6.45l3.65-3.65"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.8"
        strokeLinecap="round"
      />
      <text
        x="20"
        y="22.6"
        textAnchor="middle"
        fontSize="13.2"
        fontWeight="900"
        letterSpacing="-0.4"
        fill="currentColor"
      >
        LIVE
      </text>
      <path
        d="M8.1 25.35v1.42c0 1.28 1.05 2.33 2.33 2.33h19.14c1.28 0 2.33-1.05 2.33-2.33v-1.42"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.8"
        strokeLinecap="round"
      />
    </svg>
  )
}

function LocationBadgeIcon() {
  return (
    <svg viewBox="0 0 16 16" aria-hidden="true">
      <path
        d="M8 1.7c2.25 0 4.08 1.82 4.08 4.07 0 2.95-3.03 6.35-3.56 6.91a.67.67 0 0 1-1.04 0C6.95 12.12 3.92 8.72 3.92 5.77A4.08 4.08 0 0 1 8 1.7Zm0 2a2.06 2.06 0 1 0 0 4.12 2.06 2.06 0 0 0 0-4.12Z"
        fill="currentColor"
      />
    </svg>
  )
}

function ChevronRightIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path
        d="m10 7 5 5-5 5"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

function BackIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path
        d="m15 5-7 7 7 7"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

function DotsIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <circle cx="5" cy="12" r="2" fill="currentColor" />
      <circle cx="12" cy="12" r="2" fill="currentColor" />
      <circle cx="19" cy="12" r="2" fill="currentColor" />
    </svg>
  )
}

function CameraIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path
        d="M6.5 8.5h11a2 2 0 0 1 2 2v6.5a2 2 0 0 1-2 2h-11a2 2 0 0 1-2-2v-6.5a2 2 0 0 1 2-2ZM9 8.5l1.2-2h3.6l1.2 2"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinejoin="round"
      />
      <circle cx="12" cy="13" r="2.6" fill="none" stroke="currentColor" strokeWidth="1.8" />
    </svg>
  )
}

function ImageIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path
        d="M5 6.5h14a1.5 1.5 0 0 1 1.5 1.5v8a1.5 1.5 0 0 1-1.5 1.5H5A1.5 1.5 0 0 1 3.5 16V8A1.5 1.5 0 0 1 5 6.5Zm1 8 3-3 2.5 2.5 3.5-4 3.5 4.5"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle cx="8.2" cy="9.6" r="1.1" fill="currentColor" />
    </svg>
  )
}

function HomeIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path
        d="M4 10.5 12 4l8 6.5V20h-5.5v-5h-5v5H4v-9.5Z"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinejoin="round"
      />
    </svg>
  )
}

function FriendsIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path
        d="M8 12a3 3 0 1 0 0-6 3 3 0 0 0 0 6Zm8 0a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5ZM4.5 19c0-2.2 1.8-4 4-4s4 1.8 4 4M14 18c.3-1.6 1.7-2.8 3.4-2.8 1.9 0 3.4 1.5 3.4 3.3"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

function InboxIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path
        d="M4 6h16v10a2 2 0 0 1-2 2h-3.5a2.5 2.5 0 0 1-5 0H6a2 2 0 0 1-2-2V6Z"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinejoin="round"
      />
    </svg>
  )
}

function ProfileIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path
        d="M12 12a3.6 3.6 0 1 0 0-7.2 3.6 3.6 0 0 0 0 7.2ZM5 20c.3-3.1 3-5.5 6.2-5.5h1.6c3.2 0 5.9 2.4 6.2 5.5"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
    </svg>
  )
}

function StatusPersonIcon() {
  return (
    <svg viewBox="0 0 16 16" aria-hidden="true">
      <path
        d="M8 8a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5ZM3.8 13.2c.26-2.18 2.08-3.7 4.2-3.7s3.94 1.52 4.2 3.7"
        fill="currentColor"
      />
    </svg>
  )
}

function ChevronDownSmallIcon() {
  return (
    <svg viewBox="0 0 16 16" aria-hidden="true">
      <path
        d="m4.5 6.5 3.5 3 3.5-3"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

function PeoplePlusIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path
        d="M8 11a3 3 0 1 0 0-6 3 3 0 0 0 0 6ZM3.8 19c.2-2.55 2.2-4.5 4.7-4.5s4.5 1.95 4.7 4.5M17.2 8v6M14.2 11h6"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

function MenuIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path
        d="M5 7h14M5 12h14M5 17h14"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  )
}

function FootstepsIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <ellipse cx="8" cy="9" rx="2.2" ry="4.2" fill="none" stroke="currentColor" strokeWidth="1.7" />
      <ellipse cx="15.5" cy="13.8" rx="2.2" ry="4.2" fill="none" stroke="currentColor" strokeWidth="1.7" />
      <path d="M5.2 15.5c.8 1.8 2.2 2.8 4.3 3.2M13 6.1c1 .6 1.8 1.5 2.3 3" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
    </svg>
  )
}

function NewFollowersIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path
        d="M8 11a3 3 0 1 0 0-6 3 3 0 0 0 0 6Zm8-.2a2.8 2.8 0 1 0 0-5.6 2.8 2.8 0 0 0 0 5.6ZM3.8 18.6c.25-2.55 2.28-4.4 4.72-4.4 2.45 0 4.47 1.85 4.72 4.4M13.5 18.6c.25-1.9 1.85-3.3 3.72-3.3 1.93 0 3.53 1.43 3.78 3.3"
        fill="currentColor"
      />
    </svg>
  )
}

function TikTokGlyphIcon() {
  return (
    <svg viewBox="0 0 120 120" aria-hidden="true">
      <path
        d="M56 18c6 12 15 18 28 20v14c-11-1-20-4-28-10v30c0 19-13 32-31 32-18 0-31-13-31-31 0-18 13-31 31-31 3 0 6 .3 8 1v15a19 19 0 0 0-8-1.8c-9.2 0-16.5 7.4-16.5 16.8s7.3 16.8 16.5 16.8c10.8 0 16.4-7.9 16.4-19.2V18h15Z"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        opacity="0.42"
      />
      <path
        d="M53 18c6 12 15 18 28 20v14c-11-1-20-4-28-10v30c0 19-13 32-31 32-18 0-31-13-31-31 0-18 13-31 31-31 3 0 6 .3 8 1v15a19 19 0 0 0-8-1.8c-9.2 0-16.5 7.4-16.5 16.8s7.3 16.8 16.5 16.8c10.8 0 16.4-7.9 16.4-19.2V18h15Z"
        fill="none"
        stroke="#25F4EE"
        strokeWidth="2"
        opacity="0.26"
      />
      <path
        d="M59 18c6 12 15 18 28 20v14c-11-1-20-4-28-10v30c0 19-13 32-31 32-18 0-31-13-31-31 0-18 13-31 31-31 3 0 6 .3 8 1v15a19 19 0 0 0-8-1.8c-9.2 0-16.5 7.4-16.5 16.8s7.3 16.8 16.5 16.8c10.8 0 16.4-7.9 16.4-19.2V18h15Z"
        fill="none"
        stroke="#FE2C55"
        strokeWidth="2"
        opacity="0.18"
      />
    </svg>
  )
}

function GridPostsIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M4 5h4v4H4V5Zm6 0h4v4h-4V5Zm6 0h4v4h-4V5ZM4 11h4v4H4v-4Zm6 0h4v4h-4v-4Zm6 0h4v4h-4v-4ZM4 17h4v2H4v-2Zm6 0h4v2h-4v-2Zm6 0h4v2h-4v-2Z" fill="currentColor" />
    </svg>
  )
}

function LockIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path
        d="M7 10V8.2A5 5 0 0 1 17 8.2V10M6 10h12v10H6V10Z"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

function EmptyStateIcon() {
  return (
    <svg viewBox="0 0 64 64" aria-hidden="true">
      <rect x="14" y="12" width="36" height="40" rx="8" fill="none" stroke="currentColor" strokeWidth="3" />
      <path d="M22 24h20M22 32h14" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
      <circle cx="43" cy="43" r="9" fill="none" stroke="currentColor" strokeWidth="3" />
      <path d="m49.5 49.5 6 6" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
    </svg>
  )
}

function PlaySolidIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M8 6.6v10.8c0 .7.75 1.14 1.36.8l8.48-5.4a.93.93 0 0 0 0-1.58L9.36 5.8A.93.93 0 0 0 8 6.6Z" fill="currentColor" />
    </svg>
  )
}

function MicIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path
        d="M12 15.2a3.2 3.2 0 0 0 3.2-3.2V8.2A3.2 3.2 0 0 0 12 5a3.2 3.2 0 0 0-3.2 3.2V12a3.2 3.2 0 0 0 3.2 3.2Zm0 0v3.1m-4.7-6.1a4.7 4.7 0 1 0 9.4 0"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

function CardsIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <rect x="5" y="6" width="8.5" height="11" rx="2" fill="none" stroke="currentColor" strokeWidth="1.8" />
      <rect x="10.5" y="7" width="8.5" height="11" rx="2" fill="none" stroke="currentColor" strokeWidth="1.8" />
    </svg>
  )
}

function EffectsIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path
        d="M12 4 4.5 8.1v7.8L12 20l7.5-4.1V8.1L12 4Zm0 0v16M4.5 8.1 12 12l7.5-3.9"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

function ExpediaMark() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path
        d="M6 18.7V15h3.8L19 5.9V3H15.8L6.6 12.2H3v3.1h3.1v3.4H6Z"
        fill="currentColor"
      />
    </svg>
  )
}

function TakoMark() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <circle cx="12" cy="12" r="10" fill="#fff" />
      <path d="M7.2 12a4.8 4.8 0 0 1 8.6-2.9" fill="none" stroke="#21d4ff" strokeWidth="2.2" strokeLinecap="round" />
      <path d="M16.8 12A4.8 4.8 0 0 1 8.2 15" fill="none" stroke="#ff3f71" strokeWidth="2.2" strokeLinecap="round" />
      <circle cx="10" cy="11" r="1.1" fill="#10141e" />
      <circle cx="14" cy="11" r="1.1" fill="#10141e" />
    </svg>
  )
}

function CloseIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path
        d="M6 6 18 18M18 6 6 18"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  )
}

function CheckIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path
        d="m6 12.5 4 4L18 8.5"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

function VerifiedIcon() {
  return (
    <svg viewBox="0 0 20 20" aria-hidden="true" className="verified-icon">
      <circle cx="10" cy="10" r="9" fill="#2BC6FF" />
      <path
        d="m6.4 10.1 2.1 2.2 5-5"
        fill="none"
        stroke="#fff"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

function PlusIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path
        d="M12 5v14M5 12h14"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.4"
        strokeLinecap="round"
      />
    </svg>
  )
}
