# 🌍 Tourgether

**Bridging the "Experience Paradox" in the Tourism Industry.**

Tourgether is a B2B platform connecting newly graduated tourism students with established tour companies. It provides a secure environment for fresh graduates to land their first gigs (like assistant guiding or shadowing) while giving organizations a reliable, data-driven way to evaluate and hire emerging talent.

---

## ✨ Key Features

* **Role-Based Workflows:** Distinct portals and dashboards for **Guides** (Students) and **Organizations** (Businesses).
* **AI-Powered Feedback Loop:** Automatically processes raw traveler feedback (images, PDFs, text) using the Gemini 1.5 Flash API to generate professional performance summaries and sentiment scores for guides.
* **Dynamic Guide Portfolios:** Students can build professional profiles featuring their verified academic achievements, language skills, and AI-summarized tour performance metrics.
* **Tour & Itinerary Management:** Organizations can create detailed tour listings, build itineraries, and manage gig applications.
* **Community Feed:** A built-in social network for guides and businesses to connect, share experiences, and post updates.

---

## 🛠️ Tech Stack

This project is built with a modern, type-safe Next.js ecosystem.

* **Framework:** Next.js (App Router with React Server Components)
* **Language:** TypeScript
* **API Layer:** tRPC (End-to-end type safety)
* **Database:** PostgreSQL
* **ORM:** Drizzle ORM
* **Authentication:** Better Auth (Email/Password + Username Plugin)
* **Styling:** Tailwind CSS + shadcn/ui
* **Storage:** AWS S3 (File and image uploads)
* **AI Integration:** Google Gemini API (Multimodal feedback processing)

---

## 📂 Project Structure

```bash
├── src/
│   ├── app/                  # Next.js App Router (Pages & Layouts)
│   │   ├── (auth)/           # /signin, /signup, /onboarding
│   │   ├── student/          # Guide dashboard and gig listings
│   │   ├── business/         # Organization tour management
│   │   ├── tour/             # Tour details and itinerary views
│   │   └── feed/             # Social network feed
│   ├── components/           # Reusable UI (shadcn/ui, TourCard, ItineraryBuilder)
│   ├── server/
│   │   ├── routers/          # tRPC Routers (tour, tourGuide, reviews, ai-feedback)
│   │   └── trpc.ts           # tRPC configuration and context
│   ├── schema/               # Drizzle database schemas
│   │   ├── auth-schema.ts
│   │   ├── tour.ts           # Tours, itineraries, guides, organizations, reviews
│   │   └── social-media.ts   
│   └── lib/                  # Utilities (Gemini helper, S3 file processors)
```

---

## 🚀 Getting Started

### Prerequisites
* Node.js (v18+)
* PostgreSQL running locally or via a cloud provider (e.g., Supabase, Neon)
* AWS S3 Bucket credentials
* Google Gemini API Key

### Installation (for developers)

1.  **Clone the repository:**
    ```bash
    git clone https://github.com/yourusername/tourgether.git](https://github.com/NgTHung/Tourgether.git
    cd Tourgether
    ```

2.  **Install dependencies:**
    ```bash
    npm install
    ```

3.  **Set up environment variables:**
    Create a `.env` file in the root directory and add your keys:
    ```env
    # Database
    DATABASE_URL="postgresql://user:password@localhost:5432/tourgether"

    # Authentication (Better Auth)
    BETTER_AUTH_SECRET="your_auth_secret"
    NEXT_PUBLIC_APP_URL="http://localhost:3000"

    # AWS S3 Storage
    AWS_ACCESS_KEY_ID="your_access_key"
    AWS_SECRET_ACCESS_KEY="your_secret_key"
    AWS_REGION="your_region"
    AWS_BUCKET_NAME="your_bucket_name"

    # AI Integration
    GEMINI_API_KEY="your_gemini_api_key"
    ```

4.  **Run database migrations:**
    ```bash
    npm run db:push
    # or
    npx drizzle-kit push:pg
    ```

5.  **Start the development server:**
    ```bash
    npm run dev
    ```
    The application will be available at \`http://localhost:3000\`.

---

## 🤖 The AI Feedback Workflow

Tourgether utilizes **Gemini 1.5 Flash** to solve the information asymmetry in guide hiring:
1.  **Input:** Tour companies upload raw traveler feedback (scanned paper forms, PDFs, or text dumps) to the platform (stored in S3).
2.  **Processing:** The backend extracts the text/images and batches them into a single multimodal prompt.
3.  **Output:** Gemini evaluates the data to extract the guide's "Producer Surplus"—highlighting specific soft skills, calculating a sentiment score, and providing constructive improvements.
4.  **Result:** The guide receives a verified performance badge added directly to their digital portfolio.

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
