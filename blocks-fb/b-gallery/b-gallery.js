BEM.DOM.decl('b-gallery', {

    onSetMod : {

        'image' : function() {

            var _this = this;

            _this.afterCurrentEvent(function(){
                var modVal = _this.getMod('image');

                var data='<div class="fb-like" data-href="'+_this.params.links[modVal]+'" data-send="false" data-width="450" data-show-faces="false"></div>';

                $('.b-social__like').html(data);

                FB.init({
                    appId      : '307637845974060',
                    status     : true,
                    cookie     : true,
                    xfbml      : true,
                    oauth      : true
                });

            });


        }
    }

});
