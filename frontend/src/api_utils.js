"use strict";

export function addApiPrefixToPath(path) {
    const cacheKey = + new Date();
    return path + "?v=" + cacheKey;
}
