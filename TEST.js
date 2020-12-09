const fetch = require('request');


// https://developer.foursquare.com/docs/places-api/endpoints/
fetch(
    {
        url: 'https://api.foursquare.com/v2/venues/search',
        method: 'GET',
        qs: {
            client_id: 'IPJVISTE3A50N5EGPTPGVJHMJD3DCSKWWID3HTUAOEHFN2ZY',
            client_secret: 'B3TP4415NUZSBLQWEJI0MFMG405BDJOBVXP1WTHS54Q0WUKC',
            // ll: '40.7243,-74.0018',
            near: 'Киев',
            categoryId: '4deefb944765f83613cdba6e',
            // query: 'parks',
            v: '20180323',
            limit: 1,
        },
    },
    function(err, res, body) {
        if (err) {
            console.error(err);
        } else {
            console.log(body);
        }
    }
);