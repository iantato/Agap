import { DistressSignal } from '../types'

export class VoiceAlertSystem {
  private synth: SpeechSynthesis
  private enabled: boolean = true
  private volume: number = 1.0
  private rate: number = 0.9

  constructor() {
    this.synth = window.speechSynthesis
  }

  setEnabled(enabled: boolean) {
    this.enabled = enabled
    if (!enabled) {
      this.synth.cancel()
    }
  }

  setVolume(volume: number) {
    this.volume = Math.max(0, Math.min(1, volume))
  }

  setRate(rate: number) {
    this.rate = Math.max(0.1, Math.min(10, rate))
  }

  announceAlert(signal: DistressSignal) {
    if (!this.enabled) return

    // Cancel any current speech to prioritize new alert
    this.synth.cancel()

    const severityText = signal.severity === 'dire' ? 'Critical' : 'Standard'
    const text = `Alert: ${severityText} distress signal detected.`
    
    const utterance = new SpeechSynthesisUtterance(text)
    utterance.rate = this.rate
    utterance.pitch = signal.severity === 'dire' ? 1.2 : 1.0
    utterance.volume = this.volume

    this.synth.speak(utterance)
  }

  speak(text: string) {
    if (!this.enabled) return
    const utterance = new SpeechSynthesisUtterance(text)
    utterance.rate = this.rate
    utterance.volume = this.volume
    this.synth.speak(utterance)
  }
}

export const voiceSystem = new VoiceAlertSystem()
