<template>
  <div>
    <div class="text-center mb-6">
      <h3 class="text-h5 font-weight-medium text-grey-darken-2 mb-2">基本情報</h3>
      <p class="text-body-2 text-grey-darken-1">候補者の基本的な情報を入力してください</p>
    </div>

    <v-row>
      <v-col cols="12" md="6">
        <v-text-field
          v-model="localFormData.name"
          label="氏名"
          placeholder="山田 太郎"
          variant="outlined"
          density="comfortable"
          :error-messages="validationErrors.name"
          required
          @input="updateFormData"
        >
          <template #prepend-inner>
            <v-icon>mdi-account</v-icon>
          </template>
        </v-text-field>
      </v-col>
      
      <v-col cols="12" md="6">
        <v-text-field
          v-model="localFormData.age"
          label="年齢"
          placeholder="25"
          type="number"
          min="18"
          max="70"
          variant="outlined"
          density="comfortable"
          :error-messages="validationErrors.age"
          required
          @input="updateFormData"
        >
          <template #prepend-inner>
            <v-icon>mdi-calendar</v-icon>
          </template>
        </v-text-field>
      </v-col>

      <v-col cols="12" md="6">
        <v-text-field
          v-model="localFormData.email"
          label="メールアドレス"
          placeholder="yamada@example.com（任意）"
          type="email"
          variant="outlined"
          density="comfortable"
          :error-messages="validationErrors.email"
          @input="updateFormData"
        >
          <template #prepend-inner>
            <v-icon>mdi-email</v-icon>
          </template>
          <template #append-inner>
            <v-tooltip text="メールアドレスは任意です。面接連絡等で使用します。">
              <template #activator="{ props }">
                <v-icon v-bind="props" size="small">mdi-help-circle</v-icon>
              </template>
            </v-tooltip>
          </template>
        </v-text-field>
      </v-col>
      
      <v-col cols="12" md="6">
        <v-text-field
          v-model="localFormData.phone"
          label="電話番号"
          placeholder="090-1234-5678（任意）"
          type="tel"
          variant="outlined"
          density="comfortable"
          @input="updateFormData"
        >
          <template #prepend-inner>
            <v-icon>mdi-phone</v-icon>
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