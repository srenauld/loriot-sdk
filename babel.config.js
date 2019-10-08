module.exports = {
    "presets": [
        [
            "@babel/preset-env",
            {
                "targets": {
                    "node": "6.10"
                },
                modules: false
            }
        ]
      ],
      "plugins": [
        "@babel/plugin-transform-object-super"
    ],
    "ignore": [
        "node_modules/**/*"
    ],
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