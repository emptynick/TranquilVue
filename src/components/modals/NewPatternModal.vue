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
    // @ts-expect-error: Let's ignore a compile error like this unreachable code
    body.append('thumbData', data.thumbnail[0].file as File)
    // @ts-expect-error: Let's ignore a compile error like this unreachable code
    body.append('patternData', data.pattern[0].file as File)

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
      <FormKit type="file" label="Thumbnail" name="thumbnail" accept=".png,.svg,image/png,image/svg+xml" validation="required" />
      <FormKit type="file" label="Pattern" name="pattern" accept=".thr" validation="required" />
    </FormKit>
  </ModalTemplate>
</template>
