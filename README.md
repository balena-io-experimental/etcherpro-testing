# EtcherPro automatic testing project

This repository is designed to help us test Etcher on EtcherPro functionalities before release.

This should be run on a computer attached to an EtcherPro running the latest release in the EtcherPro flowzone deployment automatic tests.

## Requirements

For this project to work, you need to run EtcherPro software `v1.3.4` or above.

## Dependencies

This project relies on `Playwright` with electon Chrome Debugging Port capability.
At the time of creating this project, this only exists in an [unmerged branch](https://github.com/ZFail/playwright/tree/electron-connect-over-cdp).

These dependencies have been included in the [deps](./deps/) folder for ease of use.

## Setting up

### Installing dependencies

To setup this package, run:
```
npm i
npx playwright install
```

### Setting up the EtcherPro

In order to enable Electron debugging on EtcherPro, you need to set these two variables on the `etcher` service of the device under test:
- `BALENAELECTRONJS_REMOTE_INSPECT_PORT=9229`
- `BALENAELECTRONJS_REMOTE_DEBUGGING_PORT=9222`

You will also need the EtcherPro to be online, and to be on the same local network as the testing computer.

Finally you will need the IP address of the EtcherPro on the local network. Add this IP address as "etcherProIP" in `config.json` file.

### Setting up the URL

Finally set the URL to flash from in the "flashFromUrl" field of `config.json` file to link to a file accessible by the EtcherPro.

## Running the tests

To run the test, run `npm test`. 

The report can be seen using `npm run report`.

