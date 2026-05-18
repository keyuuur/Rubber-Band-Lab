# LLM Handoff File - Rubber Band Lab

## Project Snapshot

Project: CPS Rubber Band Basket Launch Lab
Local folder: `C:\Users\Keyur\Desktop\Claude Code YEET\Concepts of Phys Games\Rubber Band Lab LOCAL`
GitHub repo: `https://github.com/keyuuur/Rubber-Band-Lab`
Current branch: `first-hour-adjustments`
Current local revision: first-hour adjustments plus Option 1 Kiosk Control Panel UI theme

This is a raw Google Apps Script web app for a 9th grade Concepts of Physical Systems rubber band and pom-pom basket launch lab. The classroom audience is remedial 9th grade science students using iPads in groups. The app should be low-reading, high-tap-target, hard to break, and clear about when work is actually submitted to the Sheet.

## Current Files

Tracked project files:

- `Code.gs` - Apps Script backend, Sheet setup, validation, scoring, duplicate handling, best-score update, dashboard rebuild, troubleshooting log, formula-injection protection.
- `Index.html` - Student app shell, sidebar, top controls, submitted proof template, Backup Proof Only template.
- `Styles.html` - Option 1 dark kiosk/control-panel theme with cream student panels, gold accents, large controls, proof styling, and iPad breakpoints.
- `Script.html` - Student flow, localStorage autosave, one-name-at-a-time group builder, ten-shot kiosk, review checklist, submit/retry/proof behavior.
- `appsscript.json` - Apps Script manifest with V8 runtime, domain web app access, and spreadsheet current-only OAuth scope.
- `AGENTS.md` - Project rules and agent workflow constraints.
- `FIRST_PASS_BUILD_NOTES.md` - Original setup, schema, deployment notes, limitations, and QA next steps.
- `GPT55_UI_HANDOFF.md` - UI-specific handoff from an earlier UI planning pass.
- `RUBBER_BAND_LAB_FULL_GPT_HANDOFF.md` - Broader project handoff intended for future LLM work after classroom use.
- `llm-handoff-file-rubber-band.md` - This current state handoff.
- `.claspignore` - Keeps clasp pushes scoped to Apps Script app files.
- `.gitignore` - Keeps local deployment config and credentials out of Git.

Ignored local-only files:

- `.clasp.json` - Local clasp project binding. Do not commit.
- `client_secret_*.json` or credential files - Local OAuth material only. Do not commit.

## Classroom Context

The app is for Mr. Patel's 9th grade remedial science classroom. Students work in small groups on iPads. The priority is not fancy interaction; it is fast, obvious, classroom-safe data entry.

Important audience assumptions:

- Students may rush, tap quickly, share devices, or refresh accidentally.
- Reading should be short and direct.
- Buttons need to be large enough for iPads.
- Students need very clear proof that real submission happened.
- Backup Proof Only must never look like a successful Sheet submission.
- The teacher needs raw attempts preserved and highest scores easy to see.

## Locked Current Behavior

The current behavior is intentionally locked and should not be changed during UI-only passes:

- Raw Apps Script files only: `Code.gs`, `Index.html`, `Styles.html`, `Script.html`.
- Required Sheet tabs: `Submissions_Raw`, `Best_Scores`, `Dashboard`, `Settings`, `Troubleshooting_Log`.
- Period choices are `1st hour` and `7th hour`.
- Group Info uses one-name-at-a-time member entry.
- Minimum 2 member names on client and server.
- Group expectation remains 3-4 students, with teacher-approved 2-person exceptions.
- Safety is hard-blocked. Students cannot move on or submit until all safety/setup boxes are checked.
- Round 1 is fixed at 6 ft.
- Round 1 order is Short/Small stretch, then Medium, then Long/Large.
- Round 1 has 10 shots per stretch, 30 total.
- Round 1 future stretch blocks are locked until earlier blocks are complete.
- Round 2 distances are 3 ft, 6 ft, and 9 ft.
- Round 2 has 10 shots per distance, 30 total.
- Shot result choices are only `Made` and `Missed`.
- Old values `Missed short`, `Missed long`, and `Missed side` normalize to `Missed`.
- Bank shots count as `Made` if the pom-pom lands in the basket.
- Round 2 asks `Which stretch worked best for this distance?` only after the 10 shots for that distance.
- Missing Round 1 shot data blocks submission.
- Missing Round 2 shot data or Round 2 stretch choices block submission.
- Science questions may be missing or wrong and lower score, but do not block submission if required lab data is complete.
- Multiple submissions by the same group are allowed.
- `Submissions_Raw` preserves every valid, non-duplicate raw attempt.
- `Best_Scores` preserves the highest score by normalized group key and does not downgrade after a lower later score.
- Same `client_attempt_id` duplicate retry does not append a second raw row.
- Submitted proof says the work `WAS submitted` and shows a Submission ID.
- Backup Proof Only prominently says `NOT SUBMITTED` and is not called Emergency Submit.

## Video Evidence Policy

Video evidence is retired from the student-facing app.

Current policy:

- Do not add video upload.
- Do not add the Video Email screen back.
- Do not require video confirmation in the app.
- Legacy video columns remain only for Sheet compatibility.
- The retired video point is auto-credited so the total remains 20.
- Future docs or UI should not imply that the app checks video evidence.

## Current Student Flow

The app presents 9 student-facing steps:

1. Group Info
2. Safety
3. Prediction
4. Round 1
5. Analysis 1
6. Round 2
7. FBD
8. Final Qs
9. Review & Submit

Submitted proof and Backup Proof Only are proof modes, not normal lab steps.

## Current UI Theme

The latest UI pass implements the selected Option 1 Kiosk Control Panel visual direction:

- Dark green/black kiosk shell.
- Left sidebar with step numbers.
- Gold accent borders and progress styling.
- Cream/parchment student content panels for readability.
- Large green `Made` and red `Missed` buttons.
- Obvious current stretch/distance and current shot number.
- Shot history tiles for all 10 shots in the active block.
- Status cards for Round 1 stretches and Round 2 distances.
- Round 2 stretch choice is shown as large cards: Short, Medium, Long.
- Review screen is checklist-style.
- Backup Proof Only is warning-styled and clearly says `NOT SUBMITTED`.

Important implementation detail: Round 2 stretch choice cards display Short/Medium/Long but still save backend values as `Small`, `Medium`, and `Large`.

## Backend / Google Sheets

`Code.gs` is the source of truth for validation and scoring.

Required tabs:

- `Submissions_Raw`
- `Best_Scores`
- `Dashboard`
- `Settings`
- `Troubleshooting_Log`

Backend rules:

- Unknown fields are rejected.
- Invalid period, invalid shot values, invalid dropdown choices, oversized text, and malformed data are rejected.
- Student-entered strings are made formula-safe before writing to Sheets.
- Raw attempts are preserved.
- Best score is upserted by normalized group key.
- Dashboard is rebuilt from generated data.
- Duplicate retry by same `Client_Attempt_ID` is safe and does not create an extra raw attempt.
- Conflicting duplicate attempt payloads are rejected.
- Server scoring, not client estimate, is authoritative.

## Scoring

Total: 20 points.

- Safety/setup: 2
- Round 1 data: 3
- Round 1 science/energy: 3
- Round 2 data plus retired video credit: 3
- Free-body diagrams: 4
- Energy conservation: 3
- Final conclusion: 2

The client shows an estimated score only. The Sheet/backend score is the official score.

## Deployment State

The public repo should not contain live Sheet IDs, web app URLs, or secrets.

Current manifest behavior:

```json
{
  "oauthScopes": [
    "https://www.googleapis.com/auth/spreadsheets.currentonly"
  ],
  "webapp": {
    "executeAs": "USER_DEPLOYING",
    "access": "DOMAIN"
  },
  "runtimeVersion": "V8"
}
```

There is no `executionApi` in the current manifest. If CLI smoke testing is needed again, use a temporary private setup and remove `executionApi` afterward.

Because of Google ownership/permission issues seen earlier, the safest deployment path is often manual paste into the school-owned Apps Script project:

1. Open the actual Sheet.
2. Go to Extensions -> Apps Script.
3. Paste/update `Index.html`, `Script.html`, and `Styles.html` for this UI pass.
4. Paste/update `Code.gs` only when backend changes are intentionally made.
5. Run `getSettings`.
6. Redeploy the web app.
7. Test with a signed-in district account, ideally on an iPad.

## Recent Iteration History

Major project stages:

1. Built first-pass raw Apps Script app with `Code.gs`, `Index.html`, `Styles.html`, `Script.html`.
2. Added `AGENTS.md` and `FIRST_PASS_BUILD_NOTES.md`.
3. Ran student simulation QA.
4. Applied final integrator fixes: member validation, group-size wording, bank-shot wording, Backup Proof navigation.
5. Created public GitHub repo `Rubber-Band-Lab`.
6. Created a sandbox Sheet-bound Apps Script deployment for testing.
7. Reviewed GPT's ten-shot zip and implemented trusted ten-shot behavior:
   - Round 1: 10 shots per stretch.
   - Round 2: 10 shots per distance.
   - Dynamic backend field generation.
   - 20-point scoring preserved.
8. Built earlier kiosk/color-strip UI pass.
9. Applied security and reliability hardening:
   - authoritative server validation
   - formula-safe Sheet writes
   - duplicate retry safety
   - proof-screen protection
   - reduced submitted localStorage
   - redacted error logging
   - removed `executionApi`
10. Refactored same-stack student flow into 9 visible stations after live class use.
11. Implemented first-hour classroom adjustments:
   - one-name-at-a-time group builder
   - Made/Missed only
   - Round 1 ordered Short -> Medium -> Long flow
   - removed Video Email from student app
   - auto-credit retired video point
12. Ran classroom safety and submission reliability pass:
   - safety hard block confirmed
   - missing physical shot data hard-blocked
   - Round 2 stretch timing moved after shots
   - Round 1 lock explanation preserved
   - Backup Proof Only clarity strengthened
13. Implemented Option 1 Kiosk Control Panel UI theme:
   - dark kiosk shell
   - green/gold accents
   - cream panels
   - large Made/Missed buttons
   - Round 2 stretch choice cards
   - checklist Review
   - strong `NOT SUBMITTED` Backup Proof styling

## Latest Checks Run

Static/local checks from the Option 1 UI pass:

- `Script.html` JavaScript parses.
- `Code.gs` parses.
- `appsscript.json` parses.
- `git diff --check` passes, with only normal CRLF warnings.
- No `executionApi` in manifest.
- No credential or client secret files are tracked.

Backend guardrail checks:

- Perfect payload validates.
- Perfect payload scores `20 / 20`.
- One member is rejected.
- Two members are accepted.
- Safety incomplete is rejected.
- Missing Round 1 shot is rejected.
- Missing Round 2 shot is rejected.
- Missing Round 2 stretch choice is rejected.
- Legacy miss values normalize to `Missed`.

UI/visual checks:

- `Made` and `Missed` are the only configured student-facing shot results.
- No `Video Email` screen label exists.
- Round 2 stretch cards preserve backend values `Small`, `Medium`, `Large`.
- Backup template says `NOT SUBMITTED`.
- Submitted proof says `WAS submitted`.
- Local Chrome/Playwright screenshots at 1024x768 were rendered for:
  - Group Info start screen
  - Round 2 after 10 shots with stretch cards visible
  - Backup Proof Only
- Screenshots confirmed no horizontal overflow at iPad landscape width.

Not fully re-tested in this pass:

- Real signed-in district web app flow after paste/redeploy.
- Actual Sheet row inspection after a live dummy submission.
- Full iPad touch test in the classroom environment.

## Recommended Next Step

Push the current `first-hour-adjustments` branch to GitHub, then paste/deploy the changed Apps Script files into the school-owned Apps Script project.

Before using with students again:

1. Open the deployed web app with a signed-in `psdr3.org` account.
2. Complete one perfect dummy group.
3. Confirm submitted proof says `WAS submitted` and shows a Submission ID.
4. Open the Sheet and confirm `Submissions_Raw`, `Best_Scores`, and `Dashboard` update.
5. Test one-member group is blocked.
6. Test missing Round 1 or Round 2 shot data is blocked.
7. Test Backup Proof Only says `NOT SUBMITTED`.
8. Delete or ignore dummy rows before class.

## Do Not Add Casually

- No video upload.
- No Video Email screen.
- No leaderboard.
- No login beyond domain deployment.
- No gradebook export tab yet.
- No new Sheet tabs.
- No npm, frameworks, or external services.
- No scheduled triggers.
- No broad Dashboard redesign.
- No backend behavior changes during UI-only passes.

## Notes For Future LLMs

Treat the current code as behavior-locked. The most recent work was a UI/theme pass, not a backend refactor. If future changes are requested, first confirm whether they are:

- classroom-critical fixes,
- post-class UX improvements,
- backend/schema/scoring changes, or
- deployment-only tasks.

Keep Apps Script raw-file constraints. Preserve `Code.gs` behavior unless the user explicitly asks for backend changes. When changing UI, prefer `Styles.html` and small `Script.html` markup changes.
