console.log('check the efficiency of the algorithm on the words with the letter "yo" collected by the project http://python.anabar.ru/yo.htm');

let Typograf = require('../tampermonkey-textarea-typograf.js').Typograf;
let typograf = new Typograf();

let yobase = require('../yobase.js').yobase;

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

function consoleStatisticsFinal(wordsCount, successCount) {
	console.log(
		'On',
		new Date().toISOString().slice(0, 10),
		'the script corrected',
		successCount,
		'words out of',
		wordsCount,
		getSuccessProcent(wordsCount, successCount)
	);
}

function consoleStatisticsIntermediate(i, successCount) {
	console.log(
		('' + successCount).padStart(5, ' '),
		'/',
		('' + i).padStart(5, ' '),
		getSuccessProcent(i, successCount)
	);
}

function getSuccessProcent(i, successCount) {
	return '= ' + (Math.round(successCount * 10000 / i) / 100) + ' %';
}
