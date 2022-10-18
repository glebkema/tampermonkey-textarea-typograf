// helper functions for statistics

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

module.exports = {
	consoleStatisticsFinal       : consoleStatisticsFinal,
	consoleStatisticsIntermediate: consoleStatisticsIntermediate,
};
