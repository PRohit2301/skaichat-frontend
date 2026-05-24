# Skai Chat — Frontend

> Apple-level UI for a 1-to-1 real-time messaging application. Built with React, Vite, Tailwind CSS, Zustand, and Axios. Features Light/Dark/Custom themes, read receipts, friend request system, and full JWT authentication flow.

---

## Live Demo

| Service | URL |
|---------|-----|
| Frontend App | `https://skai-chat.vercel.app` |
| Backend API | `https://your-app.onrender.com` |

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | React 18 + Vite |
| Styling | Tailwind CSS |
| State Management | Zustand |
| HTTP Client | Axios (JWT interceptor) |
| Routing | React Router v6 |
| Hosting | Vercel (free tier) |

---

## Pages

| Route | Access | Description |
|-------|--------|-------------|
| `/signup` | Public | Register with username, phone, password (5 rules + strength bar) |
| `/login` | Public | Sign in with phone + password |
| `/` | Protected | Main chat — conversation list + active chat window |
| `/contacts` | Protected | Search users, send/accept/decline friend requests |
| `/profile` | Protected | Edit username, about — phone read-only |
| `/settings` | Protected | Change password, phone, theme — delete account |
| `/*` | Public | 404 not found |

---

## Project Structure

```
src/
│
├── main.jsx                    ← Entry point, Router wrapper
├── App.jsx                     ← All 7 routes defined
│
├── pages/
│   ├── SignupPage.jsx          ← /signup
│   ├── LoginPage.jsx           ← /login
│   ├── ChatPage.jsx            ← / (main app)
│   ├── ContactsPage.jsx        ← /contacts
│   ├── ProfilePage.jsx         ← /profile
│   ├── SettingsPage.jsx        ← /settings
│   └── NotFoundPage.jsx        ← /*
│
├── components/
│   ├── PrivateRoute.jsx        ← JWT guard, redirects to /login
│   ├── Topbar.jsx              ← Shared navigation bar
│   ├── ChatWindow.jsx          ← Messages + input panel
│   ├── ConversationList.jsx    ← Left panel chat list
│   ├── MessageBubble.jsx       ← Single message + read receipts
│   └── Avatar.jsx              ← Initials circle (PS, RV etc.)
│
├── store/
│   ├── authStore.js            ← Current user + JWT token (Zustand)
│   └── themeStore.js           ← Theme + accent color (Zustand)
│
└── api/
    └── axios.js                ← Base URL + JWT auto-attach interceptor
```

---

## Features

### Authentication
- Phone number + password login
- Live password strength indicator
- 5-rule validation (uppercase, lowercase, number, special char, 8+ chars)
- JWT stored in Zustand memory — never in localStorage (XSS safe)
- Auto-redirect to login on token expiry

### Messaging
- 1-to-1 conversations
- Real-time message display
- Read receipts — ✓ sent · ✓✓ delivered · ✓✓ blue read
- Message input locked when contact removed
- Conversation list sorted by last message time

### Contacts
- Search users by name or phone number
- Send friend request → button changes to "Pending"
- Accept / Decline incoming requests
- Cancel sent requests
- Remove accepted contact — old messages preserved, input locked
- Notification bell shows pending request count

### Theme System
- Light mode — white background, dark text
- Dark mode — true black (#000), white text
- Custom mode — user picks accent color
- "Skai" wordmark adapts to theme (dark → white)
- "Chat" wordmark stays #007AFF always
- Theme preference saved to PostgreSQL, syncs across devices on login

### Profile
- Editable username and about
- Phone number read-only (change via settings)
- Member since date
- Sign out clears JWT and redirects to login

### Settings
- Change password (requires current password)
- Change phone number (requires password verification)
- Theme picker (Light / Dark / Custom)
- Delete account — password + type "DELETE" confirmation
  - Hard deletes all messages, conversations, friend requests, and user

---

## Getting Started

### Prerequisites
- Node.js 18+
- npm or yarn

### Local Setup

**1. Clone the repository**
```bash
git clone https://github.com/yourusername/skaichat-frontend.git
cd skaichat-frontend
```

**2. Install dependencies**
```bash
npm install
```

**3. Configure environment**

Create `.env` file:
```env
VITE_API_BASE_URL=http://localhost:8080
```

**4. Run the development server**
```bash
npm run dev
```

App runs at `http://localhost:5173`

---

## API Integration

All API calls go through `src/api/axios.js`:

```javascript
import axios from 'axios';
import { useAuthStore } from '../store/authStore';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
});

// Auto-attach JWT to every request
api.interceptors.request.use((config) => {
  const token = useAuthStore.getState().token;
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;
```

Every protected API call automatically includes the JWT token — no manual header setting needed anywhere in the app.

---

## Design System

| Token | Value |
|-------|-------|
| Primary accent | `#007AFF` (Apple blue) |
| Border radius | `10px` inputs · `12px` buttons · `20px` cards |
| Input height | `46px` (Apple minimum tap target) |
| Card style | Glassmorphism — `backdrop-filter: blur(40px)` |
| Font | SF Pro Display / System UI |
| Dark bg | `#000000` (true black) |
| Dark card | `rgba(28, 28, 30, 0.9)` |
| Success | `#34c759` |
| Error | `#ff3b30` |
| Warning | `#ff9500` |

---

## Route Protection

`PrivateRoute.jsx` wraps all protected pages:

```jsx
const PrivateRoute = ({ children }) => {
  const token = useAuthStore((state) => state.token);
  return token ? children : <Navigate to="/login" replace />;
};
```

If JWT is missing or cleared (logout/expiry), user is redirected to `/login` automatically.

---

## Deployment

Deployed on **Vercel** free tier.

```bash
# Build for production
npm run build

# Preview production build locally
npm run preview
```

Vercel auto-deploys on every push to `main` branch.

---

## Environment Variables

| Variable | Description |
|----------|-------------|
| `VITE_API_BASE_URL` | Backend API URL (Render URL in production) |

---

*Skai Chat Frontend · Built with ❤️ using React + Tailwind CSS*
