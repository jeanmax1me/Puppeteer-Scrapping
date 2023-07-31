const fs = require('fs');
const puppeteer = require('puppeteer');

const MAX_PAGES = 5; // Set the maximum number of pages to scrape

(async () => {
  const browser = await puppeteer.launch({ headless: false });
  const page = await browser.newPage();
  await page.goto('https://ebay.com');
  await page.waitForSelector('#gh-ac');
  await page.type('#gh-ac', 'Bose QuietComfort Noise-Cancelling');
  await page.click('input[value="Search"]');

  const allPrices = [];
  let totalPages = 0;

  while (totalPages < MAX_PAGES) {
    await page.waitForSelector('span.s-item__price');
    const prices = await page.$$eval('span.s-item__price', (spans) => {
      return [...spans].map((span) => {
        const priceWithComments = span.innerHTML;
        const priceWithoutComments = priceWithComments.replace(/<!--(.*?)-->/g, '').trim();
        const priceRegex = /\$([0-9,]+\.[0-9]+)/;
        const matches = priceWithoutComments.match(priceRegex);
        if (matches && matches.length >= 2) {
          return matches[1];
        }
        return null;
      });
    });

    const validPrices = prices.filter((price) => price !== null).map((price) => parseFloat(price.replace(',', '')));
    allPrices.push(...validPrices);

    totalPages++;

    // Click the "Next" button and wait for the next page to load
    const nextButton = await page.$('a.pagination__next');
    if (!nextButton) {
      break; // If no "Next" button, break out of the loop
    }

    await Promise.all([
      page.waitForNavigation({ waitUntil: 'domcontentloaded' }),
      page.evaluate((el) => el.click(), nextButton),
    ]);
  }

  // Save the scraped data as a JSON file
  const jsonData = JSON.stringify(allPrices, null, 2);
  fs.writeFileSync('scraped_data.json', jsonData, 'utf8');

  console.log('Scraped data has been written to scraped_data.json');
  console.log('You can access the file here: ' + __dirname + '/scraped_data.json');

  await browser.close();
  process.exit();
})();
