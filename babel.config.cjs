// module.exports = {
//     presets: [
//         ['@babel/preset-env', { targets: { node: 'current' } }],
//     ],
// };
module.exports = {
    presets: ['@babel/preset-env', '@babel/preset-react'],
    plugins: ['transform-vite-meta-env'],
};
