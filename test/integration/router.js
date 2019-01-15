/**
@license
Copyright (c) 2018 The Polymer Project Authors. All rights reserved.
This code may only be used under the BSD style license found at http://polymer.github.io/LICENSE.txt
The complete set of authors may be found at http://polymer.github.io/AUTHORS.txt
The complete set of contributors may be found at http://polymer.github.io/CONTRIBUTORS.txt
Code distributed by Google as part of the polymer project is also
subject to an additional IP rights grant found at http://polymer.github.io/PATENTS.txt
*/

const puppeteer = require('puppeteer');
const expect = require('chai').expect;
const {startServer} = require('polyserve');
const path = require('path');
const appUrl = 'http://127.0.0.1:4444';

describe('routing tests', function() {
  let polyserve, browser, page;

  before(async function() {
    polyserve = await startServer({port:4444, root:path.join(__dirname, '../..'), moduleResolution:'node'});
  });

  after((done) => polyserve.close(done));

  beforeEach(async function() {
    browser = await puppeteer.launch();
    page = await browser.newPage();
    await page.setViewport({width: 1920, height: 1080});
  });

  afterEach(() => browser.close());

  it('the page selector switches pages', async function() {
    await page.goto(`${appUrl}`, {waitUntil: 'networkidle2'});
    await page.waitForSelector('app-shell', {visible: true});

    await testNavigation(page, 'page-one', 'Page One');
    await testNavigation(page, 'page-two', 'Page Two');
    await testNavigation(page, 'page-not-found', '404 Not Found');
  });

  // it('the page selector switches pages in a different way', async function() {
  //   await page.goto(`${appUrl}`);
  //   await page.waitForSelector('app-shell', {visible: true});
  //
  //   // Setup
  //   await page.evaluate(() => {
  //     window.deepQuerySelector = function(query) {
  //       const parts = query.split('::shadow');
  //       let el = document;
  //       for (let i = 0; i < parts.length; i++) {
  //         el = el.querySelector(parts[i]);
  //         if (i % 2 === 0) {
  //           el = el.shadowRoot;
  //         }
  //       }
  //       return el === document ? null : el;
  //     };
  //     console.log(window.deepQuerySelector);
  //   });
  //
  //   await testNavigationInADifferentWay(page, 'page-one', 'View One');
  //   await testNavigationInADifferentWay(page, 'page-two', 'View Two');
  //   await testNavigationInADifferentWay(page, 'page-not-found', '404 Not Found');
  // });
});

async function testNavigation(page, href, linkText) {
  // Shadow DOM helpers.
  const getShadowRootChild = (el, childSelector) => {
    return el.shadowRoot.querySelector(childSelector);
  };

  const getShadowRootChildProp = (el, childSelector, prop) => {
    return el.shadowRoot.querySelector(childSelector)[prop];
  };
  const doShadowRootClick = (el, childSelector) => {
    return el.shadowRoot.querySelector(childSelector).click();
  };

  const selector = `.nav-menu-item[href="/${href}"]`;
  const shadowSelector = `.nav-menu-item[href="/${href}"]`;

  // Does the link say the right thing?
  const appShell = await page.$('app-shell');
  const menu = await page.evaluate(getShadowRootChild, appShell, 'app-menu');
  const myText = await page.evaluate(getShadowRootChildProp, menu, selector, 'textContent');
  expect(await myText).equal(linkText);

  // Does the click take you to the right page?
  await page.evaluate(doShadowRootClick, menu, selector);
  const newUrl = await page.evaluate('window.location.href');
  expect(newUrl).equal(`${appUrl}/${href}`);
}

async function testNavigationInADifferentWay(page, href, linkText) {
  const query = `app-shell::shadow a[href="/${href}"]`;

  const linkHandle = await page.evaluateHandle((query) => window.deepQuerySelector(query), query);
  const text = await page.evaluate((el) => el.textContent, linkHandle);
  expect(text).equal(linkText);

  await page.evaluate((el) => el.click(), linkHandle);
  let newUrl = await page.evaluate('window.location.href');
  expect(newUrl).equal(`${appUrl}/${href}`);
}
