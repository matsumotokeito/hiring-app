<template>
  <v-card
    :class="[
      'document-upload-area',
      { 'document-upload-area--drag-over': dragOver }
    ]"
    variant="outlined"
    height="200"
    @drop="handleDrop"
    @dragover.prevent="dragOver = true"
    @dragleave.prevent="dragOver = false"
    @click="triggerFileInput"
  >
    <v-card-text class="d-flex flex-column align-center justify-center text-center pa-6">
      <v-icon
        size="48"
        :color="hasDocument ? 'success' : 'grey'"
        class="mb-4"
      >
        {{ hasDocument ? 'mdi-check-circle' : 'mdi-file-document' }}
      </v-icon>
      
      <h4 class="text-h6 font-weight-medium mb-2">{{ title }}</h4>
      <p class="text-body-2 text-grey-darken-1 mb-4">{{ description }}</p>
      
      <div v-if="hasDocument" class="d-flex align-center">
        <v-chip color="success" variant="outlined" class="mr-2">
          <v-icon start>mdi-check-circle</v-icon>
          {{ getDocumentName() }}
        </v-chip>
        <v-btn
          size="small"
          color="red"
          variant="outlined"
          icon
          @click.stop="$emit('remove', type)"
        >
          <v-icon>mdi-close</v-icon>
        </v-btn>
      </div>
      
      <div v-else>
        <v-icon class="mb-2">mdi-upload</v-icon>
        <p class="text-body-2 mb-2">
          ファイルをドラッグ&ドロップまたは
        </p>
        <v-btn color="primary" variant="outlined">
          ファイルを選択
        </v-btn>
      </div>
    </v-card-text>

    <input
      ref="fileInput"
      type="file"
      accept=".txt,.pdf,.doc,.docx"
      style="display: none"
      @change="handleFileSelect"
    />
  </v-card>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { CandidateDocuments } from '../types';

interface Props {
  type: string;
  title: string;
  description: string;
  documents: CandidateDocuments;
}

const props = defineProps<Props>();

const emit = defineEmits<{
  'upload': [file: File, type: string];
  'remove': [type: string, index?: number];
}>();

const dragOver = ref(false);
const fileInput = ref<HTMLInputElement>();

const hasDocument = computed(() => {
  if (props.type === 'other') {
    return props.documents.others && props.documents.others.length > 0;
  }
  return !!props.documents[props.type as keyof CandidateDocuments];
});

const getDocumentName = () => {
  if (props.type === 'other') {
    return props.documents.others?.[0]?.name || '';
  }
  const doc = props.documents[props.type as keyof CandidateDocuments];
  return Array.isArray(doc) ? doc[0]?.name : (doc as any)?.name || '';
};

const triggerFileInput = () => {
  if (!hasDocument.value) {
    fileInput.value?.click();
  }
};

const handleFileSelect = (event: Event) => {
  const target = event.target as HTMLInputElement;
  const file = target.files?.[0];
  if (file) {
    emit('upload', file, props.type);
  }
};

const handleDrop = (event: DragEvent) => {
  event.preventDefault();
  dragOver.value = false;
  
  const file = event.dataTransfer?.files[0];
  if (file) {
    emit('upload', file, props.type);
  }
};
</script>

<style scoped>
.document-upload-area {
  cursor: pointer;
  transition: all 0.3s ease;
}

.document-upload-area:hover {
  border-color: rgb(var(--v-theme-primary));
}

.document-upload-area--drag-over {
  border-color: rgb(var(--v-theme-primary));
  background-color: rgba(var(--v-theme-primary), 0.1);
}
</style>