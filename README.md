# 📝 AI-Powered Blogging Platform

## 🚀 Overview

This is a **full-stack blogging platform** built using modern web technologies.
The application allows users to create, read, and manage blog posts with **role-based access control** and **AI-generated summaries**.

---

## 🎯 Features

### 👤 User Roles

* **Author**

  * Create blog posts
  * Edit their own posts
  * View comments on their posts

* **Viewer**

  * Read blog posts
  * View AI-generated summaries
  * Comment on posts

* **Admin**

  * View all posts
  * Edit any post
  * Monitor comments

---

### 📝 Blog Features

* Create, edit, and display blog posts
* Featured image support
* Comments system
* Search functionality
* Pagination for post listing

---

### 🤖 AI Integration

* Automatically generates a **~200-word summary** when a post is created
* Uses **Google AI API**
* Summary is stored in database to avoid repeated API calls

---

## 🛠️ Tech Stack

* **Frontend + Backend:** Next.js
* **Authentication:** Supabase Auth
* **Database:** Supabase
* **AI Integration:** Google AI API
* **Styling:** Tailwind CSS
* **Version Control:** Git + GitHub
* **Deployment:** Vercel

---

## 🗄️ Database Schema

### Users

* id
* name
* email
* role

### Posts

* id
* title
* body
* image_url
* author_id
* summary

### Comments

* id
* post_id
* user_id
* comment_text

---

## 🔐 Authentication Flow

* Users sign up/login using Supabase Auth
* Each user is assigned a role
* Role-based access is enforced for all actions

---

## ⚙️ Key Functionalities

### 📝 Post Creation Flow

1. Author submits blog form
2. Backend API receives request
3. Google AI generates summary
4. Post + summary stored in database

---

### 🤖 AI Summary Flow

Post → API → Google AI → Summary → Database → Display

---

## 💸 Cost Optimization

* Summary generated **only once per post**
* Stored in database to avoid repeated API calls
* Optimized prompts to reduce token usage

---

## 🐞 Challenges & Fixes

**Issue:** AI summary was not generating
**Cause:** Environment variables not configured properly
**Fix:** Corrected `.env` setup and restarted server

---

## 📦 Installation & Setup

```bash
git clone https://github.com/your-username/blogging-platform.git
cd blogging-platform
npm install
npm run dev
```

---

## 🔑 Environment Variables

Create a `.env.local` file and add:

```
NEXT_PUBLIC_SUPABASE_URL=your_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_key
GOOGLE_AI_API_KEY=your_api_key
```

---

## 🚀 Deployment

* Push code to GitHub
* Connect repository to Vercel
* Add environment variables
* Deploy

---

## 🧠 AI Tools Used

**Tool:** Cursor

**Why Chosen:**

* Fast development
* Helps generate boilerplate code
* Assists in debugging

**How It Helped:**

* Generated API routes
* Assisted with Supabase integration
* Improved development speed

---

## 📈 Key Learnings

* Full-stack application development
* Role-based access control
* API integration
* AI-based feature implementation

---

## 🙌 Conclusion

This project demonstrates the ability to build a scalable full-stack system with AI integration and real-world features.

--

