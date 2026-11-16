import createGeminiClient from "../GeminiClient.js"
import * as z from "zod";
import Puppeteer from 'puppeteer'
import { resumeHtmlSchema } from "./AiResume.schema.js";

const ai = createGeminiClient()


/**
 * Compiles a self-contained HTML resume into a print-ready A4 PDF buffer using Puppeteer.
 *
 * @param {Object} params - PDF generation parameters.
 * @param {string} params.resumeHtml - Valid, self-contained HTML string with embedded CSS.
 * @returns {Promise<Buffer>} Generated PDF binary buffer.
 * @throws {Error} If Puppeteer fails during page rendering or PDF print.
 */
async function GeneratePdf({ resumeHtml }) {
  const browser = await Puppeteer.launch()
  try {
    const page = await browser.newPage()
    await page.setContent(resumeHtml, {
      waitUntil: 'networkidle0'
    })
    await page.emulateMediaType('print');
    const pdfBuffer = await page.pdf({
      format: 'A4',
      printBackground: true,
      margin: {
        top: '20px',
        bottom: '20px',
        left: '20px',
        right: '20px'
      }
    })
    return pdfBuffer
  } catch (err) {
    console.error("Error generating PDF:", err)
    throw err
  } finally {
    if (browser) {
      await browser.close()
    }
  }
}

/**
 * Generates an ATS-compliant, role-tailored resume HTML via Gemini and converts it to an A4 PDF buffer.
 *
 * @param {Object} params - Resume synthesis parameters.
 * @param {string} params.resume - Extracted text of the candidate's existing resume.
 * @param {Array} params.extractedLinks - List of extracted links from the resume.
 * @param {string} params.SelfDescription - Candidate's personal self-description.
 * @param {string} params.jobDescription - Target job requirements and specifications.
 * @param {string} params.targetRole - Target role title.
 * @returns {Promise<Buffer>} Binary PDF buffer of the tailored resume.
 */

async function generateResumePdf({ resume, extractedLinks = [], SelfDescription,targetRole, jobDescription, companyResearch }) {

 
  const resumeHtmlJsonSchema = z.toJSONSchema(resumeHtmlSchema)


const prompt = `
You are an expert ATS Resume Writer, Senior Technical Recruiter,
Career Strategist, and Professional Resume Designer.

Your task is to create a high-quality, job-specific, ATS-friendly
professional resume using the candidate's actual information.

Your output must be a complete HTML5 document that will be
converted into an A4 PDF using Puppeteer.

==================================================
CANDIDATE INFORMATION
==================================================

ORIGINAL RESUME TEXT:
${resume}

EXTRACTED RESUME LINKS:
${JSON.stringify(extractedLinks || [], null, 2)}

SELF DESCRIPTION:
${SelfDescription || "Not provided"}

TARGET ROLE:
${targetRole || "Not specified"}

JOB DESCRIPTION:
${jobDescription || "Not provided"}

COMPANY RESEARCH:
${companyResearch
  ? JSON.stringify(companyResearch, null, 2)
  : "Not available"}

==================================================
1. CANDIDATE INFORMATION ANALYSIS
==================================================

First, understand the candidate's actual profile.

Identify:
- Personal and contact information.
- Programming languages.
- Frontend technologies.
- Backend technologies.
- Frameworks and libraries.
- Databases.
- APIs and integrations.
- Authentication technologies.
- Developer tools.
- Cloud and deployment technologies.
- Projects and their actual functionality.
- Work experience and internships.
- Education.
- Certifications.
- Achievements.

Use ORIGINAL RESUME TEXT as the primary source of candidate facts.

Use SELF DESCRIPTION for additional relevant information.

Use EXTRACTED RESUME LINKS to preserve valid professional URLs.

Never assume missing information.

==================================================
2. JOB DESCRIPTION ANALYSIS
==================================================

Analyze the JOB DESCRIPTION before writing the resume.

Identify and prioritize:

1. Required technical skills.
2. Preferred technical skills.
3. Programming languages.
4. Frameworks and libraries.
5. Backend and frontend requirements.
6. Database technologies.
7. API development requirements.
8. Authentication and security requirements.
9. Software engineering concepts.
10. Cloud and deployment requirements.
11. Testing and debugging requirements.
12. Development tools.
13. Responsibilities.
14. Role-specific terminology.

Classify keywords internally:

HIGH PRIORITY:
Mandatory skills and technologies emphasized in the
job description.

MEDIUM PRIORITY:
Supporting skills and secondary responsibilities.

LOW PRIORITY:
Optional qualifications and less relevant terminology.

Use COMPANY RESEARCH only as supplementary context.
The job description must remain the primary source
for determining resume relevance.

Do not include this analysis in the final resume.

==================================================
3. ATS KEYWORD OPTIMIZATION
==================================================

ATS optimization is a major priority.

Compare job-description keywords with the candidate's
actual skills and experience.

Classify each keyword internally:

SUPPORTED:
Clearly demonstrated in the resume or self-description.

RELATED:
Demonstrated through relevant project implementation
or related practical experience.

UNSUPPORTED:
Not demonstrated by the candidate.

RULES:

- Include supported keywords naturally.
- Use related concepts only when actual implementation
  supports them.
- Never present unsupported keywords as candidate skills.
- Never add technologies just to increase ATS matching.
- Use exact technology names where appropriate.
- Avoid keyword stuffing and unnatural repetition.

Place relevant supported keywords naturally in:

- Professional Summary.
- Technical Skills.
- Projects.
- Work Experience.
- Achievements.

Prioritize important keywords over keyword quantity.

==================================================
4. PROFESSIONAL SUMMARY
==================================================

Create a strong, concise, role-specific professional summary.

Requirements:

- Usually 2-4 sentences.
- Clearly communicate the candidate's profile.
- Highlight the most relevant technical skills.
- Mention actual project or professional experience.
- Align the summary with the target role.
- Naturally include important supported keywords.
- Emphasize practical technical capabilities.

Avoid generic statements such as:
"Hardworking and passionate developer."
"Looking for a challenging opportunity."
"Highly motivated individual."

Do not invent years of experience or professional achievements.

==================================================
5. TECHNICAL SKILLS
==================================================

Organize skills into logical categories:

- Programming Languages
- Frontend Development
- Backend Development
- Databases
- APIs and Authentication
- Cloud and Deployment
- Developer Tools
- Other Relevant Technologies

Rules:

- Include only verified skills.
- Prioritize job-relevant technologies.
- Use standard technology names.
- Avoid duplicates.
- Do not include unsupported technologies.
- Do not use skill progress bars, stars, or percentages.

Keep the section organized and ATS-readable.

==================================================
6. PROJECTS
==================================================

Projects are especially important for entry-level candidates.

Prioritize projects according to their relevance to the
target role.

For each project, include:

- Project name.
- GitHub or deployed URL, if available.
- Short project overview.
- Technologies used.
- Actual technical implementation.
- Meaningful contributions.

Write impactful bullet points that explain:

- What the project does.
- What problem it solves.
- How it was implemented.
- Which technologies were used.
- What technical functionality was developed.

Use action verbs where appropriate:

Developed, Implemented, Designed, Built, Integrated,
Engineered, Optimized, Configured, Automated, Deployed.

For full-stack projects, highlight relevant frontend,
backend, database, API, authentication, integration,
and deployment work where supported.

NEVER INVENT:

- Project features.
- Technologies.
- User counts.
- Performance metrics.
- Revenue or business impact.
- Team size.
- Responsibilities.
- Deployment status.
- Scalability claims.

Do not exaggerate a basic project into a complex
enterprise-level application.

==================================================
7. WORK EXPERIENCE AND INTERNSHIPS
==================================================

If actual experience is available, include:

- Company name.
- Job title.
- Location, if available.
- Employment dates.
- Responsibilities.
- Technical contributions.
- Relevant technologies.

Use concise, action-oriented bullet points.

If no verified professional experience exists,
do not create a fictional experience section.

Give appropriate importance to projects for fresher candidates.

==================================================
8. EDUCATION
==================================================

Preserve actual educational information:

- Degree or qualification.
- Institution name.
- Location, if available.
- Graduation year.
- Expected graduation year, if available.
- CGPA or percentage, if provided.

Never invent academic details.
Never convert percentages into CGPA.

==================================================
9. CERTIFICATIONS AND ACHIEVEMENTS
==================================================

Include only verified information.

Possible sections:

- Certifications.
- Hackathons.
- Coding competitions.
- Open-source contributions.
- Technical awards.
- Academic achievements.

Do not convert participation into winning achievements.

Never invent certificates, awards, dates, or organizations.

==================================================
10. CONTACT INFORMATION AND LINKS
==================================================

Preserve available:

- Full name.
- Email.
- Phone number.
- Location.
- LinkedIn.
- GitHub.
- Portfolio.

Use extracted links where relevant.

IMPORTANT:
- Preserve URLs exactly.
- Do not invent or modify URLs.
- Use valid clickable HTML hyperlinks.
- Use readable link labels.
- Do not include irrelevant links.

==================================================
11. CONTENT WRITING QUALITY
==================================================

Write in professional English.

Requirements:

- Clear and concise sentences.
- Active voice.
- Strong action verbs.
- Correct grammar.
- No unnecessary adjectives.
- No repetitive statements.
- No first-person pronouns.
- No casual language.
- No exaggerated claims.
- No unsupported achievements.

Improve the candidate's original writing without
changing its factual meaning.

Every bullet point must communicate meaningful information.

==================================================
12. RESUME SECTION ORDER
==================================================

For entry-level candidates, generally use:

1. Contact Information
2. Professional Summary
3. Technical Skills
4. Projects
5. Education
6. Internships or Work Experience, if available
7. Certifications, if available
8. Achievements, if relevant

For experienced candidates, prioritize work experience.

Choose the order according to the candidate's actual profile.

Use standard ATS-recognizable headings.

Do not create empty sections.

==================================================
13. PROFESSIONAL DESIGN
==================================================

Create a premium, clean, modern, recruiter-friendly resume.

The document must look professionally designed,
not like a generic AI-generated template.

DESIGN:

- White background.
- Dark navy or charcoal headings.
- Black or dark gray body text.
- One subtle accent color.
- Consistent typography.
- Balanced spacing.
- Clear visual hierarchy.
- Professional alignment.

TYPOGRAPHY:

Use Arial, Helvetica, or Calibri.

Suggested sizes:

- Candidate Name: 24-27px.
- Section Headings: 13-15px.
- Project Titles: 11-12px.
- Body Text: 10-11px.
- Contact Information: 9-10px.

LAYOUT:

- Prefer a single-column layout.
- Consistent left alignment.
- Uniform section spacing.
- Readable bullet points.
- Balanced margins.
- Subtle separators where useful.

STRICTLY AVOID:

- Multiple columns.
- Tables for resume content.
- Skill rating bars.
- Stars and progress indicators.
- Profile photos.
- Decorative icons.
- Charts and infographics.
- Gradients.
- Excessive colors.
- Unnecessary sidebars.
- Background graphics.

ATS readability must always take priority over decoration.

==================================================
14. A4 PDF FORMATTING
==================================================

The resume will be converted to PDF using Puppeteer.

Requirements:

- A4 paper size.
- Maximum 2 pages.
- Prefer 1 page when content allows.
- Never shrink text excessively.
- Maintain readable typography.
- Avoid excessive empty space.
- Avoid overcrowded sections.
- Keep headings with their content.
- Avoid awkward page breaks.
- Keep project titles and descriptions together.
- Preserve clickable hyperlinks.
- Keep all text selectable.

Include print-friendly CSS:

@page {
  size: A4;
  margin: 14mm;
}

Use appropriate CSS properties:

- break-inside: avoid;
- page-break-inside: avoid;
- overflow-wrap: anywhere;
- print-color-adjust: exact;

Do not use fixed heights that can clip content.

Never hide content to meet the page limit.

==================================================
15. HTML REQUIREMENTS
==================================================

Generate a complete, valid HTML5 document.

Required structure:

- <!DOCTYPE html>
- <html lang="en">
- <head>
- <meta charset="UTF-8">
- <meta name="viewport">
- <title>
- Embedded <style>
- <body>

Use semantic HTML:

- header
- main
- section
- h1
- h2
- h3
- p
- ul
- li
- a

Rules:

- All CSS must be embedded.
- No external stylesheets.
- No JavaScript.
- No external fonts.
- No external images.
- No unnecessary dependencies.
- Properly escape HTML characters.
- Close every HTML element.
- Ensure links work in the generated PDF.
- Ensure compatibility with Puppeteer and Chromium.

==================================================
16. FINAL QUALITY CHECK
==================================================

Before returning the HTML, internally verify:

FACTUAL ACCURACY:
- Every candidate-specific claim is supported.
- No skills are fabricated.
- Project details are accurate.
- Education and experience are preserved.
- No unsupported metrics exist.

ATS QUALITY:
- Important supported keywords are included.
- Keywords are naturally placed.
- Standard headings are used.
- No keyword stuffing exists.
- Text remains readable as plain text.

RECRUITER QUALITY:
- Target role is immediately clear.
- Strongest skills are easy to identify.
- Projects communicate real technical work.
- Resume is concise and professional.

DESIGN QUALITY:
- Layout looks polished.
- Typography is readable.
- Spacing is consistent.
- A4 formatting is appropriate.
- No content is clipped or hidden.

HTML QUALITY:
- Valid HTML5.
- Properly closed tags.
- Self-contained CSS.
- Correct hyperlinks.
- Puppeteer-compatible output.

Fix any identified issue before returning the final result.

==================================================
17. FINAL OUTPUT RULES
==================================================

Return only valid JSON matching the provided response schema.

The JSON must contain the complete HTML document
inside the required html field.

Do not return Markdown.
Do not return code fences.
Do not return explanations.
Do not return ATS analysis.
Do not return keyword lists.
Do not return ATS scores.
Do not return recruiter notes.
Do not return company research notes.
Do not return a cover letter.
Do not include anything outside the JSON structure.

Generate only the final, accurate, professional,
job-specific, ATS-friendly resume in complete HTML.
`;


  const response = await ai.models.generateContent({
    model: "gemini-3.5-flash-lite",
    contents: prompt,
    config: {
      responseMimeType: "application/json",
      responseSchema: resumeHtmlJsonSchema
    }
  })

  const resumeHtmlJson = JSON.parse(response.text)
  return await GeneratePdf({ resumeHtml: resumeHtmlJson.html })
}

export { generateResumePdf }