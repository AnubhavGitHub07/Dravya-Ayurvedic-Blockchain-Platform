#!/bin/bash
set -e

cd "$(dirname "$0")/../fabric-samples/test-network"

echo "Bringing down the network and cleaning up..."
./network.sh down

echo "Network torn down."
