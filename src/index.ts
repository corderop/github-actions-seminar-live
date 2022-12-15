import * as core from "@actions/core"
import * as github from "@actions/github"

function getInputs() {
  core.startGroup("Getting inputs")
  const GITHUB_TOKEN = core.getInput("GITHUB_TOKEN", { required: true })
  const RAPID_API_KEY = core.getInput("RAPID_API_KEY", { required: true })
  core.info("Inputs retrieved properly.")
  core.endGroup()

  return { GITHUB_TOKEN, RAPID_API_KEY }
}

async function run() {
  const { GITHUB_TOKEN, RAPID_API_KEY } = getInputs()

  const context = github.context
  const { pull_request: pullRequest } = context.payload
  const comment = pullRequest?.body
  const number = pullRequest?.number

  console.log(pullRequest)

  if (!comment || !number) {
    core.setFailed("No comment or pull request number found.")
  }

  console.log(comment, number)
}

run()
