import knex from 'knex';
import knexPostgis from 'knex-postgis';

// create knex driver for Neon's serverless driver
import neon from '@neondatabase/serverless'
import KnexPg from 'knex/lib/dialects/postgres';
class KnexNeon extends KnexPg {
  _driver() {
    return neon;
  }
}

export default async (req, ctx) => {
  // important: create the database connection *inside* the request handler
  const db = knex({
    client: KnexNeon,
    connection: process.env.DATABASE_URL,
  });

  // set up knex PostGIS extensions
  const st = knexPostgis(db);
  db.postgisDefineExtras(knex => ({
    distanceOp: (geom1, geom2) => knex.raw('?? <-> ??', [geom1, geom2])
  }));

  const longitude = parseFloat(req.headers.get('x-vercel-ip-longitude') ?? '-122.47');
  const latitude = parseFloat(req.headers.get('x-vercel-ip-latitude') ?? '37.81');

  const sites = await db('whc_sites_2021')
    .select(
      'id_no', 'name_en', 'category',
      st.distanceOp('location', st.makePoint(longitude, latitude)).as('distance')
    )
    .orderBy('distance')
    .limit(10);

  return new Response(JSON.stringify({ longitude, latitude, sites }, null, 2));
}

// `export const config = { runtime: 'edge' }` is added in build step
