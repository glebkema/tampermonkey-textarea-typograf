// ==UserScript==
// @name         Textarea Typograf
// @namespace    https://github.com/glebkema/tampermonkey-textarea-typograf
// @description  Replaces hyphens, quotation marks, uncanonic smiles and "yo" in some russian words.
// @author       glebkema
// @copyright    2020, glebkema (https://github.com/glebkema)
// @license      MIT
// @version      0.4.11
// @match        http://*/*
// @match        https://*/*
// @grant        none
// @run-at       context-menu
// ==/UserScript==

// ==OpenUserJS==
// @author glebkema
// ==/OpenUserJS==

'use strict';

class Typograf {
    constructor() {
        // this.text = text;  // ??? use this.text in methods // ??? how to test it
    }

    run(element) {
        if (element && 'textarea' == element.tagName.toLowerCase() && element.value) {
            const start = element.selectionStart;
            const end = element.selectionEnd;
            if (start === end) {
                element.value = this.improve(element.value);
            } else {
                let selected = element.value.substring(start, end);
                let length = element.value.length;
                element.value = element.value.substring(0, start) + this.improve(selected) + element.value.substring(end, length);
            }
        } else {
            // console.info('Start editing a non-empty textarea before calling the script');
        }
    }

    improve(text) {
        if (text) {
            text = this.improveDash(text);
            text = this.improveQuotes(text);
            text = this.improveSmile(text);
            text = this.improveYo(text);
        }
        return text;
    }

    improveDash(text) {
        text = text.replace(/ - /g, ' — ');
        return text;
    }

    improveQuotes(text) {
        text = text.replace(/(?<=^|[\(\s])"/g, '«');
        text = text.replace(/"(?=$|[.,;:\!\?\s\)])/g, '»');
        return text;
    }

    improveSmile(text) {
        text = text.replace(/([:;])[—oо]?([D\)\(\|])/g, '$1-$2');
        return text;
    }

    improveYo(text) {
        // list the words - with a capital letter and yo
        text = this.improveYoWord(text, 'Её,Ещё,Моё,Неё,Своё,Твоё');
        text = this.improveYoWord(text, 'Вдвоём,Втроём,Объём,Остриём,Приём,Причём,Огнём,Своём,Твоём');
        text = this.improveYoWord(text, 'Василёк,Мотылёк,Огонёк,Пенёк,Ручеёк');
        text = this.improveYoWord(text, 'Затёк,Натёк,Потёк');
        text = this.improveYoWord(text, 'Грёза,Грёзы,Слёзы');

        // list the cores of the verbs - with a capital letter and yo
        text = this.improveYoVerb(text, 'Бьё,йдё,Льё,Пьё,Рвё,Трё,Шлё');
        return text;
    }

    improveYoVerb(text, list) {
        return this.iterator(text, list, this.replaceYoVerb.bind(this));
    }

    improveYoWord(text, list) {
        return this.iterator(text, list, this.replaceYoWord.bind(this));
    }

    iterator(text, list, callback) {
        if ('string' === typeof list) {
            list = list.split(',');
        }
        for (let i = 0; i < list.length; i++) {
            let replace = list[i].trim();
            if (replace) {
                let find = this.removeAllYo(replace);
                text = callback(text, find, replace);
            }
        }
        return text;
    }

    removeAllYo(text) {
        return text.replace(/ё/g, 'е').replace(/Ё/g, 'Е');
    }

    replaceYo(text, find, replace, lookBack = '', lookAhead = '') {
        // NB: \b doesn't work for russian words
        // 1) starts with a capital letter = just a begining of the word
        let regex = new RegExp(find + lookAhead, 'g');
        text = text.replace(regex, replace);
        // 2) in lowercase = with a prefix ahead or without it
        regex = new RegExp(lookBack + find.toLowerCase() + lookAhead, 'g');
        text = text.replace(regex, replace.toLowerCase());
        return text;
    }

    replaceYoVerb(text, find, replace) {
        return this.replaceYo(text, find, replace,
            '(?<![б-джзк-нп-тф-я]|ко|фе|Ко|Фе)',  // аеиоу
            '(?=[мтш])');
    }

    replaceYoWord(text, find, replace) {
        return this.replaceYo(text, find, replace,
            '(?<![А-Яа-яЁё])',
            '(?![а-яё])');
    }
}

// if it's a browser, not a test
if('undefined' !== typeof document) {
    let typograf = new Typograf();
    typograf.run(document.activeElement);
}

// if it's a test by Node.js
if (module) {
    module.exports = {
        Typograf: Typograf
    }
} else {
    var module; // hack for Tampermonkey's eslint
}
