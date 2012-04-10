/* ../../bem-bl/blocks-common/i-jquery/__inherit/i-jquery__inherit.js: begin */ /**/
/**
 * Inheritance plugin
 *
 * Copyright (c) 2010 Filatov Dmitry (dfilatov@yandex-team.ru)
 * Dual licensed under the MIT and GPL licenses:
 * http://www.opensource.org/licenses/mit-license.php
 * http://www.gnu.org/licenses/gpl.html
 *
 * @version 1.3.3
 */

(function($) {

var hasIntrospection = (function(){_}).toString().indexOf('_') > -1,
    needCheckProps = $.browser.msie, // fucking ie hasn't toString, valueOf in for
    specProps = needCheckProps? ['toString', 'valueOf'] : null,
    emptyBase = function() {};

function override(base, result, add) {

    var hasSpecProps = false;
    if(needCheckProps) {
        var addList = [];
        $.each(specProps, function() {
            add.hasOwnProperty(this) && (hasSpecProps = true) && addList.push({
                name : this,
                val  : add[this]
            });
        });
        if(hasSpecProps) {
            $.each(add, function(name) {
                addList.push({
                    name : name,
                    val  : this
                });
            });
            add = addList;
        }
    }

    $.each(add, function(name, prop) {
        if(hasSpecProps) {
            name = prop.name;
            prop = prop.val;
        }
        if($.isFunction(prop) &&
           (!hasIntrospection || prop.toString().indexOf('.__base') > -1)) {

            var baseMethod = base[name] || function() {};
            result[name] = function() {
                var baseSaved = this.__base;
                this.__base = baseMethod;
                var result = prop.apply(this, arguments);
                this.__base = baseSaved;
                return result;
            };

        }
        else {
            result[name] = prop;
        }

    });

}

$.inherit = function() {

    var args = arguments,
        hasBase = $.isFunction(args[0]),
        base = hasBase? args[0] : emptyBase,
        props = args[hasBase? 1 : 0] || {},
        staticProps = args[hasBase? 2 : 1],
        result = props.__constructor || (hasBase && base.prototype.__constructor)?
            function() {
                return this.__constructor.apply(this, arguments);
            } : function() {};

    if(!hasBase) {
        result.prototype = props;
        result.prototype.__self = result.prototype.constructor = result;
        return $.extend(result, staticProps);
    }

    $.extend(result, base);

    var inheritance = function() {},
        basePtp = inheritance.prototype = base.prototype,
        resultPtp = result.prototype = new inheritance();

    resultPtp.__self = resultPtp.constructor = result;

    override(basePtp, resultPtp, props);
    staticProps && override(base, result, staticProps);

    return result;

};

$.inheritSelf = function(base, props, staticProps) {

    var basePtp = base.prototype;

    override(basePtp, basePtp, props);
    staticProps && override(base, base, staticProps);

    return base;

};

})(jQuery);
/* ../../bem-bl/blocks-common/i-jquery/__inherit/i-jquery__inherit.js: end */ /**/

/* ../../bem-bl/blocks-common/i-jquery/__identify/i-jquery__identify.js: begin */ /**/
/**
 * Identify plugin
 *
 * @version 1.0.0
 */

(function($) {

var counter = 0,
    expando = '__' + (+new Date),
    get = function() {
        return 'uniq' + ++counter;
    };

/**
 * Уникализатор
 * @param {Object} [obj] объект, который нужно идентифицировать
 * @param {Boolean} [onlyGet=false] возвращать уникальное значение, только если оно уже до этого было присвоено
 * @returns {String} идентификатор
 */
$.identify = function(obj, onlyGet) {

    if(!obj) return get();

    var key = 'uniqueID' in obj? 'uniqueID' : expando; // используем, по возможности. нативный uniqueID для элементов в IE

    return onlyGet || key in obj?
        obj[key] :
        obj[key] = get();

};

})(jQuery);
/* ../../bem-bl/blocks-common/i-jquery/__identify/i-jquery__identify.js: end */ /**/

/* ../../bem-bl/blocks-common/i-jquery/__is-empty-object/i-jquery__is-empty-object.js: begin */ /**/
(function($) {

$.isEmptyObject || ($.isEmptyObject = function(obj) {
        for(var i in obj) return false;
        return true;
    });

})(jQuery);

/* ../../bem-bl/blocks-common/i-jquery/__is-empty-object/i-jquery__is-empty-object.js: end */ /**/

/* ../../bem-bl/blocks-common/i-jquery/__debounce/i-jquery__debounce.js: begin */ /**/
/**
 * Debounce and throttle function's decorator plugin 1.0.6
 *
 * Copyright (c) 2009 Filatov Dmitry (alpha@zforms.ru)
 * Dual licensed under the MIT and GPL licenses:
 * http://www.opensource.org/licenses/mit-license.php
 * http://www.gnu.org/licenses/gpl.html
 *
 */

(function($) {

$.extend({

    debounce : function(fn, timeout, invokeAsap, ctx) {

        if(arguments.length == 3 && typeof invokeAsap != 'boolean') {
            ctx = invokeAsap;
            invokeAsap = false;
        }

        var timer;

        return function() {

            var args = arguments;
            ctx = ctx || this;

            invokeAsap && !timer && fn.apply(ctx, args);

            clearTimeout(timer);

            timer = setTimeout(function() {
                invokeAsap || fn.apply(ctx, args);
                timer = null;
            }, timeout);

        };

    },

    throttle : function(fn, timeout, ctx) {

        var timer, args, needInvoke;

        return function() {

            args = arguments;
            needInvoke = true;
            ctx = ctx || this;

            timer || (function() {
                if(needInvoke) {
                    fn.apply(ctx, args);
                    needInvoke = false;
                    timer = setTimeout(arguments.callee, timeout);
                }
                else {
                    timer = null;
                }
            })();

        };

    }

});

})(jQuery);
/* ../../bem-bl/blocks-common/i-jquery/__debounce/i-jquery__debounce.js: end */ /**/

/* ../../bem-bl/blocks-common/i-jquery/__observable/i-jquery__observable.js: begin */ /**/
/**
 * Observable plugin
 *
 * Copyright (c) 2010 Filatov Dmitry (alpha@zforms.ru)
 * Dual licensed under the MIT and GPL licenses:
 * http://www.opensource.org/licenses/mit-license.php
 * http://www.gnu.org/licenses/gpl.html
 *
 * @version 1.0.0
 * @requires $.identify
 * @requires $.inherit
 */

(function($) {

var storageExpando = '__' + +new Date + 'storage',
    getFnId = function(fn, ctx) {
        return $.identify(fn) + (ctx? $.identify(ctx) : '');
    },
    Observable = /** @lends $.observable.prototype */{

        /**
         * Строит полное имя события
         * @protected
         * @param {String} e тип события
         * @returns {String}
         */
        buildEventName : function(e) {

            return e;

        },

        /**
         * Добавление обработчика события
         * @param {String} e тип события
         * @param {Object} [data] дополнительные данные, приходящие в обработчик как e.data
         * @param {Function} fn обработчик
         * @param {Object} [ctx] контекст обработчика
         * @returns {$.observable}
         */
        on : function(e, data, fn, ctx, _special) {

            if(typeof e == 'string') {
                if($.isFunction(data)) {
                    ctx = fn;
                    fn = data;
                    data = undefined;
                }

                var id = getFnId(fn, ctx),
                    storage = this[storageExpando] || (this[storageExpando] = {}),
                    eList = e.split(' '),
                    i = 0,
                    eStorage;

                while(e = eList[i++]) {
                    e = this.buildEventName(e);
                    eStorage = storage[e] || (storage[e] = { ids : {}, list : {} });

                    if(!(id in eStorage.ids)) {
                        var list = eStorage.list,
                            item = { fn : fn, data : data, ctx : ctx, special : _special };
                        if(list.last) {
                            list.last.next = item;
                            item.prev = list.last;
                        } else {
                            list.first = item;
                        }

                        eStorage.ids[id] = list.last = item;
                    }
                }
            } else {
                var _this = this;
                $.each(e, function(e, fn) {
                    _this.on(e, fn, data, _special);
                });
            }

            return this;

        },

        onFirst : function(e, data, fn, ctx) {

            return this.on(e, data, fn, ctx, { one : true });

        },

        /**
         * Удаление обработчика/обработчиков события
         * @param {String} [e] тип события
         * @param {Function} [fn] обработчик
         * @param {Object} [ctx] контекст обработчика
         * @returns {$.observable}
         */
        un : function(e, fn, ctx) {

            if(typeof e == 'string' || typeof e == 'undefined') {
                var storage = this[storageExpando];
                if(storage) {
                    if(e) { // если передан тип события
                        var eList = e.split(' '),
                            i = 0,
                            eStorage;
                        while(e = eList[i++]) {
                            e = this.buildEventName(e);
                            if(eStorage = storage[e]) {
                                if(fn) {  // если передан конкретный обработчик
                                    var id = getFnId(fn, ctx),
                                        ids = eStorage.ids;
                                    if(id in ids) {
                                        var list = eStorage.list,
                                            item = ids[id],
                                            prev = item.prev,
                                            next = item.next;

                                        if(prev) {
                                            prev.next = next;
                                        }
                                        else if(item === list.first) {
                                            list.first = next;
                                        }

                                        if(next) {
                                            next.prev = prev;
                                        }
                                        else if(item === list.last) {
                                            list.last = prev;
                                        }

                                        delete ids[id];
                                    }
                                } else {
                                    delete this[storageExpando][e];
                                }
                            }
                        }
                    } else {
                        delete this[storageExpando];
                    }
                }
            } else {
                var _this = this;
                $.each(e, function(e, fn) {
                    _this.un(e, fn, ctx);
                });
            }

            return this;

        },

        /**
         * Запускает обработчики события
         * @param {String|$.Event} e событие
         * @param {Object} [data] дополнительные данные
         * @returns {$.observable}
         */
        trigger : function(e, data) {

            var _this = this,
                storage = _this[storageExpando],
                rawType;

            typeof e === 'string'?
                e = $.Event(_this.buildEventName(rawType = e)) :
                e.type = _this.buildEventName(rawType = e.type);

            e.target || (e.target = _this);

            if(storage && (storage = storage[e.type])) {
                var item = storage.list.first,
                    ret;
                while(item) {
                    e.data = item.data;
                    ret = item.fn.call(item.ctx || _this, e, data);
                    if(typeof ret !== 'undefined') {
                        e.result = ret;
                        if(ret === false) {
                            e.preventDefault();
                            e.stopPropagation();
                        }
                    }

                    item.special && item.special.one &&
                        _this.un(rawType, item.fn, item.ctx);
                    item = item.next;
                }
            }

            return this;

        }

    };

$.observable = $.inherit(Observable, Observable);

})(jQuery);
/* ../../bem-bl/blocks-common/i-jquery/__observable/i-jquery__observable.js: end */ /**/

/* ../../bem-bl/blocks-common/i-bem/i-bem.js: begin */ /**/
/** @requires jquery.inherit */
/** @requires jquery.isEmptyObject */
/** @requires jquery.identify */
/** @requires jquery.observable */

(function($, undefined) {

/**
 * Хранилище для отложенных функций
 * @private
 * @type Array
 */
var afterCurrentEventFns = [],

/**
 * Хранилище деклараций блоков (хэш по имени блока)
 * @private
 * @type Object
 */
    blocks = {},

/**
 * Каналы сообщений
 * @static
 * @private
 * @type Object
 */
    channels = {};

/**
 * Строит имя метода-обработчика установки модификатора
 * @static
 * @private
 * @param {String} elemName имя элемента
 * @param {String} modName имя модификатора
 * @param {String} modVal значение модификатора
 * @returns {String}
 */
function buildModFnName(elemName, modName, modVal) {

    return (elemName? '__elem_' + elemName : '') +
           '__mod' +
           (modName? '_' + modName : '') +
           (modVal? '_' + modVal : '');

}

/**
 * Преобразует хэш обработчиков модификаторов в методы
 * @static
 * @private
 * @param {Object} modFns
 * @param {Object} props
 * @param {String} [elemName]
 */
function modFnsToProps(modFns, props, elemName) {

    $.isFunction(modFns)?
        (props[buildModFnName(elemName, '*', '*')] = modFns) :
        $.each(modFns, function(modName, modFn) {
            $.isFunction(modFn)?
                (props[buildModFnName(elemName, modName, '*')] = modFn) :
                $.each(modFn, function(modVal, modFn) {
                    props[buildModFnName(elemName, modName, modVal)] = modFn;
                });
        });

}

/** @namespace */
this.BEM = $.inherit($.observable, /** @lends BEM.prototype */ {

    /**
     * @class Базовый блок для создания bem-блоков
     * @constructs
     * @private
     * @param {Object} mods модификаторы блока
     * @param {Object} params параметры блока
     * @param {Boolean} [initImmediately=true]
     */
    __constructor : function(mods, params, initImmediately) {

        var _this = this;

        /**
         * кэш модификаторов блока
         * @private
         * @type Object
         */
        _this._modCache = mods || {};

        /**
         * текущие модификаторы в стэке установки
         * @private
         * @type Object
         */
        _this._processingMods = {};

        /**
         * параметры блока с учетом дефолтных
         * @protected
         * @type Object
         */
        _this.params = $.extend(_this.getDefaultParams(), params);

        initImmediately !== false?
            _this._init() :
            _this.afterCurrentEvent(_this._init);

    },

    /**
     * Инициализирует блок
     * @private
     */
    _init : function() {

        return this
            .setMod('js', 'inited')
            .trigger('init');

    },

    /**
     * Изменяет контекст передаваемой функции
     * @protected
     * @param {Function} fn
     * @param {Object} [ctx=this] контекст
     * @returns {Function} функция с измененным контекстом
     */
    changeThis : function(fn, ctx) {

        return fn.bind(ctx || this);

    },

    /**
     * Выполняет функцию в контексте блока после "текущего события"
     * @protected
     * @param {Function} fn
     * @param {Object} [ctx] контекст
     */
    afterCurrentEvent : function(fn, ctx) {

        this.__self.afterCurrentEvent(this.changeThis(fn, ctx));

    },

    /**
     * Запускает обработчики события у блока и обработчики live-событий
     * @protected
     * @param {String} e имя события
     * @param {Object} [data] дополнительные данные
     * @returns {BEM}
     */
    trigger : function(e, data) {

        this
            .__base(e = this.buildEvent(e), data)
            .__self.trigger(e, data);

        return this;

    },

    buildEvent : function(e) {

        typeof e == 'string' && (e = $.Event(e));
        e.block = this;

        return e;

    },

    /**
     * Проверят наличие модификатора у блока/вложенного элемента
     * @protected
     * @param {Object} [elem] вложенный элемент
     * @param {String} modName имя модификатора
     * @param {String} [modVal] значение модификатора
     * @returns {Boolean}
     */
    hasMod : function(elem, modName, modVal) {

        var len = arguments.length,
            invert = false;

        if(len == 1) {
            modVal = '';
            modName = elem;
            elem = undefined;
            invert = true;
        }
        else if(len == 2) {
            if(typeof elem == 'string') {
                modVal = modName;
                modName = elem;
                elem = undefined;
            }
            else {
                modVal = '';
                invert = true;
            }
        }

        var res = this.getMod(elem, modName) === modVal;
        return invert? !res : res;

    },

    /**
     * Возвращает значение модификатора блока/вложенного элемента
     * @protected
     * @param {Object} [elem] вложенный элемент
     * @param {String} modName имя модификатора
     * @returns {String} значение модификатора
     */
    getMod : function(elem, modName) {

        var type = typeof elem;
        if(type === 'string' || type === 'undefined') { // elem либо отсутствует, либо undefined
            modName = elem || modName;
            var modCache = this._modCache;
            return modName in modCache?
                modCache[modName] :
                modCache[modName] = this._extractModVal(modName);
        }

        return this._getElemMod(modName, elem);

    },

    /**
     * Возвращает значение модификатора вложенного элемента
     * @private
     * @param {String} modName имя модификатора
     * @param {Object} elem вложенный элемент
     * @param {Object} [elem] имя вложенного элемента
     * @returns {String} значение модификатора
     */
    _getElemMod : function(modName, elem, elemName) {

        return this._extractModVal(modName, elem, elemName);

    },

    /**
     * Возвращает значения модификаторов блока/вложенного элемента
     * @protected
     * @param {Object} [elem] вложенный элемент
     * @param {String} [modName1, ..., modNameN] имена модификаторов
     * @returns {Object} значения модификаторов в виде хэша
     */
    getMods : function(elem) {

        var hasElem = elem && typeof elem != 'string',
            _this = this,
            modNames = [].slice.call(arguments, hasElem? 1 : 0),
            res = _this._extractMods(modNames, hasElem? elem : undefined);

        if(!hasElem) { // кэшируем
            modNames.length?
                modNames.forEach(function(name) {
                    _this._modCache[name] = res[name];
                }):
                _this._modCache = res;
        }

        return res;

    },

    /**
     * Устанавливает модификатор у блока/вложенного элемента
     * @protected
     * @param {Object} [elem] вложенный элемент
     * @param {String} modName имя модификатора
     * @param {String} modVal значение модификатора
     * @returns {BEM}
     */
    setMod : function(elem, modName, modVal) {

        if(typeof modVal == 'undefined') {
            modVal = modName;
            modName = elem;
            elem = undefined;
        }

        var _this = this;

        if(!elem || elem[0]) {

            var modId = (elem && elem[0]? $.identify(elem[0]) : '') + '_' + modName;

            if(this._processingMods[modId]) return _this;

            var elemName,
                currentModVal = elem?
                    _this._getElemMod(modName, elem, elemName = _this.__self._extractElemNameFrom(elem)) :
                    _this.getMod(modName);

            if(currentModVal === modVal) return _this;

            this._processingMods[modId] = true;

            var needSetMod = true,
                modFnParams = [modName, modVal, currentModVal];

            elem && modFnParams.unshift(elem);

            [['*', '*'], [modName, '*'], [modName, modVal]].forEach(function(mod) {
                needSetMod = _this._callModFn(elemName, mod[0], mod[1], modFnParams) !== false && needSetMod;
            });

            !elem && needSetMod && (_this._modCache[modName] = modVal);

            needSetMod && _this._afterSetMod(modName, modVal, elem, elemName);

            delete this._processingMods[modId];
        }

        return _this;

    },

    /**
     * Функция после успешного изменения модификатора у блока/вложенного элемента
     * @protected
     * @param {String} modName имя модификатора
     * @param {String} modVal значение модификатора
     * @param {Object} [elem] вложенный элемент
     */
    _afterSetMod : function(modName, modVal, elem) {},

    /**
     * Устанавливает модификатор у блока/вложенного элемента в зависимости от условия.
     * Если передан параметр condition, то при true устанавливается modVal1, при false - modVal2,
     * если же condition не передан, то устанавливается modVal1, если установлен modVal2, и наоборот
     * @protected
     * @param {Object} [elem] вложенный элемент
     * @param {String} modName имя модификатора
     * @param {String} modVal1 первое значение модификатора
     * @param {String} [modVal2] второе значение модификатора
     * @param {Boolean} [condition] условие
     * @returns {BEM}
     */
    toggleMod : function(elem, modName, modVal1, modVal2, condition) {

        if(typeof elem == 'string') { // если это блок
            condition = modVal2;
            modVal2 = modVal1;
            modVal1 = modName;
            modName = elem;
            elem = undefined;
        }
        if(typeof modVal2 == 'undefined') {
            modVal2 = '';
        } else if(typeof modVal2 == 'boolean') {
            condition = modVal2;
            modVal2 = '';
        }

        var modVal = this.getMod(elem, modName);
        (modVal == modVal1 || modVal == modVal2) &&
            this.setMod(
                elem,
                modName,
                typeof condition === 'boolean'?
                    (condition? modVal1 : modVal2) :
                    this.hasMod(elem, modName, modVal1)? modVal2 : modVal1);

        return this;

    },

    /**
     * Удаляет модификатор у блока/вложенного элемента
     * @protected
     * @param {Object} [elem] вложенный элемент
     * @param {String} modName имя модификатора
     * @returns {BEM}
     */
    delMod : function(elem, modName) {

        if(!modName) {
            modName = elem;
            elem = undefined;
        }

        return this.setMod(elem, modName, '');

    },

    /**
     * Выполняет обработчики установки модификаторов
     * @private
     * @param {String} elemName имя элемента
     * @param {String} modName имя модификатора
     * @param {String} modVal значение модификатора
     * @param {Array} modFnParams параметры обработчика
     */
    _callModFn : function(elemName, modName, modVal, modFnParams) {

        var modFnName = buildModFnName(elemName, modName, modVal);
        return this[modFnName]?
           this[modFnName].apply(this, modFnParams) :
           undefined;

    },

    /**
     * Извлекает значение модификатора
     * @private
     * @param {String} modName имя модификатора
     * @param {Object} [elem] элемент
     * @returns {String} значение модификатора
     */
    _extractModVal : function(modName, elem) {

        return '';

    },

    /**
     * Извлекает имя/значение списка модификаторов
     * @private
     * @param {Array} modNames имена модификаторов
     * @param {Object} [elem] элемент
     * @returns {Object} хэш значений модификаторов по имени
     */
    _extractMods : function(modNames, elem) {

        return {};

    },

    /**
     * Возвращает именованный канал сообщений
     * @param {String} [id='default'] идентификатор канала
     * @param {Boolean} [drop=false] уничтожить канал
     * @returns {$.observable|undefined} канал сообщений
     */
    channel : function(id, drop) {

        return this.__self.channel(id, drop);

    },

    /**
     * Возвращает дефолтные параметры блока
     * @returns {Object}
     */
    getDefaultParams : function() {

        return {};

    },

    /**
     * Хелпер для очистки свойств блока
     * @param {Object} [obj=this]
     */
    del : function(obj) {

        var args = [].slice.call(arguments);
        typeof obj == 'string' && args.unshift(this);
        this.__self.del.apply(this.__self, args);
        return this;

	},

    /**
     * Удаляет блок
     */
    destruct : function() {}

}, /** @lends BEM */{

    _name : 'i-bem',

    /**
     * Хранилище деклараций блоков (хэш по имени блока)
     * @static
     * @protected
     * @type Object
     */
    blocks : blocks,

    /**
     * Декларатор блоков, создает класс блока
     * @static
     * @protected
     * @param {String|Object} decl имя блока (простой синтаксис) или описание
     * @param {String} decl.block|decl.name имя блока
     * @param {String} [decl.baseBlock] имя родительского блока
     * @param {String} [decl.modName] имя модификатора
     * @param {String} [decl.modVal] значение модификатора
     * @param {Object} [props] методы
     * @param {Object} [staticProps] статические методы
     */
    decl : function(decl, props, staticProps) {

        if(typeof decl == 'string')
            decl = { block : decl };
        else if(decl.name) {
            decl.block = decl.name;
        }

        if(decl.baseBlock && !blocks[decl.baseBlock])
            throw('baseBlock "' + decl.baseBlock + '" for "' + decl.block + '" is undefined');

        props || (props = {});

        if(props.onSetMod) {
            modFnsToProps(props.onSetMod, props);
            delete props.onSetMod;
        }

        if(props.onElemSetMod) {
            $.each(props.onElemSetMod, function(elemName, modFns) {
                modFnsToProps(modFns, props, elemName);
            });
            delete props.onElemSetMod;
        }

        var baseBlock = blocks[decl.baseBlock || decl.block] || this;

        if(decl.modName) {
            $.each(props, function(name, prop) {
                $.isFunction(prop) &&
                    (props[name] = function() {
                        var method;
                        if(this.hasMod(decl.modName, decl.modVal)) {
                            method = prop;
                        } else {
                            var baseMethod = baseBlock.prototype[name];
                            baseMethod && baseMethod !== props[name] &&
                                (method = this.__base);
                        }
                        return method?
                            method.apply(this, arguments) :
                            undefined;
                    });
            });
        }

        var block;
        decl.block == baseBlock._name?
            // делаем новый live в том случае, если уже запускался старый
            (block = $.inheritSelf(baseBlock, props, staticProps))._processLive(true) :
            (block = blocks[decl.block] = $.inherit(baseBlock, props, staticProps))._name = decl.block;

        return block;

    },

    /**
     * Осуществляет обработку live-свойств блока
     * @private
     * @param {Boolean} [heedLive=false] нужно ли учитывать то, что блок обрабатывал уже свои live-свойства
     * @returns {Boolean} является ли блок live-блоком
     */
    _processLive : function(heedLive) {

        return false;

    },

    /**
     * Фабричный метод для создания экземпляра блока по имени
     * @static
     * @param {String|Object} block имя блока или описание
     * @param {Object} [params] параметры блока
     * @returns {BEM}
     */
    create : function(block, params) {

        typeof block == 'string' && (block = { block : block });

        return new blocks[block.block](block.mods, params);

    },

    /**
     * Возвращает имя текущего блока
     * @static
     * @protected
     * @returns {String}
     */
    getName : function() {

        return this._name;

    },

    /**
     * Извлекает имя вложенного в блок элемента
     * @static
     * @private
     * @param {Object} elem вложенный элемент
     * @returns {String|undefined}
     */
    _extractElemNameFrom : function(elem) {},

    /**
     * Добавляет функцию в очередь для запуска после "текущего события"
     * @static
     * @protected
     * @param {Function} fn
     * @param {Object} ctx
     */
    afterCurrentEvent : function(fn, ctx) {

        afterCurrentEventFns.push({ fn : fn, ctx : ctx }) == 1 &&
            setTimeout(this._runAfterCurrentEventFns, 0);

    },

    /**
     * Запускает очерель
     * @private
     */
    _runAfterCurrentEventFns : function() {

        var fnsLen = afterCurrentEventFns.length;
        if(fnsLen) {
            var fnObj,
                fnsCopy = afterCurrentEventFns.splice(0, fnsLen);

            while(fnObj = fnsCopy.shift()) fnObj.fn.call(fnObj.ctx || this);
        }

    },

    /**
     * Изменяет контекст передаваемой функции
     * @protected
     * @param {Function} fn
     * @param {Object} ctx контекст
     * @returns {Function} функция с измененным контекстом
     */
    changeThis : function(fn, ctx) {

        return fn.bind(ctx || this);

    },

    /**
     * Хелпер для очистки свойств
     * @param {Object} [obj=this]
     */
    del : function(obj) {

        var delInThis = typeof obj == 'string',
            i = delInThis? 0 : 1,
            len = arguments.length;
        delInThis && (obj = this);

        while(i < len) delete obj[arguments[i++]];

        return this;

	},

    /**
     * Возвращает/уничтожает именованный канал сообщений
     * @param {String} [id='default'] идентификатор канала
     * @param {Boolean} [drop=false] уничтожить канал
     * @returns {$.observable|undefined} канал сообщений
     */
    channel : function(id, drop) {

        if(typeof id == 'boolean') {
            drop = id;
            id = undefined;
        }

        id || (id = 'default');

        if(drop) {
            if(channels[id]) {
                channels[id].un();
                delete channels[id];
            }
            return;
        }

        return channels[id] || (channels[id] = new $.observable());

    }

});

})(jQuery);

/* ../../bem-bl/blocks-common/i-bem/i-bem.js: end */ /**/

/* ../../bem-bl/blocks-common/i-ecma/__object/i-ecma__object.js: begin */ /**/
(function() {

/**
 * Возвращает массив свойств объекта
 * @param {Object} obj объект
 * @returns {Array}
 */
Object.keys || (Object.keys = function(obj) {
    var res = [];

    for(var i in obj) obj.hasOwnProperty(i) &&
        res.push(i);

    return res;
});

})();
/* ../../bem-bl/blocks-common/i-ecma/__object/i-ecma__object.js: end */ /**/

/* ../../bem-bl/blocks-common/i-ecma/__array/i-ecma__array.js: begin */ /**/
(function() {

var ptp = Array.prototype,
    toStr = Object.prototype.toString,
    methods = {

        /**
         * Находит индекс элемента в массиве
         * @param {Object} item
         * @param {Number} [fromIdx] начиная с индекса (length - 1 - fromIdx, если fromIdx < 0)
         * @returns {Number} индекс элемента или -1, если не найдено
         */
        indexOf : function(item, fromIdx) {

            fromIdx = +(fromIdx || 0);

            var t = this, len = t.length;

            if(len > 0 && fromIdx < len) {
                fromIdx = fromIdx < 0? Math.ceil(fromIdx) : Math.floor(fromIdx);
                fromIdx < -len && (fromIdx = 0);
                fromIdx < 0 && (fromIdx = fromIdx + len);

                while(fromIdx < len) {
                    if(fromIdx in t && t[fromIdx] === item)
                        return fromIdx;
                    ++fromIdx;
                }
            }

            return -1;

        },

        /**
         * Вызывает callback для каждого элемента
         * @param {Function} callback вызывается для каждого элемента
         * @param {Object} [ctx=null] контекст для callback
         */
        forEach : function(callback, ctx) {

            var i = -1, t = this, len = t.length;
            while(++i < len) i in t &&
                (ctx? callback.call(ctx, t[i], i, t) : callback(t[i], i, t));

        },

        /**
         * Создает массив B из массива A, такой что B[i] = callback(A[i])
         * @param {Function} callback вызывается для каждого элемента
         * @param {Object} [ctx=null] контекст для callback
         * @returns {Array}
         */
        map : function(callback, ctx) {

            var i = -1, t = this, len = t.length,
                res = new Array(len);

            while(++i < len) i in t &&
                (res[i] = ctx? callback.call(ctx, t[i], i, t) : callback(t[i], i, t));

            return res;

        },

        /**
         * Создает массив, содержащий только те элементы из исходного массива, для которых callback возвращает true.
         * @param {Function} callback вызывается для каждого элемента
         * @param {Object} [ctx] контекст для callback
         * @returns {Array}
         */
        filter : function(callback, ctx) {

            var i = -1, t = this, len = t.length,
                res = [];

            while(++i < len) i in t &&
                (ctx? callback.call(ctx, t[i], i, t) : callback(t[i], i, t)) && res.push(t[i]);

            return res;

        },

        /**
         * Свертывает массив, используя аккумулятор
         * @param {Function} callback вызывается для каждого элемента
         * @param {Object} [initialVal] начальное значение аккумулятора
         * @returns {Object} аккумулятор
         */
        reduce : function(callback, initialVal) {

            var i = -1, t = this, len = t.length,
                res;

            if(arguments.length < 2) {
                while(++i < len) {
                    if(i in t) {
                        res = t[i];
                        break;
                    }
                }
            }
            else {
                res = initialVal;
            }

            while(++i < len) i in t &&
                (res = callback(res, t[i], i, t));

            return res;

        }

    };

for(var name in methods)
    ptp[name] || (ptp[name] = methods[name]);

Array.isArray || (Array.isArray = function(obj) {
    return toStr.call(obj) === '[object Array]';
});

})();
/* ../../bem-bl/blocks-common/i-ecma/__array/i-ecma__array.js: end */ /**/

/* ../../bem-bl/blocks-common/i-ecma/__function/i-ecma__function.js: begin */ /**/
(function() {

var slice = Array.prototype.slice;

Function.prototype.bind || (Function.prototype.bind = function(ctx) {

    var fn = this,
        args = slice.call(arguments, 1);

    return function () {
        return fn.apply(ctx, args.concat(slice.call(arguments)));
    }

});

})();
/* ../../bem-bl/blocks-common/i-ecma/__function/i-ecma__function.js: end */ /**/

/* ../../bem-bl/blocks-common/i-bem/__internal/i-bem__internal.js: begin */ /**/
/** @fileOverview модуль для внутренних BEM-хелперов */
/** @requires BEM */

(function(BEM, $, undefined) {

/**
 * Разделитель для модификаторов и их значений
 * @const
 * @type String
 */
var MOD_DELIM = '_',

/**
 * Разделитель между именами блока и вложенного элемента
 * @const
 * @type String
 */
    ELEM_DELIM = '__',

/**
 * Паттерн для допустимых имен элементов и модификаторов
 * @const
 * @type String
 */
    NAME_PATTERN = '[a-zA-Z0-9-]+';

function buildModPostfix(modName, modVal, buffer) {

    buffer.push(MOD_DELIM, modName, MOD_DELIM, modVal);

}

function buildBlockClass(name, modName, modVal, buffer) {

    buffer.push(name);
    modVal && buildModPostfix(modName, modVal, buffer);

}

function buildElemClass(block, name, modName, modVal, buffer) {

    buildBlockClass(block, undefined, undefined, buffer);
    buffer.push(ELEM_DELIM, name);
    modVal && buildModPostfix(modName, modVal, buffer);

}

BEM.INTERNAL = {

    NAME_PATTERN : NAME_PATTERN,

    MOD_DELIM : MOD_DELIM,
    ELEM_DELIM : ELEM_DELIM,

    buildModPostfix : function(modName, modVal, buffer) {

        var res = buffer || [];
        buildModPostfix(modName, modVal, res);
        return buffer? res : res.join('');

    },

    /**
     * Строит класс блока или элемента с учетом модификатора
     * @private
     * @param {String} block имя блока
     * @param {String} [elem] имя элемента
     * @param {String} [modName] имя модификатора
     * @param {String} [modVal] значение модификатора
     * @param {Array} [buffer] буфер
     * @returns {String|Array} строка класса или буфер (в зависимости от наличия параметра buffer)
     */
    buildClass : function(block, elem, modName, modVal, buffer) {

        var typeOf = typeof modName;
        if(typeOf == 'string') {
            if(typeof modVal != 'string') {
                buffer = modVal;
                modVal = modName;
                modName = elem;
                elem = undefined;
            }
        } else if(typeOf != 'undefined') {
            buffer = modName;
            modName = undefined;
        } else if(elem && typeof elem != 'string') {
            buffer = elem;
            elem = undefined;
        }

        if(!(elem || modName || buffer)) { // оптимизация для самого простого случая
            return block;
        }

        var res = buffer || [];

        elem?
            buildElemClass(block, elem, modName, modVal, res) :
            buildBlockClass(block, modName, modVal, res);

        return buffer? res : res.join('');

    },

    /**
     * Строит полные классы блока или элемента с учетом модификаторов
     * @private
     * @param {String} block имя блока
     * @param {String} [elem] имя элемента
     * @param {Object} [mods] модификаторы
     * @param {Array} [buffer] буфер
     * @returns {String|Array} строка класса или буфер (в зависимости от наличия параметра buffer)
     */
    buildClasses : function(block, elem, mods, buffer) {

        if(elem && typeof elem != 'string') {
            buffer = mods;
            mods = elem;
            elem = undefined;
        }

        var res = buffer || [];

        elem?
            buildElemClass(block, elem, undefined, undefined, res) :
            buildBlockClass(block, undefined, undefined, res);

        mods && $.each(mods, function(modName, modVal) {
            if(modVal) {
                res.push(' ');
                elem?
                    buildElemClass(block, elem, modName, modVal, res) :
                    buildBlockClass(block, modName, modVal, res);
            }
        });

        return buffer? res : res.join('');

        /*var typeOf = typeof elem;
        if(typeOf != 'string' && typeOf != 'undefined') {
            buffer = mods;
            mods = elem;
            elem = undefined;
        }
        if($.isArray(mods)) {
            buffer = mods;
            mods = undefined;
        }

        var res = buffer || [];
        buildClasses(block, elem, mods, res);
        return buffer? res : res.join('');*/

    }

}

})(BEM, jQuery);
/* ../../bem-bl/blocks-common/i-bem/__internal/i-bem__internal.js: end */ /**/

/* ../../bem-bl/blocks-common/i-bem/__dom/i-bem__dom.js: begin */ /**/
/** @requires BEM */
/** @requires BEM.INTERNAL */

(function(BEM, $, undefined) {

var win = $(window),
    doc = $(document),

/**
 * Хранилище для DOM-элементов по уникальному ключу
 * @private
 * @type Object
 */
    uniqIdToDomElems = {},

/**
 * Хранилище для блоков по уникальному ключу
 * @static
 * @private
 * @type Object
 */
    uniqIdToBlock = {},

/**
 * Хранилище для параметров блоков
 * @private
 * @type Object
 */
    domElemToParams = {},

/**
 * Хранилище для обработчиков liveCtx-событий
 * @private
 * @type Object
 */
    liveEventCtxStorage = {},

/**
 * Хранилище для обработчиков liveClass-событий
 * @private
 * @type Object
 */
    liveClassEventStorage = {},

    blocks = BEM.blocks,

    INTERNAL = BEM.INTERNAL,

    NAME_PATTERN = INTERNAL.NAME_PATTERN,

    MOD_DELIM = INTERNAL.MOD_DELIM,
    ELEM_DELIM = INTERNAL.ELEM_DELIM,

    buildModPostfix = INTERNAL.buildModPostfix,
    buildClass = INTERNAL.buildClass;

/**
 * Инициализирует блоки на DOM-элементе
 * @private
 * @param {jQuery} domElem DOM-элемент
 * @param {String} uniqInitId идентификатор "волны инициализации"
 */
function init(domElem, uniqInitId) {

    var domNode = domElem[0];
    $.each(getParams(domNode), function(blockName, params) {
        processParams(params, domNode, blockName, uniqInitId);
        var block = uniqIdToBlock[params.uniqId];
        if(block) {
            block.domElem = block.domElem.add(domElem);
            $.extend(block.params, params);
        } else {
            initBlock(blockName, domElem, params);
        }
    });

}

/**
 * Инициализирует конкретный блок на DOM-элементе или возвращает существующий блок, если он уже был создан
 * @private
 * @param {String} blockName имя блока
 * @param {jQuery} domElem DOM-элемент
 * @param {Object} [params] параметры инициализации
 * @param {Boolean} [forceLive] форсировать возможность live-инициализации
 * @param {Function} [callback] обработчик, вызываемый после полной инициализации
 */
function initBlock(blockName, domElem, params, forceLive, callback) {

    if(typeof params == 'boolean') {
        callback = forceLive;
        forceLive = params;
        params = undefined;
    }

    var domNode = domElem[0];
    params = processParams(params || getParams(domNode)[blockName], domNode, blockName);

    var uniqId = params.uniqId;
    if(uniqIdToBlock[uniqId]) {
        return uniqIdToBlock[uniqId]._init();
    }

    uniqIdToDomElems[uniqId] = uniqIdToDomElems[uniqId]?
        uniqIdToDomElems[uniqId].add(domElem) :
        domElem;

    var blockClass = blocks[blockName] || DOM.decl(blockName, {}, { live : true });
    if(!(blockClass._liveInitable = !!blockClass._processLive()) || forceLive || params.live === false) {
        var block = new blockClass(uniqIdToDomElems[uniqId], params, !!forceLive);
        delete uniqIdToDomElems[uniqId];
        callback && callback.apply(block, Array.prototype.slice.call(arguments, 4));
        return block;
    }

}

/**
 * Обрабатывает и добавляет необходимые параметры блока
 * @private
 * @param {Object} params параметры инициализации
 * @param {HTMLElement} domNode DOM-нода
 * @param {String} blockName имя блока
 * @param {String} [uniqInitId] идентификатор "волны инициализации"
 */
function processParams(params, domNode, blockName, uniqInitId) {

    (params || (params = {})).uniqId ||
        (params.uniqId = (params.id? blockName + '-id-' + params.id : $.identify()) + (uniqInitId || $.identify()));

    var domUniqId = $.identify(domNode),
        domParams = domElemToParams[domUniqId] || (domElemToParams[domUniqId] = {});

    domParams[blockName] || (domParams[blockName] = params);

    return params;

}

/**
 * Хелпер для поиска DOM-элемента по селектору внутри контекста, включая сам контекст
 * @private
 * @param {jQuery} ctx контекст
 * @param {String} selector CSS-селектор
 * @param {Boolean} [excludeSelf=false] исключить контекст из поиска
 * @returns {jQuery}
 */
function findDomElem(ctx, selector, excludeSelf) {

    var res = ctx.find(selector);
    return excludeSelf?
       res :
       res.add(ctx.filter(selector));

}

/**
 * Возвращает параметры DOM-элемента блока
 * @private
 * @param {HTMLElement} domNode DOM-нода
 * @returns {Object}
 */
function getParams(domNode) {

    var uniqId = $.identify(domNode);
    return domElemToParams[uniqId] ||
           (domElemToParams[uniqId] = extractParams(domNode));

}

/**
 * Извлекает параметры блока из DOM-элемента
 * @private
 * @param {HTMLElement} domNode DOM-нода
 * @returns {Object}
 */
function extractParams(domNode) {

    var fn = domNode.onclick || domNode.ondblclick;
    if(!fn && domNode.tagName.toLowerCase() == 'body') { // LEGO-2027 в FF onclick не работает на body
        var elem = $(domNode),
            attr = elem.attr('onclick') || elem.attr('ondblclick');
        attr && (fn = Function(attr));
    }
    return fn? fn() : {};

}

/**
 * Очищает все BEM-хранилища, связанные с DOM-нодой
 * @private
 * @param {HTMLElement} domNode DOM-нода
 */
function cleanupDomNode(domNode) {

    delete domElemToParams[$.identify(domNode)];

}

/**
 * Возвращает DOM-ноду для вычислений размера окна в IE
 * @returns {HTMLElement}
 */
function getClientNode() {

    return doc[0][$.support.boxModel? 'documentElement' : 'body'];

}

/**
 * Возвращает и, при необходимости, инициализирует блок на DOM-элементе
 * @param {String} blockName имя блока
 * @param {Object} params параметры блока
 * @returns {BEM}
 */
$.fn.bem = function(blockName, params) {
    return initBlock(blockName, this, params, true);
};

/**
 * @namespace
 * @name BEM.DOM
 */
var DOM = BEM.DOM = BEM.decl('i-bem__dom',/** @lends BEM.DOM.prototype */{
    /**
     * @class Базовый блок для создания bem-блоков, имеющих DOM-представление
     * @constructs
     * @private
     * @param {jQuery} domElem DOM-элемент, на котором создается блок
     * @param {Object} params параметры блока
     * @param {Boolean} [initImmediately=true]
     */
    __constructor : function(domElem, params, initImmediately) {

        var _this = this;

        /**
         * DOM-элементы блока
         * @protected
         * @type jQuery
         */
        _this.domElem = domElem;

        /**
         * кэш для имен событий на DOM-элементах
         * @private
         * @type Object
         */
        _this._eventNameCache = {};

        /**
         * кэш для элементов
         * @private
         * @type Object
         */
        _this._elemCache = {};

        /**
         * уникальный идентификатор блока
         * @private
         * @type String
         */
        uniqIdToBlock[_this._uniqId = params.uniqId || $.identify(_this)] = _this;

        /**
         * флаг необходимости unbind от document и window при уничтожении блока
         * @private
         * @type Boolean
         */
        _this._needSpecialUnbind = false;

        _this.__base(null, params, initImmediately);

    },

    /**
     * Находит блоки внутри (включая контекст) текущего блока или его элементов
     * @protected
     * @param {String|jQuery} [elem] элемент блока
     * @param {String|Object} block имя или описание (block,modName,modVal) искомого блока
     * @returns {BEM[]}
     */
    findBlocksInside : function(elem, block) {

        return this._findBlocks('find', elem, block);

    },

    /**
     * Находит первый блок внутри (включая контекст) текущего блока или его элементов
     * @protected
     * @param {String|jQuery} [elem] элемент блока
     * @param {String|Object} block имя или описание (block,modName,modVal) искомого блока
     * @returns {BEM}
     */
    findBlockInside : function(elem, block) {

        return this._findBlocks('find', elem, block, true);

    },

    /**
     * Находит блоки снаружи (включая контекст) текущего блока или его элементов
     * @protected
     * @param {String|jQuery} [elem] элемент блока
     * @param {String|Object} block имя или описание (block,modName,modVal) искомого блока
     * @returns {BEM[]}
     */
    findBlocksOutside : function(elem, block) {

        return this._findBlocks('parents', elem, block);

    },

    /**
     * Находит первый блок снаружи (включая контекст) текущего блока или его элементов
     * @protected
     * @param {String|jQuery} [elem] элемент блока
     * @param {String|Object} block имя или описание (block,modName,modVal) искомого блока
     * @returns {BEM}
     */
    findBlockOutside : function(elem, block) {

        return this._findBlocks('closest', elem, block)[0] || null;

    },

    /**
     * Находит блоки на DOM-элементах текущего блока или его элементов
     * @protected
     * @param {String|jQuery} [elem] элемент блока
     * @param {String|Object} block имя или описание (block,modName,modVal) искомого блока
     * @returns {BEM[]}
     */
    findBlocksOn : function(elem, block) {

        return this._findBlocks('', elem, block);

    },

    /**
     * Находит первый блок на DOM-элементах текущего блока или его элементов
     * @protected
     * @param {String|jQuery} [elem] элемент блока
     * @param {String|Object} block имя или описание (block,modName,modVal) искомого блока
     * @returns {BEM}
     */
    findBlockOn : function(elem, block) {

        return this._findBlocks('', elem, block, true);

    },

    _findBlocks : function(select, elem, block, onlyFirst) {

        if(!block) {
            block = elem;
            elem = undefined;
        }

        var ctxElem = elem?
                (typeof elem == 'string'? this.findElem(elem) : elem) :
                this.domElem,
            isSimpleBlock = typeof block == 'string',
            blockName = isSimpleBlock? block : (block.block || block.blockName),
            selector = '.' +
                (isSimpleBlock?
                    buildClass(blockName) :
                    buildClass(blockName, block.modName, block.modVal)) +
                (onlyFirst? ':first' : ''),
            domElems = ctxElem.filter(selector);

        select && (domElems = domElems.add(ctxElem[select](selector)));

        if(onlyFirst) {
            return domElems[0]? initBlock(blockName, domElems.eq(0), true) : null;
        }

        var res = [],
            uniqIds = {};

        $.each(domElems, function(i, domElem) {
            var block = initBlock(blockName, $(domElem), true);
            if(!uniqIds[block._uniqId]) {
                uniqIds[block._uniqId] = true;
                res.push(block);
            }
        });

        return res;

    },

    /**
     * Добавляет обработчик события произвольного DOM-элемента
     * @protected
     * @param {jQuery} domElem DOM-элемент, на котором будет слушаться событие
     * @param {String|Object} event имя события или объект события
     * @param {Function} fn функция-обработчик, будет выполнена в контексте блока
     * @returns {BEM}
     */
    bindToDomElem : function(domElem, event, fn) {

        var _this = this;

        fn?
            domElem.bind(
                _this._buildEventName(event),
                function(e) {
                    (e.data || (e.data = {})).domElem = $(this);
                    return fn.apply(_this, arguments);
                }
            ) :
            $.each(event, function(event, fn) {
                _this.bindToDomElem(domElem, event, fn);
            });

        return _this;

    },

    /**
     * Добавляет обработчик события на document
     * @protected
     * @param {String} event имя события
     * @param {Function} fn функция-обработчик, будет выполнена в контексте блока
     * @returns {BEM}
     */
    bindToDoc : function(event, fn) {

        this._needSpecialUnbind = true;
        return this.bindToDomElem(doc, event, fn);

    },

    /**
     * Добавляет обработчик события на window
     * @protected
     * @param {String} event имя события
     * @param {Function} fn функция-обработчик, будет выполнена в контексте блока
     * @returns {BEM}
     */
    bindToWin : function(event, fn) {

        this._needSpecialUnbind = true;
        return this.bindToDomElem(win, event, fn);

    },

    /**
     * Добавляет обработчик события на основные DOM-элементы блока или его вложенные элементы
     * @protected
     * @param {jQuery|String} [elem] элемент
     * @param {String} event имя события
     * @param {Function} fn функция-обработчик, будет выполнена в контексте блока
     * @returns {BEM}
     */
    bindTo : function(elem, event, fn) {

        if(!event || $.isFunction(event)) { // если нет элемента
            fn = event;
            event = elem;
            elem = this.domElem;
        } else if(typeof elem == 'string') {
            elem = this.elem(elem);
        }

        return this.bindToDomElem(elem, event, fn);

    },

    /**
     * Удаляет обработчики события произвольного DOM-элемента
     * @protected
     * @param {jQuery} domElem DOM-элемент, на котором будет слушаться событие
     * @param {String} event имя события
     * @returns {BEM}
     */
    unbindFromDomElem : function(domElem, event) {

        domElem.unbind(this._buildEventName(event));
        return this;

    },

    /**
     * Удаляет обработчик события у document
     * @protected
     * @param {String} event имя события
     * @returns {BEM}
     */
    unbindFromDoc : function(event) {

        return this.unbindFromDomElem(doc, event);

    },

    /**
     * Удаляет обработчик события у document
     * @protected
     * @param {String} event имя события
     * @returns {BEM}
     */
    unbindFromWin : function(event) {

        return this.unbindFromDomElem(win, event);

    },

    /**
     * Удаляет обработчики события из основных DOM-элементы блока или его вложенных элементов
     * @protected
     * @param {jQuery|String} [elem] вложенный элемент
     * @param {String} event имя события
     * @returns {BEM}
     */
    unbindFrom : function(elem, event) {

        if(!event) {
            event = elem;
            elem = this.domElem;
        } else if(typeof elem == 'string') {
            elem = this.elem(elem);
        }

        return this.unbindFromDomElem(elem, event);

    },

    /**
     * Строит полное имя события
     * @private
     * @param {String} event имя события
     * @returns {String}
     */
    _buildEventName : function(event) {

        var _this = this;
        return event.indexOf(' ') > 1?
            event.split(' ').map(function(e) {
                return _this._buildOneEventName(e);
            }).join(' ') :
            _this._buildOneEventName(event);

    },

    /**
     * Строит полное имя для одного события
     * @private
     * @param {String} event имя события
     * @returns {String}
     */
    _buildOneEventName : function(event) {

        var _this = this,
            eventNameCache = _this._eventNameCache;

        if(event in eventNameCache) return eventNameCache[event];

        var uniq = '.' + _this._uniqId;

        if(event.indexOf('.') < 0) return eventNameCache[event] = event + uniq;

        var lego = '.bem_' + _this.__self._name;

        return eventNameCache[event] = event.split('.').map(function(e, i) {
            return i == 0? e + lego : lego + '_' + e;
        }).join('') + uniq;

    },

    /**
     * Запускает обработчики события у блока и обработчики live-событий
     * @protected
     * @param {String} e имя события
     * @param {Object} [data] дополнительные данные
     * @returns {BEM}
     */
    trigger : function(e, data) {

        this
            .__base(e = this.buildEvent(e), data)
            .domElem && this._ctxTrigger(e, data);

        return this;

    },

    _ctxTrigger : function(e, data) {

        var _this = this,
            storage = liveEventCtxStorage[_this.__self._buildCtxEventName(e.type)],
            ctxIds = {};

        storage && _this.domElem.each(function() {
            var ctx = this,
                counter = storage.counter;
            while(ctx && counter) {
                var ctxId = $.identify(ctx, true);
                if(ctxId) {
                    if(ctxIds[ctxId]) break;
                    var storageCtx = storage.ctxs[ctxId];
                    if(storageCtx) {
                        $.each(storageCtx, function(uniqId, handler) {
                            handler.fn.call(
                                handler.ctx || _this,
                                e,
                                data);
                        });
                        counter--;
                    }
                    ctxIds[ctxId] = true;
                }
                ctx = ctx.parentNode;
            }
        });

    },

    /**
     * Устанавливает модификатор у блока/вложенного элемента
     * @protected
     * @param {jQuery} [elem] вложенный элемент
     * @param {String} modName имя модификатора
     * @param {String} modVal значение модификатора
     * @returns {BEM}
     */
    setMod : function(elem, modName, modVal) {

        if(elem && typeof modVal != 'undefined' && elem.length > 1) {
            var _this = this;
            elem.each(function() {
                var item = $(this);
                item.__bemElemName = elem.__bemElemName;
                _this.setMod(item, modName, modVal);
            });
            return _this;
        }
        return this.__base(elem, modName, modVal);

    },

    /**
     * Извлекает значение модификатора из CSS-класса DOM-ноды
     * @private
     * @param {String} modName имя модификатора
     * @param {jQuery} [elem] вложенный элемент
     * @param {String} [elemName] имя вложенного элемента
     * @returns {String} значение модификатора
     */
    _extractModVal : function(modName, elem, elemName) {

        var domNode = (elem || this.domElem)[0],
            matches;

        domNode &&
            (matches = domNode.className
                .match(this.__self._buildModValRE(modName, elemName || elem)));

        return matches? matches[2] : '';

    },

    /**
     * Извлекает имя/значение списка модификаторов
     * @private
     * @param {Array} [modNames] имена модификаторов
     * @param {Object} [elem] элемент
     * @returns {Object} хэш значений модификаторов по имени
     */
    _extractMods : function(modNames, elem) {

        var res = {},
            extractAll = !modNames.length,
            countMatched = 0;

        ((elem || this.domElem)[0].className
            .match(this.__self._buildModValRE(
                '(' + (extractAll? NAME_PATTERN : modNames.join('|')) + ')',
                elem,
                'g')) || []).forEach(function(className) {
                    var iModVal = (className = className.trim()).lastIndexOf(MOD_DELIM),
                        iModName = className.substr(0, iModVal - 1).lastIndexOf(MOD_DELIM);
                    res[className.substr(iModName + 1, iModVal - iModName - 1)] = className.substr(iModVal + 1);
                    ++countMatched;
                });

        // пустые значения модификаторов не отражены в классах, нужно их заполнить пустыми значения
        countMatched < modNames.length && modNames.forEach(function(modName) {
            modName in res || (res[modName] = '');
        });

        return res;

    },

    /**
     * Уставливает CSS-класс модификатора на DOM-элемент блока или вложенный элемент
     * @private
     * @param {String} modName имя модификатора
     * @param {String} modVal значение модификатора
     * @param {jQuery} [elem] DOM-элемент
     * @param {String} [elemName] имя элемента
     */
    _afterSetMod : function(modName, modVal, elem, elemName) {

        var _self = this.__self,
            classPrefix = _self._buildModClassPrefix(modName, elemName),
            classRE = _self._buildModValRE(modName, elemName),
            needDel = modVal === '';

        (elem || this.domElem).each(function() {
            var className = this.className;
            className.indexOf(classPrefix) > -1?
                this.className = className.replace(
                    classRE,
                    (needDel? '' : '$1' + classPrefix + modVal) + '$3') :
                needDel || $(this).addClass(classPrefix + modVal);
        });
        elemName && this.dropElemCache(elemName, modName, modVal);

    },

    /**
     * Находит вложенные в блок элементы
     * @protected
     * @param {String|jQuery} [ctx=this.domElem] элемент, на котором проходит поиск
     * @param {String} names имя (или через пробел имена) вложенного элемента
     * @param {String} [modName] имя модификатора
     * @param {String} [modVal] значение модификатора
     * @returns {jQuery} DOM-элементы
     */
    findElem : function(ctx, names, modName, modVal) {

        if(arguments.length % 2) { // если кол-во аргументов один или три
            modVal = modName;
            modName = names;
            names = ctx;
            ctx = this.domElem;
        } else if(typeof ctx == 'string') {
            ctx = this.findElem(ctx);
        }

        var _self = this.__self,
            selector = '.' +
                names.split(' ').map(function(name) {
                    return buildClass(_self._name, name, modName, modVal);
                }).join(',.');
        return findDomElem(ctx, selector);

    },

    /**
     * Находит вложенные в блок элементы
     * @protected
     * @param {String} name имя вложенного элемента
     * @param {String} [modName] имя модификатора
     * @param {String} [modVal] значение модификатора
     * @returns {jQuery} DOM-элементы
     */
    _elem : function(name, modName, modVal) {

        var key = name + buildModPostfix(modName, modVal),
            res;

        if(!(res = this._elemCache[key])) {
            res = this._elemCache[key] = this.findElem(name, modName, modVal);
            res.__bemElemName = name;
        }

        return res;

    },

    /**
     * Ленивый поиск вложенных в блок элементы (результат кэшируется)
     * @protected
     * @param {String} names имя (или через пробел имена) вложенных элементов
     * @param {String} [modName] имя модификатора
     * @param {String} [modVal] значение модификатора
     * @returns {jQuery} DOM-элементы
     */
    elem : function(names, modName, modVal) {

        if(modName && typeof modName != 'string') {
            modName.__bemElemName = names;
            return modName;
        }

        if(names.indexOf(' ') < 0) {
            return this._elem(names, modName, modVal);
        }

        var res = $([]),
            _this = this;
        names.split(' ').forEach(function(name) {
            res = res.add(_this._elem(name, modName, modVal));
        });
        return res;

    },

    /**
     * Сброс кэша для элементов
     * @protected
     * @param {String} names имя (или через пробел имена) вложенных элементов
     * @param {String} [modName] имя модификатора
     * @param {String} [modVal] значение модификатора
     * @returns {BEM}
     */
    dropElemCache : function(names, modName, modVal) {

        if(names) {
            var _this = this,
                modPostfix = buildModPostfix(modName, modVal);
            names.indexOf(' ') < 0?
                delete _this._elemCache[names + modPostfix] :
                names.split(' ').forEach(function(name) {
                    delete _this._elemCache[name + modPostfix];
                });
        } else {
            this._elemCache = {};
        }

        return this;

    },

    /**
     * Извлекает параметры элемента блока
     * @param {String|jQuery} elem элемент
     * @returns {Object} параметры
     */
    elemParams : function(elem) {

        var elemName;
        if(typeof elem ==  'string') {
            elemName = elem;
            elem = this.elem(elem);
        } else {
            elemName = this.__self._extractElemNameFrom(elem);
        }

        return extractParams(elem[0])[buildClass(this.__self.getName(), elemName)] || {};

    },

    /**
     * Проверяет, находится ли DOM-элемент в блоке
     * @protected
     * @param {jQuery} domElem DOM-элемент
     * @returns {Boolean}
     */
    containsDomElem : function(domElem) {

        var res = false;

        this.domElem.each(function() {
            return !(res = domElem.parents().andSelf().index(this) > -1);
        });

        return res;

    },

    /**
     * Строит CSS-селектор, соответствующий блоку/элементу и модификатору
     * @param {String} [elem] имя элемент
     * @param {String} [modName] имя модификатора
     * @param {String} [modVal] значение модификатора
     * @returns {String}
     */
    buildSelector : function(elem, modName, modVal) {

        return this.__self.buildSelector(elem, modName, modVal);

    },

    /**
     * Удаляет блок
     * @param {Boolean} [keepDOM=false] нужно ли оставлять DOM-ноды блока в документе
     */
    destruct : function(keepDOM) {

        var _this = this,
            _self = _this.__self;

        _this._isDestructing = true;

        _this._needSpecialUnbind && _self.doc.add(_self.win).unbind('.' + _this._uniqId);

        _this.dropElemCache().domElem.each(function(i, domNode) {
            $.each(getParams(domNode), function(blockName, blockParams) {
                var block = uniqIdToBlock[blockParams.uniqId];
                block && !block._isDestructing && block.destruct();
            });
            cleanupDomNode(domNode);
        });

        keepDOM || _this.domElem.remove();

        delete uniqIdToBlock[_this.un()._uniqId];
        delete _this.domElem;
        delete _this._elemCache;

        _this.__base();

    }

}, /** @lends BEM.DOM */{

    /**
     * Шорткат для документа
     * @protected
     * @type jQuery
     */
    doc : doc,

    /**
     * Шорткат для window
     * @protected
     * @type jQuery
     */
    win : win,

    /**
     * Осуществляет обработку live-свойств блока
     * @private
     * @param {Boolean} [heedLive=false] нужно ли учитывать то, что блок обрабатывал уже свои live-свойства
     * @returns {Boolean} является ли блок live-блоком
     */
    _processLive : function(heedLive) {

        var _this = this,
            res = _this._liveInitable;

        if('live' in _this) {
            var noLive = typeof res == 'undefined';

            if(noLive ^ heedLive) {
                if($.isFunction(_this.live)) {
                    res = _this.live() !== false;
                    _this.live = function() {};
                } else {
                    res = _this.live;
                }
            }
        }

        return res;

    },

    /**
     * Инициализирует блоки на фрагменте DOM-дерева
     * @static
     * @protected
     * @param {jQuery} [ctx=document] корневая DOM-нода
     * @returns {jQuery} ctx контекст инициализации
     */
    init : function(ctx, callback, callbackCtx) {

        if(!ctx || $.isFunction(ctx)) {
            callbackCtx = callback;
            callback = ctx;
            ctx = doc;
        }

        var uniqInitId = $.identify();
        findDomElem(ctx, '.i-bem').each(function() {
            init($(this), uniqInitId);
        });

        callback && this.afterCurrentEvent(
            function() {
                callback.call(callbackCtx || this, ctx);
            });

        // чтобы инициализация была полностью синхронной
        this._runAfterCurrentEventFns();

        return ctx;

    },

    /**
     * Уничтожает блоки на фрагменте DOM-дерева
     * @static
     * @protected
     * @param {Boolean} [keepDOM=false] нужно ли оставлять DOM-ноды в документе
     * @param {jQuery} ctx корневая DOM-нода
     * @param {Boolean} [excludeSelf=false] не учитывать контекст
     */
    destruct : function(keepDOM, ctx, excludeSelf) {

        if(typeof keepDOM != 'boolean') {
            excludeSelf = ctx;
            ctx = keepDOM;
            keepDOM = undefined;
        }

        findDomElem(ctx, '.i-bem', excludeSelf).each(function() {
            $.each(getParams(this), function(blockName, blockParams) {
                if(blockParams.uniqId) {
                    var block = uniqIdToBlock[blockParams.uniqId];
                    block && block.destruct(true);
                }
            });
            cleanupDomNode(this);
        });
        keepDOM || (excludeSelf? ctx.empty() : ctx.remove());

    },

    /**
     * Заменяет фрагмент DOM-дерева внутри контекста, уничтожая старые блоки и инициализируя новые
     * @static
     * @protected
     * @param {jQuery} ctx корневая DOM-нода
     * @param {jQuery|String} content новый контент
     * @param {Function} [callback] обработчик, вызываемый после инициализации
     * @param {Object} [callbackCtx] контекст обработчика
     */
    update : function(ctx, content, callback, callbackCtx) {

        this.destruct(ctx, true);
        this.init(ctx.html(content), callback, callbackCtx);

    },

    /**
     * Добавляет фрагмент DOM-дерева в конец контекста и инициализирует блоки
     * @param {jQuery} ctx корневая DOM-нода
     * @param {jQuery|String} content добавляемый контент
     */
    append : function(ctx, content) {

        this.init($(content).appendTo(ctx));

    },

    /**
     * Добавляет фрагмент DOM-дерева в начало контекста и инициализирует блоки
     * @param {jQuery} ctx корневая DOM-нода
     * @param {jQuery|String} content добавляемый контент
     */
    prepend : function(ctx, content) {

        this.init($(content).prependTo(ctx));

    },

    /**
     * Добавляет фрагмент DOM-дерева перед контекстом и инициализирует блоки
     * @param {jQuery} ctx контекстная DOM-нода
     * @param {jQuery|String} content добавляемый контент
     */
    before : function(ctx, content) {

        this.init($(content).insertBefore(ctx));

    },

    /**
     * Добавляет фрагмент DOM-дерева после контекстом и инициализирует блоки
     * @param {jQuery} ctx контекстная DOM-нода
     * @param {jQuery|String} content добавляемый контент
     */
    after : function(ctx, content) {

        this.init($(content).insertAfter(ctx));

    },

    /**
     * Строит полное имя live-события
     * @static
     * @private
     * @param {String} e имя события
     * @returns {String}
     */
    _buildCtxEventName : function(e) {

        return this._name + ':' + e;

    },

    _liveClassBind : function(className, e, callback, invokeOnInit) {

        var _this = this;
        if(e.indexOf(' ') > -1) {
            e.split(' ').forEach(function(e) {
                _this._liveClassBind(className, e, callback, invokeOnInit);
            });
        }
        else {
            var storage = liveClassEventStorage[e],
                uniqId = $.identify(callback);

            if(!storage) {
                storage = liveClassEventStorage[e] = {};
                doc.bind(e, _this.changeThis(_this._liveClassTrigger, _this));
            }

            storage = storage[className] || (storage[className] = { uniqIds : {}, fns : [] });

            if(!(uniqId in storage.uniqIds)) {
                storage.fns.push({ uniqId : uniqId, fn : _this._buildLiveEventFn(callback, invokeOnInit) });
                storage.uniqIds[uniqId] = storage.fns.length - 1;
            }
        }

        return this;

    },

    _liveClassUnbind : function(className, e, callback) {

        var storage = liveClassEventStorage[e];
        if(storage) {
            if(callback) {
                if(storage = storage[className]) {
                    var uniqId = $.identify(callback);
                    if(uniqId in storage.uniqIds) {
                        var i = storage.uniqIds[uniqId],
                            len = storage.fns.length - 1;
                        storage.fns.splice(i, 1);
                        while(i < len) storage.uniqIds[storage.fns[i++].uniqId] = i - 1;
                        delete storage.uniqIds[uniqId];
                    }
                }
            } else {
                delete storage[className];
            }
        }

        return this;

    },

    _liveClassTrigger : function(e) {

        var storage = liveClassEventStorage[e.type];
        if(storage) {
            var node = e.target, classNames = [];
            for(var className in storage) storage.hasOwnProperty(className) && classNames.push(className);
            do {
                var nodeClassName = ' ' + node.className + ' ', i = 0;
                while(className = classNames[i++]) {
                    if(nodeClassName.indexOf(' ' + className + ' ') > -1) {
                        var j = 0, fns = storage[className].fns, fn;
                        while(fn = fns[j++]) fn.fn.call($(node), e);
                        if(e.isPropagationStopped()) return;
                        classNames.splice(--i, 1);
                    }
                }
            } while(classNames.length && (node = node.parentNode));
        }

    },

    _buildLiveEventFn : function(callback, invokeOnInit) {

        var _this = this;
        return function(e) {
            var args = [
                    _this._name,
                    ((e.data || (e.data = {})).domElem = $(this)).closest(_this.buildSelector()),
                    true ],
                block = initBlock.apply(null, invokeOnInit? args.concat([callback, e]) : args);
            block && (invokeOnInit || (callback && callback.apply(block, arguments)));
        };

    },

    /**
     * Хелпер для live-инициализации по событию на DOM-элементах блока или его элементов
     * @static
     * @protected
     * @param {String} [elemName] имя элемента или элементов (через пробел)
     * @param {String} event имя события
     * @param {Function} [callback] обработчик, вызываемый после успешной инициализации
     */
    liveInitOnEvent : function(elemName, event, callback) {

        return this.liveBindTo(elemName, event, callback, true);

    },

    /**
     * Хелпер для подписки на live-события на DOM-элементах блока или его элементов
     * @static
     * @protected
     * @param {String|Object} [to] описание (объект с modName, modVal, elem) или имя элемента или элементов (через пробел)
     * @param {String} event имя события
     * @param {Function} [callback] обработчик
     */
    liveBindTo : function(to, event, callback, invokeOnInit) {

        if($.isFunction(event)) {
            callback = event;
            event = to;
            to = undefined;
        }

        if(!to || typeof to == 'string') {
            to = { elem : to };
        }

        to.elemName && (to.elem = to.elemName);

        var _this = this;

        if(to.elem && to.elem.indexOf(' ') > 1) {
            to.elem.split(' ').forEach(function(elem) {
                _this._liveClassBind(
                    buildClass(_this._name, elem, to.modName, to.modVal),
                    event,
                    callback,
                    invokeOnInit);
            });
            return _this;
        }

        return _this._liveClassBind(
            buildClass(_this._name, to.elem, to.modName, to.modVal),
            event,
            callback,
            invokeOnInit);

    },

    /**
     * Хелпер для отписки от live-событий на DOM-элементах блока или его элементов
     * @static
     * @protected
     * @param {String} [elem] имя элемента или элементов (через пробел)
     * @param {String} event имя события
     * @param {Function} [callback] обработчик
     */
    liveUnbindFrom : function(elem, event, callback) {

        var _this = this;

        if(elem.indexOf(' ') > 1) {
            elem.split(' ').forEach(function(elem) {
                _this._liveClassUnbind(
                    buildClass(_this._name, elem),
                    event,
                    callback);
            });
            return _this;
        }

        return _this._liveClassUnbind(
            buildClass(_this._name, elem),
            event,
            callback);

    },

    /**
     * Хелпер для live-инициализации по инициализации другого блока
     * @static
     * @private
     * @param {String} blockName имя блока, на инициализацию которого нужно реагировать
     * @param {Function} callback обработчик, вызываемый после успешной инициализации в контексте нового блока
     * @param {String} findFnName имя метода для поиска
     */
    _liveInitOnBlockInit : function(blockName, callback, findFnName) {

        var name = this._name;
        blocks[blockName].on('init', function(e) {
            var blocks = e.block[findFnName](name);
            callback && blocks.forEach(function(block) {
                callback.call(block);
            });
        });
        return this;

    },

    /**
     * Хелпер для live-инициализации по инициализации другого блока на DOM-элементе текущего
     * @static
     * @protected
     * @param {String} blockName имя блока, на инициализацию которого нужно реагировать
     * @param {Function} callback обработчик, вызываемый после успешной инициализации в контексте нового блока
     */
    liveInitOnBlockInit : function(blockName, callback) {

        return this._liveInitOnBlockInit(blockName, callback, 'findBlocksOn');

    },

    /**
     * Хелпер для live-инициализации по инициализации другого блока внутри текущего
     * @static
     * @protected
     * @param {String} blockName имя блока, на инициализацию которого нужно реагировать
     * @param {Function} [callback] обработчик, вызываемый после успешной инициализации в контексте нового блока
     */
    liveInitOnBlockInsideInit : function(blockName, callback) {

        return this._liveInitOnBlockInit(blockName, callback, 'findBlocksOutside');

    },

    /**
     * Добавляет обработчик live-события на блок, с учётом заданного элемента,
     * внутри которого будет слушаться событие
     * @static
     * @protected
     * @param {jQuery} [ctx] элемент, внутри которого будет слушаться событие
     * @param {String} e имя события
     * @param {Object} [data] дополнительные данные, приходящие в обработчик как e.data
     * @param {Function} fn обработчик
     * @param {Object} [fnCtx] контекст обработчика
     */
    on : function(ctx, e, data, fn, fnCtx) {

        return ctx.jquery?
            this._liveCtxBind(ctx, e, data, fn, fnCtx) :
            this.__base(ctx, e, data, fn);

    },

    /**
     * Удаляет обработчик live-события у блока, с учётом заданного элемента,
     * внутри которого слушалось событие
     * @static
     * @protected
     * @param {jQuery} [ctx] элемент, внутри которого слушалось событие
     * @param {String} e имя события
     * @param {Function} [fn] обработчик
     * @param {Object} [fnCtx] контекст обработчика
     */
    un : function(ctx, e, fn, fnCtx) {

        return ctx.jquery?
            this._liveCtxUnbind(ctx, e, fn, fnCtx) :
            this.__base(ctx, e, fn);

    },

    /**
     * Добавляет обработчик live-события на блок, с учётом заданного элемента,
     * внутри которого будет слушаться событие
     * @deprecated использовать on
     * @static
     * @protected
     * @param {jQuery} ctx элемент, внутри которого будет слушаться событие
     * @param {String} e имя события
     * @param {Object} [data] дополнительные данные, приходящие в обработчик как e.data
     * @param {Function} fn обработчик
     * @param {Object} [fnCtx] контекст обработчика
     */
    liveCtxBind : function(ctx, e, data, fn, fnCtx) {

        return this._liveCtxBind(ctx, e, data, fn, fnCtx);

    },

    /**
     * Добавляет обработчик live-события на блок, с учётом заданного элемента,
     * внутри которого будет слушаться событие
     * @static
     * @private
     * @param {jQuery} ctx элемент, внутри которого будет слушаться событие
     * @param {String} e имя события
     * @param {Object} [data] дополнительные данные, приходящие в обработчик как e.data
     * @param {Function} fn обработчик
     * @param {Object} [fnCtx] контекст обработчика
     */
    _liveCtxBind : function(ctx, e, data, fn, fnCtx) {

        var _this = this;

        if(typeof e == 'string') {
            if($.isFunction(data)) {
                fnCtx = fn;
                fn = data;
                data = undefined;
            }

            if(e.indexOf(' ') > -1) {
                e.split(' ').forEach(function(e) {
                    _this._liveCtxBind(ctx, e, data, fn, fnCtx);
                });
            } else {
                var ctxE = _this._buildCtxEventName(e),
                    storage = liveEventCtxStorage[ctxE] ||
                        (liveEventCtxStorage[ctxE] = { counter : 0, ctxs : {} });

                ctx.each(function() {
                    var ctxId = $.identify(this),
                        ctxStorage = storage.ctxs[ctxId];
                    if(!ctxStorage) {
                        ctxStorage = storage.ctxs[ctxId] = {};
                        ++storage.counter;
                    }
                    ctxStorage[$.identify(fn) + (fnCtx? $.identify(fnCtx) : '')] = {
                        fn   : fn,
                        data : data,
                        ctx  : fnCtx
                    };
                });
            }
        } else {
            $.each(e, function(e, fn) {
                _this._liveCtxBind(ctx, e, fn, data);
            });
        }

        return _this;

    },

    /**
     * Удаляет обработчик live-события у блока, с учётом заданного элемента,
     * внутри которого слушалось событие
     * @deprecated использовать un
     * @static
     * @protected
     * @param {jQuery} ctx элемент, внутри которого слушалось событие
     * @param {String} e имя события
     * @param {Function} [fn] обработчик
     * @param {Object} [fnCtx] контекст обработчика
     */
    liveCtxUnbind : function(ctx, e, fn, fnCtx) {

        return this._liveCtxBind(ctx, e, fn, fnCtx);

    },

    /**
     * Удаляет обработчик live-события у блока, с учётом заданного элемента,
     * внутри которого слушалось событие
     * @static
     * @private
     * @param {jQuery} ctx элемент, внутри которого слушалось событие
     * @param {String} e имя события
     * @param {Function} [fn] обработчик
     * @param {Object} [fnCtx] контекст обработчика
     */
    _liveCtxUnbind : function(ctx, e, fn, fnCtx) {

        var _this = this,
            storage = liveEventCtxStorage[e =_this.buildEventName(e)];

        if(storage) {
            ctx.each(function() {
                var ctxId = $.identify(this, true),
                    ctxStorage;
                if(ctxId && (ctxStorage = storage.ctxs[ctxId])) {
                    fn && delete ctxStorage[$.identify(fn) + (fnCtx? $.identify(fnCtx) : '')];
                    if(!fn || $.isEmptyObject(ctxStorage)) {
                        storage.counter--;
                        delete storage.ctxs[ctxId];
                    }
                }
            });
            storage.counter || delete liveEventCtxStorage[e];
        }

        return _this;

    },

    /**
     * Извлекает имя вложенного в блок элемента
     * @static
     * @private
     * @param {jQuery} elem вложенный элемент
     * @returns {String|undefined}
     */
    _extractElemNameFrom : function(elem) {

        if(elem.__bemElemName) return elem.__bemElemName;

        var matches = elem[0].className.match(this._buildElemNameRE());
        return matches? matches[1] : undefined;

    },

    /**
     * Извлекает параметры блока из DOM-элемента
     * @static
     * @param {HTMLElement} domNode DOM-нода
     * @returns {Object}
     */
    extractParams : extractParams,

    /**
     * Строит префикс для CSS-класса DOM-элемента или вложенного элемента блока по имени модификатора
     * @static
     * @private
     * @param {String} modName имя модификатора
     * @param {jQuery|String} [elem] элемент
     * @returns {String}
     */
    _buildModClassPrefix : function(modName, elem) {

        return buildClass(this._name) +
               (elem?
                   ELEM_DELIM + (typeof elem === 'string'? elem : this._extractElemNameFrom(elem)) :
                   '') +
               MOD_DELIM + modName + MOD_DELIM;

    },

    /**
     * Строит регулярное выражение для извлечения значения модификатора из DOM-элемента или вложенного элемента блока
     * @static
     * @private
     * @param {String} modName имя модификатора
     * @param {jQuery|String} [elem] элемент
     * @param {String} [quantifiers] квантификаторы регулярного выражения
     * @returns {RegExp}
     */
    _buildModValRE : function(modName, elem, quantifiers) {

        return new RegExp('(\\s?)' + this._buildModClassPrefix(modName, elem) + '(' + NAME_PATTERN + ')(\\s|$)', quantifiers);

    },

    /**
     * Строит регулярное выражение для извлечения имени вложенного в блок элемента
     * @static
     * @private
     * @returns {RegExp}
     */
    _buildElemNameRE : function() {

        return new RegExp(this._name + ELEM_DELIM + '(' + NAME_PATTERN + ')(?:\\s|$)');

    },

    /**
     * Строит CSS-селектор, соответствующий блоку/элементу и модификатору
     * @param {String} [elem] имя элемент
     * @param {String} [modName] имя модификатора
     * @param {String} [modVal] значение модификатора
     * @returns {String}
     */
    buildSelector : function(elem, modName, modVal) {

        return '.' + buildClass(this._name, elem, modName, modVal);

    },

    /**
     * Возвращает инстанс блока по уникальному идентификатору
     * @deprecated
     * @param {String} [uniqId]
     * @returns {BEM.DOM}
     */
    getBlockByUniqId : function(uniqId) {

        return uniqIdToBlock[uniqId];

    },

    /**
     * Возвращает размер текущего окна
     * @returns {Object} объект с полями width, height
     */
    getWindowSize : function() {

        return {
            width  : win.width(),
            height : win.height()
        };

    }

});

})(BEM, jQuery);

/* ../../bem-bl/blocks-common/i-bem/__dom/i-bem__dom.js: end */ /**/

/* ../../bem-bl/blocks-common/i-ecma/__string/i-ecma__string.js: begin */ /**/
(function() {

String.prototype.trim || (String.prototype.trim = function () {

    var str = this.replace(/^\s\s*/, ''),
        ws = /\s/,
        i = str.length;

    while(ws.test(str.charAt(--i)));

    return str.slice(0, i + 1);

});

})();
/* ../../bem-bl/blocks-common/i-ecma/__string/i-ecma__string.js: end */ /**/

/* ../../bem-bl/blocks-common/i-bem/__dom/_init/i-bem__dom_init_auto.js: begin */ /**/
/* дефолтная инициализация */
$(function() {
    BEM.DOM.init();
});
/* ../../bem-bl/blocks-common/i-bem/__dom/_init/i-bem__dom_init_auto.js: end */ /**/

/* ../../blocks/b-fotorama/b-fotorama.js: begin */ /**/
/*! Fotorama 2.0.2 (v1321) | http://fotoramajs.com/license.txt */
(function(e){function oa(b){for(var a={},e=0;e<Y.length;e++){var A=Y[e][0],o=Y[e][1];if(b){var k=b.attr("data-"+A);k&&("number"==o?(k=Number(k),isNaN(k)||(a[A]=k)):"boolean"==o?"true"==k?a[A]=!0:"false"==k&&(a[A]=!1):"string"==o?a[A]=k:"boolean-number"==o&&("true"==k?a[A]=!0:"false"==k?a[A]=!1:(k=Number(k),isNaN(k)||(a[A]=k))))}else a[A]=Y[e][2]}return a}function pa(b,a){for(var e={},o=0;o<Da.length;o++)e[Da[o]+b]=a;return e}function qa(b,a){if(ra)return pa("transform",a?"translate(0,"+b+"px)":"translate("+
b+"px,0)");var e={};e[a?"top":"left"]=b;return e}function pb(){return!1}function sa(b){return pa("transition-duration",b+"ms")}function Ea(b){b.mousemove(function(a){a.preventDefault()}).mousedown(function(a){a.preventDefault()})}function Nb(b){b.preventDefault();document.selection&&document.selection.empty?document.selection.empty():window.getSelection&&window.getSelection().removeAllRanges()}function Ta(f,a){function ob(c,d,b){c&&(ta.no.test(c)||ta.px.test(c)?(ia=j=Number((""+c).replace("px","")),
Z=ja=!1):ta["%"].test(c)?(Ua=Number((""+c).replace("%",""))/100,ja=!a().flexible,j||(j=f.width()*(q?1:Ua)-(a().vertical&&w?w.width():0)),Z=!1):Z=!0);d&&(ta.no.test(d)||ta.px.test(d)?(ua=m=Number((""+d).replace("px","")),$=!1):$=!0);if("auto"==c||!c||"auto"==d||!d){var b=Number(b),n=u.filter(function(){return e(this).data("state")!="error"}).filter(":first").data("srcKey");if(isNaN(b)||!b)b=null,n&&(b=p[n].imgRatio);if(b){Fa=Ga=C=b;if(n){if("auto"==c||!c)ia=j=p[n].imgWidth,Z=!0;if("auto"==d||!d)ua=
m=p[n].imgHeight,$=!0}$&&b&&!Z&&(ua=m=Math.round(j/b));!$&&b&&Z&&(ia=j=Math.round(m*b))}}}function A(c){var d;if(a().fitToWindowHeight||q)d=aa.height();if(!C||c)Fa=Ga=C=j/m;a().thumbs&&!F&&(F=a().vertical?w.width():w.height());C=rb?Fa:Ga;f.css({overflow:ja||q?"hidden":""});ja||q?j=f.width()*(q?1:Ua)-(a().vertical&&F?F:0):ia&&(j=ia);q?(m=d-(!a().vertical&&F?F:0),C=j/m):$?m=Math.round(j/C):(m=ua,C=j/m);if(a().fitToWindowHeight&&!q&&m>d-20-(!a().vertical&&F?F:0))m=d-20-(!a().vertical&&F?F:0),C=j/m}function z(c,
d,b){A(c);d||(d=0);var n=j!=Ca||m!=sb||C!=tb;if(c||n){a().vertical?(s=m,Ha=j):(s=j,Ha=m);r.add(u).animate({width:j,height:m},d);a().thumbs&&a().vertical&&(a().thumbsOnRight?w.animate({left:j},d):r.animate({left:F},d));a().touchStyle?(Va=(s+a().margin)*v-a().margin,ub=Ha,c={},c[L]=Va,c[S]=ub,E.animate(c,d).data(c).data({minPos:-(Va-s),maxPos:0})):E.animate({width:j,height:m},d);a().thumbs&&(a().vertical?w.animate({height:m},d):w.animate({width:j},d),a().thumbsPreview&&n&&vb(d,b),w.css({visibility:"visible"}));
Wa&&!a().vertical&&(a().arrows&&ba.animate({top:m/2},d),c={},c[Ia]=Ha/2,O.animate(c,d));if("loading"==Ja||"error"==Ja)c={},c[G]=(a().touchStyle?x:0)*(s+a().margin)+s/2,O.animate(c,d);H&&a().touchStyle&&(b=-x*(s+a().margin),ca(E,b,0));wb=!0;var g=0;e(Xa).each(function(){clearTimeout(this)});Xa=[];P(H,x,d);u.each(function(a){if(a!=x){var c=e(this);c.data("img")&&c.data("img").css({visibility:"hidden"});var d=setTimeout(function(){P(c,a)},g*50+50);Xa.push(d);g++}})}Ca=j;sb=m;tb=C}function k(){var c=
H.data("srcKey");c&&p[c].imgWidth&&p[c].imgHeight&&p[c].imgRatio&&(ia=j=p[c].imgWidth,ua=m=p[c].imgHeight,Ga=C=p[c].imgRatio,z(!1,a().transitionDuration))}function T(c,d,qb){function n(){a().touchStyle||(d=0);O.css(G,d*(s+a().margin)+s/2);xb=setTimeout(function(){O.stop().show().fadeTo(0,1)},100)}clearTimeout(xb);"loading"==c?(n(),f.addClass(b+"_loading").removeClass(b+"_error"),Ya||O.html("<span>&middot;&middot;&middot;</span>").css({backgroundImage:"none"})):"error"==c?(n(),f.addClass(b+"_error").removeClass(b+
"_loading"),Ya||O.html("<span>?</span>").css({backgroundImage:"none"})):"loaded"==c&&(f.removeClass(b+"_loading "+b+"_error"),O.stop().fadeTo(Math.min(y,qb),0,function(){O.hide()}));Ja=c}function Q(){return{index:x,src:p[x],img:H[0],thumb:a().thumbs?da[0]:null,caption:Za}}function ca(c,d,b,n){var g=isNaN(d)?0:Math.round(d);clearTimeout(c.data("backAnimate"));n?(g=n,c.data({backAnimate:setTimeout(function(){ca(c,d,Math.max(y,b/2))},b)})):a().onSlideStop&&setTimeout(function(){a().onSlideStop.call(f[0],
Q())},b);b&&(clearTimeout(yb),Ka=!0);ra?(c.css(sa(b)),setTimeout(function(){c.css(qa(g,a().vertical))},1)):c.stop().animate(qa(g,a().vertical),b,$a);yb=setTimeout(function(){Ka=false;a().flexible&&c==E&&k()},b)}function U(c,d,b){if(I){if(!b||I<s)La=!1;var n=da.position()[G],b=da.data()[L];if(!b&&Ma)ea.hide(),Ma=!1;else{Ma||(ea.show(),Ma=!0);if(I>s){var g=n+b/2,e=s/2,f=J.index(da),h=f-zb;void 0==R&&(R=t.position()[G]);if(ab&&d&&d>Math.max(36,2*a().thumbMargin)&&d<s-Math.max(36,2*a().thumbMargin)&&
(0<h&&d>0.75*e||0>h&&d<1.25*e)){var B;B=0<h?f+1:f-1;0>B?B=0:B>v-1&&(B=v-1);f!=B&&(g=J.eq(B),g=g.position()[G]+g.data()[L]/2,e=d)}d=-(I-s);g=Math.round(-(g-e)+a().thumbMargin);if(0<h&&g>R||0>h&&g<R)g=n+R<a().thumbMargin?-(n-a().thumbMargin):n+R+b>s?-(2*n-s+b+a().thumbMargin):R;g<=d?g=d:g>=a().thumbMargin&&(g=a().thumbMargin);t.data({minPos:d});l(g);fa||t.data({maxPos:a().thumbMargin})}else g=s/2-I/2,t.data({minPos:g}),fa||t.data({maxPos:g});!La&&!fa?(ca(t,g,c),Na&&(La=!0),R=g):Na=!0;var j=b-(Ab?0:
2*a().thumbBorderWidth);ra?(ea.css(sa(c)),setTimeout(function(){ea.css(qa(n,a().vertical)).css(L,j)},1)):a().vertical?ea.stop().animate({top:n,height:j},c,$a):ea.stop().animate({left:n,width:j},c,$a)}}}function l(c){a().shadows&&I>s&&(w.addClass(b+"__thumbs_shadow"),c<=t.data("minPos")?w.removeClass(b+"__thumbs_shadow_no-left").addClass(b+"__thumbs_shadow_no-right"):c>=a().thumbMargin?w.removeClass(b+"__thumbs_shadow_no-right").addClass(b+"__thumbs_shadow_no-left"):w.removeClass(b+"__thumbs_shadow_no-left "+
b+"__thumbs_shadow_no-right"))}function vb(a,d){if(!ka&&!fa&&!va&&!Ka||d)q||l(),U(a?a:0,!1,!d)}function P(c,d,b){var n=c.data("img"),g=c.data("detached"),b=b?b:0;if(n&&!g){var e=c.data("srcKey"),g=p[e].imgWidth,f=p[e].imgHeight,h=p[e].imgRatio,B=e=0;a().touchStyle&&c.css(G,d*(s+a().margin));if(g!=j||f!=m||a().alwaysPadding||q){var k=0;if(0.99>h/C||1.01<h/C||a().alwaysPadding||q)k=2*a().minPadding;h>=C?a().cropToFit?(f=m,g=Math.round(f*h)):(g=Math.round(j-k)<g||a().zoomToFit||q&&p[d].imgRel?Math.round(j-
k):g,f=Math.round(g/h),4>m-f&&(f+=m-f)):a().cropToFit?(g=j,f=Math.round(g/h)):(f=Math.round(m-k)<f||a().zoomToFit||q&&p[d].imgRel?Math.round(m-k):f,g=Math.round(f*h),4>j-g&&(g+=j-g))}g&&f&&(h={width:g,height:f},f!=m&&(e=Math.round((m-f)/2)),g!=j&&(B=Math.round((j-g)/2)),h.top=e,h.left=B,n.animate(h,b));n.css({visibility:"visible"});b=c.data("img");n=c.data("srcKey");d=p[d].imgRel;if(b&&d&&d!=n&&!wa&&(g=b.data("full"),c=c.data("detached"),(q&&!g||!q&&g)&&!c))b[0].src=q?d:n,b.data({full:q})}else n&&
g&&c.data({needToResize:!0})}function V(c,d,f,n){function g(e){function m(){k.css({visibility:"hidden"});j.src=e;0==B&&(k.appendTo(d),"thumb"==n&&(I+=D+a().thumbMargin,t.css(L,I).data(L,I),d.css(L,D).data(L,D)))}function o(){la[e]="loaded";k.unbind("error load").error(function(){k[0].src=e;p[c].imgRel=!1;P(u.eq(c),c);k.unbind("error")});d.trigger("load."+b).data({state:"loaded"});setTimeout(function(){p[e]||(p[e]=[],p[e].imgWidth=k.width(),p[e].imgHeight=k.height(),p[e].imgRatio=p[e].imgWidth/p[e].imgHeight);
f(j,p[e].imgWidth,p[e].imgHeight,p[e].imgRatio,e,c)},100);"thumb"==n&&(Oa++,Oa==v&&(ab=!0))}function K(a){la[e]="error";k.unbind("error load");B<h.length&&a?(B++,g(h[B])):(d.trigger("error."+b).data({state:"error"}),"thumb"==n&&(Oa++,Oa==v&&(ab=!0)))}if(la[e]){var s=function(){"error"==la[e]?K(!1):"loaded"==la[e]?o():setTimeout(s,100)};m();s()}else la[e]="loading",k.unbind("error load").error(function(){K(!0)}).load(o),m()}u.eq(c);var j=new Image,k=e(j),h=[],B=0,m=p[c].imgHref,K=p[c].imgSrc,o=p[c].thumbSrc;
if("img"==n){if(m&&(h.push(m),h.push(m+"?"+ma)),K&&(h.push(K),h.push(K+"?"+ma)),o)h.push(o),h.push(o+"?"+ma)}else if(o&&(h.push(o),h.push(o+"?"+ma)),K&&(h.push(K),h.push(K+"?"+ma)),m)h.push(m),h.push(m+"?"+ma);g(h[B])}function bb(c,d){if(c.data("wraped"))a().detachSiblings&&c.data("detached")&&(c.data({detached:!1}).appendTo(E),c.data("needToResize")&&(P(c,d),c.data({needToResize:!1})));else if(E.append(c.data({state:"loading"})),d!=x&&!a().touchStyle&&c.stop().fadeTo(0,0),c.data({wraped:!0,detached:!1}),
V(d,c,function(f,g,k,qb,h){f=e(f);f.addClass(b+"__img");c.data({img:f,srcKey:h});h=!1;if((!j||!m)&&!wb||!cb&&d==a().startImg)j=g,a().width=g,$?(m=k,a().height=k):Z&&(j=Math.round(m*(g/k)),a().width=j),h=!0,cb=d==a().startImg;h||a().flexible?z(!0):P(c,d);c.css({visibility:"visible"})},"img"),db&&M[d].html&&M[d].html.length||a().html&&a().html[d]&&a().html[d].length){var f=M[d].html||a().html[d];c.append(f)}}function Ob(c,d){var b=0,f=!1,g=[],k=[],m=q?Math.min(1,a().preload):a().preload;for(i=0;i<2*
m+1;i++){var h=d-m+i;if(0<=h&&h<v&&!a().loop||a().loop){0>h&&(h=v+h);h>v-1&&(h-=v);if(!u.eq(h).data("wraped")||u.eq(h).data("detached"))b++,g.push(h);k.push(h)}else f=!0}if(b>=m||f)e(g).each(function(a){setTimeout(function(){bb(u.eq(g[a]),g[a])},50*a)}),a().detachSiblings&&u.filter(function(a){for(var c=e(this),b=!1,g=0;g<k.length&&!b;g++)k[g]==a&&(b=!0);return"loading"!=c.data("state")&&!b&&d!=a}).data({detached:!0}).detach()}function Y(c){c||(c=0);clearTimeout(Bb);Bb=setTimeout(function(){na&&f.trigger("showimg",
[x+1,!1,!0])},Math.max(a().autoplay,2*c))}function W(c,d,m,n,g,j,o){function h(){a().caption&&((Za=M[l].caption?M[l].caption:M[l].title)?ga.html(Za).show():ga.html("").hide())}function B(){if(a().shadows||!a().touchStyle)p.removeClass(b+"__frame_active"),c.addClass(b+"__frame_active")}var p,K,r,l=u.index(c);u.each(function(){e(this).unbind("load."+b+" error."+b)});"number"!=typeof g&&(g=n?0:a().transitionDuration);!n&&d&&d.altKey&&(g*=10);d=c.data("state");"loading"==d||!d?(T("loading",l,g),c.one("load."+
b,function(){T("loaded",l,g);h()}),c.one("error."+b,function(){T("error",l,g);h()})):"error"==d?T("error",l,g):d!=Ja&&T("loaded",l,0);h();H?(p=H,r=x,a().thumbs&&(K=da)):(p=u.not(c),a().thumbs&&(K=J.not(J.eq(l))));a().thumbs&&(da=J.eq(l),r&&(zb=r),K.removeClass(b+"__thumb_selected").data("disabled",!1),da.addClass(b+"__thumb_selected").data("disabled",!0));a().thumbs&&a().thumbsPreview&&(r!=l||n)&&U(g,m);if(a().touchStyle)m=-l*(s+a().margin),B(),ca(E,m,g,j);else{var t=function(d){if(r!=l||n){var b=
g,e=0;if(d){b=0;e=g}u.not(p.stop()).stop().fadeTo(0,0);setTimeout(function(){B();c.stop().fadeTo(b,1,function(){p.not(c).stop().fadeTo(e,0,function(){a().flexible&&k()})})},10)}};"loaded"==d?t():"error"==d?t(!0):(c.one("load."+b,function(){t()}),c.one("error."+b,function(){t(true)}))}H=c;x=l;a().hash&&document.location.replace("#"+(x+1));na&&!o&&a().stopAutoplayOnAction&&(na=!1);Y(g);var q=Q();f.data(q);a().arrows&&((0==x||2>v)&&!a().loop?xa.addClass(b+"__arr_disabled").data("disabled",!0):xa.removeClass(b+
"__arr_disabled").data("disabled",!1),(x==v-1||2>v)&&!a().loop?ya.addClass(b+"__arr_disabled").data("disabled",!0):ya.removeClass(b+"__arr_disabled").data("disabled",!1));var V=c.data("wraped");clearTimeout(Cb);Cb=setTimeout(function(){if(!V&&l!=a().startImg){bb(c,l);a().onShowImg&&a().onShowImg.call(f[0],q,o)}Ob(c,l)},g+10);if(V||l==a().startImg)bb(c,l),a().onShowImg&&a().onShowImg.call(f[0],q,o)}function X(c,d){d.stopPropagation();d.preventDefault();var b=x+c;0>b&&(b=a().loop?v-1:0);b>v-1&&(b=a().loop?
0:v-1);W(u.eq(b),d)}function oa(){clearTimeout(Db);Db=setTimeout(function(){z()},50)}function pa(){Eb||(aa.bind("resize",oa),o&&window.addEventListener("orientationchange",oa,!1),Eb=!0)}f.data({ini:!0,options:a});a=function(){return f.data("options")};a().backgroundColor&&!a().background&&(a().background=a().backgroundColor);a().thumbsBackgroundColor&&!a().navBackground&&(a().navBackground=a().thumbsBackgroundColor);a().thumbColor&&!a().dotColor&&(a().dotColor=a().thumbColor);null!==a().click&&(a().pseudoClick=
a().click);if(!0===a().nav||"true"==a().nav||"thumbs"==a().nav)a().thumbs=!0,a().thumbsPreview=!0;else if("dots"==a().nav)a().thumbs=!0,a().thumbsPreview=!1;else if(!1===a().nav||"false"==a().nav||"none"==a().nav)a().thumbs=!1;a().caption&&(!0===a().caption||"true"==a().caption||"simple"==a().caption?a().caption=!0:"overlay"!=a().caption&&(a().caption=!1));"top"==a().navPosition?(a().thumbsOnTop=!0,a().thumbsOnRight=!1):"right"==a().navPosition?(a().thumbsOnTop=!1,a().thumbsOnRight=!0):"bottom"==
a().navPosition?(a().thumbsOnTop=!1,a().thumbsOnRight=!1):"left"==a().navPosition&&(a().thumbsOnTop=!1,a().thumbsOnRight=!1);var Ja,ma=(new Date).getTime();a().hash&&document.location.hash&&(a().startImg=parseInt(document.location.hash.replace("#",""))-1);var M,db=a().data&&("object"==typeof a().data||"string"==typeof a().data);M=db?e(a().data).filter(function(){return this.img||this.href||this.length}):f.children().filter(function(){var a=e(this);return(a.is("a")&&a.children("img").size()||a.is("img"))&&
(a.attr("href")||a.attr("src")||a.children().attr("src"))});var v=M.size();f.data({size:v});a().preload=Math.min(a().preload,v);if(a().startImg>v-1||"number"!=typeof a().startImg)a().startImg=0;var p=[];M.each(function(c){if(db)p[c]={imgHref:this.img?this.img:this.href?this.href:this.length?""+this:null,thumbSrc:this.thumb,imgRel:this.full};else{var d=e(this);p[c]={imgHref:d.attr("href"),imgSrc:d.attr("src"),thumbSrc:d.children().attr("src"),imgRel:d.attr("rel")?d.attr("rel"):d.children().attr("rel")};
if(a().caption)this.caption=d.attr("alt")||d.children().attr("alt")}});f.html("").addClass(b+" "+(a().vertical?b+"_vertical":b+"_horizontal"));if(eb||wa)var Da=f.wrap('<div class="fotorama-outer"></div>').parent();a().arrows||(a().loop=!0);var la=[],s,Ha,j,m,ia,ua,Ua=1,$=!0,Z=!0,ja,ta={no:/^[0-9.]+$/,px:/^[0-9.]+px/,"%":/^[0-9.]+%/},C,Ga,Fa,Ca,sb,tb,wb,cb,rb,q,Eb,Ka,yb,Fb,Gb,Cb,na,Bb;if(!0===a().autoplay||"true"==a().autoplay||0<a().autoplay)na=!0;"number"!=typeof a().autoplay&&(a().autoplay=5E3);
if(a().touchStyle)var Va=0,ub,za=!1,va=!1,Hb;if(a().thumbs&&a().thumbsPreview)var fa=!1,La=!1,Na=!1,ka=!1,Ib,ab=!1,Oa=0;var G,Ia,N,Pa,L,S;a().vertical?(G="top",Ia="left",N="pageY",Pa="pageX",L="height",S="width"):(G="left",Ia="top",N="pageX",Pa="pageY",L="width",S="height");var r=e('<div class="'+b+'__wrap"></div>').appendTo(f),E=e('<div class="'+b+'__shaft"></div>').appendTo(r);a().touchStyle||(Ea(r),Ea(E));var O=e('<div class="'+b+'__state"></div>').appendTo(E);("white"==a().preloader||a().background&&
a().background.match(/(white|#fff|#FFF)/))&&O.addClass(b+"__state_white");var xb;if(a().fullscreenIcon)var ha=e('<div class="'+b+'__fsi"><i class="i1"><i class="i1"></i></i><i class="i2"><i class="i2"></i></i><i class="i3"><i class="i3"></i></i><i class="i4"><i class="i4"></i></i><i class="i0"></i></div>').appendTo(r);o&&f.addClass(b+"_touch");wa&&(a().shadows=!1);a().touchStyle?(r.addClass(b+"__wrap_style_touch"),a().shadows&&r.append('<i class="'+b+"__shadow "+b+'__shadow_prev"></i><i class="'+
b+"__shadow "+b+'__shadow_next"></i>')):r.addClass(b+"__wrap_style_fade");a().shadows&&f.addClass(b+"_shadows");ra&&f.addClass(b+"_csstransitions");if(a().arrows){var fb,gb;a().vertical?(fb=a().arrowPrev?a().arrowPrev:"&#9650;",gb=a().arrowNext?a().arrowNext:"&#9660;"):(fb=a().arrowPrev?a().arrowPrev:"&#9668;",gb=a().arrowNext?a().arrowNext:"&#9658;");var ba=e('<i class="'+b+"__arr "+b+'__arr_prev">'+fb+'</i><i class="'+b+"__arr "+b+'__arr_next">'+gb+"</i>").appendTo(r),xa=ba.eq(0),ya=ba.eq(1);Ea(ba);
if(!o&&a().pseudoClick){var Jb,Kb,Ta=function(){clearTimeout(Kb);Kb=setTimeout(function(){var c=Jb>=s/2;ya[!c?"removeClass":"addClass"](b+"__arr_hover");xa[c?"removeClass":"addClass"](b+"__arr_hover");a().touchStyle||E.css({cursor:c&&ya.data("disabled")||!c&&xa.data("disabled")?"default":"pointer"})},10)};r.mousemove(function(a){Jb=a[N]-r.offset()[G];Ta()})}}else!a().touchStyle&&a().pseudoClick&&1<v&&E.css({cursor:"pointer"});if(!o){var hb=!1,ib,Pb=function(){hb=true;clearTimeout(ib);a().arrows&&
ba.css(sa(0));r.removeClass(b+"__wrap_mouseout");setTimeout(function(){a().arrows&&ba.css(sa(a().transitionDuration));setTimeout(function(){r.addClass(b+"__wrap_mouseover")},1)},1)},Lb=function(){clearTimeout(ib);ib=setTimeout(function(){!za&&!hb&&r.removeClass(b+"__wrap_mouseover").addClass(b+"__wrap_mouseout")},a().transitionDuration*3)};r.mouseenter(function(){Pb()});r.mouseleave(function(){hb=false;Lb()})}var H,x,Za,u=e();M.each(function(){var a=e('<div class="'+b+'__frame" style="visibility: hidden;"></div>');
u=u.add(a)});if(a().thumbs){var D=Number(a().thumbSize);if(isNaN(D)||!D)D=a().vertical?64:48;var da,zb=0,w=e('<div class="'+b+'__thumbs" style="visibility: hidden;"></div>')[a().thumbsOnTop?"prependTo":"appendTo"](f);a().touchStyle||Ea(w);var F;a().thumbsPreview&&(F=D+2*a().thumbMargin,w.addClass(b+"__thumbs_previews").css(S,F));var t=e('<div class="'+b+'__thumbs-shaft"></div>').appendTo(w);if(a().thumbsPreview){var I=0,R=void 0;a().shadows&&e('<i class="'+b+"__shadow "+b+'__shadow_prev"></i><i class="'+
b+"__shadow "+b+'__shadow_next"></i>').appendTo(w);var Qb=D-(Ab?0:2*a().thumbBorderWidth),Rb=a().thumbMargin,Qa={};Qa[S]=Qb;Qa[Ia]=Rb;Qa.borderWidth=a().thumbBorderWidth;var ea=e('<i class="'+b+'__thumb-border"></i>').css(Qa).appendTo(t),Ma}M.each(function(){var c;if(a().thumbsPreview){c=e('<div class="'+b+'__thumb"></div>');var d={};d[S]=D;d.margin=a().thumbMargin;c.css(d)}else c=e('<i class="'+b+'__thumb"><i class="'+b+'__thumb__dot"></i></i>');c.appendTo(t)});var J=e("."+b+"__thumb",f);if(a().thumbsPreview)var Sb=
function(c,d,f,n,g,k){d=e(c);n=a().vertical?Math.round(D/n):Math.round(D*n);if(Ra.canvas){d.remove();d=e('<canvas class="'+b+'__thumb__img"></canvas>');d.appendTo(J.eq(k))}else d.addClass(b+"__thumb__img");f={};f[L]=n;f[S]=D;d.attr(f).css(f).css({visibility:"visible"});if(Ra.canvas){d[0].getContext("2d");d[0].getContext("2d").drawImage(c,0,0,a().vertical?D:n,a().vertical?n:D)}I=I+(n+a().thumbMargin-(D+a().thumbMargin));t.css(L,I);f[S]=null;J.eq(k).css(f).data(f);vb()},jb=function(a){if(!ka&&!fa&&
!va&&!Ka){a||(a=0);V(a,J.eq(a),Sb,"thumb");setTimeout(function(){a+1<v&&jb(a+1)},50)}else setTimeout(function(){jb(a)},100)}}if(a().caption){var ga=e('<p class="'+b+'__caption"></p>');if("overlay"==a().caption)ga.appendTo(r).addClass(b+"__caption_overlay");else{ga.appendTo(f);var Tb=ga.wrap('<div class="'+b+'__caption-outer"></div>').parent()}}ob(a().width,a().height,a().aspectRatio);var Xa=[];W(u.eq(a().startImg),!1,!1,!0,!1,!1,!0);j&&m&&(cb=!0,z());a().thumbs&&a().thumbsPreview&&jb(0);a().thumbs&&
(a().dotColor&&!a().thumbsPreview&&J.children().css({backgroundColor:a().dotColor}),a().navBackground&&w.css({background:a().navBackground}),a().thumbsPreview&&a().thumbBorderColor&&ea.css({borderColor:a().thumbBorderColor}));a().background&&r.add(u).css({background:a().background});a().arrowsColor&&a().arrows&&ba.css({color:a().arrowsColor});var Db=!1;pa();f.bind("dblclick",Nb);f.bind("showimg",function(c,d,b,f){if(typeof d!="number")if(d=="next")d=x+1;else if(d=="prev")d=x-1;else if(d=="first")d=
0;else if(d=="last")d=v-1;else{d=x;f=true}d>v-1&&(d=0);(!a().touchStyle||!va)&&W(u.eq(d),c,false,false,b,false,f)});f.bind("play",function(c,d){na=true;d=Number(d);if(!isNaN(d))a().autoplay=d;Y(y)});f.bind("pause",function(){na=false});f.bind("rescale",function(a,d,b,f,g){ob(d,b,f);Fa=C=j/m;rb=!ja;g=Number(g);isNaN(g)&&(g=0);z(false,g)});f.bind("fullscreenopen",function(){Fb=aa.scrollTop();Gb=aa.scrollLeft();q=true;ha&&ha.trigger("mouseleave",true);aa.scrollTop(0);kb.add(Sa).addClass("fullscreen");
f.addClass(b+"_fullscreen");(eb||wa)&&f.appendTo(Sa).addClass(b+"_fullscreen_quirks");a().caption&&!a().caption!="overlay"&&ga.appendTo(r);pa();H&&W(H,false,false,true,0,false,true);z(false,false,true)});f.bind("fullscreenclose",function(){q=false;ha&&ha.trigger("mouseleave",true);kb.add(Sa).removeClass("fullscreen");f.removeClass(b+"_fullscreen");(eb||wa)&&f.appendTo(Da).removeClass(b+"_fullscreen_quirks");a().caption&&!a().caption!="overlay"&&ga.appendTo(Tb);aa.scrollTop(Fb);aa.scrollLeft(Gb);if(!ja){j=
a().width;m=a().height}H&&W(H,false,false,true,0,false,true);a().flexible?k():z(false,false,true)});Aa.bind("keydown",function(c){q&&(c.keyCode==27&&!a().fullscreen?f.trigger("fullscreenclose"):c.keyCode==39||c.keyCode==40?f.trigger("showimg",x+1):(c.keyCode==37||c.keyCode==38)&&f.trigger("showimg",x-1))});if(a().thumbs){var lb=function(a){a.stopPropagation();if(!e(this).data("disabled")){var d=J.index(e(this)),b=a[N]-w.offset()[G];W(u.eq(d),a,b)}};J.bind("click",lb)}a().arrows&&(xa.bind("click",
function(a){e(this).data("disabled")||X(-1,a)}),ya.bind("click",function(a){e(this).data("disabled")||X(1,a)}));!a().touchStyle&&!o&&a().pseudoClick&&r.bind("click",function(c){var b=c[N]-r.offset()[G]>=s/2;if(a().onClick)var e=a().onClick.call(f[0],Q());e!==false&&(!c.shiftKey&&b&&a().arrows||c.shiftKey&&!b&&a().arrows||!a().arrows&&!c.shiftKey?X(1,c):X(-1,c))});ha&&ha.bind("click",function(a){a.stopPropagation();f.trigger(q?"fullscreenclose":"fullscreenopen")}).bind("mouseenter mouseleave",function(a,
d){d&&a.stopPropagation();ha[a.type=="mouseenter"?"addClass":"removeClass"](b+"__fsi_hover")});a().fullscreen&&f.trigger("fullscreenopen");if(a().touchStyle||o||a().thumbs&&a().thumbsPreview)var Mb=function(c,b,f,e){function g(f){if((o||f.which<2)&&H){var g=function(){t=(new Date).getTime();p=l;r=j;q=[[t,l]];clearTimeout(c.data("backAnimate"));ra?c.css(sa(0)):c.stop();h=c.position()[G];c.css(qa(h,a().vertical));s=h;b()};if(o)if(o&&f.targetTouches.length==1){l=f.targetTouches[0][N];j=f.targetTouches[0][Pa];
g();c[0].addEventListener("touchmove",k,false);c[0].addEventListener("touchend",m,false)}else{if(o&&f.targetTouches.length>1)return false}else{l=f[N];f.preventDefault();g();Aa.mousemove(k);Aa.mouseup(m)}}}function k(b){function d(){b.preventDefault();v=(new Date).getTime();q.push([v,l]);var g=p-l;h=s-g;if(h>c.data("maxPos")){h=Math.round(h+(c.data("maxPos")-h)/1.5);z="left"}else if(h<c.data("minPos")){h=Math.round(h+(c.data("minPos")-h)/1.5);z="right"}else z=false;a().touchStyle&&c.css(qa(h,a().vertical));
f(h,g,z)}if(o){if(o&&b.targetTouches.length==1){l=b.targetTouches[0][N];j=b.targetTouches[0][Pa];if(w)A===true&&d();else if(Math.abs(l-p)-Math.abs(j-r)>=-5){A=true;b.preventDefault();w=true}else if(Math.abs(j-r)-Math.abs(l-p)>=-5){A="prevent";w=true}}}else{l=b[N];d()}}function m(a){if(!o||!a.targetTouches.length){if(o){c[0].removeEventListener("touchmove",k,false);c[0].removeEventListener("touchend",m,false)}else{Aa.unbind("mouseup");Aa.unbind("mousemove")}u=(new Date).getTime();var b=-h,d=u-Ba,f,
g,j,p;for(i=0;i<q.length;i++){f=Math.abs(d-q[i][0]);if(i==0){g=f;j=u-q[i][0];p=q[i][1]}if(f<=g){g=f;j=q[i][0];p=q[i][1]}}d=p-l;f=d>=0;j=u-j;e(b,j,j<=Ba,u-x,f===V,d,a,A);x=u;V=f;w=A=false}}var h,l,j,p,r,s,t,q=[],v,V,u,x=0,A=false,w=false,z=false;o?c[0].addEventListener("touchstart",g,false):c.mousedown(g)};if(a().touchStyle||o){var mb=!1;Mb(E,function(){va=true},function(c,d,f){clearTimeout(Hb);if(!za){a().shadows&&r.addClass(b+"__wrap_shadow");o||E.addClass(b+"__shaft_grabbing");za=true}if(a().shadows)if(f){c=
f=="left"?"right":"left";r.addClass(b+"__wrap_shadow_no-"+f).removeClass(b+"__wrap_shadow_no-"+c)}else a().shadows&&r.removeClass(b+"__wrap_shadow_no-left "+b+"__wrap_shadow_no-right");if(Math.abs(d)>=5&&!mb){mb=true;e("a",r).bind("click",pb)}},function(c,d,k,n,g,j,l,h){va=false;Hb=setTimeout(function(){!o&&a().arrows&&Lb();mb=false;e("a",r).unbind("click",pb)},Ba);o||E.removeClass(b+"__shaft_grabbing");a().shadows&&r.removeClass(b+"__wrap_shadow");var g=n=false,m,p;if(a().html){m=e(l.target);p=m.filter("a");
p.length||(p=m.parents("a"))}if(a().touchStyle)if(za){k&&(j<=-10?n=true:j>=10&&(g=true));k=y;h=Math.round(c/(s+a().margin));if(n||g){var d=-j/d,j=Math.round(-c+d*250),q;if(n){h=Math.ceil(c/(s+a().margin))-1;c=-h*(s+a().margin);if(j>c){q=Math.abs(j-c);k=Math.abs(k/(d*250/(Math.abs(d*250)-q*0.97)));q=c+q*0.03}}else if(g){h=Math.floor(c/(s+a().margin))+1;c=-h*(s+a().margin);if(j<c){q=Math.abs(j-c);k=Math.abs(k/(d*250/(Math.abs(d*250)-q*0.97)));q=c-q*0.03}}}if(h<0){h=0;q=false;k=y}if(h>v-1){h=v-1;q=false;
k=y}W(u.eq(h),l,false,false,k,q)}else{if(a().html&&p.length)return false;if(a().onClick&&h!="prevent")var t=a().onClick.call(f[0],Q());if(t!==false&&a().pseudoClick&&!o&&d<Ba){q=l[N]-r.offset()[G]>=s/2;!l.shiftKey&&q&&a().arrows||l.shiftKey&&!q&&a().arrows||!a().arrows&&!l.shiftKey?X(1,l):X(-1,l)}else W(H,l,false,false,false,false,true)}else{if(j==0&&a().html&&p.length)return false;j>=0?X(1,l):j<0&&X(-1,l)}za=false});if(a().touchStyle&&a().thumbs&&a().thumbsPreview){var nb=!1;Mb(t,function(){La=fa=
true},function(a,b){if(!ka&&Math.abs(b)>=5){J.unbind("click",lb);nb=true;clearTimeout(Ib);ka=true}l(a)},function(a,b,f,e,g,k,j){ka=fa=false;Ib=setTimeout(function(){if(nb){J.bind("click",lb);nb=false}},Ba);var e=a=-a,h,g=y*2;if(Na&&ka){U(0,false,false);Na=false}if(a>t.data("maxPos")){e=t.data("maxPos");g=g/2}else if(a<t.data("minPos")){e=t.data("minPos");g=g/2}else if(f){b=-k/b;e=Math.round(a+b*250);if(e>t.data("maxPos")){h=Math.abs(e-t.data("maxPos"));g=Math.abs(g/(b*250/(Math.abs(b*250)-h*0.96)));
e=t.data("maxPos");h=e+h*0.04}else if(e<t.data("minPos")){h=Math.abs(e-t.data("minPos"));g=Math.abs(g/(b*250/(Math.abs(b*250)-h*0.96)));e=t.data("minPos");h=e-h*0.04}}j.altKey&&(g=g*10);R=e;if(e!=a){ca(t,e,g,h);l(e)}})}}}var Ra=function(b,a,e){function o(a,b){var e=a.charAt(0).toUpperCase()+a.substr(1),e=(a+" "+Q.join(e+" ")+e).split(" ");return z(e,b)}function z(a,b){for(var f in a)if(T[a[f]]!==e)return"pfx"==b?a[f]:!0;return!1}b={};a.head||a.getElementsByTagName("head");var k=a.createElement("modernizr"),
T=k.style,Q=["Webkit","Moz","O","ms","Khtml"],k={},ca=[],U,l={}.hasOwnProperty,y;typeof l!==e&&typeof l.call!==e?y=function(a,b){return l.call(a,b)}:y=function(a,b){return b in a&&typeof a.constructor.prototype[b]===e};k.canvas=function(){var b=a.createElement("canvas");return!!b.getContext&&!!b.getContext("2d")};k.csstransforms=function(){return!!z(["transformProperty","WebkitTransform","MozTransform","OTransform","msTransform"])};k.csstransitions=function(){return o("transitionProperty")};for(var P in k)y(k,
P)&&(U=P.toLowerCase(),b[U]=k[P](),ca.push((b[U]?"":"no-")+U));T.cssText="";k=null;b._version="2.0.6";b._domPrefixes=Q;b.testProp=function(a){return z([a])};b.testAllProps=o;return b}(this,this.document);e.extend({bez:function(b){var a="bez_"+e.makeArray(arguments).join("_").replace(".","p");if("function"!=typeof jQuery.easing[a]){var o=function(a,b){var e=[null,null],f=[null,null],o=[null,null],y=function(y,l){return o[l]=3*a[l],f[l]=3*(b[l]-a[l])-o[l],e[l]=1-o[l]-f[l],y*(o[l]+y*(f[l]+y*e[l]))};
return function(a){for(var b=a,A=0,z;14>++A;){z=y(b,0)-a;if(0.001>Math.abs(z))break;b-=z/(o[0]+b*(2*f[0]+3*e[0]*b))}return y(b,1)}};jQuery.easing[a]=function(a,e,k,y,Q){return y*o([b[0],b[1]],[b[2],b[3]])(e/Q)+k}}return a}});var o="ontouchstart"in document,wa=navigator.userAgent.toLowerCase().match(/(iphone|ipod|ipad|iemobile|windows ce|netfront|playstation|midp|up\.browser|symbian|nintendo|wii)/),ra=Ra.csstransforms&&Ra.csstransitions&&!e.browser.mozilla,Wa=e.browser.msie,eb=Wa&&"6.0"==e.browser.version,
Ab="CSS1Compat"!=document.compatMode&&Wa,Ba=300,$a=e.bez([0.1,0,0.25,1]),y=333,b="fotorama",aa=e(window),Aa=e(document),kb,Sa,Y=[["width","string",null],["height","string",null],["aspectRatio","number",null],["touchStyle","boolean",!0],["click","boolean",null],["pseudoClick","boolean",!0],["loop","boolean",!1],["autoplay","boolean-number",!1],["stopAutoplayOnAction","boolean",!0],["transitionDuration","number",y],["background","string",null],["backgroundColor","string",null],["margin","number",5],
["minPadding","number",10],["alwaysPadding","boolean",!1],["zoomToFit","boolean",!0],["cropToFit","boolean",!1],["flexible","boolean",!1],["fitToWindowHeight","boolean",!1],["fullscreen","boolean",!1],["fullscreenIcon","boolean",!1],["vertical","boolean",!1],["arrows","boolean",!0],["arrowsColor","string",null],["arrowPrev","string",null],["arrowNext","string",null],["nav","string",null],["thumbs","boolean",!0],["navPosition","string",null],["thumbsOnTop","boolean",!1],["thumbsOnRight","boolean",
!1],["navBackground","string",null],["thumbsBackgroundColor","string",null],["dotColor","string",null],["thumbColor","string",null],["thumbsPreview","boolean",!0],["thumbSize","number",null],["thumbMargin","number",5],["thumbBorderWidth","number",3],["thumbBorderColor","string",null],["caption","string",!1],["preload","number",3],["preloader","boolean","dark"],["shadows","boolean",!0],["data","array",null],["html","array",null],["hash","boolean",!1],["startImg","number",0],["onShowImg","function",
null],["onClick","function",null],["onSlideStop","function",null],["detachSiblings","boolean",!0]];e.fn[b]=function(b){"undefined"==typeof fotoramaDefaults&&(fotoramaDefaults={});var a=e.extend(oa(),e.extend({},fotoramaDefaults,b));this.each(function(){var b=e(this);b.data("ini")||Ta(b,a)});return this};e(function(){kb=e("html");Sa=e("body");e("."+b).each(function(){var f=e(this);f[b](oa(f))})});var Da=["-webkit-","-moz-","-o-","-ms-",""],Ca=new Image,Ya=!0;Ca.onerror=function(){if(1!=this.width||
1!=this.height)Ya=!1};Ca.src="data:image/gif;base64,R0lGODlhAQABAIABAP///wAAACH5BAEKAAEALAAAAAABAAEAAAICTAEAOw=="})(jQuery);
/* ../../blocks/b-fotorama/b-fotorama.js: end */ /**/

/* ../../blocks/i-jquery/__xmlns/i-jquery__xmlns.js: begin */ /**/
//
//  jquery.xmlns.js:  xml-namespace selector support for jQuery
//
//  This plugin modifies the jQuery tag and attribute selectors to
//  support optional namespace specifiers as defined in CSS 3:
//
//    $("elem")      - matches 'elem' nodes in the default namespace
//    $("|elem")     - matches 'elem' nodes that don't have a namespace
//    $("NS|elem")   - matches 'elem' nodes in declared namespace 'NS'
//    $("*|elem")    - matches 'elem' nodes in any namespace
//    $("NS|*")      - matches any nodes in declared namespace 'NS'
//
//  A similar synax is also supported for attribute selectors, but note
//  that the default namespace does *not* apply to attributes - a missing
//  or empty namespace selector selects only attributes with no namespace.
//
//  In a slight break from the W3C standards, and with a nod to ease of
//  implementation, the empty namespace URI is treated as equivalent to
//  an unspecified namespace.  Plenty of browsers seem to make the same
//  assumption...
//
//  Namespace declarations live in the $.xmlns object, which is a simple
//  mapping from namespace ids to namespace URIs.  The default namespace
//  is determined by the value associated with the empty string.
//
//    $.xmlns.D = "DAV:"
//    $.xmlns.FOO = "http://www.foo.com/xmlns/foobar"
//    $.xmlns[""] = "http://www.example.com/new/default/namespace/"
//
//  Unfortunately this is a global setting - I can't find a way to do
//  query-object-specific namespaces since the jQuery selector machinery
//  is stateless.  However, you can use the 'xmlns' function to push and
//  pop namespace delcarations with ease:
//
//    $().xmlns({D:"DAV:"})     // pushes the DAV: namespace
//    $().xmlns("DAV:")         // makes DAV: the default namespace
//    $().xmlns(false)          // pops the namespace we just pushed
//    $().xmlns(false)          // pops again, returning to defaults
//
//  To execute this as a kind of "transaction", pass a function as the
//  second argument.  It will be executed in the context of the current
//  jQuery object:
//
//    $().xmlns("DAV:",function() {
//      //  The default namespace is DAV: within this function,
//      //  but it is reset to the previous value on exit.
//      return this.find("response").each(...);
//    }).find("div")
//
//  If you pass a string as a function, it will be executed against the
//  current jQuery object using find(); i.e. the following will find all
//  "href" elements in the "DAV:" namespace:
//
//    $().xmlns("DAV:","href")
//
// 
//  And finally, the legal stuff:
//
//    Copyright (c) 2009, Ryan Kelly.
//    TAG and ATTR functions derived from jQuery's selector.js.
//    Dual licensed under the MIT and GPL licenses.
//    http://docs.jquery.com/License
//

(function($) {

//  Some common default namespaces, that are treated specially by browsers.
//
var default_xmlns = {
    "xml": "http://www.w3.org/XML/1998/namespace",
    "xmlns": "http://www.w3.org/2000/xmlns/",
    "html": "http://www.w3.org/1999/xhtml/"
};
 

//  A reverse mapping for common namespace prefixes.
//
var default_xmlns_rev = {}
for(var k in default_xmlns) {
    default_xmlns_rev[default_xmlns[k]] = k;
}


//  $.xmlns is a mapping from namespace identifiers to namespace URIs.
//  The default default-namespace is "*", and we provide some additional
//  defaults that are specified in the XML Namespaces standard.
//
$.extend({xmlns: $.extend({},default_xmlns,{"":"*"})});


//  jQuery method to push/pop namespace declarations.
//
//  If a single argument is specified:
//    * if it's a mapping, push those namespaces onto the stack
//    * if it's a string, push that as the default namespace
//    * if it evaluates to false, pop the latest namespace
//
//  If two arguments are specified, the second is executed "transactionally"
//  using the namespace declarations found in the first.  It can be either a
//  a selector string (in which case it is passed to this.find()) or a function
//  (in which case it is called in the context of the current jQuery object).
//  The given namespace mapping is automatically pushed before executing and
//  popped afterwards.
//
var xmlns_stack = [];
$.fn.extend({xmlns: function(nsmap,func) {
    if(typeof nsmap == "string") {
        nsmap = {"":nsmap};
    }
    if(nsmap) {
        xmlns_stack.push($.xmlns);
        $.xmlns = $.extend({},$.xmlns,nsmap);
        if(func !== undefined) {
            if(typeof func == "string") {
                return this.find(func).xmlns(undefined)
            } else {
                var self = this;
                try {
                    self = func.call(this);
                    if(!self) {
                        self = this;
                    }
                } finally {
                    self.xmlns(undefined);
                }
                return self
            }
        } else {
            return this;
        }
    } else {
        $.xmlns = (xmlns_stack ? xmlns_stack.pop() : {});
        return this;
    }
}});


//  Convert a namespace prefix into a namespace URI, based
//  on the delcarations made in $.xmlns.
//
var getNamespaceURI = function(id) {
    // No namespace id, use the default.
    if(!id) {
        return $.xmlns[""];
    }
    // Strip the pipe character from the specifier
    id = id.substr(0,id.length-1);
    // Certain special namespaces aren't mapped to a URI
    if(id == "" || id == "*") {
        return id;
    }
    var ns = $.xmlns[id];
    if(typeof(ns) == "undefined") {
        throw "Syntax error, undefined namespace prefix '" + id + "'";
    }
    return ns;
};


//  Update the regex used by $.expr to parse selector components for a
//  particular type of selector (e.g. "TAG" or "ATTR").
//
//  This logic is taken straight from the jQuery/Sizzle sources.
//
var setExprMatchRegex = function(type,regex) {
  $.expr.match[type] = new RegExp(regex.source + /(?![^\[]*\])(?![^\(]*\))/.source);
  if($.expr.leftMatch) {
      $.expr.leftMatch[type] = new RegExp(/(^(?:.|\r|\n)*?)/.source + $.expr.match[type].source.replace(/\\(\d+)/g, function(all, num){
          return "\\" + (num - 0 + 1);
      }));
  }
}



//  Modify the TAG match regexp to include optional namespace selector.
//  This is basically (namespace|)?(tagname).
//
setExprMatchRegex("TAG",/^((?:((?:[\w\u00c0-\uFFFF\*_-]*\|)?)((?:[\w\u00c0-\uFFFF\*_-]|\\.)+)))/);


//  Perform some capability-testing.
//
var div = document.createElement("div");

//  Sometimes getElementsByTagName("*") will return comment nodes,
//  which we will have to remove from the results.
//
var gebtn_yields_comments = false;
div.appendChild(document.createComment(""));
if(div.getElementsByTagName("*").length > 0) {
    gebtn_yields_comments = true;
}

//  Some browsers return node.localName in upper case, some in lower case.
//
var localname_is_uppercase = true;
if(div.localName && div.localName == "div") {
    localname_is_uppercase = false;
}

//  Allow the testing div to be garbage-collected.
//
div = null;


//  Modify the TAG find function to account for a namespace selector.
//
$.expr.find.TAG = function(match,context,isXML) {
    var ns = getNamespaceURI(match[2]);
    var ln = match[3];
    var res;
    if(typeof context.getElementsByTagNameNS != "undefined") {
        //  Easy case - we have getElementsByTagNameNS
        res = context.getElementsByTagNameNS(ns,ln);
    } else if(typeof context.selectNodes != "undefined") {
        //  Use xpath if possible (not available on HTML DOM nodes in IE)
        if(context.ownerDocument) {
            context.ownerDocument.setProperty("SelectionLanguage","XPath");
        } else {
            context.setProperty("SelectionLanguage","XPath");
        }
        var predicate = "";
        if(ns != "*") {
            if(ln != "*") {
                predicate="namespace-uri()='"+ns+"' and local-name()='"+ln+"'";
            } else {
                predicate="namespace-uri()='"+ns+"'";
            }
        } else {
            if(ln != "*") {
                predicate="local-name()='"+ln+"'";
            }
        }
        if(predicate) {
            res = context.selectNodes("descendant-or-self::*["+predicate+"]");
        } else {
            res = context.selectNodes("descendant-or-self::*");
        }
    } else {
        //  Otherwise, we need to simulate using getElementsByTagName
        res = context.getElementsByTagName(ln); 
        if(gebtn_yields_comments && ln == "*") {
            var tmp = [];
            for(var i=0; res[i]; i++) {
                if(res[i].nodeType == 1) {
                    tmp.push(res[i]);
                }
            }
            res = tmp;
        }
        if(res && ns != "*") {
            var tmp = [];
            for(var i=0; res[i]; i++) {
               if(res[i].namespaceURI == ns || res[i].tagUrn == ns) {
                   tmp.push(res[i]);
               }
            }
            res = tmp;
        }
    }
    return res;
};


//  Check whether a node is part of an XML document.
//  Copied verbatim from jQuery sources, needed in TAG preFilter below.
//
var isXML = function(elem){
    return elem.nodeType === 9 && elem.documentElement.nodeName !== "HTML" ||
            !!elem.ownerDocument && elem.ownerDocument.documentElement.nodeName !== "HTML";
};


//  Modify the TAG preFilter function to work with modified match regexp.
//  This normalises case of the tag name if we're in a HTML document.
//
$.expr.preFilter.TAG = function(match, curLoop, inplace, result, not, isXML) {
  var ln = match[3];
  if(!isXML) {
      if(localname_is_uppercase) {
          ln = ln.toUpperCase();
      } else {
          ln = ln.toLowerCase();
      }
  }
  return [match[0],getNamespaceURI(match[2]),ln];
};


//  Modify the TAG filter function to account for a namespace selector.
//
$.expr.filter.TAG = function(elem,match) {
    var ns = match[1];
    var ln = match[2];
    var e_ns = elem.namespaceURI ? elem.namespaceURI : elem.tagUrn;
    var e_ln = elem.localName ? elem.localName : elem.tagName;
    if(ns == "*" || e_ns == ns || (ns == "" && !e_ns)) {
        return ((ln == "*" && elem.nodeType == 1)  || e_ln == ln);
    }
    return false;
};


//  Modify the ATTR match regexp to extract a namespace selector.
//  This is basically ([namespace|])(attrname)(op)(quote)(pattern)(quote)
//
setExprMatchRegex("ATTR",/\[\s*((?:((?:[\w\u00c0-\uFFFF\*_-]*\|)?)((?:[\w\u00c0-\uFFFF_-]|\\.)+)))\s*(?:(\S?=)\s*(['"]*)(.*?)\5|)\s*\]/);


//  Modify the ATTR preFilter function to account for new regexp match groups,
//  and normalise the namespace URI.
//
$.expr.preFilter.ATTR = function(match, curLoop, inplace, result, not, isXML) {
    var name = match[3].replace(/\\/g, "");
    if(!isXML && $.expr.attrMap[name]) {
        match[3] = $.expr.attrMap[name];
    }
    if( match[4] == "~=" ) {
        match[6] = " " + match[6] + " ";
    }
    if(!match[2] || match[2] == "|") {
        match[2] = "";
    } else {
        match[2] = getNamespaceURI(match[2]);
    }
    return match;
};


//  Modify the ATTR filter function to account for namespace selector.
//  Unfortunately this means factoring out the attribute-checking code
//  into a separate function, since it might be called multiple times.
//
var filter_attr = function(result,type,check) {
    var value = result + "";
    return result == null ?
                type === "!=" :
                type === "=" ?
                value === check :
                type === "*=" ?
                value.indexOf(check) >= 0 :
                type === "~=" ?
                (" " + value + " ").indexOf(check) >= 0 :
                !check ?
                value && result !== false :
                type === "!=" ?
                value != check :
                type === "^=" ?
                value.indexOf(check) === 0 :
                type === "$=" ?
                value.substr(value.length - check.length) === check :
                type === "|=" ?
                value === check || value.substr(0,check.length+1)===check+"-" :
                false;
}


$.expr.filter.ATTR = function(elem, match) {
    var ns = match[2];
    var name = match[3];
    var type = match[4];
    var check = match[6];
    var result;
    //  No namespace, just use ordinary attribute lookup.
    if(ns == "") {
        result = $.expr.attrHandle[name] ?
                     $.expr.attrHandle[name](elem) :
                     elem[name] != null ?
                         elem[name] :
                         elem.getAttribute(name);
        return filter_attr(result,type,check);
    }
    //  Directly use getAttributeNS if applicable and available
    if(ns != "*" && typeof elem.getAttributeNS != "undefined") {
        return filter_attr(elem.getAttributeNS(ns,name),type,check);
    }
    //  Need to iterate over all attributes, either because we couldn't
    //  look it up or because we need to match all namespaces.
    var attrs = elem.attributes;
    for(var i=0; attrs[i]; i++) {
        var ln = attrs[i].localName;
        if(!ln) {
            ln = attrs[i].nodeName
            var idx = ln.indexOf(":");
            if(idx >= 0) {
                ln = ln.substr(idx+1);
            }
        }
        if(ln == name) {
            result = attrs[i].nodeValue;
            if(ns == "*" || attrs[i].namespaceURI == ns) {
                if(filter_attr(result,type,check)) {
                    return true;
                }
            }
            if(attrs[i].namespaceURI === "" && attrs[i].prefix) {
                if(attrs[i].prefix == default_xmlns_rev[ns]) {
                    if(filter_attr(result,type,check)) {
                        return true;
                    }
                }
            }
        }
    }
    return false;
};


})(jQuery);


/* ../../blocks/i-jquery/__xmlns/i-jquery__xmlns.js: end */ /**/

/* ../../blocks/b-gallery/b-gallery.js: begin */ /**/
BEM.DOM.decl('b-gallery', {

    onSetMod : {

        js : function() {

            // инициализация  media rss
            $.xmlns["media"] = "http://search.yahoo.com/mrss";

            var html = '<div class="fotorama" data-width="800" data-height="520">';

            // загрука и парсинг данных
            $.get("/rss/rss.xml", function(data) {

                $(data).find('item').each(function(index){

                    if (index < 30) {

                        var raw = $(this).find("media|thumbnail").attr('url'),
                            title = $(this).find('title').text();

                        if ( raw && ( raw.indexOf('null') < 0 ) ) {
                            raw = raw.substr(0,(raw.length-1));
                            html += '<a href="'+raw+'XL"><img src="'+raw+'XS" alt="'+title+'" /></a>';
                        }

                    }

                });

                html += '</div>';

                $('.b-gallery').html(html);
                $('.fotorama').fotorama({
                    width: 800,
                    height: 520
                });

            }, "xml");

        }

    }

});

/* ../../blocks/b-gallery/b-gallery.js: end */ /**/

