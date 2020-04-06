// @emit submit @param { bpmnText }
// @emit success @param { bpmnText }
// @emit fail @param { bpmnText }
<template>
  <v-form v-model="valid" ref="form">
    <v-row justify="center">
      <v-file-input
        v-model="bpmnFile"
        ref="fileInput"
        label="Vyber soubor s BPMN defnicí"
        outlined
        required
        filled
        :rules="[value=>!!value]"
        accept=".bpmn,.bpmn2,.xml"
        @change="loadTextFromFile"
        :clearable="false"
      >
        <template #append-outer>
          <v-btn-toggle
            v-model="selectedHelper"
            style="margin-top:-15px"
            color="primary"
            @change="log(selectedHelper)"
          >
            <v-tooltip bottom>
              <template #activator="{on}">
                <v-btn value="show" v-on="on" :disabled="!valid" icon><v-icon>mdi-eye</v-icon></v-btn>
              </template>
              <span>Zobrazit nahled</span>
            </v-tooltip>

            <v-tooltip bottom>
              <template #activator="{on}">
                <v-btn value="update" v-on="on" :disabled="!valid" icon><v-icon>mdi-book</v-icon></v-btn>
              </template>
              <span>Upravit soubor</span>
            </v-tooltip>

          </v-btn-toggle>
        </template>

      </v-file-input>
    </v-row>
    <v-row justify="center">
      <v-container v-if="selectedHelper">
        <PrismEditor v-if="selectedHelper.includes('update')"
          v-model="newBpmnText"
          language="vue"
        />
        <VueBpmn v-if="selectedHelper.includes('show')" :key="bpmnUrl"
          :url="bpmnUrl"
          class="bpmnio"
        />
      </v-container>
    </v-row>
    <v-row justify="center">
      <v-btn
        @click="emitEvents"
        :disabled="!valid"
        color="primary"
        block
      >
        <v-progress-circular v-if="loading" indeterminate />
        <span v-else>{{submitTitle}}</span>
      </v-btn>
    </v-row>
  </v-form>

</template>
<script>
import 'prismjs'
// import 'prismjs/themes/prism.css'
import 'prismjs/themes/prism-okaidia.css'
import PrismEditor from 'vue-prism-editor'

import VueBpmn from 'vue-bpmn'

export default {
  components: {
    PrismEditor,
    VueBpmn,
  },
  props: {
    loading: Boolean,
    submitTitle: {
      type: String,
      default: 'Odeslat',
    },
    cleanOnSuccess: Boolean,
    cleanOnFail: Boolean,
  },
  data () {
    return {
      valid: false,
      selectedHelper: ['show'],

      bpmnFile: undefined,
      bpmnText: '',
      newBpmnText: '',
      bpmnUrl: '',
    }
  },
  watch: {
    newBpmnText: {
      handler (newValue, oldValue) {
        this.loadUrlFromText(newValue)
      },
    },
  },
  methods: {
    emitEvents () {
      const payload = {
        bpmnText: this.newBpmnText,
        bpmnUrl: this.bpmnUrl,
      }
      this.$emit('submit', payload)
      if (this.valid) {
        this.$emit('success', payload)
        if (this.cleanOnSuccess) {
          this.restart()
        }
      } else {
        this.$emit('fail', payload)
        if (this.cleanOnFail) {
          this.restart()
        }
      }
    },
    restart () {
      this.bpmnFile = undefined
      this.bpmnUrl = ''
      this.newBpmnText = this.bpmnText = ''
    },
    log (...args) {
      console.warn(args)
    },

    loadUrlFromText (text) {
      return this.fileToUrl(this.textToFile(text))
        .then(url => {
          this.bpmnUrl = url
          return url
        })
    },

    loadTextFromFile (file) {
      this.fileToText(file)
        .then(text => {
          this.newBpmnText = this.bpmnText = text
        }).catch(e => {
          this.newBpmnText = this.bpmnText = `ERROR:\n${e}`
        })
    },
    fileToText (file) {
      return new Promise((resolve) => {
        const reader = new FileReader()
        reader.onload = e => resolve(e.target.result)
        reader.readAsText(file)
      })
    },
    textToFile (text) {
      return new Blob([text])
    },
    fileToUrl (file) {
      return new Promise((resolve) => {
        const reader = new FileReader()
        reader.onload = e => resolve(e.target.result)
        reader.readAsDataURL(file)
      })
    },
  },

}
</script>
<style lang="scss" scoped>
  .bpmnio {
    min-height: 400px;
    background-color: #fff;
    border: 1px solid black;

  }
</style>
