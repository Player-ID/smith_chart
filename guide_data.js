/**
 * JSON-like object with Smith chart guideline information
 *
 * resistances
 *   - label : array of numbers
 *   - lines : array of objects
 *     - clipStart : 0 if undefined
 *     - clipStop  : infinity if undefined, reflected about x-axis
 *     - values    : array of numbers
 *
 * reactances (0 is ignored, draw horizontal axis separately)
 *   - label: array of numbers, reflected about x-axis
 *   - lines: array of objects
 *     - clipStart : 0 if undefined
 *     - clipStop  : infinity if undefined
 *     - values    : array of numbers
 */
var guidelineData = {
    resistances: {
        labels: [0, 0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9, 1.0, 1.2, 1.4, 1.6, 1.8, 2.0, 3.0, 4.0, 5.0, 10, 20, 50],
        lines: [
            {
                values: [0, 8, 9, 10, 50]
            },
            {
                clipStop: 0.2,
                values: [0.01, 0.03, 0.05, 0.07, 0.09, 0.11, 0.13, 0.15, 0.17, 0.19]
            },
            {
                clipStop: 0.5,
                values: [0.02, 0.04, 0.06, 0.08, 0.12, 0.14, 0.16, 0.18, 0.22, 0.24, 0.26, 0.28, 0.32, 0.34, 0.36, 0.38, 0.42, 0.44, 0.46, 0.48]
            },
            {
                clipStart: 0.5,
                clipStop: 1,
                values: [0.05, 0.15, 0.25, 0.35, 0.45]
            },
            {
                clipStop: 1,
                values: [0.55, 0.65, 0.75, 0.85, 0.95]
            },
            {
                clipStop: 2,
                values: [0.1, 0.3, 0.5, 0.7, 0.9, 1.1, 1.3, 1.5, 1.7, 1.9]
            },
            {
                clipStop: 5,
                values: [0.2, 0.4, 0.6, 0.8, 1.2, 1.4, 1.6, 1.8]
            },
            {
                clipStop: 10,
                values: [1, 3, 5, 7]
            },
            {
                clipStop: 20,
                values: [2, 4, 6, 12, 14, 16, 18]
            },
            {
                clipStop: 50,
                values: [30, 40]
            }
        ]
    },
    reactances: {
        labels: [0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9, 1.0, 1.2, 1.4, 1.6, 1.8, 2.0, 3.0, 4.0, 5.0, 10, 20, 50],
        lines: [
            {
                values: [12, 20, 30, 40, 50]
            },
            {
                clipStop: 0.2,
                values: [0.01, 0.03, 0.05, 0.07, 0.09, 0.11, 0.13, 0.15, 0.17, 0.19]
            },
            {
                clipStop: 0.5,
                values: [0.02, 0.04, 0.06, 0.08, 0.12, 0.14, 0.16, 0.18, 0.22, 0.24, 0.26, 0.28, 0.32, 0.34, 0.36, 0.38, 0.42, 0.44, 0.46, 0.48]
            },
            {
                clipStart: 0.5,
                clipStop: 1,
                values: [0.05, 0.15, 0.25, 0.35, 0.45]
            },
            {
                clipStop: 1,
                values: [0.55, 0.65, 0.75, 0.85, 0.95]
            },
            {
                clipStop: 2,
                values: [0.1, 0.3, 0.5, 0.7, 0.9, 1.1, 1.3, 1.5, 1.7, 1.9]
            },
            {
                clipStop: 5,
                values: [0.2, 0.4, 0.6, 0.8, 1.2, 1.4, 1.6, 1.8, 2.2, 2.4, 2.6, 2.8, 3.2, 3.4, 3.5, 3.6, 3.8, 4.2, 4.4, 4.6, 4.8]
            },
            {
                clipStop: 10,
                values: [1, 3, 5, 7, 9]
            },
            {
                clipStop: 20,
                values: [2, 4, 6, 8, 14, 16, 18]
            },
            {
                clipStop: 50,
                values: [12, 20, 30, 40]
            }
        ]
    }
};