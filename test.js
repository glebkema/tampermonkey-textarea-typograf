let assert = require('chai').assert;
let Typograf = require('./tampermonkey-textarea-typograf.js').Typograf;
let typograf = new Typograf();

describe('class Typograf', function() {

    context('method improveDash()', function() {
        it('change between spaces', function() {
            assert.equal(typograf.improveDash(' - '), ' — ');
        });

        doNotChange('at the beginning and at the end', '- -');
        doNotChange('close to the new line', " -\n- ");
        doNotChange('close to the tabulation', " -\t- ");
        doNotChange('close to the word', ' -word- ');
        doNotChange('close to the punctuation mark', '.- ,- :- -)');
    });

    context('method improveQuotes()', function() {
        testQuotes('at the beginning and at the end', '"a"', '«a»');
        testQuotes('close to the new line',   "a\"\n\"a", "a»\n«a");
        testQuotes('close to the tabulation', "a\"\t\"a", "a»\t«a");
        testQuotes('in spaces', ' "a" ', ' «a» ');
        testQuotes('in curles', '("a")', '(«a»)');

        let marks = ['.', ',', ';', '!', '?'];
        for (let i = 0; i < marks.length; i++) {
            let mark = marks[i];
            testQuotes('near ' + mark + ' (1)', 'a"' + mark,    'a»' + mark);
            testQuotes('near ' + mark + ' (2)', mark + '" ',    mark + '» ');
            testQuotes('near ' + mark + ' (3)', mark + '"',     mark + '»');
            testQuotes('near ' + mark + ' (4)', mark + "\"\n",  mark + "»\n");
            testQuotes('near ' + mark + ' (5)', mark + "\"\t",  mark + "»\t");
        }

        testQuotes('Привет.', '"Привет".', '«Привет».');
        testQuotes('Привет!', '"Привет!"', '«Привет!»');
        testQuotes('Привет?', '"Привет?"', '«Привет?»');
        testQuotes('Привет,', '"Привет", - вот и "всё".', '«Привет», - вот и «всё».');
        testQuotes('Ой!', '("Ой!")', '(«Ой!»)');
        testQuotes('23 примера', '- "23 примера"', '- «23 примера»');
    });

    context('method improveSmile()', function() {
        let smiles = {
            'smile'  : ')',
            'sad'    : '(',
            'neutral': '|',
            'laugh'  : 'D',
        };
        for (let name in smiles) {
            let canonic = ':-' + smiles[name];
            testSmile(name + ' without a nose',            ':'  + smiles[name], canonic);
            testSmile(name + ' with a long nose',          ':—' + smiles[name], canonic);
            testSmile(name + ' with a clown`s nose (eng)', ':o' + smiles[name], canonic);
            testSmile(name + ' with a clown`s nose (rus)', ':о' + smiles[name], canonic);
        }
    });

    context('method improveYo()', function() {
        testYo('Ещё', 'Еще еще "еще" (Еще и еще). Еще еще, еще. И еще',
                      'Ещё ещё «ещё» (Ещё и ещё). Ещё ещё, ещё. И ещё');
        testYo('Неё', 'Нее ее неее. Длиннее еен нее, нее... нее',
                      'Неё ее неее. Длиннее еен неё, неё... неё');
    });

});

function doNotChange(description, unchanged) {
    it('do not change ' + description, function() {
        assert.equal(typograf.improveDash(unchanged), unchanged);
    });
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

function testYo(description, before, after) {
    it(description, function() {
        assert.equal(typograf.improveSmile(before), after);
    });
}
