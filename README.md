# Jakyll

Jakyll is a drop in Jekyll alternative built with TypeScript & Node.

## Install

`npm install jakyll`

-   installs `jakyll`
-   adds `package.json` scripts
-   adds the github action

## Scripts

These scripts are automatically added to your `package.json` file during the install.

```json
{
    ...
    "scripts": {
        "dev": "jakyll -dev",
        "build": "jakyll -build",
        "start": "jakyll -start",
        "deploy": "jakyll -deploy"
    },
    ...
}
```

### Run in development mode

`jakyll -dev`

Development mode serves the site, hot reloading when files change.

### Run in production mode

`jakyll -start`

Creates a purely static copy of the site to the `build` directory and runs it locally.

### Build

`jakyll -build`

Creates a purely static copy of the site to the `build` directory.

### Deploy

`jakyll -deploy`

Runs the build command and copies it to the `gh-pages` branch and pushes the branch to github.

---

Made with&nbsp;&nbsp;❤️&nbsp;&nbsp;by [iambriansreed](https://iambrian.com).
