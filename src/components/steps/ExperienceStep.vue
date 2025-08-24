<template>
  <div>
    <div class="text-center mb-6">
      <h3 class="text-h5 font-weight-medium text-grey-darken-2 mb-2">経験・PR情報</h3>
      <p class="text-body-2 text-grey-darken-1">候補者の経験や強みを詳しく入力してください</p>
    </div>

    <v-row>
      <v-col cols="12">
        <v-textarea
          v-model="localFormData.experience"
          label="職歴・経験"
          :placeholder="getExperiencePlaceholder()"
          variant="outlined"
          rows="5"
          :error-messages="validationErrors.experience"
          required
          @input="updateFormData"
        >
          <template #append-inner>
            <v-tooltip text="具体的な数字や成果があれば併せて記載してください">
              <template #activator="{ props }">
                <v-icon v-bind="props" size="small">mdi-help-circle</v-icon>
              </template>
            </v-tooltip>
          </template>
        </v-textarea>
      </v-col>

      <v-col cols="12">
        <v-textarea
          v-model="localFormData.selfPr"
          label="自己PR"
          placeholder="強み、特技、志望動機、今後の目標など"
          variant="outlined"
          rows="5"
          :error-messages="validationErrors.selfPr"
          required
          @input="updateFormData"
        />
      </v-col>

      <v-col cols="12">
        <v-textarea
          v-model="localFormData.interviewNotes"
          label="面接メモ"
          placeholder="面接での印象、回答内容、気になった点など"
          variant="outlined"
          rows="4"
          @input="updateFormData"
        >
          <template #append-inner>
            <v-tooltip text="面接後に追記することも可能です">
              <template #activator="{ props }">
                <v-icon v-bind="props" size="small">mdi-help-circle</v-icon>
              </template>
            </v-tooltip>
          </template>
        </v-textarea>
      </v-col>
    </v-row>

    <!-- 早期分析可能通知 -->
    <v-alert
      v-if="earlyAnalysisAvailable"
      type="success"
      variant="tonal"
      class="mt-4"
    >
      <template #prepend>
        <v-icon>mdi-lightbulb</v-icon>
      </template>
      <div>
        <div class="font-weight-medium">ChatGPT早期分析が利用可能です</div>
        <div class="text-body-2">
          基本情報が入力されたため、ChatGPTによる初期分析と面接質問の生成が可能になりました。
          次のステップで詳細な分析を確認できます。
        </div>
      </div>
    </v-alert>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue';
import { JobType } from '../../types';

interface Props {
  formData: Record<string, string>;
  validationErrors: Record<string, string>;
  jobType: JobType;
  earlyAnalysisAvailable: boolean;
}

const props = defineProps<Props>();

const emit = defineEmits<{
  'update:formData': [formData: Record<string, string>];
}>();

const localFormData = ref({ ...props.formData });

const updateFormData = () => {
  emit('update:formData', { ...localFormData.value });
};

const getExperiencePlaceholder = () => {
  return props.jobType === 'fresh_sales'
    ? 'アルバイト経験、インターンシップ、学生時代の活動など詳しく記載してください'
    : '前職での業務内容、担当領域、実績など詳しく記載してください';
};

watch(() => props.formData, (newData) => {
  localFormData.value = { ...newData };
}, { deep: true });
</script>