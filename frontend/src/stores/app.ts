// Utilities
import { defineStore } from 'pinia'
import type {CheatGameInfo, CommonResponse} from "@/types";
import {useConsoleDialogStore} from "@/stores/ConsoleDialogStore";

const cds = useConsoleDialogStore()

export const useAppStore = defineStore('app', {
  state: () => ({
    targetFirmwareVersion: null,
    availableFirmwareInfos: [],
    gameData: {} as {[key: string]: string}
  }),
  getters: {
    gameDataInited(state) {
        return Object.keys(state.gameData).length !== 0
    }
  },
  actions: {
    updateAvailableFirmwareInfos() {
        this.targetFirmwareVersion = null
        window.eel.get_available_firmware_infos()((data: CommonResponse) => {
            if (data['code'] === 0) {
              const infos = data['data']
              this.availableFirmwareInfos = infos
              this.targetFirmwareVersion = infos[0]['version']
            } else {
                cds.showConsoleDialog()
                cds.appendConsoleMessage('固件信息加载异常.')
            }
        })
    },
    async loadGameData() {
      if (this.gameDataInited && !('unknown' in this.gameData)) {
          return this.gameData
      }
      const resp = await window.eel.get_game_data()()
      const gameData = resp.code === 0 ? resp.data : {'unknown': 'unknown'}
      this.gameData = gameData
      return gameData
    }
  }
})
