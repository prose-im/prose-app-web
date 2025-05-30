#!/bin/bash

# This file is part of prose-app-web
#
# Copyright 2024, Prose Foundation

# Read arguments
while [ "$1" != "" ]; do
    argument_key=`echo $1 | awk -F= '{print $1}'`
    argument_value=`echo $1 | awk -F= '{print $2}'`

    case $argument_key in
        -e | --endpoint)
            ENDPOINT_URL="$argument_value"
            ;;
        -b | --bucket)
            BUCKET="$argument_value"
            ;;
        -v | --version)
            # Notice: strip any leading 'v' to the version number
            VERSION="${argument_value/v}"
            ;;
        -m | --manifest)
            MANIFEST_PATH="$argument_value"
            ;;
        *)
            echo "Unknown argument received: '$argument_key'"
            exit 1
            ;;
    esac

    shift
done

# Ensure endpoint URL is provided
if [ -z "$ENDPOINT_URL" ]; then
  echo "No endpoint URL was provided, please provide it using '--endpoint'"

  exit 1
fi

# Ensure bucket is provided
if [ -z "$BUCKET" ]; then
  echo "No bucket was provided, please provide it using '--bucket'"

  exit 1
fi

# Ensure release version is provided
if [ -z "$VERSION" ]; then
  echo "No version was provided, please provide it using '--version'"

  exit 1
fi

# Define methods
function generate_url {
  # Read arguments
  platform=$2
  architecture=$3
  filename=$4

  # Generate version update archive URL
  url="$ENDPOINT_URL/$BUCKET/versions/$VERSION/$platform/$architecture/update/"
  url+="$filename"

  # Ensure file exists at URL
  curl --fail --location --head $url &>/dev/null
  rc_status=$?

  if [ ! $rc_status -eq 0 ]; then
    echo "Error: update archive file check did not succeed: $url"

    exit 1
  fi

  # Append value to input argument
  eval "$1+=\"$url\""
}

function fetch_signature {
  # Read arguments
  archive_url=$2

  # Generate signature URL
  signature_url="$archive_url.sig"

  # Acquire signature
  signature=$(curl --fail --location --get $signature_url 2>/dev/null)
  rc_status=$?

  if [ ! $rc_status -eq 0 ]; then
    echo "Error: failed fetching signature: $signature_url"

    exit 1
  fi

  if [ -z "$signature" ]; then
    echo "Fatal: fetched signature is empty: $signature_url"

    exit 1
  fi

  # Append value to input argument
  eval "$1+=\"$signature\""
}

function make_platform {
  # Read arguments
  platform=$2
  architecture=$3
  filename=$4
  updater_platform="${5:-$platform}"

  # Generate archive URL
  archive_url=""
  generate_url archive_url "$platform" "$architecture" "$filename"

  # Fetch signature
  platform_signature=""
  fetch_signature platform_signature "$archive_url"

  # Generate manifest for platform
  manifest_escaped="    \\\"$updater_platform-$architecture\\\": {"$'\n'
  manifest_escaped+="      \\\"signature\\\": \\\"$platform_signature\\\","$'\n'
  manifest_escaped+="      \\\"url\\\": \\\"$archive_url\\\""$'\n'
  manifest_escaped+="    }"

  eval "$1+=\"$manifest_escaped\""
}

# Generate manifest JSON
echo "Generating updater manifest JSON..."

manifest="{"$'\n'
manifest+="  \"version\": \"$VERSION\","$'\n'
manifest+="  \"platforms\": {"$'\n'

make_platform manifest "macos" "aarch64" "Prose.app.tar.gz" "darwin" && manifest+=$',\n'
make_platform manifest "macos" "x86_64" "Prose.app.tar.gz" "darwin" && manifest+=$',\n'
make_platform manifest "windows" "x86_64" "Prose_${VERSION}_x64_en-US.msi.zip" "windows" && manifest+=$'\n'

manifest+="  }"$'\n'
manifest+="}"

# Send manifest data to output (path or standard output)
if [ ! -z "$MANIFEST_PATH" ]; then
  echo -n "$manifest" > $MANIFEST_PATH
  echo "Wrote to manifest: $MANIFEST_PATH"
else
  echo ""
  echo "$manifest"
fi

exit 0
