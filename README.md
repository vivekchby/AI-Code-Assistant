# 🤖 AI Code Review Assistant

An AI-powered code review platform that analyzes source code, detects issues, calculates complexity, and provides intelligent code reviews with corrected code suggestions.

## 🚀 Features

- 🔍 Static code analysis
- 🤖 AI-generated code reviews and suggestions
- 📊 Time and Space Complexity Analysis
- 🐞 Issue detection across multiple programming languages
- 💡 Corrected code generation
- 📂 File upload support
- 📈 Dashboard with review statistics
- 🔐 User Authentication (JWT)
- 🌙 Light/Dark Theme Support
- 📜 Review History Management

---

## 🛠️ Tech Stack

### Frontend
- React.js
- Vite
- Tailwind CSS
- React Router DOM
- Axios
- Monaco Editor
- Framer Motion
- React Hot Toast

### Backend
- Node.js
- Express.js
- Supabase (PostgreSQL)
- JWT Authentication
- Multer
- ESLint

### AI & Analysis
- AI-based code review generation
- Complexity analysis engine
- Multi-language issue detection

---

## 📁 Project Structure

```bash
AI-Code-Assistant
│
├── frontend
│   ├── src
│   ├── public
│   └── package.json
│
├── backend
│   ├── controllers
│   ├── routes
│   ├── services
│   ├── config
│   ├── uploads
│   └── package.json
│
└── README.md
```

---

## 🌐 Supported Languages

- JavaScript
- TypeScript
- Java
- Python
- C
- C++
- C#
- Go
- PHP

---

## ⚙️ Installation

### Clone Repository

```bash
git clone https://github.com/your-username/AI-Code-Assistant.git
cd AI-Code-Assistant
```

---

# Backend Setup

```bash
cd backend
npm install
npm run dev
```

Create `.env`

```env
PORT=5000

SUPABASE_URL=your_supabase_url
SUPABASE_KEY=your_supabase_key

JWT_SECRET=your_jwt_secret

OPENAI_API_KEY=your_openai_api_key
```

---

# Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

Create `.env`

```env
VITE_API_URL=http://localhost:5000/api
```

---

## 🚀 Deployment

### Backend (Render)

```env
PORT=5000
SUPABASE_URL=
SUPABASE_KEY=
JWT_SECRET=
OPENAI_API_KEY=
```

### Frontend (Vercel)

```env
VITE_API_URL=https://your-backend.onrender.com/api
```

---

## 📸 Screenshots

### Dashboard
- Code Editor
- Complexity Analysis
- AI Review
- Review Statistics

### Authentication
- Login Page
- Register Page

---

## 📡 API Endpoints

### Authentication

```http
POST /api/auth/register
POST /api/auth/login
```

### Reviews

```http
POST /api/reviews/full-review
GET /api/reviews/:userId
GET /api/reviews/review/:id
DELETE /api/reviews/:id
```

---

## 🎯 Future Enhancements

- Code execution sandbox
- GitHub integration
- Team collaboration
- AI chat assistant
- Download review reports
- Advanced code metrics

---

## 👨‍💻 Author

Vivek Chaubey

B.Tech CSE (Data Science)  
Punjab Engineering College, Chandigarh


---

## ⭐ Contributing

Contributions, issues, and feature requests are welcome!

---

## 📄 License

This project is licensed under the MIT License.

---

### If you found this project useful, please consider giving it a ⭐ on GitHub!
