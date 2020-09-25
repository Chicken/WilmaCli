# DEV SCRIPT TO BUILD AND MOVE WILMA CLI TO BIN
# MADE ONLY FOR ME, CHANGE PATHS FOR YOUR INSTALLATION
./build.sh
rm "../../Temp Workspace/bin/wilma.exe"
mv "./build/wilmacli-win.exe" "../../Temp Workspace/bin/wilma.exe"