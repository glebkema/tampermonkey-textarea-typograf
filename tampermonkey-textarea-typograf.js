// ==UserScript==
// @name         Textarea Typograf
// @namespace    https://github.com/glebkema/tampermonkey-textarea-typograf
// @description  Replaces hyphens and quotation marks. Works only in the <textarea>. If you select a part of the text, only that part will be processed.
// @author       glebkema
// @copyright    2020, glebkema (https://github.com/glebkema)
// @license      MIT
// @version      0.3.3
// @grant        none
// @run-at       context-menu
// ==/UserScript==

// ==OpenUserJS==
// @author glebkema
// ==/OpenUserJS==

(function() {
    'use strict';

    var element = document.activeElement;
    if (element && 'textarea' == element.tagName.toLowerCase() && element.value) {
        var start = element.selectionStart;
        var end = element.selectionEnd;
        if (start == end) {
            element.value = typograf(element.value);
        } else {
            var selected = element.value.substring(start, end);
            var length = element.value.length;
            element.value = element.value.substring(0, start) + typograf(selected) + element.value.substring(end, length);
        }
    } else {
        // console.info('Start editing a non-empty textarea before calling the script');
    }

    // console.log(typograf('Еще она - не очень еще "еще" любила (Еще и еще). Еще вот еще, еще. И еще'));
    // console.log(typograf('Нее ее. Длиннее еен нее.'));

    function typograf(text) {
        if (text) {
            // dash
            text = text.replace(/ - /gi, ' — ');

            // quotes
            text = text.replace(/^"/gi, '«');
            text = text.replace(/"$/gi, '»');
            text = text.replace(/([\(\s])"/gi, '$1«');
            text = text.replace(/"([.,;\s\)])/gi, '»$1');

            // words with a capital letter and yo
            text = checkWords(text, 'Ещё,Её,Моё,Неё,Своё,Твоё');
            text = checkWords(text, 'Объём,Остриём,Приём,Причём,Огнём,Своём,Твоём');
            text = checkWords(text, 'Василёк,Мотылёк,Огонёк,Пенёк,Ручеёк');
            text = checkWords(text, 'Затёк,Натёк,Потёк');
            text = checkWords(text, 'Грёза,Грёзы,Слёзы');
        }
        return text;
    }

    function checkWords(text, words) {
        if ('string' === typeof words) {
            words = words.split(',');
        }
        for (var i = 0; i < words.length; i++) {
            let word = words[i].trim();
            if (word) {
                let find = word.replace('ё', 'е').replace('Ё', 'Е');
                text = replaceWords(text, find, word);
            }
        }
        return text;
    }

    function replaceWords(text, find, replace) {
        // NB: \b doesn't work for russian words
        // 1) word starts with a capital letter
        var regex = new RegExp('(' + find + ')(?=[^а-яё]|$)', 'g');
        text = text.replace(regex, replace);
        // 2) word in lowercase
        regex = new RegExp('(?<=[^А-Яа-яЁё]|^)(' + find.toLowerCase() + ')(?=[^а-яё]|$)', 'g');
        return text.replace(regex, replace.toLowerCase());
    }
})();
