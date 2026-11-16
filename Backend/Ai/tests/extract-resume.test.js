import assert from "node:assert/strict"
import { mock, test } from "node:test"

const calls = {
  resumeData: null,
  infoOptions: null,
}

mock.module("pdf-parse", {
  exports: {
    PDFParse: class {
      constructor({ data }) {
        calls.resumeData = data
      }

      async getText() {
        return { text: "Candidate resume text" }
      }

      async getInfo(options) {
        calls.infoOptions = options
        return {
          pages: [
            {
              pageNumber: 1,
              links: [
                { text: "GitHub profile", url: "https://github.com/candidate" },
                { text: "JobLystic repository", url: "https://github.com/candidate/joblystics" },
                { text: "Duplicate link", url: "https://github.com/candidate/joblystics" },
                { text: "LinkedIn", url: "https://www.linkedin.com/in/candidate" },
                { text: "LeetCode", url: "https://leetcode.com/candidate" },
                { text: "Portfolio", url: "https://candidate.example/portfolio" },
                { text: "Live demo", url: "https://joblystics.example" },
                { text: "", url: "https://example.com/resume" },
                { text: "Unsafe", url: "javascript:alert(1)" },
              ],
            },
          ],
        }
      }

      async destroy() {}
    },
  },
})

const { default: ExtractResume } = await import(
  "../src/services/Report/ExtractResume.Services.js"
)

test("resume extraction uses one Uint8Array-backed parser for text and links", async () => {
  const result = await ExtractResume(Buffer.from("PDF data"))

  assert.deepEqual(result, {
    extractedText: "Candidate resume text",
    extractedLinks: [
      {
        name: "GitHub profile",
        url: "https://github.com/candidate",
        type: "github-profile",
        projectName: null,
        pageNumber: 1,
      },
      {
        name: "Duplicate link",
        url: "https://github.com/candidate/joblystics",
        type: "github-repository",
        projectName: "joblystics",
        pageNumber: 1,
      },
      {
        name: "LinkedIn",
        url: "https://www.linkedin.com/in/candidate",
        type: "linkedin",
        projectName: null,
        pageNumber: 1,
      },
      {
        name: "LeetCode",
        url: "https://leetcode.com/candidate",
        type: "leetcode",
        projectName: null,
        pageNumber: 1,
      },
      {
        name: "Portfolio",
        url: "https://candidate.example/portfolio",
        type: "portfolio",
        projectName: null,
        pageNumber: 1,
      },
      {
        name: "Live demo",
        url: "https://joblystics.example/",
        type: "deployed-project",
        projectName: null,
        pageNumber: 1,
      },
      {
        name: "example.com",
        url: "https://example.com/resume",
        type: "other",
        projectName: null,
        pageNumber: 1,
      },
    ],
  })
  assert.equal(calls.resumeData instanceof Uint8Array, true)
  assert.equal(Buffer.isBuffer(calls.resumeData), false)
  assert.deepEqual(calls.infoOptions, { parsePageInfo: true })
})
