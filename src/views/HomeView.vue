<script setup lang="ts">
import useTableStatusStore from '@/stores/tableStatus'

import useFilesStore, { type Pattern } from '@/stores/files'
import useTableLightsStore from '@/stores/tableLights'

import LightsModal from '@/components/modals/LightsModal.vue'
import PatternPreview from '@/components/PatternPreview.vue'
import {
  PlayIcon,
  PauseIcon,
  ForwardIcon,
  BackwardIcon,
  LightBulbIcon,
  ArrowsPointingOutIcon
} from '@heroicons/vue/24/outline'
import TranquilLogoWhite from '@/assets/tranquil-logo-white.svg'

import { useToast } from 'vue-toast-notification'
import { computed, ref } from 'vue'
import { useRouter } from 'vue-router'
import { useModal } from 'vue-final-modal'

import 'vue-toast-notification/dist/theme-sugar.css'

const tableStatus = useTableStatusStore()
const tableLights = useTableLightsStore()
const files = useFilesStore()
const router = useRouter()

const toast = useToast()
const randomPatternIndex = ref(0)

const openLightsModal = async () => {
  const { open, close } = useModal({
    component: LightsModal,
    attrs: {
      onClose() {
        close()
      }
    }
  })
  await open()
}

const togglePauseState = async () => {
  try {
    tableStatus.setPausedState(tableStatus.raw.pause === 0)
  } catch (e) {
    toast.error(`Connection error: ${e}`)
  }
}

const skipPattern = async (dir: number) => {
  try {
    tableStatus.skipPattern(dir)
  } catch (e) {
    toast.error(`Connection error: ${e}`)
  }
}

const toggleRepeatState = async () => {
  try {
    tableStatus.setRepeat(!tableStatus.raw.repeatMode)
  } catch (e) {
    toast.error(`Connection error: ${e}`)
  }
}

const toggleShuffleState = async () => {
  try {
    tableStatus.setShuffle(!tableStatus.raw.shuffleMode)
  } catch (e) {
    toast.error(`Connection error: ${e}`)
  }
}

let previewSize = ref(parseInt(localStorage.getItem('preview_size') || '64'))

const previewSizes = ref([
  64, 72, 80, 96, 128
])

const changePreviewSize = () => {
  previewSize.value = previewSizes.value[previewSizes.value.indexOf(previewSize.value)+1] || previewSizes.value[0]
  localStorage.setItem('preview_size', previewSize.value.toString()) 
}

const previewSizeClass = computed(() => {
  return [`w-${previewSize.value}`, `h-${previewSize.value}`]
})

const upNextPatterns = computed(() => {
  return (
    files
      .getPlaylist(tableStatus.currentPlaylistID)
      ?.patterns?.slice(tableStatus.raw.playlistIdx)
      .map((pattern) => files.getPattern(pattern)) ?? []
  )
})

const previousPatternInPlaylist = computed(() => {
  if (tableStatus.currentPlaylistID === '') {
    return {
      name: '',
      uuid: '',
      date: '',
      isFavorite: false
    } as Pattern
  }
  const ptrn = files.getPlaylist(tableStatus.currentPlaylistID).patterns[
    Math.max(tableStatus.raw.playlistIdx - 2, 0)
  ]
  return files.getPattern(ptrn)
})

const nextPatternInPlaylist = computed(() => {
  if (tableStatus.currentPlaylistID === '') {
    return {
      name: '',
      uuid: '',
      date: '',
      isFavorite: false
    } as Pattern
  }
  const ptrn = files.getPlaylist(tableStatus.currentPlaylistID).patterns[
    tableStatus.raw.playlistIdx
  ]
  return files.getPattern(ptrn)
})

const currentPattern = computed(() => {
  return files.getPattern(tableStatus.currentPatternID)
})

const gradientColorStops = computed(() => {
  if (
    tableLights.primaryColor[0] === 0 &&
    tableLights.primaryColor[1] === 0 &&
    tableLights.primaryColor[2] === 0 &&
    tableLights.secondaryColor[0] === 0 &&
    tableLights.secondaryColor[1] === 0 &&
    tableLights.secondaryColor[2] === 0
  ) {
    return ''
  }
  const primaryColor = `rgb(${tableLights.primaryColor.join(',')})`
  const secondaryColor = `rgb(${tableLights.secondaryColor.join(',')})`

  return `background: conic-gradient(${primaryColor}, ${secondaryColor}, ${primaryColor}) !important;`
})

const gradientColorStopsProgress = computed(() => {
  const progress = tableStatus.raw.filePos / tableStatus.raw.fileLen // 0.00 -> 1.00
  const progressDeg = parseFloat((progress * 360).toFixed(2))

  return `background: conic-gradient(rgba(0,0,0,0) 0deg, rgba(0,0,0,0) ${progressDeg}deg, rgba(31,44,55,1) ${
    progressDeg + 0.001
  }deg) !important;`
})

setInterval(() => {
  randomPatternIndex.value = Math.floor(Math.random() * files.patterns.length)
}, 2500)
</script>

<template>
  <div class="mx-[5vw] flex flex-col justify-between items-center pt-5 pb-5">
    <TranquilLogoWhite class="font-semibold text-2xl text-center fill-gray-200 h-20" />
    <template v-if="tableStatus.raw.Homing === 1">
      <div
        class="flex flex-col from-red-50 via-slate-50 items-center flex-grow justify-center gap-4 absolute mb-auto mt-auto top-0 bottom-0 w-full"
      >
        <span class="font-semibold text-xl">Homing</span>
        <svg
          aria-hidden="true"
          class="inline w-16 h-16 text-gray-600 animate-spin fill-gray-300"
          viewBox="0 0 100 101"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z"
            fill="currentColor"
          />
          <path
            d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z"
            fill="currentFill"
          />
        </svg>
      </div>
    </template>
    <template v-else-if="tableStatus.status === 'idle'">
      <div
        class="flex flex-col from-red-50 via-slate-50 items-center flex-grow justify-center gap-4 absolute mb-auto mt-auto top-0 bottom-0 w-full"
      >
        <div class="flex flex-row items-center justify-center w-full overflow-hidden">
          <div :style="gradientColorStops" class="p-1 rounded-full bg-gray-700">
            <PatternPreview
              class="rounded-full bg-gray-800 z-20"
              :class="previewSizeClass"
              lineColor="#ffffff"
              mode="thumb"
              :key="files.patterns[randomPatternIndex]?.uuid ?? ''"
              :pattern="files.patterns[randomPatternIndex]"
              v-if="files.patterns.length > 0"
            >
              <div
                class="cursor-pointer relative w-full h-full rounded-full flex justify-center items-center group"
                @click="router.push('/patterns')"
              >
                <div
                  class="absolute inset-0 rounded-full bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-gray-900 via-gray-900 to-gray-800 w-full h-full opacity-50 group-hover:opacity-80 transition transform-gpu duration-300"
                ></div>
                <div class="relative">
                  <PlayIcon
                    class="w-10 h-10 group-hover:scale-105 transition transform-gpu duration-300"
                  ></PlayIcon>
                </div>
              </div>
            </PatternPreview>
            <div v-else class="w-64 h-64 rounded-full bg-gray-800 z-10"></div>
          </div>
        </div>
      </div>
    </template>
    <template v-else>
      <div
        class="flex flex-col from-red-50 via-slate-50 items-center flex-grow justify-center gap-4 absolute mb-auto mt-auto top-0 bottom-0 w-full"
      >
        <span class="font-semibold text-xl">Now Playing</span>

        <div
          class="flex flex-row items-center justify-between w-full overflow-hidden lg:px-80"
          :class="{ '!justify-center': !tableStatus.isPlaylist }"
        >
          <div
            class="w-32 h-32 rounded-full ml-[-4rem] opacity-40"
            v-if="tableStatus.isPlaylist"
            :class="{ '!opacity-0': tableStatus.raw.playlistIdx === 1 }"
          >
            <PatternPreview
              class="w-full h-full rounded-full bg-gray-800"
              lineColor="#ffffff"
              mode="thumb"
              :pattern="previousPatternInPlaylist"
            >
            </PatternPreview>
          </div>
          <button
            @click="skipPattern(-1)"
            class="w-8 h-8 -ml-16 text-white z-50"
            v-if="tableStatus.isPlaylist"
            :class="{ '!opacity-0': tableStatus.raw.playlistIdx === 1 }"
          >
            <BackwardIcon />
          </button>
          <div :style="gradientColorStops" class="rounded-full">
            <div :style="gradientColorStopsProgress" class="p-1 rounded-full bg-gray-700">
              <PatternPreview
                mode="render"
                class="rounded-full bg-gray-800"
                :class="previewSizeClass"
                lineColor="#ffffff"
                :pattern="currentPattern"
                :progress="tableStatus.patternProgress"
                v-if="files.patterns.length > 0"
              >
                <div
                  class="relative w-full h-full rounded-full flex justify-center items-center group cursor-pointer"
                  @click="togglePauseState()"
                >
                  <div
                    class="absolute inset-0 rounded-full bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-gray-900 via-gray-900 to-gray-800 w-full h-full opacity-50 group-hover:opacity-80 transition transform-gpu duration-300"
                  ></div>
                  <div class="relative">
                    <PlayIcon
                      v-if="tableStatus.raw.pause === 1"
                      class="w-14 group-hover:scale-105 transition transform-gpu duration-300"
                    ></PlayIcon>
                    <PauseIcon
                      v-else
                      class="w-14 group-hover:scale-105 transition transform-gpu duration-300"
                    ></PauseIcon>
                  </div>
                </div>
              </PatternPreview>
              <div v-else class="relative w-64 h-64 rounded-full bg-gray-800"></div>
            </div>
          </div>
          <button
            @click="skipPattern(1)"
            class="w-8 h-8 -mr-16 text-white z-50"
            v-if="tableStatus.isPlaylist"
            :class="{ '!opacity-0': upNextPatterns.length === 0 }"
          >
            <ForwardIcon />
          </button>
          <div
            class="w-32 h-32 rounded-full mr-[-4rem] opacity-40"
            v-if="tableStatus.isPlaylist"
            :class="{ '!opacity-0': upNextPatterns.length === 0 }"
          >
            <PatternPreview
              class="w-full h-full rounded-full bg-gray-800"
              lineColor="#ffffff"
              mode="thumb"
              :pattern="nextPatternInPlaylist"
            />
          </div>
        </div>

        <div class="flex flex-col items-center">
          <span class="mt-2 text-lg font-semibold"
            >{{ currentPattern?.name ?? '...' }} •
            {{ Math.floor(tableStatus.patternProgress * 100) }}%</span
          >
        </div>

        <div v-if="tableStatus.isPlaylist" class="items-center gap-4 hidden">
          <div @click="toggleRepeatState()">rep {{}}</div>
          <div @click="toggleShuffleState()">shuf</div>
        </div>
      </div>
    </template>
    <div class="flex justify-center items-center absolute bottom-[4.6rem] space-x-2">
      <button
        @click="openLightsModal()"
        class="flex items-center gap-2 justify-center px-4 py-2 bg-gray-700 hover:text-blue-600 hover:bg-gray-800 text-gray-400 group transition transform-gpu duration-300 rounded-full"
      >
        <LightBulbIcon class="h-6 w-6"></LightBulbIcon>
        <span class="text-sm font-medium">Lights</span>
      </button>
      <button
        @click="changePreviewSize()"
        class="justify-center p-2 bg-gray-700 hover:text-blue-600 hover:bg-gray-800 text-gray-400 group transition transform-gpu duration-300 rounded-full">
        <ArrowsPointingOutIcon class="h-6 w-6"></ArrowsPointingOutIcon>
      </button>
    </div>
  </div>
</template>
