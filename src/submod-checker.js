//todo: sort by date, use latest per submodule, count updates per submodule

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

$(function() {
  var regexp = /diff --git a\/(.*?)\sb\/(?:.*?\n){4,5}@@\s(.*?)\s(.*?)\s@@(?:.*?\n){1,2}\+Subproject commit (.*?)\s/g;
      commits_url = $('#pr-menu-commits').attr('href'),
      list = [],
      deferreds = [],
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

  $.get(commits_url, function(commits_html) {
    
    $(commits_html).find('.hash.execute').each(function(i) {
      var url = $(this).attr('href') + '/raw';
      deferreds.push(
        $.get(url, function(commit_raw) {
          while ((match = regexp.exec(commit_raw)) != null) {
            var data = match.slice(1);
            if (list[data[0]] === undefined) {
              list[data[0]] = [];
            }
            list[data[0]].push(data);
          }
        })
      );
    });

    $.when.apply($, deferreds).then(function() {
      var checkExist = setInterval(function() {
        if ($('#pullrequest-diff').length) {
          clearInterval(checkExist);
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
        }
      });
    });
  });
});