const DateTime = require('luxon').DateTime;

const DEAD_CELL = '\u25A1';
const ALIVE_CELL = '\u25A0';
const GRID_WIDTH = 7;


class Rule {
    constructor(childrenRules){
        this.childrenRules = childrenRules;
    }

    computeChild(leftParent, middleParent, rightParent){
        // indices are reversed, that's why 7- is prepended
        let ruleIndex = 7 - (2 * ((2 * leftParent) + middleParent) + rightParent);

        return this.childrenRules[ruleIndex];
    }

    computeGeneration(parents){
        let cellsCount = parents.length;
        let offspring = Array(cellsCount);

        // account for the cycling in the extremes
        offspring[0] = this.computeChild(
            parents[cellsCount - 1],
            parents[0],
            parents[1]
        );
        offspring[cellsCount - 1] = this.computeChild(
            parents[cellsCount - 2],
            parents[cellsCount - 1],
            parents[0],
        );

        for(let i = 1; i < cellsCount - 1; ++i){
            offspring[i] = this.computeChild(
                parents[i - 1],
                parents[i],
                parents[i + 1]
            );
        }

        return offspring;
    }

    static fromNumber(number){
        let childrenRules = number
            .toString(2).padStart(8, '0').split('')
            .map(bit => parseInt(bit, 2));

        return new Rule(childrenRules);
    }
}


let translateToBinary = chars => {
    const translator = {
        [DEAD_CELL]: 0,
        [ALIVE_CELL]: 1
    };

    return chars.split('').map(char => translator[char]);
};

let translateToChars = binary => {
    const translator = [DEAD_CELL, ALIVE_CELL];

    return binary.map(bit => translator[bit]).join('');
};


let computeUntilToday = (rule, parents, lastUpdate, startDay) => {
    let today = DateTime.local().startOf('day'),
        remainingDays = today.diff(lastUpdate.startOf('day')).as('days'),
        endDay = startDay + remainingDays;

    let generationsNeededCount = Math.ceil(endDay / GRID_WIDTH);
    let generations = Array(generationsNeededCount);
    let current = parents;

    for(let i = 0; i < generationsNeededCount; ++i){
        current = rule.computeGeneration(current);
        generations[i] = current;
    }

    if(generationsNeededCount === 1){
        // in this case the first and the last generation coincide,
        // so the slices order matters
        return [generations[0].slice(startDay, endDay)];
    }

    generations[0] = generations[0].slice(startDay);
    generations[generationsNeededCount - 1] = generations[generationsNeededCount - 1].slice(0, endDay % GRID_WIDTH);

    return generations;
};


module.exports = {
    ALIVE_CELL,
    computeUntilToday,
    DEAD_CELL,
    Rule,
    translateToBinary,
    translateToChars
};
