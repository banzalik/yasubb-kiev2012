#Фото дня на Яндекс.Фотках

Приложение "Фото дня на Яндекс.Фотках".

Показывает последние 30 Фото дня на сервисе [Яндекс.Фотки](http://fotki.yandex.ru/).

##Мимикрия
Приложение имеет 4 состояния:

 * [pages/index/index.html](/tree/master/pages/index/index.html) - состояние ядра, доступна ббазовая функциональность просмотра фото ;
 * [pages-fb/index/index.html](/tree/master/pages/index/index.html) - состояние мимикрии под Facebook, отличается от ядра внешним видом, содержит в себе дополнительную функциональность - возможность "шарить" понравивщуюся фотографию друзьям ;
 * [pages-vk/index/index.html](/tree/master/pages/index/index.html) - состояние мимикрии под Vkontakte, отличается от ядра внешним видом, осноной фон приложения сделан серым цветом, содержит в себе дополнительную функциональность - возможность "лайкнуть" понравивщуюся фотографию друзьям, использует для этого JS API Vkontakte;
 * [pages-mr/index/index.html](/tree/master/pages/index/index.html) - состояние мимикрии под Мой Мир, отличается от ядра внешним видом, содержит в себе дополнительную функциональность - возможность "показать" понравивщуюся фотографию друзьям, для кнопки-лайка используется CDN Mail.ru.

##Структура проекта

###Уровни переопределения
 
На проекте используется 5 уровней переопределения - их можно считать исходным кодом:

  * [bem-bl](https://github.com/bem/bem-bl) - библиотека блоков от Яндекса;
  * [blocks](/tree/master/blocks/) - базовый уровень переопределения, его достаточно для сборки ядра;
  * [blocks-fb](/tree/master/blocks-fb/) - уровень переопределения для Facebook, в нем переопределяется и доопределеяется поведение приложения в Facebook;
  * [blocks-vk](/tree/master/blocks-vk/) - уровень переопределения для Vkontakte, в нем переопределяется и доопределеяется поведение приложения во Vkontakte, инициализируется и используется API Vkontakte;
  * [blocks-mr](/tree/master/blocks-mr/) - уровень переопределения для Vkontakte, в нем переопределяется и доопределеяется поведение приложения в Моём Мире, инициализируется и используется API Maii.ru;

###Сборка файлов

Сборка проекта происходит с помощью make файла.
Что делает make файл?

 * подключает и обновляет на проекте `bem-bl`;
 * собирает HTML из `*.bemjosn,js` и `*.bemhtml` файлов -> `index.html`;
 * собирает CSS в один файл -> `index.css`;
 * собирает JS в один файл -> `index.js`;
 * оптимизирует и минимизирует CSS -> `_index.css`;
 * минимизирует JS -> `_index.js`.

Команды, доступные в make:

 * `make -B` - обновить `bem-bl` и собрать проект полностью со всеми состояниями;
 * `make fb -B` - собрать приложение для Facebook;
 * `make vk -B` - собрать приложение для Vkontakte;
 * `make mr -B` - собрать приложение для Мои Мир.


##Используемые технологии

 * [bem-tools](https://github.com/bem/bem-tools) - инструменты для работы с файлами, написанными по [БЭМ-методу](http://bem.github.com/bem-method/pages/beginning/beginning.en.html);
 * [bem-bl](https://github.com/bem/bem-bl) - библиотека блоков от Яндекса;
 * [Fotorama](http://fotoramajs.com/) - javascript галерея, на базе которой построено приложение;
 * [CSSO](http://github.com/afelix/csso) - CSS оптимизатор и минификатор;
 * [borschik](http://github.com/veged/borschik) - сборщик CSS и JS файлов в один;
 * [UglifyJS](http://github.com/mishoo/UglifyJS) - минификатор JS.