import app from './src/app.js'
import ConnenctToDB from './src/db/db.js'
import {extractGitHubEvidence,extractDeployedEvidence} from "./src/services/ProjectAnalyze.Service.js"
ConnenctToDB()

// const githubEvidence = await extractGitHubEvidence(
//   "https://github.com/Amit-Mahaseth/Loopify"
// );

const deployedEvidence = await extractDeployedEvidence(
  "https://www.lesintranquilles.com/"
);

// console.log(githubEvidence,deployedEvidence)
// console.log(deployedEvidence)
app.listen(3002,()=>{
    console.log('Ai Service is Running on Port 3002')
})