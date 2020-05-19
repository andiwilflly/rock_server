module.exports = function daysFromNow(date = '01.01.2007') {
    return (Date.now() - (new Date(date)).getTime()) / 1000 / 60 / 60 / 24;
}