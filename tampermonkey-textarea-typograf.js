// ==UserScript==
// @name         Textarea Typograf
// @namespace    https://github.com/glebkema/tampermonkey-textarea-typograf
// @description  Replaces hyphens, quotation marks, uncanonic smiles and "yo" in some russian words.
// @author       glebkema
// @copyright    2020-2021, Gleb Kemarsky (https://github.com/glebkema)
// @license      MIT
// @version      0.5.16
// @match        http://*/*
// @match        https://*/*
// @grant        none
// @run-at       context-menu
// ==/UserScript==

// ==OpenUserJS==
// @author glebkema
// ==/OpenUserJS==

'use strict';

const MODE_ANY = 'any';
const MODE_ANY_BEGINNING = 'anyBeginning';
const MODE_ANY_ENDING = 'anyEnding';
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
		// use only one type + only external if two stand together
		// text = text.replace(/(?<=^|[(\s])["„“]/g, '«');
		// text = text.replace(/["„“](?=$|[.,;:!?)\s])/g, '»');

		// use only one type
		text = text.replace(/["„“](?=["„“«]*[\wа-яё(])/gi, '«');
		text = text.replace(/(?<=[\wа-яё).!?]["„“»]*)["„“]/gi, '»');

		// nested quotes
		// (?:«[^»]*)([«"])([^"»]*)(["»])
		// (?=(?:(?<!\w)["«](\w.*?)["»](?!\w)))   https://stackoverflow.com/a/39706568/6263942
		// («([^«»]|(?R))*»)                      https://stackoverflow.com/a/14952740/6263942
		// «((?>[^«»]+|(?R))*)»                   https://stackoverflow.com/a/26386070/6263942
		// «([^«»]*+(?:(?R)[^«»]*)*+)»            https://stackoverflow.com/a/26386070/6263942
		// «[^»]*(?:(«)[^«»]*+(»)[^«]*)+»
		do {
			var old = text;
			text = text.replace(/(?<=«[^»]*)«(.*?)»/g, '„$1“');
		} while ( old !== text );
		return text;
	}

	improveSmile(text) {
		text = text.replace(/([:;])[—oо]?([D)(|])/g, '$1-$2');
		return text;
	}

	improveYo(text) {
		// verbs - list of the cores (with a capital letter and yo)
		text = this.improveYoVerb(text, MODE_EXCEPTIONS,
			'Льё,Мнё,Рвё,Трё');
		text = this.improveYoVerb(text, MODE_EXTRA_PREFIXES,
			'Берё,Вернё,Даё,Живё,Несё,Орё,Плывё,Поё,Ревё,Смеё,Стаё');
		text = this.improveYoVerb(text, MODE_NO_CAPITAL_LETTER,
			'Йдё,Ймё');
		text = this.improveYoVerb(text, MODE_NO_PREFIXES,
			'Идё,Начнё,Обернё,Придё,Улыбнё');
		text = this.improveYoVerb(text, MODE_NO_PREFIXES,
			'Льнё,Прильнё');
		text = this.improveYoVerb(text, MODE_NO_SUFFIXES,
			'Шёл');
		text = this.improveYoVerb(text, MODE_STANDARD,
			'Бьё,Ведё,Везё,Врё,Вьё,Гнё,Дерё,Ждё,Жмё,Жрё,Прё,Пьё,Ткнё,Чтё,Шлё,Шьё');

		// verbs - unsystematic cases
		let lookBehind = '(?<![гж-нпру-я])'; // +абвдеост, -ы
		text = this.replaceYo(text, 'Дерг', 'Дёрг', lookBehind, '(?![б-яё])');    // +а, -у
		text = this.replaceYo(text, 'Дерн', 'Дёрн', lookBehind, '(?![б-джзй-нп-тф-ъь-яё])');  // +аеиоуы (сущ. или глагол)

		// verbs - fix the exceptions
		text = this.replaceException(text, 'Раздольём');
		text = this.replaceException(text, 'Расстаёт', '(?![а-дж-я])');
		text = this.replaceException(text, 'Шлём');

		// list of the words (with a capital letter and yo)
		text = this.improveYoWord(text, null,
			'Её,Ещё,Моё,Неё,Своё,Твоё');
		text = this.improveYoWord(text, null,
			'Вдвоём,Втроём,Объём,Остриём,Приём,Причём,Своём,Твоём');
		text = this.improveYoWord(text, null,
			'В моём,На моём,О моём'); // only with certain prepositions
		text = this.improveYoWord(text, null,
			'Журавлём,Кораблём,Королём,Снегирём,Соловьём');
		text = this.improveYoWord(text, null,
			'Копьё,Копьём');
		text = this.improveYoWord(text, null,
			'Трёх,Четырём,Четырёх');  // "Трём" уже есть как глагол
		text = this.improveYoWord(text, null,
			'Василёк,Мотылёк,Огонёк,Пенёк,Поперёк,Ручеёк');
		text = this.improveYoWord(text, null,
			'Затёк,Натёк,Потёк');
		text = this.improveYoWord(text, null,
			'Грёза,Грёзы,Слёзы');
		text = this.improveYoWord(text, null,
			'Вперёд');
		text = this.improveYoWord(text, null,
			'Насчёт');
		text = this.improveYoWord(text, MODE_ANY,
			'Съёмк');
		text = this.improveYoWord(text, MODE_ANY_BEGINNING,
			'варём');
		text = this.improveYoWord(text, MODE_ANY_ENDING,
			'Актёр,Алён,Алёх,Алёш,Алфёр,Аматёр,Амёб,Анкетёр,Антрепренёр,Артём');
		text = this.improveYoWord(text, MODE_ANY_ENDING,
			'Вертолёт,Звездолёт,Налёт,Отлёт,Полёт,Пролёт,Самолёт');
		text = this.improveYoWord(text, MODE_ANY_ENDING,
			'Партнёр,Проём');
		text = this.improveYoWord(text, MODE_ANY_ENDING,
			'Зачёт,Звездочёт,Отчёт,Почёт,Расчёт,Счёт,Учёт');
		text = this.improveYoWord(text, MODE_ANY_ENDING,
			'Вёрстк,Расчёск,Чётк');

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

	// restore the `e` instead of `yo`
	replaceException(text, exception, lookAhead = '') {
		const replace = this.removeAllYo(exception);
		let regex = new RegExp(exception + lookAhead, 'g');
		text = text.replace(regex, replace);
		regex = new RegExp('(?<![А-Яa-я])' + exception.toLowerCase() + lookAhead, 'g');
		text = text.replace(regex, replace.toLowerCase());
		return text;
	}

	replaceYo(text, find, replace,
		lookBehind = '(?<![б-джзй-нп-тф-я])', // +аеиоу
		// lookAhead = '(?=[мтш])'
		lookAhead = '(?=(?:м|мся|т|те|тесь|тся|шь|шься)(?:[^а-яё]|$))'
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
		regex = new RegExp(lookBehind + findLowerCase + lookAhead, 'gi');
		text = text.replace(regex, replace.toLowerCase());
		return text;
	}

	replaceYoVerb(text, mode, find, replace) {
		if (MODE_EXCEPTIONS === mode) {
			return this.replaceYo(text, find, replace,
				'(?<![б-джзй-нп-тф-я]|зе|ко|фе)' ); // +аеиоу -"зельем" -"корвет" -"фельетон"
				// '(?=[мтш])(?!мо)(?!ть)'); // -"мнемо" -"треть"
		}
		if (MODE_EXTRA_PREFIXES === mode) {
			let lookBehind = '(?<![гжк-нпрф-я])'; // +аеиоу +бвдзст
			if ('Даё' === replace) {
				lookBehind = '(?<![гжк-нпрф-ъь-я])'; // +ы
			} else if ('Стаё' === replace) {
				lookBehind = '(?<![гжк-нпрф-я]|ра)'; // -"вы/за/от/подрастает"
			}
			return this.replaceYo(text, find, replace, lookBehind);
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
				'(?<![б-джзй-нп-тф-я])', // +аеиоу
				'(?![а-яё])');
		}
		// MODE_STANDARD
		return this.replaceYo(text, find, replace);
	}

	replaceYoWord(text, mode, find, replace) {
		if (MODE_ANY === mode) {
			return this.replaceYo(text, find, replace,
				'',
				'(?=[а-я])');
		}
		if (MODE_ANY_BEGINNING === mode) {
			return this.replaceYo(text, find, replace,
				'',
				'(?![а-яё])');
		}
		if (MODE_ANY_ENDING === mode) {
			return this.replaceYo(text, find, replace,
				'(?<![А-Яа-яЁё])',
				'');
		}
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
