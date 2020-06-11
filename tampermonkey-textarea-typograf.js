// ==UserScript==
// @name         Textarea Typograf
// @namespace    https://github.com/glebkema/tampermonkey-textarea-typograf
// @version      0.1
// @description  Replaces hyphens and quotation marks. Works only in the <textarea>. If you select a part of the text, only that part will be processed.
// @author       Gleb Kemarsky
// @grant        none
// @run-at       context-menu
// ==/UserScript==

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

    function typograf(text) {
        if (text) {
            text = text.replace(/ - /gi, ' — ');
            text = text.replace(/^"/gi, '«');
            text = text.replace(/"$/gi, '»');
            text = text.replace(/([\(\s])"/gi, '$1«');
            text = text.replace(/"([.,;\s\)])/gi, '»$1');
        }
        return text;
    }
})();
