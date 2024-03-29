console.log('check the efficiency of the algorithm on the words with the letter "yo" collected by the project http://python.anabar.ru/yo.htm');

let Typograf = require('../tampermonkey-textarea-typograf.js').Typograf;
let typograf = new Typograf();

let yobase = require('../yobase.js').yobase;

let consoleStatisticsFinal        = require('../statistics.js').consoleStatisticsFinal;
let consoleStatisticsIntermediate = require('../statistics.js').consoleStatisticsIntermediate;

let wordsCount = yobase.length;
let successCount = 0;
for (let i = 0; i < wordsCount; i++) {
	let word = yobase[i];
	let wordWithoutYo = word.replace('ё', 'е');  // each word has only one "yo"
	if (word === typograf.improveYo(wordWithoutYo)) {
		successCount++;
	}
	if (i > 0 && 0 === i % 5000) {
		consoleStatisticsIntermediate(i, successCount);
	}
}
consoleStatisticsFinal(wordsCount, successCount);
