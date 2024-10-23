# fmnp
Выполнил Логинов Георгий Дмитриевич M3100.

fmnp – vscode extension, that provides simple and fast file manipulations in your projects.

# Usage:
Type Ctrl+P to open vscode commands and search "fmnp" there or assign a shortcut to it.

File directories are calculated relative to a file, opened in editor, or to root of the project if any project is opened.

List of available commands:
```
m <source> <destination> # moves a file from source to destination
```
```
c <source> <destination> # copies a file from source to destination
```
```
d <path> # deletes a file 
```
```
nd <path> # makes a new directory
```
```
nf <path> # makes a new file
```
```
o <path> # opens a file in editor
```
```
np <name> # makes a new project in user's home folder
```
# Building
Make sure you have Node.js installed, then run:
```sh
npm install -g @vscode/vsce
```

Clone this repository:
```sh
git clone https://github.com/chefadekvat/fmnp
```

You can use vsce to package an extension:
```sh
cd fmnp && vsce package
```
Now you you have .vsix package, which you can install to vscode
```sh
code --install-extension ./fmnp-<version>.vsix
```
Enjoy!