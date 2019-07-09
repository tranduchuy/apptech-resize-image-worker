const uniqid = require('uniqid');

const fillEmptyCharacters = (str, length, letter = '0') => {
    str = str.toString();
    const incompleteCharacterCount = length - str.length;
    if (incompleteCharacterCount <= 0) {
        return str;
    }

    const incompleteCharacters = new Array(incompleteCharacterCount).fill(letter);
    return incompleteCharacters.join('') + str;
};

const generateFileNameWithTime = (ext = 'jpg') => {
    const today = new Date();

    return [
        fillEmptyCharacters(today.getHours(), 2),
        '-',
        fillEmptyCharacters(today.getMinutes(), 2),
        '-',
        fillEmptyCharacters(today.getSeconds(), 2),
        '-',
        fillEmptyCharacters(today.getMilliseconds(), 3),
        '_',
        uniqid(),
        '.',
        ext
    ].join('');
};

// Return: <year>/<month>/<date>/<width>
const generateFolderTempByDate = (width) => {
    const today = new Date();
    const month = today.getMonth() + 1;
    const date = today.getDate();

    const patterns = [
        today.getFullYear(),
        fillEmptyCharacters(month, 2),
        fillEmptyCharacters(date, 2)
    ];

    if (width) {
        patterns.unshift(width);
    }

    return patterns.join('\/');
};

module.exports = {
    fillEmptyCharacters: fillEmptyCharacters,
    generateFileNameWithTime: generateFileNameWithTime,
    generateFolderTempByDate: generateFolderTempByDate
};