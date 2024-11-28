module.exports = {
    presets: [
        [
            '@babel/preset-env',
            {
                targets: {
                    node: 'current', // Ensures compatibility with Jest
                },
            },
        ],
        '@babel/preset-react', // Include if you're working with React
    ],
};
