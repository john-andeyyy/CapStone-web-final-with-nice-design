// require('dotenv').config();
// global.import = { meta: { env: { VITE_BASEURL: process.env.VITE_BASEURL } } };
// require('dotenv').config();
// globalThis.import = { meta: { env: { VITE_BASEURL: process.env.VITE_BASEURL } } };

// global.import = {
//     meta: {
//         env: {
//             VITE_BASEURL: 'http://localhost:3000', // Replace with a suitable test URL
//         },
//     },
// };
// jest.setup.js
globalThis.import = {
    meta: {
        env: {
            VITE_BASEURL: 'http://localhost:3000', // Replace with your actual test value or a placeholder
        },
    },
};
