BEM.DOM.decl('b-gallery', {

    onSetMod : {

        'image' : function() {

            var _this = this;

            _this.afterCurrentEvent(function(){
                var modVal = _this.getMod('image');

                var data =  '<a class="b-social__share" target="_blank" href="https://www.facebook.com/sharer.php?u=' +
                            encodeURI(_this.params.links[modVal])+
                            '&t='+encodeURI('Красивое фото дня на Яндекс.Фотках')+'">Поделиться</a>';

                $('.b-social__like').html(data);

            });


        }
    }

});
