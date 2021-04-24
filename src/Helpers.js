export function getQueryParams(qs) {
    qs = qs.split('+').join(' ');

    var params = {},
        tokens,
        re = /[?&]?([^=]+)=([^&]*)/g;

    while (tokens = re.exec(qs)) {
        params[decodeURIComponent(tokens[1])] = decodeURIComponent(tokens[2]);
    }

    return params;
}

let prev = performance.now();
let delta = 0;

export function silentLog(...args) {
    delta += performance.now() - prev;
    prev = performance.now();
    if( delta > 100 ) {
        console.log(...args);
        delta = 0
    }
}