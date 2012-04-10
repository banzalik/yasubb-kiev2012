BEM.DOM.decl('b-gallery', {

    onSetMod : {

        js : function() {
            // инициализация блока, аналог $(document).ready()

            var countPhotos = this.params.size,   // сколько фоток загружать, не больше 100
                rss = this.params.rss, // откуда брать поток
                gWidth = this.params.gWidth, // ширина галереи
                gHeight = this.params.gHeight, // высота галереи
                html = '<div class="fotorama b-fotorama">';

            // инициализация  media rss
            $.xmlns["media"] = "http://search.yahoo.com/mrss";

            // загрука и парсинг данных
            $.get(rss, function(data) {

                $(data).find('item').each(function(index){

                    if (index < countPhotos) {

                        var raw = $(this).find("media|thumbnail").attr('url').substr(5,999), // обрезаем http:, для того, что бы работало c htpps
                            link = $(this).find('link').text(),
                            author = $(this).find('author').text(),
                            alt = "Автор на Яндекс.Фотках: <a href="+link+" class=b-author target=_blank>"+author+"</a>"; // формируем ссылку на автора фотки

                        if ( raw && ( raw.indexOf('null') < 0 ) ) {
                            raw = raw.substr(0,(raw.length-1));
                            html += '<a href="'+raw+'XL"><img src="'+raw+'XS" alt="'+alt+'" /></a>';
                        }

                    }

                });

                html += '</div>';

                $('.b-gallery').html(html);

                $('.b-fotorama').fotorama({
                    width: gWidth,
                    height: gHeight,
                    caption: 'simple',
                    loop: true
                });

            }, "xml");

        }

    },

    getDefaultParams : function() {

        return {
            size: '30',             // сколько фотографий показывать
            rss: '/rss/rss.xml',    // путь к RSS потоку
            gWidth: '800',          // ширина слайдера
            gHeight: '520'          // высота слайдера
        };

    }

});
