# WilmaCli

A wilma Cli client. <br>
Made out of boredom and for fun. <br> 
You shouldn't use this.

## Credits

Based on the wilma api documentation made by the [OpenWilma](https://github.com/OpenWilma) project. <br>
Some code snippets are directly taken from their lib. The snippets are credited in the code. <br>
Special thanks to all the contributors!

## Pre-Requisites

This software requires you to have node and npm installed. <br>
Having a wilma account makes life easier too. <br>

## Usage

1. Git clone the repository
2. Do `npm install`
3. Run `node . setup`
4. Fill in your details
5. `node . help` for list of commands, `node . <command>` to execute a command

## Building
For building you need pkg. It can be installed with. `npm i -g pkg` <br>
Or you can try to build with something else. I use pkg and it works. <br>
Building is as simple as running the `build.sh` file.

After that you receive linux, mac and win binaries in the `build` folder. <br>
Take out the one you use, rename it to `wilma` and put it in your `PATH`. <br>
Now you can use WilmaCli from anywhere on your system and using node.

## Configs

You can find the configs and saved files by WilmaCli in `<yourHomeDir>/.wilma/` <br>
You can configure the colors of the client in `theme.json`. <br>
You can also manually change credentials in `creds.json`. <br>
Or just rerun `node . setup` to change account.