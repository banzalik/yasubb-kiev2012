({
    block: 'b-page',
    title: 'Фото дня на Яндекс.Фотках',
    head: [
        { elem: 'css', url: '_index.css'},
        { block: 'i-jquery', elem: 'core' },
        { block: 'b-social', elem: 'js' },
        { elem: 'js', url: '_index.js' }
    ],
    content: [{
        block: 'b-gallery',
        content: {
            block: 'b-fotorama',
            elem: 'preloader',
            content: 'Загрузка данных...'
        }
    },{
        block: 'b-social'
    },{
        block: 'i-metrika'
    }]
})
