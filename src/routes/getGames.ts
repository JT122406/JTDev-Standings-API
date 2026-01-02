import type {Connection} from "mariadb";
import type {FastifyInstance} from "fastify";
import type {WithConnection} from "../types/types.ts";

import '@fastify/swagger'


const getGames: (fastify: FastifyInstance, withConnection: WithConnection) => Promise<void> = async(fastify: FastifyInstance, withConnection: WithConnection): Promise<void> => {
    fastify.get('/getGames',
        {
            schema: {
                tags: ['Games'],
                description: 'Retrieve a list of all games from the database',
                response: {
                    200:
                        {
                            type: 'array',
                                items: {
                                type: 'object',
                                    properties: {
                                        id: { type: 'number' },
                                        title: { type: 'string' }
                                    }
                                }
                        }
                }
            }
        },
        async (): Promise<{ id: number, title: string}[]> => {
        return withConnection(async (conn: Connection): Promise<{ id: number, title: string}[]> => {
            return await conn.query('SELECT * FROM Games');
        });
    })
}

export default getGames;