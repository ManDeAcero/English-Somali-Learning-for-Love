# 🌍 Somali Learning PWA

A culturally-sensitive progressive web app for learning Somali language, featuring authentic pronunciation, gamified progression, and respectful cultural guidance.

![Somali Learning PWA](https://img.shields.io/badge/PWA-Somali%20Learning-blue)
![React](https://img.shields.io/badge/React-18-blue)
![FastAPI](https://img.shields.io/badge/FastAPI-Python-green)
![MongoDB](https://img.shields.io/badge/Database-MongoDB-green)

## ✨ Features

### 🎯 **Learning Experience**
- **Authentic Somali vocabulary** from basic greetings to romantic expressions
- **Google Text-to-Speech integration** with speed controls (Normal, Slow, Ultra Slow)
- **English phonetic transcriptions** designed for English speakers
- **Cultural sensitivity system** with respect guidelines for romantic content
- **Progressive tier unlocking** based on points and cultural acknowledgment

### 🎮 **Gamification**
- **Level progression** with points, streaks, and badges
- **Interactive quizzes** with multiple choice questions
- **Favorites system** with quiz mode for saved words
- **Achievement badges** for learning milestones

### 🔊 **Pronunciation Help**
- **Comprehensive pronunciation guide** with vowel/consonant breakdowns
- **Individual word help** with common mistake warnings
- **Sound pattern explanations** (e.g., "ca" = "kah", not "cat")
- **Audio generation** with real Somali pronunciation

### 📱 **PWA Features**
- **Offline functionality** with service worker caching
- **Mobile-first responsive design**
- **Install as native app** on mobile and desktop
- **Anki export** for flashcard integration

## 🏗️ Architecture

### Frontend (React 18)
- Modern React with hooks and context
- Tailwind CSS with custom design system
- PWA capabilities with service worker
- Responsive mobile-first design

### Backend (FastAPI)
- Python FastAPI with async/await
- Google Cloud Text-to-Speech integration
- MongoDB with Motor async driver
- RESTful API with comprehensive endpoints

### Database (MongoDB)
- User progress tracking
- Vocabulary management with cultural metadata
- Audio caching for performance
- Quiz session storage

## 🚀 Quick Start

### Prerequisites
- Docker and Docker Compose
- Domain name (for production)
- Google Cloud Text-to-Speech API key

### Development Setup

1. **Clone the repository**:
```bash
git clone https://github.com/yourusername/somali-learning-pwa.git
cd somali-learning-pwa
```

2. **Set up environment variables**:
```bash
# Backend environment
echo 'MONGO_URL="mongodb://localhost:27017"
DB_NAME="somali_learning_pwa"
GOOGLE_TTS_API_KEY="your-api-key-here"' > backend/.env

# Frontend environment
echo 'REACT_APP_BACKEND_URL=http://localhost:8001' > frontend/.env
```

3. **Start with Docker Compose**:
```bash
docker-compose up -d --build
```

4. **Initialize the database**:
```bash
curl -X POST "http://localhost:8001/api/somali/words/seed"
```

5. **Access the application**:
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:8001/api
   - Database: MongoDB on localhost:27017

## 🌐 Production Deployment

For detailed self-hosting instructions, see [DEPLOYMENT.md](./DEPLOYMENT.md).

### Quick Production Steps:
1. Get Google TTS API key
2. Configure domain and SSL
3. Set production environment variables
4. Deploy with Docker Compose
5. Configure reverse proxy (Nginx/Cloudflare)
6. Seed database with vocabulary

## 📚 API Documentation

Once running, visit http://localhost:8001/docs for interactive API documentation.

### Key Endpoints:
- `GET /api/somali/words` - Get vocabulary words
- `POST /api/tts/audio/synthesize` - Generate Somali pronunciation
- `GET /api/progress/users/{user_id}/progress` - User learning progress
- `POST /api/quiz/quiz/generate` - Create vocabulary quiz

## 🎨 UI Components

Built with a custom design system featuring:
- **Gradient themes** with Somali cultural colors
- **Interactive animations** and micro-interactions
- **Accessibility** with proper ARIA labels and keyboard navigation
- **Mobile-optimized** touch interactions

## 🔒 Cultural Sensitivity

The app includes built-in cultural respect features:
- **Progressive content unlocking** with cultural guidelines
- **Respectful romantic phrase handling** with appropriate warnings
- **Cultural context tips** for proper usage
- **Community guidelines** embedded in the learning process

## 📊 Learning Analytics

Track your progress with:
- **Vocabulary mastery** by tier and category
- **Pronunciation practice** tracking
- **Quiz performance** analytics
- **Learning streaks** and consistency metrics

## 🛠️ Development

### Tech Stack
- **Frontend**: React 18, Tailwind CSS, Vite
- **Backend**: FastAPI, Python 3.11+
- **Database**: MongoDB 7.0+
- **External APIs**: Google Cloud Text-to-Speech
- **Deployment**: Docker, Nginx

### Project Structure
```
somali-learning-pwa/
├── frontend/          # React PWA application
├── backend/           # FastAPI backend service
├── docker-compose.yml # Development orchestration
├── DEPLOYMENT.md      # Production deployment guide
└── README.md          # This file
```

### Contributing
1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 Vocabulary Content

The app includes carefully curated Somali vocabulary across 5 progressive tiers:

1. **Soo Booqo Starter** - Basic greetings and essentials
2. **Salaan Smooth** - Compliments and basic romance
3. **Wadahadal Wizard** - Deeper conversation skills
4. **Jacayl Journey** - Romantic expressions and emotional depth
5. **Smooth Talker Pro** - Advanced poetic romance and commitment

Each word includes:
- Somali text with English translation
- English-friendly phonetic transcription
- Cultural usage guidelines (DO/DON'T)
- Example sentences with context
- Difficulty level and point value

## 🤝 Acknowledgments

- **Somali linguistic research** for authentic pronunciation patterns
- **Cultural consultancy** for respectful content guidelines
- **Google Cloud TTS** for high-quality Somali voice synthesis
- **Open source community** for the foundational technologies

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🔗 Links

- **Live Demo**: [Your deployed app URL]
- **API Docs**: [Your API documentation URL]
- **Issues**: [GitHub Issues](https://github.com/yourusername/somali-learning-pwa/issues)

---

**Made with ❤️ for the Somali learning community**

*Start your journey to conversational Somali fluency today with culturally-aware, authentic pronunciation!*
