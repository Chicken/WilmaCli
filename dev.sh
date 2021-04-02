# DEV SCRIPT TO BUILD AND MOVE WILMA CLI TO BIN
# MADE ONLY FOR ME, CHANGE PATHS FOR YOUR INSTALLATION
./build.sh
rm "../../bin/wilma.exe"
mv "./build/wilmacli-win.exe" "../../bin/wilma.exe"
