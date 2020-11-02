// ==UserScript==
// @name         Textarea Typograf
// @namespace    https://github.com/glebkema/tampermonkey-textarea-typograf
// @description  Replaces hyphens, quotation marks, uncanonic smiles and "yo" in some russian words.
// @author       glebkema
// @copyright    2020, glebkema (https://github.com/glebkema)
// @license      MIT
// @version      0.4.09
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
