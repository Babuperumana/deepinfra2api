// Import source data
import sourceData from './source_.json' with { type: 'json' };

// Define interfaces for better type safety
interface SourceModel {
    full_name: string;
    display_name: string;
    description: string;
    type: string;
}

interface ModelData {
    id: string;
    object: string;
    created: number;
    owned_by: string;
}

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

// Helper function to get models data with caching
async function getModelsData() {
    const now = Date.now();

    // Check if cache is valid
    if (cachedSourceData && cacheTimestamp && (now - cacheTimestamp) < CACHE_TTL) {
        return cachedSourceData;
    }

    // Process source data
    cachedSourceData = (sourceData as SourceModel[]).map((model) => ({
        id: model.full_name,
        object: "model",
        created: 1640995200,
        owned_by: model.full_name.split('/')[0] as string
    }));

    cacheTimestamp = now;
    return cachedSourceData;
}

// Main server logic
const server = Bun.serve({
    port: 12506,
    async fetch(request: Request) {
        const url = new URL(request.url);

        // Handle CORS preflight requests
        if (request.method === "OPTIONS") {
            return createJsonResponse(null, 204);
        }

        // Handle GET requests for models list
        if (request.method === "GET" && url.pathname === "/models") {
            try {
                const modelsData = await getModelsData();
                return createJsonResponse({
                    object: "list",
                    data: modelsData
                });
            } catch (error) {
                console.error("Error fetching models:", error);
                return createJsonResponse({
                    error: "Failed to get models",
                    details: (error as Error).message
                }, 500);
            }
        }

        // Handle POST requests for chat completions
        if (request.method !== "POST" || url.pathname !== "/chat/completions") {
            return createJsonResponse({ error: "Method not allowed" }, 405);
        }

        // Validate Authorization header
        const authHeader = request.headers.get("Authorization");
        if (!authHeader) {
            return createJsonResponse({ error: "Missing Authorization header" }, 401);
        }

        try {
            // Clone request body
            const body = await request.json();

            // Construct new request headers
            const headers = new Headers({
                "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/133.0.0.0 Safari/537.36 Edg/133.0.0.0",
                "Accept": "text/event-stream",
                "Accept-Encoding": "gzip, deflate, br, zstd",
                "Content-Type": "application/json",
                "sec-ch-ua-platform": "Arch Linux",
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
            console.error("Error in chat completion:", error);
            return createJsonResponse({ error: (error as Error).message }, 500);
        }
    },
});

console.log(`Server running at http://localhost:${server.port}`);