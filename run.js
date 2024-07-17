import fs from 'fs/promises';
import axios from 'axios';
import path from 'path';
import util from 'util';

// Axios request and response interceptors for logging
axios.interceptors.request.use(request => {
    console.log('Starting Request', util.inspect(request, { depth: null }));
    return request;
});

axios.interceptors.response.use(
    response => response,
    error => {
        console.log('Response Error', util.inspect(error.response ? error.response.data : error.message, { depth: null }));
        return Promise.reject(error);
    }
);

// Function to read the ESLint report
const readEslintReport = async (filename) => {
    const data = await fs.readFile(filename, 'utf8');
    return JSON.parse(data);
};

// Function to create SonarQube issue data structure
const createSonarIssues = (eslintReport) => {
    return eslintReport.flatMap((file) => {
        return file.messages.map((message) => ({
            engineId: 'eslint',
            ruleId: message.ruleId,
            severity: message.severity === 2 ? 'CRITICAL' : 'MINOR',
            type: 'CODE_SMELL',
            primaryLocation: {
                message: message.message,
                filePath: path
                    .relative(process.cwd(), file.filePath)
                    .replace(/\\/g, '/'),
                textRange: {
                    startLine: message.line,
                    startColumn: message.column,
                },
            },
        }));
    });
};

// Function to send issues to SonarQube
const sendIssuesToSonarQube = async (issues, sonarHostUrl, sonarToken, projectKey) => {
    console.log(sonarHostUrl)
    try {
        const response = await axios.post(
            `${sonarHostUrl}/api/issues/import`,
            {
                issues,
                projectKey,
            },
            {
                headers: {
                    Authorization: `Bearer ${sonarToken}`,
                    'Content-Type': 'application/json',
                },
            }
        );
        console.log('Issues sent successfully to SonarQube', response.data);
    } catch (error) {
        console.error('Error sending issues to SonarQube:', error.response ? error.response.data : error.message);
    }
};

// Main script execution
(async () => {
    try {
        const eslintReport = await readEslintReport('eslint-report.json');
        const issues = createSonarIssues(eslintReport);

        // SonarQube configuration
        const sonarHostUrl = "https://sonarcloud.io"
        const sonarToken = 'f2e24db46c31c7047bdb8c9d85e36039ad39fb12'
        const projectKey = 'davidraider_Testing-sonar'
        // Debugging environment variables
        console.log(`SONAR_HOST_URL: ${sonarHostUrl}`);
        console.log(`SONAR_TOKEN: ${sonarToken ? '****' : 'undefined'}`);
        console.log(`SONAR_PROJECT_KEY: ${projectKey}`);

        if (!sonarToken || !projectKey || !sonarHostUrl) {
            throw new Error('SonarQube configuration is missing. Please set SONAR_HOST_URL, SONAR_TOKEN, and SONAR_PROJECT_KEY environment variables.');
        }

        await sendIssuesToSonarQube(issues, sonarHostUrl, sonarToken, projectKey);
    } catch (error) {
        console.error('Error in main execution:', error.message);
    }
})();