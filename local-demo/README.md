# Local Demo Package

This folder is for offline delivery of the current demo without changing the default online build flow.

## Files

- `../dist-local/`: local delivery build output
- `start-local.command`: starts a lightweight local static server for the package

## How To Use

1. Run `npm run build:local`
2. Double-click `local-demo/start-local.command`
3. Open `http://localhost:4173/`

Using the local server is recommended instead of opening `index.html` via `file://`, because some browsers restrict module and media loading for direct local file access.
