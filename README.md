[![Built with pwa–starter–kit](https://img.shields.io/badge/built_with-pwa–starter–kit_-blue.svg)](https://github.com/Polymer/pwa-starter-kit 'Built with pwa–starter–kit')

# Etools Frontend Template App

This an app shell for Unicef eTools apps, a starting point based on LitElement, Redux and Typescript.

## Install

- requirements: `node`, `npm`, `polymer-cli`, `typescript`
- `npm install`
- `npm run start`

Check `package.json` `scripts` for more...

#### Deploy

- Make sure the superproject points to the desired submodule commit
- For deploy config (.circleci/config.yml):
  `git submodule update --remote` - will use the last commit on the branch specified in .gitmodules for the submodule
  `git submodule update --checkout`- will use the submodule reference tracked by the superproject. For this you have to commit the submodule reference in the superproject repo every time before deploy
