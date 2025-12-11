# Reddit Mastermind 🎯

An AI-powered tool for generating authentic Reddit content calendars. Create natural, engaging posts and comment threads that subtly promote your company across multiple subreddits.

## 🚀 Features

- **Smart Content Generation**: Uses GPT-4 to create natural Reddit posts and comment threads
- **Persona Management**: Create multiple personas to diversify your content
- **Subreddit Targeting**: Target multiple subreddits with intelligent distribution
- **Quality Assessment**: Automatic evaluation of calendar quality with detailed feedback
- **Week Planning**: Generate weekly content calendars with proper scheduling
- **Post Editing**: Edit generated posts and comments before publishing
- **History Tracking**: View all generated weeks in timeline order

## 🏗️ Architecture

### Backend (`/backend`)
- **Framework**: Express.js with TypeScript
- **Database**: Prisma ORM with SQLite (dev) / PostgreSQL (production)
- **AI**: OpenAI GPT-4o-mini for content generation
- **Key Features**:
  - RESTful API endpoints
  - Company, Persona, and Week management
  - Post and comment generation with quality scoring
  - Week quality evaluation

### Frontend (`/reddit-mastermind`)
- **Framework**: React 19 with Vite
- **Styling**: Tailwind CSS
- **Key Features**:
  - Form-based company and persona setup
  - Calendar view with timeline
  - Post viewing and editing modals
  - Quality assessment display

## 📋 Prerequisites

- Node.js 18+ and npm
- OpenAI API key
- Git

## 🛠️ Installation

### 1. Clone the Repository
git clone https://github.com/manojtummala/OGTool_reddit.git

cd OGTool_reddit
### 2. Backend Setup
```
cd backend
npm install
```

#### Create .env file
cp .env.example .env
#### Edit .env and add your OPENAI_API_KEY

#### Initialize database
```
npx prisma generate
npx prisma migrate dev
```
#### Start development server
```npm run dev```

### 3. Frontend Setup
```
cd reddit-mastermind
npm install
```

#### Create .env file
```cp .env.example .env```

#### Edit .env and set VITE_API_BASE=http://localhost:3000

#### Start development server
```npm run dev```

## 🎯 Usage Flow

### Step 1: Set Up Company Profile
1. Enter your **Company Name** (e.g., "Slideforge")
2. Enter **Company Description** (what your company does)
3. Click **Save Data**

### Step 2: Create Personas
1. Click **+ Add Persona**
2. Enter a **Username** (e.g., "u/tech_enthusiast")
3. Add a **Description** (personality/background)
4. Save the persona
5. Repeat for 2+ personas (minimum 2 required)

### Step 3: Add Target Subreddits
1. Enter subreddit name (e.g., "startups")
2. Click **Add**
3. Add multiple subreddits as needed

### Step 4: Configure Posts Per Week
1. Use the slider to set desired posts (1-13)
2. Default is 3 posts per week

### Step 5: Generate Calendar
1. Click **Generate Calendar**
2. Wait for AI to generate posts and comments
3. Review the generated calendar on the right panel

### Step 6: Review Quality Assessment
- Check the **Quality Assessment** section for each week
- Review **Strengths** and **Issues**
- Note the **Overall Score** and **Adjusted Quality Score**

### Step 7: Edit Posts (Optional)
1. Click on any post to view details
2. Click **Edit** to modify post or comments
3. Save changes

### Step 8: Generate Next Week
1. Click **Generate next week** button
2. System automatically calculates next week's start date
3. New week appears in timeline

## 🔧 API Endpoints

### Company Management
- `POST /save/all` - Save company, personas, and targets
- `GET /company` - Get all companies

### Week Generation
- `POST /generate/week` - Generate a new week calendar
- `GET /week/company/:companyId` - Get all weeks for a company
- `GET /generate/week/latest?companyId=xxx` - Get latest week

### Post Management
- `PUT /post/update-with-comments` - Update post and comments

## 📊 Quality Metrics

The system evaluates calendar quality based on:

1. **Persona Variety**: Ensures different personas are used across posts
2. **Subreddit Distribution**: Prevents overposting (max 2 posts per subreddit per week)
3. **Keyword Variety**: Checks for keyword repetition
4. **Content Quality**: Based on post length, engagement, and targeting

**Quality Score Calculation:**
- Base score: 40-60 (randomized)
- Body quality: 0-25 (based on length)
- Engagement: 0-15 (comment count)
- Targeting: 0-10 (keyword count)
- Adjustments: -10 to -15 for issues detected

## 🧪 Testing Recommendations

1. Vary Personas: Test with 2, 5, and 10 personas

2. Multiple Subreddits: Test with 1, 3, and 7 subreddits

3. Different Companies: Test with various company types

4. Edge Cases:

- Same company name (should update, not duplicate)

- Duplicate personas (should handle gracefully)

- Overposting detection

- Keyword overlap