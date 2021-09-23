module.exports = {
    converData: (data) => {
        const cleaned = (`${data}`).replace(/\D/g, '');
        return cleaned;
    },

    dateNormalizer: (date) => {
        const x = date.split('/');
        return `${x[2]}-${x[1]}-${x[0]}`;
    }
};
