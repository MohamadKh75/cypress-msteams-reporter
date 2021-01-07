import program from 'commander'
import * as fs from 'fs'
import { readAllureReport } from './allureReport.js'
import { sendWebhook } from './ms-teamsWebhook.js'

let version
try {
	const json = JSON.parse(
		fs.readFileSync(
			'./node_modules/cypress-msteams-reporter/package.json',
			'utf8'
		)
	)
	version = json.version
} catch (error) {
	version = 'undefined'
}
program.version(version, '-v, --version')
program
	.option('--verbose', 'show log output')
	.option(
		'--report-path [type]',
		'define the path of allure report file',
		'./allure-report/widgets/status-chart.json'
	)
	.option(
		'--testEnv-path [type]',
		'define the path of allure report environment properties file',
		'./allure-report/widgets/environment.json'
	)
	.option('--report-url [type]', 'provide the link for the Test Report', '')
program.parse(process.argv)

const reportPath = program.reportPath
const testEnvPath = program.testEnvPath
const reportUrl = program.reportUrl
if (program.verbose) {
	console.log(
		`reportPath: ${reportPath}\n`,
		`testEnvironmentPropertiesFile: ${testEnvPath}\n`,
		`reportUrl: ${reportUrl}\n`
	)
}

let webhookArgs
try {
	webhookArgs = await readAllureReport(reportPath, testEnvPath, reportUrl)
} catch (error) {
	error.name
		? console.error(
				`${error.name}: ${error.message}`,
				'\nFailed to read the Allure report.'
		  )
		: console.error(
				'An unknown error occurred. Failed to read the Allure report.'
		  )
}
try {
	sendWebhook({ ...webhookArgs, reportUrl })
	console.log('MS Teams message was sent successfully.')
} catch (error) {
	error.name
		? console.error(
				`${error.name}: ${error.message}`,
				'\nFailed to send MS Teams message.'
		  )
		: console.error(
				'An unknown error occurred. Failed to send MS Teams message.'
		  )
}
