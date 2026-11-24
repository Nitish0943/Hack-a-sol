# KrishiSetu Global AI Voice Command Assistant — Developer & User Runbook

## 1. Quick Start

### Starting the Backend
```bash
cd backend
# With virtual environment activated:
uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
```

### Starting the Frontend
```bash
cd frontend
npm run dev
```
Open `http://localhost:3000` in Google Chrome, Microsoft Edge, or any modern Web Speech-compatible browser.

---

## 2. Using the Voice Assistant in the Browser

1. **Log In with a Demo Account**:
   - Go to `http://localhost:3000/login`.
   - Click any 1-Click Demo Profile (e.g., **Ramesh Kumar (Small Landowner)**, **Suresh Verma (Medium Farmer)**, or **Mohan Sahu (Tenant Farmer)**).
2. **Locate the Assistant**:
   - Look for the circular green microphone floating button at the **bottom-right** of the screen (`bottom-6 right-6` on desktop; positioned above navigation on mobile).
3. **Trigger the Assistant**:
   - Click the microphone button to open the liquid glass dialog panel.
   - The microphone begins listening immediately (or click the large central mic).
   - If prompted by your browser, click **"Allow"** for microphone access.
4. **Speak a Command**:
   - **Navigation**: *"Go to my dashboard"*, *"Open loan calculator"*, *"मेरा प्रोफाइल खोलो"*.
   - **Loans**: *"Which loan can I apply for?"*, *"Main kaunsa loan le sakta hoon?"*.
   - **Multi-Turn**: *"Tell me about the first one"* $\rightarrow$ *"Where can I apply for it?"*.
   - **Benefits**: *"How much financial assistance can I receive?"*.
   - **Documents**: *"What documents are missing from my profile?"*.
5. **Alternative Text Input**:
   - If in a noisy environment or without a physical microphone, type any prompt into the input bar at the bottom of the modal and hit **Send** or press `Enter`.
6. **Audio Playback Controls**:
   - While the assistant speaks, you can click **"Stop Speaking"** at any time to mute speech synthesis.

---

## 3. Supported Languages & Audio Synthesis
- **Input Recognition (STT)**:
  - English (`en-IN`, `en-US`)
  - Hindi (`hi-IN`)
  - Hinglish (phonetic mixed queries, e.g., *"Mera aavedan status dikhao"*)
- **Output Synthesis (TTS)**:
  - Automatically matches browser voices: `hi-IN` for Hindi responses and `en-IN` / `en-US` for English responses.
  - Falls back gracefully to default system TTS if localized voices are absent.

---

## 4. Running the Automated Test Suite
To verify the entire voice assistant pipeline against the live database:
```bash
cd C:\Users\PC-ALG\Desktop\Hack-a-sol1
python scripts/test_voice_assistant.py
```
Expected output:
```
VERIFICATION COMPLETE: 30/30 TESTS PASSED (0 FAILED)
```
