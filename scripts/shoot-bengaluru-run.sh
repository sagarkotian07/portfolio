#!/bin/bash
# Captures a fresh screenshot of the live Bengaluru.run site into assets/src.
"/Applications/Google Chrome.app/Contents/MacOS/Google Chrome" --headless=new --disable-gpu \
  --hide-scrollbars --window-size=1440,900 --force-device-scale-factor=2 \
  --virtual-time-budget=12000 --timeout=25000 \
  --screenshot="$(pwd)/assets/src/bengaluru-run.png" https://bengaluru-run.vercel.app
