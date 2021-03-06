module.exports = {

  publicPath: '/',

  transpileDependencies: [
    'vuetify',
  ],

  pluginOptions: {
    apollo: {
      // Enable automatic mocking
      // enableMocks: true,

      // Enable Apollo Engine
      // enableEngine: true,

      // Enable ESLint for `.gql` files
      lintGQL: false,

      /* Other options (with default values) */

      // Base folder for the server source files
      // serverFolder: './apollo-server',
      // Cross-Origin options
      cors: '*',
      // Requests timeout (ms)
      // timeout: 120000,
      // Integrated apollo engine
      // integratedEngine: true,
      // For enable typescript server files
      // if you don't have @vue/cli-plugin-typescript
      // typescript: true,
    },
  },

}
