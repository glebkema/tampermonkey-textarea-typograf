// ==UserScript==
// @name         Textarea Typograf
// @namespace    https://github.com/glebkema/tampermonkey-textarea-typograf
// @description  Replaces hyphens and quotation marks. Works only in the <textarea>.
// @author       glebkema
// @copyright    2020, glebkema (https://github.com/glebkema)
// @license      MIT
// @version      0.4.0
// @match        http://*/*
// @match        https://*/*
// @grant        none
// @run-at       context-menu
// ==/UserScript==

// ==OpenUserJS==
// @author glebkema
// ==/OpenUserJS==

'use strict';

if('undefined' !== typeof document) {  // = if not a test
    const element = document.activeElement;
    if (element && 'textarea' == element.tagName.toLowerCase() && element.value) {
        let typograf = new Typograf();
        const start = element.selectionStart;
        const end = element.selectionEnd;
        if (start === end) {
            element.value = typograf.improve(element.value);
        } else {
            let selected = element.value.substring(start, end);
            let length = element.value.length;
            element.value = element.value.substring(0, start) + typograf.improve(selected) + element.value.substring(end, length);
        }
    } else {
        // console.info('Start editing a non-empty textarea before calling the script');
    }
}

class Typograf {
    constructor() {
        // this.text = text;  // ??? use this.text in methods // ??? how to test it
    }

    improve(text) {
        if (text) {
            text = this.improveDash(text);
            text = this.improveQuotes(text);
            text = this.improveYo(text);
        }
        return text;
    }

    improveDash(text) {
        text = text.replace(/ - /gi, ' — ');
        return text;
    }

    improveQuotes(text) {
        // TODO. regex with (?<=)
        // TODO. ??? is /i needed
        text = text.replace(/^"/gi, '«');
        text = text.replace(/"$/gi, '»');
        text = text.replace(/([\(\s])"/gi, '$1«');
        text = text.replace(/"([.,;\s\)])/gi, '»$1');  // :\!\?
        return text;
    }

    improveYo(text) {
        // setup words with a capital letter and yo
        text = this.checkWords(text, 'Её,Ещё,Моё,Неё,Своё,Твоё');
        text = this.checkWords(text, 'Вдвоём,Втроём,Объём,Остриём,Приём,Причём,Огнём,Своём,Твоём');
        text = this.checkWords(text, 'Василёк,Мотылёк,Огонёк,Пенёк,Ручеёк');
        text = this.checkWords(text, 'Затёк,Натёк,Потёк');
        text = this.checkWords(text, 'Грёза,Грёзы,Слёзы');
        return text;
    }

    checkWords(text, words) {
        if ('string' === typeof words) {
            words = words.split(',');
        }
        for (let i = 0; i < words.length; i++) {
            let word = words[i].trim();
            if (word) {
                let find = word.replace('ё', 'е').replace('Ё', 'Е');
                text = this.replaceWords(text, find, word);
            }
        }
        return text;
    }

    replaceWords(text, find, replace) {
        // NB: \b doesn't work for russian words
        // 1) word starts with a capital letter
        let regex = new RegExp('(' + find + ')(?=[^а-яё]|$)', 'g');
        text = text.replace(regex, replace);
        // 2) word in lowercase
        regex = new RegExp('(?<=[^А-Яа-яЁё]|^)(' + find.toLowerCase() + ')(?=[^а-яё]|$)', 'g');
        text = text.replace(regex, replace.toLowerCase());
        return text;
    }
}

module.exports = {
    Typograf: Typograf
}
