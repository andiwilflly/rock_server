const randomInt = require('./randomInt.function');

module.exports = function randomAnswer(variants = [], includeDefaults = false) {
    variants = [
        ...variants,
        ...includeDefaults ? defaultVariants : []
    ];

    return variants[randomInt(0, variants.length-1)];
}

const defaultVariants = [
    'LoL',
    'Да',
    'Нет',
    'Наврерное',
    'ну хз',
    'я не против',
    'пусть будет так',
    'ок',
    'окей',
    'ы'
]