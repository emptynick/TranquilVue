<script setup lang="ts">
import ModalHeader from './helpers/ModalHeader.vue'
import ModalTemplate from './helpers/ModalTemplate.vue'
import { useToast } from 'vue-toast-notification'
import { v4 as uuidv4 } from 'uuid'

import tranquilapi from '@/plugins/tranquilapi'

const toast = useToast()

const emit = defineEmits<{
  (e: 'close'): void
}>()

const formHandler = async (data: { name: string, thumbnail: File, pattern: File }) => {
  try {
    const body = new FormData()
    body.append('pattern', JSON.stringify({
      name: data.name,
      uuid: uuidv4(),
    }))
    body.append('thumbData', data.thumbnail)
    body.append('patternData', data.pattern)

    let result = await tranquilapi.post('/patterns', body);
    toast.success(result.data)
  } catch (e) {
    toast.error('Error uploading pattern: ' + e)
  }
}
</script>

<template>
  <ModalTemplate @close="emit('close')">
    <ModalHeader title="Add pattern" @close="emit('close')" />
    <FormKit type="form" @submit="formHandler" submit-label="Add image">
      <FormKit type="text" name="name" id="name" label="Name" validation="required|text" />
      <FormKit type="file" label="Thumbnail" name="thumbnail" accept=".png" validation="required" />
      <FormKit type="file" label="Pattern" name="pattern" accept=".thr" validation="required" />
    </FormKit>
  </ModalTemplate>
</template>
