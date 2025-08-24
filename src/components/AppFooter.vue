<template>
  <v-footer
    color="grey-darken-4"
    class="text-white pa-8"
  >
    <v-container>
      <v-row>
        <v-col cols="12" md="4">
          <div class="d-flex align-center mb-4">
            <v-icon class="mr-2" size="24">mdi-account-group</v-icon>
            <h3 class="text-h6 font-weight-bold">採用マッチング判定システム</h3>
          </div>
          <p class="text-body-2 text-grey-lighten-1">
            AI支援による科学的人材評価プラットフォーム。
            データドリブンな採用判定で、最適な人材の発見をサポートします。
          </p>
        </v-col>
        
        <v-col cols="12" md="4">
          <h4 class="text-subtitle-1 font-weight-medium mb-4">主な機能</h4>
          <v-list density="compact" class="bg-transparent">
            <v-list-item
              v-for="feature in features"
              :key="feature.name"
              class="pa-0 mb-1"
            >
              <template #prepend>
                <v-icon size="12" class="mr-2">mdi-circle-small</v-icon>
              </template>
              <v-list-item-title class="text-body-2 text-grey-lighten-1">
                {{ feature.name }}
              </v-list-item-title>
            </v-list-item>
          </v-list>
        </v-col>
        
        <v-col cols="12" md="4">
          <h4 class="text-subtitle-1 font-weight-medium mb-4">現在のユーザー</h4>
          <v-card color="grey-darken-3" class="pa-4">
            <p class="text-body-1 font-weight-medium mb-1">{{ currentUser.name }}</p>
            <p class="text-body-2 text-grey-lighten-1 mb-1">
              {{ getRoleDisplayName(currentUser.role) }}
            </p>
            <p class="text-caption text-grey-lighten-2">{{ currentUser.department }}</p>
          </v-card>
        </v-col>
      </v-row>
      
      <v-divider class="my-6" color="grey-darken-2" />
      
      <v-row align="center">
        <v-col>
          <p class="text-caption text-grey-lighten-2 ma-0">
            © 2025 採用マッチング判定システム. All rights reserved.
          </p>
        </v-col>
        <v-col cols="auto">
          <p class="text-caption text-grey ma-0">
            機密情報の取り扱いにご注意ください
          </p>
        </v-col>
      </v-row>
    </v-container>
  </v-footer>
</template>

<script setup lang="ts">
import { User } from '../types';

interface Props {
  currentUser: User;
}

const props = defineProps<Props>();

const features = [
  { name: '職種別評価システム' },
  { name: 'ChatGPT AI分析' },
  { name: 'SPI適性検査連携' },
  { name: '面接プロセス管理' },
  { name: '採用データ分析' },
  { name: '求人票管理' }
];

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