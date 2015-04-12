/*jslint browser: true, regexp: true */
/*global $ */

app = {
    tmpl: {
        section: '<section class="main">' +
                 '  <h1>Submodules changed <span>({n})</span></h1>' +
                 '  <ul class="commit-files-summary" id="commit-submodules-summary">' +
                 '    {rows}' +
                 '  </ul>' +
                 '</section>',
        row: '<li class="iterable-item file file-changed">' +
             '  <div class="commit-file-diff-stats">' +
             '    <span class="lines-added">' +
             '      +{plus}' +
             '    </span>' +
             '    <span class="lines-removed">' +
             '      -{minus}' +
             '    </span>' +
             '  </div>' +
             '  <strong>{name}</strong> {commit}' +
             '</li>'
    },
    init: function () {
        'use strict';
        var $menuItem = $('#pr-menu-diff');

        if (!$menuItem.length) {
            return;
        }
        // Detect ajax tabs switch
        $menuItem.click(function () {
            var checkActive = setInterval(function () {
                if ($('#pr-menu-diff').parent().hasClass('active-tab')) {
                    clearInterval(checkActive);
                    app.run();
                }
            }, 100);
        });
    },
    parseCommit: function (commit, list) {
        'use strict';
        var regexp = /diff --git a\/(.*?)\sb\/(?:.*?\n){4,5}@@\s(.*?)\s(.*?)\s@@(?:.*?\n){1,2}\+Subproject commit (.*?)\s/g,
            match,
            data;

        while ((match = regexp.exec(commit)) !== null) {
            data = match.slice(1);
            if (list[data[0]] === undefined) {
                list[data[0]] = [];
            }
            list[data[0]].push(data);
        }

        return list;
    },
    showResults: function (list) {
        'use strict';
        var $diff = $('#pullrequest-diff'),
            rows = '',
            section = '',
            i;

        if (!Object.keys(list).length || !$diff.length) {
            return;
        }

        for (i in list) {
            if (list.hasOwnProperty(i)) {
                rows += app.tmpl.row.supplant({
                    name: list[i][0][0],
                    minus: list[i].length,
                    plus: list[i].length,
                    commit: list[i][0][3]
                });
            }
        }
        section = app.tmpl.section.supplant({n: Object.keys(list).length, rows: rows});
        $diff.prepend(section);
    },
    run: function () {
        'use strict';
        var $commits_url = $('#pr-menu-commits'),
            $menu_tab = $('#pr-menu-diff'),
            list = [],
            deferreds = [];

        // Is it pull request Overview tab with all diffs?
        if (!$menu_tab.length || !$menu_tab.parent().hasClass('active-tab')) {
            return;
        }

        $.get($commits_url.attr('href'), function (commits_html) {
            $(commits_html).find('.hash.execute').each(function () {
                var url = $(this).attr('href') + '/raw';
                deferreds.push(
                    $.get(url, function (commit_raw) {
                        list = app.parseCommit(commit_raw, list);
                    })
                );
            });

            // wait for all ajax requests
            $.when.apply($, deferreds).then(function () {
                var checkExist = setInterval(function () {
                        if ($('#pullrequest-diff').length) {
                            clearInterval(checkExist);
                            app.showResults(list);
                        }
                    }, 100);
            });
        });
    }
};

$(function () {
    'use strict';
    app.init();
    app.run();
});