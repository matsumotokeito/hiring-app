<template>
  <v-card v-if="filteredDrafts.length > 0" class="mb-4" variant="outlined">
    <v-card-title>
      <v-btn
        variant="text"
        @click="showDrafts = !showDrafts"
      >
        <v-icon start>mdi-content-save</v-icon>
        保存済み下書き ({{ filteredDrafts.length }})
        <v-icon end>{{ showDrafts ? 'mdi-chevron-up' : 'mdi-chevron-down' }}</v-icon>
      </v-btn>
    </v-card-title>

    <v-expand-transition>
      <div v-show="showDrafts">
        <v-divider />
        <v-list>
          <v-list-item
            v-for="draft in filteredDrafts"
            :key="draft.id"
            @click="handleLoadDraft(draft)"
          >
            <template #prepend>
              <v-avatar color="blue-lighten-4">
                <v-icon color="blue">mdi-account</v-icon>
              </v-avatar>
            </template>

            <v-list-item-title class="font-weight-medium">
              {{ draft.title }}
            </v-list-item-title>

            <v-list-item-subtitle>
              <div class="d-flex align-center">
                <v-icon size="14" class="mr-1">mdi-clock</v-icon>
                {{ draft.savedAt.toLocaleString('ja-JP') }}
                <v-chip
                  size="x-small"
                  color="blue"
                  class="ml-3"
                >
                  {{ draft.stage === 'candidate_input' ? '候補者情報' : '評価入力' }}
                </v-chip>
              </div>
            </v-list-item-subtitle>

            <template #append>
              <div class="d-flex">
                <v-btn
                  size="small"
                  color="blue"
                  variant="outlined"
                  class="mr-2"
                  @click.stop="handleLoadDraft(draft)"
                >
                  読み込み
                </v-btn>
                <v-btn
                  size="small"
                  color="red"
                  variant="outlined"
                  icon
                  @click.stop="handleDeleteDraft(draft.id)"
                >
                  <v-icon>mdi-delete</v-icon>
                </v-btn>
              </div>
            </template>
          </v-list-item>
        </v-list>
      </div>
    </v-expand-transition>
  </v-card>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { SavedDraft } from '../types';
import { getDrafts, deleteDraft } from '../utils/storage';

interface Props {
  currentJobType?: string;
}

const props = defineProps<Props>();

const emit = defineEmits<{
  'load-draft': [draft: SavedDraft];
}>();

const drafts = ref<SavedDraft[]>([]);
const showDrafts = ref(false);

const filteredDrafts = computed(() => {
  return props.currentJobType 
    ? drafts.value.filter(d => d.jobType === props.currentJobType)
    : drafts.value;
});

const handleLoadDraft = (draft: SavedDraft) => {
  emit('load-draft', draft);
  showDrafts.value = false;
};

const handleDeleteDraft = (draftId: string) => {
  if (confirm('この下書きを削除しますか？')) {
    deleteDraft(draftId);
    loadDrafts();
  }
};

const loadDrafts = () => {
  drafts.value = getDrafts();
};

onMounted(() => {
  loadDrafts();
});
</script>