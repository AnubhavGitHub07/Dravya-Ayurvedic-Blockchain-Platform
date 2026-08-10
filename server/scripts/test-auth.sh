#!/bin/bash
# ─── Dravya Step 2: Auth + RBAC Test Suite ────────────────
# Tests all 19 scenarios from the specification.

BASE_URL="http://localhost:8000/api"
PASSED=0
FAILED=0
TOTAL=0

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

function test_case() {
  TOTAL=$((TOTAL + 1))
  local test_name="$1"
  local expected_status="$2"
  local method="$3"
  local url="$4"
  local data="$5"
  local token="$6"

  local args=("-s" "-w" "\n%{http_code}" "-X" "$method" "$url" "-H" "Content-Type: application/json")

  if [ -n "$token" ]; then
    args+=("-H" "Authorization: Bearer $token")
  fi

  if [ -n "$data" ]; then
    args+=("-d" "$data")
  fi

  local response
  response=$(curl "${args[@]}")

  local status_code
  status_code=$(echo "$response" | tail -1)
  local body
  body=$(echo "$response" | sed '$d')

  if [ "$status_code" = "$expected_status" ]; then
    PASSED=$((PASSED + 1))
    echo -e "${GREEN}✅ PASS${NC} [${TOTAL}] $test_name (HTTP $status_code)"
  else
    FAILED=$((FAILED + 1))
    echo -e "${RED}❌ FAIL${NC} [${TOTAL}] $test_name (Expected: $expected_status, Got: $status_code)"
    echo "   Response: $body"
  fi

  # Return body for token extraction
  echo "$body" > /tmp/dravya_test_response.json
}

echo ""
echo "═══════════════════════════════════════════════════════════"
echo "  DRAVYA — Step 2 Auth + RBAC Test Suite"
echo "═══════════════════════════════════════════════════════════"
echo ""

# ─── TEST 1: Register Producer ────────────────────────────
test_case "Register Producer" "201" "POST" "$BASE_URL/auth/register" \
  '{"name":"Test Producer","email":"producer@test.com","password":"Producer@123","role":"PRODUCER","organization":"Herb Farm Co","phone":"+919876543210"}'
PRODUCER_TOKEN=$(cat /tmp/dravya_test_response.json | python3 -c "import sys,json; print(json.load(sys.stdin)['data']['token'])" 2>/dev/null)

# ─── TEST 2: Login Producer ──────────────────────────────
test_case "Login Producer" "200" "POST" "$BASE_URL/auth/login" \
  '{"email":"producer@test.com","password":"Producer@123"}'
PRODUCER_TOKEN=$(cat /tmp/dravya_test_response.json | python3 -c "import sys,json; print(json.load(sys.stdin)['data']['token'])" 2>/dev/null)

# ─── TEST 3: Access /me (authenticated) ──────────────────
test_case "Access /me (authenticated Producer)" "200" "GET" "$BASE_URL/auth/me" "" "$PRODUCER_TOKEN"

# ─── TEST 4: Producer accesses Producer test route ────────
test_case "Producer accesses /test/producer" "200" "GET" "$BASE_URL/test/producer" "" "$PRODUCER_TOKEN"

# ─── TEST 5: Producer attempts LAB route → 403 ──────────
test_case "Producer blocked from /test/lab → 403" "403" "GET" "$BASE_URL/test/lab" "" "$PRODUCER_TOKEN"

# ─── TEST 6: Register LAB ────────────────────────────────
test_case "Register LAB" "201" "POST" "$BASE_URL/auth/register" \
  '{"name":"Test Lab","email":"lab@test.com","password":"LabPass@123","role":"LAB","organization":"Quality Lab Ltd"}'
LAB_TOKEN=$(cat /tmp/dravya_test_response.json | python3 -c "import sys,json; print(json.load(sys.stdin)['data']['token'])" 2>/dev/null)

# ─── TEST 7: LAB accesses LAB route ──────────────────────
test_case "LAB accesses /test/lab" "200" "GET" "$BASE_URL/test/lab" "" "$LAB_TOKEN"

# ─── TEST 8: LAB attempts Producer-only route → 403 ─────
test_case "LAB blocked from /test/producer → 403" "403" "GET" "$BASE_URL/test/producer" "" "$LAB_TOKEN"

# ─── TEST 9: Register Distributor ────────────────────────
test_case "Register Distributor" "201" "POST" "$BASE_URL/auth/register" \
  '{"name":"Test Distributor","email":"dist@test.com","password":"Dist@12345","role":"DISTRIBUTOR","organization":"DistCo"}'
DIST_TOKEN=$(cat /tmp/dravya_test_response.json | python3 -c "import sys,json; print(json.load(sys.stdin)['data']['token'])" 2>/dev/null)

# ─── TEST 10: Distributor accesses Distributor route ─────
test_case "Distributor accesses /test/distributor" "200" "GET" "$BASE_URL/test/distributor" "" "$DIST_TOKEN"

# ─── TEST 11: Login VERIFICATION_AUTHORITY (seeded) ──────
test_case "Login Verification Authority (seeded)" "200" "POST" "$BASE_URL/auth/login" \
  '{"email":"verifier@dravya.in","password":"Verify@1234"}'
VA_TOKEN=$(cat /tmp/dravya_test_response.json | python3 -c "import sys,json; print(json.load(sys.stdin)['data']['token'])" 2>/dev/null)

# ─── TEST 12: VA accesses verification route ─────────────
test_case "VA accesses /test/verification" "200" "GET" "$BASE_URL/test/verification" "" "$VA_TOKEN"

# ─── TEST 13: Login ADMIN (seeded) ───────────────────────
test_case "Login Admin (seeded)" "200" "POST" "$BASE_URL/auth/login" \
  '{"email":"admin@dravya.in","password":"Admin@1234"}'
ADMIN_TOKEN=$(cat /tmp/dravya_test_response.json | python3 -c "import sys,json; print(json.load(sys.stdin)['data']['token'])" 2>/dev/null)

# ─── TEST 14: Admin accesses admin route ─────────────────
test_case "Admin accesses /test/admin" "200" "GET" "$BASE_URL/test/admin" "" "$ADMIN_TOKEN"

# ─── TEST 15: Admin accesses all role routes ─────────────
test_case "Admin accesses /test/producer" "200" "GET" "$BASE_URL/test/producer" "" "$ADMIN_TOKEN"
test_case "Admin accesses /test/lab" "200" "GET" "$BASE_URL/test/lab" "" "$ADMIN_TOKEN"
test_case "Admin accesses /test/distributor" "200" "GET" "$BASE_URL/test/distributor" "" "$ADMIN_TOKEN"
test_case "Admin accesses /test/verification" "200" "GET" "$BASE_URL/test/verification" "" "$ADMIN_TOKEN"

# ─── TEST 16: Missing JWT → 401 ─────────────────────────
test_case "Missing JWT → 401" "401" "GET" "$BASE_URL/auth/me"

# ─── TEST 17: Invalid JWT → 401 ─────────────────────────
test_case "Invalid JWT → 401" "401" "GET" "$BASE_URL/auth/me" "" "invalid.jwt.token"

# ─── TEST 18: Expired JWT → 401 ─────────────────────────
# Create a JWT that expired 1 hour ago
EXPIRED_TOKEN=$(python3 -c "
import json, base64, hmac, hashlib, time
header = base64.urlsafe_b64encode(json.dumps({'alg':'HS256','typ':'JWT'}).encode()).rstrip(b'=').decode()
payload = base64.urlsafe_b64encode(json.dumps({'userId':'fake','role':'PRODUCER','exp':int(time.time())-3600}).encode()).rstrip(b'=').decode()
msg = f'{header}.{payload}'
sig = base64.urlsafe_b64encode(hmac.new(b'dravya-dev-jwt-secret-change-in-production-2024',msg.encode(),hashlib.sha256).digest()).rstrip(b'=').decode()
print(f'{msg}.{sig}')
" 2>/dev/null)
test_case "Expired JWT → 401" "401" "GET" "$BASE_URL/auth/me" "" "$EXPIRED_TOKEN"

# ─── TEST 19: Duplicate email → rejected ─────────────────
test_case "Duplicate email → 409" "409" "POST" "$BASE_URL/auth/register" \
  '{"name":"Duplicate","email":"producer@test.com","password":"AnotherPass@1","role":"PRODUCER"}'

# ─── TEST 20: Invalid registration data → 400 ────────────
test_case "Invalid registration (weak password) → 400" "400" "POST" "$BASE_URL/auth/register" \
  '{"name":"Bad","email":"bad@test.com","password":"123","role":"PRODUCER"}'

# ─── TEST 21: Attempt public ADMIN registration → 403 ────
test_case "Public ADMIN registration → 403" "403" "POST" "$BASE_URL/auth/register" \
  '{"name":"Rogue Admin","email":"rogue@test.com","password":"RogueAdmin@1","role":"ADMIN"}'

# ─── TEST 22: Attempt public VERIFICATION_AUTHORITY → 403 ─
test_case "Public VERIFICATION_AUTHORITY registration → 403" "403" "POST" "$BASE_URL/auth/register" \
  '{"name":"Rogue VA","email":"rogue.va@test.com","password":"RogueVA@123","role":"VERIFICATION_AUTHORITY"}'

# ─── TEST 23: Inactive user → rejected ───────────────────
# First deactivate a user via admin
# Create a user to deactivate
test_case "Register user to deactivate" "201" "POST" "$BASE_URL/auth/register" \
  '{"name":"Inactive User","email":"inactive@test.com","password":"Inactive@123","role":"PRODUCER"}'
INACTIVE_USER_ID=$(cat /tmp/dravya_test_response.json | python3 -c "import sys,json; print(json.load(sys.stdin)['data']['user']['id'])" 2>/dev/null)

# Deactivate via admin
test_case "Admin deactivates user" "200" "PATCH" "$BASE_URL/users/$INACTIVE_USER_ID/toggle-status" "" "$ADMIN_TOKEN"

# Try to login as deactivated user
test_case "Inactive user login → 403" "403" "POST" "$BASE_URL/auth/login" \
  '{"email":"inactive@test.com","password":"Inactive@123"}'

# ─── Summary ─────────────────────────────────────────────
echo ""
echo "═══════════════════════════════════════════════════════════"
echo -e "  Results: ${GREEN}${PASSED} passed${NC}, ${RED}${FAILED} failed${NC}, ${TOTAL} total"
echo "═══════════════════════════════════════════════════════════"
echo ""

# Cleanup temp file
rm -f /tmp/dravya_test_response.json

exit $FAILED
