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
        
        console.log('📡 Mensaje recibido:', { type, userId, sessionId });
        
        // Solo bloquear si es el MISMO usuario
        if (type === 'LOGIN' && userId === this.currentUserId && sessionId !== this.sessionId) {
          console.log('🚫 Mismo usuario detectado en otra pestaña');
          this.handleDuplicateSession();
        }
      };
    }
  }

  registerSession(userId, token) {
    this.currentUserId = userId;
    this.sessionId = `${userId}-${Date.now()}-${Math.random().toString(36)}`;
    
    const sessionData = {
      userId,
      sessionId: this.sessionId,
      timestamp: Date.now()
    };
    
    // Guardar en sessionStorage (no localStorage)
    sessionStorage.setItem('activeSession', JSON.stringify(sessionData));
    
    if (this.channel) {
      this.channel.postMessage({
        type: 'LOGIN',
        userId,
        sessionId: this.sessionId
      });
      console.log('📡 Sesión registrada para usuario:', userId);
    }
  }

  handleDuplicateSession() {
    const message = '⚠️ Ya tienes una sesión activa de este usuario en otra pestaña.\n\nSolo puedes tener una sesión activa por usuario.\n\nEsta pestaña se cerrará.';
    alert(message);
    
    sessionStorage.removeItem('token');
    sessionStorage.removeItem('usuario');
    sessionStorage.removeItem('activeSession');
    window.location.href = '/login';
  }

  clearSession() {
    if (this.channel) {
      this.channel.postMessage({
        type: 'LOGOUT',
        userId: this.currentUserId
      });
    }
    sessionStorage.removeItem('activeSession');
    console.log('📡 Sesión cerrada para usuario:', this.currentUserId);
  }
}

export const sessionManager = new SessionManager();
export default sessionManager;