# WilmaCli

A wilma Cli client. <br>
Made out of boredom and for fun. <br> 
You should use this if you are cli user and lazy to login to the website.

## Credits

Based on the wilma api documentation made by the [OpenWilma](https://github.com/OpenWilma) project. <br>
Some code snippets are directly taken from their lib. These snippets are credited in the code. <br>
Special thanks to all the contributors!

## Pre-Requisites

Developing and building this software requires you to have node and npm installed. <br>
More about building below. <br>
You don't need node or npm to run the precompiled versions. <br>
Having a wilma account makes life easier too. <br>

## Usage

1. Download the latest file for your os from the relases tab.
2. Put it in your bin / path
3. Run `wilma` on console to do the setup
4. Run `wilma help` or `wilma <command>` for commands
5. Or enter interactive wilma shell by just doing `wilma`

## Building

For building you need pkg. It can be installed with. `npm i -g pkg` <br>
Or you can try to build with something else. I use pkg and it works. <br>
Building is as simple as running the `build.sh` file.

After that you receive linux, mac and win binaries in the `build` folder. <br>
Take out the one you use, rename it to `wilma` and put it in your path or whatever bin folder. <br>
Now you can use WilmaCli from anywhere on your system without using node.

## Configs

You can find the configs and saved files by WilmaCli in `<yourHomeDir>/.wilma/` <br>
You can configure the colors of the client in `theme.json`. <br>
You can also manually change credentials in `creds.json`.