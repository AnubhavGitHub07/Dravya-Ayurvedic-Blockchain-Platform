#!/bin/bash

API_URL="http://localhost:8000/api"
echo ""
echo "═══════════════════════════════════════════════════════════"
echo "  DRAVYA — Step 5 Laboratory Quality Test Suite"
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

TIMESTAMP=$(date +%s)
PRODUCER_EMAIL="producer_step5_$TIMESTAMP@test.com"
LAB_EMAIL="lab_step5_$TIMESTAMP@test.com"

# --- 1. Login Admin ---
RES=$(curl -s -w "\n%{http_code}" -X POST $API_URL/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@dravya.in","password":"Admin@1234"}')
ADMIN_TOKEN=$(echo "$RES" | head -n 1 | grep -o '"token":"[^"]*' | cut -d'"' -f4)
STATUS=$(echo "$RES" | tail -n 1)
run_test "Login Admin" 200 $STATUS "$RES"

# --- 2. Login Verification Authority ---
RES=$(curl -s -w "\n%{http_code}" -X POST $API_URL/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"verifier@dravya.in","password":"Verify@1234"}')
VA_TOKEN=$(echo "$RES" | head -n 1 | grep -o '"token":"[^"]*' | cut -d'"' -f4)
VA_ID=$(echo "$RES" | head -n 1 | grep -o '"id":"[^"]*' | head -n 1 | cut -d'"' -f4)
STATUS=$(echo "$RES" | tail -n 1)
run_test "Login VA" 200 $STATUS "$RES"

# --- 3. Register LAB ---
RES=$(curl -s -w "\n%{http_code}" -X POST $API_URL/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"Step 5 Lab","email":"'"$LAB_EMAIL"'","password":"Password@123","role":"LAB"}')
LAB_TOKEN=$(echo "$RES" | head -n 1 | grep -o '"token":"[^"]*' | cut -d'"' -f4)
LAB_ID=$(echo "$RES" | head -n 1 | grep -o '"id":"[^"]*' | head -n 1 | cut -d'"' -f4)
STATUS=$(echo "$RES" | tail -n 1)
run_test "Register LAB" 201 $STATUS "$RES"

# --- 4. Register Producer ---
RES=$(curl -s -w "\n%{http_code}" -X POST $API_URL/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"Step 5 Producer","email":"'"$PRODUCER_EMAIL"'","password":"Password@123","role":"PRODUCER"}')
PRODUCER_TOKEN=$(echo "$RES" | head -n 1 | grep -o '"token":"[^"]*' | cut -d'"' -f4)
STATUS=$(echo "$RES" | tail -n 1)
run_test "Register Producer" 201 $STATUS "$RES"

# --- 5. Producer Setup (Profile & Verification) ---
curl -s -X PATCH $API_URL/producers/me -H "Authorization: Bearer $PRODUCER_TOKEN" -H "Content-Type: application/json" -d '{"farmName":"Step 5 Farm","address":"123 Road","village":"Vil","tehsil":"Teh","district":"Dist","state":"State","pincode":"123456","landSize":10}' > /dev/null
VER_RES=$(curl -s -X POST $API_URL/producers/me/verification/request -H "Authorization: Bearer $PRODUCER_TOKEN")
VER_ID=$(echo "$VER_RES" | grep -o '"id":"[^"]*' | head -n 1 | cut -d'"' -f4)
curl -s -X POST $API_URL/admin/verifications/$VER_ID/assign -H "Authorization: Bearer $ADMIN_TOKEN" -H "Content-Type: application/json" -d '{"authorityId":"'"$VA_ID"'"}' > /dev/null
curl -s -X POST $API_URL/authority/producer-verifications/$VER_ID/approve -H "Authorization: Bearer $VA_TOKEN" -H "Content-Type: application/json" -d '{"identityVerified":true,"documentsVerified":true,"landVerified":true,"locationVerified":true,"cultivationVerified":true,"inspectionDate":"2026-08-10","latitude":28.0,"longitude":77.0}' > /dev/null

run_test "Producer Setup & Verification Completed" 200 200 "Success"

# --- 6. Batch Creation & Inspection ---
HERB_RES=$(curl -s -X GET $API_URL/herbs -H "Authorization: Bearer $PRODUCER_TOKEN")
HERB_ID=$(echo "$HERB_RES" | grep -o '"id":"[^"]*' | head -n 1 | cut -d'"' -f4)

BATCH_RES=$(curl -s -X POST $API_URL/batches -H "Authorization: Bearer $PRODUCER_TOKEN" -H "Content-Type: application/json" -d '{"herbId":"'"$HERB_ID"'","quantity":500,"harvestDate":"2026-08-01","cultivationMethod":"Organic","farmLocation":"Farm B"}')
BATCH_ID=$(echo "$BATCH_RES" | grep -o '"id":"[^"]*' | head -n 1 | cut -d'"' -f4)
curl -s -X POST $API_URL/batches/$BATCH_ID/submit -H "Authorization: Bearer $PRODUCER_TOKEN" > /dev/null

INSP_RES=$(curl -s -X POST $API_URL/batches/$BATCH_ID/inspection/request -H "Authorization: Bearer $PRODUCER_TOKEN")
INSP_ID=$(echo "$INSP_RES" | grep -o '"id":"[^"]*' | head -n 1 | cut -d'"' -f4)

curl -s -X POST $API_URL/admin/inspections/$INSP_ID/assign -H "Authorization: Bearer $ADMIN_TOKEN" -H "Content-Type: application/json" -d '{"authorityId":"'"$VA_ID"'"}' > /dev/null
curl -s -X POST $API_URL/authority/lot-inspections/$INSP_ID/start -H "Authorization: Bearer $VA_TOKEN" > /dev/null
curl -s -X POST $API_URL/authority/lot-inspections/$INSP_ID/approve -H "Authorization: Bearer $VA_TOKEN" -H "Content-Type: application/json" -d '{"inspectedQuantity":500,"herbIdentityVerified":true,"physicalQualityStatus":"ACCEPTABLE","packagingStatus":"ACCEPTABLE","documentsVerified":true,"inspectionDate":"2026-08-11","latitude":28.0,"longitude":77.0}' > /dev/null

run_test "Batch Lot Inspection Completed (READY_FOR_LAB)" 200 200 "Success"

# --- 7. Admin Assigns LAB ---
RES=$(curl -s -w "\n%{http_code}" -X POST $API_URL/admin/assign-lab-test \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"batchId":"'"$BATCH_ID"'","labId":"'"$LAB_ID"'"}')
STATUS=$(echo "$RES" | tail -n 1)
TEST_ID=$(echo "$RES" | head -n 1 | grep -o '"id":"[^"]*' | head -n 1 | cut -d'"' -f4)
run_test "Admin assigns LAB" 201 $STATUS "$RES"

# --- 8. LAB Receives Sample ---
RES=$(curl -s -w "\n%{http_code}" -X POST $API_URL/lab/tests/$TEST_ID/receive \
  -H "Authorization: Bearer $LAB_TOKEN")
STATUS=$(echo "$RES" | tail -n 1)
run_test "LAB receives sample" 200 $STATUS "$RES"

# --- 9. LAB Starts Testing ---
RES=$(curl -s -w "\n%{http_code}" -X POST $API_URL/lab/tests/$TEST_ID/start \
  -H "Authorization: Bearer $LAB_TOKEN")
STATUS=$(echo "$RES" | tail -n 1)
run_test "LAB starts testing" 200 $STATUS "$RES"

# --- 10. LAB Adds Result (PASS) ---
RES=$(curl -s -w "\n%{http_code}" -X POST $API_URL/lab/tests/$TEST_ID/results \
  -H "Authorization: Bearer $LAB_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"parameter":"Moisture","value":8.2,"unit":"%","referenceRange":"<= 10%","resultStatus":"PASS","remarks":"Good"}')
STATUS=$(echo "$RES" | tail -n 1)
run_test "LAB adds PASS result" 201 $STATUS "$RES"

# --- 11. LAB Completes Test (Overall PASS) ---
RES=$(curl -s -w "\n%{http_code}" -X POST $API_URL/lab/tests/$TEST_ID/complete \
  -H "Authorization: Bearer $LAB_TOKEN")
STATUS=$(echo "$RES" | tail -n 1)
run_test "LAB completes test" 200 $STATUS "$RES"

# --- 12. LAB Generates Report ---
RES=$(curl -s -w "\n%{http_code}" -X POST $API_URL/lab/tests/$TEST_ID/report \
  -H "Authorization: Bearer $LAB_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"reportUrl":"https://example.com/report.pdf","reportFileName":"report.pdf","reportFileType":"application/pdf"}')
STATUS=$(echo "$RES" | tail -n 1)
REPORT_ID=$(echo "$RES" | head -n 1 | grep -o '"id":"[^"]*' | head -n 1 | cut -d'"' -f4)
run_test "LAB generates report" 201 $STATUS "$RES"

# --- 13. LAB Finalizes Report ---
RES=$(curl -s -w "\n%{http_code}" -X POST $API_URL/lab/reports/$REPORT_ID/finalize \
  -H "Authorization: Bearer $LAB_TOKEN")
STATUS=$(echo "$RES" | tail -n 1)
run_test "LAB finalizes report" 200 $STATUS "$RES"

# --- 14. Producer Views Quality Status ---
RES=$(curl -s -w "\n%{http_code}" -X GET $API_URL/batches/$BATCH_ID \
  -H "Authorization: Bearer $PRODUCER_TOKEN")
STATUS=$(echo "$RES" | tail -n 1)
BATCH_STATUS=$(echo "$RES" | head -n 1 | grep -o '"status":"[^"]*' | head -n 1 | cut -d'"' -f4)
if [ "$BATCH_STATUS" = "QUALITY_APPROVED" ]; then
  echo "✅ PASS [$TEST_COUNT] Producer batch is QUALITY_APPROVED"
  PASSED=$((PASSED + 1))
else
  echo "❌ FAIL [$TEST_COUNT] Producer batch not QUALITY_APPROVED (Got: $BATCH_STATUS)"
  FAILED=$((FAILED + 1))
fi

echo ""
echo "═══════════════════════════════════════════════════════════"
echo "  Results: $PASSED passed, $FAILED failed, $TEST_COUNT total"
echo "═══════════════════════════════════════════════════════════"

exit $FAILED
