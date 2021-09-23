const unzipper = require('unzipper');
const fsPromisify = require('fs/promises');
const fs = require('fs');
const path = require('path');
const csv = require('@fast-csv/parse');

const { variables: { dataPath, DATA } } = require('./config');
const { userService } = require('./services');

const unzip = async () => {
    const exists = fs.existsSync(dataPath);
    if (!exists) {
        await fsPromisify.mkdir(dataPath);
    }
    const zip = await unzipper.Open.file(DATA);
    for (const file of zip.files) {
        const buffer = await file.buffer();
        await fsPromisify.writeFile(path.join(dataPath, file.path), buffer);
    }
};

const parseFile = async () => {
    const csvData = [];
    const files = await fsPromisify.readdir(dataPath);

    for await (const i of files) {
        const pathToFiles = path.join(dataPath, i);

        fs.createReadStream(pathToFiles)
            .pipe(csv.parse({
                delimiter: '|',
                headers: true
            }))
            .on('error', (error) => console.error(error))
            .on('data', (row) => {
                const {
                    first_name,
                    last_name,
                    phone,
                    cc,
                    amount,
                    date
                } = row;

                const obj = {
                    name: `${last_name} ${first_name}`,
                    phone: userService.converData(`${phone}`),
                    person: {
                        firstName: `${first_name}`,
                        lastName: `${last_name}`
                    },
                    amount: `${amount}`,
                    date: userService.dateNormalizer(`${date}`),
                    costCenterNum: userService.converData(`${cc}`)
                };

                csvData.push(obj);
            }).on('end', async () => await save(csvData));
    }

    return csvData;
};

async function save(data) {
    await fsPromisify.writeFile(path.join(dataPath, 'res.json'), JSON.stringify(data));
}

const start = async () => {
    try {
        await unzip();
        const data = await parseFile();
        await save(data);
    } catch (e) {
        console.log(e);
    }
};

start().then();
