Object.defineProperty(Array.prototype, 'chunk', {
    value: function(chunkSize) {
        var array = this;
        return [].concat.apply([],
            array.map(function(elem, i) {
                return i % chunkSize ? [] : [array.slice(i, i + chunkSize)];
            })
        );
    }
});