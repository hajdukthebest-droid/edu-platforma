# 🧪 QA Test Plan - Features #28-31

**Test Date**: 2025-11-26
**Features Tested**: Study Planner, Adaptive Learning, Content Summarization, Multi-Language Translation
**Environment**: Development
**Base URL**: `http://localhost:3001/api`

---

## 📋 Table of Contents

1. [Feature #28: Study Planner & Calendar Integration](#feature-28)
2. [Feature #29: Adaptive Learning System](#feature-29)
3. [Feature #30: Content Summarization](#feature-30)
4. [Feature #31: Multi-Language Translation](#feature-31)
5. [Integration Tests](#integration-tests)
6. [Performance Tests](#performance-tests)
7. [Security Tests](#security-tests)

---

## Feature #28: Study Planner & Calendar Integration

### Base Path: `/api/study-planner`

### Test Cases

#### TC-28.1: Create Study Plan
**Endpoint**: `POST /api/study-planner/plan`
**Auth**: Required (Learner)

| Test ID | Description | Input | Expected Output | Status |
|---------|-------------|-------|-----------------|--------|
| 28.1.1 | Create valid study plan | Valid plan data | 201, plan created | ⏳ |
| 28.1.2 | Create without auth | No token | 401 Unauthorized | ⏳ |
| 28.1.3 | Create with missing fields | Incomplete data | 400 Bad Request | ⏳ |
| 28.1.4 | Create duplicate plan | Existing user plan | 400 Conflict | ⏳ |

**Request Example**:
```json
{
  "weeklyGoalHours": 10,
  "preferredStudyTimes": ["09:00", "14:00", "20:00"],
  "focusAreas": ["Farmakologija", "Biokemija"]
}
```

---

#### TC-28.2: Create Study Session
**Endpoint**: `POST /api/study-planner/sessions`
**Auth**: Required (Learner)

| Test ID | Description | Input | Expected Output | Status |
|---------|-------------|-------|-----------------|--------|
| 28.2.1 | Create valid session | Valid session data | 201, session created | ⏳ |
| 28.2.2 | Invalid time range | endTime before startTime | 400 Bad Request | ⏳ |
| 28.2.3 | Missing required fields | No title/startTime | 400 Bad Request | ⏳ |
| 28.2.4 | Very long duration | 24+ hours | Should accept/warn | ⏳ |

---

#### TC-28.3: Start Study Session
**Endpoint**: `POST /api/study-planner/sessions/:sessionId/start`
**Auth**: Required (Learner)

| Test ID | Description | Input | Expected Output | Status |
|---------|-------------|-------|-----------------|--------|
| 28.3.1 | Start scheduled session | Valid sessionId | 200, status=IN_PROGRESS | ⏳ |
| 28.3.2 | Start non-existent session | Invalid sessionId | 404 Not Found | ⏳ |
| 28.3.3 | Start already started | IN_PROGRESS session | 400 Bad Request | ⏳ |
| 28.3.4 | Start completed session | COMPLETED session | 400 Bad Request | ⏳ |

---

#### TC-28.4: Complete Study Session
**Endpoint**: `POST /api/study-planner/sessions/:sessionId/complete`
**Auth**: Required (Learner)

| Test ID | Description | Input | Expected Output | Status |
|---------|-------------|-------|-----------------|--------|
| 28.4.1 | Complete in-progress session | Valid sessionId + notes | 200, stats updated | ⏳ |
| 28.4.2 | Complete without starting | SCHEDULED session | 400 Bad Request | ⏳ |
| 28.4.3 | Add outcome rating | outcome: PRODUCTIVE | 200, outcome saved | ⏳ |
| 28.4.4 | Check statistics update | Complete session | Plan stats incremented | ⏳ |

---

#### TC-28.5: Study Goals
**Endpoint**: `POST /api/study-planner/goals`
**Auth**: Required (Learner)

| Test ID | Description | Input | Expected Output | Status |
|---------|-------------|-------|-----------------|--------|
| 28.5.1 | Create lesson goal | type=LESSONS_COMPLETED | 201, goal created | ⏳ |
| 28.5.2 | Create hours goal | type=STUDY_HOURS | 201, goal created | ⏳ |
| 28.5.3 | Update goal progress | PUT with currentValue | 200, progress updated | ⏳ |
| 28.5.4 | Goal completion | currentValue >= targetValue | status=COMPLETED | ⏳ |

---

#### TC-28.6: Recurring Study Blocks
**Endpoint**: `POST /api/study-planner/blocks`
**Auth**: Required (Learner)

| Test ID | Description | Input | Expected Output | Status |
|---------|-------------|-------|-----------------|--------|
| 28.6.1 | Create recurring block | Valid iCal rule | 201, block created | ⏳ |
| 28.6.2 | Invalid recurrence rule | Bad iCal format | 400 Bad Request | ⏳ |
| 28.6.3 | Get user blocks | GET /blocks | 200, array of blocks | ⏳ |

---

#### TC-28.7: Session Templates
**Endpoint**: `POST /api/study-planner/templates`
**Auth**: Required (Learner)

| Test ID | Description | Input | Expected Output | Status |
|---------|-------------|-------|-----------------|--------|
| 28.7.1 | Create template | Valid template data | 201, template created | ⏳ |
| 28.7.2 | Use template | POST /templates/:id/use | 201, session from template | ⏳ |

---

## Feature #29: Adaptive Learning System

### Base Path: `/api/adaptive`

### Test Cases

#### TC-29.1: Adaptive Learning Path
**Endpoint**: `GET /api/adaptive/path/:courseId`
**Auth**: Required (Learner)

| Test ID | Description | Input | Expected Output | Status |
|---------|-------------|-------|-----------------|--------|
| 29.1.1 | Get path for enrolled course | Valid courseId | 200, adaptive path | ⏳ |
| 29.1.2 | Course not enrolled | Not enrolled course | 200, empty recommendations | ⏳ |
| 29.1.3 | Non-existent course | Invalid courseId | 200, empty array | ⏳ |
| 29.1.4 | Check skill gaps | With quiz failures | skillGaps array populated | ⏳ |
| 29.1.5 | Check difficulty adjustment | High quiz scores | difficultyAdjustment=increase | ⏳ |
| 29.1.6 | Personalized tips | Various performance | Tips array 1-4 items | ⏳ |

**Expected Response Structure**:
```json
{
  "success": true,
  "data": {
    "recommendedLessons": [...],
    "skillGaps": ["topic1", "topic2"],
    "difficultyAdjustment": "increase|decrease|maintain",
    "personalizedTips": [...]
  }
}
```

---

#### TC-29.2: Suggested Difficulty Level
**Endpoint**: `GET /api/adaptive/difficulty/:categoryId`
**Auth**: Required (Learner)

| Test ID | Description | Input | Expected Output | Status |
|---------|-------------|-------|-----------------|--------|
| 29.2.1 | New learner | No completed courses | BEGINNER | ⏳ |
| 29.2.2 | Intermediate learner | Some completed courses | INTERMEDIATE/ADVANCED | ⏳ |
| 29.2.3 | Expert learner | Advanced courses completed | EXPERT | ⏳ |
| 29.2.4 | Category validation | Invalid categoryId | 400 Bad Request | ⏳ |

---

#### TC-29.3: Review Schedule (Spaced Repetition)
**Endpoint**: `GET /api/adaptive/review-schedule/:courseId`
**Auth**: Required (Learner)

| Test ID | Description | Input | Expected Output | Status |
|---------|-------------|-------|-----------------|--------|
| 29.3.1 | Get review schedule | Valid courseId | 200, todayReviews + upcoming | ⏳ |
| 29.3.2 | No completed lessons | New course | Empty arrays | ⏳ |
| 29.3.3 | Check intervals | Completed lesson 1 day ago | In todayReviews | ⏳ |
| 29.3.4 | Check intervals | Completed lesson 5 days ago | In upcomingReviews | ⏳ |

**Spaced Repetition Intervals**: 1, 3, 7, 14, 30 days

---

#### TC-29.4: Learning Pathway
**Endpoint**: `GET /api/adaptive/learning-pathway/:categoryId`
**Auth**: Required (Learner)

| Test ID | Description | Input | Expected Output | Status |
|---------|-------------|-------|-----------------|--------|
| 29.4.1 | Get pathway | Valid categoryId | 200, ordered courses | ⏳ |
| 29.4.2 | Check course ordering | By difficulty | BEGINNER → EXPERT | ⏳ |
| 29.4.3 | Estimated duration | Response includes | estimatedDuration field | ⏳ |
| 29.4.4 | Milestones | Response includes | milestones array | ⏳ |

---

#### TC-29.5: Learning Insights (Comprehensive)
**Endpoint**: `GET /api/adaptive/insights/:courseId`
**Auth**: Required (Learner)

| Test ID | Description | Input | Expected Output | Status |
|---------|-------------|-------|-----------------|--------|
| 29.5.1 | Get insights | Valid courseId | 200, combined insights | ⏳ |
| 29.5.2 | Performance indicator | Various performance | excellent/good/needs-improvement/struggling | ⏳ |
| 29.5.3 | Summary metrics | Response includes | skillGapsCount, reviewsToday, etc. | ⏳ |

---

## Feature #30: Content Summarization & Keyword Extraction

### Base Path: `/api/summarize`

### Test Cases

#### TC-30.1: Text Summarization
**Endpoint**: `POST /api/summarize/text`
**Auth**: Required

| Test ID | Description | Input | Expected Output | Status |
|---------|-------------|-------|-----------------|--------|
| 30.1.1 | Summarize long text | 1000+ words | 200, 3 sentence summary | ⏳ |
| 30.1.2 | Custom sentence count | maxSentences: 5 | 200, 5 sentence summary | ⏳ |
| 30.1.3 | Empty text | text: "" | 400 Bad Request | ⏳ |
| 30.1.4 | Short text | < 3 sentences | 200, original text | ⏳ |
| 30.1.5 | Compression ratio | Long text | compressionRatio calculated | ⏳ |
| 30.1.6 | Missing text field | No text | 400 Bad Request | ⏳ |

**Request Example**:
```json
{
  "text": "Long text content here...",
  "maxSentences": 3
}
```

---

#### TC-30.2: Keyword Extraction
**Endpoint**: `POST /api/summarize/keywords`
**Auth**: Required

| Test ID | Description | Input | Expected Output | Status |
|---------|-------------|-------|-----------------|--------|
| 30.2.1 | Extract keywords | Valid text | 200, keywords array | ⏳ |
| 30.2.2 | Custom keyword count | maxKeywords: 15 | 200, 15 keywords | ⏳ |
| 30.2.3 | Stop word filtering | Common words | Filtered out | ⏳ |
| 30.2.4 | Empty text | text: "" | 400 Bad Request | ⏳ |
| 30.2.5 | Top 5 tags | Response includes | tags array (top 5) | ⏳ |

---

#### TC-30.3: Course Overview Summary
**Endpoint**: `GET /api/summarize/course/:courseId`
**Auth**: Required

| Test ID | Description | Input | Expected Output | Status |
|---------|-------------|-------|-----------------|--------|
| 30.3.1 | Get course overview | Valid courseId | 200, comprehensive overview | ⏳ |
| 30.3.2 | Non-existent course | Invalid courseId | 404 Not Found | ⏳ |
| 30.3.3 | Check statistics | Response includes | totalModules, totalLessons, duration | ⏳ |
| 30.3.4 | Keywords extracted | Response includes | keywords array | ⏳ |
| 30.3.5 | Learning objectives | Response includes | learningObjectives array | ⏳ |

**Expected Statistics**:
- totalModules
- totalLessons
- totalDurationMinutes
- lessonTypes breakdown
- enrollmentCount
- reviewCount

---

#### TC-30.4: Module Summary
**Endpoint**: `GET /api/summarize/module/:moduleId`
**Auth**: Required

| Test ID | Description | Input | Expected Output | Status |
|---------|-------------|-------|-----------------|--------|
| 30.4.1 | Get module summary | Valid moduleId | 200, module summary | ⏳ |
| 30.4.2 | Non-existent module | Invalid moduleId | 404 Not Found | ⏳ |
| 30.4.3 | Lesson count | Response includes | lessonCount | ⏳ |
| 30.4.4 | Duration estimate | Response includes | estimatedMinutes | ⏳ |

---

#### TC-30.5: User Learning Summary
**Endpoint**: `GET /api/summarize/user-learning`
**Auth**: Required (Learner)

| Test ID | Description | Input | Expected Output | Status |
|---------|-------------|-------|-----------------|--------|
| 30.5.1 | Get user summary | Valid user | 200, learning summary | ⏳ |
| 30.5.2 | No enrollments | New user | 200, empty/minimal summary | ⏳ |
| 30.5.3 | Without auth | No token | 401 Unauthorized | ⏳ |

---

## Feature #31: Multi-Language Translation System

### Base Path: `/api/translations`

### Test Cases

#### TC-31.1: Get Course with Translation (Public)
**Endpoint**: `GET /api/translations/course/:courseId/:locale`
**Auth**: Not required (Public)

| Test ID | Description | Input | Expected Output | Status |
|---------|-------------|-------|-----------------|--------|
| 31.1.1 | Get Croatian translation | courseId + HR | 200, HR translations applied | ⏳ |
| 31.1.2 | Get English translation | courseId + EN | 200, EN translations applied | ⏳ |
| 31.1.3 | Invalid locale | courseId + FR | 400 Bad Request | ⏳ |
| 31.1.4 | Missing translation | No translation exists | 200, original language | ⏳ |
| 31.1.5 | Nested translations | Check modules/lessons | All levels translated | ⏳ |
| 31.1.6 | Non-existent course | Invalid courseId | 404 Not Found | ⏳ |

**Supported Locales**: HR, EN

---

#### TC-31.2: Translation Status (Public)
**Endpoint**: `GET /api/translations/status/:courseId`
**Auth**: Not required (Public)

| Test ID | Description | Input | Expected Output | Status |
|---------|-------------|-------|-----------------|--------|
| 31.2.1 | Get translation status | Valid courseId | 200, status per locale | ⏳ |
| 31.2.2 | Completion percentage | Partial translation | 0-100% per locale | ⏳ |
| 31.2.3 | Check breakdown | Response includes | courseTranslated, modulesTranslated, lessonsTranslated | ⏳ |
| 31.2.4 | Non-existent course | Invalid courseId | 404 Not Found | ⏳ |

**Expected Response**:
```json
{
  "HR": {
    "isComplete": true,
    "completionPercentage": 100,
    "courseTranslated": true,
    "modulesTranslated": 5,
    "totalModules": 5,
    "lessonsTranslated": 25,
    "totalLessons": 25
  },
  "EN": { ... }
}
```

---

#### TC-31.3: Check Translation Exists (Public)
**Endpoint**: `GET /api/translations/check/:type/:id/:locale`
**Auth**: Not required (Public)

| Test ID | Description | Input | Expected Output | Status |
|---------|-------------|-------|-----------------|--------|
| 31.3.1 | Check course translation | type=course | 200, {exists: true/false} | ⏳ |
| 31.3.2 | Check module translation | type=module | 200, {exists: true/false} | ⏳ |
| 31.3.3 | Check lesson translation | type=lesson | 200, {exists: true/false} | ⏳ |
| 31.3.4 | Invalid type | type=invalid | 400 Bad Request | ⏳ |
| 31.3.5 | Invalid locale | locale=FR | 400 Bad Request | ⏳ |

---

#### TC-31.4: Create/Update Course Translation (Protected)
**Endpoint**: `POST /api/translations/course`
**Auth**: Required (Instructor/Admin)

| Test ID | Description | Input | Expected Output | Status |
|---------|-------------|-------|-----------------|--------|
| 31.4.1 | Create translation | Valid data | 200, translation created | ⏳ |
| 31.4.2 | Update existing | Existing translation | 200, translation updated | ⏳ |
| 31.4.3 | Missing title | No title field | 400 Bad Request | ⏳ |
| 31.4.4 | Invalid locale | locale=FR | 400 Bad Request | ⏳ |
| 31.4.5 | Without auth | No token | 401 Unauthorized | ⏳ |
| 31.4.6 | Full course data | All optional fields | 200, all fields saved | ⏳ |

**Request Example**:
```json
{
  "courseId": "course-id",
  "locale": "EN",
  "title": "Introduction to Pharmacology",
  "description": "Learn the basics...",
  "shortDescription": "Pharmacology basics",
  "learningObjectives": ["Objective 1", "Objective 2"],
  "requirements": ["Requirement 1"],
  "targetAudience": "Pharmacy students"
}
```

---

#### TC-31.5: Create/Update Module Translation (Protected)
**Endpoint**: `POST /api/translations/module`
**Auth**: Required (Instructor/Admin)

| Test ID | Description | Input | Expected Output | Status |
|---------|-------------|-------|-----------------|--------|
| 31.5.1 | Create module translation | Valid data | 200, translation created | ⏳ |
| 31.5.2 | Update existing | Existing translation | 200, translation updated | ⏳ |
| 31.5.3 | Missing title | No title | 400 Bad Request | ⏳ |

---

#### TC-31.6: Create/Update Lesson Translation (Protected)
**Endpoint**: `POST /api/translations/lesson`
**Auth**: Required (Instructor/Admin)

| Test ID | Description | Input | Expected Output | Status |
|---------|-------------|-------|-----------------|--------|
| 31.6.1 | Create lesson translation | Valid data | 200, translation created | ⏳ |
| 31.6.2 | Update content | With content field | 200, content translated | ⏳ |
| 31.6.3 | Missing title | No title | 400 Bad Request | ⏳ |

---

#### TC-31.7: Delete Translations (Protected)
**Endpoint**: `DELETE /api/translations/{type}/:id/:locale`
**Auth**: Required (Instructor/Admin)

| Test ID | Description | Input | Expected Output | Status |
|---------|-------------|-------|-----------------|--------|
| 31.7.1 | Delete course translation | Valid courseId + locale | 200, deleted | ⏳ |
| 31.7.2 | Delete module translation | Valid moduleId + locale | 200, deleted | ⏳ |
| 31.7.3 | Delete lesson translation | Valid lessonId + locale | 200, deleted | ⏳ |
| 31.7.4 | Delete non-existent | No translation | 404/400 | ⏳ |
| 31.7.5 | Without auth | No token | 401 Unauthorized | ⏳ |

---

## Integration Tests

### INT-1: Study Planner + Adaptive Learning
| Test ID | Description | Expected Result | Status |
|---------|-------------|-----------------|--------|
| INT-1.1 | Complete study session affects adaptive path | Session completion → updated recommendations | ⏳ |
| INT-1.2 | Study goals affect difficulty suggestion | Goals completed → higher difficulty suggested | ⏳ |

---

### INT-2: Content Summarization + Translation
| Test ID | Description | Expected Result | Status |
|---------|-------------|-----------------|--------|
| INT-2.1 | Summarize translated course | Both operations work together | ⏳ |
| INT-2.2 | Keywords from translated content | Keywords in target language | ⏳ |

---

### INT-3: All Features Together
| Test ID | Description | Expected Result | Status |
|---------|-------------|-----------------|--------|
| INT-3.1 | Full learner journey | Create plan → study → get adaptive recommendations → review translations | ⏳ |

---

## Performance Tests

### PERF-1: Response Times
| Endpoint | Max Acceptable Time | Status |
|----------|---------------------|--------|
| GET /adaptive/path/:courseId | < 500ms | ⏳ |
| GET /adaptive/insights/:courseId | < 1000ms | ⏳ |
| POST /summarize/text (1000 words) | < 2000ms | ⏳ |
| GET /translations/course/:courseId/:locale | < 500ms | ⏳ |
| POST /study-planner/sessions/:id/complete | < 300ms | ⏳ |

---

### PERF-2: Concurrent Users
| Test | Load | Expected Result | Status |
|------|------|-----------------|--------|
| 10 concurrent requests | /adaptive/path | All succeed < 1s | ⏳ |
| 50 concurrent requests | /summarize/text | All succeed < 5s | ⏳ |

---

## Security Tests

### SEC-1: Authentication & Authorization
| Test ID | Description | Expected Result | Status |
|---------|-------------|-----------------|--------|
| SEC-1.1 | Access protected endpoint without token | 401 Unauthorized | ⏳ |
| SEC-1.2 | Access with invalid token | 401 Unauthorized | ⏳ |
| SEC-1.3 | Learner access instructor-only endpoint | 403 Forbidden | ⏳ |
| SEC-1.4 | Access other user's study plan | 403 Forbidden | ⏳ |

---

### SEC-2: Input Validation
| Test ID | Description | Expected Result | Status |
|---------|-------------|-----------------|--------|
| SEC-2.1 | SQL injection in text field | Sanitized, no injection | ⏳ |
| SEC-2.2 | XSS in summary text | Sanitized output | ⏳ |
| SEC-2.3 | Extremely long text (> 1MB) | 400 Bad Request or trimmed | ⏳ |
| SEC-2.4 | Invalid locale format | 400 Bad Request | ⏳ |

---

### SEC-3: Rate Limiting
| Test ID | Description | Expected Result | Status |
|---------|-------------|-----------------|--------|
| SEC-3.1 | 100 requests in 1 second | Rate limit triggered | ⏳ |
| SEC-3.2 | Brute force session creation | Limit enforced | ⏳ |

---

## Edge Cases & Error Handling

### EDGE-1: Boundary Conditions
| Test ID | Description | Input | Expected Result | Status |
|---------|-------------|-------|-----------------|--------|
| EDGE-1.1 | Study session 0 minutes | duration: 0 | 400 Bad Request | ⏳ |
| EDGE-1.2 | Study goal with 0 target | targetValue: 0 | 400 Bad Request | ⏳ |
| EDGE-1.3 | Empty keywords array | Empty text | Empty array | ⏳ |
| EDGE-1.4 | Translation with only spaces | title: "   " | 400 Bad Request | ⏳ |

---

### EDGE-2: Data Consistency
| Test ID | Description | Expected Result | Status |
|---------|-------------|-----------------|--------|
| EDGE-2.1 | Delete course with translations | Cascade delete or prevent | ⏳ |
| EDGE-2.2 | Complete session twice | Idempotent or error | ⏳ |
| EDGE-2.3 | Goal progress > target | Handle gracefully | ⏳ |

---

## Test Execution Summary

**Total Test Cases**: 100+
**Automated**: TBD
**Manual**: TBD

**Priority Levels**:
- 🔴 **P0 (Critical)**: Authentication, CRUD operations, data integrity
- 🟡 **P1 (High)**: Business logic, integrations, performance
- 🟢 **P2 (Medium)**: Edge cases, error messages, UX
- ⚪ **P3 (Low)**: Nice-to-have validations

---

## Test Environments

### Development
- URL: `http://localhost:3001/api`
- Database: Local PostgreSQL
- Auth: JWT tokens

### Staging (Future)
- URL: TBD
- Database: Staging PostgreSQL
- Auth: JWT tokens

---

## Notes for QA Team

1. **Authentication**: Use test accounts from seed data
   - Learner: `learner@edu-platforma.hr` / `learner123`
   - Instructor: `instructor@edu-platforma.hr` / `instructor123`
   - Admin: `admin@edu-platforma.hr` / `admin123`

2. **Test Data**: Run `npm run db:seed` before testing

3. **Tools**:
   - Postman Collection (see `QA_API_TESTS.postman.json`)
   - curl scripts (see `qa-tests.sh`)
   - Automated tests (see `tests/api/`)

4. **Bug Reporting**: Use GitHub Issues with label `qa-bug`

5. **Coverage Goal**: 80%+ code coverage for critical paths

---

**Last Updated**: 2025-11-26
**Created By**: QA Automation
**Status**: Ready for execution ⏳
