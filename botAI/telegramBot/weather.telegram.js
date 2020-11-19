module.exports = function weather(ctx) {
    let lat = 42.0;
    let lon = 42.0;


    ctx.replyWithLocation(lat, lon, { live_period: 60 }).then((message) => {
        const timer = setInterval(() => {
            lat += Math.random() * 0.001
            lon += Math.random() * 0.001
            ctx.telegram.editMessageLiveLocation(lat, lon, ctx.message.chat.id, ctx.message.message_id).catch(() => clearInterval(timer))
        }, 1000)
    })
};