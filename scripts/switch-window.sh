#!/usr/bin/env bash

# This script allows switching to a window without spaces animation
SEARCH_APP=${1}

SEARCH_VALUES=$(yabai -m query --windows | jq -r --arg SEARCH_APP "$SEARCH_APP" '.[] | select(.app==$SEARCH_APP) | [ .space, .id]')

SPACE_ID=$(echo $SEARCH_VALUES | jq '.[0]')
WINDOW_ID=$(echo $SEARCH_VALUES | jq '.[1]')

yabai -m space --focus $SPACE_ID
yabai -m window --focus $WINDOW_ID
