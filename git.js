const { computeUntilToday, DEAD_CELL, translateToBinary } = require('./cells.js');
const DateTime = require('luxon').DateTime;
const execSync = require('child_process').execSync;
const fs = require('fs');
const path = require('path');
const readLastLines = require('read-last-lines');

const pjson = require('./package.json');
const BEGIN_DATE = DateTime.fromISO('2019-08-15');
const LOCAL_CLONE_PATH = path.join(process.cwd(), 'tmp');
const CELLS_FILENAME = 'cells.txt';
const CELLS_FILE_PATH = path.join(LOCAL_CLONE_PATH, CELLS_FILENAME);
const REPO_URL = pjson.custom.targetRepository.url;


let updateFile = () => {
    const lastUpdateTimestamp = execSync('git log -1 --format="%at"', {
        'cwd': LOCAL_CLONE_PATH
    })
          .toString()
          .trim();
    const lastUpdate = DateTime
          .fromMillis(1000 * lastUpdateTimestamp)
          .startOf('day');

    return readLastLines.read(CELLS_FILE_PATH, 2)
        .then(lines => {
            let lastLines = lines.trimStart().split('\n');
            let parents, startDay;

            if(lastLines.length == 1){
                parents = translateToBinary(lastLines[0]);
                startDay = 0;
            } else if(lastLines[1].length >= 7){
                parents = translateToBinary(lastLines[1]);
                startDay = 0;
            } else {
                parents = translateToBinary(lastLines[0]);
                startDay = lastLines[1].length;
            }

            let result = computeUntilToday(lastUpdate, parents, startDay);

            if(result[result.length - 1] === DEAD_CELL){
                return false;
            }

            fs.appendFileSync(CELLS_FILE_PATH, result, 'utf8');

            return true;
    });

};

let cloneRepository = () => {
    return execSync(
        `git clone ${REPO_URL} ${LOCAL_CLONE_PATH}`
    );
};

let pushChanges = () => {
    let options = {
        'cwd': LOCAL_CLONE_PATH
    };

    let today = DateTime.local().toFormat('dd/MM/yyyy');

    execSync(`git add ${CELLS_FILENAME}`, options);

    execSync(
        'git -c user.name="cell-invaders"'
            + ` -c user.email="${process.env.GITHUB_EMAIL}"`
            + ` commit -m "Commit for ${today}"`,
        options
    );

    let credentials = `cell-invaders:${process.env.GITHUB_TOKEN}`;
    let [scheme, host] = REPO_URL.split('://');
    let pushUrl = scheme + '://' + credentials + '@' + host;

    execSync(`git push ${pushUrl} master`, options);
};

cloneRepository();
updateFile();
pushChanges();
