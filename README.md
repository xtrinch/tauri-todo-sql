# Tauri + React + Sqlite

TODO-like application running React on Tauri using Sqlite as a data source.

![alt text](https://github.com/xtrinch/tauri-todo-sql/blob/main/images/screenshot.png?raw=true)

## Recommended IDE Setup

- [VS Code](https://code.visualstudio.com/) + [Tauri](https://marketplace.visualstudio.com/items?itemName=tauri-apps.tauri-vscode) + [rust-analyzer](https://marketplace.visualstudio.com/items?itemName=rust-lang.rust-analyzer)

1. Install yarn 
`npm install --global yarn`
2. Install yarn packages 
`yarn install`
3. Install Rust
`curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh`
4. Run dev
`yarn tauri dev`

`export TAURI_SIGNING_PRIVATE_KEY=./licitacija.key && yarn tauri build --runner cargo-xwin --target x86_64-pc-windows-msvc`

## Deploying

Push to `release` branch, CI will pick it up and create a GH release for you, which can then be used for in-app updates.

## Deploying new migrations

Change _v12(n) string in code, it will use a new internal DB. The file used by the app should be saved and reimported into the application.
