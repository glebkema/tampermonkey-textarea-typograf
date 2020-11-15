// ==UserScript==
// @name         Textarea Typograf
// @namespace    https://github.com/glebkema/tampermonkey-textarea-typograf
// @description  Replaces hyphens, quotation marks, uncanonic smiles and "yo" in some russian words.
// @author       glebkema
// @copyright    2020, glebkema (https://github.com/glebkema)
// @license      MIT
// @version      0.4.15
// @match        http://*/*
// @match        https://*/*
// @grant        none
// @run-at       context-menu
// ==/UserScript==

// ==OpenUserJS==
// @author glebkema
// ==/OpenUserJS==

'use strict';

const MODE_EXCEPTIONS = 'exceptions';
const MODE_EXTRA_PREFIXES = 'extraPrefixes';
const MODE_NO_CAPITAL_LETTER = 'noCapitalLetter';
const MODE_NO_PREFIXES = 'noPrefixes';
const MODE_NO_SUFFIXES = 'noSuffixes';
const MODE_STANDARD = 'standard';

class Typograf {
	run(element) {
		if (element && 'textarea' === element.tagName.toLowerCase() && element.value) {
			const start = element.selectionStart;
			const end = element.selectionEnd;
			if (start === end) {
				element.value = this.improve(element.value);
			} else {
				const selected = element.value.substring(start, end);
				const theLength = element.value.length;
				element.value = element.value.substring(0, start)
					+ this.improve(selected) + element.value.substring(end, theLength);
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
		text = text.replace(/(?<=^|[(\s])"/g, '«');
		text = text.replace(/"(?=$|[.,;:!?)\s])/g, '»');
		return text;
	}

	improveSmile(text) {
		text = text.replace(/([:;])[—oо]?([D)(|])/g, '$1-$2');
		return text;
	}

	improveYo(text) {
		// verbs - list of the cores (with a capital letter and yo)
		text = this.improveYoVerb(text, MODE_EXCEPTIONS,
			'Льё,Мнё,Рвё');
		text = this.improveYoVerb(text, MODE_EXTRA_PREFIXES,
			'Вернё,Даё,Орё,Плывё,Поё,Стаё');
		text = this.improveYoVerb(text, MODE_NO_CAPITAL_LETTER,
			'Йдё,Ймё');
		text = this.improveYoVerb(text, MODE_NO_PREFIXES,
			'Идё,Начнё,Обернё,Придё,Улыбнё');
		text = this.improveYoVerb(text, MODE_NO_SUFFIXES,
			'Шёл');
		text = this.improveYoVerb(text, MODE_STANDARD,
			'Бьё,Врё,Вьё,Жмё,Жрё,Несё,Прё,Пьё,Ткнё,Трё,Чтё,Шлё,Шьё');

		// verbs - fix the exceptions
		text = text.replace(/Шлём/g, 'Шлем');
		text = text.replace(/(?<![А-Яa-я])шлём/g, 'шлем');

		// list of the words (with a capital letter and yo)
		text = this.improveYoWord(text, null,
			'Её,Ещё,Моё,Неё,Своё,Твоё');
		text = this.improveYoWord(text, null,
			'Вдвоём,Втроём,Объём,Остриём,Приём,Причём,Огнём,Своём,Твоём');
		text = this.improveYoWord(text, null,
			'Василёк,Мотылёк,Огонёк,Пенёк,Ручеёк');
		text = this.improveYoWord(text, null,
			'Затёк,Натёк,Потёк');
		text = this.improveYoWord(text, null,
			'Грёза,Грёзы,Слёзы');

		return text;
	}

	improveYoVerb(text, mode, list) {
		return this.iterator(text, mode, list, this.replaceYoVerb.bind(this));
	}

	improveYoWord(text, mode, list) {
		return this.iterator(text, mode, list, this.replaceYoWord.bind(this));
	}

	iterator(text, mode, list, callback) {
		if ('string' === typeof list) {
			list = list.split(',');
		}
		for (let i = 0; i < list.length; i++) {
			const replace = list[i].trim();
			if (replace) {
				const find = this.removeAllYo(replace);
				text = callback(text, mode, find, replace);
			}
		}
		return text;
	}

	removeAllYo(text) {
		return text.replace(/ё/g, 'е').replace(/Ё/g, 'Е');
	}

	replaceYo(text, find, replace,
		lookBack = '(?<![б-джзй-нп-тф-я])', // -аеиоу
		lookAhead = '(?=[мтш])'
	) {
		let regex;
		let findLowerCase = find.toLowerCase();
		// NB: \b doesn't work for russian words
		// 1) starts with a capital letter = just a begining of the word
		if (find !== findLowerCase) {
			regex = new RegExp(find + lookAhead, 'g');
			text = text.replace(regex, replace);
		}
		// 2) in lowercase = with a prefix ahead or without it
		regex = new RegExp(lookBack + findLowerCase + lookAhead, 'gi');
		text = text.replace(regex, replace.toLowerCase());
		return text;
	}

	replaceYoVerb(text, mode, find, replace) {
		if (MODE_EXCEPTIONS === mode) {
			return this.replaceYo(text, find, replace,
				'(?<![б-джзй-нп-тф-я]|ко|фе)', // -аеиоу -корвет -фельетон
				'(?=[мтш])(?!мо)'); // -мнемо...
		}
		if (MODE_EXTRA_PREFIXES === mode) {
			return this.replaceYo(text, find, replace,
				'(?<![гжк-нпрф-я])'); // -аеиоу -бвдзст
		}
		if (MODE_NO_CAPITAL_LETTER === mode) {
			return this.replaceYo(text, find.toLowerCase(), replace);
		}
		if (MODE_NO_PREFIXES === mode) {
			return this.replaceYo(text, find, replace,
				'(?<![А-Яа-яЁё])');
		}
		if (MODE_NO_SUFFIXES === mode) {
			return this.replaceYo(text, find, replace,
				'(?<![б-джзй-нп-тф-я])', // -аеиоу
				'(?![а-яё])');
		}
		// MODE_STANDARD
		return this.replaceYo(text, find, replace);
	}

	replaceYoWord(text, mode, find, replace) {
		return this.replaceYo(text, find, replace,
			'(?<![А-Яа-яЁё])',
			'(?![а-яё])');
	}
}

// if it's a browser, not a test
if ('undefined' !== typeof document) {
	let typograf = new Typograf();
	typograf.run(document.activeElement);
}

// if it's a test by Node.js
if (module) {
	module.exports = {
		Typograf: Typograf,
	};
} else {
	var module; // hack for Tampermonkey's eslint
}
