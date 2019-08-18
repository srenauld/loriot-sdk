module.exports = {
    "presets": [
        "@babel/preset-env"
    ],
    "plugins": ["@babel/plugin-transform-runtime", "@babel/plugin-transform-object-super", "@babel/plugin-transform-modules-commonjs"],
    "env": {
        "test": {
            "plugins": ["@babel/plugin-transform-object-super", "@babel/plugin-transform-modules-commonjs"],
            "presets": [["@babel/preset-env", {
                modules: "commonjs",
                targets:{
                    node: 'current'
                }
            }]]
        }
    }
};