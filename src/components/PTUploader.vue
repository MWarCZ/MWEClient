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
      <v-container>
        <PrismEditor v-if="selectedHelper && selectedHelper.includes('update')"
          v-model="newBpmnText"
          language="vue"
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
export default {
  components: {
    PrismEditor,
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
      selectedHelper: [],

      bpmnFile: undefined,
      bpmnText: '',
      newBpmnText: '',
    }
  },
  methods: {
    emitEvents () {
      const payload = {
        bpmnText: this.newBpmnText,
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
      this.newBpmnText = this.bpmnText = ''
    },
    log (...args) {
      console.warn(args)
    },
    loadTextFromFile (file) {
      // console.log(file)
      this.readFile(file).then(text => {
        this.newBpmnText = this.bpmnText = text
      }).catch(e => {
        this.newBpmnText = this.bpmnText = `ERROR:\n${e}`
      })
    },
    readFile (file) {
      return new Promise((resolve) => {
        const reader = new FileReader()
        reader.onload = e => resolve(e.target.result)
        reader.readAsText(file)
      })
    },
  },

}
</script>
<style lang="scss" scoped>
  .removed {
    background-color: #ff00002e;
  }
  .protected {
    background-color: #3f3fb53b;
  }
  .normal {
    background-color: #3fb53f3b;
  }
</style>
