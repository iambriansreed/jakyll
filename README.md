# Jakyll.js

Jakyll.js is a Jekyll alternative built with TypeScript & Node.

### Install

`npm install jakyll`

### Run in development mode

`jakyll -dev`

Development mode serves the site on the fly, generating pages on the fly.

### Run in production mode

`jakyll -start`

Creates a purely static copy of the site to the `build` directory and runs it locally.

### Deploy

`jakyll -deploy`

Creates a purely static copy of the site to the `build` directory and contents to the `gh-pages` branch and pushes an update.

## Project structure

Your **jakyll.js** powered repo needs three directories:

-   [/content](#content)
-   [/static](#static)
-   [/templates](#templates)

### /static

Contains static files. e.g. images, js (client side), css, etc. Files in this directory will be served at root path /.

### /templates

Contains the [handlebars.js](https://handlebarsjs.com/guide/#what-is-handlebars) templates.

> The `templates/default.html` file is **_required_** as it's the default template.

### /content

Contains the files for which pages are built from. The file structure in this directory directly results in the site's structure. Can include the html, [handlebars.js](https://handlebarsjs.com/guide/#what-is-handlebars) templates, markdown, or txt files.

> The `content/index.html` file is **_required_** as it's the root page of your site.

For example:

| Content File Path    | Browser URL Path   | Static File Path Builds       |
| -------------------- | ------------------ | ----------------------------- |
| `index.html`         | `/`                | `/index.html`                 |
| `blog/index.html`    | `/blog`            | `/blog/index.html`            |
| `blog/post-title.md` | `/blog/post-title` | `/blog/post-title/index.html` |
| `about/index.html`   | `/about`           | `/about/index.html`           |
| `about/people.txt`   | `/about/people`    | `/about/people/index.html`    |

#### Meta Header

Content files may optionally contain a meta header. This is similar to [jekyllrb front-matter](https://jekyllrb.com/docs/front-matter/).

```
---
template: post
title: Norfolk.js meetup kickoff
tags: javascript, meetup, norfolk
published: true
excerpt: The kickoff meetup for the Norfolk.js group.
---
```

The only property that **jakyll.js** uses is the `template` property. If not set the default [template](#templates) is used (default.html). All the values in the header can be used in the handlebars templates.

---

Made with&nbsp;&nbsp;❤️&nbsp;&nbsp;by [iambriansreed](https://iambrian.com).
