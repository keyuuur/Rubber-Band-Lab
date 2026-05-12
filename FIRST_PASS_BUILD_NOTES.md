# CPS Rubber Band Basket Launch - First Pass Build Notes

## 1. Files created

- `Code.gs` - Google Apps Script backend, Sheet setup, validation, scoring, duplicate attempt handling, best score update, dashboard rebuild, and troubleshooting log.
- `Index.html` - Main web app shell.
- `Styles.html` - iPad-friendly styling with large controls and clear proof screens.
- `Script.html` - Student screen flow, local autosave, local score estimate, submit call, retry handling, and Backup Proof Only screen.
- `AGENTS.md` - Short project rules and first-pass agent workflow instructions.
- `FIRST_PASS_BUILD_NOTES.md` - Setup, schema, deployment, limits, and QA notes.

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

`Timestamp`, `Submission_ID`, `Client_Attempt_ID`, `Group_Key`, `Period`, `Group_Name`, `Member_Names`, `Score_Total`, `Score_Safety`, `Score_Round1_Data`, `Score_Round1_Science`, `Score_Round2_Video`, `Score_FBD`, `Score_Conservation`, `Score_Final`, `Percent`, `Emergency_Mode_Used`, `Needs_Review`, `Review_Reasons`, `App_Version`, `Score_Version`, `User_Agent`, `Prediction_Choice`, `Prediction_Explanation`, `Safety_Pompom_Only`, `Safety_Not_At_People`, `Setup_Basket_Backboard`, `Setup_Launch_Line`, `Setup_Round1_6ft`, `Setup_Video_Required`, `R1_Small_T1`, `R1_Small_T2`, `R1_Small_T3`, `R1_Medium_T1`, `R1_Medium_T2`, `R1_Medium_T3`, `R1_Large_T1`, `R1_Large_T2`, `R1_Large_T3`, `R1_Pattern_Choice`, `R1_Most_Elastic_Potential_Choice`, `R1_Best_For_6ft_Choice`, `Energy_Blank_1`, `Energy_Blank_2`, `R2_3ft_Stretch`, `R2_3ft_Result`, `R2_3ft_Video`, `R2_6ft_Stretch`, `R2_6ft_Result`, `R2_6ft_Video`, `R2_9ft_Stretch`, `R2_9ft_Result`, `R2_9ft_Video`, `Video_Email_Confirmed`, `Video_Sender_Email`, `Video_Clip_Description`, `FBD_Before_Up`, `FBD_Before_Down`, `FBD_Air_Down`, `FBD_Air_Back`, `Conservation_Q1`, `Conservation_Q2`, `Conservation_Q3`, `Final_Main_Idea`, `Final_Farther_Baskets_Stretch`, `Raw_JSON`

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
4. Set access based on school needs, usually district/domain users or anyone with the link.
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
8. Backup Proof Only should clearly say it has NOT submitted to Mr. Patel's Sheet.
9. Submitted proof should clearly say it WAS submitted and show a submission ID.
10. Refreshing the iPad mid-lab should restore saved local work and show the saved-work warning.
