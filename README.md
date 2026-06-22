# Build a MSRA Question Bank Website

Create a modern, responsive website for a question bank aimed at candidates preparing for the MSRA medical examination. The website must use British English throughout, including spelling, grammar, and terminology.

The purpose of this platform is to support spaced repetition and active recall so users can work through as many relevant questions as possible.

## Purpose

The website should allow users to:

- Access a free random question mode without logging in.
- Create an account and log in for more practice features.
- Track their progress over time.
- See a weekly leaderboard showing who has answered the most questions correctly.
- See a monthly leaderboard showing who has answered the most questions correctly in that month.
- Add questions to the question bank.
- Flag questions for review so admins can review and update them.

The product should feel trustworthy, medical, and exam-focused.

## Core idea

This is a question bank for MSRA candidates, designed to support revision, practise, and performance tracking. It should reflect the style and structure of the exam and help users build confidence through repeated practice.

## Required features

### Free access
- Users can try a random question mode without registering.
- The free mode should be simple and frictionless.
- Free users can answer questions one at a time and get immediate feedback.

### Account features
- Users can register and log in.
- Each account must have a unique identifier.
- Logged-in users can access:
  - Expanded question practice.
  - Progress tracking.
  - Performance history.
  - Examination-specific modes.
  - Leaderboard participation.
  - Question submission for review.

### Progress tracking
- Store and display:
  - Total questions answered.
  - Correct answers.
  - Incorrect answers.
  - Accuracy percentage.
  - Topic performance.
  - Question attempts over time.

### Weekly leaderboard
- Show a weekly leaderboard of users who have answered the most questions correctly.
- The leaderboard should reset weekly.
- Display rank, anonymous user data, score, and total correct answers for the week.

### Monthly leaderboard
- Show a monthly leaderboard of users who have answered the most questions correctly that month.
- Display rank, username or display name, score, and total correct answers for the month.
- Use this area to encourage engagement and contribution.

### Question flagging
- Users can flag questions for review.
- Flagged questions should go to an admin review queue.
- Admins should be able to see the reason for the flag and the question details.
- Admins can correctly update flagged questions after review.

## MSRA question bank requirements

### Blueprint alignment
- Questions should follow the MSRA examination blueprint.
- The system should support question tagging by:
  - Topic.
  - Subtopic.
  - Difficulty.
  - Blueprint area.
  - Exam type.

### Future exam support
- The question schema must allow questions to be marked for other examinations in future.
- Questions should support multiple exam tags, so one question can belong to MSRA and additional future exams.

## Suggested information architecture

### Public pages
- Home.
- Free random question mode.
- Sign up.
- Log in.
- About the MSRA.
- How it works.

### Logged-in pages
- Dashboard.
- Practice mode.
- Timed exam mode.
- Progress page.
- Leaderboard.
- Monthly contributions page.
- Flagged questions history.
- Account settings.

### Admin pages
- Review queue.
- Question management.
- User management.
- Blueprint tag management.
- Analytics overview.

## Question schema

Design the database schema so each question can include:

- Question ID.
- Question stem.
- Answer options.
- Correct answer.
- Explanation.
- Topic.
- Subtopic.
- Difficulty level.
- MSRA blueprint tag.
- Other exam tags.
- Clinical area.
- Question type.
- Active or inactive status.
- Flag count.
- Created date.
- Updated date.

The schema should also support:
- Single-best-answer questions.
- Explanations after submission.
- Random question selection.
- Filtering by topic, blueprint area, difficulty, and exam type.
- Questions being reused across different exams.

## UX and design requirements

- Clean, professional medical design.
- Calm colours, strong readability, and mobile-friendly layout.
- Clear calls to action for sign up and practice.
- British English copy everywhere.
- Simple navigation.
- Accessible interface with good contrast and keyboard support.
- Make the experience feel polished and exam-focused rather than playful.

## Functional behaviour

- Free users can access random questions immediately.
- Logged-in users can choose between:
  - Random practice.
  - Topic practice.
  - Timed sessions.
  - Exam simulation.
- Correct answers should be recorded instantly.
- Incorrect answers should show explanations and optional revision links.
- Users should be able to resume where they left off.
- Leaderboard updates should happen weekly and monthly.

## Admin behaviour

Admins should be able to:
- Review flagged questions.
- Edit or retire questions.
- Add or change exam tags.
- See usage trends.
- View leaderboard moderation if needed.

## Content style

- Use British English spelling such as “practise”, “organise”, and “favour”.
- Write in a clear, reassuring, professional tone.
- Avoid overly casual language.
- Make the website feel suitable for medical trainees.

## Output expectations

Generate:
- A complete website structure.
- Suggested page content.
- Component ideas.
- Question schema recommendations.
- A polished front-end design concept.
- Any helpful placeholder data needed to demonstrate the product.

## Important notes

- Prioritise MSRA exam relevance.
- Ensure the schema is flexible enough for future exams.
- Keep the free experience useful, but make the logged-in version clearly more powerful.
- Design the leaderboard and progress tracking so users feel motivated to return.
