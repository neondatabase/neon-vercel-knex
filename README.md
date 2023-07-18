# neon-vercel-knex

This repo demonstrates using [Knex.js](https://knexjs.org/) with [Neon's serverless driver](https://www.npmjs.com/package/@neondatabase/serverless) on [Vercel](https://vercel.com/) Edge Functions.

We implement a simple app that generates a JSON listing of the user's nearest 10 UNESCO World Heritage sites via IP geolocation (data copyright © 1992 – 2022 [UNESCO/World Heritage Centre](https://whc.unesco.org/en/syndication/)).

The Vercel Edge Function API endpoint source is found in `./api-src`.


### How it works

Knex.js tries to import some Node.js modules that aren't available on Edge Functions. We provide shims for these modules in `./shims`, and these are listed as `file:` packages in `package.json`. The `assert`, `events` and `util.promisify` packages are also installed to support Knex.js.

To make the shims work with Edge Functions requires a build step. We use `esbuild` to bundle the source files in `./api-src` with all dependencies, depositing the output files in `./api`. The build command is found in `package.json` > `"scripts"` > `"build"`.

Note that the line `export const config = { runtime: 'edge' }`, which is required to create an Edge function, is not present in the source files. Because it must take this specific form, it is instead appended at the end of the build process. It can be edited (e.g. to add a `regions` key) in the `--footer:js=` argument of the `esbuild` build command.


## Deploy

* Ensure the `psql` client is installed.

* Create a Neon database and make a note of the connection string from the [Neon console](https://console.neon.tech/).

* Clone this repo, then:

```bash
# get dependencies
npm install
npm install -g vercel@latest

# set up Vercel
npx vercel login
npx vercel link

# create DATABASE_URL environment variable, remote and local
npx vercel env add DATABASE_URL  # paste in the connection string: postgres://...
npx vercel env pull .env.local  # now bring it down into ./.env.local for local use

# create the schema and copy data to DB
(source .env.local \
 && curl -s https://gist.githubusercontent.com/jawj/a8d53ff339707c65128af83b4783f4fe/raw/45dbcc819b00ecb72f80b0cf91e01b3d055662b5/whc-sites-2021.psql \
 | psql $DATABASE_URL)

# test ...
npx vercel dev

# ... and deploy
npx vercel deploy
```

## Feedback and support

Please visit [Neon Community](https://community.neon.tech/) or [Support](https://neon.tech/docs/introduction/support).


