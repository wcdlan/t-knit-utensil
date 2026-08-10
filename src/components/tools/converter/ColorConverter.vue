<script lang="ts" setup>
import { ref, watch } from 'vue'

const hex = ref('#3b82f6')
const r = ref(59)
const g = ref(130)
const b = ref(246)
const h = ref(0)
const s = ref(0)
const l = ref(0)
const previewColor = ref('#3b82f6')

function hexToRgb(hexVal: string) {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hexVal)
  if (!result) return null
  return {
    r: parseInt(result[1], 16),
    g: parseInt(result[2], 16),
    b: parseInt(result[3], 16),
  }
}

function rgbToHex(rv: number, gv: number, bv: number) {
  return '#' + [rv, gv, bv].map((x) => x.toString(16).padStart(2, '0')).join('')
}

function rgbToHsl(rv: number, gv: number, bv: number) {
  rv /= 255
  gv /= 255
  bv /= 255
  const max = Math.max(rv, gv, bv),
    min = Math.min(rv, gv, bv)
  let hv = 0,
    sv = 0
  const lv = (max + min) / 2
  if (max !== min) {
    const d = max - min
    sv = lv > 0.5 ? d / (2 - max - min) : d / (max + min)
    switch (max) {
      case rv:
        hv = ((gv - bv) / d + (gv < bv ? 6 : 0)) / 6
        break
      case gv:
        hv = ((bv - rv) / d + 2) / 6
        break
      case bv:
        hv = ((rv - gv) / d + 4) / 6
        break
    }
  }
  return { h: Math.round(hv * 360), s: Math.round(sv * 100), l: Math.round(lv * 100) }
}

function updateFromHex() {
  const rgb = hexToRgb(hex.value)
  if (rgb) {
    r.value = rgb.r
    g.value = rgb.g
    b.value = rgb.b
    const hsl = rgbToHsl(rgb.r, rgb.g, rgb.b)
    h.value = hsl.h
    s.value = hsl.s
    l.value = hsl.l
    previewColor.value = hex.value.startsWith('#') ? hex.value : '#' + hex.value
  }
}

function updateFromRgb() {
  hex.value = rgbToHex(r.value, g.value, b.value)
  const hsl = rgbToHsl(r.value, g.value, b.value)
  h.value = hsl.h
  s.value = hsl.s
  l.value = hsl.l
  previewColor.value = hex.value
}

function copy(val: string) {
  navigator.clipboard.writeText(val)
}

watch(hex, updateFromHex)
updateFromHex()
</script>

<template>
  <div class="space-y-6">
    <div class="flex flex-col sm:flex-row gap-6">
      <!-- Color Preview -->
      <div class="flex-shrink-0">
        <div
          :style="{ backgroundColor: previewColor }"
          class="w-32 h-32 rounded-xl border border-gray-200 shadow-sm"
        ></div>
        <input v-model="hex" class="mt-2 w-full h-10 cursor-pointer" type="color" />
      </div>

      <!-- Color Values -->
      <div class="flex-1 space-y-4">
        <!-- HEX -->
        <div>
          <label class="block text-xs font-semibold text-gray-500 mb-1">HEX</label>
          <div class="flex gap-2">
            <input
              v-model="hex"
              class="flex-1 p-2.5 border border-gray-200 rounded-lg text-sm font-mono focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
              placeholder="#000000"
              @input="updateFromHex"
            />
            <button
              class="px-3 py-2 bg-gray-100 text-gray-600 rounded-lg text-xs hover:bg-gray-200 transition cursor-pointer"
              @click="copy(hex)"
            >
              复制
            </button>
          </div>
        </div>

        <!-- RGB -->
        <div>
          <label class="block text-xs font-semibold text-gray-500 mb-1">RGB</label>
          <div class="flex gap-2">
            <input
              v-model.number="r"
              class="w-20 p-2.5 border border-gray-200 rounded-lg text-sm font-mono text-center focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
              max="255"
              min="0"
              type="number"
              @input="updateFromRgb"
            />
            <input
              v-model.number="g"
              class="w-20 p-2.5 border border-gray-200 rounded-lg text-sm font-mono text-center focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
              max="255"
              min="0"
              type="number"
              @input="updateFromRgb"
            />
            <input
              v-model.number="b"
              class="w-20 p-2.5 border border-gray-200 rounded-lg text-sm font-mono text-center focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
              max="255"
              min="0"
              type="number"
              @input="updateFromRgb"
            />
            <button
              class="px-3 py-2 bg-gray-100 text-gray-600 rounded-lg text-xs hover:bg-gray-200 transition cursor-pointer"
              @click="copy(`rgb(${r}, ${g}, ${b})`)"
            >
              复制
            </button>
          </div>
        </div>

        <!-- HSL -->
        <div>
          <label class="block text-xs font-semibold text-gray-500 mb-1">HSL</label>
          <div class="flex gap-2 items-center">
            <span class="text-sm font-mono text-gray-600 bg-gray-50 p-2.5 rounded-lg">
              hsl({{ h }}, {{ s }}%, {{ l }}%)
            </span>
            <button
              class="px-3 py-2 bg-gray-100 text-gray-600 rounded-lg text-xs hover:bg-gray-200 transition cursor-pointer"
              @click="copy(`hsl(${h}, ${s}%, ${l}%)`)"
            >
              复制
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
