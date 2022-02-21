let assert = require('chai').assert;

// https://www.npmjs.com/package/jsdom-global
// https://github.com/rstacruz/jsdom-global
require('jsdom-global')();

let Typograf = require('../tampermonkey-textarea-typograf.js').Typograf;
let typograf = new Typograf();

let adjectiveEndings = [ 'ная', 'ного', 'ное', 'ной', 'ном', 'ному', 'ную', 'ные', 'ный', 'ным', 'ными', 'ных' ];

let verbPrefixes = ['во', 'за', 'на', 'обо', 'ото', 'пере', 'по', 'подо', 'при', 'про', 'со', 'у'];
let verbSuffixes = ['м', 'мся', 'т', 'те', 'тесь', 'тся', 'шь', 'шься'];

let wordPrefixes = [];
let wordEndings  = ['а', 'у', 'е', 'ом', 'ы', 'и', 'ов', 'ам', 'ами', 'ах'];

let numberEndings = ['ём', 'ёх'];

describe('class Typograf', function() {

	context('method improveDash()', function() {
		it('change between spaces', function() {
			assert.equal(typograf.improveDash(' - '), ' — ');
		});

		doNotChangeDash('at the beginning and at the end', '- -');
		doNotChangeDash('close to the new line', " -\n- ");
		doNotChangeDash('close to the tabulation', " -\t- ");
		doNotChangeDash('close to the word', ' -word- ');
		doNotChangeDash('close to the punctuation mark', '.- ,- :- -)');
	});

	context('method improveQuotes()', function() {
		testQuotes('at the beginning and at the end', '"a"', '«a»');
		testQuotes('close to the new line',   "a\"\n\"a", "a»\n«a");
		testQuotes('close to the tabulation', "a\"\t\"a", "a»\t«a");
		testQuotes('in spaces', ' "a" ', ' «a» ');
		testQuotes('in curles', '("a")', '(«a»)');

		let marks = ['.', '!', '?'];  // , ',', ';'
		for (let i = 0; i < marks.length; i++) {
			let mark = marks[i];
			testQuotes('near ' + mark + ' 1', 'a"' + mark,    'a»' + mark);
			testQuotes('near ' + mark + ' 2', mark + '" ',    mark + '» ');
			testQuotes('near ' + mark + ' 3', mark + '"',     mark + '»');
			testQuotes('near ' + mark + ' 4', mark + "\"\n",  mark + "»\n");
			testQuotes('near ' + mark + ' 5', mark + "\"\t",  mark + "»\t");
		}

		marks = [':'];
		for (let i = 0; i < marks.length; i++) {
			let mark = marks[i];
			testQuotes('near ' + mark + ' 1 only', 'a"' + mark, 'a»' + mark);
		}

		testQuotes('Привет.', '"Привет".', '«Привет».');
		testQuotes('Привет!', '"Привет!"', '«Привет!»');
		testQuotes('Привет?', '"Привет?"', '«Привет?»');
		testQuotes('Привет,', '"Привет", - вот и "всё".', '«Привет», - вот и «всё».');
		testQuotes('Ой!', '("Ой!")', '(«Ой!»)');
		testQuotes('23 примера', '- "23 примера"', '- «23 примера»');

		testQuotes('Nested quotes', 'Точнее, "даже "вложенные кавычки" нужно "заменять""', 'Точнее, «даже „вложенные кавычки“ нужно „заменять“»');
		testQuotes('Wrong quotes',  'Точнее, “даже "вложенные кавычки" нужно «заменять»„', 'Точнее, «даже „вложенные кавычки“ нужно „заменять“»');
		testQuotes('Wrong quotes',  'Точнее, ""даже вложенные кавычки" нужно "заменять"", но "аккуратно" и "по "делу""',
									'Точнее, «„даже вложенные кавычки“ нужно „заменять“», но «аккуратно» и «по „делу“»');

		testQuotes('Ещё кавычки', 'Кнопки “In English” и ”Наоборот“ тоже добавить', 'Кнопки «In English» и «Наоборот» тоже добавить');
	});

	context('method improveSmile()', function() {
		let eyes = {
			'normal' : ':',
			'wink'   : ';',
		};
		let noses = {
			'without a nose'           : '',
			'with a long nose'         : '—',
			'with a clown`s nose (eng)': 'o',
			'with a clown`s nose (rus)': 'о',
		};
		let smiles = {
			'smile'  : ')',
			'sad'    : '(',
			'neutral': '|',
			'laugh'  : 'D',
		};
		for (let eye_name in eyes) {
			let eye = eyes[eye_name];
			for (let smile_name in smiles) {
				let smile = smiles[smile_name];
				let canonic = eye + '-' + smile;
				for (let nose_name in noses) {
					let nose = noses[nose_name];
					let name = eye_name + ' ' + smile_name + ' ' + nose_name;
					testSmile(name, eye + nose + smile, canonic);
				}
			}
		}
	});

	context('method improveYo()', function() {
		testYo('Ещё', 'Ещё...Ещё: "Ещё" (Ещё, Ещё). Ещё');
		testYo('Её Неё', 'Неё Её Неее. Её: "Её" (Её Неё) Длиннее Еен "Неё" Не Неё, Неё...Неё');

		compareYoWord('Проём');
		testYo('Партнёр', 'Партнёр,Партнёрский,Партнёрство');
		testYo('Партнёрша', 'Партнёрша,Партнёршей');

		testYo('Съёмка', 'Съёмка аэрогеосъёмкой');

		compareYoWord('Зачёт,Звездочёт,Отчёт,Почёт,Расчёт,Счёт,Учёт', [], adjectiveEndings);
		testYo('Зачётка');
		// TODO: Зачтённый..., Учтённый...

		compareYoWord('Вёрстк');
		doNotChange('За версту,Сверстать');

		compareYoWord('Расчёск');
		compareYoWord('Чётк', [], adjectiveEndings);
		compareYoWord('Тр,Четыр', [], numberEndings);

		testYo('Вдвоём,Втроём,Объём,Остриём,Приём,Причём,Огнём,Своём,Твоём');
		testYo('Журавлём,Кораблём');
		testYo('Копьё,Копьём');
		testYo('Василёк,Мотылёк,Огонёк,Пенёк,Поперёк,Ручеёк');
		doNotChange('Приемлемый');

		testYo('О своём деле,На твоём месте');
		testYo('В моём случае и о моём проекте на моём экране');
		doNotChange('Моему другу,По-моему,Но моем руки мылом');

		testYo('-варём', 'Букварём,Главарём,Словарём');

		testYo('Огнём,Артогнём');  // by improveYoVerb('Гнё')

		testYo('Съёмка,Авиасъёмкой');
		testYo('Налёт,Налёта,Артналёт,Артналётом');
		testYo('Лётчик,Лётчики,Лётчиц,Лётчицы,Астролётчик,Астролётчица');

		testYo('Всё, на чём. Всё, о чём. Всё, про что. Всё, с чем. Всё, что. Всё-таки.');
		doNotChange('Все, кто. Все, чтобы. На овсе, про что.', false);

		testYo('Рулём');

		doNotChange('Зелёный,Зелёнка');
		doNotChange('Зеленеть,Зелень');

		testYo('Х и Ш', 'Алёхин,Алёша,Белёхонек,Белёшенек,Бледнёхонек,Бледнёшенек,Бодрёшенька,Бодрёхонько');
		testYo('Берёгся,Приберёг,Сберёг,Уберёгся');
		testYo('Бессчётная');
		testYo('Большепролётный');
		testYo('Надёжно,Благонадёжная');
		testYo('Пристёгивал,Подстёгивали,Отстёгнутый');

		// MODE_STANDARD
		compareYoVerb('Бьё,Ведё,Везё,Врё,Вьё,Гнё,Дерё,Ждё,Жмё,Жрё,Несё,Прё,Пьё,Ткнё,Чтё,Шлё,Шьё');
		testYo('Воробьём,Соловьём');

		// MODE_EXCEPTIONS
		compareYoVerb('Льё,Мнё,Рвё');
		doNotChange('Зельем,Колье,Мнемо,Подспорьем,Подшлемник,Похмелье,Пьезо,Раздольем,Рвение'
			+ ',Сомнение,Стремя,Трение,Тренировка,Треска,Третировать,Треть,Чтение');
		doNotChange('Вовремя,Времени,Время,Межвременье');
		doNotChangeYoInNomen('Корвет,Портрет,Современник,Фельетон,Шлем');

		// MODE_EXTRA_PREFIXES
		compareYoVerb('Берё', ['от', 'под', 'раз']);
		compareYoVerb('Вернё', ['от', 'под', 'раз', 'с']);
		compareYoVerb('Даё', ['воз', 'вы', 'об', 'от', 'с']); // !!! вы
		compareYoVerb('Орё', ['об', 'раз']);
		compareYoVerb('Плывё', ['вс', 'об', 'от', 'под']);
		compareYoVerb('Поё', ['вос', 'от', 'под', 'рас', 'с']);

		compareYoVerb('Стёг', ['за', 'от', 'под', 'при', 'рас']);
		doNotChangeVerb('Застегнуть,Отстегать,Стегал,Расстегну');

		compareYoVerb('Живё,Несё,Плывё', ['за', 'на', 'об', 'от', 'пере', 'по', 'под', 'при', 'про', 'с', 'у']);
		compareYoVerb('Ревё,Смеё', ['за', 'об', 'от', 'пере', 'по', 'про']);

		compareYoVerb('Стаё', ['в', 'вос', 'от']);
		testYo('Расстаётся');
		doNotChange('Снег расстает в мае,Тает стаей город во мгле');
		doNotChangeVerb('Вырастает,Зарастает,Отрастает,Подрастает,Расстает');

		// MODE_NO_CAPITAL_LETTER
		compareYoVerb('Йдё,Ймё');

		// MODE_NO_PREFIXES
		compareYoVerb('Идё,Начнё,Обернё,Придё,Улыбнё', []);
		compareYoVerb('Льнё,Прильнё', []);

		// MODE_NO_SUFFIXES
		compareYoVerb('Шёл', verbPrefixes, []);

	});

	context('unsystematic cases', function() {
		compareYoWord('Дёргал,Дёрнул', // NB: instead of compareYoVerb()
			['за', 'на', 'об', 'от', 'пере', 'под', 'про', 'с']);
		compareYoWord('Дёрн', [], wordEndings);
		doNotChange('Выдернул,Дергунчик');
	});

	context('element', function() {
		it('change the textarea content', function() {
			let textarea = document.createElement('textarea');
			textarea.value = '"test"';
			typograf.run(textarea);
			assert.equal(textarea.value, "«test»");
		});
	});

});

// NB: this function should be called from within the it() function
// NB: pass only one parameter if its value should not be changed
function compareYo(before, after = null) {
	after = after || before;
	assert.equal(typograf.improveYo(before), after);
}

function doNotChange(unchanged, split = true) {
	if (split && unchanged.indexOf(',') > -1) {
		unchanged.split(',').forEach(doNotChange);
	} else {
		it('do not change "' + unchanged + '"', function() {
			compareYo(unchanged);
		});
	}
}

function doNotChangeVerb(unchanged) {
	if (unchanged.indexOf(',') > -1) {
		unchanged.split(',').forEach(doNotChangeVerb);
	} else {
		it('do not change "' + unchanged + '"', function() {
			compareYo(unchanged);
			compareYo(unchanged + 'е');
		});
	}
}

function doNotChangeDash(description, unchanged) {
	it('do not change ' + description, function() {
		assert.equal(typograf.improveDash(unchanged), unchanged);
	});
}

function doNotChangeYoInNomen(unchanged) {
	if (unchanged.indexOf(',') > -1) {
		unchanged.split(',').forEach(doNotChangeYoInNomen);
	} else {
		it('do not change "' + unchanged + '"', function() {
			compareYo(unchanged);
			compareYo(unchanged.toLowerCase());
			wordEndings.forEach(ending => {
				compareYo(unchanged + ending);
			});
		});
	}
}

function compareYoVerb(core, prefixes = verbPrefixes, suffixes = verbSuffixes) {
	if (core.indexOf(',') > -1) {
		core.split(',').forEach(function(value) {
			compareYoVerb(value, prefixes, suffixes);
		});
	} else {
		let coreWithoutYo = typograf.removeAllYo(core);
		if (suffixes.length) {
			it(core + 'т', function() {
				suffixes.forEach(ending => {
					let before = coreWithoutYo.toLowerCase() + ending;
					let after = core.toLowerCase() + ending;

					if ('Шлё' !== core && 'м' !== ending[0]) {
						if ('Й' !== core[0]) {
							// without prefix + starts with a capital letter
							compareYo(coreWithoutYo + ending, core + ending);
						}

						// without prefix + in lowercase
						compareYo(before, after);
					}

					// with prefixes + in lowercase
					prefixes.forEach(prefix => {
						compareYo(prefix + before, prefix + after);
					});
				});
			});
			if (prefixes.length && 'Даё' !== core) {
				let unchanged = 'вы' + coreWithoutYo.toLowerCase();
				it('do not change "' + unchanged + 'т"', function() {
					suffixes.forEach(ending => {
						compareYo(unchanged + ending);
					});
				});
			}
		} else {
			it(core, function() {
				let before = coreWithoutYo.toLowerCase();
				let after = core.toLowerCase();

				// without prefix + starts with a capital letter
				compareYo(coreWithoutYo, core);

				// without prefix + in lowercase
				compareYo(before, after);

				// with prefixes + in lowercase
				prefixes.forEach(prefix => {
					compareYo(prefix + before, prefix + after);
				});
			});
			if (prefixes.length) {
				let unchanged = 'вы' + coreWithoutYo.toLowerCase();
				it('do not change "' + unchanged + '"', function() {
					compareYo(unchanged);
				});
			}
		}
	}
}

function compareYoWord(core, prefixes = [], endings = []) {
	if (core.indexOf(',') > -1) {
		core.split(',').forEach(function(value) {
			compareYoWord(value, prefixes, endings);
		});
	} else {
		prefixes = [].concat(wordPrefixes, prefixes);
		endings = [].concat(wordEndings, endings);
		let coreWithoutYo = typograf.removeAllYo(core);
		it(core, function() {
			endings.forEach(ending => {
				let endingWithoutYo = typograf.removeAllYo(ending);

				let before = coreWithoutYo.toLowerCase() + endingWithoutYo;
				let after = core.toLowerCase() + ending;

				// without prefix + starts with a capital letter
				compareYo(coreWithoutYo + endingWithoutYo, core + ending);

				// without prefix + in lowercase
				compareYo(before, after);

				// with prefixes + in lowercase
				prefixes.forEach(prefix => {
					compareYo(prefix + before, prefix + after);
				});
			});
		});
	}
}

function testQuotes(description, before, after) {
	it(description, function() {
		assert.equal(typograf.improveQuotes(before), after);
	});
}

function testSmile(description, before, after) {
	it(description, function() {
		assert.equal(typograf.improveSmile(before), after);
	});
}

function testYo(description, textWithYo = null) {
	textWithYo = textWithYo || description;
	textWithYo += ' ' + textWithYo.toLowerCase();
	let textWithoutYo = typograf.removeAllYo(textWithYo);
	it(description, function() {
		compareYo(textWithoutYo, textWithYo);
	});
}
