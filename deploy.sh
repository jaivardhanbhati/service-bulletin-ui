#!/usr/bin/env bash
# Custom Blue/Green deployment
# Inspiration from https://github.com/18F/cf-blue-green/blob/master/bin/cf-blue-green

# Deploy an app to cloud foundry in a few steps
# 1. Push the app under a temporary name (don't start)
# 2. Set any environment variables
# 3. Start the app
# 4. Test
# 5. Add URLs to temporarily-named app
# 6. Stop old app (if exists)
# 7. Rename old app to -prev (if exists)
# 8. Rename temp app to main app
# 9. Delete temp route

# Stop on errors
set -e
# piped commands return the exit status of the last command in the pipe that returned non-zero
set -o pipefail

# Print all commands before running, verbose but good for debugging
#set -x

# Login to CF
# Check environment variables being set
if [[ -z $CF_HOST ]]; then
	echo "CF_HOST is not set."
	exit 1
fi

if [[ -z $CF_SPACE ]]; then
	echo "CF_SPACE is not set."
	exit 1
fi

if [[ -z $CF_ORG ]]; then
	echo "CF_ORG is not set."
	exit 1
fi

if [[ -z $CF_USERNAME ]]; then
	echo "CF_USERNAME is not set."
	exit 1
fi

if [[ -z $CF_PASSWORD ]]; then
	echo "CF_PASSWORD is not set."
	exit 1
fi

# Process any commandline args
while [[ $# -gt 0 ]]
	do
	key="$1"

	case $key in
	    -n|--no-prev)
		    NO_PREV="TRUE"
		    ;;
	    -p|--pause)
		    PAUSE="TRUE"
		    ;;
	    -r|--resume)
		    RESUME="TRUE"
		    ;;
	    *)
		    # unknown option
		    ;;
	esac
	shift # past argument or value
done

# Log into cloud foundry
if ! cf login -a https://$CF_HOST -u $CF_USERNAME -p $CF_PASSWORD -o $CF_ORG -s $CF_SPACE; then
	echo "Unable to log into CF"
	exit 1
fi

# ------ HELPERS ------
# Our simple error handler
on_fail () {
    echo "DEPLOY FAILED - you may need to check 'cf apps' and 'cf routes' and do manual cleanup"
}

# Simple reading of yaml files into bash variables
# Based on source from https://gist.github.com/pkuczynski/8665367
# NOTE: THIS ONLY WORKS FOR SINGLE APP MANIFESTS
parse_yaml() {
	local prefix=$2
	local s='[[:space:]-]*' w='[a-zA-Z0-9_]*' fs=$(echo @|tr @ '\034')
	sed -ne "s|^\($s\)\($w\)$s:$s\"\(.*\)\"$s\$|\1$fs\2$fs\3|p" \
		  -e "s|^\($s\)\($w\)$s:$s\(.*\)$s\$|\1$fs\2$fs\3|p" "$1" |
	awk -F$fs '{
		indent = length($1)/2;
		vname[indent] = $2;
		for (i in vname) {if (i > indent) {delete vname[i]}}
		if (length($3) > 0) {
			vn=""; for (i=0; i<indent; i++) {vn=(vn)(vname[i])("_")}
			printf("%s%s%s=\"%s\"\n", "'$prefix'",vn, $2, $3);
		}
	}' | sed 's/_=/+=/g'
}

# Trim whitespace from args
trim() {
    local var="$*"
    var="${var#"${var%%[![:space:]]*}"}"   # remove leading whitespace characters
    var="${var%"${var##*[![:space:]]}"}"   # remove trailing whitespace characters
    echo "$var"
}

# Take a URL and split it out to a hostname and domain.
# "returns" the value as $HOSTNAME and $DOMAIN env vars
split_url() {
    # Assume that hostnames are simple, i.e. they don't have subdomains
    local route=$(trim $1)
    local parts=(${route/./ })
    HOSTNAME=${parts[0]}
    DOMAIN=${parts[1]}
}

# set up try/catch
# http://stackoverflow.com/a/185900/358804
trap on_fail ERR

# ------ 0. Prepare ------
# Read the manifest.yml file as env vars
# Use eval so that the printf's become set statements for this console
eval $(parse_yaml manifest.yml "MANIFEST_")
# Determine the temporary app name
ORIG_APP_NAME=$MANIFEST_applications__name
TEMP_SUFFIX="-next"
PREV_SUFFIX="-prev"
APP_NAME=$ORIG_APP_NAME$TEMP_SUFFIX

if [ -z "$ORIG_APP_NAME" ]
then
    echo "Can not determine app name from manifest.yml, check spacing and indentation."
    exit 1
fi

# Determine which settings from the manifest that we need to override
# Set a temp hostname to avoid URL collisions with other apps or spaces
CF_ARGS="-n $CF_SPACE-$APP_NAME"
if [ $CF_INSTANCES ]; then CF_ARGS="$CF_ARGS -i $CF_INSTANCES"; fi
if [ $CF_DISK ]; then CF_ARGS="$CF_ARGS -k $CF_DISK"; fi
if [ $CF_RAM ]; then CF_ARGS="$CF_ARGS -m $CF_RAM"; fi
# TODO: Any other cf args we want to override from the build script?

# If we're resuming a deploy, i.e. we deployed then stopped to test,
# don't re-deploy it again.  This checks that we're NOT resuming.
if [[ -z $RESUME ]]; then
	# ------ 1. Push the app under a temporary name (don't start) ------

	# Delete before push in case a previous deploy failed
	# and left the -next app hanging around, the cf command
	# exits cleanly even if the app doesn't exist
	echo cf delete $APP_NAME -f
	cf delete $APP_NAME -f

	echo cf push $APP_NAME $CF_ARGS --no-start
	cf push $APP_NAME $CF_ARGS --no-start

	# ------ 2. Set any environment variables ------
	# Read env vars from CF_ENV_xxx
	set | grep '^CF_ENV_' | sed s/\'//g | while read -r envvar ; do
	    # Strip off the CF_ENV_ prefix
	    APP_ENV=${envvar//CF_ENV_/}
	    # Split into key/value on the equals
	    KV=(${APP_ENV//=/ })
	    ENV_VAR_NAME=${KV[0]}
	    # Assume key will never have spaces, but value might
	    # so here we take the remaining array entries from the split
	    ENV_VAR_VALUE=${KV[@]:1}

	    echo cf set-env $APP_NAME "$ENV_VAR_NAME" "$ENV_VAR_VALUE"
	    cf set-env $APP_NAME "$ENV_VAR_NAME" "$ENV_VAR_VALUE"
	done

	# ------ 3. Start the app ------

	echo cf start $APP_NAME
	cf start $APP_NAME

# Endif not resuming
fi

# Find the route of the temp app, it should be our temp host on the default domain
# Assume a single route here, does NOT expect comma-separated routes.
TEST_URL=`cf app $APP_NAME | grep "urls:"`
echo "Test Urls: [$TEST_URL]"
TEST_URL=${TEST_URL/urls: /}
split_url $TEST_URL
TEST_HOSTNAME=$HOSTNAME
TEST_DOMAIN=$DOMAIN

# ------ 4. Test ------
# TODO: How should we test the app?
echo "********** TODO: Really test app instance **********"

# If we're not pausing after deploy, then carry on with the switch over
if [[ -z $PAUSE ]]; then
	# ------ 5. Add URLs to temporarily-named app ------
	# Get URLs that we want to use for this deployment
	# CF_ROUTES is likely an array of routes to use
	# this will be quoted, work with that
	ROUTES=$CF_ROUTES
	ROUTES=${ROUTES%\"}
	ROUTES=${ROUTES#\"}
	ROUTES=(${ROUTES})
	for ROUTE in "${ROUTES[@]}"
	do
		# Split the URL to get the hostname and domain
	    split_url $ROUTE

	    echo cf map-route $APP_NAME $DOMAIN --hostname $HOSTNAME
	    cf map-route $APP_NAME $DOMAIN --hostname $HOSTNAME
	done

	# ------ 6. Stop (and rename or delete) old app (if exists) ------
	if [ $(cf a | grep -c "^$ORIG_APP_NAME ") == 1 ]
	then
	    echo cf stop $ORIG_APP_NAME
	    cf stop $ORIG_APP_NAME

			# Should we keep the last version around?
			if [[ -z $NO_PREV ]]; then
		    # ------ 7. Rename old app to -prev ------
		    # Clear existing -prev if there is one, the cf command exits cleanly even if the app doesn't exist
		    echo cf delete $ORIG_APP_NAME$PREV_SUFFIX -f
		    cf delete $ORIG_APP_NAME$PREV_SUFFIX -f
		    echo cf rename $ORIG_APP_NAME $ORIG_APP_NAME$PREV_SUFFIX
		    cf rename $ORIG_APP_NAME $ORIG_APP_NAME$PREV_SUFFIX
			else
				# ------ 7. Delete old app ------
		    # Clear existing app if there is one, the cf command exits cleanly even if the app doesn't exist
				echo "no-prev, so deleting previous app..."
				echo cf delete $ORIG_APP_NAME -f
		    cf delete $ORIG_APP_NAME -f
			fi
	fi

	# ------ 8. Rename temp app to main app ------
	echo cf rename $APP_NAME $ORIG_APP_NAME
	cf rename $APP_NAME $ORIG_APP_NAME

	# ------ 9. Delete temp route ------
	echo cf delete-route $TEST_DOMAIN --hostname $TEST_HOSTNAME -f
	cf delete-route $TEST_DOMAIN --hostname $TEST_HOSTNAME -f

# Endif not pausing
fi
