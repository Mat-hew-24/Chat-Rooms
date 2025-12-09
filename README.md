This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.

# WHAT ALL PACKAGES USED

nodemon (rerun server)
concurrently (run frontend and backend together)
socket-io (comms)
cors (permission)

## GUIDE (on what I did)

-> Okay so first of all I created a backend folder and split the process

-> I made both backend and frontend run together with a npm package called concurrently (use it in the package.json of root folder)

---

## 📁 Project File Structure Overview

### Frontend (Next.js App Router)

#### **Core Application Files**

- **`app/page.tsx`** - Main page component displaying chat rooms and chat interface
- **`app/layout.tsx`** - Root layout wrapping the app with SocketProvider
- **`app/globals.css`** - Global styles using Tailwind CSS

#### **Components**

- **`app/components/SocketContext.tsx`** - Socket.IO context provider for managing WebSocket connections globally
- **`app/components/Messagebar.tsx`** - Input bar for joining rooms and sending messages
- **`app/components/Chatroom.tsx`** - Main chat display showing all messages in the current room
- **`app/components/Chatroombox.tsx`** - Individual chat room card component (currently static)
- **`app/components/Chatmessage.tsx`** - Message bubble component with user/others styling

#### **Configuration Files**

- **`package.json`** - Frontend dependencies and scripts (includes concurrently for running both servers)
- **`tsconfig.json`** - TypeScript configuration
- **`next.config.ts`** - Next.js configuration
- **`eslint.config.mjs`** - ESLint configuration
- **`postcss.config.mjs`** - PostCSS configuration for Tailwind
- **`.gitignore`** - Git ignore patterns

### Backend (Node.js + Socket.IO Server)

#### **Server Files**

- **`backend/server.js`** - Express + Socket.IO server handling room management and message broadcasting
  - Listens on port 5000
  - Handles `join_room`, `leave_room`, and `send_msg` events
  - Uses CORS for cross-origin requests

#### **Backend Configuration**

- **`backend/package.json`** - Backend dependencies (socket.io, cors, express)

### Key Features Implemented

1. **Real-time Communication**: Socket.IO enables instant message delivery
2. **Room-based Chat**: Users can join specific rooms and communicate within them
3. **Shared Socket Context**: Single WebSocket connection shared across all components
4. **TypeScript**: Full type safety throughout the application
5. **Message History**: Messages persist in state while user stays in room

### How It Works

1. User enters a room name and clicks join → emits `join_room` event
2. User types message and sends → emits `send_msg` with room and message data
3. Server broadcasts message to all users in that room except sender
4. Other clients receive message via `recieve_msg` event
5. Messages display in real-time with different styling for sender vs others
