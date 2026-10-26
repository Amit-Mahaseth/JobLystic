import { GoogleGenAI } from "@google/genai"
import config from "../config/config.js"
import * as z from "zod";
import { Octokit } from "@octokit/rest";
import { Firecrawl } from "firecrawl";

const ai = new GoogleGenAI({
  apiKey: config.GEMINI_API_KEY

})


const GitHubRepositorySchema = z.object({
  name: z.string(),
  url: z.string(),
  describe: z.string(),
  purpose: z.string(),

  architecture: z.object({
    pattern: z.string(),
    structure: z.string(),
    architectureIssues: z.array(z.string()),
  }),

  codeQuality: z.object({
    score: z.number().min(0).max(100),
    strengths: z.array(z.string()),
    issues: z.array(z.string()),
  }),

  efficiency: z.object({
    performance: z.number().min(0).max(100),
    performanceIssues: z.array(z.string()),
    scalability: z.number().min(0).max(100),
    scalabilityIssues: z.array(z.string()),
  }),

  securityIssues: z.array(z.string()),
  testingRecommendations: z.array(z.string()),
  improvements: z.array(z.string()),
});

const GitHubProjectAnalyzeSchema = z.object({
  ProjectName: z.string(),
  repositories: z.array(GitHubRepositorySchema).default([]),
});

const DeployedProjectAnalyzeSchema = z.object({
  url: z.string().url(),

  uiUxReview: z.object({
    strengths: z.array(z.string()),
    issues: z.array(z.string()),
  }),

  featuresTested: z.array(z.string()),
  navigationIssues: z.array(z.string()),
  accessibilityIssues: z.array(z.string()),
  performanceFindings: z.array(z.string()),
  improvements: z.array(z.string()),
  limitations: z.array(z.string()),
});

const ProjectAnalysisSchema = z.object({
  Github: GitHubProjectAnalyzeSchema.optional(),
  Deployed: DeployedProjectAnalyzeSchema.optional(),
});

const ResumeProjectsSchema = z.object({
  githubProfileUrl: z.string().nullable(),
  projects: z.array(
    z.object({
      name: z.string().min(1),
      githubUrl: z.string().nullable(),
      deployedUrl: z.string().nullable(),
    })
  ).default([]),
});
const ProjectAnalysisJSONSchema =z.toJSONSchema(ProjectAnalysisSchema)

const octokit = new Octokit({
  auth: config.GITHUB_API,
});

const firecrawl = new Firecrawl({
  apiKey: config.FIRECRAWL_API,
});

export async function extractProjectsFromResume(resumeText) {
  const prompt = `
Extract the GitHub profile URL and software projects from this resume.

Return JSON only:
{
  "githubProfileUrl": "https://github.com/username or null",
  "projects": [
    {
      "name": "Project name",
      "githubUrl": "https://github.com/owner/repo or null",
      "deployedUrl": "https://example.com or null"
    }
  ]
}

Rules:
- Extract only URLs explicitly present in the resume.
- Never invent or guess URLs.
- Do not treat a GitHub profile URL as a repository URL.
- Use null when a URL is missing.

Resume:
${resumeText}
`;

  const response = await ai.models.generateContent({
    model: "gemini-3.5-flash-lite",
    contents: prompt,
    config: {
      responseMimeType: "application/json",
    },
  });

  if (!response.text) {
    throw new Error("Project extraction returned an empty response");
  }

  let parsed;

  try {
    parsed = JSON.parse(response.text);
  } catch {
    throw new Error("Gemini returned invalid project JSON");
  }

  const data = ResumeProjectsSchema.parse(parsed);

  const normalizeUrl = (value, githubOnly = false) => {
    if (!value) return null;

    try {
      const url = new URL(value);

      if (!["http:", "https:"].includes(url.protocol)) return null;

      if (githubOnly) {
        const parts = url.pathname.split("/").filter(Boolean);

        if (
          url.hostname.toLowerCase() !== "github.com" ||
          parts.length < 1
        ) {
          return null;
        }
      }

      return url.toString();
    } catch {
      return null;
    }
  };

  return {
    githubProfileUrl: normalizeUrl(data.githubProfileUrl, true),
    projects: data.projects.map((project) => ({
      name: project.name,
      githubUrl: normalizeUrl(project.githubUrl, true),
      deployedUrl: normalizeUrl(project.deployedUrl),
    })),
  };
}


const MAX_FILES = 25;
const MAX_FILE_SIZE = 30_000;
const MAX_TOTAL_CHARS = 100_000;

async function parseGitHubUrl(repourl){
  const url=new URL(repourl)
  if(url.hostname!=='github.com'){
        throw new Error("Invalid GitHub repository URL");
  }
  const [owner,repo]=url.pathname
  .split("/").filter(Boolean)


    if (!owner || !repo) {
    throw new Error("Repository owner/name missing");
  }

  return {
    owner,
    repo: repo.replace(/\.git$/, ""),
  };
}

export async function fetchLatestRepositories(profileUrl) {
  const url = new URL(profileUrl);
  const parts = url.pathname.split("/").filter(Boolean);

  if (
    url.hostname.toLowerCase() !== "github.com" ||
    parts.length !== 1
  ) {
    throw new Error("Invalid GitHub profile URL");
  }

  const username = parts[0];

  const { data: repos } = await octokit.rest.repos.listForUser({
    username,
    sort: "pushed",
    direction: "desc",
    per_page: 100,
    type: "owner",
  });

  return repos
    .filter((repo) => !repo.fork)
    .slice(0, 3)
    .map((repo) => ({
      name: repo.name,
      githubUrl: repo.html_url,
      deployedUrl: repo.homepage || null,
    }));
}

export async function extractGitHubEvidence(repourl){
const {owner,repo}=await parseGitHubUrl(repourl)

const {data:repository}=await octokit.rest.repos.get({owner,repo})
const {data:tree}=await octokit.rest.git.getTree({
  owner,
  repo,
  tree_sha:repository.default_branch,
  recursive:"true"
})

  const files = tree.tree.filter((file) =>
    file.type === "blob" &&
    file.size <= MAX_FILE_SIZE &&
    /\.(js|jsx|ts|tsx|json|md|py|java|go|html|css)$/i
      .test(file.path)
  );

  files.sort((a, b) => {
    const priority = (path) => {
      if (/^readme\.md$/i.test(path)) return 0;
      if (/package\.json$/i.test(path)) return 1;
      if (/src\/|server|controller|service|model/i.test(path)) return 2;
      return 3;
    };

    return priority(a.path) - priority(b.path);
  })

  const selectedFiles=files.slice(0,MAX_FILES)
  const sourceFiles=[]
  let totalChars=0

  for(const   file of selectedFiles){
    if (totalChars >= MAX_TOTAL_CHARS) break;

    try{
      const {data}=await octokit.rest.repos.getContent({
        owner,
        repo,
        path:file.path,
        ref:repository.default_branch
      })
            if (Array.isArray(data) || data.type !== "file") continue;
      if (!data.content || data.encoding !== "base64") continue;

      const content=Buffer.from(
        data.content,
        "base64"
      ).toString("utf-8")

            const remaining = MAX_TOTAL_CHARS - totalChars;
      const limitedContent = content.slice(0, remaining);

      sourceFiles.push({
path:file.path,
content:limitedContent
      } )
      totalChars+=limitedContent.length
    }catch(error){
          console.warn(`Could not read ${file.path}:`, error.message);
    }
        }
    return {
      repository:{
              name: repository.name,
      description: repository.description,
      url: repository.html_url,
      defaultBranch: repository.default_branch,
      language: repository.language,
      stars: repository.stargazers_count,
    },
    fileStructure: tree.tree
      .filter((file) => file.type === "blob")
      .map((file) => file.path)
      .slice(0, 300),
    sourceFiles,
      }

  
}

export async function extractDeployedEvidence(deployedurl) {
  const url=new URL(deployedurl)

    if (!["http:", "https:"].includes(url.protocol)) {
    throw new Error("Invalid deployed website URL");
  }

  const result=await firecrawl.scrape (url.toString(),{
      formats: ["markdown"],  
  })
    return {
    url: result.metadata?.sourceURL || url.toString(),
    title: result.metadata?.title || "",
    description: result.metadata?.description || "",
    content: (result.markdown || "").slice(0, 30_000),
  };
}


export async function collectProjectEvidence(project) {
const evidence={
      ProjectName: project.name,
    Github: null,
    Deployed: null,
    errors: [],
}

if(project.githubUrl){
  try{
evidence.Github=await extractGitHubEvidence(project.githubUrl)
  }catch(error){
  evidence.errors.push({
        source: "GitHub",
        message: error.message,
  })
  }
}
  if (project.deployedUrl) {
    try {
      evidence.Deployed = await extractDeployedEvidence(
        project.deployedUrl
      );
    } catch (error) {
      evidence.errors.push({
        source: "Deployed",
        message: error.message,
      });
    }
  }
  
  return evidence
}

export async function analyzeCollectedProject(evidence) {
  const hasGithub = Boolean(evidence.Github);
  const hasDeployed = Boolean(evidence.Deployed);

  if (!hasGithub && !hasDeployed) {
    return {
      ProjectName: evidence.ProjectName,
      analysis: null,
      errors: evidence.errors,
      message: "No project evidence could be collected.",
    };
  }
const prompt= `
You are an experienced software engineer and project reviewer.

Analyze this project using ONLY the evidence provided.

Project name: ${evidence.ProjectName}

GitHub evidence:
${JSON.stringify(evidence.Github)}

Deployed website evidence:
${JSON.stringify(evidence.Deployed)}

Instructions:
- Return JSON matching the supplied schema.
- Include Github only when GitHub evidence exists.
- Include Deployed only when deployed evidence exists.
- Github.repositories must contain one repository analysis for
  the supplied repository.
- Map the repository's actual name to "name".
- Map its actual GitHub URL to "url".
- Map its description to "describe".
- If the repository has no description, use an empty string.
- Do not invent a repository description or project purpose.
- Assess architecture, code quality, performance, scalability,
  security, testing, and improvements.
- For website analysis, assess only what the supplied extracted
  content supports.
- Do not claim visual testing, actual accessibility testing,
  or verified performance measurements without evidence.
- Put unknowns and evidence limitations in limitations.
- Do not invent features, code, findings, or test results.
- Use empty arrays when there are no supported findings.
- Populate every field defined in the supplied schema.
- Do not omit any required fields.
- Use empty arrays only when no findings are supported by the evidence.
- Use an empty string for missing repository descriptions.
- Do not invent findings or scores unsupported by the evidence.
- Clearly distinguish verified findings from recommendations.
- Base each assessment on the actual source code and collected evidence.
`
    const response = await ai.models.generateContent({
    model: "gemini-3.5-flash-lite",
    contents:prompt,

    config: {
      responseMimeType: "application/json",
      responseSchema: ProjectAnalysisJSONSchema,
    },
    })

  if (!response.text) {
    throw new Error("Gemini returned an empty analysis response");
  }

  let parsed;
  try{
    parsed=JSON.parse(response.text)
  }catch{
      throw new Error("Gemini returned invalid analysis JSON");
  }

  const analysis=ProjectAnalysisSchema.parse(parsed)
  return {
    ProjectName: evidence.ProjectName,
    analysis,
    errors: evidence.errors,
  };
}

export async function analyzeResumeProjects(resumeText) {
  if (!resumeText?.trim()) {
    throw new Error("Resume text is required");
  }

  const extracted = await extractProjectsFromResume(resumeText);

  let projects = [];

  if (extracted.githubProfileUrl) {
    projects = await fetchLatestRepositories(
      extracted.githubProfileUrl
    );

    projects = projects.map((repo) => {
      const match = extracted.projects.find(
        (project) =>
          project.name.toLowerCase() === repo.name.toLowerCase() ||
          project.githubUrl?.replace(/\.git$/i, "").replace(/\/$/, "")
            .toLowerCase() === repo.githubUrl.toLowerCase()
      );

      return {
        ...repo,
        deployedUrl: match?.deployedUrl || repo.deployedUrl,
      };
    });
  } else {
    projects = extracted.projects.filter(
      (project) => project.githubUrl || project.deployedUrl
    );
  }

  if (!projects.length) {
    return { totalProjects: 0, projects: [] };
  }

  const evidenceResults = await Promise.all(
    projects.map((project) => collectProjectEvidence(project))
  );

  const results = await Promise.all(
    evidenceResults.map(async (evidence) => {
      try {
        return await analyzeCollectedProject(evidence);
      } catch (error) {
        return {
          ProjectName: evidence.ProjectName,
          analysis: null,
          errors: [
            ...evidence.errors,
            {
              source: "AI Analysis",
              message: error.message,
            },
          ],
        };
      }
    })
  );

  return {
    totalProjects: results.length,
    projects: results,
  };
}