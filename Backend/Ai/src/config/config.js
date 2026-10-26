import {config as dotenvConfig} from 'dotenv'

dotenvConfig()

const _Config={

    JWT_SECRET:process.env.JWT_SECRET,
    MONGO_URI:process.env.MONGO_URI,
    GEMINI_API_KEY:process.env.GEMINI_API_KEY,
    GITHUB_API:process.env.GITHUB_API,
    FIRECRAWL_API:process.env.FIRECRAWL_API
}

export default Object.freeze(_Config)