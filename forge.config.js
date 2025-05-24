console.log(process.env.GITHUB_TOKEN)

module.exports = {
    makers: [{
        "name": "@electron-forge/maker-dmg",
        "platforms": [
            "darwin"
        ]
    }],
    packagerConfig: {
        osxSign: {}
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