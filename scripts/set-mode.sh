SCREEN_MODE=${1:-"laptop"}

if [ $SCREEN_MODE == "wide" ]; then
  echo "wide"
else 
  echo "laptop"
fi
