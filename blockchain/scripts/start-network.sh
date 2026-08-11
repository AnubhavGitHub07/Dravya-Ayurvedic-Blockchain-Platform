#!/bin/bash
set -e

# Constants
FABRIC_VERSION="2.5.9"
CA_VERSION="1.5.12"
CHANNEL_NAME="dravya-channel"
CHAINCODE_NAME="traceability"
CHAINCODE_LANG="typescript"
CHAINCODE_PATH="../../chaincode"

cd "$(dirname "$0")/.."

echo "=========================================================="
echo "Starting Dravya Hyperledger Fabric Development Network"
echo "=========================================================="

if [ ! -d "fabric-samples" ]; then
    echo "Downloading fabric-samples and binaries (Fabric v$FABRIC_VERSION, CA v$CA_VERSION)..."
    curl -vsS https://raw.githubusercontent.com/hyperledger/fabric/master/scripts/bootstrap.sh | bash -s -- $FABRIC_VERSION $CA_VERSION
fi

cd fabric-samples/test-network

echo "Bringing down any existing network..."
./network.sh down

echo "Starting network with CAs (Org1, Org2)..."
./network.sh up createChannel -c $CHANNEL_NAME -ca

echo "Deploying chaincode..."
# We must install dependencies in chaincode before deployment
echo "Installing chaincode dependencies..."
pushd $CHAINCODE_PATH
npm install
npm run build
popd

./network.sh deployCC -ccn $CHAINCODE_NAME -ccp $CHAINCODE_PATH -ccl $CHAINCODE_LANG -c $CHANNEL_NAME

echo "=========================================================="
echo "Network started and chaincode deployed!"
echo "Org1 (Dravya Admin / Govt Authority) and Org2 (Laboratory) are ready."
echo "=========================================================="
