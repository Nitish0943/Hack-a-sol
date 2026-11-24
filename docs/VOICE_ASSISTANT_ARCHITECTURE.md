# KrishiSetu Global AI Voice Command Assistant — Architecture

## 1. Overview & Purpose
The **KrishiSetu Global AI Voice Command Assistant** provides hands-free, natural voice and multimodal interaction throughout the authenticated application. Unlike simple conversational chatbots or standalone STT toys, this system is an **action-oriented conversational agent**:
- Understands intent in **Hindi, English, and Hinglish** with colloquial phrasing.
- Retains conversational context across multi-turn dialogs (e.g., *"Which loan can I apply for?"* $\rightarrow$ *"Tell me about the first one"* $\rightarrow$ *"Where can I apply for it?"*).
- Safely controls user interface navigation via allowlisted Next.js route mapping.
- Interrogates authenticated user data (landholding, tenancy, past benefits, active applications) without cross-account leakage.
- Provides verified application channels with direct official URLs and required documentation.

---

## 2. System Architecture Diagram

```
 +-----------------------------------------------------------------------------------+
 |                             CLIENT-SIDE (Next.js 16)                             |
 |                                                                                   |
 |   +---------------------------------------------------------------------------+   |
 |   | Floating Voice Mic Button (<GlobalVoiceAssistant /> in PortalLayout)       |   |
 |   | Fixed bottom-6 right-6 (Desktop) / bottom-20 right-4 (Mobile - avoids nav)|   |
 |   +---------------------------------------------------------------------------+   |
 |                                         |                                         |
 |                 +-----------------------+-----------------------+                 |
 |                 |                                               |                 |
 |        [Web Speech API STT]                                [Text Input]           |
 |    webkitSpeechRecognition / SpeechRecognition         Fallback input field       |
 |                 |                                               |                 |
 |                 +-----------------------+-----------------------+                 |
 |                                         |                                         |
 |                      State Machine: IDLE -> LISTENING ->                          |
 |                      TRANSCRIBING -> PROCESSING -> EXECUTING_ACTION ->            |
 |                      SPEAKING -> IDLE (or ERROR)                                  |
 |                                         |                                         |
 |                       POST /api/v1/assistant/command                              |
 +-----------------------------------------|-----------------------------------------+
                                           | (Bearer JWT)
 +-----------------------------------------v-----------------------------------------+
 |                             BACKEND (FastAPI 0.115)                               |
 |                                                                                   |
 |   +---------------------------------------------------------------------------+   |
 |   | Guard: current_user (Token validation, RBAC verification)                 |   |
 |   +---------------------------------------------------------------------------+   |
 |                                         |                                         |
 |   +-------------------------------------v-------------------------------------+   |
 |   | Assistant Service (assistant_service.py)                                  |   |
 |   |                                                                           |   |
 |   | 1. Session Context Cache (_SESSION_CONTEXT_CACHE keyed by sessionId)      |   |
 |   | 2. Intent Classifier (classify_voice_intent)                              |   |
 |   |    - Multilingual matching (Devanagari, Latin, phonetic Hinglish)         |   |
 |   |    - Contextual reference resolution (1st item, 2nd item, follow-up)      |   |
 |   | 3. Domain Action Executor (execute_assistant_action)                      |   |
 |   |    - Navigation Intent -> Role-based allowlisted route validation        |   |
 |   |    - Loan Recommender -> Landholding & tenancy filtering                 |   |
 |   |    - Application Guidance -> Verified channels, official URLs, documents |   |
 |   |    - Scheme Recommender -> evaluate_farmer_recommendations()              |   |
 |   |    - Financial Twin -> aggregates real benefits from database             |   |
 |   +---------------------------------------------------------------------------+   |
 |                                         |                                         |
 |   +-------------------------------------v-------------------------------------+   |
 |   | SQLite Database Store (krishisetu.db)                                     |   |
 |   | Users | Farmers | Schemes | Applications | Benefits | PrivateSchemes      |   |
 |   +---------------------------------------------------------------------------+   |
 +-----------------------------------------|-----------------------------------------+
                                           | Response JSON
 +-----------------------------------------v-----------------------------------------+
 |                             CLIENT-SIDE EXECUTION                                 |
 |                                                                                   |
 |   1. Client Action Executor (action-executor.ts):                                 |
 |      - Validates target route against ALLOWED_ROUTES allowlist                    |
 |      - router.push(targetRoute) with 1.2s delay for spoken feedback               |
 |   2. Web Speech API SpeechSynthesis:                                              |
 |      - Matches hi-IN voice or en-IN voice, spoken audio output                   |
 |      - Visual audio waveform animation (<VoiceWaveform />)                        |
 |   3. Rich UI Render:                                                              |
 |      - Verified channel card with official website link and document checklist    |
 |      - Suggestion chips for one-click follow-up commands                          |
 +-----------------------------------------------------------------------------------+
```

---

## 3. UI State Machine
The assistant UI transitions deterministically through 7 explicit states:

| State | Trigger | Visual Behavior |
|---|---|---|
| `IDLE` | Default / dialog open | Green mic button ready, waiting for input |
| `LISTENING` | User taps mic | Pulsing animated green rings, microphone recording |
| `TRANSCRIBING` | Speech chunk received | Live transcript rendered with interim results |
| `PROCESSING` | Audio pauses / submitted | Pulsing loading dots, query sent to backend |
| `EXECUTING_ACTION` | Valid navigation in payload | Brief navigation banner, routes user smoothly |
| `SPEAKING` | Backend audio response | Waveform audio visualizer active, TTS playing |
| `ERROR` | Mic blocked / API failure | Amber banner with retry and text-input fallback |

---

## 4. Multi-Turn Context Memory
Multi-turn context is managed through an isolated in-memory cache keyed by `sessionId` (or `user_id` when sessionId is omitted):
```python
_SESSION_CONTEXT_CACHE[session_id] = {
    "last_topic": "loan_recommendation",
    "last_items": [kcc_dict, bob_dict, mahindra_dict],
    "active_loan": kcc_dict,
    "user_id": user["id"],
}
```
### Example Dialog Progression:
1. **Turn 1**: *"Main kaunsa loan le sakta hoon?"*
   - Assistant executes personalized loan recommendation.
   - Cache stores recommended loans in `last_items`.
2. **Turn 2**: *"Tell me about the first one"*
   - Assistant resolves `first one` $\rightarrow$ `last_items[0]` (KCC).
   - Cache sets `active_loan = KCC`.
3. **Turn 3**: *"Where can I apply for it?"*
   - Assistant resolves `it` $\rightarrow$ `active_loan`.
   - Returns verified application channels, physical branch info, required documents, and official link (`https://agricoop.nic.in/en/kcc`).

---

## 5. Security & RBAC Enforcement
1. **No Client-Side Code Execution**: Navigation commands do not execute arbitrary JavaScript or unvalidated redirects. All routes are checked against `ALLOWED_FARMER_ROUTES`, `ALLOWED_OFFICER_ROUTES`, and `ALLOWED_ADMIN_ROUTES`.
2. **Strict Identity Scoping**: All database operations query `WHERE farmer_id = current_user['id']` or `WHERE user_id = current_user['id']`. A farmer cannot access another user's financial figures, applications, or profile documents through voice commands.
3. **Session Memory Isolation**: Every user/session possesses its own isolated context dictionary. Cross-account access attempts cannot inspect another user's recent queries.
4. **JWT Verification**: Unauthenticated requests are rejected immediately with HTTP 401. Deactivated accounts are rejected with HTTP 403.
