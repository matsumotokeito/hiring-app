<template>
  <v-dialog
    :model-value="modelValue"
    max-width="500"
    persistent
    @update:model-value="$emit('update:modelValue', $event)"
  >
    <v-card>
      <v-card-title class="d-flex align-center">
        <v-avatar
          :color="getTypeColor()"
          size="40"
          class="mr-4"
        >
          <v-icon color="white" size="24">
            {{ getTypeIcon() }}
          </v-icon>
        </v-avatar>
        <span class="text-h6">{{ title }}</span>
      </v-card-title>

      <v-card-text>
        <p class="text-body-1">{{ message }}</p>
      </v-card-text>

      <v-card-actions class="pa-4">
        <v-spacer />
        <v-btn
          variant="outlined"
          @click="$emit('cancel')"
        >
          {{ cancelText }}
        </v-btn>
        <v-btn
          :color="getTypeColor()"
          @click="$emit('confirm')"
        >
          {{ confirmText }}
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script setup lang="ts">
interface Props {
  modelValue: boolean;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  type?: 'warning' | 'danger' | 'info';
}

const props = withDefaults(defineProps<Props>(), {
  confirmText: '確認',
  cancelText: 'キャンセル',
  type: 'warning'
});

const emit = defineEmits<{
  'update:modelValue': [value: boolean];
  'confirm': [];
  'cancel': [];
}>();

const getTypeColor = () => {
  switch (props.type) {
    case 'danger':
      return 'red';
    case 'info':
      return 'blue';
    default:
      return 'orange';
  }
};

const getTypeIcon = () => {
  switch (props.type) {
    case 'danger':
      return 'mdi-alert-circle';
    case 'info':
      return 'mdi-information';
    default:
      return 'mdi-alert';
  }
};
</script>