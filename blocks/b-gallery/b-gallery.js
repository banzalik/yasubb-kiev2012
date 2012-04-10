BEM.DOM.decl('b-gallery', {

    onSetMod : {

        js : function() {
            // инициализация блока, аналог $(document).ready()

            var countPhotos = this.params.size,   // сколько фоток загружать, не больше 100
                rss = this.params.rss, // откуда брать поток
                gWidth = this.params.gWidth, // ширина галереи
                gHeight = this.params.gHeight, // высота галереи
                html = '<div class="fotorama" data-width="'+gWidth+'" data-height="'+gHeight+'">';

            // инициализация  media rss
            $.xmlns["media"] = "http://search.yahoo.com/mrss";

            // загрука и парсинг данных
            $.get(rss, function(data) {

                $(data).find('item').each(function(index){

                    if (index < countPhotos) {

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
                    width: gWidth,
                    height: gHeight
                });

            }, "xml");

        }

    }

});
