import { GoogleGenAI } from "@google/genai"
import config from "../config/config.js"
import * as z from "zod";
import Puppeteer from 'puppeteer'
const ai = new GoogleGenAI({
  apiKey: config.GEMINI_API_KEY

})


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

async function generateResumePdf({ resume, SelfDescription, jobDescription }) {
  const resumeHtmlSchema = z.object({
    html: z.string().describe("The generated resume HTML content")
  }).describe("Schema for the generated resume HTML")
  const resumeHtmlJsonSchema = z.toJSONSchema(resumeHtmlSchema)
  const prompt = `Generate a professional, clean, and ATS-friendly resume in HTML using the information provided below.

**Resume:** ${resume}
**Self Description:** ${SelfDescription}
**Job Description:** ${jobDescription}

### Design and Formatting Instructions

1. **Professional Layout:** Create a standard, well-structured resume suitable for job applications. Use a clean white background, proper margins, consistent spacing, and a simple single-column layout.

2. **Highlight Important Information:** Use bold text for important skills, technologies, job titles, company names, project names, certifications, and key achievements. Organize content under clear headings such as Professional Summary, Technical Skills, Work Experience, Projects, Education, and Certifications, only when relevant information is available.

3. **Subtle Colors:** Use a restrained professional color palette. Use dark navy blue for section headings, black or dark gray for body text, and a subtle accent color for important details. Avoid bright colors, gradients, excessive decorations, and colorful backgrounds.

4. **Consistent Typography:** Use a professional font such as Arial, Calibri, or Helvetica. Keep font sizes consistent throughout the resume:
   - Name: 24–28px
   - Section headings: 14–16px
   - Job titles and project names: 11–12px, bold
   - Body text: 10–11px
   - Contact information: 9–10px

5. **Concise Content:** Make the resume concise and easy to scan. Remove unnecessary repetition and wordy descriptions while preserving important details, technical skills, achievements, and relevant experience. Use short bullet points instead of long paragraphs.

6. **Job Description Alignment:** Prioritize skills, projects, technologies, and experience relevant to the given job description. Naturally emphasize matching keywords without keyword stuffing or inventing qualifications.

7. **Preserve Accuracy:** Use only the information provided in the original resume and self-description. Never invent experience, skills, education, certifications, achievements, contact details, or numerical results. If information is missing, omit it.

8. **HTML and Print Compatibility:** Generate valid, self-contained HTML with embedded CSS. Use semantic HTML elements and print-friendly styling. Ensure the resume looks professional in a browser and when printed or saved as a PDF on A4 paper. Avoid unnecessary graphics, icons, tables, and complex layouts that could affect ATS readability.

9. **Final Output:** Return only the complete HTML document, starting with <!DOCTYPE html> and ending with </html>. Do not include Markdown code fences, explanations, or comments outside the HTML document.

10. **Resume Length Limit:** The resume must be a maximum of 2 A4 pages, ideally fitting on 1 page when the available information allows it. Never exceed 2 pages. Prioritize the most relevant skills, experience, projects, and achievements. Reduce unnecessary wording, adjust spacing moderately, and keep font sizes readable. Do not remove important information or make the text excessively small just to fit the page. Ensure proper page breaks and prevent headings or bullet points from being awkwardly split across pages.
`

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

export {generateResumePdf}