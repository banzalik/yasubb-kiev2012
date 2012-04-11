BEM.DOM.decl('b-gallery', {

    onSetMod : {

        'image' : function() {

            var _this = this;

            _this.afterCurrentEvent(function(){
                var modVal = _this.getMod('image');

                var data='<div id="vk_like"></div>';

                $('.b-social__like').html(data);

                VK.Widgets.Like('vk_like',{ pageUrl: _this.params.links[modVal], pageImage: "http:"+_this.params.thumbs[modVal], type: "button", pageDescription: 'Очень красивая фотография на Яндекс.Фотках' });

            });


        }
    }

});
