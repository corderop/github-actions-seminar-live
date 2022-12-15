import * as core from "@actions/core"
import * as github from "@actions/github"
import fetch from "node-fetch"

function getInputs() {
  core.startGroup("Getting inputs")
  const GITHUB_TOKEN = core.getInput("GITHUB_TOKEN", { required: true })
  const RAPID_API_KEY = core.getInput("RAPID_API_KEY", { required: true })
  core.info("Inputs retrieved properly.")
  core.endGroup()

  return { GITHUB_TOKEN, RAPID_API_KEY }
}

function getMessageAndPrNumber() {
  const context = github.context
  const { pull_request: pullRequest } = context.payload
  const comment = pullRequest?.body
  const number = pullRequest?.number

  return { comment, number }
}

interface Translation {
  translatedText: string
  detectedSourceLanguage: string
}

interface ReponseBody {
  data: {
    translations?: Translation[]
  }
}

async function translateText(comment: string, RAPID_API_KEY: string) {
  const encodedParams = new URLSearchParams()
  encodedParams.append("target", "en")
  encodedParams.append("q", comment)

  const url = "https://google-translate1.p.rapidapi.com/language/translate/v2"

  const options = {
    method: "POST",
    headers: {
      "content-type": "application/x-www-form-urlencoded",
      "Accept-Encoding": "application/gzip",
      "X-RapidAPI-Key": RAPID_API_KEY,
      "X-RapidAPI-Host": "google-translate1.p.rapidapi.com",
    },
    body: encodedParams,
  }

  const response = await fetch(url, options)
  const body = (await response.json()) as ReponseBody
  const translatedText = body?.data?.translations?.[0].translatedText

  if (!translatedText) {
    core.setFailed("No translated text found.")
    return
  }

  return translatedText
}

async function run() {
  const { GITHUB_TOKEN, RAPID_API_KEY } = getInputs()

  const { comment, number } = getMessageAndPrNumber()
  if (!comment || !number) {
    core.setFailed("No comment or pull request number found.")
    return
  }

  const translatedText = await translateText(comment, RAPID_API_KEY)
  if (!translatedText) {
    core.setFailed("No translated text found.")
    return
  }

  const octokit = github.getOctokit(GITHUB_TOKEN)
  const message = `:robot: **Translated comment**: ${translatedText}`

  await octokit.rest.issues.createComment({
    ...github.context.repo,
    issue_number: number,
    body: message,
  })
}

run()
