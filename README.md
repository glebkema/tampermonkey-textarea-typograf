# Tampermonkey Textarea Typograf

+ Replaces hyphens, quotation marks and some uncanonic smiles.
+ Place the letter "yo" in some russian words.

Works only in the `<textarea>` fields.
If you select a part of the text, only that part will be processed.

Tested only for Chrome: [Tampermonkey](https://chrome.google.com/webstore/detail/tampermonkey/dhdgffkkebhmkfjojejmpbldmpobfkfo?hl=en).

Incompatible with Safari and IE11 due to the use of [lookbehind in JS regular expressions](https://caniuse.com/js-regexp-lookbehind).


## Run tests

```
mocha test
```
