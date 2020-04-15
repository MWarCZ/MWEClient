const path = require('path')

// Load .env files
const { loadEnv } = require('vue-cli-plugin-apollo/utils/load-env')
const env = loadEnv([
  path.resolve(__dirname, '.env'),
  path.resolve(__dirname, '.env.local'),
])

module.exports = {
  client: {
    // service: env.VUE_APP_APOLLO_ENGINE_SERVICE,
    service: {
      name: env.VUE_APP_APOLLO_ENGINE_SERVICE || 'mweclinet',
      // url: 'http://localhost:4000/graphql',
      // localSchemaFile: 'mweserver.json',
    },
    includes: ['src/**/*.{js,jsx,ts,tsx,vue,gql}'],
  },
  // service: {
  //   name: env.VUE_APP_APOLLO_ENGINE_SERVICE,
  //   // localSchemaFile: path.resolve(__dirname, './node_modules/.temp/graphql/schema.json'),
  //   url: 'http://localhost:3000/graphql',
  // },
  service: {
    name: 'mweclinet',
    // localSchemaFile: path.resolve(__dirname, './mweserver.json'),
    url: 'http://localhost:3000/graphql',
  },
  // engine: {
  //   endpoint: process.env.APOLLO_ENGINE_API_ENDPOINT,
  //   apiKey: env.VUE_APP_APOLLO_ENGINE_KEY,
  // },
}
