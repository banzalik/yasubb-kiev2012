({
    block: 'b-page',
    title: 'Фото дня на Яндекс.Фотках',
    head: [
        { elem: 'css', url: 'index.css'},
        { block: 'i-jquery', elem: 'core' },
        { block: 'b-social', elem: 'js' },
        { elem: 'js', url: 'index.js' }
    ],
    content: [{
        block: 'b-gallery',
        content: {
            block: 'b-fotorama',
            elem: 'preloader',
            content: 'Подожидте. Идет загрузка данных...'
        }
    },{
        block: 'b-social'
    }]
})
