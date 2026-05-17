# Rubber Band Lab Full GPT Handoff

## Purpose

This handoff is written for GPT or another coding agent that will receive a zip file of this project and needs to understand the classroom context, the current code, the non-negotiable constraints, and the likely future direction after the activity has been used with students.

The project is not a generic game. It is a real classroom data-collection web app for a 9th grade Concepts of Physical Systems lab. The app must stay practical, low-reading, iPad-friendly, and safe for students who may be behind grade level, easily distracted, or not confident readers.

## Teacher And Classroom Context

The teacher is Keyur Patel at Pattonville / PSD, using the app with 9th grade remedial or support-level physical science students. The activity is a rubber-band basket launch lab using pom-poms, baskets, and backboards. Students work in small groups, run repeated trials, answer basic energy and force questions, and submit their work to a Google Sheet.

Audience assumptions:

- Students are 9th graders, but the reading level should stay simple.
- Many students benefit from short instructions, large buttons, and obvious next steps.
- Students use school iPads.
- The room may be loud and active during the lab.
- Students need to record data quickly because the pom-poms can be launched quickly.
- Students should not have to type much.
- Students should not manage files, uploads, login flows, or complicated proof steps.
- The teacher needs a dependable Sheet at the end, not a fancy app that is fragile in class.

Instructional goals:

- Students see that more rubber band stretch usually stores more elastic potential energy.
- Students connect elastic potential energy to motion / kinetic energy.
- Students distinguish made shots from short, long, and side misses.
- Students think about forces using dropdown-based free-body diagram labels.
- Students practice the idea that energy changes form rather than disappearing.
- Students collect enough repeated trials to notice patterns, not just one-off luck.

## Current Project Snapshot

Local project folder:

`C:\Users\Keyur\Desktop\Claude Code YEET\Concepts of Phys Games\Rubber Band Lab LOCAL`

GitHub repo:

`https://github.com/keyuuur/Rubber-Band-Lab`

Current local commit at time of this handoff:

`c9fcc77 Refactor student flow and shot kiosk`

Project type:

- Google Apps Script web app.
- Raw Apps Script files only.
- Google Sheets backend.
- No npm, no frameworks, no external packages.

Core files:

- `Code.gs` - backend, Sheets setup, validation, scoring, duplicate handling, best scores, dashboard, logging.
- `Index.html` - app shell, sidebar, proof templates.
- `Styles.html` - all CSS for the student UI.
- `Script.html` - client-side student flow, state, rendering, validation, local autosave, submit behavior.
- `appsscript.json` - Apps Script manifest.
- `AGENTS.md` - local project rules.
- `FIRST_PASS_BUILD_NOTES.md` - setup, schema, deployment, and QA notes.

Ignored local-only files:

- `.clasp.json`
- OAuth client secrets
- tokens / credentials

Never commit credentials.

## Hard Non-Negotiables

Do not change these unless Keyur explicitly asks:

- Keep raw Google Apps Script files only: `Code.gs`, `Index.html`, `Styles.html`, `Script.html`.
- Keep Google Sheets as the backend.
- Keep required Sheet tabs:
  - `Submissions_Raw`
  - `Best_Scores`
  - `Dashboard`
  - `Settings`
  - `Troubleshooting_Log`
- Keep total scoring at 20 points.
- Keep server-side scoring as the source of truth.
- Keep period options limited to:
  - `1st hour`
  - `7th hour`
- Keep video evidence email-only to `patelk07@psdr3.org`.
- Do not build video upload.
- Keep the wording `Backup Proof Only`.
- Do not call it `Emergency Submit`.
- Backup Proof Only must clearly say the work was NOT submitted to the Sheet.
- Submitted proof must clearly say the work WAS submitted and show a Submission ID.
- Keep multiple submissions allowed.
- `Submissions_Raw` must preserve every valid, non-duplicate raw attempt.
- `Best_Scores` must keep the highest score by normalized group key.
- Do not add scheduled triggers.
- Do not add login beyond Google/domain access already handled by Apps Script deployment.
- Do not add an external database.
- Do not add libraries or a framework.

## Student Flow

The current app uses 10 classroom-facing stations:

1. Group Info
2. Safety
3. Prediction
4. Round 1
5. Analysis 1
6. Round 2
7. Video Email
8. FBD
9. Final Qs
10. Review & Submit

Older versions had 12 internal screens. The current refactor combines:

- Round 1 Pattern + Energy Vocabulary into `Analysis 1`.
- Conservation + Final Conclusion into `Final Qs`.

This better matches the sidebar and the intended teacher-facing station count.

## Lab Rules In The App

Group Info:

- Students choose period.
- Students type group name.
- Students type member names.
- Groups are expected to be 3-4.
- The app allows 2 names as a teacher-approved exception.
- Fewer than 2 names is blocked client-side and server-side.

Safety:

- Students must check every safety/setup box before moving on.
- The current refactor hard-blocks Safety until all boxes are checked.

Round 1:

- Fixed basket distance: 6 ft.
- Three stretch blocks:
  - Small
  - Medium
  - Large
- 10 shots per stretch.
- 30 total Round 1 shots.
- Result choices:
  - Made
  - Missed short
  - Missed long
  - Missed side
- Bank shots count as Made if the pom-pom lands in the basket.

Round 2:

- Distance challenge.
- Three distance blocks:
  - 3 ft
  - 6 ft
  - 9 ft
- 10 shots per distance.
- 30 total Round 2 shots.
- Students choose the stretch used for each distance.
- Each distance is complete only when it has a stretch choice plus 10 shot results.
- There are no visible per-distance video controls anymore.
- Legacy `R2_*_Video` columns remain in the raw Sheet schema for compatibility.

Video Evidence:

- Students record video on the iPad outside the app.
- Students email video evidence to `patelk07@psdr3.org`.
- The app records whether they say they emailed it, the sender email, and what the clip showed.
- If students mark video email as `Yes`, sender email is required.
- The app cannot verify Gmail actually received a video.

FBD:

- Free-body diagram labels are dropdowns, not drag-and-drop.
- Correct intended answers:
  - Pom-pom sitting still before launch, UP arrow: Normal force.
  - Pom-pom sitting still before launch, DOWN arrow: Gravity.
  - Pom-pom in the air, DOWN force: Gravity.
  - Pom-pom in the air, BACK force: Air resistance.
- Distractors include applied force, magnetic force, friction, air resistance, gravity, and normal force.

Final Qs:

- Energy conservation true/false questions.
- Final main idea question.
- Farther basket stretch question.

## Current UI Behavior

The UI is a color-strip / station-kiosk style app:

- Dark navy sidebar.
- 10 step sidebar.
- Large station content area.
- Large shot result buttons.
- Tappable trial tiles.
- Sticky mobile navigation on small screens.
- Local autosave with `localStorage`.
- Saved-work warning if an iPad has unfinished work.

The Round 1 and Round 2 shot entry use the same kiosk component:

- Three large block buttons show status, such as `Small stretch 10 / 10`.
- Four large result buttons:
  - Made
  - Missed short
  - Missed long
  - Missed side
- Ten trial tiles show what has been recorded.
- Students can tap a prior tile to correct a shot.
- After finishing trial 10 in one block, the app moves to the next unfinished block.

Important UX rule:

The app should not become fancy. It should become calmer, clearer, faster, and harder to mess up on an iPad.

## Backend Data Model

The Sheet backend is created and maintained by `Code.gs`.

Required tabs:

- `Submissions_Raw`
- `Best_Scores`
- `Dashboard`
- `Settings`
- `Troubleshooting_Log`

### Submissions_Raw

Stores every valid, non-duplicate attempt.

Important columns include:

- Timestamp
- Submission_ID
- Client_Attempt_ID
- Group_Key
- Period
- Group_Name
- Member_Names
- Score subtotals
- Percent
- Needs_Review
- Review_Reasons
- App_Version
- Score_Version
- User_Agent
- Student answers
- `Raw_JSON`

Round 1 columns are generated dynamically:

- `R1_Small_T1` through `R1_Small_T10`
- `R1_Medium_T1` through `R1_Medium_T10`
- `R1_Large_T1` through `R1_Large_T10`

Round 2 columns are generated dynamically:

- `R2_3ft_Stretch`
- `R2_3ft_T1` through `R2_3ft_T10`
- `R2_3ft_Video` legacy compatibility column
- `R2_6ft_Stretch`
- `R2_6ft_T1` through `R2_6ft_T10`
- `R2_6ft_Video` legacy compatibility column
- `R2_9ft_Stretch`
- `R2_9ft_T1` through `R2_9ft_T10`
- `R2_9ft_Video` legacy compatibility column

### Best_Scores

Keeps one row per normalized period/group key.

Columns:

`Group_Key`, `Period`, `Group_Name`, `Member_Names`, `Best_Score_Total`, `Percent`, `Best_Submission_ID`, `Best_Timestamp`, `Last_Submission_ID`, `Last_Timestamp`, `Submission_Count`, `Video_Email_Confirmed`, `Video_Sender_Email`, `Needs_Review`, `Review_Reasons`, `Notes`

Rules:

- Higher scores replace best score.
- Tied scores update the best attempt to the latest tied attempt.
- Lower later scores do not downgrade the best score.
- Last submission fields still update.
- Submission count increments for new attempts.
- Duplicate retry repair does not increment count.

### Dashboard

Rebuilt from `Best_Scores`.

It is intentionally basic:

- Period summary.
- Number of groups.
- Average best score.
- Video confirmed count.
- Needs review count.
- Best-score detail rows.

Do not broadly redesign Dashboard unless requested.

### Settings

Stores:

- Allowed periods
- Teacher email
- Round 1 trials per stretch
- Round 2 trials per distance
- App version
- Score version
- Last checked timestamp

### Troubleshooting_Log

Stores validation failures and server errors.

Current hardening avoids logging full student payloads when possible.

## Scoring

Total score: 20 points.

Breakdown:

- Safety/setup: 2
- Round 1 data: 3
- Round 1 science/energy: 3
- Round 2 + video: 3
- Free-body diagrams: 4
- Energy conservation: 3
- Final conclusion: 2

Important:

- Server score in `Code.gs` is authoritative.
- Client score in `Script.html` is an estimate for the Review screen.
- If scoring changes, update both server and client estimate, but preserve server as truth.

Current scoring details:

- Safety/setup is all-or-nothing for 2 points.
- Round 1 data gives partial credit based on number of filled Round 1 trial fields.
- Round 1 science gives points for pattern, elastic potential, and elastic-to-kinetic vocabulary.
- Round 2 gives data credit based on completion fields, plus one video-confirmation point.
- FBD gives one point per correct force dropdown.
- Conservation gives one point per correct true/false.
- Final gives one point for main idea and one for farther baskets usually needing more stretch.

## Validation And Safety Rules

Client-side:

- Group Info hard-blocks Next if period, group name, or 2 member names are missing.
- Safety hard-blocks Next until all safety boxes are checked.
- Video Email hard-blocks if video is marked Yes with blank or malformed sender email.
- Missing shot/science answers are soft warnings so students can submit incomplete work and receive reduced score.

Server-side:

- `validateSubmission_` is authoritative.
- Rejects unknown fields.
- Rejects invalid periods.
- Rejects invalid dropdown/result values.
- Rejects too-long text.
- Rejects malformed video sender email.
- Rejects fewer than 2 member names.
- Rejects video Yes with blank sender email.

Data safety:

- Student-entered strings are protected against Sheet formula injection.
- Dangerous leading characters are prefixed before Sheet write:
  - `=`
  - `+`
  - `-`
  - `@`
  - tab
  - carriage return

Duplicate behavior:

- Same `Client_Attempt_ID` with same meaningful payload returns saved success and does not append a new raw row.
- Same `Client_Attempt_ID` with changed group or changed meaningful answers returns a conflict message.

## Code Architecture

### Code.gs

Main public functions:

- `doGet()`
- `include(filename)`
- `getSettings()`
- `submitLab(payload)`
- `scoreSubmission(payload)`

Important backend sections:

- `SERVER_CONFIG`
- Sheet/tab constants and generated column lists
- Field name builders
- Apps Script web app entrypoints
- Submit flow
- Scoring
- Sheet setup
- Best-score upsert
- Validation/schema
- Raw record building
- Review flags
- Duplicate attempt handling
- Dashboard rebuild
- Sheet helpers
- Sanitizers and text helpers

Do not rename public functions without updating deployment/testing instructions.

### Script.html

Current organization:

- `CONFIG` stores client constants, choices, trial counts, and screen definitions.
- `stateStore` wraps state load/save/fresh state.
- `fieldModel` exposes field builder/count helpers.
- `validation` groups screen blockers/warnings and submit blockers.
- `renderers` groups common render helpers.
- `shotKiosk` groups shared ten-shot behavior.
- `submission` groups submit/proof behavior.

Important functions:

- `render()`
- `renderSidebar(activeKey)`
- `bindInputs()`
- `recordKioskResult(roundKey, value)`
- `setKioskBlock(roundKey, value)`
- `advanceToNextBlank(roundKey)`
- `renderRound1()`
- `renderRound2()`
- `renderTenShotKiosk(config)`
- `renderAnalysis1()`
- `renderFinalQs()`
- `renderReview()`
- `submitLab()`
- `showSubmittedProof()`
- `showBackupProof()`
- `getScreenBlocker(key)`
- `getScreenWarning(key)`
- `getSubmissionBlocker()`
- `estimateScore(r)`

### Styles.html

Current CSS sections are roughly:

- Variables/base
- Sidebar/layout
- Top bar/progress
- General screens/forms/cards
- Kiosk shot-entry component
- Review/proof screens
- Buttons/navigation
- Mobile/iPad breakpoints

There is no external CSS.

### Index.html

Contains:

- App shell
- Sidebar
- Top bar
- Backup Proof Only button
- Resume warning
- Progress display
- Screen host
- Bottom navigation
- Submitted proof template
- Backup proof template
- Includes `Styles` and `Script`

## Deployment State And Known Permission Issue

There is a known Apps Script ownership / permissions issue with the older sandbox project. `clasp push` from the local folder can return:

`The caller does not have permission`

This matches Keyur's real experience: the original deployment did not execute correctly under the school account, but a copied school-owned version worked.

Recommended classroom deployment path:

1. Use the Sheet/project copy owned by `patelk07@psdr3.org`.
2. Open that real Sheet.
3. Go to Extensions > Apps Script.
4. Paste/update:
   - `Code.gs`
   - `Index.html`
   - `Styles.html`
   - `Script.html`
5. Run `getSettings` once from the Apps Script editor.
6. Approve permissions as the school account.
7. Deploy as a web app:
   - Execute as: Me
   - Access: district/domain users
8. Test one dummy submission.

Do not assume local `clasp push` can update the live school-owned copy unless `.clasp.json` has been repointed and authenticated with the right owner.

Current manifest:

- Uses V8 runtime.
- Uses spreadsheet current-only scope.
- Web app executes as user deploying.
- Web app access is domain-level.
- `executionApi` is intentionally not enabled.

## Tests Already Run Recently

At commit `c9fcc77`, local checks passed:

- `Code.gs` parse check.
- `Script.html` JavaScript parse check.
- `appsscript.json` parse check.
- `git diff --check`.
- Credential scan.
- Browser perfect simulation:
  - Round 1 `30 / 30`
  - Round 2 `30 / 30`
  - Review `20 / 20`
  - Submitted proof shown
- Browser rough simulation:
  - Backup Proof Only says NOT submitted
  - Reset disabled on Backup Proof Only
  - Group Info blocks missing / one-member group
  - Safety blocks unchecked setup
  - Video Yes with blank/malformed email blocks
  - Incomplete work shows reduced local score
- Refresh simulation:
  - Unfinished work restores after reload
  - Submitted proof restores after reload with minimal proof details
- Backend regression simulation:
  - Perfect payload scores 20
  - Invalid period rejects
  - Invalid result rejects
  - Bad video sender email rejects
  - One member rejects
  - Two members accepted
  - Formula prefix escaping works
  - Duplicate same payload matches
  - Duplicate changed payload conflicts
  - Best score does not downgrade after lower later submission

What still needs real-world confirmation:

- Signed-in school iPad/browser test through the actual deployed web app.
- Real Sheet row updates after class deployment.
- Teacher review workflow after actual student submissions.
- Whether students found the 10-shot kiosk fast enough.
- Whether any instructions were confusing in the live room.

## Guidance For Future Improvements After Class

After Keyur runs the activity with a real class, use actual classroom observations to guide the next pass. Do not make broad changes just because the code could be prettier.

Good future improvement categories:

- Reduce any wording students did not understand.
- Make frequently missed steps more obvious.
- Improve Review screen if teacher needed different summary info.
- Improve Dashboard only if teacher review was slow or confusing.
- Add teacher-friendly cleanup/export only if needed after seeing real Sheet data.
- Improve mobile/iPad layout only where students actually struggled.
- Add a private teacher note or checklist if deployment remains confusing.

Avoid unless explicitly requested:

- Video upload.
- Leaderboard.
- Student login system.
- Gradebook export tab.
- New Sheet tabs.
- Replacing Apps Script with a different stack.
- Changing scoring after data has already been collected, unless teacher approves.

## Likely Questions For Keyur After The Class

Ask these before making the next improvement pass:

1. Where did students get stuck?
2. Did students understand Backup Proof Only?
3. Did students remember to email videos?
4. Was 10 shots per block too much, too little, or just right?
5. Did the kiosk auto-advance help or confuse students?
6. Did the teacher need more useful Dashboard information?
7. Did the Sheet collect clean enough data?
8. Were there iPad sizing/tapping issues?
9. Did students submit multiple times, and was that okay?
10. Did any group lose work or fail to submit?

## Suggested Output Style For Future GPT Work

When GPT receives the code zip and this handoff, it should respond with:

1. Plain-English summary of what it understands.
2. Any questions about actual classroom observations.
3. A short plan before editing.
4. Minimal, classroom-safe changes.
5. Tests run.
6. Clear paste/deploy instructions for Apps Script.

GPT should not pretend the app is a normal web app with npm tooling. It is a Google Apps Script classroom tool, and the correct workflow is usually local file editing plus manual paste/deploy into the school-owned Apps Script project.

## Final Mental Model

This project is a working classroom instrument, not a polished commercial product.

The best next version should help Keyur run the lab with less friction:

- Students know what to tap.
- Students cannot skip the truly required setup.
- Students can record 60 shots quickly.
- The teacher gets reliable Sheet data.
- Backup Proof Only protects students when the network or Sheet submit fails.
- The app stays simple enough to trust in a noisy 9th grade science room.
