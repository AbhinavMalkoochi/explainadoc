# Setting up Convex with Next.js AI Chat Application

This guide will help you set up Convex as the backend database for the Next.js AI Chat application.

## Prerequisites

- Node.js installed (v16.14 or later)
- npm or yarn package manager
- A Convex account (sign up at [dashboard.convex.dev](https://dashboard.convex.dev))

## Setup Steps

1. **Install Convex CLI**

```bash
npm install -g convex
```

2. **Initialize Convex in Your Project**

```bash
npx convex init
```

This will:
- Create a new Convex project
- Generate necessary configuration files
- Add your project's URL to `.env.local`

3. **Environment Variables**

Ensure your `.env.local` file contains:

```
NEXT_PUBLIC_CONVEX_URL=your_convex_url_here
OPENAI_API_KEY=your_openai_api_key_here
```

4. **Start Convex Development Server**

In a separate terminal:

```bash
npx convex dev
```

5. **Verify Database Schema**

The schema is already set up in `convex/schema.ts` with:
- Messages table for storing chat history
- Proper indexes for querying
- User association fields

6. **Test the Connection**

Start your Next.js development server and verify that:
- The chat interface loads without errors
- Messages can be sent and received
- Real-time updates work correctly

## Troubleshooting

- If you see "No address provided to ConvexReactClient" error, ensure your `.env.local` file contains the correct Convex URL
- If messages aren't saving, check that the Convex dev server is running
- For authentication issues, verify your project's configuration in the Convex dashboard

## Production Deployment

1. Deploy your Next.js app to your preferred hosting platform
2. Add the environment variables to your hosting platform:
   - `NEXT_PUBLIC_CONVEX_URL`
   - `OPENAI_API_KEY`
3. Deploy your Convex functions using:
   ```bash
   npx convex deploy
   ```