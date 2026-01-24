const fs = require('fs');
const path = require('path');

// Simple .env parser for local development
const envPath = path.join(__dirname, '.env');
if (fs.existsSync(envPath)) {
    const envConfig = fs.readFileSync(envPath, 'utf8');
    envConfig.split('\n').forEach(line => {
        const [key, value] = line.split('=');
        if (key && value) {
            process.env[key.trim()] = value.trim();
        }
    });
}

const configContent = `const config = {
    SUPABASE_URL: '${process.env.SUPABASE_URL || ""}',
    SUPABASE_ANON_KEY: '${process.env.SUPABASE_ANON_KEY || ""}',
    GEMINI_API_KEY: '${process.env.GEMINI_API_KEY || ""}'
};

export default config;
`;

const configPath = path.join(__dirname, 'JS', 'config.js');

try {
    fs.writeFileSync(configPath, configContent);
    console.log('Successfully generated JS/config.js');
} catch (error) {
    console.error('Error generating configuration:', error);
    process.exit(1);
}
