# CPS Rubber Band Basket Launch - First Pass Build Notes

## 1. Files created

- `Code.gs` - Google Apps Script backend, Sheet setup, validation, scoring, duplicate attempt handling, best score update, dashboard rebuild, and troubleshooting log.
- `Index.html` - Main web app shell with the color-strip sidebar and proof templates.
- `Styles.html` - iPad-friendly color-strip kiosk styling with large controls and clear proof screens.
- `Script.html` - Student screen flow, kiosk shot-entry UI, local autosave, local score estimate, submit call, retry handling, and Backup Proof Only screen.
- `AGENTS.md` - Short project rules and first-pass agent workflow instructions.
- `FIRST_PASS_BUILD_NOTES.md` - Setup, schema, deployment, limits, and QA notes.
- `GPT55_UI_HANDOFF.md` - UI-specific handoff used to plan the color-strip kiosk pass.

## 2. Setup steps

1. Create or open the Google Sheet that will store the lab results.
2. Open Extensions > Apps Script from that Sheet.
3. Add these files in Apps Script with the same names:
   - `Code.gs`
   - `Index.html`
   - `Styles.html`
   - `Script.html`
4. Paste each local file into the matching Apps Script file.
5. Save the Apps Script project.
6. In Apps Script, run `getSettings` once from the editor.
7. Approve permissions when Google asks.
8. Confirm these Sheet tabs were created:
   - `Submissions_Raw`
   - `Best_Scores`
   - `Dashboard`
   - `Settings`
   - `Troubleshooting_Log`

## 3. Sheet tabs and columns

### Submissions_Raw

Stores every non-duplicate student attempt.

Columns:

The current ten-shot revision generates the trial columns instead of manually listing them all:

- Round 1: `R1_Small_T1` through `R1_Small_T10`, `R1_Medium_T1` through `R1_Medium_T10`, and `R1_Large_T1` through `R1_Large_T10`
- Round 2: each distance keeps one stretch field, 10 shot-result fields, and one legacy per-distance video column for schema compatibility:
  - `R2_3ft_Stretch`, `R2_3ft_T1` through `R2_3ft_T10`, `R2_3ft_Video`
  - `R2_6ft_Stretch`, `R2_6ft_T1` through `R2_6ft_T10`, `R2_6ft_Video`
  - `R2_9ft_Stretch`, `R2_9ft_T1` through `R2_9ft_T10`, `R2_9ft_Video`

The visible Round 2 shot-entry screen no longer asks for per-distance video. Video evidence is handled only on the separate Video Email screen. The legacy `R2_*_Video` columns remain so existing Sheet structure does not break.

Other columns include identifiers, score subtotals, student answers, review flags, version fields, and `Raw_JSON`.

### Best_Scores

Keeps one row per period/group key.

Columns:

`Group_Key`, `Period`, `Group_Name`, `Member_Names`, `Best_Score_Total`, `Percent`, `Best_Submission_ID`, `Best_Timestamp`, `Last_Submission_ID`, `Last_Timestamp`, `Submission_Count`, `Video_Email_Confirmed`, `Video_Sender_Email`, `Needs_Review`, `Review_Reasons`, `Notes`

Best score updates when a new attempt is higher. If the score ties, the latest tied attempt becomes the best attempt.

### Dashboard

Rebuilt from `Best_Scores`. It shows a simple period summary and then the best-score detail rows.

### Settings

Stores:

- Allowed periods: `1st hour`, `7th hour`
- Teacher email: `patelk07@psdr3.org`
- Round 1 trials per stretch: `10`
- Round 2 trials per distance: `10`
- App version
- Score version

### Troubleshooting_Log

Stores timestamp, type, message, and details for validation failures and server errors.

Columns:

`Timestamp`, `Type`, `Message`, `Details`

## 4. Deployment notes

1. In Apps Script, click Deploy > New deployment.
2. Choose Web app.
3. Set Execute as: Me.
4. Set access to district/domain users only unless the teacher intentionally chooses a broader setting.
5. Deploy and copy the web app URL.
6. Test one dummy student submission before class.
7. Make a QR code or post the web app URL for students.

Students still email video evidence separately to `patelk07@psdr3.org`. This app does not upload or store videos.

## 5. Known limitations

- The app cannot verify that the Gmail video was really sent. It only records the student confirmation and sender email.
- Backup Proof Only is local evidence on the iPad. It does not write to the Sheet.
- The local score estimate is meant for review. The server score in the Sheet is authoritative.
- Apps Script must be bound to a Google Sheet or `ensureSheets_` will report that there is no active spreadsheet.
- Dashboard is intentionally simple for the first pass.
- Students can submit with missing lab answers; missing scored parts receive 0 where the scoring rules require completion or correctness.

## 6. What QA should test next

1. Perfect submission should score 20/20 and appear in `Submissions_Raw`, `Best_Scores`, and `Dashboard`.
2. Missing Round 1 answers should warn students and reduce the Round 1 data score.
3. Marking video email as Yes without sender email should return a clear validation error.
4. Marking video email as No should submit but lose the video point and flag review.
5. Wrong free-body diagram labels should reduce the force score.
6. Double-click or retry with the same `Client_Attempt_ID` should not append a duplicate raw row.
7. Same group with a new attempt should append raw data and update `Best_Scores` only if higher or tied.
8. Backup Proof Only should clearly say it has NOT been submitted to Mr. Patel's Sheet.
9. Submitted proof should clearly say it WAS submitted and show a submission ID.
10. Refreshing the iPad mid-lab should restore saved local work and show the saved-work warning.
