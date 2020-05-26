const fs = require('fs');
const { getChart } = require('billboard-top-100');

getChart((err, chart) => {
    if (err) console.log(err);
    console.log(chart);
    fs.writeFileSync('./CHART.json', JSON.stringify(chart));
});