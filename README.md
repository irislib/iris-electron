NOTE 25/10/2022: It's been a while since the last release — if you just want to try Iris, installing the PWA from https://iris.to is more advisable.

# iris-electron

[Iris-messenger](https://github.com/irislib/iris-messenger) Electron app.

[Download](https://github.com/irislib/iris-electron/releases)

![Screenshot](screenshot.png)

## develop
```
git submodule update --init
cd iris-messenger;yarn;yarn build;cd ..
yarn
yarn start
```

## build
```
yarn pack
```

## build distribution
Disable "afterSign" script in package.json if you're building for Mac and don't want to notarize.

Local platform:
```
yarn build
```

Docker:
1)
```
docker run --rm -ti \
 --env-file <(env | grep -iE 'DEBUG|NODE_|ELECTRON_|YARN_|NPM_|CI|CIRCLE|TRAVIS_TAG|TRAVIS|TRAVIS_REPO_|TRAVIS_BUILD_|TRAVIS_BRANCH|TRAVIS_PULL_REQUEST_|APPVEYOR_|CSC_|GH_|GITHUB_|BT_|AWS_|STRIP|BUILD_') \
 --env ELECTRON_CACHE="/root/.cache/electron" \
 --env ELECTRON_BUILDER_CACHE="/root/.cache/electron-builder" \
 -v ${PWD}:/project \
 -v ${PWD##*/}-node-modules:/project/node_modules \
 -v ~/.cache/electron:/root/.cache/electron \
 -v ~/.cache/electron-builder:/root/.cache/electron-builder \
 electronuserland/builder:wine
```

 2)
```
yarn && yarn build
```
or
```
yarn && yarn build --win
```
