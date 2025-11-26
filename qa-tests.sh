#!/bin/bash

# QA Test Script for Features #28-31
# Run this script after starting the API server: npm run dev
# Usage: ./qa-tests.sh

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
API_URL="http://localhost:3001/api"
RESULTS_FILE="qa-test-results.txt"

# Test counters
TOTAL_TESTS=0
PASSED_TESTS=0
FAILED_TESTS=0

# Clear previous results
> "$RESULTS_FILE"

echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}  QA API Tests - Features #28-31${NC}"
echo -e "${BLUE}========================================${NC}\n"

# Function to log results
log_result() {
    local test_name=$1
    local status=$2
    local response=$3

    echo "[$(date +'%Y-%m-%d %H:%M:%S')] $test_name: $status" >> "$RESULTS_FILE"
    echo "Response: $response" >> "$RESULTS_FILE"
    echo "---" >> "$RESULTS_FILE"
}

# Function to run test
run_test() {
    local test_name=$1
    local curl_cmd=$2
    local expected_status=$3

    TOTAL_TESTS=$((TOTAL_TESTS + 1))

    echo -e "${YELLOW}Testing:${NC} $test_name"

    # Execute curl and capture response
    response=$(eval "$curl_cmd" 2>&1)
    status_code=$(echo "$response" | grep -o "HTTP/[0-9.]* [0-9]*" | tail -1 | grep -o "[0-9]*$" || echo "000")

    if [[ "$status_code" == "$expected_status" ]]; then
        echo -e "${GREEN}✓ PASSED${NC} (Status: $status_code)\n"
        PASSED_TESTS=$((PASSED_TESTS + 1))
        log_result "$test_name" "PASSED" "$response"
    else
        echo -e "${RED}✗ FAILED${NC} (Expected: $expected_status, Got: $status_code)"
        echo -e "Response: $response\n"
        FAILED_TESTS=$((FAILED_TESTS + 1))
        log_result "$test_name" "FAILED (Expected: $expected_status, Got: $status_code)" "$response"
    fi
}

# Get authentication token
echo -e "${BLUE}Step 1: Authenticating...${NC}"
LOGIN_RESPONSE=$(curl -s -X POST "$API_URL/auth/login" \
    -H "Content-Type: application/json" \
    -d '{
        "email": "learner@edu-platforma.hr",
        "password": "learner123"
    }')

TOKEN=$(echo "$LOGIN_RESPONSE" | grep -o '"token":"[^"]*' | cut -d'"' -f4)

if [ -z "$TOKEN" ]; then
    echo -e "${RED}Failed to get authentication token!${NC}"
    echo "Response: $LOGIN_RESPONSE"
    exit 1
fi

echo -e "${GREEN}✓ Authenticated successfully${NC}"
echo -e "Token: ${TOKEN:0:20}...\n"

# ============================================================================
# FEATURE #28: STUDY PLANNER TESTS
# ============================================================================

echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}  Feature #28: Study Planner${NC}"
echo -e "${BLUE}========================================${NC}\n"

# Test 28.1: Get study plan (should be empty or existing)
run_test "28.1 - Get study plan" \
    "curl -s -w '\nHTTP/%{http_code}' -X GET '$API_URL/study-planner/plan' -H 'Authorization: Bearer $TOKEN'" \
    "200"

# Test 28.2: Create study plan
run_test "28.2 - Create study plan" \
    "curl -s -w '\nHTTP/%{http_code}' -X POST '$API_URL/study-planner/plan' \
    -H 'Authorization: Bearer $TOKEN' \
    -H 'Content-Type: application/json' \
    -d '{
        \"weeklyGoalHours\": 15,
        \"preferredStudyTimes\": [\"09:00\", \"14:00\", \"20:00\"],
        \"focusAreas\": [\"Farmakologija\", \"Biokemija\", \"Toksikologija\"]
    }'" \
    "200"

# Test 28.3: Create study session
run_test "28.3 - Create study session" \
    "curl -s -w '\nHTTP/%{http_code}' -X POST '$API_URL/study-planner/sessions' \
    -H 'Authorization: Bearer $TOKEN' \
    -H 'Content-Type: application/json' \
    -d '{
        \"title\": \"QA Test Session\",
        \"description\": \"Automated QA test session\",
        \"startTime\": \"$(date -u -d '+1 hour' '+%Y-%m-%dT%H:%M:%SZ')\",
        \"endTime\": \"$(date -u -d '+2 hours' '+%Y-%m-%dT%H:%M:%SZ')\",
        \"duration\": 60,
        \"topics\": [\"Testing\", \"QA\"]
    }'" \
    "201"

# Test 28.4: Get user sessions
run_test "28.4 - Get user sessions" \
    "curl -s -w '\nHTTP/%{http_code}' -X GET '$API_URL/study-planner/sessions' -H 'Authorization: Bearer $TOKEN'" \
    "200"

# Test 28.5: Create study goal
run_test "28.5 - Create study goal" \
    "curl -s -w '\nHTTP/%{http_code}' -X POST '$API_URL/study-planner/goals' \
    -H 'Authorization: Bearer $TOKEN' \
    -H 'Content-Type: application/json' \
    -d '{
        \"title\": \"Complete 5 lessons\",
        \"description\": \"QA test goal\",
        \"type\": \"LESSONS_COMPLETED\",
        \"targetValue\": 5,
        \"deadline\": \"$(date -u -d '+30 days' '+%Y-%m-%dT%H:%M:%SZ')\"
    }'" \
    "201"

# Test 28.6: Create session template
run_test "28.6 - Create session template" \
    "curl -s -w '\nHTTP/%{http_code}' -X POST '$API_URL/study-planner/templates' \
    -H 'Authorization: Bearer $TOKEN' \
    -H 'Content-Type: application/json' \
    -d '{
        \"name\": \"QA Quick Review\",
        \"description\": \"30-minute quick review session\",
        \"duration\": 30,
        \"topics\": [\"Review\", \"Quick\"]
    }'" \
    "201"

# Test 28.7: Get statistics
run_test "28.7 - Get study statistics" \
    "curl -s -w '\nHTTP/%{http_code}' -X GET '$API_URL/study-planner/statistics' -H 'Authorization: Bearer $TOKEN'" \
    "200"

# Test 28.8: Authentication test - No token
run_test "28.8 - No auth token (should fail)" \
    "curl -s -w '\nHTTP/%{http_code}' -X GET '$API_URL/study-planner/plan'" \
    "401"

# ============================================================================
# FEATURE #29: ADAPTIVE LEARNING TESTS
# ============================================================================

echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}  Feature #29: Adaptive Learning${NC}"
echo -e "${BLUE}========================================${NC}\n"

# Get a course ID from the system first
COURSES_RESPONSE=$(curl -s -X GET "$API_URL/courses?limit=1")
COURSE_ID=$(echo "$COURSES_RESPONSE" | grep -o '"id":"[^"]*' | head -1 | cut -d'"' -f4)

if [ -n "$COURSE_ID" ]; then
    echo -e "${GREEN}Using course ID: $COURSE_ID${NC}\n"

    # Test 29.1: Get adaptive learning path
    run_test "29.1 - Get adaptive path for course" \
        "curl -s -w '\nHTTP/%{http_code}' -X GET '$API_URL/adaptive/path/$COURSE_ID' -H 'Authorization: Bearer $TOKEN'" \
        "200"

    # Test 29.2: Get review schedule
    run_test "29.2 - Get review schedule" \
        "curl -s -w '\nHTTP/%{http_code}' -X GET '$API_URL/adaptive/review-schedule/$COURSE_ID' -H 'Authorization: Bearer $TOKEN'" \
        "200"

    # Test 29.3: Get learning insights
    run_test "29.3 - Get learning insights" \
        "curl -s -w '\nHTTP/%{http_code}' -X GET '$API_URL/adaptive/insights/$COURSE_ID' -H 'Authorization: Bearer $TOKEN'" \
        "200"
else
    echo -e "${YELLOW}Warning: No courses found in database, skipping course-specific tests${NC}\n"
fi

# Get a category ID
CATEGORIES_RESPONSE=$(curl -s -X GET "$API_URL/domains")
CATEGORY_ID=$(echo "$CATEGORIES_RESPONSE" | grep -o '"id":"[^"]*' | head -1 | cut -d'"' -f4)

if [ -n "$CATEGORY_ID" ]; then
    echo -e "${GREEN}Using category ID: $CATEGORY_ID${NC}\n"

    # Test 29.4: Get suggested difficulty
    run_test "29.4 - Get suggested difficulty level" \
        "curl -s -w '\nHTTP/%{http_code}' -X GET '$API_URL/adaptive/difficulty/$CATEGORY_ID' -H 'Authorization: Bearer $TOKEN'" \
        "200"

    # Test 29.5: Get learning pathway
    run_test "29.5 - Get learning pathway" \
        "curl -s -w '\nHTTP/%{http_code}' -X GET '$API_URL/adaptive/learning-pathway/$CATEGORY_ID' -H 'Authorization: Bearer $TOKEN'" \
        "200"
fi

# Test 29.6: Invalid course ID
run_test "29.6 - Invalid course ID" \
    "curl -s -w '\nHTTP/%{http_code}' -X GET '$API_URL/adaptive/path/invalid-id-12345' -H 'Authorization: Bearer $TOKEN'" \
    "200"

# Test 29.7: No authentication
run_test "29.7 - No auth token (should fail)" \
    "curl -s -w '\nHTTP/%{http_code}' -X GET '$API_URL/adaptive/path/test-id'" \
    "401"

# ============================================================================
# FEATURE #30: CONTENT SUMMARIZATION TESTS
# ============================================================================

echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}  Feature #30: Content Summarization${NC}"
echo -e "${BLUE}========================================${NC}\n"

# Test 30.1: Summarize text
run_test "30.1 - Summarize text" \
    "curl -s -w '\nHTTP/%{http_code}' -X POST '$API_URL/summarize/text' \
    -H 'Authorization: Bearer $TOKEN' \
    -H 'Content-Type: application/json' \
    -d '{
        \"text\": \"Farmakologija je znanstvena disciplina koja proučava međudjelovanje lijekova i živih organizama. Ova grana medicine bavi se istraživanjem kako lijekovi djeluju na tijelo, njihovim mehanizmima djelovanja, te nuspojavama. Farmakologija također proučava kako tijelo metabolizira i izlučuje lijekove. Znanje iz farmakologije ključno je za razvoj novih lijekova i terapijskih pristupa. Moderna farmakologija koristi napredne tehnologije i interdisciplinarni pristup. Studenti farmakologije uče o različitim klasama lijekova i njihovoj primjeni u kliničkoj praksi.\",
        \"maxSentences\": 3
    }'" \
    "200"

# Test 30.2: Extract keywords
run_test "30.2 - Extract keywords" \
    "curl -s -w '\nHTTP/%{http_code}' -X POST '$API_URL/summarize/keywords' \
    -H 'Authorization: Bearer $TOKEN' \
    -H 'Content-Type: application/json' \
    -d '{
        \"text\": \"Farmakologija lijekovi metabolizam nuspojave terapija klinička praksa medicinska znanost istraživanje\",
        \"maxKeywords\": 10
    }'" \
    "200"

# Test 30.3: Empty text (should fail)
run_test "30.3 - Empty text (should fail)" \
    "curl -s -w '\nHTTP/%{http_code}' -X POST '$API_URL/summarize/text' \
    -H 'Authorization: Bearer $TOKEN' \
    -H 'Content-Type: application/json' \
    -d '{\"text\": \"\"}'" \
    "400"

# Test 30.4: Missing text field (should fail)
run_test "30.4 - Missing text field (should fail)" \
    "curl -s -w '\nHTTP/%{http_code}' -X POST '$API_URL/summarize/text' \
    -H 'Authorization: Bearer $TOKEN' \
    -H 'Content-Type: application/json' \
    -d '{}'" \
    "400"

if [ -n "$COURSE_ID" ]; then
    # Test 30.5: Get course overview
    run_test "30.5 - Get course overview summary" \
        "curl -s -w '\nHTTP/%{http_code}' -X GET '$API_URL/summarize/course/$COURSE_ID' -H 'Authorization: Bearer $TOKEN'" \
        "200"
fi

# Test 30.6: Get user learning summary
run_test "30.6 - Get user learning summary" \
    "curl -s -w '\nHTTP/%{http_code}' -X GET '$API_URL/summarize/user-learning' -H 'Authorization: Bearer $TOKEN'" \
    "200"

# Test 30.7: No authentication
run_test "30.7 - No auth token (should fail)" \
    "curl -s -w '\nHTTP/%{http_code}' -X POST '$API_URL/summarize/text' \
    -H 'Content-Type: application/json' \
    -d '{\"text\": \"test\"}'" \
    "401"

# ============================================================================
# FEATURE #31: MULTI-LANGUAGE TRANSLATION TESTS
# ============================================================================

echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}  Feature #31: Multi-Language Translation${NC}"
echo -e "${BLUE}========================================${NC}\n"

if [ -n "$COURSE_ID" ]; then
    # Test 31.1: Get course with Croatian translation (public)
    run_test "31.1 - Get course with HR translation (public)" \
        "curl -s -w '\nHTTP/%{http_code}' -X GET '$API_URL/translations/course/$COURSE_ID/HR'" \
        "200"

    # Test 31.2: Get course with English translation (public)
    run_test "31.2 - Get course with EN translation (public)" \
        "curl -s -w '\nHTTP/%{http_code}' -X GET '$API_URL/translations/course/$COURSE_ID/EN'" \
        "200"

    # Test 31.3: Invalid locale
    run_test "31.3 - Invalid locale FR (should fail)" \
        "curl -s -w '\nHTTP/%{http_code}' -X GET '$API_URL/translations/course/$COURSE_ID/FR'" \
        "400"

    # Test 31.4: Get translation status (public)
    run_test "31.4 - Get translation status (public)" \
        "curl -s -w '\nHTTP/%{http_code}' -X GET '$API_URL/translations/status/$COURSE_ID'" \
        "200"

    # Test 31.5: Check if translation exists (public)
    run_test "31.5 - Check translation exists (public)" \
        "curl -s -w '\nHTTP/%{http_code}' -X GET '$API_URL/translations/check/course/$COURSE_ID/EN'" \
        "200"

    # Test 31.6: Create course translation (protected)
    run_test "31.6 - Create course translation (requires auth)" \
        "curl -s -w '\nHTTP/%{http_code}' -X POST '$API_URL/translations/course' \
        -H 'Authorization: Bearer $TOKEN' \
        -H 'Content-Type: application/json' \
        -d '{
            \"courseId\": \"$COURSE_ID\",
            \"locale\": \"EN\",
            \"title\": \"QA Test Course Translation\",
            \"description\": \"This is a QA test translation\"
        }'" \
        "200"
fi

# Test 31.7: Invalid type for check
run_test "31.7 - Invalid type for translation check (should fail)" \
    "curl -s -w '\nHTTP/%{http_code}' -X GET '$API_URL/translations/check/invalid/test-id/EN'" \
    "400"

# Test 31.8: Create translation without auth (should fail)
run_test "31.8 - Create translation without auth (should fail)" \
    "curl -s -w '\nHTTP/%{http_code}' -X POST '$API_URL/translations/course' \
    -H 'Content-Type: application/json' \
    -d '{
        \"courseId\": \"test\",
        \"locale\": \"EN\",
        \"title\": \"Test\"
    }'" \
    "401"

# Test 31.9: Missing required field (should fail)
run_test "31.9 - Missing title field (should fail)" \
    "curl -s -w '\nHTTP/%{http_code}' -X POST '$API_URL/translations/course' \
    -H 'Authorization: Bearer $TOKEN' \
    -H 'Content-Type: application/json' \
    -d '{
        \"courseId\": \"test\",
        \"locale\": \"EN\"
    }'" \
    "400"

# ============================================================================
# API INFO TEST
# ============================================================================

echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}  API Info & Health Check${NC}"
echo -e "${BLUE}========================================${NC}\n"

# Test: API Info endpoint
run_test "API Info - Get API information" \
    "curl -s -w '\nHTTP/%{http_code}' -X GET '$API_URL/'" \
    "200"

# ============================================================================
# TEST SUMMARY
# ============================================================================

echo -e "\n${BLUE}========================================${NC}"
echo -e "${BLUE}  TEST SUMMARY${NC}"
echo -e "${BLUE}========================================${NC}\n"

echo -e "Total Tests:  ${BLUE}$TOTAL_TESTS${NC}"
echo -e "Passed:       ${GREEN}$PASSED_TESTS${NC}"
echo -e "Failed:       ${RED}$FAILED_TESTS${NC}"

PASS_RATE=$(awk "BEGIN {printf \"%.2f\", ($PASSED_TESTS/$TOTAL_TESTS)*100}")
echo -e "Pass Rate:    ${YELLOW}$PASS_RATE%${NC}\n"

if [ $FAILED_TESTS -eq 0 ]; then
    echo -e "${GREEN}✓ ALL TESTS PASSED!${NC}"
    echo -e "Results saved to: $RESULTS_FILE\n"
    exit 0
else
    echo -e "${RED}✗ SOME TESTS FAILED${NC}"
    echo -e "Results saved to: $RESULTS_FILE"
    echo -e "Check the results file for details.\n"
    exit 1
fi
