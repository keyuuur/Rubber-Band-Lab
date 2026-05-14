# GPT-5.5 UI Handoff - Rubber Band Lab

## Purpose

Use this handoff to improve the student-facing UI for the Rubber Band Basket Launch Google Apps Script app.

The app is already functional. Do not restart the project. Do not invent a new stack. The goal is a focused UI pass that makes the ten-shot lab flow easier for real 9th grade students on iPads.

## Teacher / User Context

The teacher is a non-traditional programmer and wants plain English explanations. Keep the work practical, classroom-safe, and easy to manually paste into Apps Script if needed.

After the task, always report:

1. What changed and why, in plain English.
2. A click-by-click test checklist.
3. Optional follow-up improvements noticed but not implemented.

## Current Project

Local folder:

`C:\Users\Keyur\Desktop\Claude Code YEET\Concepts of Phys Games\Rubber Band Lab LOCAL`

GitHub repo:

`https://github.com/keyuuur/Rubber-Band-Lab`

Project type:

Google Apps Script web app using raw Apps Script files only.

Core files:

- `Code.gs` - backend, Sheets setup, validation, scoring, best scores, dashboard
- `Index.html` - app shell and proof templates
- `Styles.html` - raw CSS
- `Script.html` - student flow and client behavior
- `appsscript.json` - Apps Script manifest
- `AGENTS.md` - local project instructions
- `FIRST_PASS_BUILD_NOTES.md` - setup/schema/deployment notes
- `llm-handoff-file-rubber-band.md` - broader project state handoff

Do not commit or expose:

- `.clasp.json`
- `client_secret_*.json`
- OAuth tokens or credential files

## Current App State

The app is a classroom lab form for a rubber band / pom-pom basket launch activity.

Students:

1. Enter group info.
2. Complete safety/setup checks.
3. Make a prediction.
4. Record Round 1 launch trials at 6 ft.
5. Answer pattern and energy questions.
6. Record Round 2 distance challenge trials.
7. Confirm video evidence was emailed.
8. Answer free-body diagram dropdown questions.
9. Answer conservation/final conclusion questions.
10. Review and submit.

Current ten-shot requirement:

- Round 1 fixed distance: 6 ft
- Round 1 stretches: Small, Medium, Large
- Round 1 trials: 10 shots per stretch
- Round 2 distances: 3 ft, 6 ft, 9 ft
- Round 2 trials: 10 shots per distance
- Trial result choices: Made, Missed short, Missed long, Missed side
- Bank shots count as Made if the pom-pom lands in the basket

Important student-facing wording:

- Use `Backup Proof Only`
- Never use `Emergency Submit`
- Backup Proof Only must clearly say the work has `NOT submitted` to Mr. Patel's Sheet
- Submitted proof must clearly say the work `WAS submitted` and show a Submission ID
- Video evidence is email-only to `patelk07@psdr3.org`
- Do not add video upload

Backend truth:

- Server-side scoring is the source of truth
- Total score is 20 points
- Multiple submissions are allowed
- `Submissions_Raw` keeps every valid raw attempt
- `Best_Scores` keeps the highest score by normalized group key
- `Dashboard` is basic teacher review, not a student feature

## Hard Constraints

Keep these unchanged:

- Raw Apps Script only
- No npm
- No frameworks
- No external dependencies
- No login system
- No video upload
- No new Sheet tabs unless explicitly approved
- No scoring behavior changes unless a blocking bug is found
- No change to total score of 20
- No change to period choices: `1st hour`, `7th hour`
- No change to required Sheet tabs:
  - `Submissions_Raw`
  - `Best_Scores`
  - `Dashboard`
  - `Settings`
  - `Troubleshooting_Log`

Prefer editing only:

- `Index.html`
- `Styles.html`
- `Script.html`

Edit `Code.gs` only if the UI work exposes a true backend bug or a tiny setting/helper is needed. Do not change scoring or Sheet schema during a UI-only pass.

## UI Goal

Make the current ten-shot flow feel fast, obvious, and hard to mess up on an iPad in a noisy classroom.

The main UI challenge is that students now record 60 shot results:

- 30 in Round 1
- 30 in Round 2

The current implementation works, but a better UI should reduce scrolling, reduce reading, and make it very clear what students should tap next.

Aim for:

- Large tap targets
- Short labels
- Clear progress within each ten-shot block
- Obvious selected states
- No tiny dense controls
- No confusing proof/backup language
- No broad visual redesign that risks breaking the app before class

## Recommended UI Direction

Use a compact ten-shot entry pattern for each stretch/distance block.

Good options:

- A 10-row quick-tap list with very clear selected states
- A 10-button grid where each trial opens or exposes four result choices
- A compact matrix where each trial has four large choices

Whatever pattern is chosen, it must remain simple enough for 9th graders on iPads.

Avoid:

- Tiny table cells
- Drag-and-drop
- Hidden gestures
- Fancy animations
- Long explanatory text
- A landing page
- Decorative UI that gets in the way of recording data

## Required UI Development Process

Use the same process from this project:

### Phase 1 - Context Intake

Read these first:

1. `AGENTS.md`
2. `llm-handoff-file-rubber-band.md`
3. `FIRST_PASS_BUILD_NOTES.md`
4. `Index.html`
5. `Styles.html`
6. `Script.html`
7. `Code.gs` only enough to understand backend field names and validation

Do not edit during this phase.

### Phase 2 - Read-Only Agent Review

Before coding, use read-only agents if the environment supports them.

Agent 1 - Student / iPad UX Agent:

- Inspect the current student flow.
- Focus on Round 1, Round 2, Backup Proof Only, Review, and Submit.
- Report classroom-breaking UI risks.
- Suggest the smallest useful UI changes.
- Do not edit files.

Agent 2 - Apps Script / Data Safety Agent:

- Inspect how `Script.html` field names match `Code.gs`.
- Confirm which UI fields must not be renamed.
- Confirm no Sheet/scoring changes are needed.
- Identify any risk that UI changes could break submission.
- Do not edit files.

### Phase 3 - Short Implementation Plan

After the agents report, write a short plan:

- What screens will change
- What files will change
- What behavior will stay unchanged
- How the ten-shot data will still map to the existing backend fields
- What tests will prove the UI did not break submission

Keep the plan short and then implement.

### Phase 4 - One Implementation Pass

Use one implementation agent/pass only.

Allowed work:

- Improve Round 1 ten-shot data entry UI
- Improve Round 2 ten-shot data entry UI
- Improve selected/tapped states
- Improve iPad spacing and readability
- Improve Backup Proof Only clarity only if needed
- Improve Review screen clarity only if needed

Do not add:

- New features
- New scoring
- New tabs
- New upload flow
- New teacher dashboard redesign
- New authentication
- External CSS/JS libraries

### Phase 5 - QA / Student Simulation

Do not add features during QA.

Test as if real CPS 1st/7th hour students are using iPads.

Required QA scenarios:

1. Perfect group submission still scores 20/20.
2. Missing group name is blocked.
3. One member name is blocked.
4. Two member names are accepted.
5. Video Yes with blank sender email is blocked.
6. Backup Proof Only clearly says NOT submitted.
7. Submitted proof clearly says submitted and shows Submission ID.
8. Round 1 clearly shows 10 shots for Small, Medium, and Large.
9. Round 2 clearly shows 10 shots for 3 ft, 6 ft, and 9 ft.
10. Same group multiple submissions still preserve all raw attempts and best score.
11. UI is usable on iPad-size viewport.

### Phase 6 - Final Integrator Pass

Apply only required fixes from QA.

Do not polish broadly after QA. Separate required fixes from nice-to-have improvements.

## Testing / Checks To Run

Local checks:

1. Parse `Code.gs` if edited.
2. Parse `Script.html` JavaScript.
3. Confirm no syntax-breaking Apps Script changes.
4. Confirm `git diff --check` passes.

Apps Script checks if `.clasp.json` and auth are available:

1. Push to sandbox Apps Script with clasp.
2. Run `getSettings`.
3. Confirm:
   - `round1TrialsPerStretch = 10`
   - `round2TrialsPerDistance = 10`
4. Submit a perfect dummy group through the web app or Execution API.
5. Confirm score is 20/20.
6. Confirm one-member submission is blocked.

Manual browser/iPad checks:

1. Open deployed web app while signed into a `psdr3.org` account.
2. Go through Round 1 and Round 2.
3. Confirm the tap flow feels fast enough for students.
4. Confirm students always know what to do next.
5. Confirm proof and backup screens are visually unmistakable.

## Known Current Deployment State

The sandbox Apps Script backend has already been tested after the ten-shot update:

- `getSettings` returned `round1TrialsPerStretch: 10`
- `getSettings` returned `round2TrialsPerDistance: 10`
- Perfect ten-shot dummy submission scored `20/20`
- One-member submission was correctly blocked

The browser/iPad visual pass still needs a signed-in `psdr3.org` browser session because the deployed app is domain protected.

## Output Format For GPT-5.5

Return the work in this structure:

```md
## UI Implementation Summary

* Overall status:
* Files changed:
* Screens changed:
* Behavior intentionally unchanged:

## Read-Only Agent Findings

* Student / iPad UX Agent:
* Apps Script / Data Safety Agent:

## UI Changes Made

* Round 1:
* Round 2:
* Review / Submit:
* Backup Proof Only:

## QA Results

* Ten-shot display:
* Perfect scoring:
* Required validation:
* Backup Proof Only:
* iPad usability:
* Multiple submissions:

## Teacher Test Checklist

1. ...
2. ...
3. ...

## Remaining Limitations

* Required before class:
* Optional later:
```

## Final Reminder

The best UI pass here is not a flashy redesign. It is a calmer, faster, more mistake-proof student recording flow for 60 quick trial results on an iPad.

