#!/usr/bin/env bash

SHELL=/bin/bash
NODE6='./nave.sh use 6.5'

# Stop on errors
set -e
# piped commands return the exit status of the last command in the pipe that returned non-zero
set -o pipefail

# Get dependencies from NPM
$NODE6 npm install

# Install other dependencies
$NODE6 npm run bowerInstall &
BOWER_PID=$!
$NODE6 npm run jspmConfig
$NODE6 npm run jspmInstall &
JSPM_PID=$!

# Wait for the parrallel bowerInstall and jspmInstall to complete
# Wait on the PIDs specifically so we get the return code and fail
# the build if the process fails
wait $BOWER_PID
wait $JSPM_PID

# Run tests
# THIS MUST BE RUN OR THERE WILL BE NO COVERAGE REPORTS GENERATED
$NODE6 npm test &
TEST_PID=$!

# Lint code
$NODE6 npm run lint &
LINT_PID=$!

# Wait for npm test and npm lint to complete
# Wait on the PIDs specifically so we get the return code and fail
# the build if the process fails
wait $TEST_PID
wait $LINT_PID

# Don't do dist if this is a PR build
if [[ -z $PR_BUILD ]]; then
	# Dist
	# Cleanup first
	rm -rf dist
	mkdir dist

	# Ship application
	$NODE6 npm run dist

	# Create artifact
	ARTIFACT_VERSION=$($NODE6 node -p "require('./package.json').version")
	ARTIFACT_NAME=$($NODE6 node -p "require('./package.json').name")
	rm -f *.tar.gz
	tar -zcf $ARTIFACT_NAME-$ARTIFACT_VERSION-$BUILD_NUMBER.tar.gz dist *.sh manifest.yml
fi
