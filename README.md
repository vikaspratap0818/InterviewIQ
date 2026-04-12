# AI Interview Platform 🚀

A modern, AI-powered interview preparation platform designed to help candidates practice their skills through realistic, role-specific simulations. This platform combines a Resume Extraction Engine, AI Interviewer, and Live Voice Practice to provide an immersive interview experience.

---

## 🌟 Key Features

### 📄 **Resume Extraction Engine**
- Upload resumes in **PDF, DOCX, or TXT** formats.
- AI-driven parsing extracts skills, experience, and projects.
- Contextualizes interview questions based on your specific background.

### 🤖 **AI-Powered Interviewer**
- Role-specific personas (Senior Tech Lead, HR Manager, Startup Founder, FAANG Engineer).
- Dynamic question generation tailored to your experience level.
- Adaptive follow-up questions based on your previous answers.

### 🎙️ **Live Voice Practice**
- Real-time **Speech-to-Text (STT)** using the Web Speech API.
- **Text-to-Speech (TTS)** for a natural, conversational AI interviewer experience.
- Interactive chat with interim feedback and final transcriptions.

### 💻 **Integrated Code Editor**
- Solve coding challenges in a professional editor (Monaco Editor).
- Execute code and run test cases directly in the browser.
- AI feedback on code quality, complexity, and optimal solutions.

### 📊 **Performance Analytics**
- Detailed score breakdowns for Technical, Communication, Problem Solving, and Confidence.
- Interactive radar charts for competency mapping.
- AI-generated feedback reports with strengths and areas for improvement.

---

## 🛠️ Tech Stack

### **Frontend**
- **React 18** & **Vite**
- **Tailwind CSS** (Styling)
- **Framer Motion** (Animations)
- **Lucide React** (Icons)
- **Recharts** (Data Visualization)
- **Monaco Editor** (Coding Interface)
- **Socket.io-client** (Real-time updates)

### **Backend**
- **Node.js** & **Express**
- **MongoDB** with **Mongoose**
- **Google Gemini API** (AI Engine: gemini-2.0-flash)
- **Multer** & **PDF-Parse** (Resume Processing)
- **Socket.io** (Real-time communication)

---

## 📸 Prototype Screenshots

> **Note**: Add your screenshots to a `docs/screenshots` folder to display them here.

### 1. **Dashboard & Analytics**
![Dashboard Placeholder](https://via.placeholder.com/800x450?text=Dashboard+%26+Analytics)
*Track your progress and review past interview performance.*

### 2. **Resume Upload & Context**
![Setup Placeholder](https://via.placeholder.com/800x450?text=Interview+Setup)
*Upload your resume to personalize your interview experience.*

### 3. **Live AI Interview**
![Interview Placeholder](https://via.placeholder.com/800x450?text=Live+AI+Interview)
*Practice in real-time with an AI interviewer and integrated code editor.*

---

## 🚀 Getting Started

### **Prerequisites**
- [Node.js](https://nodejs.org/) (v18+)
- [MongoDB](https://www.mongodb.com/) (Local or Atlas)
- [Google Gemini API Key](https://aistudio.google.com/app/apikey)

### **Installation**

1. **Clone the repository**:
   ```bash
   git clone <your-repo-url>
   cd ai-interview-platform
   ```

2. **Frontend Setup**:
   ```bash
   # Install dependencies
   npm install

   # Set up environment variables
   cp .env.example .env
   # Update VITE_API_URL and other variables in .env
   ```

3. **Backend Setup**:
   ```bash
   cd server
   # Install dependencies
   npm install

   # Set up environment variables
   cp .env.example .env
   # Add your GEMINI_API_KEY and MONGODB_URI in .env
   ```

### **Running the Application**

1. **Start the Backend**:
   ```bash
   cd server
   npm run dev
   ```

2. **Start the Frontend**:
   ```bash
   # In a new terminal
   npm run dev
   ```

The application should now be running at `<FRONTEND_URL>`.

---

## 📜 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
