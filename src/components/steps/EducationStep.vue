<template>
  <div>
    <div class="text-center mb-6">
      <h3 class="text-h5 font-weight-medium text-grey-darken-2 mb-2">学歴情報</h3>
      <p class="text-body-2 text-grey-darken-1">候補者の学歴・教育背景を入力してください</p>
    </div>

    <v-row>
      <v-col cols="12" md="6">
        <v-text-field
          v-model="localFormData.education"
          label="最終学歴"
          placeholder="○○大学 経済学部"
          variant="outlined"
          density="comfortable"
          :error-messages="validationErrors.education"
          required
          @input="updateFormData"
        >
          <template #prepend-inner>
            <v-icon>mdi-school</v-icon>
          </template>
        </v-text-field>
      </v-col>
      
      <v-col cols="12" md="6">
        <v-text-field
          v-model="localFormData.major"
          label="専攻分野"
          placeholder="経営学専攻"
          variant="outlined"
          density="comfortable"
          @input="updateFormData"
        >
          <template #prepend-inner>
            <v-icon>mdi-book-open</v-icon>
          </template>
        </v-text-field>
      </v-col>
    </v-row>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue';

interface Props {
  formData: Record<string, string>;
  validationErrors: Record<string, string>;
}

const props = defineProps<Props>();

const emit = defineEmits<{
  'update:formData': [formData: Record<string, string>];
}>();

const localFormData = ref({ ...props.formData });

const updateFormData = () => {
  emit('update:formData', { ...localFormData.value });
};

watch(() => props.formData, (newData) => {
  localFormData.value = { ...newData };
}, { deep: true });
</script>