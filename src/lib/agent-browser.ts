export type EmitFn = (event: Record<string, unknown>) => void;

const DISABLED_MESSAGE =
  'Navegador visual deshabilitado en Cloudflare Workers. Playwright/Chromium debe ejecutarse en Node/VPS. Usa SERPER_API_KEY para busquedas web sin navegador.';

export class BrowserSession {
  private _lastAction = '';

  static async create(): Promise<BrowserSession> {
    return new BrowserSession();
  }

  get page(): never {
    throw new Error(DISABLED_MESSAGE);
  }

  get url(): string {
    return 'about:blank';
  }

  get lastAction(): string {
    return this._lastAction;
  }

  async screenshot(): Promise<string> {
    return '';
  }

  async navigate(url: string): Promise<{ title: string; text: string }> {
    this._lastAction = `Navegacion bloqueada a ${url}`;
    return { title: 'Navegador no disponible en Cloudflare', text: DISABLED_MESSAGE };
  }

  async click(target: string): Promise<string> {
    this._lastAction = `Click bloqueado en ${target}`;
    return DISABLED_MESSAGE;
  }

  async fill(selector: string, text: string): Promise<string> {
    this._lastAction = `Escritura bloqueada en ${selector}`;
    void text;
    return DISABLED_MESSAGE;
  }

  async pressKey(key: string): Promise<string> {
    this._lastAction = `Tecla bloqueada ${key}`;
    return DISABLED_MESSAGE;
  }

  async scroll(direction: 'arriba' | 'abajo', px = 600): Promise<string> {
    this._lastAction = `Scroll bloqueado ${direction} ${px}`;
    return DISABLED_MESSAGE;
  }

  async getContent(): Promise<string> {
    return DISABLED_MESSAGE;
  }

  async waitForElement(selector: string, timeout = 8000): Promise<string> {
    this._lastAction = `Espera bloqueada ${selector} ${timeout}`;
    return DISABLED_MESSAGE;
  }

  async withFrames(emit: EmitFn, actionLabel: string, action: () => Promise<void>): Promise<void> {
    this._lastAction = actionLabel;
    void action;
    emit({ type: 'error', content: DISABLED_MESSAGE });
  }

  async close(): Promise<void> {
    return;
  }
}
