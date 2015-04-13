if (!String.prototype.supplant) {
    String.prototype.supplant = function (o) {
        return this.replace(
            /\{([^{}]*)\}/g,
            function (a, b) {
                var r = o[b];
                return typeof r === 'string' || typeof r === 'number' ? r : a;
            }
        );
    };
}

if (!Array.prototype.first) {
    Array.prototype.first = function () {
        var i;
        for (i in this) {
            if (this.hasOwnProperty(i)) {
                return this[i];
            }
        }
    };
}