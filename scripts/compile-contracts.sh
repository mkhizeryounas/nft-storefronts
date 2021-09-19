#!/bin/bash

truffle compile
mkdir -p app/client/src/contracts
mkdir -p app/server/contracts
cp abis/Color.json app/server/contracts/Color.json
cp abis/Color.json app/client/src/contracts/Color.json