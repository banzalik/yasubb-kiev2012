BEM.DOM.decl('b-gallery', {

    onSetMod : {

        'image' : function() {

            var _this = this;

            _this.afterCurrentEvent(function(){
                var modVal = _this.getMod('image');

                var data='<a target="_blank" class="mrc__plugin_like_button b-social__share" href="http://connect.mail.ru/share?url='+encodeURI(_this.params.links[modVal])+'&amp;title='+encodeURI('Фото дня на Яндекс.Фотках')+'&amp;description='+encodeURI('Очень красивая фото на Яндекс.Фотках')+'">Нравится</a>';

                $('.b-social__like').html(data);

            });


        }
    }

});
