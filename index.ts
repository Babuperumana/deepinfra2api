// Define interfaces for better type safety
interface ModelData {
    id: string;
    object: string;
    created: number;
    owned_by: string;
}

interface ChatCompletionRequest {
    model: string;
    [key: string]: any; // Allow additional properties
}

// Load configuration from environment variables
const CONFIG = {
    port: parseInt(process.env.PORT || '12506'),
    apiKey: process.env.API_KEY || 'kaippulli-temple',
    corsOrigins: process.env.CORS_ORIGINS ? process.env.CORS_ORIGINS.split(',') : ['*']
};

// Simple logging function
function log(level: 'INFO' | 'ERROR' | 'WARN', message: string, data?: any) {
    const timestamp = new Date().toISOString();
    const logMessage = `[${timestamp}] ${level}: ${message}`;
    if (data) {
        console.log(logMessage, data);
    } else {
        console.log(logMessage);
    }
}

// Allowed models list - using a Set for efficient lookups and to avoid duplicates
const allowedModels = new Set([
  "PaddlePaddle/PaddleOCR-VL-0.9B",
  "openai/gpt-oss-120b",
  "Qwen/Qwen3-Next-80B-A3B-Instruct",
  "zai-org/GLM-4.5",
  "microsoft/Phi-4-multimodal-instruct",
  "google/codegemma-7b-it",
  "meta-llama/Llama-4-Maverick-17B-128E-Instruct-Turbo",
  "Qwen/Qwen3-32B",
  "google/gemma-3-27b-it",
  "Qwen/Qwen3-30B-A3B",
  "lizpreciatior/lzlv_70b_fp16_hf",
  "Qwen/Qwen2.5-Coder-32B-Instruct",
  "mistralai/Devstral-Small-2507",
  "deepinfra/airoboros-70b",
  "microsoft/WizardLM-2-7B",
  "Qwen/Qwen3-Coder-30B-A3B-Instruct",
  "meta-llama/Llama-3.3-70B-Instruct-Turbo",
  "mistralai/Mistral-Small-3.1-24B-Instruct-2503",
  "zai-org/GLM-4.5-Air",
  "mistralai/Mistral-7B-Instruct-v0.2",
  "allenai/olmOCR-7B-1025",
  "mistralai/Mistral-Small-3.2-24B-Instruct-2506",
  "deepseek-ai/DeepSeek-V3-0324",
  "deepseek-ai/DeepSeek-Prover-V2-671B",
  "Qwen/Qwen3-14B",
  "meta-llama/Llama-4-Scout-17B-16E-Instruct",
  "deepseek-ai/DeepSeek-R1-Distill-Qwen-32B",
  "deepseek-ai/DeepSeek-R1-Distill-Llama-70B",
  "Qwen/Qwen3-235B-A22B",
  "mistralai/Mistral-7B-Instruct-v0.3",
  "google/gemma-3-4b-it",
  "zai-org/GLM-4.6",
  "allenai/olmOCR-7B-0725-FP8",
  "deepseek-ai/DeepSeek-V3-0324-Turbo",
  "mistralai/Devstral-Small-2505",
  "meta-llama/Llama-Guard-4-12B",
  "Qwen/Qwen3-Coder-480B-A35B-Instruct",
  "deepseek-ai/DeepSeek-V3",
  "mistralai/Mistral-7B-Instruct-v0.1",
  "deepseek-ai/DeepSeek-V3.1",
  "microsoft/phi-4-reasoning-plus",
  "meta-llama/Llama-3.2-90B-Vision-Instruct",
  "google/gemma-2-9b-it",
  "deepseek-ai/DeepSeek-V3.2-Exp",
  "google/gemma-2-27b-it",
  "moonshotai/Kimi-K2-Instruct-0905",
  "moonshotai/Kimi-K2-Instruct",
  "Qwen/QVQ-72B-Preview",
  "NovaSky-AI/Sky-T1-32B-Preview",
  "microsoft/phi-4",
  "Qwen/Qwen3-235B-A22B-Instruct-2507",
  "deepseek-ai/DeepSeek-R1-0528",
  "google/gemma-1.1-7b-it",
  "openai/gpt-oss-20b",
  "Qwen/Qwen3-235B-A22B-Thinking-2507",
  "meta-llama/Llama-3.3-70B-Instruct",
  "deepseek-ai/DeepSeek-R1-0528-Turbo",
  "Qwen/Qwen3-Coder-480B-A35B-Instruct-Turbo",
  "allenai/olmOCR-7B-0825",
  "deepseek-ai/DeepSeek-V3.1-Terminus",
  "Qwen/QwQ-32B-Preview",
  "meta-llama/Llama-4-Maverick-17B-128E-Instruct-FP8",
  "google/gemma-3-12b-it",
  "Qwen/Qwen2.5-7B-Instruct"
]);

// Cache for source data to improve performance
let cachedSourceData: ModelData[] | null = null;
let cacheTimestamp: number | null = null;
const CACHE_TTL = 60 * 1000; // 1 minute cache

// Simplified CORS headers
const CORS_HEADERS = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization",
    "Access-Control-Max-Age": "86400",
};

// Helper function to create JSON response with CORS headers
function createJsonResponse<T>(data: T, status = 200) {
    return new Response(JSON.stringify(data), {
        status,
        headers: {
            "Content-Type": "application/json",
            ...CORS_HEADERS,
        },
    });
}

// Helper function to validate API key
function validateApiKey(authHeader: string): boolean {
    if (!authHeader.startsWith('Bearer ')) {
        return false;
    }
    const token = authHeader.slice(7); // Remove 'Bearer ' prefix
    return token === CONFIG.apiKey;
}

// Helper function to get models data with caching
async function getModelsData() {
    const now = Date.now();

    // Check if cache is valid
    if (cachedSourceData && cacheTimestamp && (now - cacheTimestamp) < CACHE_TTL) {
        return cachedSourceData;
    }

    // Convert allowedModels Set to ModelData array
    cachedSourceData = Array.from(allowedModels).map((modelName) => ({
      id: modelName,
      object: "model",
      created: 1640995200,
      owned_by: modelName.split('/')[0] || modelName
    }));

    cacheTimestamp = now;
    return cachedSourceData;
}

// Main server logic
const server = Bun.serve({
    port: CONFIG.port,
    async fetch(request: Request) {
        const url = new URL(request.url);

        // Handle CORS preflight requests
        if (request.method === "OPTIONS") {
            return createJsonResponse(null, 204);
        }

        // Handle GET requests for models list
        if (request.method === "GET" && url.pathname === "/models") {
            log('INFO', `Models list requested from ${request.headers.get('CF-Connecting-IP') || 'unknown'}`);
            try {
                const modelsData = await getModelsData();
                return createJsonResponse({
                    object: "list",
                    data: modelsData
                });
            } catch (error) {
                log('ERROR', 'Error fetching models', error);
                return createJsonResponse({
                    error: {
                        message: "Failed to get models",
                        type: "server_error",
                        code: 500
                    }
                }, 500);
            }
        }

        // Handle POST requests for chat completions
        if (request.method !== "POST" || url.pathname !== "/chat/completions") {
            log('WARN', `Invalid request method/path: ${request.method} ${url.pathname}`);
            return createJsonResponse({
                error: {
                    message: "Method not allowed",
                    type: "invalid_request_error",
                    code: 405
                }
            }, 405);
        }

        // Validate Authorization header
        const authHeader = request.headers.get("Authorization");
        if (!authHeader) {
            log('WARN', 'Missing Authorization header');
            return createJsonResponse({
                error: {
                    message: "Missing Authorization header",
                    type: "authentication_error",
                    code: 401
                }
            }, 401);
        }

        // Validate API key
        if (!validateApiKey(authHeader)) {
            log('WARN', 'Invalid API key provided');
            return createJsonResponse({
                error: {
                    message: "Invalid API key",
                    type: "authentication_error",
                    code: 401
                }
            }, 401);
        }

        try {
            // Clone request body
            const body = await request.json() as ChatCompletionRequest;
            log('INFO', `Chat completion request for model: ${body.model}`);

            // Construct new request headers
            const headers = new Headers({
                "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/133.0.0.0 Safari/537.36 Edg/133.0.0.0",
                "Accept": "text/event-stream",
                "Accept-Encoding": "gzip, deflate, br, zstd",
                "Content-Type": "application/json",
                "sec-ch-ua-platform": "Windows",
                "X-Deepinfra-Source": "web-page",
                "sec-ch-ua": "\"Not(A:Brand\";v=\"99\", \"Microsoft Edge\";v=\"133\", \"Chromium\";v=\"133\"",
                "sec-ch-ua-mobile": "?0",
                "Origin": "https://deepinfra.com",
                "Sec-Fetch-Site": "same-site",
                "Sec-Fetch-Mode": "cors",
                "Sec-Fetch-Dest": "empty",
                "Referer": "https://deepinfra.com/"
            });

            // Send request to DeepInfra
            const response = await fetch("https://api.deepinfra.com/v1/openai/chat/completions", {
                method: "POST",
                headers: headers,
                body: JSON.stringify(body)
            });

            log('INFO', `DeepInfra response status: ${response.status}`);

            // Construct response
            return new Response(response.body, {
                status: response.status,
                statusText: response.statusText,
                headers: {
                    ...CORS_HEADERS,
                    "Content-Type": response.headers.get("Content-Type") || "application/json",
                }
            });

        } catch (error) {
            log('ERROR', 'Error in chat completion', error);
            return createJsonResponse({
                error: {
                    message: (error as Error).message,
                    type: "server_error",
                    code: 500
                }
            }, 500);
        }
    },
});

log('INFO', `Server started on port ${server.port}`);
