let assert = require('chai').assert;

// https://www.npmjs.com/package/jsdom-global
// https://github.com/rstacruz/jsdom-global
require('jsdom-global')();

let Typograf = require('../tampermonkey-textarea-typograf.js').Typograf;
let typograf = new Typograf();

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

        let marks = ['.', ',', ';', '!', '?'];
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
        testYo('Ещё', 'Еще еще "еще" (Еще и еще). Еще еще, еще. И еще',
                      'Ещё ещё "ещё" (Ещё и ещё). Ещё ещё, ещё. И ещё');  // NB: "
        testYo('Её Неё', 'Нее ее неее. Ее длиннее еен нее, нее...нее',
                         'Неё её неее. Её длиннее еен неё, неё...неё');
        testYoWord('Воробьём');
        doNotChangeYoInNomen('корвет,подшлемник,портрет,шлем,фельетон');
        doNotChangeYoInVerb('бье,йде,лье,пье,рве,тре,шле');
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

function doNotChangeDash(description, unchanged) {
    it('do not change ' + description, function() {
        assert.equal(typograf.improveDash(unchanged), unchanged);
    });
}

function doNotChangeYo(unchanged) {
    assert.equal(typograf.improveYo(unchanged), unchanged);
}

function doNotChangeYoInNomen(unchanged) {
    if (unchanged.indexOf(',') > -1) {
        unchanged.split(',').forEach(doNotChangeYoInNomen);
    } else {
        it('do not change "' + unchanged + '"', function() {
            doNotChangeYo(unchanged);
            doNotChangeYo(unchanged + 'е');
        });
    }
}

function doNotChangeYoInVerb(unchanged) {
    if (unchanged.indexOf(',') > -1) {
        unchanged.split(',').forEach(doNotChangeYoInVerb);
    } else {
        unchanged = 'вы' + unchanged;
        it('do not change "' + unchanged + 'т"', function() {
            doNotChangeYo(unchanged + 'м');
            doNotChangeYo(unchanged + 'мся');
            doNotChangeYo(unchanged + 'т');
            doNotChangeYo(unchanged + 'те');
            doNotChangeYo(unchanged + 'тся');
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

function testYo(description, before, after) {
    it(description, function() {
        assert.equal(typograf.improveYo(before), after);
    });
}

function testYoWord(word) {
    let wordWithoutYo = word.replace('ё', 'е').replace('Ё', 'Е');
    testYo(word, wordWithoutYo + ' ' + wordWithoutYo.toLowerCase(), word + ' ' + word.toLowerCase());
}
