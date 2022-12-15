import * as core from "@actions/core"

async function run() {
  core.startGroup("Getting inputs")
  const GITHUB_TOKEN = core.getInput("GITHUB_TOKEN", { required: true })
  const RAPID_API_KEY = core.getInput("RAPID_API_KEY", { required: true })
  core.info("Inputs retrieved properly.")
  core.endGroup()

  console.log(GITHUB_TOKEN, RAPID_API_KEY)
}

run()
