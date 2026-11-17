import createGeminiClient from "../GeminiClient.js"
import config from "../../config/config.js"
import { Octokit } from "@octokit/rest";
import { Firecrawl } from "firecrawl";
import {
  ProjectAnalysisJSONSchema,
  ProjectAnalysisSchema,
  DeployedProjectLinksJSONSchema,
  ResumeProjectsJSONSchema,
  ResumeProjectsSchema,
  DeployedProjectLinksSchema,
} from "./AnalyzeProject.schema.js";

const ai = createGeminiClient()

const octokit = new Octokit({
  auth: config.GITHUB_API,
});

const firecrawl = new Firecrawl({
  apiKey: config.FIRECRAWL_API,
});

const MAX_FILES = 25;
const MAX_FILE_SIZE = 30_000;
const MAX_TOTAL_CHARS = 100_000;



/**
 * Parses and validates a GitHub repository URL into owner and repository name components.
 *
 * @param {string} repourl - GitHub repository URL.
 * @returns {Promise<{ owner: string, repo: string }>} Extracted repository owner and name.
 * @throws {Error} If URL is not a valid GitHub repository.
 */
async function parseGitHubUrl(repourl) {
  const url = new URL(repourl)
  if (url.hostname !== 'github.com') {
    throw new Error("Invalid GitHub repository URL");
  }
  const [owner, repo] = url.pathname.split("/").filter(Boolean)

  if (!owner || !repo) {
    throw new Error("Repository owner/name missing");
  }

  return {
    owner,
    repo: repo.replace(/\.git$/, ""),
  };
}

/**
 * Fetches the most recently pushed non-fork public repositories for a GitHub profile URL.
 *
 * @param {string} profileUrl - Full GitHub profile URL.
 * @returns {Promise<Array<{ name: string, githubUrl: string, deployedUrl: string|null }>>} Latest repositories list.
 * @throws {Error} If profile URL is invalid or malformed.
 */
export async function fetchUserRepositories(profileUrl) {
let url;
try {
   url = new URL(profileUrl);
} catch {
   throw new Error("Invalid GitHub profile URL");
}
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
    per_page: 100,
    type: "owner",
  });

  return repos
    .filter((repo) => !repo.fork)
    .map((repo) => ({
      name: repo.name,
      githubUrl: repo.html_url,
      deployedUrl: repo.homepage || null,
       description: repo.description || "",
    }));
}


export async function  extractProjectNamesFromResume(resumeText)  {
  if (typeof resumeText !== "string" || !resumeText.trim()) {
    throw new Error("Resume text is required");
  }
  const prompt = `
You are an expert resume parser.

Extract only the project names explicitly mentioned
in the PROJECTS section of the resume.

Rules:
- Return only actual project names.
- Do not include descriptions, technologies, skills,
  education, or work experience.
- Do not invent project names.
- Preserve the original project names.
- If no projects are found, return an empty array.

Resume:
${resumeText}
`;
    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash-lite",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: ResumeProjectsJSONSchema,
      },
    });

    if (!response.text) {
      throw new Error("Gemini returned an empty project names response");
    }

    let parsed;
    try {
      parsed = JSON.parse(response.text);
    } catch {
      throw new Error("Gemini returned invalid project names JSON");
    }

    const result = ResumeProjectsSchema.parse(parsed);
    return result.projects.map((project) => project.name);
  } 


function normalizeProjectName(name) {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]/g, "")
    .replace(/s$/, "");
}


export function matchResumeProjectsWithRepositories(
  projectNames,
  repositories
) {
  return projectNames.map((projectName) => {
    const normalizedProject = normalizeProjectName(projectName);

    const matchedRepository = repositories.find((repo) => {
      const normalizedRepo = normalizeProjectName(repo.name);
        return normalizedProject === normalizedRepo;
    });
        return {
      name: projectName,
      githubUrl: matchedRepository?.githubUrl || null,
      deployedUrl: matchedRepository?.deployedUrl || null,
    };
      });

}


export async function matchDeployedLinksWithProjects(
  projectNames,
  extractedLinks
) {
  const deployedLinks = extractedLinks.filter((link) =>
    ["other", "deployed", "website"].includes(link.type) &&
    link.url
  );

  if (!deployedLinks.length || !projectNames.length) {
    return [];
  }

  const prompt = `
You are a resume project link matcher.

Match deployed website URLs with the correct project names.

Project names:
${JSON.stringify(projectNames)}

Available URLs:
${JSON.stringify(deployedLinks.map((link) => link.url))}

Rules:
- Match only when the URL clearly belongs to a project.
- Return only URLs supplied in the input.
- Never invent project names or URLs.
- Do not force a match when uncertain.
- Return an empty links array when no reliable match exists.
`;

  const response = await ai.models.generateContent({
    model: "gemini-3.5-flash-lite",
    contents: prompt,
    config: {
      responseMimeType: "application/json",
      responseSchema: DeployedProjectLinksJSONSchema,
    },
  });

  if (!response.text) {
    throw new Error("Gemini returned an empty deployed links response");
  }

  const parsed = JSON.parse(response.text);
  const result = DeployedProjectLinksSchema.parse(parsed);

  return result.links.filter(
    (item) =>
      projectNames.includes(item.projectName) &&
      deployedLinks.some((link) => link.url === item.deployedUrl)
  );
}
/**
 * Fetches repository metadata, tree structure, and source files content from GitHub via Octokit.
 *
 * @param {string} repourl - GitHub repository URL to inspect.
 * @returns {Promise<Object>} Aggregated repository metadata, file paths, and file source contents.
 */
export async function extractGitHubEvidence(repourl) {
  const { owner, repo } = await parseGitHubUrl(repourl)

  const { data: repository } = await octokit.rest.repos.get({ owner, repo })
  const { data: tree } = await octokit.rest.git.getTree({
    owner,
    repo,
    tree_sha: repository.default_branch,
    recursive: "true"
  })

  if (tree.truncated) {
  console.warn(
    `GitHub repository tree is truncated: ${owner}/${repo}`
  );
}

  const files = tree.tree.filter((file) =>
    file.type === "blob" &&
    file.size <= MAX_FILE_SIZE &&
    /\.(js|jsx|ts|tsx|json|md|py|java|go|html|css)$/i.test(file.path)
  );

  files.sort((a, b) => {
 const priority = (path) => {
  const normalizedPath = path.toLowerCase();

  if (/^readme\.md$/.test(normalizedPath)) return 0;

  if (
    /(^|\/)(package\.json|vite\.config\.[jt]s|tsconfig\.json)$/.test(
      normalizedPath
    )
  ) return 1;

  if (
    /(^|\/)(src|app|server|controllers|services|models|routes)\//.test(
      normalizedPath
    )
  ) return 2;

  if (
    /\.(test|spec)\.[jt]sx?$/.test(normalizedPath)
  ) return 3;

  return 4;
};
    return priority(a.path) - priority(b.path);
  })

  const selectedFiles = files.slice(0, MAX_FILES)
  const sourceFiles = []
  let totalChars = 0

  for (const file of selectedFiles) {
    if (totalChars >= MAX_TOTAL_CHARS) break;

    try {
      const { data } = await octokit.rest.repos.getContent({
        owner,
        repo,
        path: file.path,
        ref: repository.default_branch
      })
      if (Array.isArray(data) || data.type !== "file") continue;
      if (!data.content || data.encoding !== "base64") continue;

      const content = Buffer.from(
        data.content,
        "base64"
      ).toString("utf-8")

      const remaining = MAX_TOTAL_CHARS - totalChars;
      const limitedContent = content.slice(0, remaining);

      sourceFiles.push({
        path: file.path,
        content: limitedContent
      })
      totalChars += limitedContent.length
    } catch (error) {
      console.warn(`Could not read ${file.path}:`, error.message);
    }
  }

  return {
    repository: {
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

/**
 * Scrapes and extracts markdown content, title, and metadata from a live deployed website using Firecrawl.
 *
 * @param {string} deployedurl - Public deployed website URL.
 * @returns {Promise<{ url: string, title: string, description: string, content: string }>} Scraped website content.
 * @throws {Error} If URL protocol is not http or https.
 */
export async function extractDeployedEvidence(deployedurl) {
  const url = new URL(deployedurl)

  if (!["http:", "https:"].includes(url.protocol)) {
    throw new Error("Invalid deployed website URL");
  }

  const result = await firecrawl.scrape(url.toString(), {
    formats: ["markdown"],
  })

  return {
    url: result.metadata?.sourceURL || url.toString(),
    title: result.metadata?.title || "",
    description: result.metadata?.description || "",
    content: (result.markdown || "").slice(0, 30_000),
  };
}



/**
 * Runs a Lighthouse audit through Google PageSpeed Insights API.
 *
 * @param {string} deployedUrl - Public deployed website URL.
 * @param {"mobile"|"desktop"} strategy - Device strategy.
 * @returns {Promise<Object>} Structured Lighthouse evidence.
 */
export async function extractLighthouseEvidence(
  deployedUrl,
  strategy = "mobile"
) {
  const url = new URL(deployedUrl);

  if (!["http:", "https:"].includes(url.protocol)) {
    throw new Error("Invalid deployed website URL");
  }

  if (!["mobile", "desktop"].includes(strategy)) {
    throw new Error("Invalid Lighthouse strategy");
  }

  const endpoint = new URL(
    "https://www.googleapis.com/pagespeedonline/v5/runPagespeed"
  );

  endpoint.searchParams.set("url", url.toString());
  endpoint.searchParams.set("strategy", strategy);

  if (config.PAGESPEED_API_KEY) {
    endpoint.searchParams.set("key", config.PAGESPEED_API_KEY);
  }

  const categories = [
    "performance",
    "accessibility",
    "best-practices",
    "seo",
  ];

  categories.forEach((category) => {
    endpoint.searchParams.append("category", category);
  });

  const response = await fetch(endpoint);

  const result = await response.json();

  if (!response.ok) {
    throw new Error(
      result.error?.message || "Lighthouse API request failed"
    );
  }

  const lighthouse = result.lighthouseResult;

  if (!lighthouse || lighthouse.runtimeError) {
    throw new Error(
      lighthouse?.runtimeError?.message ||
      "Lighthouse audit failed"
    );
  }

  const categoryScores = {};

  for (const category of categories) {
    const score = lighthouse.categories?.[category]?.score;

    categoryScores[category] =
      typeof score === "number"
        ? Math.round(score * 100)
        : null;
  }

  const importantMetrics = [
    "first-contentful-paint",
    "largest-contentful-paint",
    "cumulative-layout-shift",
    "total-blocking-time",
    "speed-index",
    "interactive",
  ];

  const metrics = {};

  for (const id of importantMetrics) {
    const audit = lighthouse.audits?.[id];

    if (audit) {
      metrics[id] = {
        title: audit.title,
        score: audit.score,
        displayValue: audit.displayValue || null,
      };
    }
  }

  const issues = {};

  for (const category of categories) {
    const auditRefs =
      lighthouse.categories?.[category]?.auditRefs || [];

    issues[category] = auditRefs
      .map(({ id }) => lighthouse.audits?.[id])
      .filter(
        (audit) =>
          audit &&
          typeof audit.score === "number" &&
          audit.score < 1
      )
      .map((audit) => ({
        id: audit.id,
        title: audit.title,
        description: audit.description,
        score: audit.score,
        displayValue: audit.displayValue || null,
        explanation: audit.explanation || null,
      }));
  }

  return {
    url: lighthouse.finalUrl,
    strategy,
    lighthouseVersion: lighthouse.lighthouseVersion,
    fetchTime: lighthouse.fetchTime,
    categoryScores,
    metrics,
    issues,
  };
}



export async function extractCompleteLighthouseEvidence(deployedUrl) {
  const [mobileResult, desktopResult] = await Promise.allSettled([
    extractLighthouseEvidence(deployedUrl, "mobile"),
    extractLighthouseEvidence(deployedUrl, "desktop"),
  ]);

  const mobile =
    mobileResult.status === "fulfilled"
      ? mobileResult.value
      : null;

  const desktop =
    desktopResult.status === "fulfilled"
      ? desktopResult.value
      : null;

  const errors = [];

  if (mobileResult.status === "rejected") {
    errors.push({
      strategy: "mobile",
      message: mobileResult.reason.message,
    });
  }

  if (desktopResult.status === "rejected") {
    errors.push({
      strategy: "desktop",
      message: desktopResult.reason.message,
    });
  }

  if (!mobile && !desktop) {
    throw new Error(
      errors.map((error) => error.message).join(", ")
    );
  }

  return {
    mobile,
    desktop,
    errors,
  };
}


export async function getAvailableProjects(
  resumeText,
  extractedLinks = []
) {
  const projectNames = await extractProjectNamesFromResume(resumeText);

  if (!projectNames.length) {
    return [];
  }

  const githubProfile = extractedLinks.find(
    (link) => ["github", "github-profile"].includes(link.type)
  );

  let repositories = [];

  if (githubProfile?.url) {
    try {
      repositories = await fetchUserRepositories(githubProfile.url);
    } catch (error) {
      console.warn("GitHub repositories fetch failed:", error.message);
    }
  }

  const githubProjects = matchResumeProjectsWithRepositories(
    projectNames,
    repositories
  );

  const deployedProjects = await matchDeployedLinksWithProjects(
    projectNames,
    extractedLinks
  );

  return projectNames.map((name) => {
    const githubProject = githubProjects.find(
      (project) =>
        normalizeProjectName(project.name) === normalizeProjectName(name)
    );

    const deployedProject = deployedProjects.find(
      (project) =>
        normalizeProjectName(project.projectName) === normalizeProjectName(name)
    );

    return {
      name,
      githubUrl: githubProject?.githubUrl || null,
      deployedUrl: deployedProject?.deployedUrl || null,
    };
  });
}


/**
 * Collects both GitHub source code evidence and deployed website scrape evidence for a project.
 *
 * @param {Object} project - Project descriptor object.
 * @param {string} project.name - Name of the project.
 * @param {string|null} [project.githubUrl] - GitHub repository link.
 * @param {string|null} [project.deployedUrl] - Live deployed site URL.
 * @returns {Promise<{ ProjectName: string, Github: Object|null, Deployed: Object|null, errors: Array<{ source: string, message: string }> }>} Aggregated project evidence.
 */
export async function collectProjectEvidence(project, source) {
  const evidence = {
    ProjectName: project.name,
    Github: null,
    Deployed: null,
    Lighthouse: null,
    errors: [],
  };

  if (source === "github" && project.githubUrl) {
    try {
      evidence.Github = await extractGitHubEvidence(
        project.githubUrl
      );
    } catch (error) {
      evidence.errors.push({
        source: "GitHub",
        message: error.message,
      });
    }
  }

  if (source === "deployed" && project.deployedUrl) {
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

try {
  evidence.Lighthouse =
    await extractCompleteLighthouseEvidence(project.deployedUrl);

  evidence.Lighthouse.errors.forEach((error) => {
    evidence.errors.push({
      source: `Lighthouse (${error.strategy})`,
      message: error.message,
    });
  });

} catch (error) {
  evidence.errors.push({
    source: "Lighthouse",
    message: error.message,
  });
}
  }

  return evidence;
}


/**
 * Analyzes collected project evidence using Gemini and returns structured architecture, quality, and UX audits.
 *
 * @param {Object} evidence - Collected GitHub and deployment evidence for a project.
 * @returns {Promise<{ ProjectName: string, analysis: Object|null, errors: Array<Object>, message?: string }>} Structured audit result.
 * @throws {Error} If Gemini response is empty or contains invalid JSON.
 */
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


const prompt = `
You are an experienced software engineer, senior full-stack developer,
and professional project reviewer.

Your task is to analyze the supplied project using ONLY the evidence
provided below.

PROJECT NAME:
${evidence.ProjectName}

GITHUB EVIDENCE:
${JSON.stringify(evidence.Github)}

DEPLOYED WEBSITE EVIDENCE:
${JSON.stringify(evidence.Deployed)}

LIGHTHOUSE AUDIT EVIDENCE:
${JSON.stringify(evidence.Lighthouse ?? null)}

GENERAL RULES:
- Return JSON matching the supplied schema exactly.
- Populate every required field defined in the schema.
- Do not add fields that are not defined in the schema.
- Do not invent features, code, findings, scores, or test results.
- Clearly distinguish verified findings from recommendations.
- Use empty arrays when no findings are supported.
- Put unknowns and evidence limitations in limitations.
- Never assume missing evidence means a feature or issue exists.

GITHUB ANALYSIS:
- Include Github only when GitHub evidence exists.
- Github.repositories must contain one repository analysis
  for the supplied repository.
- Map the actual repository name to "name".
- Map the actual GitHub URL to "url".
- Map its description to "describe".
- Use an empty string when the repository has no description.
- Do not invent repository descriptions or project purposes.
- Analyze actual architecture, code quality, performance,
  scalability, security, testing, and possible improvements.
- Base findings on the supplied source files and file structure.

DEPLOYED WEBSITE ANALYSIS:
- Include Deployed only when deployed website evidence exists.
- Analyze only what the supplied extracted website content supports.
- Evaluate available features, usability, UX, accessibility,
  and other schema-defined dimensions.
- Do not claim visual testing or actual accessibility testing
  because only extracted website content is provided.
- Do not claim verified performance measurements without
  Lighthouse evidence.
- Clearly mention limitations of Firecrawl-based analysis.

LIGHTHOUSE AUDIT RULES:
- lighthouseAudit is OPTIONAL.
- Include lighthouseAudit only when valid Lighthouse evidence
  is supplied.
- If Lighthouse evidence is null, missing, or unavailable,
  do not generate lighthouseAudit.
- Never generate, estimate, assume, or fabricate Lighthouse scores.
- Never invent metrics, audit results, or performance measurements.
- Preserve the distinction between mobile and desktop results.
- Analyze mobile and desktop independently.
- Use the exact category scores supplied in the evidence.
- Category scores are percentages from 0 to 100.
- Use the actual metric values and displayValue supplied.
- Do not convert or modify metric values.
- Explain relevant failed audits using their actual title,
  description, score, displayValue, and explanation.
- A Lighthouse audit score below 1 does not automatically
  mean the issue is critical.
- Prioritize issues based on their actual impact and evidence.
- Recommendations must directly address observed Lighthouse issues.
- Do not confuse Lighthouse findings with Firecrawl observations.
- Do not claim that recommendations have already been implemented.
- If one device's data is unavailable, do not fabricate its results.
- If Lighthouse evidence is incomplete, mention the limitation.
- Mobile and desktop Lighthouse results may be independently unavailable.
- Analyze each available device result independently.
- Never omit valid results from one device because the other failed.
- If only mobile evidence exists, include mobile results only.
- If only desktop evidence exists, include desktop results only.
- Do not create placeholder scores or metrics for unavailable devices.
- Preserve partial Lighthouse evidence exactly as supplied.

SCORING AND RECOMMENDATIONS:
- Every score must be supported by the supplied evidence.
- Do not assign arbitrary scores to fill missing information.
- Recommendations should be practical, specific, and actionable.
- Prioritize important security, reliability, performance,
  accessibility, and maintainability concerns where supported.
- Explain why each recommended improvement matters.

FINAL VALIDATION:
- Follow the supplied JSON schema strictly.
- Include all required fields.
- Use the correct data types.
- Do not return Markdown or explanations outside the JSON.
`;


  const response = await ai.models.generateContent({
    model: "gemini-3.5-flash-lite",
    contents: prompt,
    config: {
      responseMimeType: "application/json",
      responseSchema: ProjectAnalysisJSONSchema,
    },
  })

  if (!response.text) {
    throw new Error("Gemini returned an empty analysis response");
  }

  let parsed;
  try {
    parsed = JSON.parse(response.text)
  } catch {
    throw new Error("Gemini returned invalid analysis JSON");
  }

  const analysis = ProjectAnalysisSchema.parse(parsed)
  return {
    ProjectName: evidence.ProjectName,
    analysis,
    errors: evidence.errors,
  };
}

export async function analyzeSingleProject(
  resumeText,
  extractedLinks = [],
  projectName,
  source
) {
  if (!projectName || !["github", "deployed"].includes(source)) {
    throw new Error("Project name and valid source are required");
  }

  const availableProjects = await getAvailableProjects(
    resumeText,
    extractedLinks
  );

  const selectedProject = availableProjects.find(
    (project) =>
      normalizeProjectName(project.name) ===
      normalizeProjectName(projectName)
  );

  if (!selectedProject) {
    throw new Error("Selected project not found in resume");
  }

  return await analyzeSelectedProject(selectedProject, source);
}

/**
 * End-to-end pipeline that extracts project links from resume text, collects source and deployment evidence, and runs AI project audits.
 *
 * @param {string} resumeText - Candidate's resume text.
 * @returns {Promise<{ totalProjects: number, projects: Array<Object> }>} Total analyzed projects and their audits.
 * @throws {Error} If resume text is empty or missing.
 */


export async function analyzeSelectedProject(project, source) {
  if (!["github", "deployed"].includes(source)) {
    throw new Error("Invalid analysis source");
  }

  if (source === "github" && !project.githubUrl) {
    throw new Error("GitHub URL not available for this project");
  }

  if (source === "deployed" && !project.deployedUrl) {
    throw new Error("Deployed URL not available for this project");
  }

  const evidence = await collectProjectEvidence(project, source);

  const hasEvidence =
    source === "github"
      ? Boolean(evidence.Github)
      : Boolean(evidence.Deployed);

  if (!hasEvidence) {
    throw new Error(
      evidence.errors.map((error) => error.message).join(", ") ||
      "Unable to collect project evidence"
    );
  }

  const result = await analyzeCollectedProject(evidence);

  if (!result?.analysis) {
    throw new Error("Project analysis failed");
  }

  const analysis = result.analysis;
return {
  ProjectName: project.name,
  ...(source === "github"
    ? {
        Github: analysis.Github,
      }
    : {
        Deployed: analysis.Deployed,
        ...(analysis.lighthouseAudit && {
          lighthouseAudit: analysis.lighthouseAudit,
        }),
      }),
  errors: result.errors,
};
}

