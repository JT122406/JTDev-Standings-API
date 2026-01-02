import type {Connection} from "mariadb";
import type {FastifyInstance, FastifyRequest} from "fastify";
import type {WithConnection} from "../../types/types.ts";

import '@fastify/swagger'


const searchPlayer: (fastify: FastifyInstance, withConnection: WithConnection) => Promise<void> = async(fastify: FastifyInstance, withConnection: WithConnection): Promise<void> => {
    fastify.get<{ Querystring: { id?: number; display_name?: string }}>(
        '/players/player',
        {
            schema: {
                tags: ['Players'],
                description: 'Retrieve a specific player from the database by their display name or id',
                querystring: {
                    type: 'object',
                    properties: {
                        id: { type: 'number' },
                        display_name: { type: 'string' }
                    }
                },
                response: {
                    200:
                        {
                            type: 'object',
                            properties: {
                                id: { type: 'number' },
                                display_name: { type: 'string' }
                            }
                        }
                }
            }
        },
        async (request: FastifyRequest<{ Querystring: { id?: number; display_name?: string } }>): Promise<{ id: number, display_name: string}> => {
            return withConnection(async (conn: Connection): Promise<{ id: number, display_name: string}> => {
                const id: number | null = request.query.id;
                const displayName: string | null = request.query.display_name;
                let query: string = 'SELECT * FROM Players WHERE 1=1';
                const params: any[] = [];

                if (id !== undefined) {
                    query += ' AND id = ?';
                    params.push(id);
                }

                if (displayName !== undefined) {
                    query += ' AND display_name = ?';
                    params.push(displayName);
                }

                const rows = await conn.query(query, params);

                return rows[0] || {};
            });
        })
}

export default searchPlayer;