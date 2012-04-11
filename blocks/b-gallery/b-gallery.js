BEM.DOM.decl('b-gallery', {

    onSetMod : {

        js : function() {
            // инициализация блока, аналог $(document).ready()

            var _this = this,
                countPhotos = _this.params.size,   // сколько фоток загружать, не больше 100
                rss = _this.params.rss, // откуда брать поток
                gWidth = _this.params.gWidth, // ширина галереи
                gHeight = _this.params.gHeight, // высота галереи
                photos = [],
                links = [],
                thumbs = [];


            // загрука и парсинг данных
            $.get(rss, function(data) {

                // инициализация  media rss
                $.xmlns["media"] = "http://search.yahoo.com/mrss";

                $(data).find('item').each(function(index){

                    if (index < countPhotos) {

                        var raw = $(this).find("media|thumbnail").attr('url').substr(5,999), // обрезаем http:, для того, что бы работало c htpps
                            link = $(this).find('link').text(),
                            author = $(this).find('author').text(),
                            alt = "Автор на Яндекс.Фотках: <a href="+link+" class=b-author target=_blank>"+author+"</a>",// формируем ссылку на автора фотки
                            photo= {};

                            photo.caption = alt;


                        if ( raw && ( raw.indexOf('null') < 0 ) ) {
                            raw = raw.substr(0,(raw.length-1));
                            photo.img =  raw+'XL';
                            photo.full =  raw+'XXL';
                            photo.thumb =  raw+'XS';

                            photos.push(photo);
                            links.push(link);
                            thumbs.push(photo.thumb);
                        }

                    }

                });

                _this.params.photos = photos;
                _this.params.links = links;
                _this.params.thumbs = thumbs;

                $('.b-gallery').html('<div class="fotorama b-fotorama"></div>');

                $('.b-fotorama').fotorama({
                    width: gWidth,
                    height: gHeight,
                    caption: 'simple',
                    loop: true,
                    data: _this.params.photos,
                    onSlideStop: function(data, auto) {
                        _this.setMod('image',data.index); // устанавливаем модификатор при смене картинки
                    }
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
