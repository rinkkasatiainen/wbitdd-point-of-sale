module.exports = function() {
    return {
        files: [
            { pattern: '**/src/**/*.ts'},
            { pattern: '**/test/**/*-helpers.ts' },
            { pattern: '**/test/test-server.ts' },
        ],
        tests: [
            {pattern: '/**/test/**/*.spec.ts' },
            // {pattern: '/**/test/**/*.test.ts' },
            // {pattern: '/**/test/**/*.ts' }
        ],
        testFramework: 'mocha',
        env: { type: 'node' },
    }
}
