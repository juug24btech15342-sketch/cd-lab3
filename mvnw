#!/bin/sh
set -eu

ROOT_DIR=$(CDPATH= cd -- "$(dirname -- "$0")" && pwd)
exec java "-Dmaven.multiModuleProjectDirectory=$ROOT_DIR" \
    -classpath "$ROOT_DIR/.mvn/wrapper/maven-wrapper.jar" \
    org.apache.maven.wrapper.MavenWrapperMain "$@"
