#!/bin/bash

API_URL="http://localhost:8000/api"
echo ""
echo "═══════════════════════════════════════════════════════════"
echo "  DRAVYA — Step 4 Test Suite"
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

# --- 2. Login Verification Authority ---
RES=$(curl -s -w "\n%{http_code}" -X POST $API_URL/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"verifier@dravya.in","password":"Verify@1234"}')
VA_TOKEN=$(echo "$RES" | head -n 1 | grep -o '"token":"[^"]*' | cut -d'"' -f4)
VA_ID=$(echo "$RES" | head -n 1 | grep -o '"id":"[^"]*' | head -n 1 | cut -d'"' -f4)
STATUS=$(echo "$RES" | tail -n 1)
run_test "Login VA" 200 $STATUS "$RES"

# --- 3. Register Producer ---
TIMESTAMP=$(date +%s)
PRODUCER_EMAIL="producer_step4_$TIMESTAMP@test.com"
RES=$(curl -s -w "\n%{http_code}" -X POST $API_URL/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"Step 4 Producer","email":"'"$PRODUCER_EMAIL"'","password":"Password@123","role":"PRODUCER"}')
PRODUCER_TOKEN=$(echo "$RES" | head -n 1 | grep -o '"token":"[^"]*' | cut -d'"' -f4)
STATUS=$(echo "$RES" | tail -n 1)
run_test "Register Producer" 201 $STATUS "$RES"

# --- 4. Create Producer Profile ---
RES=$(curl -s -w "\n%{http_code}" -X PATCH $API_URL/producers/me \
  -H "Authorization: Bearer $PRODUCER_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"farmName":"Step 4 Farm","address":"123 Road","village":"Vil","tehsil":"Teh","district":"Dist","state":"State","pincode":"123456","landSize":10}')
STATUS=$(echo "$RES" | tail -n 1)
run_test "Create Producer Profile" 200 $STATUS "$RES"

# --- 5. Producer Requests Verification ---
RES=$(curl -s -w "\n%{http_code}" -X POST $API_URL/producers/me/verification/request \
  -H "Authorization: Bearer $PRODUCER_TOKEN")
STATUS=$(echo "$RES" | tail -n 1)
VER_ID=$(echo "$RES" | head -n 1 | grep -o '"id":"[^"]*' | head -n 1 | cut -d'"' -f4)
run_test "Producer requests verification" 201 $STATUS "$RES"

# --- 6. Producer Requests Verification Again (should fail) ---
RES=$(curl -s -w "\n%{http_code}" -X POST $API_URL/producers/me/verification/request \
  -H "Authorization: Bearer $PRODUCER_TOKEN")
STATUS=$(echo "$RES" | tail -n 1)
run_test "Producer requests verification again (duplicate)" 400 $STATUS "$RES"

# --- 7. VA Tries to Approve Unassigned Verification (should fail) ---
RES=$(curl -s -w "\n%{http_code}" -X POST $API_URL/authority/producer-verifications/$VER_ID/approve \
  -H "Authorization: Bearer $VA_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"identityVerified":true,"documentsVerified":true,"landVerified":true,"locationVerified":true,"cultivationVerified":true,"inspectionDate":"2026-08-10","latitude":28.0,"longitude":77.0}')
STATUS=$(echo "$RES" | tail -n 1)
run_test "VA approves unassigned verification (403)" 403 $STATUS "$RES"

# --- 8. Admin Assigns VA ---
RES=$(curl -s -w "\n%{http_code}" -X POST $API_URL/admin/verifications/$VER_ID/assign \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"authorityId":"'"$VA_ID"'"}')
STATUS=$(echo "$RES" | tail -n 1)
run_test "Admin assigns VA to Producer Verification" 200 $STATUS "$RES"

# --- 9. VA Approves Verification ---
RES=$(curl -s -w "\n%{http_code}" -X POST $API_URL/authority/producer-verifications/$VER_ID/approve \
  -H "Authorization: Bearer $VA_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"identityVerified":true,"documentsVerified":true,"landVerified":true,"locationVerified":true,"cultivationVerified":true,"inspectionDate":"2026-08-10","latitude":28.0,"longitude":77.0}')
STATUS=$(echo "$RES" | tail -n 1)
run_test "VA approves Producer Verification" 200 $STATUS "$RES"

# --- 10. Producer Creates Batch ---
# First get an herb
HERB_RES=$(curl -s -X GET $API_URL/herbs -H "Authorization: Bearer $PRODUCER_TOKEN")
HERB_ID=$(echo "$HERB_RES" | grep -o '"id":"[^"]*' | head -n 1 | cut -d'"' -f4)

RES=$(curl -s -w "\n%{http_code}" -X POST $API_URL/batches \
  -H "Authorization: Bearer $PRODUCER_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"herbId":"'"$HERB_ID"'","quantity":250,"harvestDate":"2026-08-01","cultivationMethod":"Organic","farmLocation":"Farm A"}')
STATUS=$(echo "$RES" | tail -n 1)
BATCH_ID=$(echo "$RES" | head -n 1 | grep -o '"id":"[^"]*' | head -n 1 | cut -d'"' -f4)
run_test "Create Batch" 201 $STATUS "$RES"

# --- 11. Producer Submits Batch (DRAFT -> PENDING_VERIFICATION) ---
RES=$(curl -s -w "\n%{http_code}" -X POST $API_URL/batches/$BATCH_ID/submit \
  -H "Authorization: Bearer $PRODUCER_TOKEN")
STATUS=$(echo "$RES" | tail -n 1)
run_test "Submit Batch" 200 $STATUS "$RES"

# --- 12. Producer Requests Lot Inspection ---
RES=$(curl -s -w "\n%{http_code}" -X POST $API_URL/batches/$BATCH_ID/inspection/request \
  -H "Authorization: Bearer $PRODUCER_TOKEN")
STATUS=$(echo "$RES" | tail -n 1)
INSP_ID=$(echo "$RES" | head -n 1 | grep -o '"id":"[^"]*' | head -n 1 | cut -d'"' -f4)
run_test "Producer requests lot inspection" 201 $STATUS "$RES"

# --- 13. Admin Assigns VA to Inspection ---
RES=$(curl -s -w "\n%{http_code}" -X POST $API_URL/admin/inspections/$INSP_ID/assign \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"authorityId":"'"$VA_ID"'"}')
STATUS=$(echo "$RES" | tail -n 1)
run_test "Admin assigns VA to Lot Inspection" 200 $STATUS "$RES"

# --- 14. VA Starts Inspection ---
RES=$(curl -s -w "\n%{http_code}" -X POST $API_URL/authority/lot-inspections/$INSP_ID/start \
  -H "Authorization: Bearer $VA_TOKEN")
STATUS=$(echo "$RES" | tail -n 1)
run_test "VA starts Lot Inspection" 200 $STATUS "$RES"

# --- 15. VA Approves Lot Inspection ---
RES=$(curl -s -w "\n%{http_code}" -X POST $API_URL/authority/lot-inspections/$INSP_ID/approve \
  -H "Authorization: Bearer $VA_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"inspectedQuantity":243,"herbIdentityVerified":true,"physicalQualityStatus":"ACCEPTABLE","packagingStatus":"ACCEPTABLE","documentsVerified":true,"inspectionDate":"2026-08-11","latitude":28.0,"longitude":77.0,"observations":"All good."}')
STATUS=$(echo "$RES" | tail -n 1)
run_test "VA approves Lot Inspection" 200 $STATUS "$RES"

# --- 16. Verify Batch Status is READY_FOR_LAB ---
RES=$(curl -s -w "\n%{http_code}" -X GET $API_URL/batches/$BATCH_ID \
  -H "Authorization: Bearer $PRODUCER_TOKEN")
STATUS=$(echo "$RES" | tail -n 1)
BATCH_STATUS=$(echo "$RES" | head -n 1 | grep -o '"status":"[^"]*' | cut -d'"' -f4)
if [ "$BATCH_STATUS" = "READY_FOR_LAB" ]; then
  echo "✅ PASS [$TEST_COUNT] Batch status is READY_FOR_LAB"
else
  echo "❌ FAIL [$TEST_COUNT] Batch status is not READY_FOR_LAB (Got: $BATCH_STATUS)"
  FAILED=$((FAILED + 1))
fi
PASSED=$((PASSED + 1))
TEST_COUNT=$((TEST_COUNT + 1))

# --- 17. Verify VA Dashboard ---
RES=$(curl -s -w "\n%{http_code}" -X GET $API_URL/authority/dashboard \
  -H "Authorization: Bearer $VA_TOKEN")
STATUS=$(echo "$RES" | tail -n 1)
run_test "VA Dashboard retrieval" 200 $STATUS "$RES"

echo ""
echo "═══════════════════════════════════════════════════════════"
echo "  Results: $PASSED passed, $FAILED failed, $TEST_COUNT total"
echo "═══════════════════════════════════════════════════════════"

exit $FAILED
