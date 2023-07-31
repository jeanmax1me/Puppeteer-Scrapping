const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch({ headless: false });
  const page = await browser.newPage();
  await page.goto('https://ebay.com');
  await page.waitForSelector('#gh-ac');
  await page.type('#gh-ac', 'Bose QuietComfort Noise-Cancelling');
  await page.click('input[value="Search"]');

  await page.waitForSelector('span.s-item__price');
  const prices = await page.$$eval('span.s-item__price', (spans) => {
    return [...spans].map((span) => {
      const priceWithComments = span.innerHTML;
      const priceWithoutComments = priceWithComments.replace(/<!--(.*?)-->/g, '').trim();

      // Use regular expression to extract the actual price from the text
      const priceRegex = /\$([0-9,]+\.[0-9]+)/;
      const matches = priceWithoutComments.match(priceRegex);

      if (matches && matches.length >= 2) {
        return matches[1]; // Extracted price is the second element in the matches array
      }

      return null; // Return null for invalid prices
    });
  });

  // Filter out null values and convert prices to numbers
  const validPrices = prices.filter((price) => price !== null).map((price) => parseFloat(price.replace(',', '')));

  console.log(validPrices);

  await browser.close();
})();
