<template>
  <v-container>
    <div v-if="client">OK</div>
    <div v-else>KO</div>
    <ListGroups :groups="groups" :client="client" />
  </v-container>
</template>

<script>
import ListGroups from '../components/ListGroupsWithFilter.vue'
import gqlClient from '../graphql/Client.gql'
import gqlGroups from '../graphql/Groups.gql'

export default {
  name: 'GroupsView',
  components: {
    ListGroups,
  },
  data: () => ({
    client: null,
    groups: [],
  }),
  apollo: {
    client () {
      return {
        query: gqlClient,
      }
    },
    groups: {
      query: gqlGroups,
    },
  },
}
</script>
