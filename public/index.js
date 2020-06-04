console.log('TEST 412')

var es = new EventSource('/stream');

es.onmessage = function (event) {
    console.log('MSG', event, event.data);

    const $msg = document.createTextNode(`${ new Date().toLocaleTimeString() }: ${event.type} | ${event.data}`);
    const $div = document.createElement('div');
    $div.appendChild($msg);
    document.getElementById('stream').appendChild($div);
};

es.addEventListener('eventName', function (event) {
    console.log('eventName!!!', event, event.data);
});