<template>
  <v-card class="pa-8" elevation="4">
    <!-- ヘッダー -->
    <div class="d-flex justify-space-between align-start mb-8">
      <div class="flex-grow-1">
        <h2 class="text-h4 font-weight-bold text-grey-darken-3 mb-2">
          候補者情報入力
        </h2>
        <p class="text-body-1 text-grey-darken-1">
          評価を開始するために候補者の情報を入力してください
        </p>
      </div>
      
      <div class="d-flex align-center ml-6">
        <!-- 進捗表示 -->
        <div class="text-right mr-4">
          <div class="text-caption text-grey-darken-1 mb-1">入力進捗</div>
          <div class="d-flex align-center">
            <v-progress-linear
              :model-value="completionPercentage"
              color="primary"
              height="8"
              rounded
              class="mr-2"
              style="width: 100px;"
            />
            <span class="text-body-2 font-weight-medium text-primary">
              {{ completionPercentage }}%
            </span>
          </div>
        </div>
        
        <!-- 自動保存設定 -->
        <v-switch
          v-model="autoSaveEnabled"
          label="自動保存"
          color="primary"
          density="compact"
          hide-details
          class="mr-4"
        />
        
        <!-- 手動保存ボタン -->
        <v-btn
          :disabled="!formData.name"
          :loading="saveStatus === 'saving'"
          color="grey-darken-2"
          @click="handleAutoSave"
        >
          <v-icon start>
            {{ saveStatus === 'saved' ? 'mdi-check-circle' : 'mdi-content-save' }}
          </v-icon>
          {{ saveStatus === 'saving' ? '保存中...' : saveStatus === 'saved' ? '保存済み' : '手動保存' }}
        </v-btn>
      </div>
    </div>

    <!-- ステップインジケーター -->
    <v-stepper
      v-model="currentStep"
      :items="stepItems"
      hide-actions
      class="elevation-0 mb-8"
    >
      <template #item.icon="{ item, step }">
        <v-avatar
          :color="getStepColor(step)"
          size="40"
        >
          <v-icon
            :color="getStepIconColor(step)"
            size="20"
          >
            {{ item.raw.icon }}
          </v-icon>
        </v-avatar>
      </template>
    </v-stepper>

    <!-- フォーム -->
    <v-form @submit.prevent="handleSubmit">
      <!-- ステップコンテンツ -->
      <div style="min-height: 400px;">
        <component
          :is="getCurrentStepComponent()"
          v-model:form-data="formData"
          v-model:documents="documents"
          v-model:spi-results="spiResults"
          v-model:interview-phase="interviewPhase"
          :validation-errors="validationErrors"
          :job-type="jobType"
          :early-analysis-available="earlyAnalysisAvailable"
          @extracted-data-change="handleExtractedDataChange"
        />
      </div>

      <!-- ナビゲーションボタン -->
      <div class="d-flex justify-space-between align-center mt-8 pt-6" style="border-top: 1px solid #e0e0e0;">
        <v-btn
          :disabled="currentStep === 1"
          variant="outlined"
          @click="currentStep = Math.max(1, currentStep - 1)"
        >
          前へ
        </v-btn>

        <div class="d-flex">
          <v-btn
            v-if="currentStep < totalSteps"
            :disabled="!canProceedToNextStep(currentStep)"
            color="primary"
            @click="currentStep = currentStep + 1"
          >
            次へ
          </v-btn>
          <v-btn
            v-else
            type="submit"
            color="success"
            size="large"
          >
            評価を開始
          </v-btn>
        </div>
      </div>
    </v-form>
  </v-card>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue';
import { Candidate, JobType, SavedDraft, SPIResults, InterviewPhase, CandidateDocuments, ExtractedDocumentData } from '../types';
import { saveDraft } from '../utils/storage';

// Step components
import DocumentUploadStep from './steps/DocumentUploadStep.vue';
import BasicInfoStep from './steps/BasicInfoStep.vue';
import EducationStep from './steps/EducationStep.vue';
import ExperienceStep from './steps/ExperienceStep.vue';
import SPIStep from './steps/SPIStep.vue';
import InterviewInfoStep from './steps/InterviewInfoStep.vue';
import ChatGPTAnalysisStep from './steps/ChatGPTAnalysisStep.vue';

interface Props {
  jobType: JobType;
  initialData?: Partial<Candidate>;
}

const props = defineProps<Props>();

const emit = defineEmits<{
  'candidate-submit': [candidate: Omit<Candidate, 'id' | 'createdAt' | 'updatedAt'>];
}>();

// Reactive state
const formData = ref({
  name: props.initialData?.name || '',
  email: props.initialData?.email || '',
  phone: props.initialData?.phone || '',
  age: props.initialData?.age?.toString() || '',
  education: props.initialData?.education || '',
  major: props.initialData?.major || '',
  experience: props.initialData?.experience || '',
  selfPr: props.initialData?.selfPr || '',
  interviewNotes: props.initialData?.interviewNotes || '',
});

const documents = ref<CandidateDocuments>(props.initialData?.documents || {});
const spiResults = ref<SPIResults | undefined>(props.initialData?.spiResults);
const interviewPhase = ref<InterviewPhase>({
  currentPhase: 'casual_interview',
  status: 'scheduled',
  notes: '',
  result: 'pending'
});

const currentStep = ref(1);
const totalSteps = 7;
const saveStatus = ref<'idle' | 'saving' | 'saved'>('idle');
const autoSaveEnabled = ref(true);
const validationErrors = ref<Record<string, string>>({});

// Computed
const completionPercentage = computed(() => {
  const requiredFields = ['name', 'age', 'education', 'experience', 'selfPr'];
  const completedFields = requiredFields.filter(field => {
    const value = formData.value[field as keyof typeof formData.value];
    return value && value.toString().trim() !== '';
  });
  
  let percentage = (completedFields.length / requiredFields.length) * 40;
  if (Object.keys(documents.value).length > 0) percentage += 20;
  if (spiResults.value) percentage += 20;
  if (interviewPhase.value.notes) percentage += 10;
  if (earlyAnalysisAvailable.value) percentage += 10;
  
  return Math.round(percentage);
});

const earlyAnalysisAvailable = computed(() => {
  const hasBasicInfo = formData.value.name && formData.value.education && formData.value.experience && formData.value.selfPr;
  const hasDocuments = Object.values(documents.value).some(Boolean);
  return !!(hasBasicInfo || hasDocuments);
});

const stepItems = [
  { title: '書類', value: 1, icon: 'mdi-upload' },
  { title: '基本情報', value: 2, icon: 'mdi-account' },
  { title: '学歴情報', value: 3, icon: 'mdi-school' },
  { title: '経験・PR', value: 4, icon: 'mdi-briefcase' },
  { title: 'SPI検査', value: 5, icon: 'mdi-brain' },
  { title: '面接情報', value: 6, icon: 'mdi-clock' },
  { title: 'AI分析', value: 7, icon: 'mdi-robot' }
];

// Methods
const getCurrentStepComponent = () => {
  const components = [
    null, // step 0 (not used)
    DocumentUploadStep,
    BasicInfoStep,
    EducationStep,
    ExperienceStep,
    SPIStep,
    InterviewInfoStep,
    ChatGPTAnalysisStep
  ];
  return components[currentStep.value];
};

const getStepColor = (step: number) => {
  if (step === currentStep.value) return 'primary';
  if (canProceedToNextStep(step - 1) || step === 1) return 'success';
  return 'grey-lighten-2';
};

const getStepIconColor = (step: number) => {
  if (step === currentStep.value) return 'white';
  if (canProceedToNextStep(step - 1) || step === 1) return 'white';
  return 'grey-darken-1';
};

const canProceedToNextStep = (step: number) => {
  switch (step) {
    case 1:
      return true;
    case 2:
      return formData.value.name && formData.value.age;
    case 3:
      return formData.value.education;
    case 4:
      return formData.value.experience && formData.value.selfPr;
    case 5:
      return true;
    case 6:
      return true;
    case 7:
      return true;
    default:
      return false;
  }
};

const validateForm = () => {
  const errors: Record<string, string> = {};
  
  if (!formData.value.name.trim()) errors.name = '氏名は必須です';
  if (formData.value.email && !/\S+@\S+\.\S+/.test(formData.value.email)) {
    errors.email = '有効なメールアドレスを入力してください';
  }
  if (!formData.value.age || parseInt(formData.value.age) < 18 || parseInt(formData.value.age) > 70) {
    errors.age = '18歳から70歳の間で入力してください';
  }
  if (!formData.value.education.trim()) errors.education = '最終学歴は必須です';
  if (!formData.value.experience.trim()) errors.experience = '職歴・経験は必須です';
  if (!formData.value.selfPr.trim()) errors.selfPr = '自己PRは必須です';

  validationErrors.value = errors;
  return Object.keys(errors).length === 0;
};

const handleSubmit = () => {
  if (!validateForm()) {
    if (validationErrors.value.name || validationErrors.value.email || validationErrors.value.phone || validationErrors.value.age) {
      currentStep.value = 2;
    } else if (validationErrors.value.education || validationErrors.value.major) {
      currentStep.value = 3;
    } else {
      currentStep.value = 4;
    }
    return;
  }

  const candidate: Omit<Candidate, 'id' | 'createdAt' | 'updatedAt'> = {
    name: formData.value.name,
    email: formData.value.email || '',
    phone: formData.value.phone,
    age: parseInt(formData.value.age),
    education: formData.value.education,
    major: formData.value.major,
    experience: formData.value.experience,
    selfPr: formData.value.selfPr,
    interviewNotes: formData.value.interviewNotes,
    appliedPosition: props.jobType,
    spiResults: spiResults.value,
    interviewPhase: interviewPhase.value,
    documents: documents.value,
  };
  
  emit('candidate-submit', candidate);
};

const handleAutoSave = () => {
  if (!formData.value.name) return;

  saveStatus.value = 'saving';
  
  const draft: SavedDraft = {
    id: `candidate_${props.jobType}_${Date.now()}`,
    candidateData: {
      name: formData.value.name,
      email: formData.value.email || '',
      phone: formData.value.phone,
      age: formData.value.age ? parseInt(formData.value.age) : undefined,
      education: formData.value.education,
      major: formData.value.major,
      experience: formData.value.experience,
      selfPr: formData.value.selfPr,
      interviewNotes: formData.value.interviewNotes,
      appliedPosition: props.jobType,
      spiResults: spiResults.value,
      interviewPhase: interviewPhase.value,
      documents: documents.value,
    },
    jobType: props.jobType,
    stage: 'candidate_input',
    savedAt: new Date(),
    title: formData.value.name || '無題の候補者',
  };

  saveDraft(draft);
  saveStatus.value = 'saved';
  
  setTimeout(() => saveStatus.value = 'idle', 2000);
};

const handleExtractedDataChange = (extractedData: ExtractedDocumentData) => {
  if (extractedData.personalInfo) {
    const info = extractedData.personalInfo;
    if (info.name && !formData.value.name) formData.value.name = info.name;
    if (info.age && !formData.value.age) formData.value.age = info.age.toString();
    if (info.education && !formData.value.education) formData.value.education = info.education;
    if (info.major && !formData.value.major) formData.value.major = info.major;
    if (info.contact?.email && !formData.value.email) formData.value.email = info.contact.email;
    if (info.contact?.phone && !formData.value.phone) formData.value.phone = info.contact.phone;
  }

  if (extractedData.workExperience && extractedData.workExperience.length > 0 && !formData.value.experience) {
    const experienceText = extractedData.workExperience.map(exp => 
      `${exp.company} - ${exp.position} (${exp.period.start}〜${exp.period.end})\n` +
      `業務内容: ${exp.responsibilities.join(', ')}\n` +
      `実績: ${exp.achievements.join(', ')}`
    ).join('\n\n');
    formData.value.experience = experienceText;
  }

  if (extractedData.selfPr && !formData.value.selfPr) {
    formData.value.selfPr = extractedData.selfPr;
  }
};

// Auto-save watcher
watch(
  [formData, spiResults, interviewPhase, documents],
  () => {
    if (!autoSaveEnabled.value || !formData.value.name) return;
    
    const timer = setTimeout(() => {
      handleAutoSave();
    }, 2000);
    
    return () => clearTimeout(timer);
  },
  { deep: true }
);
</script>