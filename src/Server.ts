import type {FastifyInstance} from "fastify";
import Fastify from "fastify";
import cors from '@fastify/cors';
import Swagger from "./swagger/Swagger.ts";
import mariadb, {type Pool, type PoolConnection} from "mariadb";
import 'dotenv/config';
import getGames from "./routes/getGames.ts";
import type {MariaConn, WithConnection} from "./types/types.ts";
import getPlayers from "./routes/players/getPlayers.ts";
import searchPlayer from "./routes/players/searchPlayer.ts";
import addPlayer from "./routes/players/addPlayer.ts";
import addMatch from "./routes/matches/addMatch.ts";

declare module 'fastify' {
    interface FastifyInstance {
        mariadb: Pool;
    }
}

/** Fastify server instance **/
const fastify: FastifyInstance = Fastify({ logger: true })

/**
 * Maria DB Connection Pool
 */
async function initMariaDB(): Promise<void> {
    const pool: Pool = mariadb.createPool({
        host: process.env.DB_HOST!,
        port: Number(process.env.DB_PORT ?? 3306),
        user: process.env.DB_USER!,
        password: process.env.DB_PASS!,
        database: process.env.DB_NAME!,
        connectionLimit: 10
    });

    fastify.decorate('mariadb', pool);

    fastify.addHook('onClose', async (): Promise<void> => {
        await pool.end();
        fastify.log.info('MariaDB connection pool closed');
    })

    fastify.log.info('MariaDB connection pool initialized');
}

function withConnection(): WithConnection {
    return async function <T>(fn: (conn: MariaConn) => Promise<T>): Promise<T> {
        const conn: PoolConnection = await fastify.mariadb.getConnection();
        try {
            return await fn(conn);
        } finally {
            void conn.release();
        }
    };
}

/**
 * Builds and configures the Fastify server instance.
 * @returns {Promise<FastifyInstance>} The configured Fastify server instance.
 */
async function buildServer(): Promise<FastifyInstance> {
    await fastify.register(cors, { origin: '*' });

    await Swagger(fastify);
    await getGames(fastify, withConnection());
    await getPlayers(fastify, withConnection());
    await searchPlayer(fastify, withConnection());
    await addPlayer(fastify, withConnection());
    await addMatch(fastify, withConnection());

    return fastify;
}

/**
 * Starts the Fastify server.
 * @see buildServer
 */
const start: () => Promise<void> = async (): Promise<void> => {
    await initMariaDB();
    const app: FastifyInstance = await buildServer();

    try {
        await app.listen({
            host: '0.0.0.0',
            port: Number(process.env.PORT || 8080)
        })
    } catch (err) {
        fastify.log.error(err);
        process.exit(1)
    }
}


void start();