// https://developer.foursquare.com/docs/places-api/endpoints/
(async () => {
    const params = new URLSearchParams({
        client_id: 'IPJVISTE3A50N5EGPTPGVJHMJD3DCSKWWID3HTUAOEHFN2ZY',
        client_secret: 'B3TP4415NUZSBLQWEJI0MFMG405BDJOBVXP1WTHS54Q0WUKC',
        near: 'Киев',
        categoryId: '4deefb944765f83613cdba6e',
        v: '20180323',
        limit: 1,
    });

    const response = await fetch(`https://api.foursquare.com/v2/venues/search?${params}`);
    const body = await response.text();
    console.log(body);
})();
