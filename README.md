# PitchPro
### Train. Improve. Grow.

**A personalized soccer development platform built for the next generation of players.**

PitchPro combines structured training programs, an interactive drills library, player progression, tactical development, and AI-powered coaching into one platform.

The goal is simple: help soccer players train smarter, improve consistently, and reach their full potential.

---

## Features

### AI Soccer Coach
- AI-powered soccer coaching assistant.
- Personalized training recommendations.
- Guidance on finishing, dribbling, passing, positioning, and more.
- Match preparation and confidence development.

### Training Programs
Structured programs designed to develop every aspect of a player's game.

- Foundation Training
- Ball Mastery
- Game Intelligence
- Elite Preparation
- Mindset & Leadership
- Performance Pathway

### Drills Library
- Browse a collection of soccer training drills.
- Develop technical and tactical abilities.
- Find exercises for different skill levels.
- Complete training sessions and earn XP.

### Player Progression
- Track individual development.
- Earn XP through completed training sessions.
- Level up through consistent training.
- Progress through four player ranks:
  - Bronze Player
  - Silver Player
  - Gold Player
  - Elite Player

### Tactical IQ
- Improve positioning and movement.
- Develop decision-making.
- Understand tactical concepts.
- Practice through interactive tactical experiences.

### Player Profiles
- Personalized player dashboards.
- Customizable player information.
- Training session tracking.
- Experience and progression tracking.

---

## Tech Stack

| Technology | Purpose |
|---|---|
| Python | Backend |
| Flask | Web framework |
| Firebase Authentication | User authentication |
| Cloud Firestore | Database |
| Groq API | AI Coach |
| HTML5 | Frontend structure |
| CSS3 | Styling |
| JavaScript | Frontend functionality |

---

## Design

PitchPro features a minimalist dark interface with neon lime accents, smooth animations, and a modern visual identity.

### Color Palette

| Color | Hex |
|---|---|
| Background | `#0A0A0A` |
| Cards | `#141414` |
| Light Cards | `#1B1B1B` |
| Neon Lime | `#A3FF12` |
| Muted Text | `#A1A1AA` |
| Primary Text | `#F5F5F5` |

### Typography
- Inter
- Space Grotesk
- Ubuntu

---

## Project Structure

```text
PitchPro/
├── app.py
├── Firebasehelper.py
├── .env
├── templates/
│   ├── dashboard.html
│   ├── drills.html
│   ├── drills-library-page.html
│   ├── foundation.html
│   ├── ai-coach.html
│   ├── customize.html
│   └── ...
├── static/
│   ├── css/
│   ├── js/
│   ├── images/
│   └── ...
└── README.md
```

---

## Installation

### 1. Clone the repository

```bash
git clone https://github.com/YOUR-USERNAME/PitchPro.git
```

### 2. Navigate to the project directory

```bash
cd PitchPro
```

### 3. Install dependencies

```bash
pip install flask firebase-admin python-dotenv groq
```

Install any additional dependencies required by the project.

### 4. Configure environment variables

Create a `.env` file in the root directory and configure the Firebase and Groq credentials expected by the application.

Never commit API keys or sensitive credentials to GitHub.

### 5. Start the application

```bash
python app.py
```

Open your browser and visit:

```text
http://127.0.0.1:5000
```

---

## Security

- API keys are managed through environment variables.
- Firebase Authentication manages user accounts.
- Cloud Firestore stores player information and progress.
- Sensitive credentials should never be committed to the repository.

---

## Our Mission

PitchPro aims to make high-quality soccer development more accessible, engaging, and personalized.

By combining modern technology with proven player-development principles, PitchPro helps players improve their technical ability, tactical understanding, and overall performance.

From mastering the fundamentals to preparing for elite competition, every training session is an opportunity to improve.

---

## PitchPro

**Train. Improve. Grow.**

Built for the next generation of soccer players.
