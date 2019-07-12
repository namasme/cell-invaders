const DateTime = require('luxon').DateTime;

const DEAD_CELL = '\u25A1';
const ALIVE_CELL = '\u25A0';
const GRID_WIDTH = 7;


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


let rule110 = parents => {
    let parentIndex = parents[0] * 4 + parents[1] * 2 + parents[2];
    return [0, 1, 1, 1, 0, 1, 1, 0][parentIndex];
};

let computeGeneration = parents => {
    let offspring = Array(GRID_WIDTH);

    // account for the cycling in the extremes
    offspring[0] = rule110([
        parents[GRID_WIDTH - 1],
        parents[0],
        parents[1]
    ]);
    offspring[GRID_WIDTH - 1] = rule110([
        parents[GRID_WIDTH - 2],
        parents[GRID_WIDTH - 1],
        parents[0],
    ]);

    for(let i = 1; i < GRID_WIDTH - 1; ++i){
        offspring[i] = rule110([
            parents[i - 1],
            parents[i],
            parents[i + 1]
        ]);
    }

    return offspring;
};

let computeUntilToday = (lastUpdate, parents, startDay) => {
    let today = DateTime.local().startOf('day'),
        remainingDays = today.diff(lastUpdate).as('days'),
        endDay = startDay + remainingDays;
    let generation = computeGeneration(parents);
    let output = startDay === 0 ? '\n' : '';

    console.log(startDay, endDay, remainingDays);
    console.log(parents);
    console.log(generation);

    if(startDay + remainingDays > GRID_WIDTH){
        // need to compute next week
        let nextGeneration = computeGeneration(generation);

        output += (
            translateToChars(generation.slice(startDay, GRID_WIDTH))
                + '\n'
                + translateToChars(nextGeneration.slice(0, endDay % GRID_WIDTH))
        );
    } else {
        output += translateToChars(generation.slice(startDay, endDay));
    }

    return output;
};


module.exports = {
    computeUntilToday,
    DEAD_CELL,
    translateToBinary
};
