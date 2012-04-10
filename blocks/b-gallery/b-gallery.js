BEM.DOM.decl('b-gallery', {

    onSetMod : {

        js : function() {

            // инициализация  media rss
            $.xmlns["media"] = "http://search.yahoo.com/mrss";

            var html = '<div class="fotorama" data-width="800" data-height="520">';

            // загрука и парсинг данных
            $.get("/rss/rss.xml", function(data) {

                $(data).find('item').each(function(index){

                    if (index < 30) {

                        var raw = $(this).find("media|thumbnail").attr('url'),
                            title = $(this).find('title').text();

                        if ( raw && ( raw.indexOf('null') < 0 ) ) {
                            raw = raw.substr(0,(raw.length-1));
                            html += '<a href="'+raw+'XL"><img src="'+raw+'XS" alt="'+title+'" /></a>';
                        }

                    }

                });

                html += '</div>';

                $('.b-gallery').html(html);
                $('.fotorama').fotorama({
                    width: 800,
                    height: 520
                });

            }, "xml");

        }

    }

});
