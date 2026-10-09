# AI Service Abstraction & Fallback Specification

## Overview

InternHub provides a secure backend AI abstraction service (`backend/src/services/ai/aiService.js`).

## Provider Configuration
Controlled via environment variables in `backend/.env`:
```env
AI_PROVIDER=gemini
AI_API_KEY=your_api_key_here
```

Supported Providers:
- `gemini` (Google Gemini 1.5 Flash API)
- `openai` (OpenAI GPT-4o API)

---

## Zero-Downtime Rule-Based Fallback

If `AI_API_KEY` is empty, invalid, or rate-limited:
- **Chatbot**: Responds via pattern matching and profile context.
- **Recommendations**: Executes native C++ DSA matching engine.
- **Skill Gap Analysis**: Computes set difference between student skills and job skills.
- **Resume Assistant**: Generates structured bullet point templates.
- **Interview Prep**: Pulls indexed technical question banks.

No 500 errors or application crashes occur when AI is unconfigured.
