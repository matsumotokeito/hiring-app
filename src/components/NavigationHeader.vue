<template>
  <v-app-bar
    color="primary"
    dark
    elevation="4"
    height="80"
  >
    <v-container fluid>
      <v-row align="center" no-gutters>
        <v-col cols="auto">
          <div class="d-flex align-center">
            <v-avatar
              color="white"
              size="48"
              class="mr-4"
            >
              <v-icon color="primary" size="32">mdi-account-group</v-icon>
            </v-avatar>
            <div>
              <h1 class="text-h5 font-weight-bold">
                採用マッチング判定システム
              </h1>
              <p class="text-caption text-blue-lighten-2 ma-0">
                AI支援による科学的人材評価プラットフォーム
              </p>
            </div>
          </div>
        </v-col>

        <v-spacer />

        <v-col cols="auto">
          <div class="d-flex align-center">
            <!-- ユーザー情報 -->
            <div v-if="user" class="text-right mr-4">
              <p class="text-body-2 font-weight-medium ma-0">
                {{ user.name }}
              </p>
              <p class="text-caption text-blue-lighten-2 ma-0">
                {{ getRoleDisplayName(user.role) }} | {{ user.department }}
              </p>
            </div>

            <!-- ナビゲーションボタン -->
            <div class="d-flex align-center">
              <v-btn
                v-if="canGoBack"
                variant="outlined"
                color="white"
                class="mr-2"
                @click="$emit('navigate-back')"
              >
                <v-icon start>mdi-arrow-left</v-icon>
                戻る
              </v-btn>
              
              <v-btn
                v-if="canGoHome"
                color="white"
                class="mr-2"
                @click="$emit('navigate-home')"
              >
                <v-icon start>mdi-home</v-icon>
                ホーム
              </v-btn>

              <v-btn
                v-if="user"
                color="red-darken-1"
                @click="$emit('logout')"
              >
                <v-icon start>mdi-logout</v-icon>
                ログアウト
              </v-btn>
            </div>
          </div>
        </v-col>
      </v-row>

      <!-- ページタイトル -->
      <v-row v-if="currentState !== 'job_selection'" class="mt-4">
        <v-col>
          <div class="d-flex justify-space-between align-center">
            <h2 class="text-h6 font-weight-medium">
              {{ getPageTitle() }}
            </h2>
            <div class="text-caption text-blue-lighten-2">
              {{ new Date().toLocaleDateString('ja-JP', { 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric',
                weekday: 'long'
              }) }}
            </div>
          </div>
        </v-col>
      </v-row>
    </v-container>
  </v-app-bar>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { User } from '../types';

type AppState = 'job_selection' | 'candidate_input' | 'evaluation' | 'result' | 'database' | 'analytics' | 'monthly_dashboard' | 'job_posting_management' | 'company_info_management' | 'interview_management';

interface Props {
  currentState: AppState;
  candidateName?: string;
  user?: User;
}

const props = defineProps<Props>();

const emit = defineEmits<{
  'navigate-home': [];
  'navigate-back': [];
  'logout': [];
}>();

const canGoBack = computed(() => props.currentState !== 'job_selection');
const canGoHome = computed(() => props.currentState !== 'job_selection');

const getPageTitle = () => {
  switch (props.currentState) {
    case 'job_selection':
      return 'ホーム';
    case 'candidate_input':
      return '候補者情報入力';
    case 'evaluation':
      return `評価入力${props.candidateName ? ` - ${props.candidateName}` : ''}`;
    case 'result':
      return `評価結果${props.candidateName ? ` - ${props.candidateName}` : ''}`;
    case 'database':
      return '候補者データベース';
    case 'analytics':
      return '分析ダッシュボード';
    case 'monthly_dashboard':
      return '月別ダッシュボード';
    case 'job_posting_management':
      return '求人票管理';
    case 'company_info_management':
      return '会社情報管理';
    case 'interview_management':
      return '面接管理';
    default:
      return '';
  }
};

const getRoleDisplayName = (role: string) => {
  switch (role) {
    case 'recruiter':
      return '採用担当者';
    case 'hr_strategy':
      return '人事戦略運用担当者';
    case 'admin':
      return 'システム管理者';
    default: 
      return role;
  }
};
</script>