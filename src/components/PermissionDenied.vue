<template>
  <v-card class="text-center pa-8" variant="outlined">
    <v-avatar size="80" color="red-lighten-4" class="mb-4">
      <v-icon size="48" color="red">mdi-lock</v-icon>
    </v-avatar>
    
    <h3 class="text-h5 font-weight-medium text-grey-darken-2 mb-2">
      アクセス権限がありません
    </h3>
    
    <p class="text-body-1 text-grey-darken-1 mb-6">
      この機能を利用するための権限がありません。システム管理者にお問い合わせください。
    </p>
    
    <v-btn
      color="primary"
      size="large"
      @click="$emit('navigate-home')"
    >
      ホームに戻る
    </v-btn>
  </v-card>
</template>

<script setup lang="ts">
const emit = defineEmits<{
  'navigate-home': [];
}>();
</script>