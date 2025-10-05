#!/bin/bash
# Chrome Ecosystem Detective - Development Chrome Launcher
# Generated on 2025-10-03T07:47:09.306Z

echo "🚀 Launching Chrome with development-safe configuration..."
echo "Profile: /var/folders/y2/6df8f47x0z13b5_kvs060_4r0000gn/T/chrome-dev-profile"
echo ""

"/Applications/Google Chrome.app/Contents/MacOS/Google Chrome" --user-data-dir="/var/folders/y2/6df8f47x0z13b5_kvs060_4r0000gn/T/chrome-dev-profile" --disable-extensions-file-access-check --disable-features=ExtensionsToolbarMenu --disable-background-timer-throttling --disable-renderer-backgrounding --disable-background-networking --disable-extensions-except=fmkadmapgofadopljbjfkapdkoienihi --flag-switches-begin --enable-logging=stderr --flag-switches-end "$@"
