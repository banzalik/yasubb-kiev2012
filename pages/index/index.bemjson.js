({
    block: 'b-page',
    title: 'Фото дня на Яндекс.Фотках',
    head: [
        { elem: 'css', url: 'index.css'},
        { elem: 'css', url: 'index.ie.css', ie: 'lt IE 8' },
        { block: 'i-jquery', elem: 'core' },
        { elem: 'js', url: 'index.js' }
    ],
    content: {
        block: 'b-gallery',
        content: {
            block: 'b-fotorama',
            elem: 'preloader',
            content: 'Подожидте. Идет загрузка данных...'
        }
    }
})
