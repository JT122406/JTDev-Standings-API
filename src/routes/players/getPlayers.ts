import type {Connection} from "mariadb";
import type {FastifyInstance} from "fastify";
import type {WithConnection} from "../../types/types.ts";

import '@fastify/swagger'


const getPlayers: (fastify: FastifyInstance, withConnection: WithConnection) => Promise<void> = async(fastify: FastifyInstance, withConnection: WithConnection): Promise<void> => {
    fastify.get(
        '/players/getPlayers',
        {
            schema: {
                tags: ['Players'],
                description: 'Retrieve a list of all players from the database',
                response: {
                    200:
                        {
                            type: 'array',
                            items: {
                                type: 'object',
                                properties: {
                                    id: { type: 'number' },
                                    display_name: { type: 'string' }
                                }
                            }
                        }
                }
            }
        },
        async (): Promise<{ id: number, display_name: string}[]> => {
            return withConnection(async (conn: Connection): Promise<{ id: number, display_name: string}[]> => {
                return await conn.query('SELECT * FROM Players');
            });
        })
}

export default getPlayers;