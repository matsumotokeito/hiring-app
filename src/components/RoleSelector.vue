<template>
  <v-container fluid class="fill-height">
    <v-row justify="center" align="center" class="fill-height">
      <v-col cols="12" md="10" lg="8">
        <v-card class="pa-8 elevation-12" rounded="xl">
          <!-- ヘッダー -->
          <div class="text-center mb-12">
            <v-avatar size="80" class="mb-6" color="primary">
              <v-icon size="40" color="white">mdi-account-group</v-icon>
            </v-avatar>
            <h1 class="text-h3 font-weight-bold text-grey-darken-3 mb-4">
              採用マッチング判定システム
            </h1>
            <p class="text-h6 text-grey-darken-1">
              AI支援による科学的人材評価プラットフォーム
            </p>
            <v-row justify="center" class="mt-4">
              <v-col cols="auto">
                <v-chip color="warning" variant="outlined" size="small">
                  <v-icon start>mdi-star</v-icon>
                  AI評価機能
                </v-chip>
              </v-col>
              <v-col cols="auto">
                <v-chip color="info" variant="outlined" size="small">
                  <v-icon start>mdi-flash</v-icon>
                  面接管理
                </v-chip>
              </v-col>
              <v-col cols="auto">
                <v-chip color="success" variant="outlined" size="small">
                  <v-icon start>mdi-trophy</v-icon>
                  科学的判定
                </v-chip>
              </v-col>
            </v-row>
          </div>

          <!-- 役割選択 -->
          <v-row>
            <v-col
              v-for="role in roles"
              :key="role.id"
              cols="12"
              md="4"
            >
              <v-card
                :class="[
                  'role-card',
                  { 'role-card--selected': selectedRole === role.id }
                ]"
                :color="selectedRole === role.id ? role.color : undefined"
                :variant="selectedRole === role.id ? 'flat' : 'outlined'"
                height="400"
                @click="selectedRole = role.id"
                hover
              >
                <v-card-text class="pa-6">
                  <div class="d-flex align-center mb-4">
                    <v-avatar
                      :color="selectedRole === role.id ? 'white' : role.color"
                      size="56"
                      class="mr-4"
                    >
                      <v-icon
                        :color="selectedRole === role.id ? role.color : 'white'"
                        size="28"
                      >
                        {{ role.icon }}
                      </v-icon>
                    </v-avatar>
                    <div>
                      <h3 class="text-h6 font-weight-bold">
                        {{ role.name }}
                      </h3>
                    </div>
                    <v-spacer />
                    <v-icon
                      v-if="selectedRole === role.id"
                      color="white"
                      size="24"
                    >
                      mdi-check-circle
                    </v-icon>
                  </div>
                  
                  <p class="text-body-2 mb-6">
                    {{ role.description }}
                  </p>
                  
                  <div>
                    <p class="text-caption font-weight-medium mb-2">
                      主な権限:
                    </p>
                    <div class="permission-list">
                      <div
                        v-for="(permission, index) in role.permissions.slice(0, 4)"
                        :key="index"
                        class="d-flex align-start mb-1"
                      >
                        <v-icon
                          size="12"
                          :color="selectedRole === role.id ? 'white' : role.color"
                          class="mr-2 mt-1"
                        >
                          mdi-circle-small
                        </v-icon>
                        <span class="text-caption">{{ permission }}</span>
                      </div>
                      <p
                        v-if="role.permissions.length > 4"
                        class="text-caption"
                      >
                        他 {{ role.permissions.length - 4 }} 項目...
                      </p>
                    </div>
                  </div>
                </v-card-text>
              </v-card>
            </v-col>
          </v-row>

          <!-- ユーザー情報入力 -->
          <v-card
            v-if="selectedRole"
            class="mt-8 pa-6"
            color="grey-lighten-4"
            variant="flat"
          >
            <h4 class="text-h6 font-weight-bold mb-6">ユーザー情報を入力</h4>
            <v-row align="center">
              <v-col cols="12" md="8">
                <v-text-field
                  v-model="userName"
                  label="お名前"
                  placeholder="山田 太郎"
                  variant="outlined"
                  density="comfortable"
                  hide-details
                />
              </v-col>
              <v-col cols="12" md="4">
                <v-btn
                  :disabled="!userName.trim()"
                  color="primary"
                  size="large"
                  block
                  @click="handleLogin"
                >
                  ログイン
                </v-btn>
              </v-col>
            </v-row>
          </v-card>

          <!-- フッター -->
          <div class="text-center mt-12 pt-8">
            <p class="text-caption text-grey-darken-1 mb-2">
              © 2025 採用マッチング判定システム - 機密情報の取り扱いにご注意ください
            </p>
            <div class="d-flex justify-center align-center">
              <span class="text-caption text-grey">セキュア認証</span>
              <v-icon size="12" class="mx-2">mdi-circle-small</v-icon>
              <span class="text-caption text-grey">データ暗号化</span>
              <v-icon size="12" class="mx-2">mdi-circle-small</v-icon>
              <span class="text-caption text-grey">プライバシー保護</span>
            </div>
          </div>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { User, UserRole } from '../types';

const emit = defineEmits<{
  'role-select': [user: User];
}>();

const selectedRole = ref<UserRole | null>(null);
const userName = ref('');

const roles = [
  {
    id: 'recruiter' as UserRole,
    name: '採用担当者',
    description: '候補者の評価・面接・採用判定を行う',
    icon: 'mdi-account-check',
    color: 'blue',
    permissions: [
      '候補者情報の入力・編集',
      '評価の実施・保存',
      '採用判定の実行',
      '面接スケジュール管理',
      'ChatGPT AI予測の参照',
      '個別レポートの出力'
    ]
  },
  {
    id: 'hr_strategy' as UserRole,
    name: '人事戦略運用担当者',
    description: '採用戦略の分析・改善・求人票管理を行う',
    icon: 'mdi-chart-bar',
    color: 'purple',
    permissions: [
      '全体データの分析・閲覧',
      '採用メトリクスの監視',
      '求人票の管理・編集',
      '会社情報の管理・設定',
      '面接プロセス設計',
      '戦略レポートの作成',
      'システム設定の変更'
    ]
  },
  {
    id: 'admin' as UserRole,
    name: 'システム管理者',
    description: 'システム全体の管理・設定を行う',
    icon: 'mdi-shield-account',
    color: 'red',
    permissions: [
      'ユーザー管理',
      'システム設定',
      'データバックアップ',
      'セキュリティ管理',
      '全機能へのアクセス'
    ]
  }
];

const handleLogin = () => {
  if (!selectedRole.value || !userName.value.trim()) return;

  const user: User = {
    id: Date.now().toString(),
    name: userName.value,
    email: `${userName.value.toLowerCase()}@company.com`,
    role: selectedRole.value,
    department: selectedRole.value === 'recruiter' ? '人事部採用課' : '人事部戦略企画課',
    permissions: getPermissionsForRole(selectedRole.value)
  };

  emit('role-select', user);
};

const getPermissionsForRole = (role: UserRole) => {
  switch (role) {
    case 'recruiter':
      return [
        { action: 'view' as const, resource: 'candidates' as const },
        { action: 'create' as const, resource: 'candidates' as const },
        { action: 'edit' as const, resource: 'candidates' as const },
        { action: 'view' as const, resource: 'evaluations' as const },
        { action: 'create' as const, resource: 'evaluations' as const },
        { action: 'edit' as const, resource: 'evaluations' as const },
        { action: 'export' as const, resource: 'reports' as const },
        { action: 'view' as const, resource: 'job_postings' as const },
        { action: 'view' as const, resource: 'interviews' as const },
        { action: 'create' as const, resource: 'interviews' as const },
        { action: 'edit' as const, resource: 'interviews' as const }
      ];
    case 'hr_strategy':
      return [
        { action: 'view' as const, resource: 'candidates' as const },
        { action: 'view' as const, resource: 'evaluations' as const },
        { action: 'view_analytics' as const, resource: 'reports' as const },
        { action: 'export' as const, resource: 'reports' as const },
        { action: 'view' as const, resource: 'job_postings' as const },
        { action: 'create' as const, resource: 'job_postings' as const },
        { action: 'edit' as const, resource: 'job_postings' as const },
        { action: 'delete' as const, resource: 'job_postings' as const },
        { action: 'view' as const, resource: 'company_info' as const },
        { action: 'edit' as const, resource: 'company_info' as const },
        { action: 'view' as const, resource: 'interviews' as const },
        { action: 'view_analytics' as const, resource: 'interviews' as const }
      ];
    case 'admin':
      return [
        { action: 'view' as const, resource: 'candidates' as const },
        { action: 'create' as const, resource: 'candidates' as const },
        { action: 'edit' as const, resource: 'candidates' as const },
        { action: 'delete' as const, resource: 'candidates' as const },
        { action: 'view' as const, resource: 'evaluations' as const },
        { action: 'create' as const, resource: 'evaluations' as const },
        { action: 'edit' as const, resource: 'evaluations' as const },
        { action: 'delete' as const, resource: 'evaluations' as const },
        { action: 'view_analytics' as const, resource: 'reports' as const },
        { action: 'export' as const, resource: 'reports' as const },
        { action: 'view' as const, resource: 'job_postings' as const },
        { action: 'create' as const, resource: 'job_postings' as const },
        { action: 'edit' as const, resource: 'job_postings' as const },
        { action: 'delete' as const, resource: 'job_postings' as const },
        { action: 'view' as const, resource: 'company_info' as const },
        { action: 'edit' as const, resource: 'company_info' as const },
        { action: 'view' as const, resource: 'interviews' as const },
        { action: 'create' as const, resource: 'interviews' as const },
        { action: 'edit' as const, resource: 'interviews' as const },
        { action: 'delete' as const, resource: 'interviews' as const }
      ];
    default:
      return [];
  }
};
</script>

<style scoped>
.role-card {
  cursor: pointer;
  transition: all 0.3s ease;
}

.role-card:hover {
  transform: translateY(-4px);
}

.role-card--selected {
  transform: translateY(-4px) scale(1.02);
}

.permission-list {
  max-height: 120px;
  overflow-y: auto;
}
</style>