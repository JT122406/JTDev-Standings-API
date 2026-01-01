import fs from "fs/promises";

import swagger from "@fastify/swagger";

import type { FastifyInstance } from "fastify";
import swaggerUI from "@fastify/swagger-ui";

const Swagger: (fastify: FastifyInstance) => Promise<void> = async (fastify: FastifyInstance): Promise<void> => {
    await fastify.register(swagger, {
        openapi: {
            info: {
                title: "API Documentation",
                description: "This is the API documentation for our service.",
                version: JSON.parse(await fs.readFile(new URL("../../package.json", import.meta.url), "utf-8")).version
            },
            servers: [
                { url: 'http://localhost:port', description: 'Localhost' }
            ]
        }
    });

    await fastify.register(swaggerUI, {
       routePrefix: '/docs',
        uiConfig: {
            docExpansion: 'list',
            deepLinking: false
        }
    });
};

export default Swagger;