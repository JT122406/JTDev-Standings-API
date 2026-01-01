import type {FastifyInstance} from "fastify";
import Fastify from "fastify";
import cors from '@fastify/cors';
import Swagger from "./swagger/Swagger.ts";


/** Fastify server instance **/
const fastify: FastifyInstance = Fastify({ logger: true })

/**
 * Builds and configures the Fastify server instance.
 * @returns {Promise<FastifyInstance>} The configured Fastify server instance.
 */
async function buildServer(): Promise<FastifyInstance> {
    await fastify.register(cors, { origin: '*' });

    await Swagger(fastify);

    return fastify;
}

/**
 * Starts the Fastify server.
 * @see buildServer
 */
const start: () => Promise<void> = async (): Promise<void> => {
    const app: FastifyInstance = await buildServer();

    try {
        await app.listen({
            host: '0.0.0.0',
            port: 3000
        })
    } catch (err) {
        process.exit(1)
    }
}


void start();