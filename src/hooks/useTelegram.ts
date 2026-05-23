/**
 * useTelegram — обёртка над Telegram Mini App SDK.
 * Работает и без Telegram (fallback для браузерной разработки).
 */

interface TelegramWebApp {
  initData: string
  initDataUnsafe: { user?: { id: number; first_name: string; username?: string } }
  colorScheme: 'light' | 'dark'
  themeParams: Record<string, string>
  isExpanded: boolean
  viewportHeight: number
  MainButton: {
    text: string
    color: string
    textColor: string
    isVisible: boolean
    isActive: boolean
    show(): void
    hide(): void
    setText(text: string): void
    onClick(cb: () => void): void
    offClick(cb: () => void): void
    showProgress(leaveActive?: boolean): void
    hideProgress(): void
  }
  BackButton: {
    isVisible: boolean
    show(): void
    hide(): void
    onClick(cb: () => void): void
    offClick(cb: () => void): void
  }
  HapticFeedback: {
    impactOccurred(style: 'light' | 'medium' | 'heavy' | 'rigid' | 'soft'): void
    notificationOccurred(type: 'error' | 'success' | 'warning'): void
    selectionChanged(): void
  }
  ready(): void
  expand(): void
  close(): void
  sendData(data: string): void
  showAlert(message: string, callback?: () => void): void
  showConfirm(message: string, callback: (confirmed: boolean) => void): void
  setHeaderColor(color: string): void
  setBackgroundColor(color: string): void
}

declare global {
  interface Window {
    Telegram?: { WebApp: TelegramWebApp }
  }
}

export function useTelegram() {
  const tg = window.Telegram?.WebApp

  const isInTelegram = !!tg
  const user = tg?.initDataUnsafe?.user ?? null

  function ready() {
    tg?.ready()
    tg?.expand()
    tg?.setBackgroundColor('#0a0a0f')
    tg?.setHeaderColor('#0a0a0f')
  }

  /**
   * Отправляет действие редактора обратно боту.
   * В браузере (dev) — только логирует.
   */
  function sendAction(action: 'approve' | 'reject', newsId: number) {
    const payload = JSON.stringify({ action, news_id: newsId })
    if (tg) {
      tg.sendData(payload)
    } else {
      console.log('[TG Mock] sendData:', payload)
    }
  }

  function haptic(type: 'light' | 'medium' | 'heavy' | 'success' | 'error' | 'warning') {
    if (!tg) return
    if (type === 'success' || type === 'error' || type === 'warning') {
      tg.HapticFeedback.notificationOccurred(type)
    } else {
      tg.HapticFeedback.impactOccurred(type)
    }
  }

  function showConfirm(message: string): Promise<boolean> {
    return new Promise((resolve) => {
      if (tg) {
        tg.showConfirm(message, resolve)
      } else {
        resolve(window.confirm(message))
      }
    })
  }

  return { tg, isInTelegram, user, ready, sendAction, haptic, showConfirm }
}
