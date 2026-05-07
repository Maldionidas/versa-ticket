// src/api/sessionManager.js
class SessionManager {
  constructor() {
    this.channel = null;
    this.sessionId = null;
    this.currentUserId = null;
    this.init();
  }

  init() {
    if (typeof BroadcastChannel !== 'undefined') {
      this.channel = new BroadcastChannel('versaticket-session');
      this.setupListeners();
      console.log('✅ SessionManager inicializado');
    }
  }

  setupListeners() {
    if (this.channel) {
      this.channel.onmessage = (event) => {
        const { type, userId, sessionId } = event.data;

        if (type === 'LOGIN' && userId === this.currentUserId && sessionId !== this.sessionId) {
          console.log('🚫 Sesión duplicada detectada');
          this.handleDuplicateSession();
        }
      };
    }
  }

  registerSession(userId, token) {
    this.currentUserId = userId;
    this.sessionId = `${userId}-${Date.now()}-${Math.random().toString(36).slice(2)}`;

    const sessionData = {
      userId,
      sessionId: this.sessionId,
      timestamp: Date.now()
    };

    // Guardar todo junto
    sessionStorage.setItem('activeSession', JSON.stringify(sessionData));
    sessionStorage.setItem('token', token);           // ← Muy importante
    // sessionStorage.setItem('usuario', JSON.stringify(usuario)); // si lo tienes

    if (this.channel) {
      this.channel.postMessage({
        type: 'LOGIN',
        userId,
        sessionId: this.sessionId
      });
    }

    console.log('📡 Sesión registrada correctamente:', userId);
  }

  handleDuplicateSession() {
    console.warn('Sesión duplicada detectada');
    alert('Ya tienes una sesión activa en otra pestaña. Esta se cerrará.');
    
    sessionStorage.clear();   // Limpia todo
    window.location.href = '/login';
  }

  clearSession() {
    if (this.channel) {
      this.channel.postMessage({ type: 'LOGOUT', userId: this.currentUserId });
    }
    sessionStorage.clear();
    console.log('📡 Sesión cerrada');
  }

  // Nuevo método útil
  isValidSession() {
    return !!sessionStorage.getItem('token') && !!sessionStorage.getItem('activeSession');
  }
}

export const sessionManager = new SessionManager();
export default sessionManager;