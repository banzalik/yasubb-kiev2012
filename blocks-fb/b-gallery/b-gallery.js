BEM.DOM.decl('b-gallery', {

    onSetMod : {

        'image' : function() {

            var _this = this;

            _this.afterCurrentEvent(function(){
                var modVal = _this.getMod('image');

                console.log('modVal', modVal );
                console.log('url', _this.params.links[modVal]);

            });


        }
    }

});
