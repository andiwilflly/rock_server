module.exports = function(subscription, newReleases = {}) {

    Object.values(newReleases).forEach(newRelease => {

        newReleases[newRelease.name] = {
            isActive: true,
            artist: subscription.name,
            createdAt: (new Date()).getTime(),

            artists: newRelease.artists,
            image: newRelease.images[0].url,
            name: newRelease.name,
            id: newRelease.id,
            type: newRelease.type,
            releaseDate: newRelease.release_date,
            spotifyLink: newRelease.external_urls.spotify,
            subscription
        }
    });

    return newReleases;
}