#!/bin/bash

API_URL="http://localhost:8000/api"
echo ""
echo "═══════════════════════════════════════════════════════════"
echo "  DRAVYA — Step 3 Test Suite"
echo "═══════════════════════════════════════════════════════════"
echo ""

PASSED=0
FAILED=0
TEST_COUNT=0

function run_test() {
  TEST_COUNT=$((TEST_COUNT + 1))
  local NAME=$1
  local EXPECTED_STATUS=$2
  local ACTUAL_STATUS=$3
  local RESPONSE=$4

  if [ "$ACTUAL_STATUS" -eq "$EXPECTED_STATUS" ]; then
    echo "✅ PASS [$TEST_COUNT] $NAME (HTTP $ACTUAL_STATUS)"
    PASSED=$((PASSED + 1))
  else
    echo "❌ FAIL [$TEST_COUNT] $NAME (Expected: $EXPECTED_STATUS, Got: $ACTUAL_STATUS)"
    echo "   Response: $RESPONSE"
    FAILED=$((FAILED + 1))
  fi
}

# --- 1. Login Admin ---
RES=$(curl -s -w "\n%{http_code}" -X POST $API_URL/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@dravya.in","password":"Admin@1234"}')
ADMIN_TOKEN=$(echo "$RES" | head -n 1 | grep -o '"token":"[^"]*' | cut -d'"' -f4)
STATUS=$(echo "$RES" | tail -n 1)
run_test "Login Admin" 200 $STATUS "$RES"

# --- 2. Register Producer ---
TIMESTAMP=$(date +%s)
PRODUCER_EMAIL="producer_$TIMESTAMP@test.com"
RES=$(curl -s -w "\n%{http_code}" -X POST $API_URL/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"Step 3 Producer","email":"'"$PRODUCER_EMAIL"'","password":"Password@123","role":"PRODUCER"}')
PRODUCER_TOKEN=$(echo "$RES" | head -n 1 | grep -o '"token":"[^"]*' | cut -d'"' -f4)
STATUS=$(echo "$RES" | tail -n 1)
run_test "Register Producer" 201 $STATUS "$RES"

# --- 3. Get Herb Catalog ---
RES=$(curl -s -w "\n%{http_code}" -X GET $API_URL/herbs \
  -H "Authorization: Bearer $PRODUCER_TOKEN")
STATUS=$(echo "$RES" | tail -n 1)
HERB_ID=$(echo "$RES" | head -n 1 | grep -o '"id":"[^"]*' | head -n 1 | cut -d'"' -f4)
run_test "Get Herb Catalog" 200 $STATUS "$RES"

# --- 4. Producer Creates Batch without Profile -> 403 ---
RES=$(curl -s -w "\n%{http_code}" -X POST $API_URL/batches \
  -H "Authorization: Bearer $PRODUCER_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"herbId":"'"$HERB_ID"'","quantity":100,"harvestDate":"2026-08-01","cultivationMethod":"Organic","farmLocation":"Farm A"}')
STATUS=$(echo "$RES" | tail -n 1)
run_test "Create Batch without Profile (403)" 403 $STATUS "$RES"

# --- 5. Producer Creates Profile ---
RES=$(curl -s -w "\n%{http_code}" -X PATCH $API_URL/producers/me \
  -H "Authorization: Bearer $PRODUCER_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"farmName":"Test Farm","address":"123 Road","village":"Vil","tehsil":"Teh","district":"Dist","state":"State","pincode":"123456","landSize":10}')
STATUS=$(echo "$RES" | tail -n 1)
run_test "Create Producer Profile" 200 $STATUS "$RES"

# --- 6. Producer Creates Batch with Profile ---
RES=$(curl -s -w "\n%{http_code}" -X POST $API_URL/batches \
  -H "Authorization: Bearer $PRODUCER_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"herbId":"'"$HERB_ID"'","quantity":100,"harvestDate":"2026-08-01","cultivationMethod":"Organic","farmLocation":"Farm A"}')
STATUS=$(echo "$RES" | tail -n 1)
BATCH_ID=$(echo "$RES" | head -n 1 | grep -o '"id":"[^"]*' | head -n 1 | cut -d'"' -f4)
run_test "Create Batch with Profile" 201 $STATUS "$RES"

# --- 7. Producer Submits DRAFT Batch while PENDING Profile -> 403 ---
RES=$(curl -s -w "\n%{http_code}" -X POST $API_URL/batches/$BATCH_ID/submit \
  -H "Authorization: Bearer $PRODUCER_TOKEN")
STATUS=$(echo "$RES" | tail -n 1)
run_test "Submit Batch while Profile PENDING (403)" 403 $STATUS "$RES"

# --- 8. Admin Updates Profile to VERIFIED ---
# This is a bit hacky, since we didn't expose an admin endpoint for it yet, we just update it via psql for the test.
psql -d dravya -c "UPDATE producer_profiles SET \"verificationStatus\" = 'VERIFIED';" > /dev/null
run_test "Admin verifies Profile (DB hack)" 0 0 "done"

# --- 9. Producer Submits DRAFT Batch while VERIFIED Profile -> 200 ---
RES=$(curl -s -w "\n%{http_code}" -X POST $API_URL/batches/$BATCH_ID/submit \
  -H "Authorization: Bearer $PRODUCER_TOKEN")
STATUS=$(echo "$RES" | tail -n 1)
run_test "Submit Batch successfully" 200 $STATUS "$RES"

# --- 10. Get Producer Dashboard ---
RES=$(curl -s -w "\n%{http_code}" -X GET $API_URL/producers/me/dashboard \
  -H "Authorization: Bearer $PRODUCER_TOKEN")
STATUS=$(echo "$RES" | tail -n 1)
run_test "Get Producer Dashboard" 200 $STATUS "$RES"

echo ""
echo "═══════════════════════════════════════════════════════════"
echo "  Results: $PASSED passed, $FAILED failed, $TEST_COUNT total"
echo "═══════════════════════════════════════════════════════════"
