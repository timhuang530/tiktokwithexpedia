# TTwithExpedia

TT-style travel demo that combines short-form video sharing with Expedia business chat responses.

## Stack

- React
- TypeScript
- Vite

## Highlights

- TT-style feed, inbox, friends, profile, and chat screens
- Share-to-chat flow with half-screen preview
- Expedia business chat demo with scripted travel responses
- Shared video cards rendered from the real first frame of `feed-video.mp4`

## AI Reply Mode

- Expedia freeform replies can call DeepSeek from the frontend when Vite environment variables are provided
- Expedia keeps the fixed welcome message and the fixed feed-share script chain unchanged
- Only later freeform Expedia replies are handled by AI, using recent chat history as context
- Friend chats can also call DeepSeek, but each friend uses a different persona prompt to stay casual and human
- If DeepSeek is not configured or the request fails, the app falls back to the existing scripted Expedia and friend reply flow

## Environment Variables

Create a local `.env` file from `.env.example`, or configure the same keys in Tencent Cloud static hosting:

```bash
VITE_DEEPSEEK_API_KEY=your_deepseek_api_key
VITE_DEEPSEEK_MODEL=deepseek-v4-flash
VITE_DEEPSEEK_API_URL=https://api.deepseek.com/chat/completions
```

## Tencent Cloud

For Tencent Cloud static deployment, use these values:

- Project framework: `Other`
- Runtime: `Node.js`
- Target directory: `./`
- Install command: `npm install`
- Build command: `npm run build`
- Output directory: `./dist`
- Deploy path: `/`

Then add the `VITE_DEEPSEEK_*` variables in the environment variable section if you want AI replies enabled.
