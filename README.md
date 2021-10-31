# Tampermonkey Textarea Typograf

+ Replaces hyphens, quotation marks and some uncanonic smiles.
+ Place the letter "yo" in some russian words.

Works only in the `<textarea>` fields.
If you select a part of the text, only that part will be processed.

Tested only for Chrome: [Tampermonkey](https://chrome.google.com/webstore/detail/tampermonkey/dhdgffkkebhmkfjojejmpbldmpobfkfo?hl=en).

Incompatible with Safari and IE11 due to the use of [lookbehind in JS regular expressions](https://caniuse.com/js-regexp-lookbehind).


## Testing my Mocha

[Install](https://mochajs.org/#installation):
```
$ npm install --global mocha
```

Run:
```
mocha test
```

Check the efficiency of the algorithm on the words with the letter "yo" collected by the project http://python.anabar.ru/yo.htm
```
mocha test/test-yobase.js
```

On 2021-10-31 the script corrected 5822 words out of 58138 = 10.01 %