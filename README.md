# ai-pdf-summary-

A TypeScript script that reads PDF files from a directory, generates concise summaries using an LLM, and compiles the results into a single summary PDF. Perfect for automating document reviews or creating quick overviews of large text files.

### Setup

Run `npm install`

Copy .env_example to .env and add your key for the LLM credentials.

### Run script

Copy pdfs into the ./pdf folder and run `npx ts-node main.ts`

Output will be in summaries.pdf file

### Notes

This script runs with Google's Gemini 1.5 Flash LLM. Thanks to Vercel's flexible AI library, you can easily switch to another provider.
