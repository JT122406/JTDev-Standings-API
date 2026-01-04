import type {Connection} from "mariadb";
import type {FastifyInstance, FastifyRequest} from "fastify";
import type {WithConnection} from "../../types/types.ts";

import '@fastify/swagger'


const getGame: (fastify: FastifyInstance, withConnection: WithConnection) => Promise<void> = async(fastify: FastifyInstance, withConnection: WithConnection): Promise<void> => {
    fastify.get<{ Params: { id: number } }>('/games/:id',
        {
            schema: {
                tags: ['Games'],
                description: 'Retrieve a Game from the database based on the id',
                params: {
                    type: 'object',
                    properties: {
                        id: { type: 'number' },
                    },
                    required: ['id']
                },
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
        async (request: FastifyRequest<{ Params: { id: number } }>): Promise<{ id: number, title: string}[]> => {
            return withConnection(async (conn: Connection): Promise<{ id: number, title: string}[]> => {
                return await conn.query('SELECT * FROM Games WHERE id = ?', [request.params.id]);
            });
        })
}

export default getGame;