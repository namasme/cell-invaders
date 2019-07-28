const {
    ALIVE_CELL, computeUntilToday, DEAD_CELL,
    Rule, translateToBinary, translateToChars
} = require('../cells.js');
const DateTime = require('luxon').DateTime;
const MockDate = require('mockdate');


describe('Rules', () => {
    test('can be created from numbers', () => {
        const rule184 = Rule.fromNumber(184);

        expect(rule184.computeChild(1, 1, 0)).toBe(0);
        expect(rule184.computeChild(0, 1, 1)).toBe(1);
        expect(rule184.computeChild(0, 0, 0)).toBe(0);

        const rule30 = Rule.fromNumber(30);

        expect(rule30.computeChild(1, 1, 0)).toBe(0);
        expect(rule30.computeChild(0, 1, 1)).toBe(1);
        expect(rule30.computeChild(0, 0, 0)).toBe(0);
    });

    test('compute children', () => {
        const rule91 = new Rule([0, 1, 0, 1, 1, 0, 1, 1]);

        expect(rule91.computeChild(1, 1, 0)).toBe(1);
        expect(rule91.computeChild(0, 0, 1)).toBe(1);
        expect(rule91.computeChild(0, 0, 0)).toBe(1);
    });

    test('compute generations', () => {
        const rule110 = Rule.fromNumber(110);

        expect(rule110.computeGeneration([1, 1, 0])).toEqual(
            [1, 1, 1]
        );
        expect(rule110.computeGeneration([1, 0, 0, 1, 0])).toEqual(
            [1, 0, 1, 1, 1]
        );
        expect(rule110.computeGeneration([1, 0, 0, 1, 0, 1, 1])).toEqual(
            [1, 0, 1, 1, 1, 1, 0]
        );
    });
});


describe('Translations', () => {
    test('from text to binary', () => {
        expect(translateToBinary(DEAD_CELL)).toEqual([0]);
        expect(translateToBinary(ALIVE_CELL)).toEqual([1]);
        expect(translateToBinary(
            DEAD_CELL + ALIVE_CELL + DEAD_CELL + DEAD_CELL + ALIVE_CELL
        )).toEqual([0, 1, 0, 0, 1]);
    });

    test('from binary to text', () => {
        expect(translateToChars([0])).toBe(DEAD_CELL);
        expect(translateToChars([1])).toBe(ALIVE_CELL);
        expect(translateToChars([0, 1, 0, 0, 1])).toBe(
            DEAD_CELL + ALIVE_CELL + DEAD_CELL + DEAD_CELL + ALIVE_CELL
        );
    });
});


describe('Dates handling', () => {
    const parents = [1, 0, 0, 1, 0, 1, 1];
    const rule110 = Rule.fromNumber(110);
    const lastUpdate = DateTime.local();

    describe('One day difference', () => {
        MockDate.set(lastUpdate.plus({ 'days': 1 }));

        test('first day of the week', () => {
            expect(
                computeUntilToday(rule110, parents, lastUpdate, 0)
            ).toEqual([[1]]);
        });

        test('third day of the week', () => {
            expect(
                computeUntilToday(rule110, parents, lastUpdate, 2)
            ).toEqual([[1]]);
        });

        test('last day of the week', () => {
            expect(
                computeUntilToday(rule110, parents, lastUpdate, 6)
            ).toEqual([[0]]);
        });
    });

    describe('Several days difference, same week', () => {
        test('two days', () => {
            MockDate.set(lastUpdate.plus({ 'days': 2 }));
            expect(
                computeUntilToday(rule110, parents, lastUpdate, 4)
            ).toEqual([[1, 1]]);
        });

        test('four days', () => {
            MockDate.set(lastUpdate.plus({ 'days': 4 }));
            expect(
                computeUntilToday(rule110, parents, lastUpdate, 1)
            ).toEqual([[0, 1, 1, 1]]);
        });

        test('seven days', () => {
            MockDate.set(lastUpdate.plus({ 'days': 7 }));
            expect(
                computeUntilToday(rule110, parents, lastUpdate, 0)
            ).toEqual([[1, 0, 1, 1, 1, 1, 0]]);
        });
    });

    describe('Different weeks', () => {
        test('two days, different weeks', () => {
            MockDate.set(lastUpdate.plus({ 'days': 2 }));
            expect(
                computeUntilToday(rule110, parents, lastUpdate, 6)
            ).toEqual([[0], [1]]);
        });

        test('five days, different weeks', () => {
            MockDate.set(lastUpdate.plus({ 'days': 5 }));
            expect(
                computeUntilToday(rule110, parents, lastUpdate, 4)
            ).toEqual([[1, 1, 0], [1, 1]]);
        });

        test('ten days', () => {
            MockDate.set(lastUpdate.plus({ 'days': 10 }));
            expect(
                computeUntilToday(rule110, parents, lastUpdate, 0)
            ).toEqual([[1, 0, 1, 1, 1, 1, 0], [1, 1, 1]]);
        });
    });
});
