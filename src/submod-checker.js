$(function() {
  var run = function() {
    var parseCommit = function(commit, list) {
          var regexp = /diff --git a\/(.*?)\sb\/(?:.*?\n){4,5}@@\s(.*?)\s(.*?)\s@@(?:.*?\n){1,2}\+Subproject commit (.*?)\s/g;
          while ((match = regexp.exec(commit)) !== null) {
            var data = match.slice(1);
            if (list[data[0]] === undefined) {
              list[data[0]] = [];
            }
            list[data[0]].push(data);
          }
          return list;
        },
        showResults = function(list) {
          section_tmpl = '<section class="main">' +
                  '<h1>Submodules changed <span>({n})</span></h1>' +
                  '<ul class="commit-files-summary" id="commit-submodules-summary">' +
                  '    {rows}' +
                  '</ul>' +
                  '</section>',
          row_tmpl = '<li class="iterable-item file file-changed">' +
                  '        <div class="commit-file-diff-stats">' +
                  '          <span class="lines-added">' +
                  '              +{plus}' +
                  '          </span>' +
                  '          <span class="lines-removed">' +
                  '              -{minus}' +
                  '          </span>' +
                  '        </div>' +
                  '        <strong>{name}</strong> {commit}' +
                  '      </li>';

          if (Object.keys(list).length) {
            var $diff = $('#pullrequest-diff'),
                rows = '',
                section = '';
            for (i in list) {
              if (list.hasOwnProperty(i)) {
                rows += row_tmpl.supplant({
                  name: list[i][0][0],
                  minus: list[i].length,
                  plus: list[i].length,
                  commit: list[i][0][3]
                });
              }
            }
            section = section_tmpl.supplant({n: Object.keys(list).length, rows: rows});
            $diff.prepend(section);
          }
        },
        $commits_url = $('#pr-menu-commits'),
        $menu_tab = $('#pr-menu-diff');
    // Is it pull request Overview tab with all diffs?
    if (!$menu_tab.length || !$menu_tab.parent().hasClass('active-tab')) {
      return;
    }

    $.get($commits_url.attr('href'), function(commits_html) {
      var list = [],
          deferreds = [];

      $(commits_html).find('.hash.execute').each(function(i) {
        var url = $(this).attr('href') + '/raw';
        deferreds.push(
          $.get(url, function(commit_raw) {
            list = parseCommit(commit_raw, list);
          })
        );
      });

      $.when.apply($, deferreds).then(function() {
        var checkExist = setInterval(function() {
          if ($('#pullrequest-diff').length) {
            clearInterval(checkExist);
            showResults(list);
          }
        }, 100);
      });
    });
  };

  // Detect ajax tabs switch
  $('#pr-menu-diff').click(function() {
    var checkActive = setInterval(function() {
          if ($('#pr-menu-diff').parent().hasClass('active-tab')) {
            clearInterval(checkActive);
            run();
          }
        }, 100);
  });

  // Run extension to check pull request's submodules 
  run();
});