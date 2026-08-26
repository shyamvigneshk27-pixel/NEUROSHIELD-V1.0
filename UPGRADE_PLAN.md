# NeuroShield 2.0 — Dataset Guide & 20-Day Upgrade Plan

This document turns the GDTA Hackathon submission (`NEUROSHIELD 2.0 GDTA HACKATHON SUBMISSION.pdf`) into an
executable plan against the **current codebase** (NeuroShield v1: FastAPI backend, single-role React dashboard,
1D-CNN+LSTM / Random Forest / CNN-spectrogram models). It covers two things:

1. Where to get every dataset the v2.0 pitch references.
2. A day-by-day, 20-day build schedule to go from v1 to the working v2.0 prototype described in the PDF.

---

## 1. Where to get the datasets

### 1.1 Bonn University EEG dataset (already in use — v1 baseline)
This is the dataset your current `dataset/seizure` and `dataset/non_seizure` CSVs are derived from (single-channel,
short epochs). You already have it; if you ever need to re-download the original source data:
- Source: University of Bonn, Department of Epileptology — "EEG Time Series Data" (Andrzejak et al.)
- Public mirror: search "Bonn EEG dataset Andrzejak" — commonly hosted on the university's epileptologie-bonn.de
  page and mirrored on Kaggle as "Epileptic Seizure Recognition Dataset" (UCI ML Repository version, 500 samples ×
  4097 points, already reshaped into 11,500 rows of 178 samples each — this is the version most Kaggle notebooks use).
- UCI ML Repository listing: search "Epileptic Seizure Recognition Data Set" on archive.ics.uci.edu — this is the
  same Bonn data, pre-processed into the 178-column CSV format your `dataset/seizure/*.csv` files already resemble.

### 1.2 CHB-MIT Scalp EEG Corpus (needed for Section 8.5 / Phase 2 multi-channel validation)
- Source: PhysioNet — search "CHB-MIT Scalp EEG Database" on physionet.org
- Content: 23 pediatric patients, 22-channel scalp EEG (EDF format), seizure onset/offset annotations included.
- Access: free, no application needed — PhysioNet's open-access clinical databases don't require credentialing for
  this corpus (unlike MIMIC). Download via the PhysioNet page's "Files" tab or `wget -r` with the project's rsync
  command shown on that page.
- Use in this repo: drop `.edf` files under a new `dataset/chb-mit/` folder; parse with `mne` (Python) which reads
  EDF natively — this is the format the "EEGNet / 19-channel" work in Section 8.2 (Week 3) needs.

### 1.3 TUH EEG Corpus (needed for Phase 2 long-term/clinical validation)
- Source: Temple University Hospital EEG Corpus — search "TUH EEG Corpus Temple University" (isip.piconepress.com).
- Access: requires a free registration (email + institutional/academic use statement) before download credentials
  are issued — plan for this lag time; request access on Day 1, not when you need it.
- Content: the largest public clinical EEG corpus (tens of thousands of sessions), multiple sub-corpora — the
  "TUSZ" (TUH Seizure Corpus) subset is the relevant one for seizure detection validation.
- Use in this repo: treat as a v2.1+ validation set, not a Day-1–20 blocker (see Section 8.4 Phase 2 in the PDF —
  this is explicitly post-hackathon work).

### 1.4 Practical guidance for this 20-day window
Given TUH's registration lag and CHB-MIT's larger multi-channel files, sequence dataset work as:
- **Day 1**: register for TUH access (so credentials arrive mid-plan) and download a handful of CHB-MIT patient
  folders (a few hundred MB, not the full corpus) to unblock EEGNet work.
- **Days 13–15** (Week 3 equivalent, multi-channel EEG work): use the downloaded CHB-MIT `.edf` files to build and
  smoke-test the EEGNet 19-channel path. Full CHB-MIT/TUH validation stays a post-Day-20 phase, exactly as the PDF
  scopes it (Section 8.4, Phase 2).

---

## 2. Current state vs. target (what actually needs building)

| Area | v1 today (this repo) | v2.0 target (PDF) |
|---|---|---|
| Roles | Single login, one dashboard (`AdminView.jsx`) | Patient / Caregiver / Neurologist, JWT role claims |
| Models | 1D-CNN+LSTM, CNN-spectrogram, Random Forest — all present in `backend/ml/inference.py` | Same three + EEGNet for 19-channel EDF |
| Explainability | None | SHAP feature-importance layer on RF/CNN |
| Real-time | Request/response only (`/analyze/csv`, `/analyze/image`) | WebSocket live streaming + risk gauge |
| Alerts | None | WebSocket push + WhatsApp Business API |
| Language | English only | English/Tamil/Hindi via Gemini + offline fallback |
| Offline | N/A (server-based) | PWA installable, service worker cache |
| Mobile | None | PWA (hackathon) → React Native (post-hackathon) |

The 20-day plan below closes this table, compressed from the PDF's 3-week (21-day) sprint into 20 working days by
tightening the demo-hardening tail.

---

## 3. 20-Day Build Plan

### Week 1 (Days 1–5): Roles, dashboards, explainability foundation

- **Day 1 — Setup & data**: Register for TUH EEG access; pull sample CHB-MIT patient folders. Audit
  `backend/main.py` auth (`/login`) and design the JWT role-claim schema (`role: patient | caregiver | neurologist`).
- **Day 2 — Backend auth**: Extend `/login` to issue role-scoped JWTs; add FastAPI dependency to gate routes by
  role. Add `patient_id` / `linked_caregiver_id` fields to whatever store backs users today.
- **Day 3 — Patient dashboard**: Build the Patient view — traffic-light risk indicator, seizure history timeline —
  reusing `RiskGauge.jsx` and `DashboardView.jsx` as the base, wired to existing model output from
  `backend/ml/inference.py`.
- **Day 4 — Caregiver dashboard**: Build the Caregiver view (weekly trend graph off existing `Chart.js` usage,
  "share with doctor" button that serializes a report). Add a symptom diary CRUD endpoint + simple UI.
- **Day 5 — Neurologist dashboard + SHAP**: Extend `AdminView.jsx`/`ModelMetricsView.jsx` into the clinician view;
  add the `shap` Python package to `requirements.txt` and wire a SHAP explainer over the Random Forest model first
  (fastest to explain), returning feature-importance JSON to a new panel in `PatientRecordsView.jsx`.
  **Milestone: three role-scoped dashboards demoable, RF predictions show SHAP explanations.**

### Week 2 (Days 6–10): Real-time streaming, alerts, language access

- **Day 6 — WebSocket backend**: Add a FastAPI native WebSocket endpoint (`/ws/stream`) that accepts chunked EEG
  samples and returns rolling risk scores using the existing inference pipeline.
- **Day 7 — WebSocket frontend**: Connect `SignalViewer.jsx`/`RiskGauge.jsx` to the WebSocket for live waveform +
  risk gauge updates; add the frequency band power panel next to it.
- **Day 8 — Alert module**: Add a WebSocket push channel that fires when risk > 70%; integrate WhatsApp Business
  API (free tier sandbox) as a second channel triggered server-side on the same threshold.
- **Day 9 — Multilingual reports**: Extend the existing Gemini integration (`/summarize`, `/chat` in
  `backend/main.py`) with Tamil/Hindi prompt localisation; build the offline rule-based NLP fallback using
  `backend/medical_terms.json` as the term dictionary so it works without the Gemini API key.
- **Day 10 — PWA layer**: Add a Vite PWA plugin to `frontend/vite.config.js`, an installable manifest, a service
  worker for offline asset caching, and Web Push registration.
  **Milestone: live EEG stream demo with caregiver alert firing, plain-language report in 3 languages, installable PWA.**

### Week 3 (Days 11–16): Multi-channel EEG, native mobile groundwork, hardening

- **Day 11 — EEGNet integration (part 1)**: Add `mne` to `requirements.txt`; write an EDF loader for the CHB-MIT
  files pulled on Day 1, producing 19-channel tensors.
- **Day 12 — EEGNet integration (part 2)**: Implement/import an EEGNet architecture in `backend/ml/`, train a
  first-pass checkpoint on the CHB-MIT sample, wire it as a fourth model option in `inference.py` behind a feature
  flag (since it's "near-term", not required for full accuracy yet).
- **Day 13 — Offline-mode QA**: Test the full stack (models + WebSocket + PWA) on constrained hardware settings
  (throttled CPU, no network) to validate the "4GB RAM, no GPU" claim; fix any hard dependency on internet access.
- **Day 14 — PDF report generation**: Add a downloadable PDF export (e.g. `reportlab` or `weasyprint`) covering
  risk score, band powers, SHAP summary, and the plain-language explanation — extending
  `ReportSummaryView.jsx`'s existing data.
- **Day 15 — APK packaging (fast route)**: Wrap the PWA as a Trusted Web Activity with Bubblewrap/PWABuilder to
  produce a signed, installable `.apk` for the Patient/Caregiver experience — no separate app rebuild.
- **Day 16 — Native mobile scaffold (Mobile Phase 1 start)**: Stand up the React Native project, reuse the JWT auth
  flow from Day 2, and stub the Patient/Caregiver screens against the same REST/WebSocket API — this is the first
  slice of the "immediate post-hackathon" work, pulled forward so Day 20's demo can show it running, not just planned.
  **Milestone: 19-channel EEGNet path runs end-to-end on real CHB-MIT data, installable APK exists, native app scaffold boots.**

### Days 17–20: Integration, demo script, documentation, buffer

- **Day 17 — End-to-end integration pass**: Walk every user story (patient views risk → caregiver gets alert →
  neurologist reviews SHAP + downloads PDF) across web + PWA + native scaffold; fix breakage found by doing this,
  not by inspection.
- **Day 18 — Bug-fix & polish buffer**: Reserved slack day — real-time systems (WebSocket + push + WhatsApp) tend
  to surface integration bugs only under end-to-end use; this day exists to absorb that without slipping the demo date.
- **Day 19 — Demo script + data prep**: Script and rehearse the exact end-to-end demo: live seizure detection,
  caregiver WhatsApp + push alert, multilingual patient report, clinician SHAP view, install-to-home-screen PWA,
  APK install. Prepare a clean demo dataset (a few known seizure/non-seizure samples) so results are reproducible live.
- **Day 20 — Documentation & submission packaging**: Update `README.md` for the new architecture (roles, WebSocket,
  mobile), record a demo video as backup for live-demo risk, and finalize the submission package.
  **Milestone: full v2.0 system demoable end-to-end, documented, submission-ready.**

---

## 4. Notes on sequencing choices

- CHB-MIT/TUH full-corpus validation is **intentionally deferred past Day 20** — the PDF itself scopes this to
  "Phase 2, 1–3 months" (Section 8.4). Days 11–13 only need enough CHB-MIT data to prove the EEGNet path *works*,
  not to fully validate accuracy against it.
- The native mobile app is scoped in the PDF as "immediate post-hackathon" (Mobile Phase 1 = Weeks 4–5). This plan
  pulls a thin scaffold into Day 16–17 only so the demo can show real momentum; don't try to finish Mobile Phase 2/3
  (offline cache, biometric lock, store packaging) inside these 20 days — that's explicitly out of scope here.
- SHAP is applied to the Random Forest model first (Day 5) because tree-based SHAP explainers are fast and stable;
  extending SHAP (or a CNN-appropriate alternative like Grad-CAM) to the CNN models is a good Day 18 stretch task if
  time allows, but isn't required for the Week 1 milestone.
