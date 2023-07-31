const fs = require('fs');

const filePath = 'scraped_data.json';

fs.readFile(filePath, 'utf8', (err, data) => {
  if (err) {
    console.error('Error reading scraped_data.json:', err);
    return;
  }

  try {
    const prices = JSON.parse(data);
    if (!Array.isArray(prices)) {
      console.error('Invalid data format in scraped_data.json. Expected an array of prices.');
      return;
    }

    if (prices.length === 0) {
      console.error('The scraped_data.json array is empty.');
      return;
    }

    const totalPrices = prices.length;
    const sumPrices = prices.reduce((acc, price) => acc + price, 0);
    const averagePrice = sumPrices / totalPrices;

    console.log('Average Price:', averagePrice.toFixed(2));
  } catch (parseError) {
    console.error('Error parsing scraped_data.json:', parseError);
  }
});