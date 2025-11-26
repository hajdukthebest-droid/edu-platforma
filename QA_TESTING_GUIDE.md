# 🧪 QA Testing Guide - Features #28-31

## Quick Start

### Prerequisites

1. **API Server Running**
   ```bash
   cd apps/api
   npm run dev
   ```
   Server should be running on `http://localhost:3001`

2. **Database Seeded**
   ```bash
   cd packages/database
   npm run db:migrate
   npm run db:seed
   ```

3. **Test Tools**
   - curl (for bash script)
   - Postman (for Postman collection)
   - Optional: Newman for automated Postman tests

---

## Test Execution Methods

### Method 1: Bash Script (Automated)

**Quick & Easy - Recommended for CI/CD**

```bash
# Make script executable (first time only)
chmod +x qa-tests.sh

# Run all tests
./qa-tests.sh

# View results
cat qa-test-results.txt
```

**Expected Output**:
```
========================================
  QA API Tests - Features #28-31
========================================

Testing: 28.1 - Get study plan
✓ PASSED (Status: 200)

Testing: 28.2 - Create study plan
✓ PASSED (Status: 200)

...

========================================
  TEST SUMMARY
========================================

Total Tests:  45
Passed:       43
Failed:       2
Pass Rate:    95.56%
```

---

### Method 2: Postman Collection (Interactive)

**Best for Manual Testing & Debugging**

#### Setup

1. **Import Collection**
   - Open Postman
   - Click "Import" → "Upload Files"
   - Select `QA_API_TESTS.postman_collection.json`

2. **Set Variables**
   - Go to collection variables
   - Set `base_url`: `http://localhost:3001/api`

3. **Run Tests**
   - Click "Run Collection"
   - Select all tests or specific folders
   - Click "Run"

#### Variable Setup

The collection uses these variables (auto-populated during test execution):
- `base_url` - API base URL (set manually)
- `auth_token` - JWT token (auto-set on login)
- `course_id` - Course ID for tests (set manually or from test data)
- `session_id` - Session ID (auto-set when creating session)
- `category_id` - Category ID (set manually)

**To set course_id and category_id:**
1. Run "Get API Info" to verify server is up
2. Login with "Login as Learner"
3. Manually set `course_id` and `category_id` from your database or use seed data IDs

---

### Method 3: Manual Testing with curl

**For Quick Individual Tests**

```bash
# 1. Login and get token
TOKEN=$(curl -s -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "learner@edu-platforma.hr",
    "password": "learner123"
  }' | jq -r '.data.token')

# 2. Test endpoints
# Study Planner - Create plan
curl -X POST http://localhost:3001/api/study-planner/plan \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "weeklyGoalHours": 10,
    "preferredStudyTimes": ["09:00", "14:00"],
    "focusAreas": ["Farmakologija"]
  }'

# Adaptive Learning - Get path
curl -X GET "http://localhost:3001/api/adaptive/path/YOUR_COURSE_ID" \
  -H "Authorization: Bearer $TOKEN"

# Content Summarization - Summarize text
curl -X POST http://localhost:3001/api/summarize/text \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "text": "Long text here...",
    "maxSentences": 3
  }'

# Translation - Get course (public, no auth)
curl -X GET "http://localhost:3001/api/translations/course/YOUR_COURSE_ID/HR"
```

---

## Test Coverage

### Feature #28: Study Planner (7 tests)
- ✅ Create/Get study plan
- ✅ CRUD study sessions
- ✅ Session lifecycle (start/complete/miss)
- ✅ Study goals with progress tracking
- ✅ Session templates
- ✅ Study statistics
- ✅ Authentication checks

### Feature #29: Adaptive Learning (7 tests)
- ✅ Adaptive learning path generation
- ✅ Skill gap identification
- ✅ Difficulty level suggestions
- ✅ Spaced repetition schedule
- ✅ Multi-course learning pathways
- ✅ Comprehensive learning insights
- ✅ Invalid input handling

### Feature #30: Content Summarization (7 tests)
- ✅ Text summarization with TF-IDF
- ✅ Keyword extraction
- ✅ Course overview generation
- ✅ Module summaries
- ✅ User learning summary
- ✅ Input validation (empty text, missing fields)
- ✅ Compression ratio calculation

### Feature #31: Multi-Language Translation (9 tests)
- ✅ Get translated course (HR/EN)
- ✅ Translation status & completion tracking
- ✅ Check translation existence
- ✅ Create/update translations (CRUD)
- ✅ Delete translations
- ✅ Locale validation
- ✅ Public vs Protected endpoints
- ✅ Fallback to original language
- ✅ Nested translations (course/module/lesson)

**Total**: 30+ automated tests

---

## Test Accounts

From seed data:

```
Admin:
  Email: admin@edu-platforma.hr
  Password: admin123

Instructor:
  Email: instructor@edu-platforma.hr
  Password: instructor123

Learner:
  Email: learner@edu-platforma.hr
  Password: learner123
```

---

## CI/CD Integration

### GitHub Actions Example

```yaml
name: QA Tests

on: [push, pull_request]

jobs:
  qa-tests:
    runs-on: ubuntu-latest

    steps:
      - uses: actions/checkout@v2

      - name: Setup Node.js
        uses: actions/setup-node@v2
        with:
          node-version: '20'

      - name: Install dependencies
        run: npm install

      - name: Start PostgreSQL
        run: |
          docker run -d \
            -e POSTGRES_PASSWORD=test \
            -e POSTGRES_DB=edu_platforma_test \
            -p 5432:5432 \
            postgres:16

      - name: Run migrations
        run: |
          cd packages/database
          npm run db:migrate
          npm run db:seed

      - name: Start API server
        run: |
          cd apps/api
          npm run dev &
          sleep 10

      - name: Run QA tests
        run: ./qa-tests.sh

      - name: Upload test results
        uses: actions/upload-artifact@v2
        with:
          name: qa-test-results
          path: qa-test-results.txt
```

---

## Troubleshooting

### API Server Not Running

**Error**: `curl: (7) Failed to connect to localhost port 3001`

**Solution**:
```bash
cd apps/api
npm run dev
```

Wait for: `Server is running on port 3001`

---

### Authentication Failed

**Error**: `401 Unauthorized`

**Solutions**:
1. Check credentials in test script
2. Verify user exists in database:
   ```bash
   cd packages/database
   npm run db:seed
   ```
3. Check if token is expired (JWT tokens have 7-day expiry)

---

### Database Connection Error

**Error**: `PrismaClientKnownRequestError`

**Solutions**:
1. Check PostgreSQL is running
2. Verify DATABASE_URL in `.env`
3. Run migrations:
   ```bash
   cd packages/database
   npm run db:migrate
   ```

---

### Test Failures

**Check**:
1. API server logs for errors
2. Database has seed data
3. All required fields in requests
4. Correct IDs (course_id, category_id)

**Debug individual test**:
```bash
# Add -v flag to curl for verbose output
curl -v -X POST http://localhost:3001/api/study-planner/plan \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"weeklyGoalHours": 10}'
```

---

## Advanced Testing

### Performance Testing

```bash
# Apache Bench - 100 requests, 10 concurrent
ab -n 100 -c 10 -H "Authorization: Bearer $TOKEN" \
  http://localhost:3001/api/adaptive/path/course-id

# Expected: < 500ms average response time
```

### Load Testing with Artillery

```yaml
# artillery-config.yml
config:
  target: 'http://localhost:3001'
  phases:
    - duration: 60
      arrivalRate: 10

scenarios:
  - name: 'Study Planner Flow'
    flow:
      - post:
          url: '/api/auth/login'
          json:
            email: 'learner@edu-platforma.hr'
            password: 'learner123'
      - get:
          url: '/api/study-planner/plan'
          headers:
            Authorization: 'Bearer {{token}}'
```

```bash
artillery run artillery-config.yml
```

---

### Security Testing

```bash
# Test SQL Injection
curl -X POST http://localhost:3001/api/summarize/text \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"text": "'; DROP TABLE users; --"}'

# Should return: Sanitized/escaped properly

# Test XSS
curl -X POST http://localhost:3001/api/translations/course \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "courseId": "test",
    "locale": "EN",
    "title": "<script>alert(\"XSS\")</script>"
  }'

# Should return: Sanitized output
```

---

## Test Results Interpretation

### Success Criteria

- ✅ **Pass Rate**: ≥ 95%
- ✅ **Response Time**: < 500ms (95th percentile)
- ✅ **Error Rate**: < 1%
- ✅ **Code Coverage**: ≥ 80% (critical paths)

### Sample Output Analysis

```
Total Tests:  45
Passed:       43
Failed:       2
Pass Rate:    95.56%
```

**Analysis**:
- 95.56% pass rate - **GOOD** (meets ≥ 95% criteria)
- 2 failures - Investigate in `qa-test-results.txt`
- Check failed tests: Look for "FAILED" in results file

---

## Reporting Bugs

When tests fail:

1. **Capture Error**
   ```bash
   grep "FAILED" qa-test-results.txt
   ```

2. **Create GitHub Issue**
   - Label: `qa-bug`
   - Include: Test name, expected vs actual, API response
   - Add: Steps to reproduce

3. **Template**:
   ```markdown
   **Test**: 28.3 - Create study session
   **Expected**: 201 Created
   **Actual**: 400 Bad Request
   **Response**: {"error": "Invalid startTime format"}

   **Steps to Reproduce**:
   1. Login as learner
   2. POST /api/study-planner/sessions
   3. Use ISO timestamp

   **Environment**: Development (localhost:3001)
   ```

---

## Next Steps

After QA testing:

1. ✅ Fix failing tests
2. ✅ Add unit tests for services
3. ✅ Integration tests for cross-feature workflows
4. ✅ E2E tests for complete user journeys
5. ✅ Performance benchmarks
6. ✅ Security audit

---

## Resources

- **Test Plan**: `QA_TEST_PLAN.md` - Comprehensive test scenarios
- **Test Script**: `qa-tests.sh` - Automated bash tests
- **Postman Collection**: `QA_API_TESTS.postman_collection.json`
- **Results**: `qa-test-results.txt` - Latest test run results

---

**Last Updated**: 2025-11-26
**Status**: Ready for execution ✅
