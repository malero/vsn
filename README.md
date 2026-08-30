[![npm version](https://badge.fury.io/js/vsn.svg)](https://badge.fury.io/js/vsn) [![Build Status](https://travis-ci.org/malero/vsn.svg?branch=master)](https://travis-ci.org/malero/vsn) [![codecov](https://codecov.io/gh/malero/vsn/branch/master/graph/badge.svg)](https://codecov.io/gh/malero/vsn) [![npm](https://img.shields.io/npm/dw/vsn.svg)]() [![gzip bundle size](http://img.badgesize.io/https://unpkg.com/vsn@latest/dist/?compression=gzip&style=flat-square)](https://unpkg.com/vsn)

# VisionJS Framework
VisionJS is a simple JavaScript framework built from the ground up with eCommerce and SEO in mind. It is meant to be used with server-side rendered websites. Rather than dynamically rendering component templates like most JavaScript frameworks, VisionJS uses the HTML rendered by your server to add functionality to your website.

Learn more at https://vsnjs.org.

## Installing
Use NPM to install VisionJS with the following command:

```bash
npm i vsn
```

## Usage
Please visit the [docs](https://www.vsnjs.org/docs/) for more information.

## CFS syntax

Identifiers may contain hyphens so CSS-style names such as `data-value` remain intact. To subtract numbers, include whitespace around the operator: use `count - 1`, not `count-1`.

Named functions are synchronous unless declared with the `async` keyword. Async named functions return promises and may use `await` in their bodies.

## HTML extensions

HTML extensions can register composable transforms with `engine.registerHtmlTransformer(transform, { priority })`. Lower priorities run first, and the returned disposer removes the transform. The templates plugin runs before the sanitizer plugin so template output can be sanitized regardless of registration order.

The sanitizer plugin uses DOMPurify when it is available. Its built-in fallback removes scripts, inline event attributes, and `javascript:` URLs; use DOMPurify or provide a custom sanitizer for hostile or complex HTML.
