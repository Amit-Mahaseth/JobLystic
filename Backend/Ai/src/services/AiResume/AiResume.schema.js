import * as z from "zod";

const resumeHtmlSchema = z.object({
  html: z.string().describe("The generated resume HTML content")
}).describe("Schema for the generated resume HTML");

export { resumeHtmlSchema };