// https://semantic-release.gitbook.io/semantic-release/usage/configuration
module.exports = {
    "branches": [
        "master",
        "main",
        "github-actions" // For testing
    ],
    "tagFormat": "${version}",
    // https://semantic-release.gitbook.io/semantic-release/extending/plugins-list
    "plugins": [
        [
            "@semantic-release/commit-analyzer",
            {
                // https://github.com/semantic-release/commit-analyzer/blob/master/lib/default-release-rules.js
                "preset": "angular",
                "releaseRules": [
                    {
                        "type": "breaking",
                        "release": "major"
                    },
                    {
                        "type": "feat",
                        "release": "minor"
                    },
                    {
                        "type": "fix",
                        "release": "patch"
                    },
                    {
                        "type": "revert",
                        "release": "patch"
                    },
                    {
                        "type": "refactor",
                        "release": "patch"
                    },
                    {
                        "type": "upgrade",
                        "release": "patch"
                    },
                    {
                        "type": "perf",
                        "release": "patch"
                    },
                    {
                        "type": "docs",
                        "release": "patch"
                    },
                    {
                        "type": "ci",
                        "release": "patch"
                    },
                    {
                        "type": "chore",
                        "release": "patch"
                    }
                ]
            }
        ],
        [
            "@semantic-release/release-notes-generator",
            {
                "linkReferences": false,
                "writerOpts": {
                    "commitGroupsSort": [
                        "breaking",
                        "feat",
                        "fix",
                        "revert",
                        "refactor",
                        "perf",
                        "docs",
                        "chore",
                        "upgrade",
                        "ci"
                    ],
                    "transform": (commit, context) => {
                        const issues = []

                        commit.notes.forEach(note => {
                            note.title = 'BREAKING CHANGES'
                        })

                        if (commit.type === 'breaking') {
                            commit.type = 'Breaking Changes'
                        } else if (commit.type === 'feat') {
                            commit.type = 'Features'
                        } else if (commit.type === 'fix') {
                            commit.type = 'Bug Fixes'
                        } else if (commit.type === 'perf') {
                            commit.type = 'Performance Improvements'
                        } else if (commit.type === 'revert' || commit.revert) {
                            commit.type = 'Reverts'
                        } else if (commit.type === 'docs') {
                            commit.type = 'Documentation'
                        } else if (commit.type === 'style') {
                            commit.type = 'Styles'
                        } else if (commit.type === 'refactor') {
                            commit.type = 'Code Refactoring'
                        } else if (commit.type === 'test') {
                            commit.type = 'Tests'
                        } else if (commit.type === 'build') {
                            commit.type = 'Build System'
                        } else if (commit.type === 'ci') {
                            commit.type = 'Continuous Integration'
                        } else if (commit.type === 'upgrade') {
                            commit.type = 'Dependency Updates'
                        } else if (commit.type === 'chore') {
                            commit.type = 'Chore'
                        }

                        if (commit.scope === '*') {
                            commit.scope = ''
                        }

                        if (typeof commit.hash === 'string') {
                            commit.shortHash = '(' + commit.hash.substring(0, 7) + ')'
                        }

                        if (typeof commit.subject === 'string') {
                            let url = context.repository
                                ? `${context.host}/${context.owner}/${context.repository}`
                                : context.repoUrl
                            if (url) {
                                url = `${url}/issues/`
                                // Issue URLs.
                                commit.subject = commit.subject.replace(/#([0-9]+)/g, (_, issue) => {
                                    issues.push(issue)
                                    return `[#${issue}](${url}${issue})`
                                })
                            }
                            if (context.host) {
                                // User URLs.
                                commit.subject = commit.subject.replace(/\B@([a-z0-9](?:-?[a-z0-9/]){0,38})/g, (_, username) => {
                                    if (username.includes('/')) {
                                        return `@${username}`
                                    }

                                    return `[@${username}](${context.host}/${username})`
                                })
                            }
                        }

                        // remove references that already appear in the subject
                        commit.references = commit.references.filter(reference => issues.indexOf(reference.issue) === -1)

                        return commit
                    },
                }
            }
        ],
        "@semantic-release/github",
        ["@semantic-release/npm", {
            "npmPublish": false,
        }],
        ["@semantic-release/git", {
            "assets": ["package.json"]
        }]
    ]
}

