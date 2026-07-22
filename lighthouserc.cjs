module.exports = {
  ci: {
    collect: {
      numberOfRuns: 3,
    },
    assert: {
      assertions: {
        'categories:performance': [
          'warn',
          {
            aggregationMethod: 'median-run',
            minScore: 0.8,
          },
        ],
        'categories:accessibility': [
          'warn',
          {
            aggregationMethod: 'median-run',
            minScore: 0.9,
          },
        ],
        'categories:best-practices': [
          'warn',
          {
            aggregationMethod: 'median-run',
            minScore: 0.9,
          },
        ],
        'categories:seo': [
          'warn',
          {
            aggregationMethod: 'median-run',
            minScore: 0.9,
          },
        ],
      },
    },
    upload: {
      outputDir: './lighthouse-reports',
      target: 'filesystem',
    },
  },
}
