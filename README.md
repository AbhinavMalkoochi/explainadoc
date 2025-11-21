# Next.js + Convex AI Chat Template v.0.1

This is a simple chat application built with Next.js, Convex, and Tailwind CSS. It allows users to chat with an AI assistant powered by OpenAI.

![Chat Interface Screenshot](https://github.com/waynesutton/nextjsaichatconvextemplate/blob/main/nextjscovnex-chat.png)

## Features

- Real-time chat interface using Convex and the Vercel AI SDK (`useChat`) for data synchronization and state management.
- AI responses powered by OpenAI, generated asynchronously in the background using Convex Actions to keep the UI responsive (potentially supporting multiple models via `convex/multiModelAI.ts`).
- Persistent storage of conversation history and chat sessions in the Convex database.
- Ability to clear the current chat session (managed via `convex/chats.ts`).
- Management of AI model preferences (implied by `convex/modelPreferences.ts`).
- Chat message archival functionality (implied by `convex/chat.ts`).
- User input handling with automatic textarea resizing (`react-textarea-autosize`).
- Responsive UI styled with Tailwind CSS and Shadcn/ui components.
- Toast notifications for user feedback (`hooks/use-toast.ts`).

## Getting Started (Local Development)

1.  **Clone the repository:**

    ```bash
    git clone https://github.com/waynesutton/nextjsaichatconvextemplate
    cd nextjsaichatconvextemplate
    ```

2.  **Install dependencies:**

    ```bash
    npm install
    # or
    yarn install
    # or
    pnpm install
    ```

3.  **Set up Convex:**

    - Install the Convex CLI: `npm install -g convex`
    - Login to Convex: `npx convex login`
    - Start the Convex local development server: `npx convex dev`
      - This command watches your `convex/` directory for changes and provides a local development backend.
      - Note your project's deployment URL from the `npx convex dev` output or the [Convex dashboard](https://dashboard.convex.dev).

4.  **Set up Environment Variables:**

    - Create a `.env.local` file in the root directory of your project.
    - Add your Convex development deployment URL (obtained in the previous step):
      ```env
      NEXT_PUBLIC_CONVEX_URL=<your-convex-dev-url>
      ```
    - Add your OpenAI API key to the Convex dashboard environment variables for your **development** deployment:
      - Go to your [Convex Project Settings](https://dashboard.convex.dev).
      - Navigate to "Environment Variables".
      - Add a variable named `OPENAI_API_KEY` with your OpenAI API key as the value.

5.  **Run the Next.js development server:**
    ```bash
    npm run dev
    # or
    yarn dev
    # or
    pnpm dev
    ```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Key Technologies

- **Next.js:** React framework for server-side rendering, static site generation, and client-side navigation (using App Router).
- **Convex:** Fully managed backend platform providing a real-time database, serverless functions (queries, mutations, actions), scheduling, file storage, and search.
- **Tailwind CSS:** Utility-first CSS framework for rapid UI development.
- **OpenAI API:** Used for generating conversational AI responses.
- **Vercel AI SDK (`ai` package):** Provides hooks and utilities (`useChat`) for building chat interfaces.
- **`react-textarea-autosize`:** Component for automatically adjusting textarea height based on content.
- **TypeScript:** For static typing and improved developer experience.

## Project Structure

```
nextjs-convex-demo/
├── app/
│   ├── layout.tsx           # Main application layout
│   ├── page.tsx             # Main page component (renders Chat)
│   ├── providers.tsx        # Context providers (Convex, Theme, etc.)
│   └── globals.css          # Global styles and Tailwind directives
├── components/
│   ├── chat.tsx             # Core chat UI component
│   ├── chat-message.tsx     # Renders individual messages
│   ├── convex-chat-provider.tsx # Integrates Convex with useChat
│   ├── navbar.tsx           # Application navigation bar
│   ├── footer.tsx           # Application footer
│   └── ui/                  # Shadcn/ui components (toast.tsx, button.tsx, etc.)
├── convex/
│   ├── schema.ts            # Database schema definition
│   ├── chat.ts              # Chat archival logic
│   ├── directMessages.ts    # Saving AI responses
│   ├── init.ts              # Initial data seeding
│   ├── messages.ts          # Message query/mutation functions
│   ├── modelPreferences.ts  # AI model preference logic
│   ├── multiModelAI.ts      # Core Convex Action responsible for interacting with AI models (e.g., OpenAI) asynchronously in the background.
│   ├── openai.ts            # OpenAI action wrappers (re-exports)
│   ├── useOpenAI.ts         # Direct OpenAI interaction actions
│   └── _generated/          # Auto-generated Convex types and API (DO NOT EDIT)
├── hooks/
│   └── use-toast.ts         # Custom hook for toast notifications
├── lib/
│   └── utils.ts             # Utility functions (e.g., cn for classnames)
├── public/                  # Static assets (images, fonts, etc.)
├── .env.local               # Local environment variables (Convex URL)
├── .eslintrc.json           # ESLint configuration
├── components.json          # Shadcn/ui configuration
├── next.config.js           # Next.js configuration
├── package.json             # Project dependencies and scripts
├── postcss.config.js        # PostCSS configuration (Tailwind)
├── tailwind.config.ts       # Tailwind CSS configuration
├── tsconfig.json            # TypeScript configuration
├── README.md                # Project overview and setup guide (this file)
├── convexsetup.md           # Convex-specific setup guide
├── filesjason.md            # Descriptions of project files
└── nextchatjsonprompt.md    # JSON prompt structure for the app
```

## Core Files & Project Structure

- **`app/page.tsx`**: The main entry point and layout for the application using Next.js App Router. Renders the `Chat` component.
- **`components/chat.tsx`**: The main chat interface component. It uses `useConvexChat` for state management and renders `ChatMessage` components.
- **`components/chat-message.tsx`**: Renders individual chat messages (user or assistant).
- **`components/convex-chat-provider.tsx`**: Contains the `ConvexChatProvider` and the `useConvexChat` hook, which integrates Convex with the Vercel AI SDK's `useChat` hook for managing chat state, sending messages, and handling AI responses via Convex actions.
- **`convex/schema.ts`**: Defines the database schema for Convex tables (e.g., `messages`, `chats`).
- **`convex/messages.ts`**: Contains Convex query and mutation functions related to messages (e.g., `list`, `send`).
- **`convex/chats.ts`**: Contains Convex query and mutation functions related to chat sessions (e.g., `getOrCreate`, `clear`).
- **`convex/openai.ts`**: Contains the Convex action (`chat`) responsible for interacting with the OpenAI API to generate AI responses.
- **`convex/multiModelAI.ts`**: Core Convex Action responsible for interacting with AI models (e.g., OpenAI) asynchronously in the background.
- **`convex/_generated/`**: Automatically generated files by Convex, including API definitions and types based on your schema and functions. **Do not edit directly.**
- **`.env.local`**: Local environment variables (only `NEXT_PUBLIC_CONVEX_URL` for development). Sensitive keys like `OPENAI_API_KEY` should be managed in the Convex dashboard.
- **`README.md`**: This file, providing information about the project.

## Understanding Convex

Learn more about the concepts and best practices behind Convex:

- [Convex Overview](https://docs.convex.dev/understanding/)
- [Development Workflow](https://docs.convex.dev/understanding/workflow)
- [Best Practices](https://docs.convex.dev/understanding/best-practices/)
- [TypeScript Best Practices](https://docs.convex.dev/understanding/best-practices/typescript)
- [Environment Variables](https://docs.convex.dev/production/environment-variables)
- [AI Code Generation](https://docs.convex.dev/ai)

## Deployment with Vercel

Follow these steps to deploy your application to Vercel:

1.  **Create a Vercel Account:** If you don't have one, sign up at [vercel.com](https://vercel.com).

2.  **Link Your Project:**

    - Create a new Vercel project at <https://vercel.com/new>.
    - Link it to the source code repository for your project (e.g., on GitHub, GitLab, Bitbucket).

3.  **Override the Build Command:**

    - During project setup or in the Vercel project settings ("Settings" > "General"), find the "Build & Development Settings".
    - Override the **Build Command** to: `npx convex deploy --cmd 'npm run build'`
    - If your project lives in a subdirectory of your repository, ensure the **Root Directory** setting is configured correctly.

4.  **Set Production Environment Variables in Vercel:**

    - Navigate to your Vercel project's "Settings" > "Environment Variables".
    - Add the `CONVEX_DEPLOY_KEY` for **Production**:
      - Go to your [Convex Dashboard](https://dashboard.convex.dev) > Project Settings.
      - Click the "Generate Production Deploy Key" button.
      - Copy the generated key.
      - In Vercel, create an environment variable named `CONVEX_DEPLOY_KEY`.
      - Paste the key as the value.
      - **Crucially, under "Environment", uncheck all boxes except "Production".** Click "Save".

5.  **Set Production Environment Variables in Convex:**

    - Go back to your [Convex Dashboard](https://dashboard.convex.dev) > Project Settings > Environment Variables.
    - Ensure your `OPENAI_API_KEY` is set for the **Production** environment. This is separate from your development variables.

6.  **Deploy:**
    - Click the "Deploy" button in Vercel during the initial setup, or trigger a deployment by pushing to your connected Git branch.

Vercel will now automatically deploy your Convex functions and frontend changes whenever you push to the designated branch (e.g., `main`). The `npx convex deploy` command uses the `CONVEX_DEPLOY_KEY` to push backend changes and sets the `NEXT_PUBLIC_CONVEX_URL` environment variable for the build, pointing your frontend to the correct **production** Convex deployment.

### Vercel Preview Deployments

To enable preview deployments for branches/pull requests:

1.  **Generate Preview Deploy Key:**

    - In your [Convex Dashboard](https://dashboard.convex.dev) > Project Settings, click "Generate Preview Deploy Key".
    - Copy the generated key.

2.  **Add Preview Environment Variable in Vercel:**
    - Go to your Vercel project's "Settings" > "Environment Variables".
    - Create another environment variable named `CONVEX_DEPLOY_KEY`.
    - Paste the **Preview** key as the value.
    - **Under "Environment", uncheck all boxes except "Preview".** Click "Save".

Now, when Vercel creates a preview deployment for a branch, `npx convex deploy` will use the preview key to create a unique, isolated Convex backend deployment for that preview. Your frontend preview will automatically connect to this isolated backend.

_(Optional) Set Default Preview Variables in Convex:_ If your preview deployments require specific Convex environment variables (like a default `OPENAI_API_KEY`), you can configure "Default Environment Variables" for Preview/Dev deployments in your Convex project settings.

_(Optional) Run Setup Function for Previews:_ If you need to seed data in your preview deployments, add `--preview-run 'yourFunctionName'` to the Vercel **Build Command**. For example: `npx convex deploy --cmd 'npm run build' --preview-run 'internal.setup:seedData'`

## 🤝 Contributing

We welcome contributions! Here's how you can help:

1. Fork the repository ([https://github.com/waynesutton/nextjsaichatconvextemplate](https://github.com/waynesutton/nextjsaichatconvextemplate))
2. Create your feature branch: `git checkout -b feature/amazing-feature`
3. Commit your changes: `git commit -m 'Add amazing feature'`
4. Push to the branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

## 📝 License

This project is open source and available under the MIT License.
