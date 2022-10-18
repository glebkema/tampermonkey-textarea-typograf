console.log('detect unprocessed adjectives and compose change code for them');

let Typograf = require('../tampermonkey-textarea-typograf.js').Typograf;
let typograf = new Typograf();

let adjectives = require('../yobase.js').adjectives;

let consoleStatisticsFinal        = require('../statistics.js').consoleStatisticsFinal;
let consoleStatisticsIntermediate = require('../statistics.js').consoleStatisticsIntermediate;

let wordsCount = adjectives.length;
console.log('Found', wordsCount, 'adjectives');

let successCount = 0;
for (let i = 0; i < wordsCount; i++) {
	let word = adjectives[i];
	let wordWithoutYo = word.replace('ё', 'е');  // each word has only one "yo"
	if (word === typograf.improveYo(wordWithoutYo)) {
		successCount++;
		console.log('+', word);
	} else {
		console.log(' ', word);
	}
}
consoleStatisticsFinal(wordsCount, successCount);

