console.log(process.env.GITHUB_TOKEN)

module.exports = {
    makers: [{
        "name": "@electron-forge/maker-zip",
        "platforms": [
            "darwin"
        ]
    }],
    packagerConfig: {
        osxSign: {},
        files: ["app/**", "build/"],
    },
    publishers: [
        {
            name: '@electron-forge/publisher-github',
            config: {
                repository: {
                    owner: '0xtinylabs',
                    name: 'marketingbot-monorepo'
                },
                prerelease: true
            }
        }
    ]
}