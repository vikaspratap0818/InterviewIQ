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
 <img width="1912" height="917" alt="Screenshot 2026-04-12 214847" src="https://github.com/user-attachments/assets/461986b7-1c52-4514-817f-ce29d1220782" />
*Track your progress and review past interview performance.*

### 2. **Resume Upload & Context**
<img width="1919" height="879" alt="Screenshot 2026-04-12 214906" src="https://github.com/user-attachments/assets/2e0e8942-9e9f-4c9f-b99c-68548fd4b8a5" />

*Upload your resume to personalize your interview experience.*

### 3. **Live AI Interview**
<img width="1919" height="917" alt="image" src="https://github.com/user-attachments/assets/2a7f6885-4652-418c-9039-05cae4f08519" />

*Practice in real-time with an AI interviewer and integrated code editor.*

<img width="1918" height="918" alt="Screenshot 2026-04-12 214951" src="https://github.com/user-attachments/assets/483a9221-1c6e-4d62-8806-d97beab40efd" />
*AI Voice interview where Voice to text and text to voice will questioning and Answering*

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

The application should now be running at `http://localhost:5173`.

---

## 📜 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
