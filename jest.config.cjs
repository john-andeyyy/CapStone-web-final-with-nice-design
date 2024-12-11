// // jest.config.js or jest.config.cjs
// module.exports = {
//     transform: {
//         '^.+\\.js$': 'babel-jest', // Optional if you use Babel for transformation
//     },
// };
// jest.config.js
// module.exports = {
//     transform: {
//         '^.+\\.[t|j]sx?$': 'babel-jest',
//     },
//     moduleFileExtensions: ['js', 'jsx', 'json', 'node'],
// };

// module.exports = {
//     transform: {
//         '^.+\\.[tj]sx?$': 'babel-jest',
//     },
//     moduleFileExtensions: ['js', 'jsx', 'ts', 'tsx', 'json', 'node'],
//     testMatch: ['**/__tests__/**/*.[jt]s?(x)', '**/?(*.)+(spec|test).[tj]s?(x)'],
//     testEnvironment: 'jest-environment-jsdom',
//     setupFiles: ['<rootDir>/jest.setup.js'], 
// };

// jest.config.cjs
module.exports = {
    setupFiles: ['<rootDir>/jest.setup.js'],
    transform: {
        '^.+\\.[tj]sx?$': 'babel-jest',
    },
    moduleFileExtensions: ['js', 'jsx', 'ts', 'tsx', 'json', 'node'],
    testEnvironment: 'jest-environment-jsdom',
};
