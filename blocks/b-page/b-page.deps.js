({
    mustDeps:[
        {
            block:'i-bem',
            elem:'dom',
            mods:{'init':'auto'}
        },
        {
            block:'b-fotorama'
        }, // подключаем fotarama.js
        {
            block:'i-jquery',
            elem:'xmlns'
        }, // подключаем плагин для jQuery, умеющий работать с xmlns, нужен для работы с RSS файлами Яндекс.Фоток
        {
            block:'b-page',
            elem:'body'
        }
    ],
    shouldDeps:[
    ]
})
