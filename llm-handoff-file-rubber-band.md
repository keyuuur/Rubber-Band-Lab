# LLM Handoff File - Rubber Band Lab

## Project Snapshot

Project: CPS Rubber Band Basket Launch Lab  
Local folder: `C:\Users\Keyur\Desktop\Claude Code YEET\Concepts of Phys Games\Rubber Band Lab LOCAL`  
GitHub repo: `https://github.com/keyuuur/Rubber-Band-Lab`  
Current branch: `main`  
Current local revision: ten-shot trial update plus color-strip kiosk UI for Round 1 and Round 2

This is a Google Apps Script classroom web app for a 9th grade Concepts of Physical Systems rubber band/pom-pom launch lab. Students work in groups on iPads, record simple launch data, answer energy and force questions, confirm video evidence was emailed, and submit one group response to Google Sheets.

## Current Files

Tracked project files:

- `Code.gs` - Apps Script backend, Sheet setup, validation, scoring, duplicate handling, best scores, dashboard rebuild, troubleshooting log.
- `Index.html` - Student web app shell, color-strip sidebar, and proof templates.
- `Styles.html` - iPad-friendly raw CSS for the color-strip kiosk layout.
- `Script.html` - Student screen flow, kiosk shot-entry UI, localStorage autosave, score estimate, submit/retry/proof behavior.
- `appsscript.json` - Apps Script manifest with V8 runtime, web app settings, API executable access, and spreadsheet OAuth scope.
- `AGENTS.md` - Project rules and first-pass agent workflow.
- `FIRST_PASS_BUILD_NOTES.md` - Setup, schema, deployment notes, limitations, QA list.
- `.claspignore` - Ensures only Apps Script app files push with clasp.
- `.gitignore` - Keeps local deployment config and credentials out of Git.
- `llm-handoff-file-rubber-band.md` - This file.
- `GPT55_UI_HANDOFF.md` - UI-specific handoff for the color-strip kiosk pass.

Ignored local-only files:

- `.clasp.json` - Points to the current sandbox Apps Script/Sheet deployment.
- `client_secret_*.json` - Local OAuth client secret used for clasp login. Do not commit.

## Current App Behavior

Student flow:

1. Start / Group Info
2. Safety
3. Prediction
4. Round 1 at 6 ft
5. Round 1 Pattern
6. Energy Vocabulary
7. Round 2 at 3 ft, 6 ft, and 9 ft
8. Video Email
9. Free-Body Diagrams
10. Energy Conservation
11. Final Conclusion
12. Review / Submit
13. Submitted proof or Backup Proof Only

Important classroom behavior:

- Period choices are limited to `1st hour` and `7th hour`.
- Start screen tells students: `Work in groups of 3-4. One submission per group. Ask your teacher if your group has only 2.`
- Normal submission requires at least 2 member names on both client and server.
- Round 1 is fixed at 6 ft.
- Round 1 now records 10 quick-tap shots for each stretch level using a one-block-at-a-time kiosk UI: Small, Medium, and Large.
- Round 2 distances are 3 ft, 6 ft, and 9 ft.
- Round 2 now records 10 quick-tap shots for each distance using the same kiosk UI, plus the main stretch used for each distance.
- Round 2 no longer shows per-distance video questions. The old `R2_*_Video` raw columns remain for schema compatibility, but scoring/review completeness now uses stretch plus shot fields only.
- Trial result choices include `Made`, `Missed short`, `Missed long`, and `Missed side`.
- Round 1 and Round 2 both state: `Bank shots count as Made if the pom-pom lands in the basket.`
- Video evidence is email-only to `patelk07@psdr3.org`; there is no upload feature.
- Backup proof wording is `Backup Proof Only`, not `Emergency Submit`.
- Backup Proof Only clearly says the work has `NOT been submitted` to Mr. Patel's Sheet.
- Backup Proof Only Back/Return behavior returns students to the lab.
- Free-body diagrams use dropdowns, not drag-and-drop.
- The submitted proof screen says the work WAS submitted and shows a Submission ID.

## Google Sheets Backend

Required tabs:

- `Submissions_Raw`
- `Best_Scores`
- `Dashboard`
- `Settings`
- `Troubleshooting_Log`

Backend rules:

- `Submissions_Raw` preserves every valid, non-duplicate attempt.
- `Best_Scores` keeps the highest score by normalized group key.
- Normalized group key uses period plus trimmed/lowercased/collapsed group name.
- Multiple submissions by the same group are allowed.
- Same `Client_Attempt_ID` is treated as a duplicate retry and does not append another raw row.
- Dashboard is basic: period summary plus best-score detail rows.
- Server-side scoring is the source of truth.

## Scoring

Total: 20 points.

- Safety/setup: 2
- Round 1 data: 3
- Round 1 science/energy: 3
- Round 2 + video: 3
- Free-body diagrams: 4
- Energy conservation: 3
- Final conclusion: 2

The prior three-shot version was live-tested through the Apps Script Execution API and returned `20/20`. After the ten-shot revision, rerun the smoke test before class because the raw Sheet schema changed.

## Deployment / API State

Current sandbox Sheet:

`https://drive.google.com/open?id=1aVp4e8hq4LbAd2h44zx8bD_NLw3rXEWBzL1rWW9gU-I`

Current final sandbox web app deployment:

`https://script.google.com/a/macros/psdr3.org/s/AKfycbxM7fvg71-3CNSXx99UzjVQiGJujr_Q4Hb73L8RzRYl3b3iCBhSPyJvhhP8w9AwOJcVNA/exec`

The in-app browser could not complete the student web flow because the web app redirects to district Google sign-in. That is expected for domain-protected deployment. A real browser signed into a `psdr3.org` account is still needed for the final iPad/student smoke test.

`clasp run getSettings` now works after:

1. Creating a Desktop OAuth client in the Google Cloud project.
2. Downloading the client secret locally.
3. Running clasp login with project scopes.
4. Enabling Apps Script API in Google Cloud.
5. Adding `executionApi` manifest config.
6. Adding spreadsheet current-only OAuth scope.

Current manifest additions:

```json
"oauthScopes": [
  "https://www.googleapis.com/auth/spreadsheets.currentonly"
],
"executionApi": {
  "access": "DOMAIN"
},
"webapp": {
  "executeAs": "USER_DEPLOYING",
  "access": "DOMAIN"
}
```

## Iteration History

1. Read the original handoff markdown from Downloads.
2. Spawned read-only planning agents:
   - Spec / acceptance criteria
   - Classroom UX / student practicality
   - Data / scoring / Sheets
3. Created `AGENTS.md` with short project rules.
4. Implemented first-pass raw Apps Script app:
   - `Code.gs`
   - `Index.html`
   - `Styles.html`
   - `Script.html`
   - `FIRST_PASS_BUILD_NOTES.md`
5. Ran local parse/scoring checks.
6. Ran QA / Student Simulation phase.
7. Applied final integrator fixes only:
   - member-name validation
   - group-size wording
   - bank-shot wording
   - Backup Proof Only navigation
8. Created sandbox Sheet-bound Apps Script project with clasp.
9. Deployed web app.
10. Created public GitHub repo `Rubber-Band-Lab`.
11. Added API executable manifest config.
12. Created Desktop OAuth client and reauthorized clasp.
13. Enabled Apps Script API.
14. Added spreadsheet scope.
15. Live-tested backend through Execution API for the first-pass three-shot version:
   - `getSettings` succeeded
   - perfect dummy submission succeeded with score 20/20
   - one-member submission correctly rejected
16. Reviewed GPT's ten-shot zip proposal and implemented the same high-level requirement in the trusted codebase:
   - Round 1 = 10 shots per stretch
   - Round 2 = 10 shots per distance
   - dynamic backend field generation
   - 20-point scoring preserved
   - iPad quick-tap UI preserved
17. Implemented the Option 4B Color Strip / Station Kiosk UI:
   - dark navy left sidebar
   - one active ten-shot block at a time
   - large Made / Missed short / Missed long / Missed side buttons
   - tappable trial progress tiles
   - visible Round 2 per-distance video controls removed
   - existing raw Sheet columns preserved
18. Redeployed the existing sandbox web app deployment to version `@7`.

## Tests Already Run

Local deterministic tests:

- JavaScript parse for `Code.gs` and `Script.html`
- manifest JSON parse
- perfect scoring returns 20/20
- Round 2 raw fields remain 36 while completion fields are 33
- Round 2 visible per-distance video prompt is absent from `Script.html`
- video Yes with blank sender email rejects
- group key normalization works
- no-name and one-name members reject
- two/three/four member names accept
- multiple submissions preserve raw attempts and best score
- bank-shot wording appears in Round 1 and Round 2
- Backup Proof Only still says NOT submitted

Live backend tests:

- `clasp -P . run getSettings` returned settings successfully after the kiosk UI deployment.
- Direct Execution API `getSettings` returned `ok: true`, `round1TrialsPerStretch: 10`, and `round2TrialsPerDistance: 10`.
- Direct Execution API `submitLab` perfect kiosk dummy returned:
  - `ok: true`
  - `score.total: 20`
  - `submissionId: RBBL-20260513-200649-3815`
- Direct Execution API one-member kiosk dummy returned:
  - `ok: false`
  - `errorCode: NOT_ENOUGH_MEMBERS`
- Direct Execution API video-Yes-with-blank-sender dummy returned:
  - `ok: false`
  - `errorCode: VIDEO_EMAIL_REQUIRED`

Not yet fully tested:

- Full browser/iPad student flow while signed into `psdr3.org`.
- Visual confirmation of Sheet rows by opening the Sheet after live dummy submission.

## Recommended Next Step

Stop feature work.

Open the final web app in a real browser signed into `psdr3.org` and do one classroom-style dummy submission:

1. Open the deployed web app.
2. Complete a perfect dummy group.
3. Confirm proof screen says submitted and shows Submission ID.
4. Open the Sheet.
5. Confirm `Submissions_Raw`, `Best_Scores`, and `Dashboard` updated.
6. Test one-member group is blocked.
7. Test Backup Proof Only clearly says NOT submitted and Return/Back goes back to the lab.
8. Delete or ignore dummy rows before class.

## Do Not Add Before Class

- Do not add video uploads.
- Do not add login beyond school/domain access.
- Do not add a leaderboard.
- Do not add gradebook export yet.
- Do not broadly redesign the dashboard.
- Do not rename internal columns unless it becomes necessary.

## Notes For Future LLM

The app is already pushed to GitHub and live backend-tested. Treat the current code as the release candidate. Any future changes before class should be limited to critical deployment fixes or true classroom blockers.
