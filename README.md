# Happily Mart Frontend

## Setup

1. Install dependencies:
```bash
npm install
```

2. Create `.env` file (if needed):
```bash
cp .env.example .env
```

3. Run development server:
```bash
npm run dev
```

4. Build for production:
```bash
npm run build
```

## Features

- User authentication (Login, Signup, OTP verification)
- Multi-step signup with timeline
- Feed page with posts and trending section
- Responsive design
- Protected routes
- State management with Zustand
- Form validation with Zod and React Hook Form

## Tech Stack

- React 18
- Vite
- Tailwind CSS
- React Router
- Zustand
- TanStack Query
- React Hook Form
- Zod
- Axios
- React Icons



notify mail or website

post req : uqc, quntatity, auto correct, company 

Ab sirf User B ke post ke baad ka flow banao jisme yeh root problems 100% solve ho:

Multiple users unlock same post → spam/confusion na ho
Unlock ke baad koi status update nahi karta → data stale na bane
Deal success/fail ka pata na chale → platform blind rahe
Fraud (fake success mark) ya ghosting na ho

Requirements (must):

Masked contact de (temp email/phone) taaki auto-detection ho sake
Har unlock ke liye alag Deal Thread ID
Auto + manual status update (Contacted → Ongoing → Success/Fail/Closed)
Mutual confirmation on Success/Fail
1–7–30–90 day reminders + auto-close after 90 days (penalty if no update)
Bonus credits on timely update, small penalty on chronic non-update
​there we have credits system , do make admin panel also with advance strong secure route 
Simple one-tap mobile dashboard for status
Basic analytics: success rate, response time

admin panel complete on different secure route make whole admin sidebar header with use location and all admin login has own access to open admin portal 




///

fix whole frontend folder and file and fix admin login after login to access admin panel and all

cookie manage use js-cookie and 

make sure backend and frontend whole work working flow properly and also do all check