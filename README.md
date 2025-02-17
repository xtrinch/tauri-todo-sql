# Tauri + React + Sqlite

TODO-like application running React on Tauri using Sqlite as a data source.

![alt text](https://github.com/xtrinch/tauri-todo-sql/blob/main/images/screenshot.png?raw=true)

## Recommended IDE Setup

- [VS Code](https://code.visualstudio.com/) + [Tauri](https://marketplace.visualstudio.com/items?itemName=tauri-apps.tauri-vscode) + [rust-analyzer](https://marketplace.visualstudio.com/items?itemName=rust-lang.rust-analyzer)

`yarn tauri dev`
`export TAURI_SIGNING_PRIVATE_KEY=./licitacija.key && yarn tauri build --runner cargo-xwin --target x86_64-pc-windows-msvc`

## Deploying

Push to `release` branch, CI will pick it up and create a GH release for you, which can then be used for in-app updates.