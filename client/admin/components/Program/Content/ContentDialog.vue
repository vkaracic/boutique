<template>
  <v-dialog v-model="visible" width="700">
    <v-btn slot="activator" color="success" outline>Import Content</v-btn>
    <v-card class="pa-3">
      <v-card-title class="headline">Import Content</v-card-title>
      <v-card-text>
        <v-autocomplete
          v-model="sourceId"
          :items="availableRepos"
          :loading="isLoading"
          item-value="sourceId"
          no-data-text="No available repositories for import"
          prepend-icon="search"
          label="Repository"
          placeholder="Start typing to Search"
          hide-selected/>
      </v-card-text>
      <v-card-actions>
        <v-spacer/>
        <v-btn @click="close">Cancel</v-btn>
        <v-btn @click="importRepo" color="success" outline>Import</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script>
import api from '@/admin/api/contentRepo';
import differenceBy from 'lodash/differenceBy';
import map from 'lodash/map';
import { mapActions } from 'vuex';
import pick from 'lodash/pick';

export default {
  name: 'content-import-dialog',
  props: {
    programId: { type: Number, required: true },
    importedRepos: { type: Array, default: () => ([]) }
  },
  data() {
    return {
      visible: false,
      sourceId: null,
      catalog: [],
      isLoading: false
    };
  },
  computed: {
    availableRepos() {
      return differenceBy(this.catalog, this.importedRepos, 'sourceId');
    }
  },
  methods: {
    ...mapActions('contentRepo', ['save']),
    importRepo() {
      this.save(pick(this, ['sourceId', 'programId']));
      this.close();
    },
    close() {
      this.visible = false;
      this.sourceId = null;
      this.catalog = [];
    }
  },
  watch: {
    visible(val) {
      if (!val) return;
      this.isLoading = true;
      return api.getCatalog().then(repos => {
        this.isLoading = false;
        this.catalog = map(repos, it => ({ text: it.name, sourceId: it.id }));
      });
    }
  }
};
</script>