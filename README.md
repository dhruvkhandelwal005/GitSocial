# GiSocial

A React + Vite web application that connects with GitHub and Supabase to provide a personalized feed of repositories from people you follow, along with user profiles, repository details, and an "Explore People" feature.

---

## **Features**

- **GitHub Integration**
  - View your GitHub profile, followers, and following.
  - Browse repositories with stats: stars, forks, watchers, issues, PRs.
  - Repository languages display.
  - Contributor list for each repository.

- **Personalized Feed**
  - Randomly shows repositories from your followers.
  - Infinite scroll to load more repositories.

- **User Management**
  - Signup / Login using Supabase authentication.
  - Username setup with automatic GitHub username detection.
  - LocalStorage caching for quick login.

- **Explore People**
  - Horizontal scroll of other users to explore and follow.
  - Click to view profiles.

- **Responsive UI**
  - Clean, modern UI designed for desktop and mobile.
  - Horizontal scrolling for explore section.
  - Dark-themed with gradients and soft shadows.

- **External Links**
  - Direct link to GitHub repositories and profiles.

---

## **Tech Stack**

- **Frontend:** React, Vite  
- **Authentication & Database:** Supabase  
- **API Integration:** GitHub REST API  
- **Styling:** Inline CSS + custom gradients & shadows  

---

## **Getting Started**

### **1. Clone the repository**


git clone https://github.com/your-username/repo-name.git
cd repo-name



2. Install dependencies
npm install

3. Configure environment variables

Create a .env file in the root:

VITE_GITHUB_TOKEN=your_github_personal_access_token


Note: Your GitHub token must have read-only access to public repos.

4. Run locally
npm run dev


The app should be available at http://localhost:5173.

