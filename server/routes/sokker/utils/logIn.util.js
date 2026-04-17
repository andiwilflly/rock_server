module.exports = async function () {
    const response = await fetch('https://sokker.org/start', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({ ilogin: 'benelone', ipassword: 'password' }),
        redirect: 'manual'
    });
    const cookies = response.headers.get('set-cookie') || '';
    console.log('SOKKER | logged in...');
    return cookies;
}
